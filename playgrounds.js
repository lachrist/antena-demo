module.exports = {
  "receptor": {
    "initial": "\nvar Receptor = require(\"antena/receptor\");\n\nmodule.exports = Receptor({}).merge({\n  \"random\": Receptor({\n    onconnect: function (path, con) {\n      function loop () {\n        var random = Math.round(2 * 1000 * Math.random());\n        con.send(random);\n        setTimeout(loop, random);\n      }\n      loop();\n    }\n  }),\n  \"ping\": Receptor({\n    onrequest: function (method, path, headers, body, callback) {\n      callback(200, \"ok\", {}, \"pong\");\n    }\n  })\n});\n",
    "modules": [
      "antena/receptor"
    ],
    "require": "require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\nmodule.exports = function (receptor, path, con) {\n  var segments = path.split(\"/\");\n  segments.shift();\n  while (true) {\n    if (receptor._onconnect)\n      return receptor._onconnect(\"/\"+segments.join(\"/\"), con);\n    receptor = (segments[0] in receptor._childs) ? receptor._childs[segments.shift()] : receptor._default;\n  }\n};\n\n},{}],2:[function(require,module,exports){\n\nmodule.exports = function onrequest (receptor, method, path, headers, body, callback) {\n  var segments = path.split(\"/\");\n  segments.shift();\n  while (true) {\n    if (receptor._onrequest)\n      return receptor._onrequest(method, \"/\"+segments.join(\"/\"), headers, body, callback);\n    receptor = (segments[0] in receptor._childs) ? receptor._childs[segments.shift()] : receptor._default;\n  }\n};\n\n},{}],3:[function(require,module,exports){\n\nvar Trace = require(\"./trace.js\");\nvar Merge = require(\"./merge.js\");\n\nexports.trace = Trace(exports);\nexports.merge = Merge(exports);\n\n},{\"./merge.js\":4,\"./trace.js\":5}],4:[function(require,module,exports){\n\nmodule.exports = function (prototype) {\n  return function (receptors) {\n    for (var key in receptors) {\n      if (!receptors[key]._childs && !(receptors[key]._onrequest && receptors[key]._onconnect)) {\n        throw new Error(\"childs[\"+JSON.stringify(key)+\"] is not a receptor\");\n      }\n    }\n    var self = Object.create(prototype);\n    self._childs = receptors;\n    self._default = this;\n    return self;\n  };\n};\n\n},{}],5:[function(require,module,exports){\n\nvar SocketLog = require(\"../../util/socket-log.js\");\nvar Onrequest = require(\"../dispatch/onrequest.js\");\nvar Onconnect = require(\"../dispatch/onconnect.js\");\n\nvar rcounter = 0;\nvar ccounter = 0;\n\nfunction onrequest (method, path, headers, body, callback) {\n  var id = rcounter++;\n  var name = this._name;\n  var receptor = this._receptor;\n  console.log(name+\"req#\"+id+\" \"+method+\" \"+path+\" \"+JSON.stringify(headers)+\" \"+body);\n  Onrequest(receptor, method, path, headers, body, function (status, reason, headers, body) {\n    console.log(name+\"res#\"+id+\" \"+status+\" \"+reason+\" \"+JSON.stringify(headers)+\" \"+body);\n    callback(status, reason, headers, body);\n  });\n}\n\nfunction onconnect (path, con) {\n  var id = ccounter++;\n  console.log(this._name+\"con#\"+id+\" \"+path);\n  Onconnect(this._receptor, path, SocketLog(con, this._name+\"con#\"+id));\n}\n\nmodule.exports = function (prototype) {\n  return function (name) {\n    var self = Object.create(prototype);\n    self._onrequest = onrequest;\n    self._onconnect = onconnect;\n    self._receptor = this;\n    self._name = name || \"\";\n    return self;\n  };\n};\n\n},{\"../../util/socket-log.js\":6,\"../dispatch/onconnect.js\":1,\"../dispatch/onrequest.js\":2}],6:[function(require,module,exports){\n\nvar Events = require(\"events\");\n\nmodule.exports = function (con, name) {\n  var wrapper = new Events();\n  wrapper.send = function (message) {\n    console.log(name+\" >> \"+message);\n    con.send(message);\n  };\n  wrapper.close = function (code, reason) {\n    console.log(name+\" close \"+code+\" \"+reason);\n    con.close(code, reason);\n  };\n  con.on(\"message\", function (message) {\n    console.log(name+\" << \"+message);\n    wrapper.emit(\"message\", message);\n  });\n  con.on(\"close\", function (code, reason) {\n    console.log(name+\" onclose \"+code+\" \"+reason);\n    wrapper.emit(\"close\", code, reason);\n  });\n  con.on(\"open\", function () {\n    console.log(name+\" onopen\");\n    wrapper.emit(\"open\");\n  });\n  con.on(\"error\", function (error) {\n    console.log(name+\" onerror \"+error.message);\n    wrapper.emit(\"error\", error);\n  });\n  return wrapper;\n};\n\n},{\"events\":7}],7:[function(require,module,exports){\n// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereby granted, free of charge, to any person obtaining a\n// copy of this software and associated documentation files (the\n// \"Software\"), to deal in the Software without restriction, including\n// without limitation the rights to use, copy, modify, merge, publish,\n// distribute, sublicense, and/or sell copies of the Software, and to permit\n// persons to whom the Software is furnished to do so, subject to the\n// following conditions:\n//\n// The above copyright notice and this permission notice shall be included\n// in all copies or substantial portions of the Software.\n//\n// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\nfunction EventEmitter() {\n  this._events = this._events || {};\n  this._maxListeners = this._maxListeners || undefined;\n}\nmodule.exports = EventEmitter;\n\n// Backwards-compat with node 0.10.x\nEventEmitter.EventEmitter = EventEmitter;\n\nEventEmitter.prototype._events = undefined;\nEventEmitter.prototype._maxListeners = undefined;\n\n// By default EventEmitters will print a warning if more than 10 listeners are\n// added to it. This is a useful default which helps finding memory leaks.\nEventEmitter.defaultMaxListeners = 10;\n\n// Obviously not all Emitters should be limited to 10. This function allows\n// that to be increased. Set to zero for unlimited.\nEventEmitter.prototype.setMaxListeners = function(n) {\n  if (!isNumber(n) || n < 0 || isNaN(n))\n    throw TypeError('n must be a positive number');\n  this._maxListeners = n;\n  return this;\n};\n\nEventEmitter.prototype.emit = function(type) {\n  var er, handler, len, args, i, listeners;\n\n  if (!this._events)\n    this._events = {};\n\n  // If there is no 'error' event listener then throw.\n  if (type === 'error') {\n    if (!this._events.error ||\n        (isObject(this._events.error) && !this._events.error.length)) {\n      er = arguments[1];\n      if (er instanceof Error) {\n        throw er; // Unhandled 'error' event\n      } else {\n        // At least give some kind of context to the user\n        var err = new Error('Uncaught, unspecified \"error\" event. (' + er + ')');\n        err.context = er;\n        throw err;\n      }\n    }\n  }\n\n  handler = this._events[type];\n\n  if (isUndefined(handler))\n    return false;\n\n  if (isFunction(handler)) {\n    switch (arguments.length) {\n      // fast cases\n      case 1:\n        handler.call(this);\n        break;\n      case 2:\n        handler.call(this, arguments[1]);\n        break;\n      case 3:\n        handler.call(this, arguments[1], arguments[2]);\n        break;\n      // slower\n      default:\n        args = Array.prototype.slice.call(arguments, 1);\n        handler.apply(this, args);\n    }\n  } else if (isObject(handler)) {\n    args = Array.prototype.slice.call(arguments, 1);\n    listeners = handler.slice();\n    len = listeners.length;\n    for (i = 0; i < len; i++)\n      listeners[i].apply(this, args);\n  }\n\n  return true;\n};\n\nEventEmitter.prototype.addListener = function(type, listener) {\n  var m;\n\n  if (!isFunction(listener))\n    throw TypeError('listener must be a function');\n\n  if (!this._events)\n    this._events = {};\n\n  // To avoid recursion in the case that type === \"newListener\"! Before\n  // adding it to the listeners, first emit \"newListener\".\n  if (this._events.newListener)\n    this.emit('newListener', type,\n              isFunction(listener.listener) ?\n              listener.listener : listener);\n\n  if (!this._events[type])\n    // Optimize the case of one listener. Don't need the extra array object.\n    this._events[type] = listener;\n  else if (isObject(this._events[type]))\n    // If we've already got an array, just append.\n    this._events[type].push(listener);\n  else\n    // Adding the second element, need to change to array.\n    this._events[type] = [this._events[type], listener];\n\n  // Check for listener leak\n  if (isObject(this._events[type]) && !this._events[type].warned) {\n    if (!isUndefined(this._maxListeners)) {\n      m = this._maxListeners;\n    } else {\n      m = EventEmitter.defaultMaxListeners;\n    }\n\n    if (m && m > 0 && this._events[type].length > m) {\n      this._events[type].warned = true;\n      console.error('(node) warning: possible EventEmitter memory ' +\n                    'leak detected. %d listeners added. ' +\n                    'Use emitter.setMaxListeners() to increase limit.',\n                    this._events[type].length);\n      if (typeof console.trace === 'function') {\n        // not supported in IE 10\n        console.trace();\n      }\n    }\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\nEventEmitter.prototype.once = function(type, listener) {\n  if (!isFunction(listener))\n    throw TypeError('listener must be a function');\n\n  var fired = false;\n\n  function g() {\n    this.removeListener(type, g);\n\n    if (!fired) {\n      fired = true;\n      listener.apply(this, arguments);\n    }\n  }\n\n  g.listener = listener;\n  this.on(type, g);\n\n  return this;\n};\n\n// emits a 'removeListener' event iff the listener was removed\nEventEmitter.prototype.removeListener = function(type, listener) {\n  var list, position, length, i;\n\n  if (!isFunction(listener))\n    throw TypeError('listener must be a function');\n\n  if (!this._events || !this._events[type])\n    return this;\n\n  list = this._events[type];\n  length = list.length;\n  position = -1;\n\n  if (list === listener ||\n      (isFunction(list.listener) && list.listener === listener)) {\n    delete this._events[type];\n    if (this._events.removeListener)\n      this.emit('removeListener', type, listener);\n\n  } else if (isObject(list)) {\n    for (i = length; i-- > 0;) {\n      if (list[i] === listener ||\n          (list[i].listener && list[i].listener === listener)) {\n        position = i;\n        break;\n      }\n    }\n\n    if (position < 0)\n      return this;\n\n    if (list.length === 1) {\n      list.length = 0;\n      delete this._events[type];\n    } else {\n      list.splice(position, 1);\n    }\n\n    if (this._events.removeListener)\n      this.emit('removeListener', type, listener);\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.removeAllListeners = function(type) {\n  var key, listeners;\n\n  if (!this._events)\n    return this;\n\n  // not listening for removeListener, no need to emit\n  if (!this._events.removeListener) {\n    if (arguments.length === 0)\n      this._events = {};\n    else if (this._events[type])\n      delete this._events[type];\n    return this;\n  }\n\n  // emit removeListener for all listeners on all events\n  if (arguments.length === 0) {\n    for (key in this._events) {\n      if (key === 'removeListener') continue;\n      this.removeAllListeners(key);\n    }\n    this.removeAllListeners('removeListener');\n    this._events = {};\n    return this;\n  }\n\n  listeners = this._events[type];\n\n  if (isFunction(listeners)) {\n    this.removeListener(type, listeners);\n  } else if (listeners) {\n    // LIFO order\n    while (listeners.length)\n      this.removeListener(type, listeners[listeners.length - 1]);\n  }\n  delete this._events[type];\n\n  return this;\n};\n\nEventEmitter.prototype.listeners = function(type) {\n  var ret;\n  if (!this._events || !this._events[type])\n    ret = [];\n  else if (isFunction(this._events[type]))\n    ret = [this._events[type]];\n  else\n    ret = this._events[type].slice();\n  return ret;\n};\n\nEventEmitter.prototype.listenerCount = function(type) {\n  if (this._events) {\n    var evlistener = this._events[type];\n\n    if (isFunction(evlistener))\n      return 1;\n    else if (evlistener)\n      return evlistener.length;\n  }\n  return 0;\n};\n\nEventEmitter.listenerCount = function(emitter, type) {\n  return emitter.listenerCount(type);\n};\n\nfunction isFunction(arg) {\n  return typeof arg === 'function';\n}\n\nfunction isNumber(arg) {\n  return typeof arg === 'number';\n}\n\nfunction isObject(arg) {\n  return typeof arg === 'object' && arg !== null;\n}\n\nfunction isUndefined(arg) {\n  return arg === void 0;\n}\n\n},{}],\"antena/receptor\":[function(require,module,exports){\n\nvar Prototype = require(\"./prototype\");\n\nfunction onrequest (method, path, headers, body, callback) {\n  callback(400, \"no-handler\", {}, this._stack);\n}\n\nfunction onconnect (path, con) {\n  con.send(this._stack);\n  con.close(4000, \"no-handler\");\n}\n\nmodule.exports = function (methods) {\n  var self = Object.create(Prototype);\n  if (typeof methods.onrequest !== \"function\" && typeof methods.onconnect !== \"function\")\n    self._stack = (new Error(\"No handler\")).stack;\n  self._onrequest = typeof methods.onrequest === \"function\" ? methods.onrequest : onrequest;\n  self._onconnect = typeof methods.onconnect === \"function\" ? methods.onconnect : onconnect;\n  return self;\n};\n\n},{\"./prototype\":3}]},{},[]);\n"
  },
  "child": {
    "initial": "\nvar emitters = process.emitter.split([\"random\", \"unhandled\", \"ping\"]);\n\n// Websocket connection //\nvar con = emitters.random.connect(\"/\");\ncon.on(\"open\", function () { console.log(\"connection establised\") });\ncon.on(\"message\", function (message) { console.log(message) });\n\n// Synchronous XMLHttpRequest //\nvar [error, status, reason, headers, body] = emitters.unhandled.request(\"GET\", \"/\", {}, \"\");\nif (error)\n  throw error;\nconsole.log(status+\" \"+reason);\n\n// Asynchronous XMLHttpRequest //\nvar counter = 0;\nsetInterval(function () {\n  var id = ++counter;\n  console.log(\"ping\"+id);\n  emitters.ping.request(\"GET\", \"/\", {}, \"\", function (error, status, reason, headers, body) {\n    if (error || status !== 200)\n      throw error || new Error(status+\" \"+reason);\n    console.log(body+id);\n  });\n}, 1000);\n",
    "modules": [],
    "require": "(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({},{},[]);\n"
  }
};
