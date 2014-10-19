/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/

var prefs 				= self.options.prefs;
var indexers			= self.options.indexers;
var imgNZBG 			= self.options.dataURL+'nzbget.png';
var imgNZBG_Pass	= self.options.dataURL+'nzbget_pass.png';
var imgNZBG_Fail	= self.options.dataURL+'nzbget_fail.png';
var imgSAB 				= self.options.dataURL+'sab.png';
var imgSAB_Pass 	= self.options.dataURL+'sab_pass.png';
var imgSAB_Fail 	= self.options.dataURL+'sab_fail.png';

self.port.on('nzbget-added',function(data) {
	if (data.success) {
		$('a#nzbFoxNZBGet'+data.request.id+' > img').attr('src',imgNZBG_Pass);
	} else {
		$('a#nzbFoxNZBGet'+data.request.id+' > img').attr('src',imgNZBG_Fail);
		alert('Unable to send "'+data.request.title+'" to NZBGet'+"\n"+'Message: '+data.rpc.message+"\n\n"+JSON.stringify(data.rpc.query));
	}
});
self.port.on('sabnzbd-added',function(data) {
	if (data.success) {
		$('a#nzbFoxSAB'+data.request.id+' > img').attr('src',imgSAB_Pass);
	} else {
		$('a#nzbFoxSAB'+data.request.id+' > img').attr('src',imgSAB_Fail);
		alert('Unable to send "'+data.request.title+'" to SABnzbd+'+"\n"+'Message: '+data.rpc.message+"\n\n"+JSON.stringify(data.rpc.query));
	}
});

function log(msg) {self.port.emit('log',msg);}

function getURLParameter(name,url) {
	if (!url) url = location.search;
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,""])[1].replace(/\+/g, '%20'))||null
}

function CreateButton(ID,Title,Category,URL,WrapHTML) {

	var NZBG_Ele = '';
	var SAB_Ele = '';

	if (!WrapHTML)
		WrapHTML = ['',''];

	if (prefs.nzbg_enabled) {
		var NZBG_Ele = $(WrapHTML[0]+'<a id="nzbFoxNZBGet'+ID+'" style="outline: none;padding-right: 2px" href="#" title="Send to NZBGet"><img src="'+imgNZBG+'" /></a>'+WrapHTML[1]);
		NZBG_Ele.click(function() {
			log('NZBGet Clicked = '+ID+' / '+Title+' / '+Category+' / '+URL);
			self.port.emit('nzbget-add', {id: ID,title:Title,category:Category,url:URL});
			return false;
		});
	}

	if (prefs.sab_enabled) {
		var SAB_Ele = $(WrapHTML[0]+'<a id="nzbFoxSAB'+ID+'" style="outline: none;padding-right: 2px" href="#" title="Send to SABnzbd+"><img src="'+imgSAB+'" /></a>'+WrapHTML[1]);
		SAB_Ele.click(function() {
			log('SAB Clicked = '+ID+' / '+Title+' / '+Category+' / '+URL);
			self.port.emit('sabnzbd-add', {id: ID,title:Title,category:Category,url:URL});
			return false;
		});
	}

	return $().add(NZBG_Ele).add(SAB_Ele);
}

for (let i = 0; i < indexers.length; ++i) {
	indexers[i] = indexers[i].substr(2); // remove *.
	if (window.location.hostname.endsWith(indexers[i])) {
		var domain = indexers[i];

		function eachNewznabDownload(index) {
			let thisRow = $(this).closest('tr');
			let apiURL = window.location.hostname;
			let wrapHTML = ['<div class="icon" style="display: inline">','</div>'];
			if (domain == 'dognzb.cr') apiURL = 'api.dognzb.cr';
			if (domain == 'nzbgeek.info') {
				thisRow = $(this).closest('tr.HighlightTVRow2');
				apiURL = 'api.nzbgeek.info';
			}
			if (domain == 'nzb.su') {
				apiURL = 'api.nzb.su';
			}

			let apikey = (
				document.getElementsByName('RSSTOKEN')[0] ||	// nzbs/nmatrix/oznzb/nzbsu
				document.getElementsByName('rsstoken')[0]			// dognzb/nzbgeek
			).value;
			let dlkey = $(
				$(this).find('a')[0] ||			// nzbs/nmatrix/oznzb/nzbsu (child link)
				$(this).closest('a')[0] ||	// nzbs/nmatrix/oznzb/nzbsu (parent link)
				thisRow.find('a')[0]				// dognzb
			).attr('href').split('/')[2];
			if (domain == 'nzbgeek.info') dlkey = getURLParameter('guid',$(thisRow).find('a[href*="guid="]').attr('href'));

			let Title = $(
				thisRow.find('a.title')[0] ||								// nzbs/nmatrix/oznzb/nzbgeek/nzbsu result table
				thisRow.find('a.link')[0] ||								// dognzb result table
				thisRow.find('a[href*="/details/"]')[0] ||	// nzbplanet top 24hr downloads page
				$('div#content').find('h1')[0] || 					// nzbplanet/generic details page
				$('div#infohead > h1')[0] ||								// nzbs details page
				$('h2')[0] ||																// nmatrix details page
				$('div.span12 >h3')[0] || 									// nzb.su details page
				$('div.container-index > font[size=5]')[0]	// nzbgeek details page
			).text().trim();
			let URL = window.location.protocol+'//'+apiURL+'/api?t=get&id='+dlkey+'&apikey='+apikey;

			let Cat = $(
				thisRow.find('td.less:first > a')[0] ||											// nzbs/nmatrix results table
				thisRow.find('a[href^="geekseek.php?c="]')[0] ||						// nzbgeek results table
				thisRow.find('a[href^="/browse?t="]')[0] ||									// oznzb results table
				thisRow.find('div[align=right]')[0] ||											// dognzb results table
				$('div#infohead > h2 > a')[0] || 														// nzbs details
				$('div#show1').find('a[href*="?c="]')[0] || 								// nzbgeek details
				$('div.span12 > a[href^="/browse?t="]')[0] ||								// nzb.su details page
				$('dl.dl-horizontal').find('a[href^="/browse?t="]')[0] ||		// nmatrix details
				$('table#detailstable').find('a[href^="/browse?t="]')[0]		// generic newznab details
			).text();
			if (domain == 'nzbplanet.net') Cat = (thisRow.find('td.less:first > a').attr('title') || $('table#detailstable').find('a[href^="/browse?t="]').text() || '').substr(7); // nzbplanet only shows subcat, so get Cat1>Cat2 from link title
			Cat = Cat.trim().toLowerCase().split(/[-(\s>\s)]+/); 			// newznab pages, split with " > " / "-"

			let Category = '';
			if (Cat[0] == '') Cat[0] = String(window.location.pathname).toLowerCase().split('/')[1];
			switch (Cat[0]) {
				case 'tv': Category = prefs.cat_tv; break;
				case 'movies': Category = prefs.cat_movies; break;
				case 'console': case 'games': Category = prefs.cat_games; break;
				case 'apps': case 'pc': Category = prefs.cat_apps; break;
				case 'xxx': case 'adult': Category = prefs.cat_adult; break;
				case 'music': case 'audio': Category = prefs.cat_music; break;
			}
			switch (Cat[1]) {
				case 'anime': Category = prefs.cat_anime; break;
				case 'ebook': case 'comics': Category = prefs.cat_reading; break;
			}

			let downloadButton = CreateButton(index,Title,Category,URL,wrapHTML);
			if (domain == 'dognzb.cr')
				$(downloadButton).insertBefore($(this).closest('tr').find('a.link'));
			else
				$(downloadButton).insertBefore($(this).closest('*'));
		}

		var btnSelector = '';
		if (domain == 'dognzb.cr')
			btnSelector = 'div.dog-icon-download';
		else
		if (domain == 'nzbgeek.info')
			btnSelector = 'a[href*="&api="][title="Download NZB"]';
		else
			btnSelector = 'div.icon.icon_nzb, a.icon.icon_nzb';

		if (domain == 'fanzub.com')
			$('td.file').each(function(index) {
				$(this).prepend(CreateButton(index,$(this).text(),prefs.cat_anime,$(this).find('a').prop('href')));
			});
		else
		if (domain == 'binsearch.info')
 			$('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F6F7FA"]').each(function(index) {
				let Title = ($(this).find('span.s').text().match(/"(.*?)"/) || ['','Unknown Title @ binsearch'])[1];
				let URL = window.location.protocol+'//'+domain+'/?action=nzb&'+$(this).find('input').attr('name')+'=on';
				$(this).find('input').parent().append(CreateButton(index,Title,'',URL));
 			});
		else
		$(btnSelector).each(eachNewznabDownload);

		break;
	}
}