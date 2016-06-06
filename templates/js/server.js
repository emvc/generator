var emvc = require('emvc');
var bootable = require('bootable');
var bootableEnv = require('bootable-environment');

// Create a new application and initialize it with *required* support for
// controllers and views.  Move (or remove) these lines at your own peril.
var app = new emvc.Application();
app.phase(emvc.boot.controllers(__dirname + '/app/controllers'));
app.phase(emvc.boot.views());

// Add phases to configure environments, run initializers, draw routes, and
// start an HTTP server.  Additional phases can be inserted as needed, which
// is particularly useful if your application handles upgrades from HTTP to
// other protocols such as WebSocket.
app.phase(bootableEnv(__dirname + '/config/environments'));
app.phase(bootable.initializers(__dirname + '/config/initializers'));
app.phase(emvc.boot.routes(__dirname + '/config/routes'));
if (!module.parent) app.phase(emvc.boot.httpServer(3000, '0.0.0.0'));

// Boot the application.  The phases registered above will be executed
// sequentially, resulting in a fully initialized server that is listening
// for requests.

app.boot(function(err) {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    return process.exit(-1);
  }

  module.exports = app;
});