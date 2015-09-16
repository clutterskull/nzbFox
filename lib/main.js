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
const passwords = require('sdk/passwords');
const system = require('sdk/system');
const tabs = require('sdk/tabs');
const notifications = require('sdk/notifications');
const {Cu,Cc,Ci} = require('chrome');

const { Panel } = require('sdk/panel');
const { ToggleButton } = require('sdk/ui/button/toggle');
const { ActionButton } = require('sdk/ui/button/action');

const { nzbgAPI } = require('lib/NZBGet_API');
const { sabAPI } = require('lib/SABnzbd_API');

var SendQueue = [];
const SupportedIndexers = ['*.newz-complex.org','*.animenzb.com','*.dognzb.cr','*.nzbs.org','*.pfmonkey.com','*.nzb.su','*.nzbindex.nl','*.nzbindex.com','*.nzbclub.com','*.nmatrix.co.za', '*.althub.co.za','*.oznzb.com','*.binsearch.info','*.binsearch.net','*.nzbgeek.info','*.nzbplanet.net'];
var CustomIndexers = parseCustomIndexersPref();

function log(msg) {
	if (sp.prefs.dev)
		console.log(msg);
}

function parseCustomIndexersPref() {
		// parse private newznab list
		let indexers = [];
		if (sp.prefs.custom_indexers != '')
			indexers = sp.prefs.custom_indexers.replace(/ /g,'').split(',');

		for (let i = 0; i < indexers.length; ++i)
			if (indexers[i] != '')
				indexers[i] = '*.'+indexers[i];
	return indexers;
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
	icon: {'16': './images/nzb-16-gray.png','32': './images/nzb-32-gray.png','64': './images/nzb-64-gray.png'},
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
	contentURL: './main-panel.html',
	contentScriptFile: ['./theme/jquery.min.js','./theme/jquery-ui.min.js','./api.js', './main-panel.js'],
	contentScriptWhen: 'end',
	contentScriptOptions: {
		prefs: sp.prefs
	},
	width: 1,
	height: 1, // automatically set
	onShow: function() mPanel.port.emit('show'),
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
mPanel.port.on('resize',function({width,height}) mPanel.resize(width, height));
mPanel.port.on('api-call',function(data) apiCall(mPanel,data));

function showNotification([type,title,icon,name,stats]) {
	// Notifications Panel
	if (sp.prefs.dl_notification_type == 'standard' || sp.prefs.dl_notification_type == 'both') {
		let nPanel = Panel({
			contentURL: './notification-panel.html',
			contentScriptFile: ['./theme/jquery.min.js','./theme/jquery-ui.min.js','./notification-panel.js'],
			contentScriptWhen: 'end',
			contentScriptOptions: {
				prefs: sp.prefs,
				type: type,
				title: title,
				icon: 'images/'+icon,
				name: name,
				stats: stats
			},
			width: 1,
			height: 1, // automatically set
			onHide: function() nPanel.destroy()
		});
		nPanel.port.on('hide',function() nPanel.hide());
		nPanel.port.on('log',log);
		nPanel.port.on('resize',function({width,height}) nPanel.resize(width, height));
		nPanel.show({position: mButton, focus: false});
	}
	if (sp.prefs.dl_notification_type == 'desktop' || sp.prefs.dl_notification_type == 'both')
		notifications.notify({
		  title: title,
		  text: name,
		  data: type,
		  iconURL: './images/'+icon,
			onClick: function (data) {
				if (data == 'sab')
					tabs.open(sp.prefs.sab_url);
				else
				if (data == 'nzbg')
					tabs.open(sp.prefs.nzbg_url);
		  }
		});
}
//showNotification(['sab','Download Success','nzb-32-green.png','Debian GNU Linux 8 Jessie Testing I386','297 MB - Downloaded in 9 minutes, 17 seconds at an average of 500 KB/s<br/>Unpacked 1 files/folders in 3 seconds']);


//////////////////////////////////////// WEBPAGE LOADED DETECTION AND SCRIPT EXECUTION
// WARNING: As of Firefox 30+, 'include' and 'contentScriptOptions' can not be updated during runtime.
var PM;
function createPageMod() {
	if (typeof PM !== 'undefined')
		PM.destroy();
	PM = pageMod.PageMod({
		include: SupportedIndexers.concat(CustomIndexers),
		contentScriptWhen: 'ready',
		contentStyleFile: ['./webpage-mod.css'],
		contentScriptFile: ['./theme/jquery.min.js','./theme/jquery-ui.min.js','./api.js','./webpage-mod.js'],
		contentScriptOptions: {
			prefs: sp.prefs,
			dataURL: self.data.url(),
			indexers: SupportedIndexers.concat(CustomIndexers),
		},
		onAttach: function(worker) {
			worker.port.on('log',log);
			worker.port.on('api-call',function(data) apiCall(worker,data));
			worker.port.emit('scriptAttached',[sp.prefs,SupportedIndexers.concat(CustomIndexers)]);
		}
	});
}
createPageMod();

//////////////////////////////////////// //////////////////////////////////////// ////////////////////////////////////////


//////////////////////////////////////// ADD OPTIONS TO DOWNLOAD PROMPT
	const { ChromeMod } = require('lib/chrome-mod');
	let cm = new ChromeMod({
		include: 'chrome://mozapps/content/downloads/unknownContentType.xul',
		contentScriptWhen: 'end',
		contentScriptOptions: {
			prefs: sp.prefs,
			dataURL: self.data.url(),
		},
		contentScriptFile: './download-mod.js',
		onAttach: function(worker) {
			worker.port.on('log',log);
			worker.port.on('nzb-download', function(data) {
				if (data.url && data.type && data.fileName) {
					SendQueue.push(data);
			 		sp.prefs.prompt_action = (data.remember?data.type:'');
				}
			})
		},
	});
//////////////////////////////////////// //////////////////////////////////////// ////////////////////////////////////////


//////////////////////////////////////// NZB DOWNLOAD DETECTION
// TODO: Create a class
Cu.import('resource://gre/modules/Downloads.jsm');
Cu.import('resource://gre/modules/Task.jsm');

var downloadList;
var downloadView = {
//	onDownloadAdded: function(download) {},
	onDownloadChanged: function(download) {
		if (download.succeeded && SendQueue.length > 0 && (download.contentType == 'application/x-nzb' || download.target.path.endsWith('.nzb'))) {
			for (let i = 0; i < SendQueue.length; ++i) {
				if (download.source.url == SendQueue[i].url) {
					log('-------- Download Detected --------');
					log('CLI = '+SendQueue[i].type);
					log('Cat = '+SendQueue[i].category);
					log('Path = '+download.target.path);
					log('Title = '+SendQueue[i].fileName);

					switch (SendQueue[i].type) {
						case 'nzbg':
							nzbgAPI.call('append',[SendQueue[i].fileName, require('sdk/base64').encode(fileIO.read(download.target.path,'r'),'utf-8'), SendQueue[i].category, 0, false, false, '', 0, 'SCORE']);
							break;
						case 'sab':
							sabAPI.call('addfile',{cat:SendQueue[i].category},null,null,download.target.path);
							break;
					}
					SendQueue.splice(i,1); i--;
					// File is still locked by browser at this point, delay removal for 3 seconds.
					timers.setTimeout(function() {fileIO.remove(download.target.path)},3000);
				}
			}
		}
	},
//	onDownloadRemoved: function(download) {}
};

Task.spawn(function() {
	downloadList = yield Downloads.getList(Downloads.ALL);
	yield downloadList.addView(downloadView);
}).then(null, Cu.reportError);

exports.onUnload = function (reason) {
	// Remover download handler
	if (downloadList) downloadList.removeView(downloadView);
};

//////////////////////////////////////// //////////////////////////////////////// ////////////////////////////////////////


function alert(message) {
	var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
	prompts.alert(null, 'nzbFox', message);
}

function setUIButtonIcon(icon) {
	if (mButton.icon != icon) mButton.icon = icon;
}

function onPrefChange(prefName) {
	if (prefName == 'custom_indexers') {
		CustomIndexers = parseCustomIndexersPref();
		createPageMod();
	}
	nzbgAPI.url = sp.prefs.nzbg_url+'/jsonrpc';
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
	} catch(e) {alert('ERROR: '+e.name+' '+e.message);console.log(e)}
});
sp.on('testSAB',function() {
	try {
		sabAPI.status(apiTestSuccess,apiTestFailure);
	} catch(e) {alert('ERROR: '+e.name+' '+e.message);}
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


Cu.import('resource:///modules/CustomizableUI.jsm');

function showProgressWidget() {
	log('showProgressWidget()');
	let groupWidgetWrap = CustomizableUI.getWidget('toggle-button--nzbfoxgithub-nzbfox-ui-button');
	groupWidgetWrap.instances.forEach(function(uiWidget) {

		// BUG: OSX places download info below icon rather than next to icon... Remove nzbFox icon while downloading
		if (system.platform == 'darwin') // 'darwin' / 'winnt'
			uiWidget.node.boxObject.firstChild.getElementsByClassName('toolbarbutton-icon')[0].setAttribute('hidden','true')

		uiWidget.node.setAttribute('indicator','true');
		uiWidget.node.setAttribute('progress','true');
		uiWidget.node.setAttribute('counter','true');
		let additional = ''
			+ '<stack id="downloads-indicator-anchor" class="toolbarbutton-icon" style="padding-top: 4px">' // padding-top is to match height of icon
			+ '	<vbox id="downloads-indicator-progress-area" pack="center">'
			+ '		<description id="downloads-indicator-counter" value="" />'
			+ '		<progressmeter id="downloads-indicator-progress" class="plain" min="0" max="100" value="0" />'
			+ '		<description id="downloads-indicator-counter" value="nzb" style="padding-top: 1px" />'
			+ '	</vbox>'
			+ '</stack>';
			uiWidget.node.insertAdjacentHTML('beforeend',additional);
	});
}
//showProgressWidget(); updateProgressWidget([50,'2h','nzb']);

function hideProgressWidget() {
	log('hideProgressWidget()');
	let groupWidgetWrap = CustomizableUI.getWidget('toggle-button--nzbfoxgithub-nzbfox-ui-button');
	groupWidgetWrap.instances.forEach(function(uiWidget) {

		if (system.platform == 'darwin') // 'darwin' / 'winnt'
			uiWidget.node.boxObject.firstChild.getElementsByClassName('toolbarbutton-icon')[0].setAttribute('hidden','false')

		uiWidget.node.removeAttribute('indicator','true');
		uiWidget.node.removeAttribute('progress','true');
		uiWidget.node.removeAttribute('counter','true');
		uiWidget.node.removeChild(uiWidget.node.getElementsByTagName('stack')[0]);
	});
}
function updateProgressWidget([percentage,timeleft,counter]) {
	let groupWidgetWrap = CustomizableUI.getWidget('toggle-button--nzbfoxgithub-nzbfox-ui-button');
	groupWidgetWrap.instances.forEach(function(uiWidget) {
		if (uiWidget.node.getAttribute('indicator') == 'true') {
			uiWidget.node.getElementsByTagName('progressmeter')[0].value = percentage;
			uiWidget.node.getElementsByTagName('description')[0].value = timeleft;
			uiWidget.node.getElementsByTagName('description')[1].value = counter;
		}
	});
}

console.log('nzbFox '+self.version+' loaded on '+system.vendor+' '+system.name+' '+system.version);