# Proxyfire

## Introduction

Proxyfire is a local multi proxy that replaces proxied origins in response contents with proxy target.

This is useful when your pages contain links to other domains that you are proxying, and you wan't
those links to have href transformed to you the proxy address.

It is built on the [http-proxy](https://github.com/nodejitsu/node-http-proxy/tree/0.10.x) module.

## Requirements

You will need *node*, *npm*, and the dependencies specified in the [package.json](/lafourchette/proxyfire/blob/master/package.json) file, that you will install with:

    npm install

## Usage

Require proxyfire

```js
var CrossDomainProxyServer = require('proxyfire');
```

Create an array of domains  you wan't to proxy

```js
var domains = [
    'www.firstdomain.local',
    'www.seconddomain.local'
];
```

Create the instance and initialize

```js
var crossDomainProxyServer = new CrossDomainProxyServer(domains, 3000);
crossDomainProxyServer.initialize();
```

Port *3000* is can be omitted since its the default value for starting port.

In this specific example, you will get the following output in console:

```
server listening on port 3000 and forwarding to www.firstdomain.local
server listening on port 3001 and forwarding to www.seconddomain.local
```

Finally, you connect on *http://localhost:3000* or with your IP address *http://x.y.z.w:3000*.

You can of course set local domains on your DNS so that your machine would be accessed with an elegant domain name.