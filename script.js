
var Spawn = require("antena-spawn/worker");
var CommonjsEditor = require("commonjs-editor");
var StdioGui = require("stdio-gui");

function noop () {}

window.onload = function () {
  document.body.style.padding = "20px";
  var editors = {
    child: CommonjsEditor(document.getElementById("editor-child"), PLAYGROUNDS.child),
    receptor: CommonjsEditor(document.getElementById("editor-receptor"), PLAYGROUNDS.receptor)
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
      child = Spawn(editors.child.getBundle(), [], eval(editors.receptor.getBundle()));
      stdiogui(child.stdio);
    }
  }
}
