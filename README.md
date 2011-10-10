# Sticky

Sticky is a simple, key/value pair, browser-storage cache leveraging the latest HTML5 storage API's (indexedDB, webSQL, and localStorage).

Sticky persists to memory, indexedDB, webSQL, localStorage, globalStorage, and cookies.

Objects and arrays are stringified before storage and strings longer than 128 characters aren't persisted to cookies.

## Browser Support

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
Maximum size varies across implementations

For more compatibility information, see: [http://caniuseit.com/](http://caniuseit.com/)

## Usage

#### HTML:

    <script src="sticky-0.9.js" type="text/javascript"></script>

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
        domain: 'example.com', // Used for cookie domain.
        expires: 48,           // Hours. Used for cookie expiration.
        ready: function(){},   // Fires after cache has been repopulated.
        size: 5,               // indexedDB / webSQL database size in megabytes.
        version: '1.0'         // indexedDB / webSQL database version.
    });

When you initialize a store, it's cache will be repopulated from browser storage. Because indexedDB and webSQL operate asynchronously, Sticky will fire the ```store.opts.ready``` function after the cache has been repopulated.


### Get

Returns the cached value or null if it isn't found. Example:

    var store = new StickyStore();

    store.get('something');

### Set

Caches a value and returns the cached value or false on error. You can pass any type of value: String, array, object, and number. Objects and arrays will be stringified and prefixed with ```J::O``` for storage.

    var store = new StickyStore();

    store.set('car', {
        make: 'Volkswagen',
        model: 'Golf GTI',
        year: 2001
    });

### Remove

Removes the cached value from all storage mechanisms and returns true if successful.

    var store = new StickyStore();

    store.remove('something');

## License

Copyright 2011 Alexander C. Mingoia

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
