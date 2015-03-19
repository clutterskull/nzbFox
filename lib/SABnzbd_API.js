/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

		nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/

'use strict';

const {Cu,Cc,Ci} = require('chrome');
const	fileIO = require('sdk/io/file');
const {XMLHttpRequest} = require('sdk/net/xhr');
const { merge } = require('sdk/util/object');
Cu.importGlobalProperties(['Blob']);

exports.sabAPI = (new function() {
	this.url;
	this.username;
	this.password;
	this.apiKey;
	this.connectionErrorMessage = 'Unable to connect';
	this.authErrorMessage = 'Authentication failed';
	this.timeout = 1000;

	this.call = function(method, params, onSuccess,onFailure,attachFile) {
		var _this = this;
		var result;
		var request =  merge({
			mode: method,
			apikey: this.apiKey,
			output: 'json'
		},(params ? params:{}));

		var data = Cc['@mozilla.org/files/formdata;1'].createInstance(Ci.nsIDOMFormData);
			for (let key in request)
				data.append(key,request[key]);

		if (attachFile)
			data.append('nzbfile',(new Blob([fileIO.read(attachFile,'r')],{type: 'application/x-nzb'})),fileIO.basename(attachFile));

		var xhr = new XMLHttpRequest();
		xhr.open('post',this.url,true,this.username,this.password);
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
				} else if (xhr.status == 401) { // Authentication is required
					if (onFailure) onFailure({message:_this.authErrorMessage,url: _this.url,query: request,response: xhr.responseText});
				} else { // invalid status
					if (onFailure) onFailure({message:'Error #'+xhr.status,url: _this.url,query: request,response: xhr.responseText});
				}
			} // readyState  == 4
		}
		xhr.send(data);
	}
	this.status = function(onSuccess,onFailure) {
		this.call('qstatus',null,onSuccess,onFailure);
	}
	this.pause = function(onSuccess,onFailure) {
		this.call('pause',null,onSuccess,onFailure);
	}
	this.resume = function(onSuccess,onFailure) {
		this.call('resume',null,onSuccess,onFailure);
	}

}());