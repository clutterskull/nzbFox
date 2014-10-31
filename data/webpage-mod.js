/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/

function log(msg) {self.port.emit('log',msg);}

function getURLParameter(name,url) {
	if (!url) url = location.search;
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,""])[1].replace(/\+/g, '%20'))||null
}

function CreateButtons(title,category,url,wrapHTML) {

	function CreateButton(type,title,category,url,wrapHTML) {
		if (!wrapHTML)
			wrapHTML = ['',''];

		function onSuccess(api) {
			$(this.ele).css('background-image','url(\''+self.options.dataURL+this.type+'-16-pass.png'+'\')');
		}
		function onFailure(api) {
			$(this.ele).css('background-image','url(\''+self.options.dataURL+this.type+'-16-fail.png'+'\')');
			alert('Unable to send NZB to download client'+"\n"+'Message: '+api.message+"\n\n"+JSON.stringify(api.query));
		}

		var result = '';

		result = $(wrapHTML[0]+'<div class="nzbFoxButton" title="Send to nzbFox"></div>'+wrapHTML[1]);
		result.css('background-image','url(\''+self.options.dataURL+type+'-16.png'+'\')');
		result.click(function() {
			log('AddURL Button Clicked = '+type+' / '+title+' / '+category+' / '+url);
			if (type == 'nzbg')
				api.call({type:type,ele:this},'append',[title+'.nzb', url, category, 0, false, false, '', 0, 'SCORE'],onSuccess,onFailure);
			else
			if (type == 'sab')
				api.call({type:type,ele:this},'addurl',{nzbname: title,name: url,cat: category},onSuccess,onFailure);

			return false;
		});

		return result;
	}

	var result = $();
	if (self.options.prefs.nzbg_enabled)
		result = result.add(CreateButton('nzbg',title,category,url,wrapHTML));
	if (self.options.prefs.sab_enabled)
		result = result.add(CreateButton('sab',title,category,url,wrapHTML));

	return result;
}

for (let i = 0; i < self.options.indexers.length; ++i) {
	self.options.indexers[i] = self.options.indexers[i].substr(2); // remove *.
	
	if (window.location.hostname.endsWith(self.options.indexers[i])) {
		var domain = self.options.indexers[i];

		function eachNewznabDownload(index) {
			let thisRow = $(this).closest('tr');
			let apiURL = window.location.hostname;
			let wrapHTML = ['',''];
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
				thisRow.find('a.nodec[href*="/details/"]')[0] || // PFMonkey music table
				thisRow.find('a.title')[0] ||								// nzbs/nmatrix/oznzb/nzbgeek/nzbsu result table
				thisRow.find('a.link')[0] ||								// dognzb result table
				thisRow.find('a[href*="/details/"]')[0] ||	// nzbplanet top 24hr downloads page
				$('div#content').find('h1')[0] || 					// nzbplanet/generic details page
				$('div#infohead > h1')[0] ||								// nzbs details page
				$('h2#detailsh1').contents()[0] ||					// PFMonkey details page
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
				$('table.detailsmid').find('a[href^="/browse?t="]')[0] ||		// PFMonkey details page
				$('table#detailstable').find('a[href^="/browse?t="]')[0]		// generic newznab details
			).text();
			if (domain == 'nzbplanet.net') Cat = (thisRow.find('td.less:first > a').attr('title') || $('table#detailstable').find('a[href^="/browse?t="]').text() || '').substr(7); // nzbplanet only shows subcat, so get Cat1>Cat2 from link title
			if (domain == 'pfmonkey.com' && Cat == '') Cat = $((thisRow.html().match(/<!--<td class="less">(.+?)<\/td>-->/i) || '')[1] || '').text(); // PFMonkey hides primary cat behind an icon and provides no title, extract from commented out newznab style row

			Cat = Cat.trim().toLowerCase().split(/[-(\s>\s)]+/); 			// newznab pages, split with " > " / "-"

			let Category = '';
			if (Cat[0] == '') Cat[0] = String(window.location.pathname).toLowerCase().split('/')[1];
			switch (Cat[0]) {
				case 'tv': Category = self.options.prefs.cat_tv; break;
				case 'movies': Category = self.options.prefs.cat_movies; break;
				case 'console': case 'games': Category = self.options.prefs.cat_games; break;
				case 'apps': case 'pc': Category = self.options.prefs.cat_apps; break;
				case 'xxx': case 'adult': Category = self.options.prefs.cat_adult; break;
				case 'music': case 'audio': Category = self.options.prefs.cat_music; break;
			}
			switch (Cat[1]) {
				case 'anime': Category = self.options.prefs.cat_anime; break;
				case 'ebook': case 'comics': Category = self.options.prefs.cat_reading; break;
			}

			let downloadButtons = CreateButtons(Title,Category,URL,wrapHTML);
			if (domain == 'dognzb.cr')
				$(downloadButtons).insertBefore($(this).closest('tr').find('a.link'));
			else
				$(downloadButtons).insertBefore($(this).closest('*'));
		}

		if (domain == 'fanzub.com')
			$('td.file').each(function(index) {
				$(this).prepend(CreateButtons($(this).text(),self.options.prefs.cat_anime,$(this).find('a').prop('href')));
			})
		else
		if (domain == 'binsearch.info')
 			$('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F6F7FA"]').each(function(index) {
				let Title = ($(this).find('span.s').text().match(/"(.*?)"/) || ['','Unknown Title @ binsearch'])[1];
				let URL = window.location.protocol+'//'+domain+'/?action=nzb&'+$(this).find('input').attr('name')+'=on';
				$(this).find('input').parent().append(CreateButtons(Title,'',URL));
 			})
		else
		if (domain == 'nzbindex.nl')
			$('tr.odd, tr.even').each(function(index) {
				let Title = $(this).find('label').text();
				if (Title.contains('" yEnc')) // Fetch title in "quotes"
					Title = Title.match(/"(.*?)"/)[1];		
				$(this).find('td:nth-child(1)').append(CreateButtons(Title,'',$(this).find('a[href*="/download/"]').attr('href')));
			})	
		else
		if (domain == 'nzbclub.com')
			$('tr.rgRow, tr.rgAltRow').each(function(index) {
				var Title = $(this).find('a.partscompletelink').text();			
				if (Title.split('"').length == 3) Title = Title.match(/"(.*?)"/)[1]; // Fetch title in "quotes"
				var URL = window.location.protocol+'//'+domain+$(this).find('a[href^="/nzb_get/"]').attr('href');
				$(this).find('td:nth-child(1)').append(CreateButtons(Title,'',URL));
			})
		else { // Newznab
			var btnSelector = '';
			if (domain == 'dognzb.cr')
				btnSelector = 'div.dog-icon-download';
			else
			if (domain == 'nzbgeek.info')
				btnSelector = 'a[href*="&api="][title="Download NZB"]';
			else
				btnSelector = 'div.icon.icon_nzb, a.icon.icon_nzb';
			
			$(btnSelector).each(eachNewznabDownload);
		}

		break;
	}
}