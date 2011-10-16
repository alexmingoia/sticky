/**
 * Sticky
 *
 * Version 0.3
 * Copyright 2011 Alexander C. Mingoia
 * MIT Licensed
 *
 * Simple JavaScript HTML5 browser storage cache.
 * Persists to memory, indexedDB, webSQL, localStorage, globalStorage, and cookies.
 *
 * Objects and arrays are stringified before storage in WebDB, localStorage, or cookies.
 * Strings longer than 128 characters aren't persisted to cookies.
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
 *     Maximum size varies across implementations
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
 *      size: 10,                // WebSQL database size in megabytes
 *      version: '1.0'           // Version for this store
 *    };
 *
 *  @return {StickyStore} Returns an instantiated store object
 */

function StickyStore(opts) {
  // Default options
  if (!opts) opts = {};
  if (!opts.domain) opts.domain = window.location.hostname;
  if (!opts.expires) opts.expires = 24*7; // Cookie expiration in hours
  if (!opts.name) opts.name = 'sticky';
  if (!opts.size) opts.size = 5; // Size in MB
  if (!opts.version) opts.version = '0.3'; // Version for DB
  if (opts.ready && typeof opts.ready !== 'function') {
      throw new Error('opts.ready must be a function');
  }

  this.opts = opts;
  this.cache = {}; // Memory cache container object
  this.SQLite; // WebDB connection object
  this.indexedDB // Indexed DB request object

  // Wrap localStorage and globalStorage
  if (window.localStorage) {
    this.storage = window.localStorage;
  }
  else if (window.globalStorage) {
    this.storage = window.globalStorage[opts.domain];
  }

  // Needed to keep context in async methods
  var store = this;

  // Initialize IndexedDB and repopulate cache
  if (window.indexedDB) {
    // Request DB
    var request = window.indexedDB.open(opts.name, 'Sticky Offline Web Cache');
    request.onsuccess = function(event) {
      store.indexedDB = event.result;
      // If version is different, we need to set version
      // and create an object store
      if (store.indexedDB.version != opts.version) {
        var request = store.indexedDB.setVersion(opts.version);
        request.onsuccess = function(event) {
          // Create our object store for cached data
          var objectStore = db.createObjectStore('cache', {'keyPath': 'key'});
          opts.ready && opts.ready.call(store);
        };
        request.onerror = function(event) {
          console.log('Sticky Error: ' + request.errorCode);
          opts.ready && opts.ready.call(store);
        };
      }
      else {
        var objectStore = store.indexedDB.transaction('cache').objectStore('cache');
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          // Only load records for this specific store
          if (cursor && cursor.key.indexOf(opts.name + opts.version) === 0) {
            if (cursor.value.data.substr(0, 4) === 'J::O') {
              try {
                var item = JSON.parse(cursor.value.data.substr(4));
                store.set(cursor.key, item);
              }
              catch (err) {
                console.log('Sticky Error: ' + err);
              }
            }
            else {
              store.set(cursor.key, cursor.value.data);
            }
            cursor['continue']();
          }
          else {
            opts.ready && opts.ready.call(store);
          }
        }
      }
    }
    request.onerror = function(event) {
      console.log('Sticky Error: ' + request.errorCode);
      opts.ready && opts.ready.call(store);
    }
  }
  // Initialize WebDB and repopulate cache
  else if (window.openDatabase) {
    // Try and open DB
    try {
      this.SQLite = window.openDatabase(opts.name, opts.version, 'Sticky Offline Web Cache', (opts.size * 1024 * 1024));
      if (this.SQLite) {
        this.SQLite.transaction(function(tx) {
          tx.executeSql('CREATE TABLE IF NOT EXISTS cache (key TEXT, data TEXT)');
          // Repopulate cache container object with data stored in SQLite
          tx.executeSql('SELECT * FROM cache', [], function(tx, results) {
            if (results.rows.length > 0) {
              for (var i=0; i<results.rows.length; i++) {
                var record = results.rows.item(i);
                // Only load records for this specific store
                if (record['key'].indexOf(opts.name + opts.version) === 0) {
                  if (record['data'] && record['data'].substr(0, 4) === 'J::O') {
                    try {
                      var item = JSON.parse(record['data'].substr(4));
                      store.set(record['key'], item);
                    }
                    catch (err) {
                      console.log('Sticky Error: ' + err);
                    }
                  }
                  else {
                    store.set(record['key'], record['data']);
                  }
                }
              }
              opts.ready && opts.ready.call(store);
            }
            else {
              opts.ready && opts.ready.call(store);
            }
          });
        });
      }
    }
    catch (err) {
      console.log('Sticky Warning: ' + err);
    }
  }
  else {
    opts.ready && opts.ready.call(store);
  }
};


/**
 * Set
 *
 * @param String key
 * @param Mixed value
 *
 * @return Mixed Returns reference to stored value or false for failure or error
 */

StickyStore.prototype.set = (function(key, item) {
  if (!item) return false;

  // Prefix key with store name/identifier
  key = this.opts.name + this.opts.version + key;

  var value;
  var itemType = typeof item;

  // Store item in memory cache
  this.cache[key] = item;

  // Objects and arrays are stringified, and aren't stored in cookies (they're too big)
  if (itemType === 'object' || itemType === 'array') {
    try {
      value = 'J::O' + JSON.stringify(item);
    }
    catch (err) {
      console.log('Sticky Error: ' + err);
    }
  }
  else if (itemType === 'string') {
    value = item;
  }

  if (value) {
    // Only string values less than 128 characters get stored in cookies
    if (value.length < 128) {
      document.cookie = key + '=' + value
        + '; expires=' + new Date(new Date().getTime() + (this.opts.expires*60*60*1000)).toGMTString()
        + '; domain=' + this.opts.domain
        + '; path=/';
    }
    // Copy value to localStorage or globalStorage
    if (this.storage) {
      try {
        this.storage.setItem(key, value);
      }
      catch (err) {
        console.log('Sticky Error: ' + err);
      }
    }

    // Copy value to webDB
    if (this.SQLite) {
      // Try insert first
      var insert = function(tx, error) {
        if (error && error.rowsAffected === 0) {
          tx.executeSql('INSERT INTO cache (key, data) VALUES (?, ?)', [key, value]);
        }
      }
      // Update if insert fails
      var update = function(tx) {
        tx.executeSql('UPDATE cache SET data=? WHERE key=?', [value, key], insert);
      }
      this.SQLite.transaction(update);
    }

    // Copy value to indexedDB
    if (this.indexedDB) {
      this.indexedDB.objectStore('cache').add({'key': key, 'value': value});
    }

    return this.cache[key];
  }
  return false;
});


/**
 * Get
 *
 * @param String key
 *
 * @return Mixed Returns reference to stored value or false for failure or error
 */

StickyStore.prototype.get = (function(key,defaultt) {
  // Prefix key with store name
  key = this.opts.name + this.opts.version + key;

  // If cached, return value immediately.
  // Data inside webDB is loaded into the store on instantiation,
  // so it's available here.
  if (this.cache[key]) {
    return this.cache[key];
  }
  // Check localStorage or globalStorage
  if (this.storage) {
    var value = this.storage.getItem(key);
    if (value && value.substr(0, 4) === 'J::O') {
      value = JSON.parse(value.substr(4));
    }
    this.cache[key] = value;
    return this.cache[key];
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
        return this.cache[key];
      }
    }
  }
  // Not found
  return defaultt || false;
});


/**
 * Remove
 *
 * @param String key
 *
 * @returns Bolean
 */

StickyStore.prototype.remove = (function(key) {
  // Prefix key with store name
  key = this.opts.name + this.opts.version + key;

  // Remove from memory
  if (this.cache[key]) {
    delete this.cache[key];
  }

  // Remove cookie
  document.cookie = key + '=; expires=-1; domain=' + this.opts.domain + '; path=/';

  // Remove localStorage or globalStorage
  if (this.storage) {
    try {
      this.storage.removeItem(key);
    }
    catch (err) {
      console.log('Sticky Error: ' + err);
      return false;
    }
  }

  // Remove web SQL
  if (this.SQLite) {
    // Update if insert fails
    this.SQLite.transaction(function(tx) {
      tx.executeSql('DELETE FROM cache WHERE key=?', [key]);
    });
  }

  // Remove indexedDB
  if (this.indexedDB) {
    this.indexedDB.objectStore('cache')['delete'](key);
  }

  return true;
});


/**
 * Remove All
 *
 * Removes all values in this store from all storage mechanisms
 */

StickyStore.prototype.removeAll = (function() {
  var store = this;

  for (var key in store.cache) {
    store.remove(key);
  }
});
