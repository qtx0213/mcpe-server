var _get = function get(_x4, _x5, _x6) {
    var _again = true;
    _function: while (_again) {
        var object = _x4
            , property = _x5
            , receiver = _x6;
        desc = parent = getter = undefined;
        _again = false;
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);
        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);
            if (parent === null) {
                return undefined;
            } else {
                _x4 = parent;
                _x5 = property;
                _x6 = receiver;
                _again = true;
                continue _function;
            }
        } else if ('value' in desc) {
            return desc.value;
        } else {
            var getter = desc.get;
            if (getter === undefined) {
                return undefined;
            }
            return getter.call(receiver);
        }
    }
};

var _createClass = (function () {
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

function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass
            , enumerable: false
            , writable: true
            , configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var MAGIC_VALUE = [0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78];

var DataType = (function () {
  function DataType(size, value) {
    if (size === undefined) size = 0;

    this.size = size;
    this.value = value;
  }

  _createClass(DataType, [{
    key: 'allocateBuffer',
    value: function allocateBuffer() {
      var buffer = new Buffer(this.size);
      buffer.fill(0);

      return buffer;
    }
  }]);

  return DataType;
})();

var Magic = (function (_DataType) {
  _inherits(Magic, _DataType);

  function Magic() {
    var value = arguments.length <= 0 || arguments[0] === undefined ? MAGIC_VALUE : arguments[0];

    if (value === null) {
      value = MAGIC_VALUE;
    }

    _get(Object.getPrototypeOf(Magic.prototype), 'constructor', this).call(this, 16, value);
  }

  _createClass(Magic, [{
    key: 'encode',
    value: function encode() {
      return new Buffer(this.value);
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var value = new Buffer(buffer.slice(0, 16));

      return new Magic(value);
    }
  }]);

  return Magic;
})(DataType);

var Byte = (function (_DataType2) {
  _inherits(Byte, _DataType2);

  function Byte(value) {
    _get(Object.getPrototypeOf(Byte.prototype), 'constructor', this).call(this, 1, value);
  }

  _createClass(Byte, [{
    key: 'encode',
    value: function encode() {
      var buffer = this.allocateBuffer();

      buffer.writeInt8(this.value, 0);

      return buffer;
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var value = buffer.readInt8(0);

      return new Byte(value);
    }
  }]);

  return Byte;
})(DataType);

var PEBoolean = (function (_DataType3) {
  _inherits(PEBoolean, _DataType3);

  function PEBoolean(value) {
    _get(Object.getPrototypeOf(PEBoolean.prototype), 'constructor', this).call(this, 1, value);
  }

  _createClass(PEBoolean, [{
    key: 'encode',
    value: function encode() {
      var buffer = this.allocateBuffer();

      buffer.writeInt8(this.value ? 1 : 0, 0);

      return buffer;
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var value = buffer.readInt8(0) === 1;

      return new PEBoolean(value);
    }
  }]);

  return PEBoolean;
})(DataType);

var Short = (function (_DataType4) {
  _inherits(Short, _DataType4);

  function Short(value) {
    var signed = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    _get(Object.getPrototypeOf(Short.prototype), 'constructor', this).call(this, 2, value);

    this.signed = signed;
  }

  _createClass(Short, [{
    key: 'encode',
    value: function encode() {
      var buffer = this.allocateBuffer();
      var value = this.value;
      var signed = this.signed;

      if (signed) {
        buffer.writeInt16BE(value, 0);
      } else {
        buffer.writeUInt16BE(value, 0);
      }

      return buffer;
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var signed = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var value = undefined;

      if (signed) {
        value = buffer.readInt16BE(0);
      } else {
        value = buffer.readUInt16BE(0);
      }

      return new Short(value, signed);
    }
  }]);

  return Short;
})(DataType);

var UShort = (function (_Short) {
  _inherits(UShort, _Short);

  function UShort(value) {

    _get(Object.getPrototypeOf(UShort.prototype), 'constructor', this).call(this, value, false);
  }

  _createClass(UShort, null, [{
    key: 'decode',
    value: function decode(buffer) {
      return Short.decode(buffer, false);
    }
  }]);

  return UShort;
})(Short);

var Integer = (function (_DataType5) {
  _inherits(Integer, _DataType5);

  function Integer(value) {

    _get(Object.getPrototypeOf(Integer.prototype), 'constructor', this).call(this, 4, value);
  }

  _createClass(Integer, [{
    key: 'encode',
    value: function encode() {
      var buffer = this.allocateBuffer();

      buffer.writeInt32BE(this.value, 0);

      return buffer;
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var value = buffer.readInt32BE(0);

      return new Integer(value);
    }
  }]);

  return Integer;
})(DataType);

var Long = (function (_DataType6) {
  _inherits(Long, _DataType6);

  function Long(value) {

    _get(Object.getPrototypeOf(Long.prototype), 'constructor', this).call(this, 8, value);
  }

  _createClass(Long, [{
    key: 'encode',
    value: function encode() {
      var buffer = this.allocateBuffer();

      buffer.writeUIntBE(this.value, 2, 6);

      return buffer;
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {

      var value = buffer.readUIntBE(2, 6);

      return new Long(value);
    }
  }]);

  return Long;
})(DataType);

var PEString = (function (_DataType7) {
  _inherits(PEString, _DataType7);

  function PEString(value) {
    _get(Object.getPrototypeOf(PEString.prototype), 'constructor', this).call(this, value.length + 2, value);
  }

  _createClass(PEString, [{
    key: 'encode',
    value: function encode() {
      var buffer = this.allocateBuffer();
      var value = this.value;

      buffer.writeUInt16BE(value.length, 0);
      buffer.write(value, 2, value.length, 'ascii');

      return buffer;
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var length = buffer.readUInt16BE(0);
      var value = buffer.toString('ascii', 2, 2 + length);

      return new PEString(value);
    }
  }]);

  return PEString;
})(DataType);

var NullPayload = (function (_DataType8) {
  _inherits(NullPayload, _DataType8);

  function NullPayload(size) {
    var buffer = new Buffer(Array(size));

    _get(Object.getPrototypeOf(NullPayload.prototype), 'constructor', this).call(this, size, buffer);
  }

  _createClass(NullPayload, [{
    key: 'encode',
    value: function encode() {
      return new Buffer(Array(this.size));
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      return new NullPayload(buffer.length);
    }
  }]);

  return NullPayload;
})(DataType);

var Inet4Address = (function (_DataType9) {
  _inherits(Inet4Address, _DataType9);

  function Inet4Address(value) {
    _get(Object.getPrototypeOf(Inet4Address.prototype), 'constructor', this).call(this, 5, value);
  }

  _createClass(Inet4Address, [{
    key: 'encode',
    value: function encode() {
      var buffer = this.allocateBuffer();

      buffer.writeInt8(4, 0);

      this.value.forEach(function (part, index) {
        if (typeof part !== 'number') {
          part = parseInt(part);
        }

        buffer.writeUInt8(part, index + 1);
      });

      return buffer;
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var parts = [];

      // IP version
      buffer.readInt8(0);

      // 32-bit IP address (bits inverted)
      parts[0] = ~buffer.readInt8(1);
      parts[1] = ~buffer.readInt8(2);
      parts[2] = ~buffer.readInt8(3);
      parts[3] = ~buffer.readInt8(4);

      return new Inet4Address(parts);
    }
  }]);

  return Inet4Address;
})(DataType);

var AckPayload = (function (_DataType10) {
  _inherits(AckPayload, _DataType10);

  function AckPayload(sequences, byteLength) {
    sequences.sort(function (a, b) {
      return a - b;
    });

    if (typeof byteLength === 'undefined') {
      byteLength = AckPayload.calculateByteLength(sequences);
    }

    _get(Object.getPrototypeOf(AckPayload.prototype), 'constructor', this).call(this, byteLength, sequences);
  }

  _createClass(AckPayload, [{
    key: 'encode',
    value: function encode() {
      var sequences = this.value;
      var buffer = undefined;

      if (sequences.length === 1) {
        buffer = new Buffer(6);

        buffer.writeInt16BE(sequences.length, 0);
        buffer.writeInt8(0x01, 2);
        buffer.writeIntLE(sequences[0], 3, 3);

        return buffer;
      }

      throw new Error('ACK encoding for multiple packets not yet implemented');
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var offset = 0;
      var sequences = [];

      var count = buffer.readInt16BE(offset);
      offset += 2;

      while (count-- > 0) {

        var flag = buffer.readInt8(offset);
        offset += 1;

        if (flag === 0) {
          var start = buffer.readIntLE(offset, 3);
          offset += 3;

          var end = buffer.readIntLE(offset, 3);
          offset += 3;

          for (var i = start; i < end; i++) {
            sequences.push(i);
          }
        } else {
          sequences.push(buffer.readIntLE(offset, 3));
          offset += 3;
        }
      }

      return new AckPayload(sequences, offset);
    }
  }, {
    key: 'calculateByteLength',
    value: function calculateByteLength(sequences) {
      if (sequences.length === 1) {
        return 6;
      }

      var length = 2;

      var pointer = 1;
      var start = sequences[0],
          last = start;

      while (pointer < sequences.length) {
        var current = sequences[pointer];
        var diff = current - last;

        if (diff === 1) {
          last = current;
        } else if (diff > 1) {
          if (start === last) {
            length += 4;
          } else {
            length += 7;
            start = last = current;
          }
        }
      }

      return length;
    }
  }]);

  return AckPayload;
})(DataType);

var PEByteArray = (function (_DataType11) {
  _inherits(PEByteArray, _DataType11);

  function PEByteArray(size) {
    _get(Object.getPrototypeOf(PEByteArray.prototype), 'constructor', this).call(this, size, new Buffer(Array(size)));
  }

  _createClass(PEByteArray, [{
    key: 'encode',
    value: function encode() {
      return new Buffer(Array(this.size));
    }
  }], [{
    key: 'decode',
    value: function decode(buffer) {
      var size = buffer.readInt32BE(0);

      return new Buffer(buffer.slice(1, size + 1));
    }
  }]);

  return PEByteArray;
})(DataType);

module.exports = {
  Magic: Magic,
  Boolean: PEBoolean,
  Byte: Byte,
  Short: Short,
  UShort: UShort,
  Integer: Integer,
  Long: Long,
  String: PEString,
  NullPayload: NullPayload,
  Inet4Address: Inet4Address,
  AckPayload: AckPayload,
  ByteArray: PEByteArray
};
