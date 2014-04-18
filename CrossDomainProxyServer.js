"use strict";

require('colors');

var crossDomainProxiedRequestConstructorGenerator = require('./src/crossDomainProxiedRequestConstructorGenerator');
var DomainProxyServer = require('./src/DomainProxyServer');


/**
 * CrossDomainProxyServer
 * @constructor
 */
function CrossDomainProxyServer(domains, startingPort) {
    startingPort = startingPort || 3000;
    this.domains = domains;
    this.startingPort = startingPort;

    this.servers = [];

    this.CrossDomainProxiedRequest = crossDomainProxiedRequestConstructorGenerator(this.servers);
}

CrossDomainProxyServer.prototype.initialize = function initialize() {

    var self = this;

    this.domains.forEach(function(domain) {
        var domainProxyServer = self._createServer(domain, self.startingPort++);
        domainProxyServer.initialize();
        self.servers.push(domainProxyServer);
    });
};

CrossDomainProxyServer.prototype._createServer = function _createServer(host, port) {
    return new DomainProxyServer(host, port, this.CrossDomainProxiedRequest);
};

module.exports = CrossDomainProxyServer;