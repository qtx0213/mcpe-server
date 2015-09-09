'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _netNetworkHandler = require('./net/NetworkHandler');

var _netNetworkHandler2 = _interopRequireDefault(_netNetworkHandler);

var Server = (function (_NetworkHandler) {
  _inherits(Server, _NetworkHandler);

  function Server() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$address = _ref.address;
    var address = _ref$address === undefined ? '0.0.0.0' : _ref$address;
    var _ref$port = _ref.port;
    var port = _ref$port === undefined ? 19132 : _ref$port;

    _classCallCheck(this, Server);

    _get(Object.getPrototypeOf(Server.prototype), 'constructor', this).call(this);

    this.localAddress = address;
    this.localPort = port;
  }

  _createClass(Server, [{
    key: 'listen',
    value: function listen(callback) {
      var _this = this;

      var socket = this.socket;
      var localAddress = this.localAddress;
      var localPort = this.localPort;

      socket.bind(localPort, localAddress, function () {
        _this.emit('listen');
      });
    }
  }]);

  return Server;
})(_netNetworkHandler2['default']);

module.exports.Server = Server;
