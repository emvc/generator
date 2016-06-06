
var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var mkdirp = require('mkdirp');
var mocha = require('mocha');
var path = require('path');
var request = require('supertest');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;

var binPath = path.resolve(__dirname, '../bin/emvc');
var tempDir = path.resolve(__dirname, '../temp');

process.env.NODE_ENV = 'test';

describe('emvc(1)', function () {
  mocha.before(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  mocha.after(function (done) {
    this.timeout(30000);
    cleanup(done);
  });

  describe('(no args)', function () {
    var dir;
    var files;
    var output;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app', function (done) {
      run(dir, [], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        output = stdout;
        assert.equal(files.length, 25);
        done();
      });
    });

    it('should provide debug instructions', function () {
      assert.ok(/DEBUG=app-(?:[0-9\.]+):\* (?:\& )?npm start/.test(output));
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('server.js'), -1);
      assert.notEqual(files.indexOf('package.json'), -1);
    });

    it('should have jade templates', function () {
      assert.notEqual(files.indexOf('app/views/pages/error.jade'), -1);
      assert.notEqual(files.indexOf('app/views/pages/main.jade'), -1);
      assert.notEqual(files.indexOf('app/views/layout.jade'), -1);
    });

    it('should have a package.json file', function () {
      var file = path.resolve(dir, 'package.json');
      var contents = fs.readFileSync(file, 'utf8');

      assert.equal(contents, '{\n'
        + '  "name": ' + JSON.stringify(path.basename(dir)) + ',\n'
        + '  "version": "0.0.1",\n'
        + '  "private": true,\n'
        + '  "dependencies": {\n'
        + '    "body-parser": "~1.13.2",\n'
        + '    "bootable": "0.2.x",\n'
        + '    "bootable-environment": "0.2.x",\n'
        + '    "connect-powered-by": "0.1.x",\n'
        + '    "cookie-parser": "~1.3.5",\n'
        + '    "debug": "~2.2.0",\n'
        + '    "emvc": "*",\n'
        + '    "errorhandler": "1.x.x",\n'
        + '    "express": "~4.13.1",\n'
        + '    "jade": "~1.11.0",\n'
        + '    "method-override": "1.x.x",\n'
        + '    "morgan": "~1.6.1",\n'
        + '    "serve-favicon": "~2.3.0"\n'
        + '  },\n'
        + '  "scripts": {\n'
        + '    "start": "node server.js"\n'
        + '  }\n'
        + '}');
    });

    it('should have installable dependencies', function (done) {
      this.timeout(30000);
      npmInstall(dir, done);
    });

    // it('should export an emvc app from server.js', function () {
    //   var file = path.resolve(dir, 'server.js');
    //   var app = require(file);
    //   assert.equal(typeof app, 'function');
    //   assert.equal(typeof app.handle, 'function');
    // });

    it('should export an emvc app from server.js', function () {
      var file = path.resolve(dir, 'server.js');
      var app = require(file);
      assert.equal(typeof app, 'object');
      assert.equal(app.constructor.name, 'Application');
    });

    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'server.js');
      var app = require(file);

      request(app.express)
      .get('/')
      .expect(200, /<title>emvc<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'server.js');
      var app = require(file);

      request(app.express)
      .get('/does_not_exist')
      .expect(404, /Cannot GET \/does_not_exist/, done);
    });
  });

  describe('--ejs', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app with ejs templates', function (done) {
      run(dir, ['--ejs'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 24, 'should have 24 files');
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('server.js'), -1, 'should have app.js file');
      assert.notEqual(files.indexOf('package.json'), -1, 'should have package.json file');
    });

    it('should have ejs templates', function () {
      assert.notEqual(files.indexOf('app/views/pages/error.html.ejs'), -1, 'should have app/views/pages/error.html.ejs file');
      assert.notEqual(files.indexOf('app/views/pages/main.html.ejs'), -1, 'should have app/views/pages/main.html.ejs file');
    });

    it('should have installable dependencies', function (done) {
      this.timeout(30000);
      npmInstall(dir, done);
    });

    it('should export an emvc app from server.js', function () {
      var file = path.resolve(dir, 'server.js');
      var app = require(file);
      assert.equal(typeof app, 'object');
      assert.equal(app.constructor.name, 'Application');
    });

    it('should respond to HTTP request', function (done) {
      var file = path.resolve(dir, 'server.js');
      var app = require(file);

      request(app.express)
      .get('/')
      .expect(200, /<title>emvc<\/title>/, done);
    });

    it('should generate a 404', function (done) {
      var file = path.resolve(dir, 'server.js');
      var app = require(file);

      request(app.express)
      .get('/does_not_exist')
      .expect(404, /Cannot GET \/does_not_exist/, done);
    });
  });

  describe('--git', function () {
    var dir;
    var files;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should create basic app with git files', function (done) {
      run(dir, ['--git'], function (err, stdout) {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 26, 'should have 26 files');
        done();
      });
    });

    it('should have basic files', function () {
      assert.notEqual(files.indexOf('server.js'), -1, 'should have server.js file');
      assert.notEqual(files.indexOf('package.json'), -1, 'should have package.json file');
    });

    it('should have .gitignore', function () {
      assert.notEqual(files.indexOf('.gitignore'), -1, 'should have .gitignore file');
    });

    it('should have jade templates', function () {
      assert.notEqual(files.indexOf('app/views/pages/error.jade'), -1);
      assert.notEqual(files.indexOf('app/views/pages/main.jade'), -1);
      assert.notEqual(files.indexOf('app/views/layout.jade'), -1);
    });
  });

  describe('-h', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['-h'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: emvc/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        done();
      });
    });
  });


  describe('--help', function () {
    var dir;

    mocha.before(function (done) {
      createEnvironment(function (err, newDir) {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    mocha.after(function (done) {
      this.timeout(30000);
      cleanup(dir, done);
    });

    it('should print usage', function (done) {
      run(dir, ['--help'], function (err, stdout) {
        if (err) return done(err);
        var files = parseCreatedFiles(stdout, dir);
        assert.equal(files.length, 0);
        assert.ok(/Usage: emvc/.test(stdout));
        assert.ok(/--help/.test(stdout));
        assert.ok(/--version/.test(stdout));
        done();
      });
    });
  });
});

function cleanup(dir, callback) {
  if (typeof dir === 'function') {
    callback = dir;
    dir = tempDir;
  }

  rimraf(tempDir, function (err) {
    callback(err);
  });
}

function createEnvironment(callback) {
  var num = process.pid + Math.random();
  var dir = path.join(tempDir, ('app-' + num));

  mkdirp(dir, function ondir(err) {
    if (err) return callback(err);
    callback(null, dir);
  });
}

function npmInstall(dir, callback) {
  exec('npm install', {cwd: dir}, function (err, stderr) {
    if (err) {
      err.message += stderr;
      callback(err);
      return;
    }

    callback();
  });
}

function parseCreatedFiles(output, dir) {
  var files = [];
  var lines = output.split(/[\r\n]+/);
  var match;

  for (var i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      var file = match[1];

      if (dir) {
        file = path.resolve(dir, file);
        file = path.relative(dir, file);
      }

      file = file.replace(/\\/g, '/');
      files.push(file);
    }
  }

  return files;
}

function run(dir, args, callback) {
  var argv = [binPath].concat(args);
  var exec = process.argv[0];
  var stderr = '';
  var stdout = '';

  var child = spawn(exec, argv, {
    cwd: dir
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function ondata(str) {
    stdout += str;
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function ondata(str) {
    process.stderr.write(str);
    stderr += str;
  });

  child.on('close', onclose);
  child.on('error', callback);

  function onclose(code) {
    var err = null;

    try {
      assert.equal(stderr, '');
      assert.strictEqual(code, 0);
    } catch (e) {
      err = e;
    }

    callback(err, stdout.replace(/\x1b\[(\d+)m/g, '_color_$1_'));
  }
}
