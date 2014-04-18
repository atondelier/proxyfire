"use strict";

require('colors');
var util = require('util');

var ProxiedRequest = require('./ProxiedRequest');


function crossDomainProxiedRequestConstructorGenerator(servers) {

    /**
     * CrossDomainProxiedRequest
     * @constructor
     * @inherits ProxiedRequest
     */
    function CrossDomainProxiedRequest() {
        ProxiedRequest.apply(this, arguments);
        this.servers = null;
    }

    util.inherits(CrossDomainProxiedRequest, ProxiedRequest);

    CrossDomainProxiedRequest.prototype.replaceHostWithLocalhost = function(str) {

        var i = servers.length, server;
        console.log('CrossDomainProxiedRequest'.blue, this.req.headers.host);
        while(i--) {
            server = servers[i];
            str = ProxiedRequest.prototype.replaceHostWithLocalhost.call(this, str, server.host, server.port);
        }
        return str;
    };

    return CrossDomainProxiedRequest;

}
module.exports = crossDomainProxiedRequestConstructorGenerator;