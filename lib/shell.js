/**
  * @file
  * Library for executing shell commands.
  *
  */

'use strict';

var _shell = require('shelljs');

module.exports.execAsync = function (cmd) {
  return _shell.exec(cmd, {async:true, silent:true});
};

module.exports.exec = function (cmd, callback) {
  var opts = { silent: true }; // but deadly
  _shell.exec(cmd, opts, function (code, data) {
    var err = null;
    if (code !== 0) {
      err = new Error('code: ' + code + ", msg: " + data.substring(0, 1024));
    }
    callback(err, data);
  });
};

module.exports.execAdminAsync = function (cmd) {
  var appleScript = 'do shell script "' + cmd + '" with administrator privileges';
  var shellScript = 'osascript -e \'' + appleScript + '\'';
  return this.execAsync(shellScript);
};

module.exports.execAdmin = function (cmd, callback) {
  var appleScript = 'do shell script "' + cmd + '" with administrator privileges';
  var shellScript = 'osascript -e \'' + appleScript + '\'';
  this.exec(shellScript, callback);
};

module.exports.psAll = function (callback) {
  var cmd = 'ps -A';
  this.exec(cmd, callback);
};
