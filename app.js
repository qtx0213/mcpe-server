var MCPEServer = require('./lib/server').Server;
var Packet = require('./lib/net/packet').Packet;
var Protocol = require('./lib/net/protocol').Protocol;

var server = new MCPEServer;

var MAGIC_VALUE = [0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78];

config={
  serverName: "A MCPE Server"
}

server.on('listen', function () {
  console.log('Listening on ' + server.localAddress + ':' + server.localPort);
});

function arbitraryPrecondition(packet, rinfo) {
  return packet.fields.pingID > 0;
}

server.addPacketHandler(Protocol.CONNECTED_PING, arbitraryPrecondition, function (packet, rinfo, next) {
  
  var reply = Packet.create(Protocol.ID_UNCONNECTED_PING_OPEN_CONNECTIONS, {
    pingID: packet.fields.pingID,
    serverID: 0,
    magic: null,
    identifier: `MCPE;${config.serverName};2 7;0.11.1;0;20`
  });

  server.sendMessageTo(reply, rinfo);

  next();
});

server.addPacketHandler(Protocol.CLIENT_CONNECT, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CLIENT_CONNECT");

  next();
});
server.addPacketHandler(Protocol.OPEN_CONNECTION_REQUEST, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("OPEN_CONNECTION_REQUEST");
  var reply = Packet.create(Protocol.OPEN_CONNECTION_REPLY, {
    magic: null,
    serverID: 0,
    useSecurity: false,
    mtu: 0
  });

  server.sendMessageTo(reply, rinfo);

  next();
});
server.addPacketHandler(Protocol.OPEN_CONNECTION_REQUEST_2, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("OPEN_CONNECTION_REQUEST_2");
  console.log(packet.serverAddress);
  var reply = Packet.create(Protocol.OPEN_CONNECTION_REPLY_2, {
    magic: null,
    serverID: 0,
    clientAddress: [0,0,0,0],
    clientPort: 0,
    mtu: 0,
    useSecurity: false
  });

  server.sendMessageTo(reply, rinfo);
  
  next();
});


server.listen();
