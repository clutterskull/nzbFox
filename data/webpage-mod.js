/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/

function onScriptAttached([prefs]) {
	self.options.prefs = prefs;
	injectButtons();
}
self.port.on('scriptAttached',onScriptAttached);

function log(msg) {self.port.emit('log',msg);}

function getURLParameter(name,url) {
	if (!url) url = location.search;
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,""])[1].replace(/\+/g, '%20'))||null
}

function CreateButtons(title,category,password,url,wrapHTML) {

	function CreateButton(type,title,category,password,url,wrapHTML) {
		if (!wrapHTML)
			wrapHTML = ['',''];
		if (title.indexOf('{{'+password+'}}') >= 0) password = ''; // Password is already in NZB title, do not append it

		function onSuccess(api) {
			$(this.ele).css('background-image','url(\''+self.options.dataURL+'images/'+this.type+'-16-pass.png'+'\')');
		}
		function onFailure(api) {
			$(this.ele).css('background-image','url(\''+self.options.dataURL+'images/'+this.type+'-16-fail.png'+'\')');
			alert('Unable to send NZB to download client'+"\n"+'Message: '+api.message+"\n\n"+JSON.stringify(api.query));
		}

		var result = '';
		result = $(wrapHTML[0]+'<div class="nzbFoxButton icon" title="Send to nzbFox ('+category+')"></div>'+wrapHTML[1]);
		result.css('background-image','url(\''+self.options.dataURL+'images/'+type+'-16.png'+'\')');
		result.click(function() {
			log('AddURL Button Clicked = '+type+' / '+title+' / '+category+' / '+password+' / '+url);
			if (type == 'nzbg')
				api.call({type:type,ele:this},'append',[title+(password != ''?'{{'+password+'}}':'')+'.nzb', url, category, 0, false, false, '', 0, 'SCORE'],onSuccess,onFailure);
			else
			if (type == 'sab')
				api.call({type:type,ele:this},'addurl',{nzbname: title+(password != ''?'{{'+password+'}}':''),name: url,cat: category},onSuccess,onFailure);

			return false;
		});

		return result;
	}

	var result = $();
	if (self.options.prefs.nzbg_enabled)
		result = result.add(CreateButton('nzbg',title,category,password,url,wrapHTML));
	if (self.options.prefs.sab_enabled)
		result = result.add(CreateButton('sab',title,category,password,url,wrapHTML));

	return result;
}

function injectButtons() {
	for (let i = 0; i < self.options.indexers.length; ++i) {
		self.options.indexers[i] = self.options.indexers[i].substr(2); // remove *.

		if (window.location.hostname.endsWith(self.options.indexers[i])) {
			let domain = self.options.indexers[i];
			let apiURL = '';
			let apikey = '';

			function eachNewznabDownload(index) {
				let thisRow = $(this).closest('tr');
				if (domain == 'nzbgeek.info') thisRow = $(this).closest('tr.HighlightTVRow2');
				let wrapHTML = ['',''];
				let dlURL = $(
					$(this).find('a')[0] ||			// nzbs/nmatrix/oznzb/nzbsu (child link)
					$(this).closest('a')[0] ||	// nzbs/nmatrix/oznzb/nzbsu (parent link)
					thisRow.find('a')[0]				// dognzb
				).attr('href');
				dlkey = dlURL.match(/[a-f0-9]{32}/i);
				if (domain == 'nzbgeek.info') dlkey = getURLParameter('guid',$(thisRow).find('a[href*="guid="]').attr('href'));
				Password = dlURL.match(/(?:%7B%7B|\{\{)(.*)(?:%7D%7D|\}\})/); // fetch password between {{password}} or %7B%7Bpassword%7D%7D in URL
				if (Password != null) Password = unescape(Password[1]); else Password = ''; // Password is either an array or null

				let Title = $(
					thisRow.find('a.nodec[href*="/details/"]')[0] ||					 // PFMonkey music table
					thisRow.find('a.title')[0] ||															// nzbs/nmatrix/oznzb/nzbgeek/nzbsu result table
					thisRow.find('a.link')[0] ||															// dognzb result table
					thisRow.find('a[href*="/details/"]')[0] ||								// nzbplanet top 24hr downloads page
					$('div#content').find('h1')[0] || 												// nzbplanet/generic details page
					$('div#infohead > h1')[0] ||															// nzbs details page
					$('h2#detailsh1').contents()[0] ||												// PFMonkey details page
					$(this).closest('div.library-show').find('a.title')[0] ||	// newz-complex poster wall homepage
					$('h2')[0] ||																							// nmatrix details page
					$('div.span12 >h3')[0] || 																// nzb.su details page
					$('div.container-index > font[size=5]')[0]								// nzbgeek details page
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
					$('table#detailstable').find('a[href*="/browse?t="]')[0]		// generic newznab details (* to handle subdir newznab installs)
				).text();
				if (domain == 'nzbplanet.net') Cat = (thisRow.find('td.less:first > a').attr('title') || $('table#detailstable').find('a[href^="/browse?t="]').text() || '').substr(7); // nzbplanet only shows subcat, so get Cat1>Cat2 from link title
				if (domain == 'pfmonkey.com' && Cat == '') Cat = $((thisRow.html().match(/<!--<td class="less">(.+?)<\/td>-->/i) || '')[1] || '').text(); // PFMonkey hides primary cat behind an icon and provides no title, extract from commented out newznab style row

				Cat = Cat.trim().toLowerCase().split(/[-(\s>\s)]+/); 			// newznab pages, split with " > " / "-"

				let Category = '';
				if (Cat[0] == '') Cat[0] = String(window.location.pathname).toLowerCase().split('/')[1];
				switch (Cat[0]) {
					case 'tv': Category = self.options.prefs.cat_tv; break;
					case 'movies': Category = self.options.prefs.cat_movies; break;
					case 'console': case 'games': case 'gaming': Category = self.options.prefs.cat_games; break;
					case 'apps': case 'pc': Category = self.options.prefs.cat_apps; break;
					case 'xxx': case 'adult': Category = self.options.prefs.cat_adult; break;
					case 'music': case 'audio': Category = self.options.prefs.cat_music; break;
					case 'books': Category = self.options.prefs.cat_reading; break;
				}
				switch (Cat[1]) {
					case 'anime': Category = self.options.prefs.cat_anime; break;
					case 'comics': Category = self.options.prefs.cat_comics; break;
					case 'ebook': Category = self.options.prefs.cat_reading; break;
					case 'games': case 'gaming': Category = self.options.prefs.cat_games; break;
				}

				let downloadButtons = CreateButtons(Title,Category,Password,URL,wrapHTML);
				if (domain == 'dognzb.cr')
					$(downloadButtons).insertBefore($(this).closest('tr').find('a.link'));
				else
					$(downloadButtons).insertBefore($(this).closest('*'));
			}

			if (domain == 'animenzb.com')
				$('td.file').each(function(index) {
					$(this).prepend(CreateButtons($(this).text(),self.options.prefs.cat_anime,'',$(this).find('a').prop('href')));
				})
			else
			if (domain == 'binsearch.info')
	 			$('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F6F7FA"]').each(function(index) {
					let Title = ($(this).find('span.s').text().match(/"(.*?)"/) || ['','Unknown Title @ binsearch'])[1];
					let URL = window.location+'&action=nzb&'+$(this).find('input').attr('name')+'=on';
					$(this).find('input').parent().append(CreateButtons(Title,'','',URL));
	 			})
			else
			if (domain == 'nzbindex.nl' || domain == 'nzbindex.com')
				$('tr.odd, tr.even').each(function(index) {
					let Title = $(this).find('label').text();
					if (Title.endsWith(' yEnc')) // Fetch title in "quotes"
						Title = Title.match(/"(.*?)"/)[1];
					$(this).find('td:nth-child(1)').append(CreateButtons(Title,'','',$(this).find('a[href*="/download/"]').attr('href')));
				})
			else
			if (domain == 'nzbclub.com')
				$('div.media > div.row').each(function(index) {
					var Title = $(this).find('a.text-primary').text();
					if (Title.split('"').length == 3) Title = Title.match(/"(.*?)"/)[1]; // Fetch title in "quotes"
					var URL = window.location.protocol+'//'+domain+'/nzb_get/'+encodeURIComponent($(this).find('button#get').parent().parent().attr('collectionid'));
					$(this).find('button#get').parent().append(CreateButtons(Title,'','',URL));
				})
			else { // Newznab
				var btnSelector = '';
				if (domain == 'dognzb.cr') btnSelector = 'div.dog-icon-download'; else
				if (domain == 'nzbgeek.info') btnSelector = 'a[href*="&api="][title="Download NZB"]'; else
					btnSelector = 'div.icon.icon_nzb, a.icon.icon_nzb';

				if (domain == 'dognzb.cr') apiURL = 'api.dognzb.cr'; else
				if (domain == 'nzbgeek.info') apiURL = 'api.nzbgeek.info'; else
				if (domain == 'nzb.su') apiURL = 'api.nzb.su'; else
				if (domain == 'oznzb.com') apiURL = 'api.oznzb.com'; else
				if (domain == 'nzbplanet.net') apiURL = 'api.nzbplanet.net'; else
					apiURL = window.location.hostname;
				apiURL = apiURL + (typeof unsafeWindow === 'undefined' ? (window.WWW_TOP !== undefined ? window.WWW_TOP:'') : (unsafeWindow.WWW_TOP !== undefined ? unsafeWindow.WWW_TOP:''));

				apikey = (
					document.getElementsByName('RSSTOKEN')[0] ||	// nzbs/nmatrix/oznzb/nzbsu
					document.getElementsByName('rsstoken')[0]		// dognzb/nzbgeek
				).value;


				$(btnSelector).each(eachNewznabDownload);
			}

			break;
		}
	}
}