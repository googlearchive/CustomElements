/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLElement', function() {
  var work;
  var assert = chai.assert;

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });
  
  
  function registerTestComponent(inName, inValue) {
    var element = '<element name="' + inName + '"></element>';
  }
  

  test('component upgraded', function() {
    work.innerHTML = '<element name="x-test-element"></element>' +
      '<x-test-element>Foo</x-test-element>';
    document.parseComponents();
    var xtest = work.lastChild;
    document.upgradeElement(xtest);
    assert.equal(xtest.__upgraded__, true);
  });
  
  test('component with script', function() {
    work.innerHTML = '<element name="x-test-script-element">' +
      '<script>' +
        'this.register({' +
          'prototype: {' +
            'value: "x-test-script-element"' +
          '}' +
      '});' +
      '</script>' +
      '</element>' +
      '<x-test-script-element></x-test-script-element>';
    document.parseComponents();
    var x = work.lastChild;
    document.upgradeElement(x);
    assert.equal(x.__upgraded__, true);
    assert.equal(x.value, 'x-test-script-element');
  });
  
});
