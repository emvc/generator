var express = require('express');
var poweredBy = require('connect-powered-by');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var path = require('path');

module.exports = function() {
  // Use middleware.  Additional [third-party](https://github.com/senchalabs/connect#middleware)
  // middleware available as separate modules.
  if ('development' === this.env) {
    this.use(logger('dev'));
  } else if ('production' === this.env) {
    this.use(logger('combined'));
  }

  this.use(poweredBy('emvc'));
  //this.use(favicon());
  this.use(bodyParser.urlencoded({ extended: false }));
  this.use(bodyParser.json());
  this.use(methodOverride());{css}
  this.use(express.static(path.join(__dirname, '/../../public')));
  this.use(this.router);

  if ('development' === this.env) {
    this.use(errorHandler());
  } else {
    this.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });
  }
};
