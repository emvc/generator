var Controller = require('emvc').Controller;
var inherits = require('util').inherits;

function PagesController() {
  Controller.call(this);
}

inherits(PagesController, Controller);

PagesController.prototype.main = function() {
  this.title = 'emvc';
  this.render();
};

module.exports = PagesController;