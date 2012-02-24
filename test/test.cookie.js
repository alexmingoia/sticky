/**
 * cookie adapter tests
 */

var testCookie = function() {
  var store;

  before(function(done) {
    new StickyStore({
      name: 'test_cookie',
      adapters: ['cookie'],
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
      var result = store.set('TestString', 'TestString');
      expect(result).to.be('TestString');
    });

    it('should execute a callback returning the string to be stored', function(done) {
      store.set('TestString', 'TestString', function(result) {
        expect(result).to.be('TestString');
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
  });

  /**
   * StickyStore.get()
   */

  describe('StickyStore.get()', function() {
    // String
    it('should return the stored string', function() {
      var result = store.get('TestString');
      expect(result).to.be('TestString');
    });

    it('should execute a callback returning the stored string', function(done) {
      store.get('TestString', function(result) {
        expect(result).to.be('TestString');
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
  });

  /**
   * StickyStore.remove()
   */

  describe('StickyStore.remove()', function() {
    it('should return true', function() {
      var result = store.remove('TestString');
      expect(result).to.be(true);
    });

    it('should execute a callback that returns true', function(done) {
      store.remove('TestNumber', function(result) {
        expect(result).to.be(true);
        done();
      });
    });

    it('should remove the stored item', function() {
      expect(store.get('TestNumber')).to.be(false);
    });
  });

  /**
   * StickyStore.removeAll();
   */

  describe('StickyStore.removeAll()', function() {
    before(function() {
      store.set('TestString', 'TestString');
      store.set('TestNumber', 604);
    });

    it('should execute a callback that returns true', function(done) {
      store.removeAll(function(result) {
        expect(result).to.be(true);
        done();
      });
    });

    it('should remove all stored items', function(done) {
      store.removeAll(function() {
        store.get('TestNumber', function(result) {
          expect(result).to.be(false);
          done();
        });
      });
    });
  });
};

// Don't include test if browser doesn't support this storage adapter
if (typeof document.cookie === 'string') {
  describe('cookie', testCookie);
}
else {
  throw new Error("Browser doesn't support cookies; test omitted.");
}
