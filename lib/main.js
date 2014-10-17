/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/
/*

     SAB API: http://wiki.sabnzbd.org/api
	NZBGet API: http://nzbget.net/RPC_API_reference

*/

const self = require('sdk/self');
const sp = require('sdk/simple-prefs');
const	fileIO = require('sdk/io/file');
const	timers = require('sdk/timers');
const pageMod = require('sdk/page-mod');
const {Cu,Cc,Ci} = require('chrome');

const { Panel } = require('sdk/panel');
const { ToggleButton } = require('sdk/ui/button/toggle');
const { ActionButton } = require('sdk/ui/button/action');

const { nzbgRPC } = require('NZBGet_RPC');
const { sabRPC } = require('SABnzbd_RPC');

var SendQueue = [];
const SupportedIndexers = ['*.fanzub.com','*.dognzb.cr','*.nzbs.org','*.nmatrix.co.za','*.oznzb.com','*.binsearch.info','*.binsearch.net','*.nzbgeek.info','*.nzb.su','*.nzbplanet.net'];
var CustomIndexers = [];

var MainWindow = require('sdk/window/utils').getMostRecentBrowserWindow();

function log(msg) {
	if (sp.prefs.dev)
		console.log(msg);
}

var mButton = ToggleButton({
  id: 'nzbfox-ui-button',
  label: 'nzbFox',
  icon: {'16': './nzb-16-gray.png','32': './nzb-32-gray.png','64': './nzb-64-gray.png'},
  onChange: function(state) {
	  if (state.checked) {
	  	if (sp.prefs.sab_enabled || sp.prefs.nzbg_enabled)
		    mPanel.show({position: mButton});
		  else {
		  	showAOMOptions();
		  	this.state('window', {checked: false});
		  }
	  }
  }
});

var mPanel = Panel({
  contentURL: self.data.url('main-panel.html'),
  contentScriptFile: [self.data.url('jquery-2.1.1.min.js'),self.data.url('jquery-ui.min.js'), self.data.url('main-panel.js')],
  contentScriptWhen: 'end',
  contentScriptOptions: {
  	prefs: sp.prefs
  },
  width: 500,
  height: 207, // automatically set
  onShow: function() {
  	mPanel.port.emit('show');
  },
  onHide: function() {
	  mPanel.port.emit('hide');
	  mButton.state('window', {checked: false});
  }
});
mPanel.port.on('showOptions',showAOMOptions);
mPanel.port.on('log',log);
mPanel.port.on('setIcon',setUIButtonIcon);
mPanel.port.on('showProgressWidget',showProgressWidget);
mPanel.port.on('hideProgressWidget',hideProgressWidget);
mPanel.port.on('updateProgressWidget',updateProgressWidget);
mPanel.port.on('resize',function({width,height}) {
	mPanel.resize(width, height);
});

mPanel.port.on('rpc-call',function(data) {
	function rpcSuccess(rpcResult) {
		if (data.onSuccess)
			mPanel.port.emit(data.onSuccess,{call: data,reply:rpcResult});
	}
	function rpcFailure(rpcResult) {
		if (data.onFailure)
			mPanel.port.emit(data.onFailure,{call: data,reply:rpcResult});
	}

	switch (data.target) {
		case 'nzbg':
			nzbgRPC.call(data.method,data.params,rpcSuccess,rpcFailure);
			break;
		case 'sab':
			sabRPC.call(data.method,data.params,rpcSuccess,rpcFailure);
			break;
		}
});

//////////////////////////////////////// WEBPAGE LOADED DETECTION AND SCRIPT EXECUTION
var PM = pageMod.PageMod({
  include: SupportedIndexers,
  contentScriptWhen: 'ready',
  contentScriptFile: [self.data.url('jquery-2.1.1.min.js'), self.data.url('webpage-mod.js')],
  contentScriptOptions: {
  	prefs: sp.prefs,
  	dataURL: self.data.url(),
  	indexers: SupportedIndexers,
  },
	onAttach: function(worker) {
		worker.port.on('log',log);
		worker.port.on('nzbget-add', function(data) {
			nzbgRPC.call('append',[data.title+'.nzb', data.url, data.category, 0, false, false, '', 0, 'SCORE'],
				function(rpcResult) { // onSuccess
					worker.port.emit('nzbget-added',{success:true,request: data, rpc:rpcResult});
				},
				function(rpcResult) { // onFailure
					worker.port.emit('nzbget-added',{success:false,request: data, rpc:rpcResult});
				});
		});
		worker.port.on('sabnzbd-add', function(data) {
			sabRPC.call('addurl',{name: data.url,nzbname: data.title,cat: data.category},
				function(rpcResult) { // onSuccess
					worker.port.emit('sabnzbd-added',{success:true,request: data, rpc:rpcResult});
				},
				function(rpcResult) { // onFailure
					worker.port.emit('sabnzbd-added',{success:false,request: data, rpc:rpcResult});
				});
		});
	}
});

//////////////////////////////////////// //////////////////////////////////////// ////////////////////////////////////////

//////////////////////////////////////// ADD OPTIONS TO DOWNLOAD PROMPT
const { ChromeMod } = require('chrome-mod');
let cm = new ChromeMod({
  include: 'chrome://mozapps/content/downloads/unknownContentType.xul',
  contentScriptWhen: 'end',
  contentScriptOptions: {
  	prefs: sp.prefs,
  	dataURL: self.data.url(),
  },
  contentScriptFile: self.data.url('download-mod.js'),
  onAttach: function(worker) {
  	worker.port.on('log',log);
    worker.port.on('nzb-download', function(data) {
      if (data.url && data.target && data.fileName)
	      SendQueue.push(data);
    })
  },
});
//////////////////////////////////////// //////////////////////////////////////// ////////////////////////////////////////


//////////////////////////////////////// NZB DOWNLOAD DETECTION
	Cu.import('resource://gre/modules/Downloads.jsm');
	Cu.import('resource://gre/modules/Task.jsm');

	let view = {
	//  onDownloadAdded: function(download) {},
	  onDownloadChanged: function(download) {
	    if (download.succeeded && SendQueue.length > 0 && (download.contentType == 'application/x-nzb' || download.target.path.endsWith('.nzb'))) {
				for (let i = 0; i < SendQueue.length; ++i) {
					if (download.source.url == SendQueue[i].url) {
						log('-------- Download Detected --------');
						log('CLI = '+SendQueue[i].target);
						log('Path = '+download.target.path);
						log('Title  = '+SendQueue[i].fileName);

						switch (SendQueue[i].target) {
							case 'nzbg':
								nzbgRPC.call('append',[SendQueue[i].fileName, require('sdk/base64').encode(fileIO.read(download.target.path,'r')), '', 0, false, false, '', 0, 'SCORE']);
								break;
							case 'sab':
								sabRPC.call('addfile',null,null,null,download.target.path);
								break;
						}
						SendQueue.splice(i,1);
						// File is still locked by browser at this point, delay removal for 3 seconds.
						timers.setTimeout(function() {fileIO.remove(download.target.path)},3000);
					}
				}
	    }
	  },
	//  onDownloadRemoved: function(download) {}
	};

	Task.spawn(function() {
	  try {
	    let list = yield Downloads.getList(Downloads.ALL);
	    yield list.addView(view);
	  } catch (ex) {
	    console.error(ex);
	  }
	});
//////////////////////////////////////// //////////////////////////////////////// ////////////////////////////////////////

function alert(message) {
	var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
	prompts.alert(null, 'nzbFox', message);
}

function setUIButtonIcon(icon) {
	if (mButton.icon != icon) mButton.icon = icon;
}

function onPrefChange(prefName) {

	// parse private newznab list
	if (prefName == 'custom_indexers' || prefName == '') {
		// include list only exposes add() and remove(), so we can't just clear the include and update.
		// First, we must remove() the current custom indexers
		for (let i = 0; i < CustomIndexers.length; ++i)
			PM.include.remove(CustomIndexers[i]);
		// Second, add our custom indexers to the pageMod include list
		CustomIndexers = sp.prefs.custom_indexers.replace(/ /g,'').split(',');
		for (let i = 0; i < CustomIndexers.length; ++i)
			if (CustomIndexers[i] != '') {
				CustomIndexers[i] = '*.'+CustomIndexers[i];
				PM.include.add(CustomIndexers[i]);
			}
		// Finally, update the 'indexers' content script variable
		PM.contentScriptOptions.indexers = SupportedIndexers.concat(CustomIndexers);
	}

	nzbgRPC.url = (sp.prefs.nzbg_ssl?'https':'http')+'://'+sp.prefs.nzbg_ip+':'+sp.prefs.nzbg_port+'/jsonrpc';
	nzbgRPC.username = sp.prefs.nzbg_user;
	nzbgRPC.password = sp.prefs.nzbg_pass;
	nzbgRPC.timeout = sp.prefs.connection_timeout * 1000;
	sabRPC.url = (sp.prefs.sab_ssl?'https':'http')+'://'+sp.prefs.sab_ip+':'+sp.prefs.sab_port+'/sabnzbd/api'
	sabRPC.apiKey = sp.prefs.sab_apikey;
	sabRPC.timeout = sp.prefs.connection_timeout * 1000;
	mPanel.port.emit('prefChange',[prefName,sp.prefs[prefName]]);
} onPrefChange('');
sp.on('', onPrefChange);

function RPCTestSuccess(rpcResult) {
	log('RPCTestSuccess()');
	log(rpcResult);
	alert('Successfully connected');
}
function RPCTestFailure(rpcResult) {
	log('RPCTestFailure()');
	log(rpcResult);
	alert(rpcResult.message+"\n\n"+(rpcResult.url));
}
sp.on('testNZBGet',function() {
	try {
		nzbgRPC.status(RPCTestSuccess,RPCTestFailure);
	} catch(e) {alert('ERROR: '+e.message);}
});
sp.on('testSAB',function() {
	try {
		sabRPC.status(RPCTestSuccess,RPCTestFailure);
	} catch(e) {alert('ERROR: '+e.message);}
});

function apiSuccess(rpcResult) {
	console.log('SUCCESS');
	console.log(rpcResult);
}
function apiFailure(rpcResult) {
	console.log('FAILURE');
	console.log(rpcResult);
}
//nzbgRPC.call('version',null,apiSuccess,apiFailure);
//sabRPC.call('version',null,apiSuccess,apiFailure);
//nzbgRPC.call('status',[0],apiSuccess,apiFailure);
//nzbgRPC.call('listgroups',[0],apiSuccess,apiFailure);
//nzbgRPC.call('pausedownload',[],apiSuccess,apiFailure);


function showAOMOptions() {
	const tabs = require('sdk/tabs');
	mPanel.hide();
	tabs.open({
	  url: 'about:addons',
	  onReady: function(tab) {
	    tab.attach({
	      contentScriptWhen: 'end',
	      contentScript: 'AddonManager.getAddonByID("' + self.id + '", function(aAddon) {unsafeWindow.gViewController.commands.cmd_showItemDetails.doCommand(aAddon, true);});\n'
	    });
	  }
	});
}

function showProgressWidget() {
	log('showProgressWidget()');
	let groupWidgetWrap = MainWindow.CustomizableUI.getWidget('toggle-button--nzbfoxgithub-nzbfox-ui-button');
	groupWidgetWrap.instances.forEach(function(uiWidget) {

		uiWidget.node.setAttribute('indicator','true');
		uiWidget.node.setAttribute('progress','true');
		uiWidget.node.setAttribute('counter','true');
		let additional = ''
			+ '<stack id="downloads-indicator-anchor" class="toolbarbutton-icon" style="padding-top: 4px;">' // padding-top is to match height of icon
			+ '	<vbox id="downloads-indicator-progress-area" pack="center">'
			+ '		<description id="downloads-indicator-counter" value=""/>'
			+ '		<progressmeter id="downloads-indicator-progress" class="plain" min="0" max="100" value="0"/>'
			+ '		<description id="downloads-indicator-counter" value="nzb"/>'
			+ '	</vbox>'
			+ '</stack>';
	    uiWidget.node.insertAdjacentHTML('beforeend',additional);

	});
}
function hideProgressWidget() {
	log('hideProgressWidget()');
	let groupWidgetWrap = MainWindow.CustomizableUI.getWidget('toggle-button--nzbfoxgithub-nzbfox-ui-button');
	groupWidgetWrap.instances.forEach(function(uiWidget) {
		uiWidget.node.removeAttribute('indicator','true');
		uiWidget.node.removeAttribute('progress','true');
		uiWidget.node.removeAttribute('counter','true');
		uiWidget.node.removeChild(uiWidget.node.getElementsByTagName('stack')[0]);
	});
}
function updateProgressWidget([percentage,timeleft]) {
	let groupWidgetWrap = MainWindow.CustomizableUI.getWidget('toggle-button--nzbfoxgithub-nzbfox-ui-button');
	groupWidgetWrap.instances.forEach(function(uiWidget) {
		if (uiWidget.node.getAttribute('indicator') == 'true') {
			uiWidget.node.getElementsByTagName('progressmeter')[0].value = percentage;
			uiWidget.node.getElementsByTagName('description')[0].value = timeleft;
		}
	});
}