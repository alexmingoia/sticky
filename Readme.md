# Sticky

Sticky is a simple, key/value pair browser-storage cache leveraging the latest HTML5 storage API's.

Sticky persists in your preferred order to one of indexedDB, webSQL, localStorage, globalStorage, or cookies.

#### Features

* Test coverage
* Callbacks for everything
* Multiple stores
* Store strings, numbers, and objects – JSON in and JSON out
* Simple abstraction for IndexedDB and WebSQL's complexity
* MIT licensed

## Storage Mechanisms and Browser Support

* **IndexedDB**  
IE 10+, Firefox 4+ and Chrome 11+
* **WebSQL (SQLite)**  
Chrome 4+, Opera 10.5+, Safari 3.1+ and Android Browser 2.1+
5MB of data per DB, but can request more
* **localStorage**  
Safari 4+, Mobile Safari (iPhone/iPad), Firefox 3.5+, Internet Explorer 8+ and Chrome 4+
5MB of data per domain
* **globalStorage**  
Firefox 2-3
* **Cookies**  
Usually 4KB+ per domain.

For more compatibility information, see: [caniuse.com](http://caniuse.com/).

## Installation

```sh
bower install sticky-store
```

## Getting Started

### HTML:

    <script src="sticky.js" type="text/javascript"></script>

### JavaScript:

    var store = new StickyStore();

    store.set('color', 'red');
    store.get('color');
    store.remove('color');

## Initialize

First, you must create the `StickyStore` like so:

    var store = new StickyStore();

Alternatively, you can specify some options for this store by passing the `options` argument:

    var store = new StickyStore({
        name: 'Sticky',
        adapters: ['localStorage', 'indexedDB', 'webSQL', 'cookie'],
        ready: function() {},
        expires: (24*60*60*1000),
        size: 5
    });

Because indexedDB and webSQL operate asynchronously, Sticky will fire the ```ready``` event after all storage interfaces have been established.

## Options

All settings are optional.

`name` *String*  
The store name. You must specificy a store name to use multiple stores.
Only alphanumeric characters are allowed.

`adapters` *Array*  
An array of storage adapters to use, in preferred order.
Defaults to `['localStorage', 'indexedDB', 'webSQL', 'cookie']`.

`ready` *Function*  
This function is called after the store has been initialized and 
at least one storage interface has been connected.

`expires` *Number*  
Cookie expiration in milliseconds.

`size` *Number*  
webSQL database size in megabytes.

## get()

Retrieves a stored item.

If the preferred available adapter is asynchronous, you must use callbacks as `StickyStore.get()` will not return a value.

##### Parameters

`key` *String/Array*  Key or array of keys
`callback` The callback's first argument's value will be the stored item or array of items, or false on failure. *Mixed (Optional)*  
`adapter` The storage adapter to use. *String (Optional)*

##### Returns

Returns stored item or false.

##### Example

    // Synchronous
    var result = store.get('something');

    // Asynchronous
    store.get('something', function(result) {
        console.log(result);
    });

## set()

Stores an item and returns the stored item or false on failure. You can pass any type of value: string, array, object, and number.

##### Parameters

`key` *String/Array*  Key or array of keys
`item` *Mixed/Array*  Item or array of items
`callback` The callback's first argument's value will be the stored item or array of items, or false on failure. *Mixed (Optional)*  

`adapter` The adapter to use. *String (Optional)*

##### Returns

Returns stored item or false.

##### Example

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

    store.set('color', 'red', function(result) {
        console.log(result); // Outputs "red"
    });

## remove()

Removes the cached value and returns true if successful.

##### Parameters

`key` Key *String*  
`callback` Callback's argument is true for success and false for failure. *Mixed (Optional)*  
`adapter` The adapter to use. *String (Optional)*

##### Returns

Returns true for success or false for failure.

##### Example

    store.remove('something');

## removeAll()

Removes all stored items from all storage mechanisms.

##### Parameters

`callback` *Mixed (Optional)*

##### Example

    store.removeAll();

## Events

Sticky has events for errors, get, set, and remove.

### Ready

    store.on('ready', function(store) {
        console.log(store); // Returns the ready store object
    });

### Get

    store.on('get', function(key, result) {
        console.log(key); // Returns key of item retrieved
        console.log(result); // Returns value of item retrieved
    });

### Set

    store.on('set', function(key, result) {
        console.log(key); // Returns key of the item set
        console.log(result); // Returns value of item set
    });

### Remove

    store.on('remove', function(key) {
        console.log(key); // Returns key of the item removed
    });

### Error

    store.on('error', function(error, item) {
        console.log(error); // Returns the error message
        console.log(item); // Returns the item, if available
    });

## License

Copyright 2011 Alexander C. Mingoia

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
