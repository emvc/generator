// Draw routes.  emvc's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the emvc
// Guide on [routing](http://emvc.github.io/emvc/guide/routing) for additional
// information.
module.exports = function routes() {
  this.root('pages#main');
};
