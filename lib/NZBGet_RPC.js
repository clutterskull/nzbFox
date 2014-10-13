/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/

'use strict';

const	fileIO = require('sdk/io/file');
const {XMLHttpRequest} = require('sdk/net/xhr');

exports.nzbgRPC = (new function() {
	this.url;
	this.connectionErrorMessage = 'Unable to connect to NZBGet';
	this.timeout = 1000;

	this.call = function(method, params /* array on NZBGet */, onSuccess,onFailure) {
		var _this = this;
		var result;
		var request =  {
			nocache: new Date().getTime(),
			method: method,
			params: (params ? params: [])
		};

		var data = JSON.stringify(request);
		var xhr = new XMLHttpRequest();
		xhr.open('post',this.url);
		xhr.timeout = this.timeout;

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					try {
						result = JSON.parse(xhr.responseText);
					} catch(e) {
						if (onFailure) onFailure({message:e.message,url: _this.url,query: request,response: xhr.responseText});
					}
					if (result && result.error == null) {
						if (onSuccess) onSuccess(result);
					} else {
						if (onFailure) onFailure({message:result.error,url: _this.url,query: request,response: xhr.responseText});
					}
				} else if (xhr.status == 0) { // connection failed
					if (onFailure) onFailure({message:_this.connectionErrorMessage,url: _this.url,query: request,response: xhr.responseText});
				} else { // invalid status
					if (onFailure) onFailure({message:'Error #'+xhr.status,url: _this.url,query: request,response: xhr.responseText});
				}
			} // readyState  == 4
		}
		xhr.send(data);
	}
	this.status = function(onSuccess,onFailure) {
		this.call('status',null,onSuccess,onFailure);
	}
	this.pause = function(onSuccess,onFailure) {
		this.call('pausedownload',null,onSuccess,onFailure);
	}
	this.resume = function(onSuccess,onFailure) {
		this.call('resumedownload',null,onSuccess,onFailure);
	}

}());