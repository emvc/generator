'use strict';

const Controller = require('emvc').Controller;

class PagesController extends Controller {

  main() {
    this.title = 'emvc';
    this.render();
  }

}

module.exports = PagesController;