/**
 * localStorage adapter tests
 */

var testLocalStorage = function() {
  var store;

  before(function(done) {
    new StickyStore({
      name: 'test_localstorage',
      adapters: ['localStorage'],
      ready: function(result) {
        store = result;
        done();
      }
    });
  });

  /**
   * StickyStore.set()
   */

  describe('StickyStore.set()', function() {
    // String
    it('should return the string to be stored', function() {
      var result = store.set('TestString', 'Test String');
      expect(result).to.be('Test String');
    });

    it('should execute a callback returning the string to be stored', function(done) {
      store.set('TestString', 'Test String', function(result) {
        expect(result).to.be('Test String');
        done();
      });
    });

    // Array
    it('should return the array to be stored', function() {
      var result = store.set('TestArray', ['Test Array']);
      expect(result).to.eql(['Test Array']);
    });

    it('should execute a callback returning the array to be stored', function(done) {
      store.set('TestArray', ['Test Array'], function(result) {
        expect(result).to.eql(['Test Array']);
        done();
      });
    });

    // Number
    it('should return the number to be stored', function() {
      var result = store.set('TestNumber', 604);
      expect(result).to.be(604);
    });

    it('should execute a callback returning the number to be stored', function(done) {
      store.set('TestNumber', 604, function(result) {
        expect(result).to.be(604);
        done();
      });
    });

    // JSON Object
    it('should return the JSON object to be stored', function() {
      var result = store.set('TestJSONObject', {'number': 604, 'string': 'test string'});
      expect(result).to.eql({'number': 604, 'string': 'test string'});
    });

    it('should execute a callback returning the JSON object to be stored', function(done) {
      store.set('TestJSONObject', {'number': 604, 'string': 'test string'}, function(result) {
        expect(result).to.eql({'number': 604, 'string': 'test string'});
        done();
      });
    });
  });

  /**
   * StickyStore.get()
   */

  describe('StickyStore.get()', function() {
    // String
    it('should return the stored string', function() {
      var result = store.get('TestString');
      expect(result).to.be('Test String');
    });

    it('should execute a callback returning the stored string', function(done) {
      store.get('TestString', function(result) {
        expect(result).to.be('Test String');
        done();
      });
    });

    // Array
    it('should return the stored array', function() {
      var result = store.get('TestArray');
      expect(result).to.eql(['Test Array']);
    });

    it('should execute a callback returning the stored array', function(done) {
      store.get('TestArray', function(result) {
        expect(result).to.eql(['Test Array']);
        done();
      });
    });

    // Number
    it('should return the stored number', function() {
      var result = store.get('TestNumber');
      expect(result).to.be(604);
    });

    it('should execute a callback returning the stored number', function(done) {
      store.get('TestNumber', function(result) {
        expect(result).to.be(604);
        done();
      });
    });

    // JSON Object
    it('should return the stored JSON object', function() {
      var result = store.get('TestJSONObject');
      expect(result).to.eql({'number': 604, 'string': 'test string'});
    });

    it('should execute a callback returning the stored JSON object', function(done) {
      store.get('TestJSONObject', function(result) {
        expect(result).to.eql({'number': 604, 'string': 'test string'});
        done();
      });
    });

    after(function(done) {
      store.remove('TestString');
      store.remove('TestNumber');
      store.remove('TestArray');
      store.remove('TestJSONObject');
      done();
    });
  });

  /**
   * StickyStore.remove()
   */

  describe('StickyStore.remove()', function() {
    before(function(done) {
      store.set('TestString', 'Test String');
      store.set('TestArray', ['Test Array']);
      store.set('TestJSONObject', {'number': 604, 'string': 'test string'});
      done();
    });

    it('should return true', function() {
      var result = store.remove('TestString');
      expect(result).to.be(true);
    });

    it('should execute a callback that returns true', function(done) {
      store.remove('TestArray', function(result) {
        expect(result).to.be(true);
        done();
      });
    });

    it('should remove the stored item', function() {
      store.remove('TestJSONObject');
      expect(store.get('TestJSONObject')).to.be(false);
    });
  });

  /**
   * StickyStore.removeAll();
   */

  describe('StickyStore.removeAll()', function() {
    beforeEach(function(done) {
      store.set('TestString', 'Test String');
      store.set('TestArray', ['Test Array']);
      store.set('TestNumber', 604);
      store.set('TestJSONObject', {'number': 604, 'string': 'test string'});
      done();
    });

    it('should execute a callback that returns true', function(done) {
      store.removeAll(function(result) {
        expect(result).to.be(true);
        done();
      });
    });

    it('should remove the stored items', function(done) {
      store.removeAll(function(result) {
        expect(store.get('TestString')).to.be(false);
        expect(store.get('TestArray')).to.be(false);
        expect(store.get('TestNumber')).to.be(false);
        expect(store.get('TestJSONObject')).to.be(false);
        done();
      });
    });
  });
};

// Don't include test if browser doesn't support this storage adapter
if (window.localStorage || window.globalStorage) {
  describe('localStorage', testLocalStorage);
}
else {
  throw new Error("Browser doesn't support localStorage or globalStorage; test omitted.");
}
