'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Packet = require('./Packet');

var _Packet2 = _interopRequireDefault(_Packet);

var _EncapsulatedPacket = require('./EncapsulatedPacket');

var _EncapsulatedPacket2 = _interopRequireDefault(_EncapsulatedPacket);

var Message = (function () {
  function Message(id, type) {
    _classCallCheck(this, Message);

    this.id = id;
    this.type = type;

    this.packets = [];
  }

  _createClass(Message, [{
    key: 'addPacket',
    value: function addPacket(packet) {
      if (packet.encapsulated) {
        this.packets[packet.fragmentIndex] = packet;

        if (packet.fragmentIndex === 0) {
          this.id = packet.id;
        }
      } else {
        this.packets.push(packet);
      }
    }
  }, {
    key: 'getPackets',
    value: function getPackets(callback) {
      return callback(null, this.packets);
    }

    /*
    encode(mtu) {
      let data = this.getEncodedPackets();
      let numPackets = Math.ceil(data.length / mtu);
      let buffers = [];
      let bufferStart, bufferEnd, bufferSize = (data.length / numPackets);
        for (let packetIndex = 0; packetIndex < numPackets; packetIndex++) {
        bufferStart = bufferSize * packetIndex;
          bufferEnd = bufferStart + bufferSize;
        if (bufferEnd >= data.length) {
          bufferEnd = data.length - 1;
        }
          buffers[packetIndex] = data.slice(bufferStart, bufferEnd);
      }
        return buffers;
    }
    */

  }]);

  return Message;
})();

var InternalMessage = (function (_Message) {
  _inherits(InternalMessage, _Message);

  function InternalMessage(packet) {
    _classCallCheck(this, InternalMessage);

    _get(Object.getPrototypeOf(InternalMessage.prototype), 'constructor', this).call(this, packet.id, 'InternalMessage');

    this.addPacket(packet);
    this.packet = packet;

    this.decode();
  }

  _createClass(InternalMessage, [{
    key: 'encode',
    value: function encode() {
      return [this.packet.encode()];
    }
  }, {
    key: 'decode',
    value: function decode() {
      this.fields = this.packet.fields;
    }
  }]);

  return InternalMessage;
})(Message);

var DataMessage = (function (_Message2) {
  _inherits(DataMessage, _Message2);

  function DataMessage(packet) {
    var sequenceNumber = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    var _this = this;

    var messageIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var maxPacketSize = arguments.length <= 3 || arguments[3] === undefined ? 1466 : arguments[3];

    _classCallCheck(this, DataMessage);

    _get(Object.getPrototypeOf(DataMessage.prototype), 'constructor', this).call(this, packet.id, 'DataMessage');

    this.maxPacketSize = maxPacketSize;

    if (packet instanceof _EncapsulatedPacket2['default']) {
      this.addPacket(packet);
    } else {
      var packets = DataMessage.encapsulatePacket(packet, {
        sequenceNumber: sequenceNumber,
        messageIndex: messageIndex,
        maxPacketSize: maxPacketSize
      });

      packets.forEach(function (packet) {
        _this.addPacket(packet);
      });
    }
  }

  _createClass(DataMessage, [{
    key: 'encode',
    value: function encode() {
      var packetBuffers = [];

      this.packets.forEach(function (ePacket) {
        packetBuffers.push(ePacket.encode());
      });

      return packetBuffers;
    }
  }, {
    key: 'getPackets',
    value: function getPackets(callback) {
      if (this.packets.length === 0) {
        return [];
      }

      if (typeof this.packets[0] === 'undefined') {
        throw new Error('Missing first packet/fragment');
      }

      var packetBuffer = undefined;

      // Fragmented packets are already inserted into message in order by
      // fragment index. No additional sorting is needed!
      var fragmented = this.packets[0].fragmented;
      var fragmentCount = this.packets[0].fragmentCount;

      if (fragmented) {
        if (this.packets.length !== fragmentCount) {
          throw new Error('Trying to reassemble split packets without all the fragments');
        }

        // Combine all the fragmented data into a single buffer
        packetBuffer = new Buffer(0);
        this.packets.forEach(function (packet) {
          packetBuffer = Buffer.concat([packetBuffer, packet.data]);
        });
      } else {
        // If it's not fragmented, we should only have one packet
        if (this.packets.length > 1) {
          throw new Error('More than one  packet in message');
        }

        packetBuffer = this.packets[0].data;
      }

      // After reassembly, this packet could be single or a batch packet.
      // If it's a batch packet, this will return all decoded packets.
      _Packet2['default'].fromBuffer(packetBuffer, function (err, packets) {
        if (err) return callback(err);

        if (!Array.isArray(packets)) {
          packets = [packets];
        }

        return callback(null, packets);
      });
    }
  }], [{
    key: 'encapsulatePacket',
    value: function encapsulatePacket(packet, _ref) {
      var sequenceNumber = _ref.sequenceNumber;
      var messageIndex = _ref.messageIndex;
      var maxPacketSize = _ref.maxPacketSize;

      var packetOptions = {};

      packetOptions.sequenceNumber = sequenceNumber;
      packetOptions.messageIndex = messageIndex;

      packetOptions.reliability = 3; // TODO

      packetOptions.fragmented = packet.size() > maxPacketSize;

      // TODO
      packetOptions.ackNeeded = false;
      packetOptions.orderIndex = 0;
      packetOptions.orderChannel = 0;

      if (packetOptions.fragmented) {
        // TODO
        throw new Error('Fragmentation not yet implemented');
      }

      packetOptions.fragmentIndex = 0;
      packetOptions.fragmentCount = 0;
      packetOptions.fragmentID = 0;

      packetOptions.data = packet.data;

      var ePacket = new _EncapsulatedPacket2['default'](packet.id, packetOptions);

      return [ePacket];
    }
  }]);

  return DataMessage;
})(Message);

exports['default'] = {
  InternalMessage: InternalMessage,
  DataMessage: DataMessage
};
module.exports = exports['default'];