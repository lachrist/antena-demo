
var Spawn = require("antena-spawn/worker");
var CommonjsPlayground = require("commonjs-playground");
var Playgrounds = require("./playgrounds.js");
var StdioGui = require("stdio-gui");

function noop () {}

window.onload = function () {
  document.body.style.padding = "20px";
  var editors = {
    child: CommonjsPlayground(document.getElementById("editor-child"), Playgrounds.child),
    receptor: CommonjsPlayground(document.getElementById("editor-receptor"), Playgrounds.receptor)
  };
  var stdiogui = StdioGui(document.getElementById("stdio"), {
    onctrl: function (key) { child && key === "c" && document.getElementById("spawn").onclick() }
  });
  var child = null;
  document.getElementById("spawn").onclick = function () {
    this.innerText = child ? "Spawn" : "Kill";
    this.style.backgroundColor = child ? "green" : "red";
    editors.receptor.setReadOnly(!child);
    editors.child.setReadOnly(!child);
    if (child) {
      child.kill();
      child = null;
    } else {
      child = Spawn({content:editors.child.getBundle()}, [], eval(editors.receptor.getBundle()));
      stdiogui(child.stdio);
    }
  }
}
