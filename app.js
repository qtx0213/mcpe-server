const {MCPEServer} = require('./lib/server');
const {Packet} = require('./lib/net/packet');
const {Protocol} = require('./lib/net/protocol');
const DataTypes = require('./lib/net/datatypes');
const settings = require('./config/settings');

const server = new MCPEServer;

const MAGIC_VALUE = [0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78];

var config={
  serverName: settings.name,
  maxPlayers: settings.maxPlayers,
  currentPlayers: 10, //TODO: real value
  minecraftVersion: settings.version,
  protocolVersion: "7"
};

server.on('listen', _ => {
  console.log(`Listening on ${server.localAddress}:${server.localPort}`);
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
  console.log(packet.fields.protocolVersion);
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

  next();
});

server.addPacketHandler(Protocol.CLIENT_HANDSHAKE, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CLIENT_HANDSHAKE");
  
  next();
});

server.addPacketHandler(Protocol.PING, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("PING");

  next();
});

server.addPacketHandler(Protocol.ACK, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("ACK");

  next();
});

server.addPacketHandler(Protocol.CUST_0, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CUST");
  recvCust("0",packet);
  next();
});

server.addPacketHandler(Protocol.CUST_1, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CUST");
  recvCust("1",packet);
  next();
});

server.addPacketHandler(Protocol.CUST_B, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CUST");
  recvCust("B",packet);
  next();
});

server.addPacketHandler(Protocol.CLIENT_READY, arbitraryPrecondition, function (packet, rinfo, next) {
  console.log("CLIENT_READY");

  next();
});

function recvCust(cust,packet){
  console.log("CUSTDECODE: "+cust);
  console.log(packet);
}
server.listen();
