var MCPEServer = require('./lib/server').Server;
var Packet = require('./lib/net/packet').Packet;
var Protocol = require('./lib/net/protocol').Protocol;
var DataTypes = require('./lib/net/datatypes');
var settings = require('./config/settings');

var server = new MCPEServer;

var MAGIC_VALUE = [0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78];

var config={
  serverName: settings.name,
  maxPlayers: settings.maxPlayers,
  currentPlayers: 5, //TODO: real value
  minecraftVersion: "0.12.1",
  protocolVersion: "2 7"
};

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
    identifier: "MCPE;"+config.serverName+";"+config.protocolVersion+";"+config.minecraftVersion+";"+config.currentPlayers+";"+config.maxPlayers
  });

  server.sendMessageTo(reply, rinfo);

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

server.addPacketHandler(Protocol.CLIENT_CONNECT, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CLIENT_CONNECT");
  console.log(packet.fields.sessionID);
  
  var reply = Packet.create(Protocol.SERVER_HANDSHAKE, {
    clientAddress: [0,0,0,0],
    clientPort: 0,
    unknown: 0,
    address1: [0,0,0,0],
    port1: 0,
    address2: [0,0,0,0],
    port2: 0,
    address3: [0,0,0,0],
    port3: 0,
    address4: [0,0,0,0],
    port4: 0,
    address5: [0,0,0,0],
    port5: 0,
    address6: [0,0,0,0],
    port6: 0,
    address7: [0,0,0,0],
    port7: 0,
    address8: [0,0,0,0],
    port8: 0,
    address9: [0,0,0,0],
    port9: 0,
    address10: [0,0,0,0],
    port10: 0,
    ping: packet.fields.sessionID,
    pong: packet.fields.sessionID
  });

  server.sendMessageTo(reply, rinfo);
  
  next();
});

server.addPacketHandler(Protocol.CLIENT_HANDSHAKE, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CLIENT_HANDSHAKE");

  next();
});

server.listen();
