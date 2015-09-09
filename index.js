'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libServer = require('./lib/Server');

var _libServer2 = _interopRequireDefault(_libServer);

var _libClient = require('./lib/Client');

var _libClient2 = _interopRequireDefault(_libClient);

exports['default'] = {
  Client: _libClient2['default'],
  Server: _libServer2['default']
};
module.exports = exports['default'];