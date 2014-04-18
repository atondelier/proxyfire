"use strict";

require('colors');

//TODO: no encoding hard coding !!
var encoding = 'utf8';

/**
 * ProxiedRequest
 * @constructor
 */
function ProxiedRequest(req, res, proxy, originalHost, host, port) {
    if(!this) return new ProxiedRequest(req, res, proxy, originalHost, host, port);

    this.req = req;
    this.res = res;
    this.proxy = proxy;
    this.originalHost = originalHost;
    this.host = host;
    this.port = port;

    this._isJson = false;
    this._replaceHost = false;
    this._oldWriteHead = null;
    this._oldWrite = null;
    this._oldEnd = null;
}

ProxiedRequest.prototype.replaceHostWithLocalhost = function replaceHostWithLocalhost(str, requestHost, port) {
    var newHost = this.originalHost.match(/[^:]+/)[0];
    requestHost = requestHost || this.host;
    port = port || this.port;
    var regexp = new RegExp(requestHost.replace(/\./g, '\\.'), 'g');
    var replacement = newHost + ':' + port;
    var newStr = str.replace(regexp, replacement);
    if(this._isJson) {
        var matches = str.match(regexp);
        console.log(matches ? 'domain matches found for '+requestHost+': ' + matches.length : 'no domain matches found for '+requestHost);
    }
    return newStr;
};

ProxiedRequest.prototype.getHost = function getHost() {
    return this.req.connection.remoteAddress;
};

ProxiedRequest.prototype.getUrl = function getUrl() {
    return this.req.url;
};

ProxiedRequest.prototype.overrideWriteHead = function overrideWriteHead() {

    var self = this,
        req = this.req,
        res = this.res;

    self._oldWriteHead = res.writeHead;
    res.writeHead = function(statusCode, headers) {
        var location = res.getHeader('location');
        res._headArguments = arguments;
        if(location) {
            var newLocation = self.replaceHostWithLocalhost(location);
            console.log('redirection to "'+location.red+'" was replaced with relocation to "'+newLocation.blue+'" (may be the same)');
            res._newLocation = newLocation;
        }
        var isImage = self.isImage();
        var accept = req.headers.accept;
        if(accept && (~accept.search('text/html') || (accept == '*/*' && !isImage))) {
            console.log('text/html document'.blue, accept.yellow);
            self._replaceHost = true;
        } else if(accept && ~accept.search('application/json')) {
            console.log('application/json document'.blue, accept.yellow);
            self._replaceHost = true;
            self._isJson = true;
        } else if(!location) return self._oldWriteHead.apply(res, arguments);
    };

    return this;
};

ProxiedRequest.prototype.imageRegExp = /(png|jpg|jpeg|gif)$/;

ProxiedRequest.prototype.isImage = function isImage() {
    var url = this.getUrl();
    console.log(url, this.imageRegExp.test(url));
    return this.imageRegExp.test(url);
};

ProxiedRequest.prototype.overrideWrite = function overrideWriteHead() {

    var self = this,
        res = this.res;

    this._content = [];
    self._oldWrite = res.write;
    res.write = function(data) {
        if(self._replaceHost || res._newLocation) {
            var str = data.toString(encoding);
            self._content.push(str);
        } else return self._oldWrite.apply(res, arguments);
    };

    return this;
};

ProxiedRequest.prototype.overrideEnd = function overrideWriteHead() {

    var self = this,
        res = this.res;

    self._oldEnd = res.end;
    res.end = function(data) {
        var newData;
        if(self._replaceHost || res._newLocation) {
            if(self._replaceHost) {
                newData = new Buffer(self.replaceHostWithLocalhost(self._content.join('')), encoding);
            }
            if(res._newLocation) {
                newData = new Buffer(self._content.join(''), encoding);
                res.setHeader('location', res._newLocation);
            }
            res.setHeader('Content-Length', newData.length);
            self._oldWriteHead.apply(res, res._headArguments);
            self._oldWrite.call(res, newData);
            self._oldEnd.call(res);
        } else self._oldEnd.apply(res, arguments);
        self.destroy();
    };

    return this;
};

ProxiedRequest.prototype.plugProxy = function plugProxy() {

    this.proxy.proxyRequest(this.req, this.res, {
        host: this.host,
        port: 80,
        changeOrigin: true
    });

};

ProxiedRequest.prototype.execute = function execute() {

    this.overrideWriteHead();

    this.overrideWrite();

    this.overrideEnd();

    console.log('IP: ' + this.getHost().grey);
    console.log('proxied request to : '+this.getUrl().green);

    this.plugProxy();
};

ProxiedRequest.prototype.destroy = function() {
    delete this.req;
    delete this.res;
    delete this.proxy;
    delete this.originalHost;
    delete this.host;
    delete this.port;
    delete this._isJson;
    delete this._replaceHost;
    delete this._oldWriteHead;
    delete this._oldWrite;
    delete this._oldEnd;
};

module.exports = ProxiedRequest;