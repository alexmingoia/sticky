# Sticky

LocalStorage doesn't work in Safari private browsing. LocalStorage only persists
strings. LocalStorage isn't evented. It should be simpler.

## Installation

Using npm:

```sh
npm install sticky-store
```

Using bower:

```sh
bower install sticky-store
```

As a browser global via `window.Sticky`:

```html
<script src="dist/sticky.js"></script>
```

## Usage

```javascript
var store = new StickyStore();

store.set('foo', { bar: 'baz' });

store.get('foo'); // => { bar: 'baz' }

store.remove('foo');

store.on('error', function (error) {
  // ...
});

// items can expire
store.set('foo', 'bar', {
  expires: '1h'
});
```

### Events

- get     receives arguments `key` and `value`
- set     receives arguments `key` and `value`
- remove  receives argument `key`
- error   receives argument `error`

## License

Copyright 2015 Alexander C. Mingoia

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
