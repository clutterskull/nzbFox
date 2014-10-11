/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 
 		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC
 
*/

//////////////////////////////////////////////////////////////////////////////
var noSDK = (typeof self.port == 'undefined');

var testNzbgStatus = {"version":"1.1","result":{"RemainingSizeLo":828218836,"RemainingSizeHi":0,"RemainingSizeMB":789,"ForcedSizeLo":0,"ForcedSizeHi":0,"ForcedSizeMB":0,"DownloadedSizeLo":3563548716,"DownloadedSizeHi":0,"DownloadedSizeMB":3398,"ArticleCacheLo":6912000,"ArticleCacheHi":0,"ArticleCacheMB":6,"DownloadRate":148720,"AverageDownloadRate":291926,"DownloadLimit":51200,"ThreadCount":17,"ParJobCount":0,"PostJobCount":0,"UrlCount":0,"UpTimeSec":116308,"DownloadTimeSec":12207,"ServerPaused":false,"DownloadPaused":false,"Download2Paused":false,"ServerStandBy":false,"PostPaused":false,"ScanPaused":false,"FreeDiskSpaceLo":1300574208,"FreeDiskSpaceHi":24,"FreeDiskSpaceMB":99544,"ServerTime":1412772640,"ResumeTime":0,"FeedActive":false,"NewsServers":[{"ID":1,"Active":true},{"ID":2,"Active":true},{"ID":3,"Active":true},{"ID":4,"Active":true}]}};
var testNzbgQueue = {"version":"1.1","result":[{"FirstID":110,"LastID":110,"RemainingSizeLo":2092439922,"RemainingSizeHi":0,"RemainingSizeMB":1995,"PausedSizeLo":2092439922,"PausedSizeHi":0,"PausedSizeMB":1995,"RemainingFileCount":48,"RemainingParCount":11,"MinPostTime":1376846000,"MaxPostTime":1376848974,"MinPriority":0,"MaxPriority":0,"ActiveDownloads":0,"Status":"PAUSED","NZBID":110,"NZBName":"([AST] Oreimo S2 Episode 14,15+16 [1080p])","NZBNicename":"([AST] Oreimo S2 Episode 14,15+16 [1080p])","Kind":"NZB","URL":"http://fanzub.com/nzb/239636","NZBFilename":"([AST] Oreimo S2 Episode 14,15+16 [1080p]).nzb","DestDir":"/mnt/Files/Shared/Usenet/nzbget/tmp/inter/([AST] Oreimo S2 Episode 14,15+16 [1080p]).#111","FinalDir":"","Category":"Anime","ParStatus":"NONE","UnpackStatus":"NONE","MoveStatus":"NONE","ScriptStatus":"NONE","DeleteStatus":"NONE","MarkStatus":"NONE","UrlStatus":"SUCCESS","FileSizeLo":2106903144,"FileSizeHi":0,"FileSizeMB":2009,"FileCount":49,"TotalArticles":5344,"SuccessArticles":37,"FailedArticles":0,"Health":1000,"CriticalHealth":871,"DupeKey":"","DupeScore":0,"DupeMode":"SCORE","Deleted":false,"DownloadedSizeLo":14473138,"DownloadedSizeHi":0,"DownloadedSizeMB":13,"DownloadTimeSec":38,"PostTotalTimeSec":0,"ParTimeSec":0,"RepairTimeSec":0,"UnpackTimeSec":0,"Parameters":[{"Name":"*Unpack:","Value":"yes"},{"Name":"nzbToAniDB.py:","Value":"yes"},{"Name":"EMail.py:","Value":"yes"}],"ScriptStatuses":[],"ServerStats":[{"ServerID":1,"SuccessArticles":37,"FailedArticles":0}],"PostInfoText":"NONE","PostStageProgress":135143623,"PostStageTimeSec":0,"Log":[]},{"FirstID":113,"LastID":113,"RemainingSizeLo":147935384,"RemainingSizeHi":0,"RemainingSizeMB":141,"PausedSizeLo":52554802,"PausedSizeHi":0,"PausedSizeMB":50,"RemainingFileCount":15,"RemainingParCount":8,"MinPostTime":1412737286,"MaxPostTime":1412737295,"MinPriority":50,"MaxPriority":50,"ActiveDownloads":8,"Status":"DOWNLOADING","NZBID":113,"NZBName":"Sons.of.Anarchy.S07E05.HDTV.x264-2HD","NZBNicename":"Sons.of.Anarchy.S07E05.HDTV.x264-2HD","Kind":"NZB","URL":"","NZBFilename":"Sons.of.Anarchy.S07E05.HDTV.x264-2HD.nzb","DestDir":"/mnt/Files/Shared/Usenet/nzbget/tmp/inter/Sons.of.Anarchy.S07E05.HDTV.x264-2HD.#113","FinalDir":"","Category":"Series","ParStatus":"NONE","UnpackStatus":"NONE","MoveStatus":"NONE","ScriptStatus":"NONE","DeleteStatus":"NONE","MarkStatus":"NONE","UrlStatus":"NONE","FileSizeLo":496411808,"FileSizeHi":0,"FileSizeMB":473,"FileCount":37,"TotalArticles":659,"SuccessArticles":459,"FailedArticles":0,"Health":1000,"CriticalHealth":880,"DupeKey":"","DupeScore":0,"DupeMode":"SCORE","Deleted":false,"DownloadedSizeLo":348456927,"DownloadedSizeHi":0,"DownloadedSizeMB":332,"DownloadTimeSec":5813,"PostTotalTimeSec":0,"ParTimeSec":0,"RepairTimeSec":0,"UnpackTimeSec":0,"Parameters":[{"Name":"*Unpack:","Value":"yes"},{"Name":"EMail.py:","Value":"yes"},{"Name":"drone","Value":"ef65aad440834c19abc6665fc1adb9a3"}],"ScriptStatuses":[],"ServerStats":[{"ServerID":1,"SuccessArticles":459,"FailedArticles":0}],"PostInfoText":"NONE","PostStageProgress":135143623,"PostStageTimeSec":0,"Log":[]},{"FirstID":114,"LastID":114,"RemainingSizeLo":410572047,"RemainingSizeHi":0,"RemainingSizeMB":391,"PausedSizeLo":52669784,"PausedSizeHi":0,"PausedSizeMB":50,"RemainingFileCount":18,"RemainingParCount":5,"MinPostTime":1412738304,"MaxPostTime":1412738337,"MinPriority":50,"MaxPriority":50,"ActiveDownloads":0,"Status":"QUEUED","NZBID":114,"NZBName":"Chicago.Fire.S03E03.HDTV.x264-LOL","NZBNicename":"Chicago.Fire.S03E03.HDTV.x264-LOL","Kind":"NZB","URL":"","NZBFilename":"Chicago.Fire.S03E03.HDTV.x264-LOL.nzb","DestDir":"/mnt/Files/Shared/Usenet/nzbget/tmp/inter/Chicago.Fire.S03E03.HDTV.x264-LOL.#114","FinalDir":"","Category":"Series","ParStatus":"NONE","UnpackStatus":"NONE","MoveStatus":"NONE","ScriptStatus":"NONE","DeleteStatus":"NONE","MarkStatus":"NONE","UrlStatus":"NONE","FileSizeLo":410572047,"FileSizeHi":0,"FileSizeMB":391,"FileCount":18,"TotalArticles":1046,"SuccessArticles":0,"FailedArticles":0,"Health":1000,"CriticalHealth":852,"DupeKey":"","DupeScore":0,"DupeMode":"SCORE","Deleted":false,"DownloadedSizeLo":0,"DownloadedSizeHi":0,"DownloadedSizeMB":0,"DownloadTimeSec":0,"PostTotalTimeSec":0,"ParTimeSec":0,"RepairTimeSec":0,"UnpackTimeSec":0,"Parameters":[{"Name":"*Unpack:","Value":"yes"},{"Name":"EMail.py:","Value":"yes"},{"Name":"drone","Value":"de44103d24ae42778b0bf708dd537873"}],"ScriptStatuses":[],"ServerStats":[],"PostInfoText":"NONE","PostStageProgress":135143623,"PostStageTimeSec":0,"Log":[]},{"FirstID":115,"LastID":115,"RemainingSizeLo":432403081,"RemainingSizeHi":0,"RemainingSizeMB":412,"PausedSizeLo":57467090,"PausedSizeHi":0,"PausedSizeMB":54,"RemainingFileCount":19,"RemainingParCount":5,"MinPostTime":1412740955,"MaxPostTime":1412740981,"MinPriority":50,"MaxPriority":50,"ActiveDownloads":0,"Status":"QUEUED","NZBID":115,"NZBName":"Marvels.Agents.of.S.H.I.E.L.D.S02E03.PROPER.HDTV.XviD-EVO","NZBNicename":"Marvels.Agents.of.S.H.I.E.L.D.S02E03.PROPER.HDTV.XviD-EVO","Kind":"NZB","URL":"","NZBFilename":"Marvels.Agents.of.S.H.I.E.L.D.S02E03.PROPER.HDTV.XviD-EVO.nzb","DestDir":"/mnt/Files/Shared/Usenet/nzbget/tmp/inter/Marvels.Agents.of.S.H.I.E.L.D.S02E03.PROPER.HDTV.XviD-EVO.#115","FinalDir":"","Category":"Series","ParStatus":"NONE","UnpackStatus":"NONE","MoveStatus":"NONE","ScriptStatus":"NONE","DeleteStatus":"NONE","MarkStatus":"NONE","UrlStatus":"NONE","FileSizeLo":432403081,"FileSizeHi":0,"FileSizeMB":412,"FileCount":19,"TotalArticles":1102,"SuccessArticles":0,"FailedArticles":0,"Health":1000,"CriticalHealth":846,"DupeKey":"","DupeScore":0,"DupeMode":"SCORE","Deleted":false,"DownloadedSizeLo":0,"DownloadedSizeHi":0,"DownloadedSizeMB":0,"DownloadTimeSec":0,"PostTotalTimeSec":0,"ParTimeSec":0,"RepairTimeSec":0,"UnpackTimeSec":0,"Parameters":[{"Name":"*Unpack:","Value":"yes"},{"Name":"EMail.py:","Value":"yes"},{"Name":"drone","Value":"baf57e4cb02b4448a8c436217afafb7d"}],"ScriptStatuses":[],"ServerStats":[],"PostInfoText":"NONE","PostStageProgress":135143623,"PostStageTimeSec":0,"Log":[]}]};
var testSabStatus = {"queue":{"active_lang":"en","session":"1c7b349a03d899c8a13cf30e5737d695","slots":[{"status":"Downloading","index":0,"eta":"01:07 AM Thu 09 Oct","missing":0,"avg_age":"416d","script":"None","msgid":"","verbosity":"","mb":"707.88","sizeleft":"297 MB","filename":"Oreimo S2","priority":"Normal","cat":"anime","mbleft":"297.45","timeleft":"01:07:30","percentage":"57","nzo_id":"SABnzbd_nzo_XBKl4_","has_rating":false,"unpackopts":"3","size":"708 MB"}],"speed":"723 K","size":"708 MB","rating_enable":false,"limit":5,"start":0,"diskspacetotal2":"1823.66","darwin":false,"last_warning":"","have_warnings":"0","noofslots":1,"newzbin_url":"www.newzbin2.es","pause_int":"0","categories":["*","anime","games","movies","music","private","series"],"pp_pause_event":false,"diskspacetotal1":"1823.66","mb":"707.88","newzbinDetails":true,"loadavg":"0.19 | 0.15 | 0.10 | V=336M R=130M","cache_max":"67108864","speedlimit":"500","webdir":"","left_quota":"0 ","uniconfig":"/mnt/Files/Shared/Usenet/sabnzbd/interfaces/Config/templates","paused":false,"isverbose":false,"restart_req":false,"power_options":false,"helpuri":"http://wiki.sabnzbd.org/","uptime":"7d","refresh_rate":"","my_home":"/mnt/Files/Shared/Usenet/sabnzbd","version":"0.7.18","my_lcldata":"/mnt/Files/Shared/Usenet/sabnzbd","color_scheme":"white","new_release":"","nt":false,"status":"Downloading","finish":1,"cache_art":"33","paused_all":false,"finishaction":null,"sizeleft":"297 MB","quota":"0 ","cache_size":"20 MB","mbleft":"297.45","diskspace2":"96.85","diskspace1":"96.85","scripts":["None","EMail.py","nzbToAniDB.py","anidb.cfg","Logger.py"],"timeleft":"0:07:01","have_quota":false,"nzb_quota":"","eta":"01:07AM Thu 09 Oct","kbpersec":"723.31","new_rel_url":"","queue_details":"0"}};

var refreshFreq = 5 * 60 * 1000; // 5 minutes
var refreshAll_timer;
var TabList = [];

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
			nzbg_enabled: true,
			sab_enabled: false,
			
			nzbg_ip: '192.168.1.4',
			nzbg_port: 8080,
			nzbg_user: '',
			nzbg_pass: '',
			
			
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

function refreshAll() {
	window.clearTimeout(refreshAll_timer);
	for (var i = 0; i < TabList.length; ++i)
		if (TabList[i])
			TabList[i].btnRefreshEle.click();
	refreshAll_timer = window.setTimeout(refreshAll,refreshFreq);
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
	// Reset auto-refresh timer to 3 seconds
	refreshFreq = 3 * 1000;
	refreshAll();
});
self.port.on('hide',function() {
	// Reset auto-refresh timer to 5 minutes
	window.clearTimeout(refreshAll_timer);
	refreshFreq = 5 * 60 * 1000;
	refreshAll_timer = window.setTimeout(refreshAll,refreshFreq);
});
self.port.on('rpc-call-success',function({call,reply}) {
	log('rpc-call-success '+JSON.stringify(call)+' / '+JSON.stringify(reply));
	if (!TabList[call.id]) return;
	TabList[call.id].setError('');
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
	if (TabList[call.id])
		TabList[call.id].setError(reply.message);
});

function sab_tab(id,title) {
	var _this = this;
	this.id = id;
	this.lastStatus;

	this.tabHeader = $('<li><a href="#tabs-'+id+'">'+title+'</a></li>'); //.insertBefore('#tabList > li:last');
									 $('#tabList').append(this.tabHeader);
	this.tab = $('<div/>', {id: 'tabs-'+id}).appendTo('#tabs');
	this.tab.html(
		'<b>Speed:</b> <div id="dlSpeed" class="nzbFox"></div><br/>'+
		'<b>Downloading:</b> <div id="dlName" class="nzbFox"></div><br/>'+
		'<b>Remaining:</b> <div id="dlTime" class="nzbFox"></div><br/>'+
		'<div id="dlProgress" class="ui-progressbar"><div id="dlProgress-label" class="ui-progressbar-label"></div></div><br/>'+
		'<button id="togglePause">...</button>'+
		'<button id="refresh">Refresh</button>'+
		'<div id="error" class="nzbFox"></div>'+
		'<button id="open" style="float: right">&nbsp;</button>'+
		''
	);
	this.dlSpeedEle = this.tab.find('#dlSpeed');
	this.dlNameEle = this.tab.find('#dlName');
	this.dlTimeEle = this.tab.find('#dlTime');
	this.dlProgressEle = this.tab.find('#dlProgress').progressbar({value: false});
	this.dlProgressLabelEle = this.tab.find('#dlProgress-label');
	this.btnTogglePauseEle = this.tab.find('#togglePause').button();
	this.btnRefreshEle = this.tab.find('#refresh').button({icons:{primary: 'ui-icon-refresh'}});
	this.btnOpenEle = this.tab.find('#open').button({text:false,icons:{primary: 'ui-icon-newwin'}});
	this.errorEle = this.tab.find('#error');
	
	// Update jQuery UI with our new DOM elements & set active tab to our newly created tab
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
		self.port.emit('rpc-call',{target:'sab',id: this.id, method:'queue',params:{start:0,limit:5}, onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	};
	this.refreshQueue = function() {}; // Not needed for sab
	this.parseStatus = function(rpc){
		this.lastStatus = rpc;
		
		var dlSpeed = rpc.queue.kbpersec+' KB/s';
		var dlTotalMB = 0;
		var dlRemainingMB = 0;
		var dlName = 'N/A';
		var dlTime = 'N/A';
		var dlPercent = 0;
		
		if (rpc.queue.speedlimit > 0)
			dlSpeed += ' ('+rpc.queue.speedlimit+' KB/s limit)';

		for (var i = 0; i < rpc.queue.slots.length; ++i)
			if (rpc.queue.slots[i].status == 'Downloading' || (rpc.queue.slots[i].status == 'Queued' && rpc.queue.paused)) { // If download is active, or first in queue while paused
				dlTime = rpc.queue.slots[i].timeleft.split(':')
				dlTime = (+dlTime[0]) * 60 * 60 + (+dlTime[1]) * 60 + (+dlTime[2])
				dlName = rpc.queue.slots[i].filename+((rpc.queue.slots[i].cat != '*') ? ' ('+rpc.queue.slots[i].cat+')':'');
				dlTime = (rpc.queue.kbpersec > 0?timeLeftString(dlTime):'N/A')+' ('+rpc.queue.slots[i].sizeleft+')';
				dlPercent = Math.round(rpc.queue.slots[i].percentage);
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
	this.setPaused = function(isPaused){
		this.btnTogglePauseEle.button('option',{label: isPaused?'Resume':'Pause',icons:{primary:isPaused?'ui-icon-play':'ui-icon-pause'}});
		this.btnTogglePauseEle.css('color',isPaused?'#00FF00':'#FF0000');
	};
	this.setError = function(msg) {
		this.errorEle.html('<strong>'+msg+'</strong>');
	}
	this.remove = function() {
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

	this.tabHeader = $('<li><a href="#tabs-'+id+'">'+title+'</a></li>'); //.insertBefore('#tabList > li:last');
									 $('#tabList').append(this.tabHeader);
	this.tab = $('<div/>', {id: 'tabs-'+id}).appendTo('#tabs');
	this.tab.html(
		'<b>Speed:</b> <div id="dlSpeed" class="nzbFox"></div><br/>'+
		'<b>Downloading:</b> <div id="dlName" class="nzbFox"></div><br/>'+
		'<b>Remaining:</b> <div id="dlTime" class="nzbFox"></div><br/>'+
		'<div id="dlProgress" class="ui-progressbar"><div id="dlProgress-label" class="ui-progressbar-label"></div></div><br/>'+
		'<button id="togglePause">...</button>'+
		'<button id="refresh">Refresh</button>'+
		'<div id="error" class="nzbFox"></div>'+
		'<button id="open" style="float: right">&nbsp;</button>'+
		''
	);
	this.dlSpeedEle = this.tab.find('#dlSpeed');
	this.dlNameEle = this.tab.find('#dlName');
	this.dlTimeEle = this.tab.find('#dlTime');
	this.dlProgressEle = this.tab.find('#dlProgress').progressbar({value: false});
	this.dlProgressLabelEle = this.tab.find('#dlProgress-label');
	this.btnTogglePauseEle = this.tab.find('#togglePause').button();
	this.btnRefreshEle = this.tab.find('#refresh').button({icons:{primary: 'ui-icon-refresh'}});
	this.btnOpenEle = this.tab.find('#open').button({text:false,icons:{primary: 'ui-icon-newwin'}});
	this.errorEle = this.tab.find('#error');

	// Update jQuery UI with our new DOM elements & set active tab to our newly created tab
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
		self.port.emit('rpc-call',{target:'nzbg',id: this.id, method:'status',params:[], onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	}
	// Send 'listgroups' RPC call to get currently active download
	this.refreshQueue = function() {
		self.port.emit('rpc-call',{target:'nzbg',id: this.id, method:'listgroups',params:[0], onSuccess: 'rpc-call-success',onFailure: 'rpc-call-failure' });
	}
	this.parseStatus = function(rpc) {
		this.lastStatus = rpc;
		var dlSpeed = bytesToReadable(rpc.result.DownloadRate,1)+'/s';
		if (rpc.result.DownloadLimit > 0)
			dlSpeed += ' ('+bytesToReadable(rpc.result.DownloadLimit,0)+'/s limit)';
		this.dlSpeedEle.text(dlSpeed);
		this.setPaused(rpc.result.DownloadPaused);
	};
	this.parseQueue = function(rpc) {
		this.lastQueue = rpc;

		var dlTotalMB = 0;
		var dlRemainingMB = 0;
		var dlName = 'N/A';
		var dlTime = 'N/A';
		var dlPercent = 0;
		
		for (var i = 0; i < rpc.result.length; ++i)
			if ((rpc.result[i].Status == 'DOWNLOADING') || (rpc.result[i].Status == 'QUEUED' && this.lastStatus.result.DownloadPaused)) { // If download is active, or first in queue while paused
				dlTotalMB = (rpc.result[i].FileSizeMB - rpc.result[i].PausedSizeMB);
				dlRemainingMB = (rpc.result[i].RemainingSizeMB - rpc.result[i].PausedSizeMB);
				dlPercent =  Math.round((dlTotalMB - dlRemainingMB) / dlTotalMB * 100);
				dlName = rpc.result[i].NZBName+((rpc.result[i].Category != '') ? ' ('+rpc.result[i].Category+')':'');
				dlTime = (this.lastStatus.result.DownloadRate > 0?timeLeftString((dlRemainingMB * 1024 / (this.lastStatus.result.DownloadRate / 1024))):'N/A')+' ('+dlRemainingMB+' MB)';
				break;
			}

		this.dlNameEle.text(dlName);
		this.dlTimeEle.text(dlTime);
		this.dlProgressEle.progressbar('option',{value:dlPercent});
		this.dlProgressLabelEle.text(dlPercent+'%');
		doResize();
	};
	this.setPaused = function(isPaused) {
		this.btnTogglePauseEle.button('option',{label: isPaused?'Resume':'Pause',icons:{primary:isPaused?'ui-icon-play':'ui-icon-pause'}});
		this.btnTogglePauseEle.css('color',isPaused?'#00FF00':'#FF0000');

	};
	this.setError = function(msg) {
		this.errorEle.html('<strong>'+msg+'</strong>');
	}
	this.remove = function() {
		this.tabHeader.remove();
		this.tab.remove();
		$('#tabs').tabs('refresh');
	}
}

$(function() {
	$('#tabs').tabs({
		activate: doResize
	});

	if (self.options.prefs.nzbg_enabled)
		onPrefChange(['nzbg_enabled',true]);
	if (self.options.prefs.sab_enabled)
		onPrefChange(['sab_enabled',true]);

//	if (noSDK) {
//		TabList[0].parseStatus(testNzbgStatus);
//		TabList[0].parseQueue(testNzbgQueue);
//		TabList[1].parseStatus(testSabStatus);
//		$('#tabs').tabs('option', 'active', 2);
//	}

	refreshAll();
});