/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

 		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/
// todo: [Object object] was being passed by nzbget rpc error for invalid parameter

//////////////////////////////////////////////////////////////////////////////
var noSDK = (typeof self.port == 'undefined');

var TabList = [];
var panelVisible = false;

if (noSDK) { // dummy code for when testing UI without add-on SDK
	var port = (new function() {
		this.events = [];
		this.on = function (event,args) {
			console.log('on "'+event+'" called with '+JSON.stringify(args));
		}
		this.emit = function (event,args) {
			console.log('emit "'+event+'" called with '+JSON.stringify(args));
		}
	});

	var options = (new function() {
		this.prefs = {
			theme: 'light',
			nzbg_enabled: true,
			sab_enabled: true,

			nzbg_ip: '192.168.1.4',
			nzbg_port: 8085,
			nzbg_user: '',
			nzbg_pass: '',

			sab_ip: '192.168.1.4',
			sab_port: 8080,
			sab_apikey: '123456',
		};
	});

}
//////////////////////////////////////////////////////////////////////////////

function log(msg) {self.port.emit('log',msg);}

function time() {return Math.round((new Date()).getTime() / 1000)}

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
	if (h > 0) return h+'h';
	if (m > 0) return m+'m';
	return s+'s';
}

var progressWidgetVisible = false;
function showProgressWidget() {
	self.port.emit('showProgressWidget');
	progressWidgetVisible = true;
}
function hideProgressWidget() {
	self.port.emit('hideProgressWidget');
	progressWidgetVisible = false;
}
function updateProgressWidget(percentage,timeleft) {
	if (progressWidgetVisible)
		self.port.emit('updateProgressWidget',[percentage,timeleft]);
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

function tabStartTimer(id) {
	// 3 sec refresh while visible/downloading, 2 mins while idle.
	var refreshRate = (progressWidgetVisible || panelVisible) ? self.options.prefs.refresh_active : self.options.prefs.refresh_idle;
	TabList[id].refresh_timer = window.setTimeout(function() {TabList[id].refreshStatus(refreshRate)},(refreshRate > 0?refreshRate * 1000:5000));
	// If rate > 0, proceed as normal. If 0, do timer anyway with 5sec interval, pass rate to refreshStatus, where refreshStatus will ignore if rate is 0.
	// Messy late night logic, due to "Active" rate is 0, but idle rate is not - idle timer wont get created otherwise
}

function refreshAll(doHistory=false) {
	for (var i = 0; i < TabList.length; ++i)
		if (TabList[i]) {
			TabList[i].refreshStatus(); //.btnRefreshEle.click(); not being called because click() closes menu
			if (doHistory) TabList[i].refreshHistory();
		}
}

var refreshIcon_timer;
function refreshIcon() {
	window.clearTimeout(refreshIcon_timer);
	var isActive = false;
	var isPaused = false;

	var dlPercent;
	var dlTime;

	for (var i = 0; i < TabList.length; ++i)
		if (TabList[i]) {
			isActive = isActive || TabList[i].active();
			isPaused = isPaused || TabList[i].paused();

			if (TabList[i].dlSpeed > 0 && !dlPercent && !dlTime) {
				dlPercent = TabList[i].dlPercent;
				dlTime = timeToStringS(TabList[i].dlTimeSecs);
			}
		}

	if (isActive) {
		self.port.emit('setIcon',{'16': './nzb-16-green.png','32': './nzb-32-green.png','64': './nzb-64-green.png'});
		if (!progressWidgetVisible)
			showProgressWidget();
		if (progressWidgetVisible && dlPercent && dlTime)
			updateProgressWidget(dlPercent,dlTime);
	} else
	if (isPaused) {
		self.port.emit('setIcon',{'16': './nzb-16-orange.png','32': './nzb-32-orange.png','64': './nzb-64-orange.png'});
		if (progressWidgetVisible)
			hideProgressWidget();
	} else {
		self.port.emit('setIcon',{'16': './nzb-16-gray.png','32': './nzb-32-gray.png','64': './nzb-64-gray.png'});
		if (progressWidgetVisible)
			hideProgressWidget();
	}

	refreshIcon_timer = window.setTimeout(refreshIcon,3000);
}

function addTab(tabType) {
	for (var i = 0; i < TabList.length; ++i)
		if (!TabList[i]) { // recycle a previously used id
			var id = i;
			break;
		}

	if (typeof id == 'undefined') // insert at end of array
		var id = TabList.length;

	if (tabType == 'nzbg')
		TabList[id] = new nzbg_tab(id,'NZBGet');
	else
	if (tabType == 'sab')
		TabList[id] = new sab_tab(id,'SABnzbd+');

}

function doResize() {
	self.port.emit('resize',{width: parseInt(window.getComputedStyle(document.documentElement).width,10),height:parseInt(window.getComputedStyle(document.documentElement).height,10)});
}

function onPrefChange([prefName,prefValue]) {
	self.options.prefs[prefName] = prefValue;

	if (prefName == 'theme') {
		$('#theme').attr('href','jquery-ui.theme.'+prefValue+'.min.css');

		if (prefValue == 'dark') {
			$('.ui-progressbar-label').css('text-shadow','1px 1px 0 #000');
		} else
		if (prefValue == 'light') {
			$('.ui-progressbar-label').css('text-shadow','1px 1px 0 #FFF');
		}
	}else
	if (prefName == 'sab_enabled' || prefName == 'nzbg_enabled') {
		if (prefValue) {
			if (prefName == 'nzbg_enabled')
				addTab('nzbg');
			if (prefName == 'sab_enabled')
				addTab('sab');
		} else {
			for (var i = 0; i < TabList.length; ++i) {
				if (TabList[i] && ((prefName == 'sab_enabled' && TabList[i].constructor.name == 'sab_tab') || (prefName == 'nzbg_enabled' && TabList[i].constructor.name == 'nzbg_tab'))) {
					TabList[i].remove();
					delete TabList[i];
				}
			}
		}
	}
}
self.port.on('prefChange',onPrefChange);

self.port.on('show',function() {
	doResize();
	panelVisible = true;
	refreshAll();
});
self.port.on('hide',function() {
	panelVisible = false;
	// Click on document to close open menus
	$(document).click();
});
self.port.on('rpc-call-success',function({call,reply}) {
//	log('rpc-call-success '+JSON.stringify(call)+' / '+JSON.stringify(reply));
	if (!TabList[call.id]) return;
	TabList[call.id].setError('');

	tabStartTimer(call.id);
	
	if (call.method == 'status' || call.method == 'queue') {
		TabList[call.id].parseStatus(reply);
		TabList[call.id].refreshQueue();
	} else
	if (call.method == 'history') {
		TabList[call.id].parseHistory(reply);
	}
	if (call.method == 'listgroups'){
		TabList[call.id].parseQueue(reply);
	} else
	if (call.method == 'pausedownload' || call.method == 'pause') {
		TabList[call.id].setPaused(true);
	} else
	if (call.method == 'resumedownload' || call.method == 'resume') {
		TabList[call.id].setPaused(false);
	}
});
self.port.on('rpc-call-failure',function({call,reply}) {
	log('rpc-call-failure '+JSON.stringify(call)+' / '+JSON.stringify(reply));
	if (TabList[call.id]) {
		TabList[call.id].setError(reply.message);
		tabStartTimer(call.id);
	}
});

function sab_tab(id,title) {
	var _this = this;
	this.id = id;
	this.lastStatus;
	this.lastQueue;
	this.lastHistory;
	this.refresh_timer;
	this.history_timer;

	// Last parse unformatted results stored for progress widget
	this.dlSpeed = 0;
	this.dlTimeSecs  = 0;
	this.dlPercent = 0;

	this.histLastID = '';

	this.tabHeader = $('<li><a href="#tabs-'+id+'">'+title+'</a></li>');
									 $('#tabList').append(this.tabHeader);
	this.tab = $('<div/>', {id: 'tabs-'+id}).appendTo('#tabs');
	this.tab.html($('div#sabnzbd.template').html());
	// Labels
	this.dlSpeedEle = this.tab.find('#dlSpeed');
	this.dlNameEle = this.tab.find('#dlName');
	this.dlTimeEle = this.tab.find('#dlTime');
	this.dlProgressEle = this.tab.find('#dlProgress').progressbar({value: false});
	this.dlProgressLabelEle = this.tab.find('#dlProgress-label');
	this.errorEle = this.tab.find('#error');
	// Buttons
	this.btnTogglePauseEle = this.tab.find('#togglePause').button();
	this.btnRefreshEle = this.tab.find('#refresh').button({icons:{primary: 'ui-icon-refresh'}});
	this.btnOpenEle = this.tab.find('#open').button({text:false,icons:{primary: 'ui-icon-newwin'}});
	// Menus
	this.menuEle = this.tab.find('ul#menu').menu({position: {my: 'left bottom', at: 'right bottom'}}).hide();
	this.btnTogglePauseMenuEle = this.tab.find('#toggleMenu').button({text:false,icons:{primary:'ui-icon-triangle-1-n'}});

	// Show Menu
	this.tab.find('#toggleMenu').click(function() {
		_this.menuEle.show().position({
			my: 'left bottom',
			at: 'top right',
			of: this
		});
		$(document).one('click', function() {
			_this.menuEle.hide();
		});
		return false;
	})

	// Menu Actions
	// Set speed limit
	this.btnSpeedLimit = this.tab.find('li#speedLimit').click(function() {
		$('#dialogSpeedLimit').dialog({
			autoOpen: true,
			modal: true,
			draggable: false,
			resizable: false,
			width: 150,
			position: {my: 'center', at: 'center', of: '#tabs'},
			buttons: [ {
					text: 'OK',
					click: function() {
						$(this).dialog('close');
						var speedLimit = Number($(this).find('input').val());
						self.port.emit('rpc-call',{target:'sab',id: _this.id, method:'config',params: {name:'speedlimit',value:(speedLimit == ''?0:speedLimit)},onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'});
					}
				},
				{text: 'Cancel', click: function() {$(this).dialog('close');}}
			]
		}).keypress(function(e) {
      if (e.keyCode == $.ui.keyCode.ENTER) $(this).parent().find('button:eq(1)').trigger('click');
    }).find('input').val(_this.lastStatus.queue.speedlimit).select();
	});
	// Pause for
	this.btnPauseFor5m = this.tab.find('li#pause-5m').click(function() {_this.rpcPauseFor(5)});
	this.btnPauseFor15m = this.tab.find('li#pause-15m').click(function() {_this.rpcPauseFor(15)});;
	this.btnPauseFor30m = this.tab.find('li#pause-30m').click(function() {_this.rpcPauseFor(30)});;
	this.btnPauseFor60m = this.tab.find('li#pause-60m').click(function() {_this.rpcPauseFor(60)});;
	this.btnPauseForCustom = this.tab.find('li#pause-custom').click(function() {
		$('#dialogPauseFor').dialog({
			autoOpen: true,
			modal: true,
			draggable: false,
			resizable: false,
			width: 150,
			position: {my: 'center', at: 'center', of: '#tabs'},
			buttons: [ {
					text: 'OK',
					click: function() {
						$(this).dialog('close');
						_this.rpcPauseFor(Number($(this).find('input').val()));
					}
				},
				{text: 'Cancel', click: function() {$(this).dialog('close');}}
			]
		}).keypress(function(e) {
      if (e.keyCode == $.ui.keyCode.ENTER) $(this).parent().find('button:eq(1)').trigger('click');
    }).find('input').select();
	});
	// On finish (queue)
	this.btnOnFinishNothing = this.tab.find('li#finish-nothing').click(function() {_this.rpcFinishAction('');});
	this.btnOnFinishShutdown = this.tab.find('li#finish-shutdown').click(function() {_this.rpcFinishAction('shutdown_program')});
	this.btnOnFinishScript = this.tab.find('li#finish-script').click(function() {
		var options = '';

		for (var i = 0; i < _this.lastStatus.queue.scripts.length; ++i)
			if (_this.lastStatus.queue.scripts[i].endsWith('.py') || _this.lastStatus.queue.scripts[i].endsWith('.bat'))
				options += '<option value="script_'+_this.lastStatus.queue.scripts[i]+'"'+((_this.lastStatus.queue.finishaction == 'script_'+_this.lastStatus.queue.scripts[i])?' selected':'')+'>'+_this.lastStatus.queue.scripts[i]+'</option>';

		$('#dialogFinishScript').dialog({
			autoOpen: true,
			modal: true,
			draggable: false,
			resizable: false,
			width: 300,
			position: {my: 'center', at: 'center', of: '#tabs'},
			buttons: [ {
					text: 'OK',
					click: function() {
						$(this).dialog('close');
						_this.rpcFinishAction($(this).find('select#finishScript').val());
					}
				},
				{text: 'Cancel', click: function() {$(this).dialog('close');}}
			]
		}).find('select').html(options);

	});

	// Update jQuery UI with our new DOM elements & set active tab to our newly created tab
	this.tab.find('#btnSet').buttonset();
	$('#tabs').tabs('refresh');
	$('#tabs').tabs('option', 'active', 0);

	// Pause Button Click
	this.btnTogglePauseEle.click(function() {
		self.port.emit('rpc-call',{target:'sab',id: _this.id, method:(_this.lastStatus.queue.paused?'resume':'pause'),params: {},onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'});
	});
	// Refresh Button Click
	this.btnRefreshEle.click(function() {
		_this.refreshStatus();
		// reply to 'status' will automatically trigger 'listgroups' (queue status) rpc
	});
	// Open download client webpage
	this.btnOpenEle.click(function() {
		window.open((self.options.prefs.sab_ssl?'https':'http')+'://'+self.options.prefs.sab_ip+':'+self.options.prefs.sab_port);
	});
	// Send 'queue' RPC call which contains all the info we need (labeled as Status for parity with nzbget)
	this.refreshStatus = function(refreshRate) {
		window.clearTimeout(_this.refresh_timer);
		if (refreshRate == 0) tabStartTimer(_this.id); else
		self.port.emit('rpc-call',{target:'sab',id: _this.id, method:'queue',params:{limit:5}, onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	};
	this.refreshQueue = function() {}; // Not needed for sab
	this.refreshHistory = function() {
		window.clearTimeout(_this.history_timer);
		if (self.options.prefs.dl_notifications)
			self.port.emit('rpc-call',{target:'sab',id: _this.id, method:'history',params:{limit:1}, onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	}
	this.parseStatus = function(rpc){
		this.lastStatus = rpc;
		this.dlSpeed = rpc.queue.kbpersec;
		this.dlTimeSecs  = 0;
		this.dlPercent = 0;

		var dlSpeed = rpc.queue.kbpersec+' KB/s';
		var dlTotalMB = 0;
		var dlRemainingMB = 0;
		var dlName = 'N/A';
		var dlTime = 'N/A';
		var dlPercent = 0;

		if (rpc.queue.speedlimit > 0)
			dlSpeed += ' ('+rpc.queue.speedlimit+' KB/s limit)';

		this.btnOnFinishNothing.css('color','');
		this.btnOnFinishShutdown.css('color','');
		this.btnOnFinishScript.css('color','');

		if (!rpc.queue.finishaction)
			this.btnOnFinishNothing.css('color','#FF8C00') // DarkOrange
		else
		if (rpc.queue.finishaction == 'shutdown_program')
			this.btnOnFinishShutdown.css('color','#FF8C00')
		else
		if (rpc.queue.finishaction.startsWith('script_'))
			this.btnOnFinishScript.css('color','#FF8C00');

		for (var i = 0; i < rpc.queue.slots.length; ++i)
			if (rpc.queue.slots[i].status == 'Downloading' || (rpc.queue.slots[i].status == 'Queued' && rpc.queue.paused)) { // If download is active, or first in queue while paused
				dlTime = rpc.queue.slots[i].timeleft.split(':')
				dlTime = (+dlTime[0]) * 60 * 60 + (+dlTime[1]) * 60 + (+dlTime[2])
				this.dlTimeSecs  = dlTime;
				dlName = rpc.queue.slots[i].filename+((rpc.queue.slots[i].cat != '*') ? ' ('+rpc.queue.slots[i].cat+')':'');
				dlTime = (rpc.queue.kbpersec > 0?timeToStringL(dlTime):'N/A')+' ('+rpc.queue.slots[i].sizeleft+')';
				dlPercent = Math.round(rpc.queue.slots[i].percentage);
				this.dlPercent = dlPercent;
				break
			}

		this.dlSpeedEle.text(dlSpeed);
		this.dlNameEle.text(dlName);
		this.dlTimeEle.text(dlTime);
		this.dlProgressEle.progressbar('option',{value:dlPercent});
		this.dlProgressLabelEle.text(dlPercent+'%');
		this.setPaused(rpc.queue.paused);
		doResize();
	};
	this.parseHistory = function(rpc) {
		this.history_timer = window.setTimeout(this.refreshHistory,	self.options.prefs.refresh_history*1000);
		this.lastHistory = rpc;
		log('Parsing SABnzbd+ history, items = '+rpc.history.slots.length);
		if (rpc.history.slots.length == 0) return;
		if (this.histLastID == '') {
			// First parse of history, set last ID but dont notify
			this.histLastID = rpc.history.slots[0].nzo_id;
		} else
		if (rpc.history.slots[0].nzo_id != this.histLastID && (time() - rpc.history.slots[0].completed) < 5*60 /* finished in last 5 mins */ && (rpc.history.slots[0].status == 'Completed' || rpc.history.slots[0].status == 'Failed')) {
			// Latest downloaded item nzo_id has changed. Perform notify

			var dlStatus = rpc.history.slots[0].status;
			var dlName = rpc.history.slots[0].name;
			var dlStats = rpc.history.slots[0].size+' - ';

			for (var i = 0; i < rpc.history.slots[0].stage_log.length; ++i)
				if (rpc.history.slots[0].stage_log[i].name == 'Download') {
					dlStats += rpc.history.slots[0].stage_log[i].actions[0]; // Downloaded in _ at an average of _ KB/s
				} else
				if (rpc.history.slots[0].stage_log[i].name == 'Unpack') {
					dlStats += '<br/>'+(rpc.history.slots[0].stage_log[i].actions[0].split('] ').pop()); // Extract text outside of square brackets
				}

			if (rpc.history.slots[0].fail_message != '')
				dlStats += '<br/><font color="red">'+rpc.history.slots[0].fail_message+'</font>';

			log('--- DOWNLOAD NOTIFY "'+dlName+'", finished '+(time() - rpc.history.slots[0].completed)+' seconds ago');
			self.port.emit('showNotification',['sab','Download '+dlStatus,'nzb-32-'+(dlStatus == 'Completed'?'green':'orange')+'.png',dlName,dlStats]);
			this.histLastID = rpc.history.slots[0].nzo_id;
		}

	}
	this.rpcFinishAction = function(action) {
		// Finish action is not accessible via SAB's API. So we must emulate the request through web interface
		var url = (self.options.prefs.sab_ssl?'https':'http')+'://'+self.options.prefs.sab_ip+':'+self.options.prefs.sab_port+'/queue/change_queue_complete_action?action='+action+'&session='+self.options.prefs.sab_apikey;
		var xhr = new XMLHttpRequest();
		try {
			xhr.open('post',url);
			xhr.timeout = 2000;
			xhr.send();
		}catch(e) {log('Error setting SAB finish action. '+e.message);log('Req URL: '+url);}
	}
	this.rpcPauseFor = function(mins) {
		self.port.emit('rpc-call',{target:'sab',id: _this.id, method:'config',params: {name:'set_pause',value:mins},onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'});
	}
	this.setPaused = function(isPaused) {
		this.btnTogglePauseEle.button('option',{label: isPaused?'Resume':'Pause',icons:{primary:isPaused?'ui-icon-play':'ui-icon-pause'}});
		this.btnTogglePauseEle.css('color',isPaused?'#00FF00':'#FF0000');
	};
	this.paused = function() {
		return (this.lastStatus && this.lastStatus.queue.paused);
	}
	this.active = function() {
		return (this.lastStatus && this.lastStatus.queue.kbpersec > 0);
	}
	this.setError = function(msg) {
		this.errorEle.html('<strong>'+msg+'</strong>');
	}
	this.remove = function() {
		window.clearTimeout(this.history_timer);
		window.clearTimeout(this.refresh_timer);
		this.tabHeader.remove();
		this.tab.remove();
		$('#tabs').tabs('refresh');
	}
}


function nzbg_tab(id,title) {
	var _this = this;
	this.id = id;
	this.lastStatus;
	this.lastQueue;
	this.lastHistory;
	this.refresh_timer;
	this.history_timer;

	// Last parse unformatted results stored for progress widget
	this.dlSpeed = 0;
	this.dlTimeSecs  = 0;
	this.dlPercent = 0;

	this.histLastID = '';

	this.tabHeader = $('<li><a href="#tabs-'+id+'">'+title+'</a></li>');
									 $('#tabList').append(this.tabHeader);
	this.tab = $('<div/>', {id: 'tabs-'+id}).appendTo('#tabs');
	this.tab.html($('div#nzbget.template').html());
	// Labels
	this.dlSpeedEle = this.tab.find('#dlSpeed');
	this.dlNameEle = this.tab.find('#dlName');
	this.dlTimeEle = this.tab.find('#dlTime');
	this.dlProgressEle = this.tab.find('#dlProgress').progressbar({value: false});
	this.dlProgressLabelEle = this.tab.find('#dlProgress-label');
	this.errorEle = this.tab.find('#error');
	// Buttons
	this.btnTogglePauseEle = this.tab.find('#togglePause').button();
	this.btnRefreshEle = this.tab.find('#refresh').button({icons:{primary: 'ui-icon-refresh'}});
	this.btnOpenEle = this.tab.find('#open').button({text:false,icons:{primary: 'ui-icon-newwin'}});
	// Menus
	this.menuEle = this.tab.find('ul#menu').menu({position: {my: 'left bottom', at: 'right bottom'}}).hide();
	this.btnTogglePauseMenuEle = this.tab.find('#toggleMenu').button({text:false,icons:{primary:'ui-icon-triangle-1-n'}});

	// Show Menu
	this.tab.find('#toggleMenu').click(function() {
		_this.menuEle.show().position({
			my: 'left bottom',
			at: 'top right',
			of: this
		});
		$(document).one('click', function() {
			_this.menuEle.hide();
		});
		return false;
	})

	// Menu Actions
	// Set speed limit
	this.btnSpeedLimit = this.tab.find('li#speedLimit').click(function() {
		$('#dialogSpeedLimit').dialog({
			autoOpen: true,
			modal: true,
			draggable: false,
			resizable: false,
			width: 150,
			position: {my: 'center', at: 'center', of: '#tabs'},
			buttons: [ {
					text: 'OK',
					click: function() {
						$(this).dialog('close');
						var speedLimit = Number($(this).find('input').val());
						self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'rate',params: [(speedLimit == ''?0:speedLimit)],onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'});
					}
				},
				{text: 'Cancel', click: function() {$(this).dialog('close');}}
			]
		}).keypress(function(e) {
      if (e.keyCode == $.ui.keyCode.ENTER) $(this).parent().find('button:eq(1)').trigger('click');
    }).find('input').val(_this.lastStatus.result.DownloadLimit / 1024).select();
	});
	// Pause for
	this.btnPauseFor5m = this.tab.find('li#pause-5m').click(function() {_this.rpcPauseFor(5)});
	this.btnPauseFor15m = this.tab.find('li#pause-15m').click(function() {_this.rpcPauseFor(15)});;
	this.btnPauseFor30m = this.tab.find('li#pause-30m').click(function() {_this.rpcPauseFor(30)});;
	this.btnPauseFor60m = this.tab.find('li#pause-60m').click(function() {_this.rpcPauseFor(60)});;
	this.btnPauseForCustom = this.tab.find('li#pause-custom').click(function() {
		$('#dialogPauseFor').dialog({
			autoOpen: true,
			modal: true,
			draggable: false,
			resizable: false,
			width: 150,
			position: {my: 'center', at: 'center', of: '#tabs'},
			buttons: [ {
					text: 'OK',
					click: function() {
						$(this).dialog('close');
						_this.rpcPauseFor(Number($(this).find('input').val()));
					}
				},
				{text: 'Cancel', click: function() {$(this).dialog('close');}}
			]
		}).keypress(function(e) {
      if (e.keyCode == $.ui.keyCode.ENTER) $(this).parent().find('button:eq(1)').trigger('click');
    }).find('input').select();
	});

	// Update jQuery UI with our new DOM elements & set active tab to our newly created tab
	this.tab.find('#btnSet').buttonset();
	$('#tabs').tabs('refresh');
	$('#tabs').tabs('option', 'active', 0);

	// Pause Button Click
	this.btnTogglePauseEle.click(function() {
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:(_this.lastStatus.result.DownloadPaused?'resumedownload':'pausedownload'),params: [],onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'});
	});
	// Refresh Button Click
	this.btnRefreshEle.click(function() {
		_this.refreshStatus();
		// reply to 'status' will automatically trigger 'listgroups' (queue status) rpc
	});
	// Open download client webpage
	this.btnOpenEle.click(function() {
		window.open((self.options.prefs.nzbg_ssl?'https':'http')+'://'+self.options.prefs.nzbg_ip+':'+self.options.prefs.nzbg_port);
	});
	// Send 'status' RPC call to get current download speed & paused state
	this.refreshStatus = function(refreshRate) {
		window.clearTimeout(_this.refresh_timer);
		if (refreshRate == 0) tabStartTimer(_this.id); else
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'status',params:[], onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	}
	// Send 'listgroups' RPC call to get currently active download
	this.refreshQueue = function() {
		window.clearTimeout(_this.refresh_timer);
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'listgroups',params:[5], onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	}
	this.refreshHistory = function() {
		window.clearTimeout(_this.history_timer);
		if (self.options.prefs.dl_notifications)
			self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'history',params:[false], onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	}
	this.parseStatus = function(rpc) {
		this.lastStatus = rpc;
		this.dlSpeed = Math.floor(rpc.result.DownloadRate);
		var dlSpeed = bytesToReadable(rpc.result.DownloadRate,1)+'/s';
		if (rpc.result.DownloadLimit > 0)
			dlSpeed += ' ('+bytesToReadable(rpc.result.DownloadLimit,0)+'/s limit)';
		this.dlSpeedEle.text(dlSpeed);
		this.setPaused(rpc.result.DownloadPaused);
	};
	this.parseQueue = function(rpc) {
		this.lastQueue = rpc;
//		this.dlSpeed = 0; // set in parseStatus
		this.dlTimeSecs  = 0;
		this.dlPercent = 0;

		var dlTotalMB = 0;
		var dlRemainingMB = 0;
		var dlName = 'N/A';
		var dlTime = 'N/A';
		var dlPercent = 0;

		for (var i = 0; i < rpc.result.length; ++i)
			if ((rpc.result[i].Status == 'DOWNLOADING') || (rpc.result[i].Status == 'QUEUED' && this.lastStatus.result.DownloadPaused)) { // If download is active, or first in queue while paused
				dlTotalMB = (rpc.result[i].FileSizeMB - rpc.result[i].PausedSizeMB);
				dlRemainingMB = (rpc.result[i].RemainingSizeMB - rpc.result[i].PausedSizeMB);
				dlPercent =  Math.floor((dlTotalMB - dlRemainingMB) / dlTotalMB * 100);
				this.dlPercent = dlPercent;
				dlName = rpc.result[i].NZBName+((rpc.result[i].Category != '') ? ' ('+rpc.result[i].Category+')':'');
				this.dlTimeSecs = (dlRemainingMB * 1024 / (this.dlSpeed / 1024));
				dlTime = (this.dlSpeed > 0?timeToStringL(this.dlTimeSecs):'N/A')+' ('+dlRemainingMB+' MB)';
				break;
			}

		this.dlNameEle.text(dlName);
		this.dlTimeEle.text(dlTime);
		this.dlProgressEle.progressbar('option',{value:dlPercent});
		this.dlProgressLabelEle.text(dlPercent+'%');
		doResize();
	};
	this.parseHistory = function(rpc) {
		this.history_timer = window.setTimeout(this.refreshHistory,	self.options.prefs.refresh_history*1000);
		this.lastHistory = rpc;
		log('Parsing NZBGet history, items = '+rpc.result.length);
		for (var i = 0; i < rpc.result.length; ++i) {
			var dlStatus = rpc.result[i].Status.split('/').shift();

			if (rpc.result[i].Kind == 'NZB' && (dlStatus == 'SUCCESS' || dlStatus == 'FAILURE' || dlStatus == 'WARNING')) {
				if (this.histLastID == '') {
					this.histLastID = rpc.result[i].NZBID;
					break;
				} else
				if (rpc.result[i].NZBID != this.histLastID && (time() - rpc.result[i].HistoryTime) < 5*60 /* finished in last 5 mins */) {
					// Latest downloaded item NZBID has changed. Perform notify
					var dlName = rpc.result[i].Name;
					var dlSpeed = rpc.result[i].DownloadTimeSec > 0 ? ((rpc.result[i].DownloadedSizeMB  > 1024?(rpc.result[i].DownloadedSizeMB * 1024 * 1024):rpc.result[i].DownloadedSizeLo) / rpc.result[i].DownloadTimeSec) : 0;
					var dlStats = rpc.result[i].DownloadedSizeMB+' MB - Downloaded in '+timeToStringL(rpc.result[i].DownloadTimeSec,true)+' at an average of '+bytesToReadable(dlSpeed)+'/s';
					if (rpc.result[i].UnpackTimeSec > 0)
						dlStats += '<br/>Unpacked in '+timeToStringL(rpc.result[i].UnpackTimeSec);

					if (dlStatus != 'SUCCESS')
						dlStats += '<br/><font color="red">'+nzbgStatusToString(rpc.result[i].Status)+'</font>';

					log('--- DOWNLOAD NOTIFY "'+dlName+'", finished '+(time() - rpc.result[i].HistoryTime)+' seconds ago');
					self.port.emit('showNotification',['nzbg','Download '+dlStatus,'nzb-32-'+(dlStatus == 'SUCCESS'?'green':'orange')+'.png',dlName,dlStats]);
					this.histLastID = rpc.result[i].NZBID;
				}
				break;
			}
		}
	}
	this.rpcFinishAction = function(action) {} // Not Implemented in NZBGet
	this.rpcPauseFor = function(mins) {
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'pausedownload',params: [],onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'}); // Must pause first, resume rpc will only work on already paused events
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'scheduleresume',params: [mins * 60],onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'});
	}
	this.setPaused = function(isPaused) {
		this.btnTogglePauseEle.button('option',{label: isPaused?'Resume':'Pause',icons:{primary:isPaused?'ui-icon-play':'ui-icon-pause'}});
		this.btnTogglePauseEle.css('color',isPaused?'#00FF00':'#FF0000');
	};
	this.paused = function() {
		return (this.lastStatus && this.lastStatus.result.DownloadPaused);
	}
	this.active = function() {
		return (this.lastStatus && this.lastStatus.result.DownloadRate > 0);
	}
	this.setError = function(msg) {
		this.errorEle.html('<strong>'+msg+'</strong>');
	}
	this.remove = function() {
		window.clearTimeout(this.history_timer);
		window.clearTimeout(this.refresh_timer);
		this.tabHeader.remove();
		this.tab.remove();
		$('#tabs').tabs('refresh');
	}
}

$(function() {
	$('#tabs').tabs({
		activate: doResize
	});

	$('button#showOptions').button({text:false,icons:{primary:'ui-icon-wrench'}}).click(function() {
		self.port.emit('showOptions');
	});

	onPrefChange(['theme',self.options.prefs.theme]);
	if (self.options.prefs.nzbg_enabled)
		onPrefChange(['nzbg_enabled',true]);
	if (self.options.prefs.sab_enabled)
		onPrefChange(['sab_enabled',true]);

	if (noSDK) {
		TabList[0].parseStatus(testNzbgStatus);
		TabList[0].parseQueue(testNzbgQueue);
		TabList[0].parseHistory(testNzbgetHistory);

		TabList[1].parseStatus(testSabStatus);
		TabList[1].parseHistory(testSabHistory1);

		$('#tabs').tabs('option', 'active', 1);
	}

	if (self.options.prefs.dev) $('#dev').show();
		$('#test1').click(function() {
			TabList[0].refreshHistory();
	//		TabList[1].refreshHistory();
		});
		$('#test2').click(function() {
			console.log(JSON.stringify(TabList[0].lastHistory));
		});
		$('#test3').click(function() {
			TabList[0].histLastID = 'asdf';
		});

	refreshAll(true);
	refreshIcon();
});