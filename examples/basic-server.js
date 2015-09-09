'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _index = require('../index');

var _libNetPacket = require('../lib/net/Packet');

var _libNetPacket2 = _interopRequireDefault(_libNetPacket);

var _libNetProtocol = require('../lib/net/Protocol');

var _libNetProtocol2 = _interopRequireDefault(_libNetProtocol);

var server = new _index.Server();

server.on('listen', function () {
  console.log('Listening on ' + server.localAddress + ':' + server.localPort);
});

// An example of a precondition for validating packets before processing them.
// Preconditions are completely optional and run prior to the handler function.
//
// This one should always return true.
function arbitraryPrecondition(packet, rinfo) {
  return packet.fields.pingID > 0;
}

server.addPacketHandler(_libNetProtocol2['default'].CONNECTED_PING, arbitraryPrecondition, function (packet, rinfo, next) {
  var reply = _libNetPacket2['default'].create(_libNetProtocol2['default'].UNCONNECTED_PONG, {
    pingID: packet.fields.pingID,
    serverID: 0,
    magic: null,
    identifier: 'MCPE;Test Server;2 7;0.11.1;0;20'
  });

  server.sendMessageTo(reply, rinfo);

  next();
});

server.listen();