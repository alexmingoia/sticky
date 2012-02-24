/**
 * webSQL adapter tests
 */

var testWebSQL = function() {
  var store;

  before(function(done) {
    new StickyStore({
      name: 'test_websql',
      adapters: ['webSQL'],
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
    it('should execute a callback returning string to store', function(done) {
      store.set('TestString', 'Test String', function(result) {
        expect(result).to.be('Test String');
        done();
      });
    });
    // Array
    it('should execute a callback returning the array to store', function(done) {
      store.set('TestArray', ['Test Array'], function(result) {
        expect(result).to.eql(['Test Array']);
        done();
      });
    });
    // Number
    it('should execute a callback returning the number to store', function(done) {
      store.set('TestNumber', 604, function(result) {
        expect(result).to.be(604);
        done();
      });
    });
    // JSON Object
    it('should execute a callback returning the JSON object to store', function(done) {
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
    it('should execute a callback returning the stored string', function(done) {
      store.get('TestString', function(result) {
        expect(result).to.be('Test String');
        done();
      });
    });

    // Array
    it('should execute a callback returning the stored array', function(done) {
      store.get('TestArray', function(result) {
        expect(result).to.eql(['Test Array']);
        done();
      });
    });

    // Number
    it('should execute a callback returning the stored number', function(done) {
      store.get('TestNumber', function(result) {
        expect(result).to.be(604);
        done();
      });
    });

    // JSON Object
    it('should execute a callback returning the stored JSON object', function(done) {
      store.get('TestJSONObject', function(result) {
        expect(result).to.eql({'number': 604, 'string': 'test string'});
        done();
      });
    });

    after(function(done) {
      store.remove('TestString', function() {
        store.remove('TestNumber', function() {
          store.remove('TestArray', function() {
            store.remove('TestJSONObject', function() {
              done();
            });
          });
        });
      });
    });
  });

  /**
   * StickyStore.remove()
   */

  describe('StickyStore.remove()', function() {
    before(function(done) {
      store.set('TestArray', ['Test Array'], function() {
        store.set('TestJSONObject', {'number': 604, 'string': 'test string'}, function() {
          done();
        });
      });
    });

    it('should execute a callback that returns true', function(done) {
      store.remove('TestArray', function(result) {
        expect(result).to.be(true);
        done();
      });
    });

    it('should remove the stored item', function(done) {
      store.remove('TestJSONObject', function() {
        store.get('TestJSONObject', function(result) {
          expect(result).to.be(false);
          done();
        });
      });
    });
  });

  /**
   * StickyStore.removeAll()
   */

  describe('StickyStore.removeAll()', function() {
    beforeEach(function(done) {
      store.set('TestArray', ['Test Array'], function() {
        store.set('TestJSONObject', {'number': 604, 'string': 'test string'}, function() {
          done();
        });
      });
    });

    it('should execute a callback that returns true', function(done) {
      store.removeAll(function(result) {
        expect(result).to.be(true);
        done();
      });
    });

    it ('should remove all items stored', function(done) {
      store.removeAll(function() {
        store.get('TestJSONObject', function(result) {
          expect(result).to.be(false);
          done();
        });
      });
    });
  });
};

// Don't include test if browser doesn't support this storage adapter
if (window.openDatabase) {
  describe('webSQL', testWebSQL);
}
else {
  throw new Error("Browser doesn't support webSQL; test omitted.");
}
