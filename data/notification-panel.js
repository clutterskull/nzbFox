/* global self, $ */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

         nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/

'use strict';

var noSDK = (typeof self.port === 'undefined');

if (noSDK) { // dummy code for when testing UI without add-on SDK
  var port = (new function () { // eslint-disable-line
    this.events = [];
    this.on = function (event, args) {
      console.log('on "' + event + '" called with ' + JSON.stringify(args));
    };
    this.emit = function (event, args) {
      console.log('emit "' + event + '" called with ' + JSON.stringify(args));
    };
  }());

  var options = (new function () { // eslint-disable-line
    this.type = 'sab';
//        this.title = 'Download Success';
//        this.icon = 'nzb-32-green.png';
//        this.name = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit';
//        this.stats = '962 MB - Downloaded in 22 minutes 28 seconds at an average of 731 KB/s<br/>Unpacked in 32 seconds<br/>Unpack has failed because the password was not provided or was wrong';

    this.title = 'Download Started';
    this.icon = 'sab-32.png';
    this.name = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit';
    this.stats = '962 MB - Category: "cat" Priority: "priority" Age: "avg_age" ';

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
  }());
}

function resize () {
  self.port.emit('resize', {width: parseInt(window.getComputedStyle(document.documentElement).width, 10), height: parseInt(window.getComputedStyle(document.documentElement).height, 10)});
}

$(function () {
  $('#theme').attr('href', 'theme.' + self.options.prefs.theme + '.css');

  var openLabel = 'Open Client';

  if (self.options.type === 'sab') {
    openLabel = 'Open SABnzbd+';
  } else if (self.options.type === 'nzbg') {
    openLabel = 'Open NZBGet';
  }

  $('#header').text(self.options.title);
  $('#icon').attr('src', self.options.icon);
  $('#name').text(self.options.name);
  $('#stats').html(self.options.stats);
  $('#open').text(openLabel)
    .button({icons: {primary: 'ui-icon-newwin'}})
    .click(function () {
      if (self.options.type === 'sab') {
        window.open(self.options.prefs.sab_url);
      } else if (self.options.type === 'nzbg') {
        window.open(self.options.prefs.nzbg_url);
      }
    });

  resize();
});
