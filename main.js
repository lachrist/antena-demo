
var Fs = require("fs");
var Path = require("path");
var Browserify = require("browserify");
var Playground = require("commonjs-editor/playground");

module.exports = function (receptor, childs, callback) {
  Playground(receptor, function (error, rplayground) {
    if (error)
      return callback(error);
    Playground(child, function (error, cplayground) {
      if (error)
        return callback(error);
      Browserify(Path.join(__dirname, "script.js")).bundle(function (error, bundle) {
        if (error)
          return callback(error);
        var script = "var PLAYGROUNDS = "+JSON.stringify({
          receptor: rplayground,
          child: cplayground
        }, null, 2)+";\n"+bundle.toString("utf8");
        Fs.readFile(Path.join(__dirname, "template.html"), "utf8", function (error, html) {
          if (error)
            return callback(error);
          callback(null, html.replace("<!-- SCRIPT -->", function () {
            return "<script>"+script.replace("</script>", "<\\/script>")+"</script>";
          });
        });
      });
    })
  });
};
