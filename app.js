var MCPEServer = require('./lib/server').Server;
var Packet = require('./lib/net/packet').Packet;
var Protocol = require('./lib/net/protocol').Protocol;

var server = new MCPEServer;

server.on('listen', function () {
  console.log('Listening on ' + server.localAddress + ':' + server.localPort);
});

function arbitraryPrecondition(packet, rinfo) {
  return packet.fields.pingID > 0;
}

server.addPacketHandler(Protocol.CONNECTED_PING, arbitraryPrecondition, function (packet, rinfo, next) {
  
  var reply = Packet.create(Protocol.UNCONNECTED_PONG, {
    pingID: packet.fields.pingID,
    serverID: 0,
    magic: null,
    identifier: 'MCPE;A Minecraft PE Server;2 7;0.11.1;0;20'
  });

  server.sendMessageTo(reply, rinfo);

  next();
});

server.listen();
