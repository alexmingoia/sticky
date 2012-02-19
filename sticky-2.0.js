/**
 * Sticky
 *
 * Version 1.2
 * Copyright 2011 Alexander C. Mingoia
 * MIT Licensed
 *
 * Simple JavaScript HTML5 browser storage cache. Persists to
 * memory, indexedDB, webSQL, localStorage, globalStorage, and cookies.
 *
 * Objects and arrays are stringified before storage, and
 * strings longer than 128 characters aren't persisted to cookies.
 *
 * WebSQL (SQLite)
 *     Chrome 4+, Opera 10.5+, Safari 3.1+, and Android Browser 2.1+
 *     5MB of data per DB, but can request more
 * IndexedDB
 *     IE 10+, FireFox 4+, and Chrome 11+
 * localStorage
 *     Safari 4+, Mobile Safari (iPhone/iPad), Firefox 3.5+, Internet Explorer 8+ and Chrome 4+
 *     5MB of data per domain
 * globalStorage
 *     FireFox 2-3
 * Cookies
 *     1-4KB depending on character encoding and implementation.
 *
 * For more compatibility information, see: http://caniuse.com/
 */


/**
 * Constructor
 *
 * @param {Map} opts Options:
 *    var options = {
 *      name: 'Store A'          // A name for this store that acts as a unique identifier.
 *                               // You need to set this if you're going to have multiple stores.
 *      domain: 'example.com',   // Custom cookie domain
 *      expires: 168,            // Cookie expiration in hours
 *      ready: function() {},    // Fires after repopulating cache
 *      size: 10                 // WebSQL database size in megabytes
 *    };
 *
 *  @return {StickyStore} Returns an instantiated store object
 */

function StickyStore(opts) {
  var store = this;
  // Default options
  if (!opts) opts = {};
  if (!opts.domain) opts.domain = window.location.hostname;
  if (!opts.expires) opts.expires = 24*7; // Cookie expiration in hours
  if (!opts.name) opts.name = 'sticky';
  if (!opts.size) opts.size = 5; // Size in MB
  if (opts.ready) {
    if (typeof opts.ready !== 'function') {
      throw new Error('opts.ready callback must be a function');
    }
    store.on('ready', opts.ready);
  }

  store.opts = opts;
  store.cache = {}; // Memory cache container object
  store.db; // Indexed DB or Web SQL connection object

  // Wrap localStorage and globalStorage
  if (window.localStorage) {
    store.storage = localStorage;
  }
  else if (window.globalStorage) {
    store.storage = globalStorage[opts.domain];
  }

  // Load items from localStorage
  if (store.storage) {
    for (var i=0; i<store.storage.length; i++) {
      var record = store.storage.key(i);
      var data;
      try {
        data = store.storage.getItem(key);
      }
      catch (err) {
        store.trigger('error', err, data);
      }
      if (data && record.indexOf(opts.name) === 0) {
        var key = record.replace(new RegExp(opts.name.replace(/[^\w]/gi, ''), 'gi'), '');
        var item;
        // Object
        if (data.indexOf('J::O') === 0) {
          try {
            item = JSON.parse(data.slice(4));
          }
          catch (err) {
            store.trigger('error', err, data.slice(4));
          }
        }
        // String
        else if (isNaN(data)) {
            item = data;
        }
        // Number
        else {
            item = Number(data);
        }
        if (item) {
          store.set(key, item);
        }
      }
    }
  }

  // Initialize IndexedDB and repopulate cache
  if ('mozIndexedDB' in window) {
     window.indexedDB = window.mozIndexedDB;
  }
  if (window.indexedDB) {
    // Request DB
    var request = window.indexedDB.open(opts.name+'_sticky', 'Sticky Offline Web Cache');
    request.onsuccess = function(event) {
      store.db = event.target.result
      // If version is different, we need to set version
      // and create an object store
      if (store.db.version != '0.8') {
        var request = store.db.setVersion('0.8');
        request.onsuccess = function(event) {
          // Create our object store for cached data
          if (!store.db.objectStoreNames.contains('cache')) {
              store.db.createObjectStore('cache', {keyPath: 'key'});
          }
          store.trigger('ready', store);
        };
        request.onerror = function(event) {
          store.trigger('ready', store);
          store.trigger('error', "Couldn't change indexedDB version (Code " + request.errorCode + ")");
        };
      }
      else {
        var transaction = store.db.transaction('cache');
        var objectStore = transaction.objectStore('cache');
        var request = objectStore.openCursor();
        request.onsuccess = function(event) {
          var cursor = event.target.result;
          // Only load records for this specific store
          if (cursor && cursor.value.data && cursor.key.indexOf(opts.name) === 0) {
            var key = cursor.key.replace(new RegExp(opts.name.replace(/[^\w]/gi, ''), 'gi'), '');
            var item;
            // Object
            if (cursor.value.data.indexOf('J::O') === 0) {
              try {
                item = JSON.parse(cursor.value.data.slice(4));
              }
              catch (err) {
                store.trigger('error', err, cursor.value.data.slice(4));
              }
            }
            // String
            else if (isNaN(cursor.value.data)) {
                item = cursor.value.data;
            }
            // Number
            else {
                item = Number(cursor.value.data);
            }
            if (item) {
              store.cache[(store.opts.name + key).replace(/[^\w]/gi, '')] = item;
            }
            cursor['continue']();
          }
          else {
            store.trigger('ready', store);
          }
        }
        request.onerror = function(event) {
          store.trigger('ready', store);
          store.trigger('error', "Couldn't open indexedDB objectStore cursor (Code " + request.errorCode + ")");
        };
      }
    }
    request.onerror = function(event) {
      store.trigger('ready', store);
      store.trigger('error', "Couldn't open indexedDB (Code " + request.errorCode + ")");
    }
  }
  // Initialize WebDB and repopulate cache
  else if (window.openDatabase) {
    // Try and open DB
    try {
      store.db = window.openDatabase(opts.name+'_sticky', '0.8', 'Sticky Offline Web Cache', (opts.size * 1024 * 1024));
      if (store.db) {
        store.db.transaction(function(tx) {
          tx.executeSql('CREATE TABLE IF NOT EXISTS cache (key TEXT, data TEXT)');
          // Repopulate cache container object with data stored in SQLite
          tx.executeSql('SELECT * FROM cache', [], function(tx, results) {
            if (results.rows.length > 0) {
              for (var i=0; i<results.rows.length; i++) {
                var record = results.rows.item(i);
                // Only load records for this specific store
                if (record['data'] && record['key'].indexOf(opts.name) === 0) {
                  var key = record['key'].replace(new RegExp(opts.name.replace(/[^\w]/gi, ''), 'gi'), '');
                  var item;
                  // Object
                  if (record['data'].indexOf('J::O') === 0) {
                    try {
                      item = JSON.parse(record['data'].slice(4));
                    }
                    catch (err) {
                      store.trigger('error', err, record['data'].slice(4));
                    }
                  }
                  // String
                  else if (isNaN(record['data'])) {
                      item = record['data'];
                  }
                  // Number
                  else {
                      item = Number(record['data']);
                  }
                  if (item) {
                    store.cache[(store.opts.name + key).replace(/[^\w]/gi, '')] = item;
                  }
                }
              }
              store.trigger('ready', store);
            }
            else {
              store.trigger('ready', store);
            }
          });
        });
      }
    }
    catch (err) {
      store.trigger('ready', store);
      store.trigger('error', err);
    }
  }
  else {
    store.trigger('ready', store);
  }
};


/**
 * Subscribe to an event
 *
 * @param String event
 * @param Function fn
 */

StickyStore.prototype.on = (function(event, fn) {
  this.events = this.events || {};
  if (this.events[event]) {
    this.events[event].push(fn);
  }
  else {
    this.events[event] = [fn];
  }
});


/**
 * Trigger an event
 *
 * Any arguments passed after `event` are
 * passed to functions bound to the event
 *
 * @param String event
 * @param Mixed args
 */

StickyStore.prototype.trigger = (function(event, args) {
  args = Array.prototype.slice.call(arguments, 1);
  if (this.events && this.events[event]) {
    for (var i=0; i<this.events[event].length; i++) {
      this.events[event][i].apply(this, args);
    }
  }
});


/**
 * Set
 *
 * @param String key
 * @param Mixed value
 * @param Function callback Optional. Called after async operations are completed.
 *
 * @return Mixed Returns reference to stored value or false for failure or error
 */

StickyStore.prototype.set = (function(key, item, callback) {
  var store = this;
  if (!item) return false;
  if (callback && typeof callback !== 'function') {
    throw new Error('Callback must be a function');
    return false;
  }

  // Prefix key with store name/identifier
  var key = (store.opts.name + key).replace(/[^\w]/gi, '');

  var value;
  var itemType = typeof item;

  // Store item in memory cache
  store.cache[key] = item;

  // Objects and arrays are stringified, and aren't stored in cookies (they're too big)
  if (itemType === 'string' && item.length > 0) {
    value = item;
  }
  else {
    if (itemType === 'object' || itemType === 'array') {
      try {
        value = 'J::O' + JSON.stringify(item);
      }
      catch (err) {
        store.trigger('error', err, item);
      }
    }
    else {
        value = item.toString();
    }
  }

  if (value) {
    // Only string values less than 128 characters get stored in cookies
    if (value.length < 128) {
      document.cookie = key + '=' + value
        + '; expires=' + new Date(new Date().getTime() + (store.opts.expires*60*60*1000)).toGMTString()
        + '; path=/';
    }
    // Copy value to localStorage or globalStorage
    if (store.storage) {
      try {
        store.storage.setItem(key, value);
      }
      catch (err) {
        store.trigger('error', err, item);
      }
    }

    if (store.db) {
      // Copy value to indexedDB
      if (store.db.setVersion) {
        var tx = store.db.transaction(['cache'], IDBTransaction.READ_WRITE, 0);
        var objStore = tx.objectStore('cache');
        var request = objStore.put({'key':key, 'data':value});
        request.onsuccess = function(e) {
          callback && callback.call(store, item);
        };
        request.onerror = function(e) {
          callback && callback.call(store, false);
          store.trigger('error', 'Failed to store item in indexedDB (Code: ' + e.target.errorCode + ')', item);
        };
      }
      // Copy value to webDB
      else {
        // Insert callback after update
        var insert = function(tx, result) {
          // If update failed then insert
          if (result && result.rowsAffected === 0) {
            tx.executeSql('INSERT INTO cache (key, data) VALUES (?, ?)', [key, value], function(tx, result) {
              if (result && result.rowsAffected === 0) {
                  callback && callback.call(store, false);
                  store.trigger('error', 'Failed to insert item in webDB', item);
              }
              else {
                  callback && callback.call(store, item);
              }
            });
          }
          else {
            callback && callback.call(store, item);
          }
        }
        // Update, and pass insert as callback
        var update = function(tx) {
          tx.executeSql('UPDATE cache SET data=? WHERE key=?', [value, key], insert);
        }
        store.db.transaction(update);
      }
    }
    else {
      callback && callback.call(store, item);
    }

    store.trigger('set', key, store.cache[key]);
    return store.cache[key];
  }
  return false;
});


/**
 * Get
 *
 * @param String key
 * @param Mixed default/callback Optional. Anything but a function will be used as the default return falue.
 *
 * @return Mixed Returns reference to stored value or false for failure or error
 */

StickyStore.prototype.get = (function(key, callback) {
  var _default = null;

  // Prefix key with store name
  var key = (this.opts.name + key).replace(/[^\w]/gi, '');

  // Not in memory, let's check elsewhere
  if (!this.cache[key]) {
    // Check localStorage or globalStorage
    if (this.storage) {
      var value;
      try {
        value = this.storage.getItem(key);
      }
      catch (err) {
        this.trigger('error', err);
      }
      if (value) {
        if (value.substr(0, 4) === 'J::O') {
          try {
            value = JSON.parse(value.substr(4));
          }
          catch (err) {
            this.trigger('error', err, value);
          }
        }
        this.cache[key] = value;
      }
    }
    // If not, check cookies
    else {
      var keyEquals = key + "=";
      var cookieArray = document.cookie.split(';');
      for (var i=0; i<cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
          cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(keyEquals) === 0) {
          this.cache[key] = cookie.substring(keyEquals.length, cookie.length);
        }
      }
    }
  }
  // Callback
  if (callback) {
    if (typeof callback === 'function') {
      callback.call(this, this.cache[key]);
    }
    else {
      _default = callback;
    }
  }
  // Data inside webDB is loaded into the store on instantiation,
  // so it's available here.
  if (this.cache[key]) {
    this.trigger('get', key, this.cache[key]);
    return this.cache[key];
  }
  else if (_default) {
    this.trigger('get', key, _default);
  }
  // Not found
  return _default;
});


/**
 * Remove
 *
 * @param String key
 * @param Function callback Optional. Executed after async operations are complete.
 *
 * @returns Bolean
 */

StickyStore.prototype.remove = (function(key, callback) {
  var store = this;
  if (callback && typeof callback !== 'function') {
    throw new Error('Callback must be a function');
    return false;
  }

  // Prefix key with store name
  key = (store.opts.name + key).replace(/[^\w]/gi, '');

  // Remove from memory
  if (store.cache[key]) {
    delete store.cache[key];
  }

  // Remove cookie
  document.cookie = key + '=; expires=-1; path=/';

  // Remove localStorage or globalStorage
  if (store.storage) {
    try {
      store.storage.removeItem(key);
    }
    catch (err) {
      store.trigger('error', err, key);
      return false;
    }
  }

  if (store.db) {
    // Remove indexedDB
    if (store.db.setVersion) {
      // Copy value to indexedDB
      var tx = store.db.transaction(['cache'], IDBTransaction.READ_WRITE, 0);
      var objStore = tx.objectStore('cache');
      var request = objStore['delete'](key);
      request.onsuccess = function(e) {
        callback && callback.call(store, true);
      };
      request.onerror = function(e) {
        callback && callback.call(store, false);
        store.trigger('error', 'Error removing item from indexedDB', key);
      };
    }
    // Remove web SQL
    else {
      store.db.transaction(function(tx) {
        tx.executeSql('DELETE FROM cache WHERE key=?', [key], function(tx, result) {;
          if (result && result.rowsAffected === 0) {
            callback && callback.call(store, false);
            store.trigger('error', 'Failed to insert item in webDB', key);
          }
          else {
            callback && callback.call(store, key);
          }
        });
      });
    }
  }
  else {
    callback && callback.call(store);
  }

  store.trigger('remove', key);
  return true;
});


/**
 * Remove All
 *
 * @param Function callback Optional
 *
 * Removes all values in this store from all storage mechanisms
 */

StickyStore.prototype.removeAll = (function(callback) {
  var store = this;
  var count = 0;

  var removed = function() {
    count--;
    if (count < 1 && callback && typeof callback === 'function') {
      callback.call(this, this.cache[key]);
    }
  };

  for (var key in store.cache) {
    count++;
  }

  for (var key in store.cache) {
    store.remove(key.replace(this.opts.name, ''), removed);
  }
});
