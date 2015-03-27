/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

 		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/
'use strict';

//////////////////////////////////////////////////////////////////////////////
var noSDK = (typeof self.port == 'undefined');
if (noSDK) { // dummy code for when testing UI without add-on SDK
	var port = (new function() {
		this.events = [];
		this.on = function (event,args) {
//			console.log('<- on "'+event+'" called with '+JSON.stringify(args));
		}
		this.emit = function (event,args) {
//			console.log('-> emit "'+event+'" called with '+JSON.stringify(args));
		}
	});

	var options = (new function() {
		this.prefs = {
			theme: 'light',
			dev: true,
			nzbg_enabled: true,
			sab_enabled: true,

			nzbg_url: 'http://192.168.1.4:8085',
			sab_url: 'http://192.168.1.4:8080',
			sab_apikey: '123456',
		};
	});

}
//////////////////////////////////////////////////////////////////////////////

var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};
function escapeHtml(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

function log(msg) {
	if (noSDK)
		console.log(msg)
	else
		self.port.emit('log',msg);
};
function resize() self.port.emit('resize',{width: parseInt(window.getComputedStyle(document.documentElement).width,10),height:parseInt(window.getComputedStyle(document.documentElement).height,10)});
function time() {return Math.round((new Date()).getTime() / 1000)};
function bytesToReadable(bytes,decimal) {
	var s = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	if (bytes == 0) return '0 '+s[0];
	var e = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, e)).toFixed(decimal) + ' ' + s[e];
}
function timeToStringL(secs,twoResults=false) {
	var d = Math.floor(secs / 86400);
	var h = Math.floor((secs % 86400) / 3600);
	var m = Math.floor((secs / 60) % 60);
	var s = Math.floor(secs % 60);
	if (d > 0) return d+' day'+(d > 1?'s':'')+', '+h+' hour'+(h > 1?'s':'');
	if (h > 0) return h+' hour'+(h > 1?'s':'')+', '+m+' minute'+(m > 1?'s':'');
	if (m > 0) return m+' minute'+(m > 1?'s':'')+((m == 1 && s > 0) || twoResults?', '+s+' second'+(s > 1?'s':''):'');
	return s+' second'+(s > 1?'s':'');
}
function timeToStringS(secs) {
	var d = Math.floor(secs / 86400);
	var h = Math.floor((secs % 86400) / 3600);
	var m = Math.floor((secs / 60) % 60);
	var s = Math.floor(secs % 60);
	if (d > 0) return d+'d';
	if (h > 0) return (m > 30?h+1:h)+'h';
	if (m > 0) return (s > 30?m+1:m)+'m';
	return s+'s';
}

function nzbgStatusToString(nzbgStatus) {
	switch (nzbgStatus) {
		case 'FAILURE/BAD': return 'Marked as BAD by user';
		case 'SUCCESS/GOOD': return 'Marked as GOOD by user';
		case 'FAILURE/HEALTH': return 'The download was aborted by health check';
		case 'DELETED/MANUAL': return 'Deleted by user';
		case 'DELETED/DUPE': return 'Deleted by duplicate check';
		case 'FAILURE/PAR': return 'The par-check has failed';
		case 'FAILURE/UNPACK': return 'The unpack has failed and there are no par-files';
		case 'FAILURE/MOVE': return 'Error while moving files from temporary folder to destination';
		case 'WARNING/DAMAGED': return 'Par-check required, but disabled in settings';
		case 'WARNING/REPAIRABLE': return 'Files are damaged, but repair is disabled in settings';
		case 'FAILURE/HEALTH': return 'Health is critical, no par files available, no files unpacked';
		case 'WARNING/HEALTH': return 'Health is less than 100%, no par files available, no files unpacked';
		case 'SUCCESS/HEALTH': return 'Downloaded successfully, no par files available, no files unpacked';
		case 'WARNING/SPACE': return 'Unpack has failed due to not enough space on the drive';
		case 'WARNING/PASSWORD': return 'Unpack has failed because the password was not provided or was wrong';
		case 'SUCCESS/ALL': return 'Downloaded successfully';
		case 'SUCCESS/UNPACK': return 'Downloaded successfully, no post-processing';
		case 'SUCCESS/PAR': return 'Downloaded successfully, no unpack required';
		case 'WARNING/SCRIPT': return 'Downloaded successfully, but a post-processing script has failed';
		default: return nzbgStatus;
	}
}
function nzbgPriorityToString(nzbgPriority) {
	switch (nzbgPriority) {
		case 900: return 'Force';
		case 100: return 'Very High';
		case 50: return 'High';
		case 0: return 'Normal';
		case -50: return 'Low';
		case -100: return 'Very Low';
		default: return nzbgPriority;
	}
}

function updateToolbar() {
	var aTabIsPaused = false;
	if (Tabs.some(function(Tab) { // forEach, but stops on return true
//		console.log('s: '+Tab.download.speed+' p: '+Tab.download.percent+' t: '+Tab.download.time+' z: '+Tab.download.paused);
		if (Tab.download.speed > 0 && Tab.queue.time > 0 &&  !Tab.download.paused) {
			self.port.emit('setIcon',{'16': './nzb-16-green.png','32': './nzb-32-green.png','64': './nzb-64-green.png'});
			if (!progressWidgetVisible)
				showProgressWidget();
			updateProgressWidget(Tab.download.percent,timeToStringS(Tab.queue.time),(Tab.queue.num > 1?Tab.queue.num:'nzb'));
			return true;
		} else
			aTabIsPaused = aTabIsPaused || Tab.download.paused;
	}) == false) {
		// No tabs are downloading
		if (progressWidgetVisible)
			hideProgressWidget();
		self.port.emit('setIcon',aTabIsPaused?{'16': './nzb-16-orange.png','32': './nzb-32-orange.png','64': './nzb-64-orange.png'}:{'16': './nzb-16-gray.png','32': './nzb-32-gray.png','64': './nzb-64-gray.png'})
	}
}
window.setInterval(updateToolbar,2500); // 2.5 secs

var progressWidgetVisible = false;
function showProgressWidget() {
	self.port.emit('showProgressWidget');
	progressWidgetVisible = true;
}
function hideProgressWidget() {
	self.port.emit('hideProgressWidget');
	progressWidgetVisible = false;
}
function updateProgressWidget(percentage,timeleft,counter) {
	if (progressWidgetVisible)
		self.port.emit('updateProgressWidget',[percentage,timeleft,counter]);
}

function onPrefChange([prefName,prefValue]) {
	self.options.prefs[prefName] = prefValue;

	if (prefName == 'theme')
		$('#theme').attr('href','nzbFox.theme.'+self.options.prefs.theme+'.css');
	else
	if (prefName == 'sab_enabled' || prefName == 'nzbg_enabled') {
		if (prefValue) {
			if (prefName == 'nzbg_enabled')
				new nzbgTab();
			if (prefName == 'sab_enabled')
				new sabTab();
		} else {
			for (var i = 0; i < Tabs.length; ++i) {
				if (Tabs[i] && ((prefName == 'sab_enabled' && Tabs[i].constructor.name == 'sabTab') || (prefName == 'nzbg_enabled' && Tabs[i].constructor.name == 'nzbgTab'))) {
					Tabs[i].remove();
					delete Tabs[i];
				}
			}
		}
	}
}

self.port.on('prefChange',onPrefChange);

var panelVisible = false;
self.port.on('show',function() {
	resize();
	panelVisible = true;
	Tabs.forEach(function(Tab) Tab.statusTimerInterval(self.options.prefs.refresh_active));
});
self.port.on('hide',function() {
	panelVisible = false;
	// Click on document to close open menus
	$(document).click();
	// Set interval to idle unless client is downloading something
	Tabs.forEach(function(Tab) Tab.statusTimerInterval(Tab.download.speed > 0?self.options.prefs.refresh_active:self.options.prefs.refresh_idle));
});

var Tabs = [];
function Tab(type) { //// Tab Variables

	var _this = this;
	this.type = type; // can only be 'sab' or 'nzbg'
	// Get our ID
	this.id = Tabs.length;	 // Default to end of array
	for (var i = 0; i < Tabs.length; ++i)
		if (!Tabs[i]) { // recycle a previously used id
			this.id = i;
			break;
		}
	Tabs[this.id] = this;

	// The Tab
	this.header = $('<li/>').append($('<a/>',{href:'#tabs-'+this.id}).text($('div#'+type+'.template').attr('title'))).appendTo('#tabList');
	this.content = $('<div/>', {id: 'tabs-'+this.id}).appendTo('#tabs');
	this.content.html($('div#'+type+'.template').html());
	// Active Download Raw Values
	this.downloadDefaults = {
		id: '',
		paused: false,
		name: '',
		category: '',
		priority: '',
		age: '',
		time: 0,
		speed: 0,
		speedLimit: 0,
		sizeTotal: 0,
		sizeLeft: 0,
		percent: 0
	};

	this.download = $.extend({},this.downloadDefaults);
	this.queue = {num: 0,time: 0};
	// Timers
	this.statusTimer;
	this.statusTimer_interval = self.options.prefs.refresh_active;

	this.historyTimer;
	this.historyTimer_interval = self.options.prefs.refresh_history;
	// Parse results
	this.lastStatus = {};
	this.lastHistory = {};
	this.lastHistoryID = '';
	this.lastActiveID = '';
	// Labels
	this.speedEle = this.content.find('#speed');
	this.nameEle = this.content.find('#name');
	this.timeEle = this.content.find('#time');
	// Progress Bar
	this.progressBarEle = this.content.find('#progressBar').progressbar({value: false});
	this.progressLabelEle = this.content.find('#progressLabel');
	// Activity Spinner
	this.activityEle = this.content.find('#activity').hide();
	this.errorEle = this.content.find('#error');
	// Buttons
	this.btnTogglePauseEle = this.content.find('#togglePause').button().click(function() _this.btnTogglePause_Click.call(_this));
	this.btnRefreshEle = this.content.find('#refresh').button({icons:{primary: 'ui-icon-refresh'}}).click(function() _this.btnRefresh_Click.call(_this));
	this.btnShowMenuEle = this.content.find('#showMenu').button({text:false,icons:{primary:'ui-icon-triangle-1-n'}}).click(function() _this.btnShowMenu_Click.call(_this));
	this.btnOpenEle = this.content.find('#open').button({text:false,icons:{primary: 'ui-icon-newwin'}}).click(function() _this.btnOpen_Click.call(_this)).click(function() self.port.emit('hide'));
	// Action Menu
	this.menuEle = this.content.find('ul#menu').menu({position: {my: 'left bottom', at: 'right bottom'}}).hide();
	// Action Menu Items
	this.menuSpeedLimit = this.content.find('li#speedLimit').click(function() _this.menuSpeedLimit_Click.call(_this));

	this.menuPauseFor = this.content.find('li#pause-custom').click(function() _this.menuPauseFor_Click.call(_this));
	this.menuPauseFor5m = this.content.find('li#pause-5m').click(function() _this.pause.call(_this,5));
	this.menuPauseFor15m = this.content.find('li#pause-15m').click(function() _this.pause.call(_this,15));
	this.menuPauseFor30m = this.content.find('li#pause-30m').click(function() _this.pause.call(_this,30));
	this.menuPauseFor60m = this.content.find('li#pause-60m').click(function() _this.pause.call(_this,60));

	// Refresh UI and activate this tab
	this.content.find('#btnSet').buttonset();
	$('#tabs').tabs('refresh');
	$('#tabs').tabs('option', 'active', 0);

	// Start timers - initial delay of 2 secs for to firefox startup
	window.setTimeout(function() {
		_this.refreshStatus();
		_this.refreshHistory();
	},2000);
}

//// Tab PROTOTYPE functions ////
// Click Events - Buttons
Tab.prototype.btnTogglePause_Click = function() {if (this.download.paused) this.resume(); else this.pause();}
Tab.prototype.btnRefresh_Click = function() this.refreshStatus();
Tab.prototype.btnOpen_Click = function() { //child
}
Tab.prototype.btnShowMenu_Click = function() {
	this.menuEle.show().position({my: 'left bottom',at: 'top right',of: this.btnShowMenuEle});
	var _this = this
	$(document).one('click', function() _this.menuEle.hide());
	return false;
}
// Click Events - Action Menu
Tab.prototype.menuSpeedLimit_Click = function() {
	var _this = this;
	dialog.speedLimit.open(this.download.speedLimit,function() {
		var result = Number($(this).closest('.ui-dialog').find('input').val());
		_this.setSpeedLimit(result);
	});
}
Tab.prototype.menuPauseFor_Click = function() {
	var _this = this;
	dialog.pauseFor.open('',function() {
		var result = Number($(this).closest('.ui-dialog').find('input').val());
		_this.pause(result);
	});
}
// Timers
Tab.prototype.statusTimerInterval = function(interval,startTimer=true) {
	if (typeof interval == 'undefined') return this.statusTimer_interval;	else
	if (interval != this.statusTimer_interval || !this.statusTimer) {
		this.statusTimer_interval = interval;
		log(this.type+' -> status interval set to '+this.statusTimer_interval);
		if (startTimer) {
			this.stopStatusTimer();
			this.startStatusTimer();
		}
	}
}
Tab.prototype.startStatusTimer = function() {
	this.stopStatusTimer();
	var _this = this;
	if (this.statusTimer_interval > 0)
		this.statusTimer = window.setTimeout(function() _this.refreshStatus.call(_this),this.statusTimer_interval * 1000);
}
Tab.prototype.startHistoryTimer = function() {
	this.stopHistoryTimer();
	var _this = this;
	this.historyTimer = window.setTimeout(function() _this.refreshHistory.call(_this),this.historyTimer_interval * 1000);
}
Tab.prototype.stopStatusTimer = function() {
	window.clearTimeout(this.statusTimer);
	this.statusTimer = null;
}
Tab.prototype.stopHistoryTimer = function() {
	window.clearTimeout(this.historyTimer);
	this.historyTimer = null;
}
// API Actions
Tab.prototype.onApiBeforeCall = function(call) { // General API pre-call handling
	this.activityEle.show().css('display','inline-block');
}
Tab.prototype.onApiSuccess = function(call,reply) { // General API success handling
	this.error('');
	this.activityEle.hide();
}
Tab.prototype.onApiFailure = function(call,reply) { // General API failure handling
	this.error(reply.message);
	this.activityEle.hide();
}
Tab.prototype.refreshStatus = function() {	//child
}
Tab.prototype.parseStatus = function() {	//child
}
Tab.prototype.onStatusParsed = function() { // Shared code for post-status parsing
	// Update Tab UI

	var nameStr = this.download.name == ''?'':this.download.name+((this.download.category != '*' && this.download.category != '') ? ' ('+this.download.category+')':'');
	var speedStr = bytesToReadable(this.download.speed * 1024,(this.download.speed>1024?1:0))+'/s'+(this.download.speedLimit > 0?' ('+bytesToReadable(this.download.speedLimit * 1024,(this.download.speedLimit>1024?1:0))+'/s limit)':'');
	var timeStr = this.download.name == ''?'':(this.download.speed > 0?timeToStringL(this.download.time):'Unknown')+' ('+bytesToReadable(this.download.sizeLeft * 1024 * 1024,(this.download.sizeLeft > 1024?1:0))+')';

	this.speedEle.text(speedStr);
	this.nameEle.text(nameStr);
	this.timeEle.text(timeStr);
	this.progressBarEle.progressbar('option',{value:this.download.percent});
	this.progressLabelEle.text(this.download.percent+'%');

	this.paused(this.download.paused);

	resize();

	// Detect new download started
	if (this.download.id != this.lastActiveID && this.download.speed > 0) {
		this.lastActiveID = this.download.id; ///            '---' = fetching NZB URL in SAB
		if (this.download.id != '' && this.download.age != '---' && self.options.prefs.dl_start_notifications && !panelVisible) {
			log('--- DOWNLOAD STARTED "'+name+'", id="'+this.download.id+'" lastid="'+this.lastActiveID+'"');
			self.port.emit('showNotification',[this.type,'Download Started',this.type+'-32.png',this.download.name,bytesToReadable(this.download.sizeTotal * 1024 * 1024,(this.download.sizeTotal > 1024?1:0))+' / Category: '+this.download.category+' / Priority: '+this.download.priority+' / Age: '+this.download.age]);
		}
	}
	if (this.download.speed > 0 && this.statusTimer_interval == self.options.prefs.refresh_idle) {
		// Client is downloading, but were on idle timer. Start active rate
		log(this.type+' -> has gone active');
		this.statusTimerInterval(self.options.prefs.refresh_active,false); // false = dont start timer, start is called after parse in refreshStatus
	} else
	if (this.download.speed == 0 && !panelVisible && this.statusTimer_interval == self.options.prefs.refresh_active) {
		// Client is not downloading, but were on active timer and the panel is not visible. Start idle rate
		log(this.type+' -> has gone idle');
		this.statusTimerInterval(self.options.prefs.refresh_idle,false); // false = dont start timer, start is called after parse in refreshStatus
	}
}
Tab.prototype.refreshHistory = function() {	//child
}
Tab.prototype.parseHistory = function() {//child
}
Tab.prototype.pause = function(mins) {	//child
}
Tab.prototype.resume = function() {					//child
}
Tab.prototype.setSpeedLimit = function(kbps) { //child
}
// General Functions
Tab.prototype.paused = function(paused) { // updates UI, called during status parse
	if (typeof paused == 'undefined') return this.download.paused; else {
		this.download.paused = paused;
		this.btnTogglePauseEle.button('option',{label: paused?'Resume':'Pause',icons:{primary:paused?'ui-icon-play':'ui-icon-pause'}});
		this.btnTogglePauseEle.css('color',paused?'#00FF00':'#FF0000');
		return paused;
	}
}
Tab.prototype.error = function(message) this.errorEle.html(message)
Tab.prototype.remove = function() {
	window.clearTimeout(this.statusTimer);
	window.clearTimeout(this.historyTimer);
	this.header.remove();
	this.content.remove();
	$('#tabs').tabs('refresh');
}


//////////////////
// SABnzbd+ Tab //
//////////////////
sabTab.prototype = Object.create(Tab.prototype);
sabTab.prototype.constructor = sabTab;
function sabTab(type) {
	var _this = this;
	Tab.call(this, 'sab');

	this.menuOnFinishNothing = this.content.find('li#finish-nothing').click(function() _this.setFinishAction.call(_this,''));
	this.menuOnFinishShutdown = this.content.find('li#finish-shutdown').click(function() _this.setFinishAction.call(_this,'shutdown_program'));
	this.menuOnFinishShutdownPC = this.content.find('li#finish-shutdownPC').click(function() _this.setFinishAction.call(_this,'shutdown_pc'));
	this.menuOnFinishStandbyPC = this.content.find('li#finish-standbyPC').click(function() _this.setFinishAction.call(_this,'standby_pc'));
	this.menuOnFinishHibernatePC = this.content.find('li#finish-hibernatePC').click(function() _this.setFinishAction.call(_this,'hibernate_pc'));
	this.menuOnFinishScript = this.content.find('li#finish-script').click(function() _this.menuOnFinishScript_Click.call(_this));

}

//// SABnzbd+ Tab PROTOTYPE functions ////
// Click Events - Buttons
sabTab.prototype.btnOpen_Click = function() {
	window.open(self.options.prefs.sab_url);
}
// Click Events - Action Menu
sabTab.prototype.menuOnFinishScript_Click = function() {
	var _this = this;
	var options = [];
	for (var i = 0; i < this.lastStatus.queue.scripts.length; ++i)
		if (this.lastStatus.queue.scripts[i].endsWith('.py') || this.lastStatus.queue.scripts[i].endsWith('.bat') || this.lastStatus.queue.scripts[i].endsWith('.cmd'))
			options.push(
				$('<option>',{value:'script_'+this.lastStatus.queue.scripts[i],selected:(this.lastStatus.queue.finishaction == 'script_'+this.lastStatus.queue.scripts[i]?true:false)}).text(this.lastStatus.queue.scripts[i])
			);

	dialog.finishScript.open(options,function() {
		var result = $(this).closest('.ui-dialog').find('select').val();
		_this.setFinishAction(result);
	});
}
// API Actions
sabTab.prototype.refreshStatus = function() {
	log('refreshStatus('+this.type+')');
	this.stopStatusTimer();
	api.call(this,'queue',{limit:5},
		function(api) { // onSuccess
			this.parseStatus(api);
			this.onStatusParsed();
			this.startStatusTimer();
		},
		function(api) { // onFailure
			this.startStatusTimer();
		}
	);

}
sabTab.prototype.parseStatus = function(api) {
	log('parseStatus('+this.type+')');
	this.lastStatus = api;
	this.download = $.extend({},this.downloadDefaults);

	$.extend(this.download,{
		paused: api.queue.paused,
		speed: (api.queue.kbpersec || 0),
		speedLimit: (api.queue.speedlimit || 0),
	});
	this.queue = {
		num: 0,
		time: (api.queue.mbleft * 1024 / api.queue.kbpersec),
	}

	this.menuOnFinishNothing.css('color','');
	this.menuOnFinishShutdown.css('color','');
	if (api.nt) { // Windows only On Finish actions
		$('li.windows-only').show();
		this.menuOnFinishShutdownPC.css('color','');
		this.menuOnFinishStandbyPC.css('color','');
		this.menuOnFinishHibernatePC.css('color','');
	} else $('li.windows-only').hide()
	this.menuOnFinishScript.css('color','');

	if (!api.queue.finishaction)
		this.menuOnFinishNothing.css('color','#FF8C00') // DarkOrange
	else
	if (api.queue.finishaction == 'shutdown_program')
		this.menuOnFinishShutdown.css('color','#FF8C00')
	else
	if (api.queue.finishaction == 'shutdown_pc')
		this.menuOnFinishShutdownPC.css('color','#FF8C00')
	else
	if (api.queue.finishaction == 'standby_pc')
		this.menuOnFinishStandbyPC.css('color','#FF8C00')
	else
	if (api.queue.finishaction == 'hibernate_pc')
		this.menuOnFinishHibernatePC.css('color','#FF8C00')
	else
	if (api.queue.finishaction.startsWith('script_'))
		this.menuOnFinishScript.css('color','#FF8C00');

	// Find active download
	for (var i = 0; i < api.queue.slots.length; ++i) {
		var item = api.queue.slots[i];
		if (item.status == 'Downloading' || (item.status == 'Queued' && this.download.paused)) { // If download is active, or first in queue while paused
			if (this.download.id == '') // If we havent already found top active item
				$.extend(this.download, {
					id: item.nzo_id,
					name: item.filename,
					category: item.cat,
					priority: item.priority,
					age: item.avg_age,
					time: (item.mbleft * 1024 / this.download.speed),
					sizeTotal: item.mb,
					sizeLeft: item.mbleft,
					percent: Math.floor(item.percentage)
				});
		} // Active item loop
		if (item.status == 'Downloading' || item.status == 'Queued')
			this.queue.num++;
	} // All item loop
}
sabTab.prototype.refreshHistory = function() {
	this.stopHistoryTimer();
	api.call(this,'history',{limit:1},
		function(api) { // onSuccess
			this.parseHistory(api);
			this.startHistoryTimer();
		},
		function(api) { // onFailure
			this.startHistoryTimer();
		}
	);
}
sabTab.prototype.parseHistory = function(api) {
	this.lastHistory = api;
	log('parseHistory('+this.type+'), items = '+api.history.slots.length);
	if (api.history.slots.length == 0) return;
	if (this.lastHistoryID == '') {
		// First parse of history, set last ID but dont notify
		this.lastHistoryID = api.history.slots[0].nzo_id;
	} else
	if (api.history.slots[0].nzo_id != this.lastHistoryID && (time() - api.history.slots[0].completed) < (self.options.prefs.refresh_history * 3) /* finished in past _ secs */ && (api.history.slots[0].status == 'Completed' || api.history.slots[0].status == 'Failed')) {
		// Latest downloaded item nzo_id has changed. Perform notify
		var status = api.history.slots[0].status;
		var name = api.history.slots[0].name;
		var stats = escapeHtml(api.history.slots[0].size)+' - ';

		for (var i = 0; i < api.history.slots[0].stage_log.length; ++i)
			if (api.history.slots[0].stage_log[i].name == 'Download') {
				stats += escapeHtml(api.history.slots[0].stage_log[i].actions[0]); // Downloaded in _ at an average of _ KB/s
			} else
			if (api.history.slots[0].stage_log[i].name == 'Unpack') {
				stats += '<br/>'+escapeHtml(api.history.slots[0].stage_log[i].actions[0].split('] ').pop()); // Extract text outside of square brackets
			}

		if (api.history.slots[0].fail_message != '')
			stats += '<br/><font color="red">'+escapeHtml(api.history.slots[0].fail_message)+'</font>';

		if (self.options.prefs.dl_finish_notifications) {
			log('--- DOWNLOAD FINISHED "'+name+'", finished '+(time() - api.history.slots[0].completed)+' seconds ago');
			self.port.emit('showNotification',[this.type,'Download '+status,'nzb-32-'+(status == 'Completed'?'green':'orange')+'.png',name,stats]);
		}
		this.lastHistoryID = api.history.slots[0].nzo_id;
	}
}
sabTab.prototype.pause = function(mins) {
	if (mins > 0)
		api.call(this,'config',{name:'set_pause',value:mins},this.refreshStatus)
	else
		api.call(this,'pause',{},this.refreshStatus);
}
sabTab.prototype.resume = function() {
	api.call(this,'resume',{},this.refreshStatus);
}
sabTab.prototype.setSpeedLimit = function(kbps) {
	api.call(this,'config',{name:'speedlimit',value:kbps},this.refreshStatus);
}
sabTab.prototype.setFinishAction = function(action) { // Unique to SAB
	api.call(this,'queue',{name:'change_complete_action',value:action},this.refreshStatus);
}
//////////////////////////////////////////////////////////////////////////////


////////////////
// NZBGet Tab //
////////////////
nzbgTab.prototype = Object.create(Tab.prototype);
nzbgTab.prototype.constructor = nzbgTab;
function nzbgTab(type) {
	var _this = this;
	Tab.call(this, 'nzbg');
}

//// NZBGet Tab PROTOTYPE functions ////
// Click Events - Buttons
nzbgTab.prototype.btnOpen_Click = function() {
	window.open(self.options.prefs.nzbg_url);
}
// API Actions
nzbgTab.prototype.refreshStatus = function() {
	log('refreshStatus('+this.type+')');
	this.stopStatusTimer();
	api.call(this,'status',{limit:5},
		function(api) { // onSuccess
			this.parseStatus(api);
			this.refreshQueue();
		},
		function(api) { // onFailure
				this.startStatusTimer();
			}
	);
}
nzbgTab.prototype.parseStatus = function(api) {
	log('parseStatus('+this.type+')');
	this.lastStatus = api;
	this.download = $.extend({},this.downloadDefaults);

	$.extend(this.download,{
		paused: api.result.DownloadPaused,
		speed: Math.floor(api.result.DownloadRate / 1024), // Convert bps to kbps
		speedLimit: (api.result.DownloadLimit / 1024), // Convert bps to kbps
	});
	this.queue = {
		num: 0,
		time: (api.result.RemainingSizeMB * 1024 / this.download.speed),
	};
}
nzbgTab.prototype.refreshQueue = function() {
	log('refreshQueue('+this.type+')');
	this.stopStatusTimer();
	api.call(this,'listgroups',[3],
		function(api) { // onSuccess
			this.parseQueue(api);
			this.onStatusParsed();
			this.startStatusTimer();
		},
		function(api) { // onFailure
			this.startStatusTimer();
		}
	);
}
nzbgTab.prototype.parseQueue = function(api) {
	log('parseQueue('+this.type+')');
	this.lastQueue = api;
	// Find active download
	for (var i = 0; i < api.result.length; ++i) {
		var item = api.result[i];
		if (item.Status == 'DOWNLOADING' || (item.Status == 'QUEUED' && this.download.paused)) { // If download is active, or first in queue while paused
			if (this.download.id == '') { // If we havent already found top active item
				$.extend(this.download, {
					id: item.NZBID,
					name: item.NZBName,
					category: item.cat,
					priority: nzbgPriorityToString(item.MaxPriority),
					age: timeToStringS(time() - item.MinPostTime),
					sizeTotal: (item.FileSizeMB - item.PausedSizeMB),
					sizeLeft: (item.RemainingSizeMB - item.PausedSizeMB),
				});
				$.extend(this.download, { // extend again because we are going to use vars calculated prior
					time: (this.download.sizeLeft * 1024 / this.download.speed),
					percent: Math.floor((this.download.sizeTotal - this.download.sizeLeft) / this.download.sizeTotal * 100),
				});
			}
		} // Active item loop
		if (item.Status == 'DOWNLOADING' || item.Status == 'QUEUED')
			this.queue.num++;
	} // All item loop
}
nzbgTab.prototype.refreshHistory = function() {
	this.stopHistoryTimer();
	api.call(this,'history',[false],
		function(api) { // onSuccess
			this.parseHistory(api);
			this.startHistoryTimer();
		},
		function(api) { // onFailure
			this.startHistoryTimer();
		}
	);
}
nzbgTab.prototype.parseHistory = function(api) {
	log('parseHistory('+this.type+'), items = '+api.result.length);

	for (var i = 0; i < api.result.length; ++i) {
		var status = escapeHtml(api.result[i].Status.split('/').shift());

		if (api.result[i].Kind == 'NZB' && (status == 'SUCCESS' || status == 'FAILURE' || status == 'WARNING')) {
			if (this.lastHistoryID == '') {
				this.lastHistoryID = api.result[i].NZBID;
				break;
			} else
			if (api.result[i].NZBID != this.lastHistoryID && (time() - api.result[i].HistoryTime) < (self.options.prefs.refresh_history * 3) /* finished in past _ secs */) {
				// Latest downloaded item NZBID has changed. Perform notify
				var name = api.result[i].Name;
				var speed = api.result[i].DownloadTimeSec > 0 ? ((api.result[i].DownloadedSizeMB  > 1024?(api.result[i].DownloadedSizeMB * 1024 * 1024):api.result[i].DownloadedSizeLo) / api.result[i].DownloadTimeSec) : 0;
				var stats = escapeHtml(api.result[i].DownloadedSizeMB+' MB - Downloaded in '+timeToStringL(api.result[i].DownloadTimeSec,true)+' at an average of '+bytesToReadable(speed)+'/s');
				if (api.result[i].UnpackTimeSec > 0)
					stats += '<br/>Unpacked in '+escapeHtml(timeToStringL(api.result[i].UnpackTimeSec));

				if (status != 'SUCCESS')
					stats += '<br/><font color="red">'+escapeHtml(nzbgStatusToString(api.result[i].Status))+'</font>';

				if (self.options.prefs.dl_finish_notifications) {
					log('--- DOWNLOAD FINISHED "'+name+'", finished '+(time() - api.result[i].HistoryTime)+' seconds ago');
					self.port.emit('showNotification',[this.type,'Download '+status,'nzb-32-'+(status == 'SUCCESS'?'green':'orange')+'.png',name,stats]);
				}
				this.lastHistoryID = api.result[i].NZBID;
			}
			break;
		}
	}
}
nzbgTab.prototype.pause = function(mins) {
	if (mins > 0) {
		this.pause();
		api.call(this,'scheduleresume',[60 * mins],this.refreshStatus); // NZBGet uses seconds
	} else
		api.call(this,'pausedownload',[],this.refreshStatus);
}
nzbgTab.prototype.resume = function() {
	api.call(this,'resumedownload',[],this.refreshStatus);
}
nzbgTab.prototype.setSpeedLimit = function(kbps) {
	api.call(this,'rate',[kbps],this.refreshStatus);
}
//////////////////////////////////////////////////////////////////////////////

const dialog = (new function() {

	var defaults = {
		autoOpen: false,
		modal: true,
		draggable: false,
		resizable: false,
		width: 250,
		position: {my: 'center', at: 'center', of: '#tabs'},
		buttons: [
			{
				text: 'OK',
				click: function() {
					$(this).dialog('close');
				}
			},
			{
				text: 'Cancel',
				click: function() {
					$(this).dialog('close');
				}
			}
		]
	}

	const onKeyPress = function(e) {
		if (e.keyCode == $.ui.keyCode.ENTER) $(this).parent().find('button:eq(1)').trigger('click');
	}

	this.speedLimit = $('#speedLimit.dialog').dialog(defaults).keypress(onKeyPress);
	this.pauseFor = $('#pauseFor.dialog').dialog(defaults).keypress(onKeyPress);
	this.finishScript = $('#finishScript.dialog').dialog(defaults).keypress(onKeyPress);


	this.speedLimit.open = function(speedLimit,onClose) {
		// this == speedLimit element
		this.dialog('open');
		this.find('input').val(speedLimit).select();
		if (onClose)
			this.parent().find('button:eq(1)').one('click',onClose);
	}

	this.pauseFor.open = function(pauseFor,onClose) {
		this.dialog('open');
		this.find('input').val(pauseFor).select();
		if (onClose)
			this.parent().find('button:eq(1)').one('click',onClose);
	}

	this.finishScript.open = function(finishScript,onClose) {
		var scriptSelect = this.find('select');
		scriptSelect.html('').select();

		for (var i = 0; i < finishScript.length; ++i)
			scriptSelect.append(finishScript[i]);

		this.dialog('open');
		if (onClose)
			this.parent().find('button:eq(1)').one('click',onClose);
	}


}());

$(function() {

	$('#tabs').tabs({activate: resize});

	$('button#showOptions').button({text:false,icons:{primary:'ui-icon-wrench'}}).click(function() self.port.emit('showOptions'));

	onPrefChange(['theme',self.options.prefs.theme]);
	if (self.options.prefs.nzbg_enabled)
		onPrefChange(['nzbg_enabled',true]);
	if (self.options.prefs.sab_enabled)
		onPrefChange(['sab_enabled',true]);

	if (noSDK) {
		Tabs[0].parseStatus(testNzbgStatus);
		Tabs[0].parseQueue(testNzbgQueue);
		Tabs[0].parseHistory(testNzbgetHistory);
		Tabs[1].parseStatus(testSabStatus);
		Tabs[1].parseHistory(testSabHistory1);

		Tabs[0].onStatusParsed();
		Tabs[1].onStatusParsed();
	}

	if (self.options.prefs.dev) {
		$('#dev').show();
		$('#test1').click(function() {
			Tabs.forEach(function(Tab) console.log(Tab));
		});
		$('#test2').click(function() {
			self.options.prefs.theme = (self.options.prefs.theme == 'light'?'dark':'light');
			onPrefChange(['theme',self.options.prefs.theme]);
			resize();
		});
	}
});