'use strict';

var chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  sinon = require('sinon'),
  rewire = require('rewire'),
  virtualBox = rewire('../lib/virtualBox.js');

describe('virtualBox.js', function () {

  describe('#isRunningRaw()', function () {

    var exampleDataPositive = ' 2127 ??         0:01.88 /Applications/VirtualBox.app/Contents/MacOS/VBoxXPCOMIPCD';
    var exampleDataNegative = ' 2506 ??         0:00.02 /Applications/Steam.app/Contents/MacOS/ipcserver';

    it('should return TRUE when VirtualBox.app is running.', function (done) {
      var expected = true;
      var result = virtualBox.isRunningRaw(exampleDataPositive);
      expect(result).to.equal(expected);
      done();
    });

    it('should return FALSE when VirtualBox.app is NOT running.', function (done) {
      var expected = false;
      var result = virtualBox.isRunningRaw(exampleDataNegative);
      expect(result).to.equal(expected);
      done();
    });
  
  });

  /*describe('#isRunning()', function () {
    
    it('should return TRUE when VirtualBox.app is running.', function (done) {

    });

  });*/

});
