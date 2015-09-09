var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _events = require('events');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _Protocol = require('./Protocol');

var _Protocol2 = _interopRequireDefault(_Protocol);

var _Message = require('./Message');

var Packet = require('./Packet').Packet;

var _EncapsulatedPacket = require('./EncapsulatedPacket');

var _EncapsulatedPacket2 = _interopRequireDefault(_EncapsulatedPacket);

var NetworkHandler = (function (_EventEmitter) {
  _inherits(NetworkHandler, _EventEmitter);

  function NetworkHandler() {
    var _this = this;

    _classCallCheck(this, NetworkHandler);

    _get(Object.getPrototypeOf(NetworkHandler.prototype), 'constructor', this).call(this);

    this.packetHandlers = [];
    this.messageQueue = {};
    this.mtu = 1466;

    this.socket = _dgram2['default'].createSocket('udp4');

    this.socket.on('message', function (message, rinfo) {
      _this.receiveMessage(message, rinfo);
    });

    this.ackInterval = 100;
    this.ackQueue = [];
    this.scheduleNextAck();
  }

  _createClass(NetworkHandler, [{
    key: 'receiveMessage',
    value: function receiveMessage(rawMessage, rinfo) {
      var _this2 = this;

      var firstByte = rawMessage[0];
      var isEncapsulated = firstByte >= 0x80 && firstByte <= 0x8F;

      if (isEncapsulated) {
        _EncapsulatedPacket2['default'].fromBuffer(rawMessage, function (err, packet) {
          _this2.receiveEncapsulatedPacket(packet, rinfo);
        });

        return;
      }

      Packet.fromBuffer(rawMessage, function (err, packets) {
        if (!Array.isArray(packets)) {
          packets = [packets];
        }

        packets.forEach(function (packet) {
          _this2.receiveInternalPacket(packet, rinfo);
        });
      });
    }
  }, {
    key: 'receiveInternalPacket',
    value: function receiveInternalPacket(packet, rinfo) {
      var message = new _Message.InternalMessage(packet);

      this.processMessage(message, rinfo);
    }
  }, {
    key: 'receiveEncapsulatedPacket',
    value: function receiveEncapsulatedPacket(packet, rinfo) {
      var message = undefined;
      var shouldProcessMessage = true;

      if (packet.fragmented) {
        var fragmentID = packet.fragmentID;
        var messageInQueue = typeof this.messageQueue[fragmentID] !== 'undefined';

        if (!messageInQueue) {
          message = this.messageQueue[fragmentID] = new _Message.DataMessage(packet);
          console.log('Creating new message queue item: ' + packet._id);
        } else {
          message = this.messageQueue[fragmentID];
          console.log('Message already in queue; this is fragment ' + packet.fragmentIndex + '; there are ' + packet.fragmentCount + ' total fragments');
        }

        message.addPacket(packet);

        shouldProcessMessage = packet.fragmentIndex >= packet.fragmentCount - 1;
      } else {
        message = new _Message.DataMessage(packet, packet.sequenceNumber, packet.messageIndex, this.mtu);
      }

      if (shouldProcessMessage) {
        this.ackQueue.push({ packet: packet, rinfo: rinfo });
        this.processMessage(message, rinfo);
      }
    }
  }, {
    key: 'sendAck',
    value: function sendAck() {
      var _this3 = this;

      var sequences = {};

      while (this.ackQueue.length > 0) {
        var _ackQueue$pop = this.ackQueue.pop();

        var packet = _ackQueue$pop.packet;
        var rinfo = _ackQueue$pop.rinfo;

        var sequence = packet.sequenceNumber;

        console.log('Sending ACK for sequence #' + sequence + ' to ' + rinfo.address + ':' + rinfo.port);

        var key = rinfo.address + ':' + rinfo.port;
        var seqList = sequences[key];

        if (typeof seqList === 'undefined') {
          seqList = sequences[key] = [];
        }

        seqList.push(sequence);
      }

      Object.keys(sequences).forEach(function (client) {
        var list = sequences[client];
        if (list.length === 0) return;

        var rinfo = {
          address: client.split(':')[0],
          port: client.split(':')[1]
        };

        var packet = Packet.create(_Protocol2['default'].ACK, { payload: list });

        _this3.sendMessageTo(new _Message.InternalMessage(packet), rinfo);
      });

      this.scheduleNextAck();
    }
  }, {
    key: 'scheduleNextAck',
    value: function scheduleNextAck() {
      var _this4 = this;

      setTimeout(function () {
        _this4.sendAck();
      }, this.ackInterval);
    }
  }, {
    key: 'processMessage',
    value: function processMessage(message, rinfo) {
      var _this5 = this;

      message.getPackets(function (err, packets) {
        if (err) {
          throw err;
        } else if (packets === null || typeof packets === 'undefined' || packets.length === 0) {
          console.log('Message returned no packets');
          return;
        }

        packets.forEach(function (packet) {
          var packetHandlers = _this5.packetHandlers[packet.id];
          var isUnhandled = typeof packetHandlers === 'undefined' || packetHandlers.length === 0;

          if (!isUnhandled) {
            _async2['default'].eachSeries(packetHandlers, function (handlerDefinition, next) {
              var handler = handlerDefinition.handler;
              var precondition = handlerDefinition.precondition;

              var checkNecessary = typeof precondition !== 'undefined' && precondition !== null;

              if (checkNecessary) {
                if (precondition(packet, rinfo) === true) {
                  return handler(packet, rinfo, next);
                }
              }

              return handler(packet, rinfo, next);
            });

            _this5.emit('packet', packet, rinfo);
            return;
          }

          _this5.emit('unhandledPacket', packet, rinfo);
        });
      });
    }
  }, {
    key: 'sendMessageTo',
    value: function sendMessageTo(message, rinfo) {
      var _this6 = this;

      var mtu = arguments.length <= 2 || arguments[2] === undefined ? 1466 : arguments[2];

      if (!this.ready) {
        console.log('Skipping message send, socket not ready');
        return;
      }

      if (message instanceof _Packet2['default']) {
        message = new _Message.InternalMessage(message);
      }

      var buffers = message.encode(mtu);

      buffers.forEach(function (buffer) {
        _this6.socket.send(buffer, 0, buffer.length, rinfo.port, rinfo.address);
      });
    }
  }, {
    key: 'addPacketHandler',
    value: function addPacketHandler(protocol, precondition, handler) {
      var packetHandlers = this.packetHandlers;

      var protoID = protocol.id;

      if (typeof handler !== 'function') {
        handler = precondition;
        precondition = null;
      }

      if (typeof packetHandlers[protoID] === 'undefined') {
        packetHandlers[protoID] = [];
      }

      packetHandlers[protoID].push({
        precondition: precondition,
        handler: handler
      });
    }
  }, {
    key: 'close',
    value: function close() {
      this.ready = false;
      this.socket.close();
    }
  }]);

  return NetworkHandler;
})(_events.EventEmitter);

module.exports.NetworkHandler = NetworkHandler;
