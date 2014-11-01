/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/
/*

     SAB API: http://wiki.sabnzbd.org/api
	NZBGet API: http://nzbget.net/RPC_API_reference

*/
'use strict';
const self = require('sdk/self');
const sp = require('sdk/simple-prefs');
const	fileIO = require('sdk/io/file');
const	timers = require('sdk/timers');
const pageMod = require('sdk/page-mod');
const {Cu,Cc,Ci} = require('chrome');

const { Panel } = require('sdk/panel');
const { ToggleButton } = require('sdk/ui/button/toggle');
const { ActionButton } = require('sdk/ui/button/action');

const { nzbgAPI } = require('NZBGet_API');
const { sabAPI } = require('SABnzbd_API');

var SendQueue = [];
const SupportedIndexers = ['*.fanzub.com','*.dognzb.cr','*.nzbs.org','*.pfmonkey.com','*.nzb.su','*.nzbindex.nl','*.nzbclub.com','*.nmatrix.co.za','*.oznzb.com','*.binsearch.info','*.binsearch.net','*.nzbgeek.info','*.nzbplanet.net'];
var CustomIndexers = [];

var MainWindow = require('sdk/window/utils').getMostRecentBrowserWindow();

function log(msg) {
	if (sp.prefs.dev)
		console.log(msg);
}

// Convert old options to new - remove ssl/ip/port from options in distant future
if (sp.prefs.sab_ip != '') {
	sp.prefs.sab_url = (sp.prefs.sab_ssl?'https':'http')+'://'+sp.prefs.sab_ip+':'+sp.prefs.sab_port;
	sp.prefs.sab_ip = '';
}
if (sp.prefs.nzbg_ip != '') {
	sp.prefs.nzbg_url = (sp.prefs.nzbg_ssl?'https':'http')+'://'+sp.prefs.nzbg_ip+':'+sp.prefs.nzbg_port;
	sp.prefs.nzbg_ip = '';
}

function apiCall(sender,data) {
//	console.log('api-call '+data.type+' '+data.api.method);
	function onSuccess(result) {
		if (data.onSuccess)
			sender.port.emit(data.onSuccess,{call: data,reply:result});
	}
	function onFailure(result) {
		if (data.onFailure)
			sender.port.emit(data.onFailure,{call: data,reply:result});
	}

	switch (data.type) {
		case 'nzbg':
			nzbgAPI.call(data.api.method,data.api.params,onSuccess,onFailure);
			break;
		case 'sab':
			sabAPI.call(data.api.method,data.api.params,onSuccess,onFailure);
			break;
		}
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
// Main Panel
var mPanel = Panel({
  contentURL: self.data.url('main-panel.html'),
  contentScriptFile: [self.data.url('jquery-2.1.1.min.js'),self.data.url('jquery-ui.min.js'), self.data.url('api.js'), self.data.url('main-panel.js')],
  contentScriptWhen: 'end',
  contentScriptOptions: {
  	prefs: sp.prefs
  },
  width: 1,
  height: 1, // automatically set
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
mPanel.port.on('showNotification',showNotification);
mPanel.port.on('hide',function() mPanel.hide());
mPanel.port.on('resize',function({width,height}) {
	mPanel.resize(width, height);
});
mPanel.port.on('api-call',function(data) apiCall(mPanel,data));


function showNotification([type,title,icon,name,stats]) {
	// Notifications Panel
	let nPanel = Panel({
	  contentURL: self.data.url('notification-panel.html'),
	  contentScriptFile: [self.data.url('jquery-2.1.1.min.js'),self.data.url('jquery-ui.min.js'), self.data.url('notification-panel.js')],
	  contentScriptWhen: 'end',
	  contentScriptOptions: {
	  	prefs: sp.prefs,
	  	type: type,
	  	title: title,
	  	icon: icon,
	  	name: name,
	  	stats: stats
	  },
	  width: 1,
	  height: 1, // automatically set
	  onHide: function() {
		  nPanel.destroy();
	  }
	});
	nPanel.port.on('hide',function() nPanel.hide());
	nPanel.port.on('log',log);
	nPanel.port.on('resize',function({width,height}) {
		nPanel.resize(width, height);
	});
	nPanel.show({position: mButton, focus: false});

}
//showNotification(['sab','Download Success','nzb-32-green.png','Debian GNU Linux 8 Jessie Testing I386','297 MB - Downloaded in 9 minutes, 17 seconds at an average of 500 KB/s<br/>Unpacked 1 files/folders in 3 seconds']);

//////////////////////////////////////// WEBPAGE LOADED DETECTION AND SCRIPT EXECUTION
var PM = pageMod.PageMod({
  include: SupportedIndexers,
  contentScriptWhen: 'ready',
  contentStyleFile: [self.data.url('webpage-mod.css')],
  contentScriptFile: [self.data.url('jquery-2.1.1.min.js'), self.data.url('api.js'), self.data.url('webpage-mod.js')],
  contentScriptOptions: {
  	prefs: sp.prefs,
  	dataURL: self.data.url(),
  	indexers: SupportedIndexers,
  },
	onAttach: function(worker) {
		worker.port.on('log',log);
		worker.port.on('api-call',function(data) apiCall(worker,data));
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
      if (data.url && data.type && data.fileName)
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
						log('CLI = '+SendQueue[i].type);
						log('Path = '+download.target.path);
						log('Title  = '+SendQueue[i].fileName);

						switch (SendQueue[i].type) {
							case 'nzbg':
								nzbgAPI.call('append',[SendQueue[i].fileName, require('sdk/base64').encode(fileIO.read(download.target.path,'r')), '', 0, false, false, '', 0, 'SCORE']);
								break;
							case 'sab':
								sabAPI.call('addfile',null,null,null,download.target.path);
								break;
						}
						SendQueue.splice(i,1); i--;
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
/*
function confirmNZB(message) { // NYI
	var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);

	var flags = (prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING) +
  	          (prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING)  +
	            (prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING);

	var button = prompts.confirmEx(null, "Title of this Dialog", "What do you want to do?", flags,
																	"Send to NZBGet", "Cancel", "Send to SABnzbd+", null, {value: false});
																	//      0             2							1
}
*/
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

	nzbgAPI.url = sp.prefs.nzbg_url+'/jsonrpc';
	nzbgAPI.username = sp.prefs.nzbg_user;
	nzbgAPI.password = sp.prefs.nzbg_pass;
	nzbgAPI.timeout = sp.prefs.connection_timeout * 1000;
	sabAPI.url = sp.prefs.sab_url+'/api'
	sabAPI.apiKey = sp.prefs.sab_apikey;
	sabAPI.timeout = sp.prefs.connection_timeout * 1000;
	mPanel.port.emit('prefChange',[prefName,sp.prefs[prefName]]);
} onPrefChange('');
sp.on('', onPrefChange);

function apiTestSuccess(result) {
	log('apiTestSuccess()');
	log(result);
	alert('Successfully connected');
}
function apiTestFailure(result) {
	log('apiTestFailure()');
	log(result);
	alert(result.message+"\n\n"+(result.url));
}
sp.on('testNZBGet',function() {
	try {
		nzbgAPI.status(apiTestSuccess,apiTestFailure);
	} catch(e) {alert('ERROR: '+e.message);}
});
sp.on('testSAB',function() {
	try {
		sabAPI.status(apiTestSuccess,apiTestFailure);
	} catch(e) {alert('ERROR: '+e.message);}
});

function apiSuccess(result) {
	console.log('SUCCESS');
	console.log(result);
}
function apiFailure(result) {
	console.log('FAILURE');
	console.log(result);
}

//nzbgAPI.call('version',null,apiSuccess,apiFailure);
//nzbgAPI.call('status',[0],apiSuccess,apiFailure);
//sabAPI.call('queue',null,apiSuccess,apiFailure);


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
			+ '		<description id="downloads-indicator-counter" value="nzb" style="padding-top: 1px" />'
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
function updateProgressWidget([percentage,timeleft,counter]) {
	let groupWidgetWrap = MainWindow.CustomizableUI.getWidget('toggle-button--nzbfoxgithub-nzbfox-ui-button');
	groupWidgetWrap.instances.forEach(function(uiWidget) {
		if (uiWidget.node.getAttribute('indicator') == 'true') {
			uiWidget.node.getElementsByTagName('progressmeter')[0].value = percentage;
			uiWidget.node.getElementsByTagName('description')[0].value = timeleft;
			uiWidget.node.getElementsByTagName('description')[1].value = counter;
		}
	});
}
console.log('nzbFox loaded');