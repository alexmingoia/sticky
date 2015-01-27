/*!
 * sticky
 * https://github.com/alexmingoia/sticky
 */

'use strict';

var expect = require('chai').expect;
var StickyStore = process.env.JSCOV ? require('../lib-cov/sticky') : require('../lib/sticky');

describe('sticky module', function () {
  it('exports constructor', function () {
    expect(StickyStore).to.be.an('function');
    var store = new StickyStore('test');
    expect(store).to.have.property('name', 'test');
  });

  it('gets value');

  it('sets value');

  it('expires items');
});
