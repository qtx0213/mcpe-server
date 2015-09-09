var createClass = (function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
})();

var Protocol = require('./Protocol').Protocol;


var Packet = (function () {
  function Packet(id, data) {
    if (id === undefined) id = 0;

    this.id = id;

    this._id = id.toString(16);
    this._id = '0x' + (id < 16 ? '0' : '') + this._id;

    if (Buffer.isBuffer(data)) {
      this.data = new Buffer(data);
    } else {
      this.data = new Buffer(0);
    }

    this.fields = {};
    this.protocol = Protocol.get(id);
  }

  createClass(Packet, [{
    key: 'is',
    value: function is(proto) {
      return Protocol.get(this.id) === proto;
    }
  }, {
    key: 'size',
    value: function size() {
      return (this.data !== null ? this.data.length : 0) + 1;
    }
  }, {
    key: 'encode',
    value: function encode() {
      return new Buffer(this.data);
    }
  }], [{
    key: 'create',
    value: function create(proto, fields) {
      var data = new Buffer(1);

      data.writeUInt8(proto.id);
      data = Buffer.concat([data, Protocol.encodeFields(proto, fields)]);

      var packet = new Packet(proto.id, data);
      packet.fields = fields;

      return packet;
    }
  }, {
    key: 'fromBuffer',
    value: function fromBuffer(buffer, callback) {
      var isBatchPacket = buffer[0] === _Protocol2['default'].BATCH.id;

      if (isBatchPacket) {
        Packet.batchPacketFromBuffer(buffer, callback);
      }

      Packet.singlePacketFromBuffer(buffer, callback);
    }
  }, {
    key: 'batchPacketFromBuffer',
    value: function batchPacketFromBuffer(buffer, callback) {
      var packets = [];

      console.log('Got batch packet');

      callback(null, packets);
    }
  }, {
    key: 'singlePacketFromBuffer',
    value: function singlePacketFromBuffer(buffer, callback) {
      var id = buffer[0];
      buffer = buffer.slice(1);

      var packet = new Packet(id, buffer);
      var fieldNames = Object.keys(packet.protocol.fields);

      fieldNames.forEach(function (fieldName) {
        var dataType = packet.protocol.fields[fieldName];
        var result = dataType.decode(buffer);

        buffer = buffer.slice(result.size);

        packet.fields[fieldName] = result.value;
      });

      callback(null, packet);
    }
  }]);

  return Packet;
})();

module.exports.Packet = Packet;
