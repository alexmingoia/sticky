# Release History

# 2.7 / 2012-03-07

* Improved get and set methods by handling array of keys/items.
* Removed redundant serialization in indexedDB adapter's get and set
  methods.

## 2.6 / 2012-02-23

* Ensure compatibility with both FF and Chrome indexedDB implementations
* Added tests for each adapter (using Mocha framework)
* Refactored cookie adapter methods and fixed bug with StickyStore.remove() being called twice in certain cases
* Fixed bug with missing callback in StickyStore.adapters.localStorage.remove() causing multiple removals not to fire callback
* Fixed bug with number type conversion in StickyStore.serialize()

## 2.5 / 2012-02-19

* Fixed bug with callback not firing after all storage adapters are exhausted

## 2.4 / 2012-02-18

* Cleaned-up StickyStore.exec()

## 2.3 / 2012-02-18

* Fixed bug with indexedDB initialization not firing callback in certain
  cases.

## 2.2 / 2012-02-15

* Fixed localStorage adapter's get method not unserializing

## 2.1 / 2012-02-13

* Instead of waiting for all storage interfaces to connect before firing
  ready event, only wait for one interface to connect.

## 2.0 / 2012-02-13

* Added support for new IDBRequest.onupdateneeded event, while keeping
  backwards-compatible with old IDBDatabase.setVersion() method.
* Re-written for modularization of storage mechanisms.
* Proper support for multiple stores.

## 1.2 / 2011-12-29

* Fixed typo in webSQL removal callback

## 1.1 / 2011-12-23

* Added events; StickyStore.on() and StickyStore.trigger()
* Aliased the ready option by registering it with the 'ready' event
* Expanded error handling and replaced console messages with 'error' events
* Added events for StickyStore.get(), StickyStore.set(), and StickyStore.remove()

## 1.0 / 2011-12-22

* Improved error handling

## 0.9 / 2011-12-16

* Convert stored numbers to Number objects when repopulating

## 0.8 / 2011-11-17

* Fixed bug with storing Number objects
* Refactored some indexedDB logic when repopulating the store
* Refactored type checking in StickyStore.set()

## 0.7 / 2011-11-01

* Removed versioning of stores due to too many idiosyncracies
* Fixed bug with repopulating previous sessions data using indexedDB

## 0.6 / 2011-10-24

* Fixed bug with key reference for ObjectStore.put()

## 0.5 / 2011-10-21

* Fixed bug with webSQL versions
* Fixed bug with storing objects in indexedDB
* Updated documentation

## 0.4 / 2011-10-16

* Added callbacks
* Added default value for store.get()
* Added browser-specific detection of indexedDB

## 0.3 / 2011-10-11

* Fixed bug with indexedDB's continue and delete methods being reserved keywords causing Safari to throw errors

## 0.2 / 2011-10-10

* Added ```store.opts.name``` to handle multiple stores by prefixing keys
* Added ```store.removeAll()``` method
* Fixed bug where only objects and arrays were persisted to webSQL and indexedDB
* Updated documentation

## 0.1 / 2011-10-09

* Initial release
* Started release history
