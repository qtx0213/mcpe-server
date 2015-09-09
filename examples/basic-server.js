var MCPEServer = require('../lib/Server);

var Packet = require('../lib/net/Packet');

var Protocol = require('../lib/net/Protocol');

var server = new MCPEServer();

server.on('listen', function () {
  console.log('Listening on ' + server.localAddress + ':' + server.localPort);
});

function arbitraryPrecondition(packet, rinfo) {
  return packet.fields.pingID > 0;
}

server.addPacketHandler(Protocol['default'].CONNECTED_PING, arbitraryPrecondition, function (packet, rinfo, next) {
  
  var reply = Packet['default'].create(Protocol['default'].UNCONNECTED_PONG, {
    pingID: packet.fields.pingID,
    serverID: 0,
    magic: null,
    identifier: 'MCPE;Test Server;2 7;0.11.1;0;20'
  });

  server.sendMessageTo(reply, rinfo);

  next();
});

server.listen();
