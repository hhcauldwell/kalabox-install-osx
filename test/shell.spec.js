'use strict';

var assert = require('chai').assert,
  expect = require('chai').expect,
  sinon = require('sinon'),
  rewire = require('rewire'),
  shell = rewire('../lib/shell.js');

describe('shell.js', function () {
  
  describe('#exec()', function () {

    it('should return a null error and the correct output.', function (done) {
      var cmd = 'which node',
      expected = '/usr/local/bin/node\n';
      shell.exec(cmd, function (err, output) {
        expect(err).to.equal(null);
        expect(output).to.equal(expected)
        done();
      });
    });

    it('should return an error for a failed command.', function (done) {
      var cmd = 'which -fu this_is_not_a_real_executable';
      var expectedData = 'which: illegal option -- f\nusage: which [-as] program ...\n';
      var expectedError = new Error({
        code: 1,
        data: expectedData
      });
      shell.exec(cmd, function (err, output) {
        expect(err).to.not.equal(null);
        expect(err.code).to.equal(expectedError.code);
        expect(err.data).to.equal(expectedError.data);
        done();
      });
    });

  });

  describe('#execAsync()', function () {

    it('should call the correct child.stdout callbacks.', function (done) {
      var cmd = "echo 'bazinga'";
      var child = shell.execAsync(cmd);
      var onData = sinon.spy();
      var api = {
        onEnd: function () {}
      };
      var onEnd = sinon.stub(api, 'onEnd', function () {
        sinon.assert.callCount(onData, 1);
        sinon.assert.calledWithExactly(onData, 'bazinga\n');
        sinon.assert.callCount(onEnd, 1);
        sinon.assert.calledWithExactly(onEnd);
        done();
      });
      child.stdout.on('data', onData);
      child.stdout.on('end', onEnd);
    });

    it('should call the correct child.stderr callbacks.', function (done) {
      var cmd = 'not-a-real-command';
      var expectedOutput = '/bin/sh: not-a-real-command: command not found\n';
      var child = shell.execAsync(cmd);
      var onData = sinon.spy();
      child.stderr.on('data', onData);
      child.stdout.on('end', function () {
        sinon.assert.callCount(onData, 1);
        sinon.assert.calledWithExactly(onData, expectedOutput);
        done();
      });
    });

  });

});
