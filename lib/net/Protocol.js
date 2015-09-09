'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _DataTypes = require('./DataTypes');

var _DataTypes2 = _interopRequireDefault(_DataTypes);

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
    pingID: _DataTypes2['default'].Long,
    magic: _DataTypes2['default'].Magic
  }
});

defineProtocol(Protocol.UNCONNECTED_PONG, {
  id: 0x1C,
  fields: {
    pingID: _DataTypes2['default'].Long,
    serverID: _DataTypes2['default'].Long,
    magic: _DataTypes2['default'].Magic,
    identifier: _DataTypes2['default'].String
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REQUEST, {
  id: 0x05,
  reply: Protocol.OPEN_CONNECTION_REPLY,
  fields: {
    magic: _DataTypes2['default'].Magic,
    protocolVersion: _DataTypes2['default'].Byte,
    payload: _DataTypes2['default'].NullPayload
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REPLY, {
  id: 0x06,
  fields: {
    magic: _DataTypes2['default'].Magic,
    serverID: _DataTypes2['default'].Long,
    useSecurity: _DataTypes2['default'].Boolean,
    mtu: _DataTypes2['default'].Short
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REQUEST_2, {
  id: 0x07,
  fields: {
    magic: _DataTypes2['default'].Magic,
    serverAddress: _DataTypes2['default'].Inet4Address,
    serverPort: _DataTypes2['default'].UShort,
    mtu: _DataTypes2['default'].Short,
    clientID: _DataTypes2['default'].Long
  }
});

defineProtocol(Protocol.OPEN_CONNECTION_REPLY_2, {
  id: 0x08,
  fields: {
    magic: _DataTypes2['default'].Magic,
    serverID: _DataTypes2['default'].Long,
    clientAddress: _DataTypes2['default'].Inet4Address,
    clientPort: _DataTypes2['default'].UShort,
    mtu: _DataTypes2['default'].UShort,
    useSecurity: _DataTypes2['default'].Boolean
  }
});

defineProtocol(Protocol.CLIENT_CONNECT, {
  id: 0x09,
  fields: {
    clientID: _DataTypes2['default'].Long,
    sessionID: _DataTypes2['default'].Long,
    useSecurity: _DataTypes2['default'].Boolean
  }
});

defineProtocol(Protocol.SERVER_HANDSHAKE, {
  id: 0x10,
  fields: {
    clientAddress: _DataTypes2['default'].Inet4Address,
    clientPort: _DataTypes2['default'].UShort,
    unknown: _DataTypes2['default'].Short,
    address1: _DataTypes2['default'].Inet4Address,
    port1: _DataTypes2['default'].UShort,
    address2: _DataTypes2['default'].Inet4Address,
    port2: _DataTypes2['default'].UShort,
    address3: _DataTypes2['default'].Inet4Address,
    port3: _DataTypes2['default'].UShort,
    address4: _DataTypes2['default'].Inet4Address,
    port4: _DataTypes2['default'].UShort,
    address5: _DataTypes2['default'].Inet4Address,
    port5: _DataTypes2['default'].UShort,
    address6: _DataTypes2['default'].Inet4Address,
    port6: _DataTypes2['default'].UShort,
    address7: _DataTypes2['default'].Inet4Address,
    port7: _DataTypes2['default'].UShort,
    address8: _DataTypes2['default'].Inet4Address,
    port8: _DataTypes2['default'].UShort,
    address9: _DataTypes2['default'].Inet4Address,
    port9: _DataTypes2['default'].UShort,
    address10: _DataTypes2['default'].Inet4Address,
    port10: _DataTypes2['default'].UShort,
    ping: _DataTypes2['default'].Long,
    pong: _DataTypes2['default'].Long
  }
});

defineProtocol(Protocol.CLIENT_HANDSHAKE, {
  id: 0x13,
  fields: {
    serverAddress: _DataTypes2['default'].Inet4Address,
    serverPort: _DataTypes2['default'].UShort,
    address1: _DataTypes2['default'].Inet4Address,
    port1: _DataTypes2['default'].UShort,
    address2: _DataTypes2['default'].Inet4Address,
    port2: _DataTypes2['default'].UShort,
    address3: _DataTypes2['default'].Inet4Address,
    port3: _DataTypes2['default'].UShort,
    address4: _DataTypes2['default'].Inet4Address,
    port4: _DataTypes2['default'].UShort,
    address5: _DataTypes2['default'].Inet4Address,
    port5: _DataTypes2['default'].UShort,
    address6: _DataTypes2['default'].Inet4Address,
    port6: _DataTypes2['default'].UShort,
    address7: _DataTypes2['default'].Inet4Address,
    port7: _DataTypes2['default'].UShort,
    address8: _DataTypes2['default'].Inet4Address,
    port8: _DataTypes2['default'].UShort,
    address9: _DataTypes2['default'].Inet4Address,
    port9: _DataTypes2['default'].UShort,
    address10: _DataTypes2['default'].Inet4Address,
    port10: _DataTypes2['default'].UShort,
    ping: _DataTypes2['default'].Long,
    pong: _DataTypes2['default'].Long
  }
});

defineProtocol(Protocol.DISCONNECT, { id: 0x15 });

defineProtocol(Protocol.BATCH, {
  id: 0xB1,
  fields: {
    payload: _DataTypes2['default'].ByteArray
  }
});

defineProtocol(Protocol.ACK, {
  id: 0xC0,
  fields: {
    payload: _DataTypes2['default'].AckPayload
  }
});

exports['default'] = Protocol;
module.exports = exports['default'];