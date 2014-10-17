/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

 		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/
// todo: [Object object] was being passed by nzbget rpc error for invalid parameter

//////////////////////////////////////////////////////////////////////////////
var noSDK = (typeof self.port == 'undefined');

var testNzbgStatus = {"version":"1.1","result":{"RemainingSizeLo":125844603,"RemainingSizeHi":0,"RemainingSizeMB":120,"ForcedSizeLo":0,"ForcedSizeHi":0,"ForcedSizeMB":0,"DownloadedSizeLo":171300276,"DownloadedSizeHi":0,"DownloadedSizeMB":163,"ArticleCacheLo":8832000,"ArticleCacheHi":0,"ArticleCacheMB":8,"DownloadRate":687571,"AverageDownloadRate":572910,"DownloadLimit":0,"ThreadCount":15,"ParJobCount":0,"PostJobCount":0,"UrlCount":0,"UpTimeSec":13964,"DownloadTimeSec":299,"ServerPaused":false,"DownloadPaused":false,"Download2Paused":false,"ServerStandBy":false,"PostPaused":false,"ScanPaused":false,"FreeDiskSpaceLo":1667100672,"FreeDiskSpaceHi":10,"FreeDiskSpaceMB":42549,"ServerTime":1413272739,"ResumeTime":0,"FeedActive":false,"NewsServers":[{"ID":1,"Active":true},{"ID":2,"Active":true},{"ID":3,"Active":true},{"ID":4,"Active":true}]}};
var testNzbgQueue = {"version":"1.1","result":[{"FirstID":157,"LastID":157,"RemainingSizeLo":142058794,"RemainingSizeHi":0,"RemainingSizeMB":135,"PausedSizeLo":16214191,"PausedSizeHi":0,"PausedSizeMB":15,"RemainingFileCount":22,"RemainingParCount":8,"MinPostTime":1392754127,"MaxPostTime":1392754396,"MinPriority":0,"MaxPriority":0,"ActiveDownloads":8,"Status":"DOWNLOADING","NZBID":157,"NZBName":"Debian Gnu Linux 8 Jessie Testing I386-NETINSTALL","NZBNicename":"Debian Gnu Linux 8 Jessie Testing I386-NETINSTALL","Kind":"NZB","URL":"https://api.dognzb.cr/api?t=get&id=b24202c4972b1ecb49e6e32500cbb4e0&apikey=56de11ebfa80b83f6e8aaef7f74a8e5a","NZBFilename":"Debian Gnu Linux 8 Jessie Testing I386-NETINSTALL.nzb","DestDir":"/mnt/Files/Shared/Usenet/nzbget/tmp/inter/Debian Gnu Linux 8 Jessie Testing I386-NETINSTALL.#157","FinalDir":"","Category":"","ParStatus":"NONE","UnpackStatus":"NONE","MoveStatus":"NONE","ScriptStatus":"NONE","DeleteStatus":"NONE","MarkStatus":"NONE","UrlStatus":"SUCCESS","FileSizeLo":311269535,"FileSizeHi":0,"FileSizeMB":296,"FileCount":37,"TotalArticles":804,"SuccessArticles":435,"FailedArticles":0,"Health":1000,"CriticalHealth":944,"DupeKey":"","DupeScore":0,"DupeMode":"SCORE","Deleted":false,"DownloadedSizeLo":169389593,"DownloadedSizeHi":0,"DownloadedSizeMB":161,"DownloadTimeSec":231,"PostTotalTimeSec":0,"ParTimeSec":0,"RepairTimeSec":0,"UnpackTimeSec":0,"Parameters":[{"Name":"*DNZB:Details","Value":"https://dognzb.cr/details/b24202c4972b1ecb49e6e32500cbb4e0"},{"Name":"*DNZB:Failure","Value":"https://dognzb.cr/fail/b24202c4972b1ecb49e6e32500cbb4e0/56de11ebfa80b83f6e8aaef7f74a8e5a"},{"Name":"*DNZB:NFO","Value":"https://dognzb.cr/nfo/b24202c4972b1ecb49e6e32500cbb4e0"},{"Name":"*Unpack:","Value":"yes"},{"Name":"EMail.py:","Value":"yes"}],"ScriptStatuses":[],"ServerStats":[{"ServerID":1,"SuccessArticles":435,"FailedArticles":0}],"PostInfoText":"NONE","PostStageProgress":135143623,"PostStageTimeSec":0,"Log":[]}]};
var testSabStatus = {"queue":{"active_lang":"en","session":"1c7b349a03d899c8a13cf30e5737d695","slots":[{"status":"Downloading","index":0,"eta":"05:37 PM Tue 14 Oct","missing":0,"avg_age":"237d","script":"None","msgid":"","verbosity":"","mb":"296.85","sizeleft":"124 MB","filename":"Debian Gnu Linux 8 Jessie Testing I386-NETINSTALL","priority":"Normal","cat":"apps","mbleft":"123.77","timeleft":"0:03:02","percentage":"58","nzo_id":"SABnzbd_nzo_xK2b8f","has_rating":false,"unpackopts":"3","size":"297 MB"}],"speed":"696 K","size":"297 MB","rating_enable":false,"limit":5,"start":0,"diskspacetotal2":"1823.66","darwin":false,"last_warning":"","have_warnings":"0","noofslots":1,"newzbin_url":"www.newzbin2.es","pause_int":"0","categories":["*","anime","games","movies","music","private","series"],"pp_pause_event":false,"diskspacetotal1":"1823.66","mb":"296.85","newzbinDetails":true,"loadavg":"0.18 | 0.11 | 0.07 | V=389M R=181M","cache_max":"67108864","speedlimit":"","webdir":"","left_quota":"0 ","uniconfig":"/mnt/Files/Shared/Usenet/sabnzbd/interfaces/Config/templates","paused":false,"isverbose":false,"restart_req":false,"power_options":false,"helpuri":"http://wiki.sabnzbd.org/","uptime":"1d","refresh_rate":"","my_home":"/mnt/Files/Shared/Usenet/sabnzbd","version":"0.7.18","my_lcldata":"/mnt/Files/Shared/Usenet/sabnzbd","color_scheme":"white","new_release":"","nt":false,"status":"Downloading","finish":1,"cache_art":"5","paused_all":false,"finishaction":null,"sizeleft":"124 MB","quota":"0 ","cache_size":"2 MB","mbleft":"123.77","diskspace2":"41.71","diskspace1":"41.71","scripts":["None","EMail.py","nzbToAniDB.py","anidb.cfg","Logger.py"],"timeleft":"0:03:02","have_quota":false,"nzb_quota":"","eta":"05:37 PM Tue 14 Oct","kbpersec":"696.31","new_rel_url":"","queue_details":"1"}};

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
			nzbg_port: 8080,
			nzbg_user: '',
			nzbg_pass: '',

			sab_ip: '192.168.1.4',
			sab_port: 8084,
			sab_apikey: '123456',
		};
	});

}
//////////////////////////////////////////////////////////////////////////////

function log(msg) {self.port.emit('log',msg);}

function bytesToReadable(bytes,decimal) {
	var s = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	if (bytes == 0) return '0 '+s[0];
	var e = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, e)).toFixed(decimal) + ' ' + s[e];
}

function timeLeftString(secs) {
	var d = Math.floor(secs / 86400);
	var h = Math.floor((secs % 86400) / 3600);
	var m = Math.floor((secs / 60) % 60);
	var s = Math.floor(secs % 60);
	if (d > 0) return d+' day'+(d > 1?'s':'')+', '+h+' hour'+(h > 1?'s':'');
	if (h > 0) return h+' hour'+(h > 1?'s':'')+', '+m+' minute'+(m > 1?'s':'');
	if (m > 0) return m+' minute'+(m > 1?'s':'')+(m == 1 && s > 0?', '+s+' second'+(s > 1?'s':''):'');
	return s+' second'+(s > 1?'s':'');
}
function timeLeftShort(secs) {
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

function refreshAll() {
	for (var i = 0; i < TabList.length; ++i)
		if (TabList[i])
			TabList[i].refreshStatus(); //.btnRefreshEle.click(); not being called because click() closes menu
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
				dlTime = timeLeftShort(TabList[i].dlTimeSecs);
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

	// 3 sec refresh while visible/downloading, 2 mins while idle.
	TabList[call.id].refresh_timer = 	window.setTimeout(TabList[call.id].refreshStatus,(progressWidgetVisible || panelVisible)?self.options.prefs.refresh_active * 1000:self.options.prefs.refresh_idle * 1000);

	if (call.method == 'status' || call.method == 'queue') {
		TabList[call.id].parseStatus(reply);
		TabList[call.id].refreshQueue();
	} else
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
		// 3 sec refresh while visible/downloading, 2 mins while idle.
		TabList[call.id].refresh_timer = 	window.setTimeout(TabList[call.id].refreshStatus,(progressWidgetVisible || panelVisible)?self.options.prefs.refresh_active * 1000:self.options.prefs.refresh_idle * 1000);
	}
});

function sab_tab(id,title) {
	var _this = this;
	this.id = id;
	this.lastStatus;
	this.lastQueue;
	this.refresh_timer;

	// Last parse unformatted results stored for progress widget
	this.dlSpeed = 0;
	this.dlTimeSecs  = 0;
	this.dlPercent = 0;

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
	this.refreshStatus = function() {
		window.clearTimeout(_this.refresh_timer);
		self.port.emit('rpc-call',{target:'sab',id: _this.id, method:'queue',params:{start:0,limit:5}, onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	};
	this.refreshQueue = function() {}; // Not needed for sab
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
				dlTime = (rpc.queue.kbpersec > 0?timeLeftString(dlTime):'N/A')+' ('+rpc.queue.slots[i].sizeleft+')';
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
		this.btnRefreshEle.click();
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
	this.refresh_timer;

	// Last parse unformatted results stored for progress widget
	this.dlSpeed = 0;
	this.dlTimeSecs  = 0;
	this.dlPercent = 0;

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
	this.refreshStatus = function() {
		window.clearTimeout(_this.refresh_timer);
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'status',params:[], onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	}
	// Send 'listgroups' RPC call to get currently active download
	this.refreshQueue = function() {
		window.clearTimeout(_this.refresh_timer);
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'listgroups',params:[0], onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
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
				dlTime = (this.dlSpeed > 0?timeLeftString(this.dlTimeSecs):'N/A')+' ('+dlRemainingMB+' MB)';
				break;
			}

		this.dlNameEle.text(dlName);
		this.dlTimeEle.text(dlTime);
		this.dlProgressEle.progressbar('option',{value:dlPercent});
		this.dlProgressLabelEle.text(dlPercent+'%');
		doResize();
	};
	this.rpcFinishAction = function(action) {} // Not Implemented in NZBGet
	this.rpcPauseFor = function(mins) {
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'pausedownload',params: [],onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'}); // Must pause first, resume rpc will only work on already paused events
		self.port.emit('rpc-call',{target:'nzbg',id: _this.id, method:'scheduleresume',params: [mins * 60],onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure'});
		this.btnRefreshEle.click();
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
		TabList[1].parseStatus(testSabStatus);
		$('#tabs').tabs('option', 'active', 2);
	}

	refreshAll();
	refreshIcon();
});