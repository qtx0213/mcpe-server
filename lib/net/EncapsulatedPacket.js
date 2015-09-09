var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Packet = require('./Packet').Packet;

var RELIABILITY_MASK = 224;
var FLAG_FRAGMENTED = 16;
var FLAG_ACK_NEEDED = 8;

var EncapsulatedPacket = (function (Packet) {
    _inherits(EncapsulatedPacket, Packet);

    function EncapsulatedPacket() {
        var id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

        var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _ref$data = _ref.data;
        var data = _ref$data === undefined ? null : _ref$data;
        var _ref$fields = _ref.fields;
        var fields = _ref$fields === undefined ? {} : _ref$fields;
        var _ref$sequenceNumber = _ref.sequenceNumber;
        var sequenceNumber = _ref$sequenceNumber === undefined ? 0 : _ref$sequenceNumber;
        var _ref$reliability = _ref.reliability;
        var reliability = _ref$reliability === undefined ? 0 : _ref$reliability;
        var _ref$messageIndex = _ref.messageIndex;
        var messageIndex = _ref$messageIndex === undefined ? 0 : _ref$messageIndex;
        var _ref$ackNeeded = _ref.ackNeeded;
        var ackNeeded = _ref$ackNeeded === undefined ? false : _ref$ackNeeded;
        var _ref$fragmented = _ref.fragmented;
        var fragmented = _ref$fragmented === undefined ? false : _ref$fragmented;
        var _ref$fragmentIndex = _ref.fragmentIndex;
        var fragmentIndex = _ref$fragmentIndex === undefined ? 0 : _ref$fragmentIndex;
        var _ref$fragmentCount = _ref.fragmentCount;
        var fragmentCount = _ref$fragmentCount === undefined ? 0 : _ref$fragmentCount;
        var _ref$fragmentID = _ref.fragmentID;
        var fragmentID = _ref$fragmentID === undefined ? 0 : _ref$fragmentID;
        var _ref$orderIndex = _ref.orderIndex;
        var orderIndex = _ref$orderIndex === undefined ? 0 : _ref$orderIndex;
        var _ref$orderChannel = _ref.orderChannel;
        var orderChannel = _ref$orderChannel === undefined ? 0 : _ref$orderChannel;

        _get(Object.getPrototypeOf(EncapsulatedPacket.prototype), 'constructor', this).call(this, id, data);

        this.fields = fields;
        this.encapsulated = true;

        this.sequenceNumber = sequenceNumber;
        this.reliability = reliability;
        this.ackNeeded = ackNeeded;

        this.messageIndex = messageIndex;

        this.fragmented = fragmented;
        this.fragmentIndex = fragmentIndex;
        this.fragmentCount = fragmentCount;
        this.fragmentID = fragmentID;

        this.orderIndex = orderIndex;
        this.orderChannel = orderChannel;
    }

    _createClass(EncapsulatedPacket, [{
        key: 'getUnderlyingPackets',
        value: function getUnderlyingPackets() {
            return [Packet.decode(this.data)];
        }
    }, {
        key: 'encode',
        value: function encode() {
            var headerBuffer = new Buffer(25);
            var headerOffset = 0;

            headerBuffer.fill(0);

            headerBuffer.writeUInt8(0x84, headerOffset);
            headerOffset += 1;

            headerBuffer.writeIntLE(this.sequenceNumber, headerOffset, 3);
            headerOffset += 3;

            var flags = this.reliability << 5;
            flags |= 16 & (this.fragmented ? 1 : 0) << 4;

            headerBuffer.writeInt8(flags, headerOffset);
            headerOffset += 1;

            headerBuffer.writeInt16BE(this.data.length * 8, headerOffset);
            headerOffset += 2;

            if (this.reliability >= 2 && this.reliability !== 5) {
                headerBuffer.writeIntLE(this.messageIndex, headerOffset, 3);
                headerOffset += 3;
            }

            if (this.reliability > 0 && this.reliability <= 4 && this.reliability !== 2) {
                headerBuffer.writeIntLE(this.orderIndex, headerOffset, 3);
                headerOffset += 3;

                headerBuffer.writeInt8(this.orderChannel, headerOffset);
                headerOffset += 1;
            }

            if (this.fragmented) {
                headerBuffer.writeInt32BE(this.fragmentCount, headerOffset);
                headerOffset += 4;

                headerBuffer.writeInt16BE(this.fragmentID, headerOffset);
                headerOffset += 2;

                headerBuffer.writeInt32BE(this.fragmentIndex, headerOffset);
                headerOffset += 4;
            }

            headerBuffer = headerBuffer.slice(0, headerOffset);

            var finalBuffer = Buffer.concat([headerBuffer, this.data]);
            return finalBuffer;
        }
    }], [{
        key: 'fromBuffer',
        value: function fromBuffer(buffer, callback) {
            var packetOptions = {};
            var offset = 0;

            var packetID = buffer.readInt8(0);
            offset += 1;

            packetOptions.sequenceNumber = buffer.readIntLE(offset, 3);
            offset += 3;

            var flags = buffer.readInt8(offset);
            offset += 1;

            packetOptions.reliability = (flags & RELIABILITY_MASK) >> 5;
            packetOptions.fragmented = (flags & FLAG_FRAGMENTED) >> 4 === 1;
            packetOptions.ackNeeded = (flags & FLAG_ACK_NEEDED) >> 3 === 1;

            var innerDataLength = buffer.readInt16BE(offset) / 8;
            offset += 2;

            if (packetOptions.reliability >= 2 && packetOptions.reliability !== 5) {
                packetOptions.messageIndex = buffer.readIntLE(offset, 3);
                offset += 3;
            }

            if (packetOptions.reliability > 0 && packetOptions.reliability <= 4 && packetOptions.reliability !== 2) {
                packetOptions.orderIndex = buffer.readIntLE(offset, 3);
                offset += 3;

                packetOptions.orderChannel = buffer.readInt8(offset);
                offset += 1;
            }

            if (packetOptions.fragmented) {
                packetOptions.fragmentCount = buffer.readInt32BE(offset);
                offset += 4;

                packetOptions.fragmentID = buffer.readInt16BE(offset);
                offset += 2;

                packetOptions.fragmentIndex = buffer.readInt32BE(offset);
                offset += 4;
            }

            var innerData = buffer.slice(offset, offset + innerDataLength);
            packetOptions.data = innerData;

            if (!packetOptions.fragmented) {
                packetID = innerData[0];
            } else if (packetOptions.fragmented && packetOptions.fragmentIndex === 0) {
                packetID = innerData[0];
            }

            callback(null, new EncapsulatedPacket(packetID, packetOptions));
        }
    }]);

    return EncapsulatedPacket;
})(Packet);

module.exports.EncapsulatedPacket = EncapsulatedPacket;
