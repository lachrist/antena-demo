
var Receptor = require("antena/receptor");

module.exports = Receptor({}).merge({
  "random": Receptor({
    onconnect: function (path, con) {
      function loop () {
        var random = Math.round(2 * 1000 * Math.random());
        con.send(random);
        setTimeout(loop, random);
      }
      loop();
    }
  }),
  "ping": Receptor({
    onrequest: function (method, path, headers, body, callback) {
      callback(200, "ok", {}, "pong");
    }
  })
});
