!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.StickyStore=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * sticky
 * https://github.com/alexmingoia/sticky
 */

'use strict';

/**
 * @module sticky
 */

require('timestring');

module.exports = StickyStore;

/**
 * Create a new store.
 *
 * @param {String} name
 * @return {StickyStore}
 */

function StickyStore(name, options) {
  if (typeof name !== 'string') {
    throw new Error('StickyStore requires a name');
  }

  this.listeners = [];
  this.name = name;
  this.prefix = 's:' + this.name + ':';
  this.localStorage = false;
  this.expires = (options && options.expires) || '1 year';

  try {
    if (this.localStorage = window.localStorage) {
      this.localStorage.setItem(this.prefix + 'test', 'test');
      this.localStorage.removeItem(this.prefix + 'test');
    }
  } catch (error) {
    this.emit('error', error);
    this.localStorage = false;
  }

  this.cookies = navigator.cookieEnabled ||
    ('cookie' in document && (document.cookie.length > 0 ||
    (document.cookie = 'test').indexOf.call(document.cookie, 'test') > -1));
}

/**
 * Get value for `key`.
 *
 * @param {String} key
 * @returns {Mixed}
 */
StickyStore.prototype.get = function (key) {
  var prefixedKey = this.prefix + key;
  var value;

  try {
    if (this.localStorage) {
      value = this.unserialize(key, this.localStorage.getItem(prefixedKey));
    } else {
      var match = document.cookie.match(new RegExp(prefixedKey + '=([^;]+)'));

      if (match) {
        value = this.unserialize(key, match[1]);
      }
    }

    this.emit('get', key, value);
  } catch (error) {
    this.emit('error', error);
  }

  return value;
};

/**
 * Set `value` for `key`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @param {Object=} options
 * @param {String=} options.expires
 */

StickyStore.prototype.set = function (key, value, options) {
  var prefixedKey = this.prefix + key;
  var expires = (new Date()).getTime() +
    (((options && options.expires) || this.expires).parseTime() * 1000);

  try {
    if (this.localStorage) {
      this.localStorage.setItem(prefixedKey, this.serialize(value, {
        expires: expires
      }));
    } else {
      document.cookie = [
        prefixedKey + '=' + this.serialize(value, {
          expires: expires
        }),
        'expires=' + new Date(expires).toGMTString(),
        'path=/'
      ].join('; ');
    }

    this.emit('set', key, value);
  } catch (error) {
    this.emit('error', error);
  }
};

/**
 * Remove `key`.
 *
 * @param {String} key
 */

StickyStore.prototype.remove = function (key) {
  var prefixedKey = this.prefix + key;

  try {
    if (this.localStorage) {
      this.localStorage.removeItem(prefixedKey);
    } else {
      document.cookie = [
        prefixedKey + '=' + this.serialize(value),
        'expires=Thu, 01 Jan 1970 00:00:00 UTC',
        'path=/'
      ].join('; ');
    }

    this.emit('remove', key);
  } catch (error) {
    this.emit('error', error);
  }
};

/**
 * Call `listener` whenever `event` is emitted.
 *
 * @param {String} event
 * @param {Function} listener
 */

StickyStore.prototype.on = function (event, listener) {
  if (!this.listeners[event]) {
    this.listeners[event] = [];
  }

  this.listeners[event].push(listener);
};

/**
 * Call listeners for `event`.
 *
 * @param {String} event
 * @private
 */

StickyStore.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = [];

  for (var key in this.listeners) {
    if (this.listeners.hasOwnProperty(key) && key === event) {
      listeners = this.listeners[key];
    }
  }

  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i].apply(this, arguments);
  }
};

/**
 * Serialize `value` for storage.
 *
 * @param {Mixed} value
 * @param {Object} options
 * @param {Number} options.expires
 * @returns {String}
 */

StickyStore.prototype.serialize = function (value, options) {
  try {
    return options.expires + ':' + JSON.stringify(value);
  } catch (error) {
    this.emit('error', error);
  }
};

/**
 * Unserialize `serialized` value from storage.
 *
 * @param {String} key
 * @param {String} serialized
 * @returns {Mixed}
 */

StickyStore.prototype.unserialize = function (key, serialized) {
  if (typeof serialized === 'string') {
    var item = serialized.split(':');
    var expires = Number(item.shift());
    var now = (new Date()).getTime();
    var json = item.join(':');

    if (now > expires) {
      return this.remove(key);
    }

    try {
      return JSON.parse(json);
    } catch (error) {
      this.emit('error', error);
    }
  }
};

},{"timestring":2}],2:[function(require,module,exports){
(function(){
  "use strict";

  var Timestring = function(settings) {
    // default settings
    var defaults = {
      hoursPerDay: 24,
      daysPerWeek: 7,
      weeksPerMonth: 4,
      monthsPerYear: 12
    };

    // merge default settings with user settings
    settings = settings || {};
    this.settings = defaults;
    for (var s in settings) { this.settings[s] = settings[s]; }

    // time units
    this.units = {
      s: ['s', 'sec', 'secs', 'second', 'seconds'],
      m: ['m', 'min', 'mins', 'minute', 'minutes'],
      h: ['h', 'hr', 'hrs', 'hour', 'hours'],
      d: ['d', 'day', 'days'],
      w: ['w', 'week', 'weeks'],
      mth: ['mth', 'mths','month', 'months'],
      y: ['y', 'yr', 'yrs', 'year', 'years']
    };

    // time unit seconds mappings
    this.unitValues = {
      s: 1,
      m: 60,
      h: 3600
    };

    // dynamic time unit seconds mappings
    // these are dynamic based on the settings
    this.unitValues.d = this.settings.hoursPerDay * this.unitValues.h;
    this.unitValues.w = this.settings.daysPerWeek * this.unitValues.d;
    this.unitValues.mth = this.settings.weeksPerMonth * this.unitValues.w;
    this.unitValues.y = this.settings.monthsPerYear * this.unitValues.mth;
  };

  Timestring.prototype.parse = function(string, returnUnit) {
    // reference to this
    var that = this;

    // get unit key helper
    function getUnitKey(unit) {
      for (var k in that.units) {
        for (var u in that.units[k]) {
          if (unit === that.units[k][u]) {
            return k;
          }
        }
      }

      // throw error if invalid unit was passed
      throw new Error('The unit [' + unit + '] is not supported by timestring');
    }

    // convert a value to a specific unit
    function convert(value, unit) {
      var baseValue = that.unitValues[getUnitKey(unit)];

      return value / baseValue;
    }

    // get a value in seconds based on a specific unit
    function getSeconds(value, unit) {
      var baseValue = that.unitValues[getUnitKey(unit)];

      return value * baseValue;
    }

    // seconds counter
    var totalSeconds = 0;

    // split string into groups and get total seconds for each group
    var groups = string
                  .toLowerCase() // convert words to lower case
                  .replace(/[^\.\w+-]+/g, '') // remove white space
                  .match(/[-+]?[0-9]+[a-z]+/g); // match time groups (digit followed by time unit - i.e 5d 15m = 2 time groups)

    if (groups !== null) {
      for(var i = 0; i < groups.length; i++) {
        var g = groups[i];
        var value = g.match(/[0-9]+/g)[0];
        var unit = g.match(/[a-z]+/g)[0];

        totalSeconds += getSeconds(value, unit);
      }
    }

    // return total, convert if needed
    return (returnUnit) ? convert(totalSeconds, returnUnit) : totalSeconds;
  };

  // add convenience method to string prototype
  String.prototype.parseTime = function (unit, settings) {
    return (new Timestring(settings)).parse(this, unit);
  };

  // export Timestring object
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timestring;
  }
  else {
    this.Timestring = Timestring;
  }

}).call(this);

},{}]},{},[1])(1)
});