"use strict";

require('colors');
var hp = require('http-proxy');
var http = require('http');

/**
 * DomainProxyServer
 * @constructor
 */
function DomainProxyServer(host, port, ProxiedRequestConstructor) {
    this.host = host;
    this.port = port;
    this.ProxiedRequestConstructor = ProxiedRequestConstructor;
}

DomainProxyServer.prototype.initialize = function initialize() {
    var self = this;
    var proxy = new hp.RoutingProxy();
    this.server = http.createServer(function proxyRequest(req, res) {

        var originalHost = req.headers.host;

        var proxiedRequest = new self.ProxiedRequestConstructor(req, res, proxy, originalHost, self.host, self.port);
        proxiedRequest.execute();

    });
    this.server.listen(self.port);
    console.log('server listening on port '+self.port+' and forwarding to '+self.host);
};

module.exports = DomainProxyServer;