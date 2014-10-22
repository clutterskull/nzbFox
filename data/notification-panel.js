/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

 		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/
var noSDK = (typeof self.port == 'undefined');

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
		this.target = 'sab';
		this.title = 'Download Success';
		this.icon = 'nzb-32-green.png';
//		this.dlName = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.';
		this.dlName = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit';
		this.dlStats = '962 MB - Downloaded in 22 minutes 28 seconds at an average of 731 KB/s<br/>Unpacked in 32 seconds<br/>Unpack has failed because the password was not provided or was wrong';

		this.prefs = {
			theme: 'light',

			nzbg_ip: '192.168.1.4',
			nzbg_port: 8085,
			nzbg_user: '',
			nzbg_pass: '',

			sab_ip: '192.168.1.4',
			sab_port: 8080,
			sab_apikey: '123456'

		};
	});

}

function doResize() {
	self.port.emit('resize',{width: parseInt(window.getComputedStyle(document.documentElement).width,10),height:parseInt(window.getComputedStyle(document.documentElement).height,10)});
}

$(function() {
	$('#theme').attr('href','jquery-ui.theme.'+self.options.prefs.theme+'.min.css');

	var openLabel = 'Open Client';

	if (self.options.target == 'sab')
		openLabel = 'Open SABnzbd+';
	else
	if (self.options.target == 'nzbg')
		openLabel = 'Open NZBGet';

	$('#header').text(self.options.title);
	$('#icon').attr('src',self.options.icon);
	$('#name').text(self.options.dlName);
	$('#stats').html(self.options.dlStats);
	$('#open').text(openLabel).button({icons:{primary: 'ui-icon-newwin'}}).click(function() {
		if (self.options.target == 'sab')
			window.open((self.options.prefs.sab_ssl?'https':'http')+'://'+self.options.prefs.sab_ip+':'+self.options.prefs.sab_port);
		else
		if (self.options.target == 'nzbg')
			window.open((self.options.prefs.nzbg_ssl?'https':'http')+'://'+self.options.prefs.nzbg_ip+':'+self.options.prefs.nzbg_port);
	});

	doResize();
});