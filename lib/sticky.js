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
