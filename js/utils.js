var debug, decodeJSON, delay, getScreenHeight, getScreenWidth, hide, htmlDecode, htmlEncode, loadURLParamsUsing, log, logError, repeat, show, strToBoolean, tinaviz,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

tinaviz = {};

delay = function(t, f) {
  return setTimeout(f, t);
};

repeat = function(t, f) {
  return setInterval(f, t);
};

log = function(msg) {
  try {
    return console.log(msg);
  } catch (e) {

  }
};

debug = function(msg) {
  try {
    return console.log(msg);
  } catch (e) {

  }
};

logError = function(msg) {
  try {
    return console.error(msg);
  } catch (e) {
    alert(msg);
  }
};

getScreenWidth = function() {
  var x;
  x = 0;
  if (self.innerHeight) {
    x = self.innerWidth;
  } else if (document.documentElement && document.documentElement.clientHeight) {
    x = document.documentElement.clientWidth;
  } else {
    if (document.body) x = document.body.clientWidth;
  }
  return x;
};

getScreenHeight = function() {
  var y;
  y = 0;
  if (self.innerHeight) {
    y = self.innerHeight;
  } else if (document.documentElement && document.documentElement.clientHeight) {
    y = document.documentElement.clientHeight;
  } else {
    if (document.body) y = document.body.clientHeight;
  }
  return y;
};

show = function(k, speed) {
  var o;
  if (speed == null) speed = "slow";
  o = (typeof k) === "string" ? $(k) : k;
  return o.fadeIn(speed);
};

hide = function(k, speed) {
  var o;
  if (speed == null) speed = "slow";
  o = (typeof k) === "string" ? $(k) : k;
  return o.fadeOut(speed);
};

strToBoolean = function(s) {
  switch (s.toLowerCase()) {
    case "true":
    case "yes":
    case "on":
    case "1":
      return true;
    case "false":
    case "no":
    case "off":
    case "0":
    case null:
      return false;
    default:
      return Boolean(s);
  }
};

loadURLParamsUsing = function(config) {
  var current, key, param, value, _i, _len, _ref, _ref2;
  _ref = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    param = _ref[_i];
    _ref2 = param.split('='), key = _ref2[0], value = _ref2[1];
    if (__indexOf.call(config, key) >= 0) {
      current = _(config[key]);
      if (current.isNumber) {
        config[key] = parseFloat(value);
      } else if (current.isBoolean) {
        strToBoolean(value);
        config[key] = parseBool(value);
      } else if (current.isString) {
        config[key] = "" + value;
      } else {
        alert("UTIL cannot overwrite param " + key + " (" + config[key] + ") with " + value);
      }
    }
  }
  return config;
};

htmlEncode = function(value) {
  return $("<div/>").text(value).html();
};

htmlDecode = function(value) {
  return $("<div/>").html(value).text();
};

decodeJSON = function(encvalue) {
  if (encvalue != null) {
    return jQuery.trim(encvalue.replace(/\+/g, " ").replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%2A/g, "*").replace(/\"/g, "'"));
  } else {
    return "";
  }
};
