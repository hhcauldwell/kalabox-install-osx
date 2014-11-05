
// dependencies
var async = require('async'),
  disk = require('./lib/disk.js'),
  download = require('./lib/download.js'),
  firewall = require('./lib/firewall.js'),
  installer = require('./lib/installer.js'),
  internet = require('./lib/internet.js'),
  path = require('path'),
  shell = require('./lib/shell.js'),
  sys_profiler = require('./lib/sys_profiler.js');

// constants
var INSTALL_MB = 30 * 1000,
  B2D_URL_V1_3_0 = 'https://github.com/boot2docker/osx-installer/releases/download/v1.3.0/Boot2Docker-1.3.0.pkg';

// variables
var b2dIsInstalled,
  firewallIsOkay;

var main = function () {

  function sendMessage(msg) {
    console.log(msg);
  };

  function newline() { sendMessage(''); };

  function fail(msg) {
    console.log('*** ' + msg + ' ***');
    process.exit(1);
  };

  async.series([

    // Check if boot2docker is already installed.
    function (next) {
      sendMessage('Checking if Boot2Docker is installed...');
      sys_profiler.isAppInstalled('Boot2Docker', function (err, isInstalled) {
        if (err) throw err;
        var msg = isInstalled ? 'is' : 'is NOT';
        sendMessage(' - Boot2Docker: ' + msg + ' already installed.');
        newline();
        b2dIsInstalled = isInstalled;
        next(null);
      });
    },

    // Check the firewall settings.
    function (next) {
      sendMessage('Checking firewall settings...');
      firewall.isOkay(function (isOkay) {
        var msg = isOkay ? 'OK' : 'NOT OK';
        sendMessage(' - Firewall settings: ' + msg);
        newline();
        firewallIsOkay = isOkay;
        next(null);
      });
    },

    // Check for access to the internets.
    function (next) {
      sendMessage('Checking internet access...');
      internet.check('www.google.com', function (err) {
        var msg = err === null ? 'OK' : 'NOT OK';
        sendMessage(' - Internet access: ' + msg);
        if (err !== null) {
          fail('INTERNET IS NOT ACCESSABLE!');
        }
        newline();
        next(null);
      });
    },

    // Check available disk space for install.
    function (next) {
      sendMessage('Checking disk free space...');
      disk.getFreeSpace(function (err, freeMbs) {
        freeMbs = Math.round(freeMbs);
        var enoughFreeSpace = freeMbs > INSTALL_MB;
        sendMessage(' - ' + freeMbs + ' MB free of the required ' + INSTALL_MB + ' MB.');
        if (!enoughFreeSpace) {
          fail('NOT ENOUGH DISK SPACE FOR INSTALL!');
        }
        newline();
        next(null);
      });
    },

    // Download dependencies to temp dir.
    function (next) {
      var urls = b2dIsInstalled ? [

      ] : [
        B2D_URL_V1_3_0
      ];
      if (urls.length > 0) {
        dest = disk.getTempDir();
        sendMessage('Downloading dependencies...');
        download.downloadFiles(urls, dest, function () {
          next(null);
        });
      } else {
        next(null);
      }
    },

    // Install packages.
    function (next) {
      var tempDir = disk.getTempDir();
      var pkg = path.join(tempDir, path.basename(B2D_URL_V1_3_0));
      disk.getMacVolume(function (err, volume) {
        if (err) throw err;
        sendMessage('Installing Packages...');
        sendMessage(' - Installing: ' + pkg);
        var child = installer.installAsync(pkg, volume);
        child.stdout.on('data', function (data) {
          console.log(' --- ' + data);          
        });
        child.stdout.on('end', function () {
          console.log(' - Finished installing: ' + pkg);
          next();
        });
        child.stderr.on('data', function (data) {
          console.log('ERR->' + data);
          //throw new Error(data);          
        });
      });
    },

    // Init and start boot2docker
    function (next) {
      ['init', 'start'].forEach(function (action) {
        var cmd = 'boot2docker ' + action;
        sendMessage(' - Running: ' + cmd);
        var child = shell.execAsync(cmd);
        child.stdout.on('data', function (data) {
          console.log(' --- ' + data);
        });
        child.stdout.on('end', function () {
          sendMessage(' - Finished running: ' + cmd);
          next();
        });
      });
    }

  ]);



  // Check if boot2docker is already installed.
    // @todo: use osx 'system_profiler' command
    //system_profile.isApplicationInstalled()

  // Check firewall settings.
    // @todo: use osx 'socketfilterfw' command
    //firewall.isSettingsOkay()

  // Download dependencies in parallel
    // Download boot2docker.
      // @todo: use 'npm install download' module
    // Download Kalabox image.
      // @todo: use 'npm install download' module
      //downloader.downloadFiles()
  /*download.downloadFiles([
      B2D_URL_V1_3_0   
    ],
    disk.getTempDir(),
    function (err) {
      if (err) throw err;
      console.log('done!');
    }
  );*/

  // Install boot2docker.
    // @todo: find mac volume
    // @todo: check free disk space?
    // @todo: use  osx 'installer' command

};

main();
