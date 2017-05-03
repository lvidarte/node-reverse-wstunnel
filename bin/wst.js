//###############################################################################
//##
//# Copyright (C) 2014-2015 Andrea Rocco Lotronto
//##
//# Licensed under the Apache License, Version 2.0 (the "License");
//# you may not use this file except in compliance with the License.
//# You may obtain a copy of the License at
//##
//# http://www.apache.org/licenses/LICENSE-2.0
//##
//# Unless required by applicable law or agreed to in writing, software
//# distributed under the License is distributed on an "AS IS" BASIS,
//# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//# See the License for the specific language governing permissions and
//# limitations under the License.
//##
//###############################################################################


var _,
    argv,
    client,
    host,
    localport,
    optimist,
    port,
    portTunnel,
    _ref,
    _ref1,
    server,
    test,
    usageText,
    wsHost,
    wst
;

_ = require("under_score");

usageText  = "Run websocket tunnel and reverse tunnel such server or client.\n\n"
           + " - To run websocket tunnel server: wstt.js -s 8080\n"
           + " - To run websocket tunnel client: wstt.js -t localport:host:port ws://wshost:wsport\n\n"
           + "Now connecting to localhost:localport is same as connecting to host:port on wshost.\n"
           + "If websocket server is behind ssl proxy, then use \"wss://host:port\" in client mode.\n"
           + "For security, you can \"lock\" the tunnel destination on server side, for example:\n"
           + "wstunnel -s 8080 -t host:port\n"
           + "Server will tunnel incomming websocket connection to host:port only, so client can just run\n"
           + "wstunnel -t localport ws://wshost:port\n\n"
           + "If client run:\n"
           + "wstunnel -t localpost:otherhost:otherport ws://wshost:port\n"
           + "  * otherhost:otherport is ignored, tunnel destination is still \"host:port\" as specified on server.\n"
;

optimist = require('optimist')
            .usage(usageText)
            .string("s")
            .string("t")
            .alias('t', "tunnel")
            .describe('s', 'run as server, specify listen port')
            .describe('tunnel', 'run as tunnel client, specify localport:host:port')
;


argv = optimist.argv;

if (_.size(argv) === 2) {
  return console.log(optimist.help());
}

if (argv.s && !argv.r) {

  wst = require("../lib/wst");

  if (argv.t) {
    _ref = argv.t.split(":");
    host = _ref[0];
    port = _ref[1];
    server = new wst.server(host, port);
  } 
  else {
    server = new wst.server;
  }

  server.start(argv.s);

} else if (argv.t) {

  require("../lib/https_override");
  wst = require("../lib/wst");
  client = new wst.client;
  wsHost = _.last(argv._);
  _ref1 = argv.t.split(":");
  localport = _ref1[0];
  host = _ref1[1];
  port = _ref1[2];

  if (host && port) {
    client.start(localport, wsHost, host + ":" + port);
  } else {
    client.start(localport, wsHost);
  }

} else if (argv.r) {

  if (argv.s) {
    require("../lib/https_override");
    wst = require("../lib/wst");
    server = new wst.server_reverse;
    server.start(argv.s);
  }
  else {
    require("../lib/https_override");
    wst = require("../lib/wst");
    client = new wst.client_reverse;
    wsHost = _.last(argv._);
    test = argv.r.split(":");
    _ref1 = argv.r.split(":");
    portTunnel = _ref1[0];
    host = _ref1[1];
    port =_ref1[2];
    client.start(portTunnel, wsHost, host + ":" + port);
  } 

} else {

  return console.log(optimist.help());

}
