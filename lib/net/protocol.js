var DataTypes = require('./datatypes');

var ProtocolNames = {};

var Protocol = {

  get: function get(id) {
    var proto = Protocol[id];

    if (typeof proto === 'undefined' || proto === null) {
      proto = Protocol.UNSPECIFIED;
    }

    return proto;
  },

  encodeFields: function encodeFields(proto, fields) {
    var data = new Buffer(0);

    if (typeof fields === 'undefined' || fields === null) {
      fields = {};
    }

    for (var fieldName in fields) {
      var dataType = proto.fields[fieldName];
      var fieldValue = fields[fieldName];

      var fieldData = new dataType(fieldValue);
      var encodedValue = fieldData.encode();

      data = Buffer.concat([data, encodedValue]);
    }

    return data;
  },

  UNSPECIFIED: { fields: {} },
  CONNECTED_PING: {},
  UNCONNECTED_PONG: {},
  OPEN_CONNECTION_REQUEST: {},
  OPEN_CONNECTION_REPLY: {},
  OPEN_CONNECTION_REQUEST_2: {},
  OPEN_CONNECTION_REPLY_2: {},
  CLIENT_CONNECT: {},
  SERVER_HANDSHAKE: {},
  CLIENT_HANDSHAKE: {},
  DISCONNECT: {},
  ACK: {},
  BATCH: {}
};

function defineProtocol(protocol, protoDefinition) {
  if (typeof protocol.fields === 'undefined') {
    protocol.fields = {};
  }

  for (var protoName in Protocol) {
    if (protocol[protoName] === protocol) {
      ProtocolNames[protoDefinition.id] = protoName;
    }
  }

  for (var property in protoDefinition) {
    protocol[property] = protoDefinition[property];
  }

  Protocol[protoDefinition.id] = protocol;
}

defineProtocol(Protocol.CONNECTED_PING, {
  id: 0x01,
  reply: Protocol.UNCONNECTED_PONG,
  fields: {
    pingID: DataTypes.Long,
    magic: DataTypes.Magic
  }
});

defineProtocol(Protocol.UNCONNECTED_PONG, {
  id: 0x1C,
  fields: {
    pingID: DataTypes.Long,
    serverID: DataTypes.Long,
    magic: DataTypes.Magic,
    identifier: DataTypes.String
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REQUEST, {
  id: 0x05,
  reply: Protocol.OPEN_CONNECTION_REPLY,
  fields: {
    magic: DataTypes.Magic,
    protocolVersion: DataTypes.Byte,
    payload: DataTypes.NullPayload
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REPLY, {
  id: 0x06,
  fields: {
    magic: DataTypes.Magic,
    serverID: DataTypes.Long,
    useSecurity: DataTypes.Boolean,
    mtu: DataTypes.Short
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REQUEST_2, {
  id: 0x07,
  fields: {
    magic: DataTypes.Magic,
    serverAddress: DataTypes.Inet4Address,
    serverPort: DataTypes.UShort,
    mtu: DataTypes.Short,
    clientID: DataTypes.Long
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REPLY_2, {
  id: 0x08,
  fields: {
    magic: DataTypes.Magic,
    serverID: DataTypes.Long,
    clientAddress: DataTypes.Inet4Address,
    clientPort: DataTypes.UShort,
    mtu: DataTypes.UShort,
    useSecurity: DataTypes.Boolean
  }
});

defineProtocol(Protocol.CLIENT_CONNECT, {
  id: 0x09,
  fields: {
    clientID: DataTypes.Long,
    sessionID: DataTypes.Long,
    useSecurity: DataTypes.Boolean
  }
});

defineProtocol(Protocol.SERVER_HANDSHAKE, {
  id: 0x10,
  fields: {
    clientAddress: DataTypes.Inet4Address,
    clientPort: DataTypes.UShort,
    unknown: DataTypes.Short,
    address1: DataTypes.Inet4Address,
    port1: DataTypes.UShort,
    address2: DataTypes.Inet4Address,
    port2: DataTypes.UShort,
    address3: DataTypes.Inet4Address,
    port3: DataTypes.UShort,
    address4: DataTypes.Inet4Address,
    port4: DataTypes.UShort,
    address5: DataTypes.Inet4Address,
    port5: DataTypes.UShort,
    address6: DataTypes.Inet4Address,
    port6: DataTypes.UShort,
    address7: DataTypes.Inet4Address,
    port7: DataTypes.UShort,
    address8: DataTypes.Inet4Address,
    port8: DataTypes.UShort,
    address9: DataTypes.Inet4Address,
    port9: DataTypes.UShort,
    address10: DataTypes.Inet4Address,
    port10: DataTypes.UShort,
    ping: DataTypes.Long,
    pong: DataTypes.Long
  }
});

defineProtocol(Protocol.CLIENT_HANDSHAKE, {
  id: 0x13,
  fields: {
    serverAddress: DataTypes.Inet4Address,
    serverPort: DataTypes.UShort,
    address1: DataTypes.Inet4Address,
    port1: DataTypes.UShort,
    address2: DataTypes.Inet4Address,
    port2: DataTypes.UShort,
    address3: DataTypes.Inet4Address,
    port3: DataTypes.UShort,
    address4: DataTypes.Inet4Address,
    port4: DataTypes.UShort,
    address5: DataTypes.Inet4Address,
    port5: DataTypes.UShort,
    address6: DataTypes.Inet4Address,
    port6: DataTypes.UShort,
    address7: DataTypes.Inet4Address,
    port7: DataTypes.UShort,
    address8: DataTypes.Inet4Address,
    port8: DataTypes.UShort,
    address9: DataTypes.Inet4Address,
    port9: DataTypes.UShort,
    address10: DataTypes.Inet4Address,
    port10: DataTypes.UShort,
    ping: DataTypes.Long,
    pong: DataTypes.Long
  }
});

defineProtocol(Protocol.DISCONNECT, { 
  id: 0x15 
});

defineProtocol(Protocol.BATCH, {
  id: 0xB1,
  fields: {
    payload: DataTypes.ByteArray
  }
});

defineProtocol(Protocol.ACK, {
  id: 0xC0,
  fields: {
    payload: DataTypes.AckPayload
  }
});

module.exports.Protocol = Protocol;
