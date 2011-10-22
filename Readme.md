# Sticky

Sticky is a simple, key/value pair, browser-storage cache leveraging the latest HTML5 storage API's. Sticky persists to memory, indexedDB, webSQL, localStorage, globalStorage, and cookies. Objects and arrays are stringified before storage, and strings longer than 128 characters aren't persisted to cookies.

#### Features

* Tiny and fast
* Callbacks for everything
* Store strings, numbers, and objects – JSON in and JSON out
* Simple abstraction for IndexedDB and WebSQL's complexity
* MIT licensed

## Storage Mechanisms and Browser Support

* **WebSQL (SQLite)**  
Chrome 4+, Opera 10.5+, Safari 3.1+, and Android Browser 2.1+
5MB of data per DB, but can request more
* **IndexedDB**  
IE 10+, FireFox 4+, and Chrome 11+
* **localStorage**  
Safari 4+, Mobile Safari (iPhone/iPad), Firefox 3.5+, Internet Explorer 8+ and Chrome 4+
5MB of data per domain
* **globalStorage**  
FireFox 2-3
* **Cookies**  
Usually 1-4KB per domain. Only strings that are less than 128 characters are persisted to cookies by Sticky.

For more compatibility information, see: [caniuse.com](http://caniuse.com/).

## Usage

#### HTML:

    <script src="sticky-0.5.js" type="text/javascript"></script>

#### JavaScript:

    // Initialize your store and repopulate cached data
    var store = new StickyStore();

    // Set
    store.set('color', 'red');

    // Get
    store.get('color');

    // Remove
    store.remove('color');

### Initialize a store

First, you must create a sticky store object like so:

    var store = new StickyStore();

Alternatively, you can specify some options for this store by passing the opts argument:

    var store = new StickyStore({
        name: 'Store A',       // Unique identifier for this store. Required to use multiple stores.
        version: '1.0',        // Version for this store.
        ready: function() {},  // Fires after cache has been repopulated.
        domain: 'example.com', // Custom cookie domain.
        expires: 48,           // Hours. Used for cookie expiration.
        size: 5                // indexedDB / webSQL database size in megabytes.
    });

When you initialize a store, its cache will be repopulated from browser storage. Because indexedDB and webSQL operate asynchronously, Sticky will fire the ```store.opts.ready``` function after the cache has been repopulated.

### Multiple Stores

Cached data is specific to a store's ```name``` and ```version``` options. Sticky supports multiple stores by prefixing the key values with the name and version.

### Get

Returns the cached value or null if it isn't found. Example:

    store.get('something');

You can also specify a default value for failure:

    store.get('something', 'not there'); // Returns "not there" instead of false

And callbacks!

    store.get('something', callback(val) {
        console.log(val);
    });

### Set

Caches a value and returns the cached value or false on error. You can pass any type of value: String, array, object, and number. Objects and arrays will be stringified and prefixed with ```J::O``` for storage. String values longer than 128 characters will not be persisted to cookies.

You can set strings or numbers:

    store.set('color', 'red');

    store.set('version', 5);

Or objects:

    store.set('car', {
        make: 'Volkswagen',
        model: 'Golf GTI',
        year: 2001
    });

You can also specify a callback:

    store.set('color', 'red', function(val) {
        console.log(val); // Outputs "red"
    });

### Remove

Removes the cached value from this store from all storage mechanisms and returns true if successful. ```remove``` also takes an optional callback function as the second argument.

    store.remove('something');

### Remove All

Removes all cached values for this store from all storage mechanisms. ```removeAll``` also takes an optional callback function as the second argument.

    store.removeAll();

## License

Copyright 2011 Alexander C. Mingoia

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
