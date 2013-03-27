/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('watchDOM', function() {
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
    var proto = Object.create(HTMLElement.prototype);
    proto.value = inValue || 'value';
    document.register(inName, {
      prototype: proto
    });
  }

  test('custom element automatically upgrades', function(done) {
    registerTestComponent('x-auto', 'auto');
    work.innerHTML = '<x-auto></x-auto>';
    var x = work.firstChild;
    assert.isUndefined(x.value);
    setTimeout(function() {
      assert.equal(x.value, 'auto');
      done();
    }, 0);
  });
  
  
  test('custom elements automatically upgrades', function(done) {
    registerTestComponent('x-auto1', 'auto1');
    registerTestComponent('x-auto2', 'auto2');
    work.innerHTML = '<div><div><x-auto1></x-auto1><x-auto1></x-auto1>' +
      '</div></div><div><x-auto2><x-auto1></x-auto1></x-auto2>' +
      '<x-auto2><x-auto1></x-auto1></x-auto2></div>';
    function testElements(selector, value) {
      Array.prototype.forEach.call(work.querySelectorAll(selector), function(n) {
        assert.equal(n.value, value);
      });
    }
    setTimeout(function() {
      testElements('x-auto1', 'auto1');
      testElements('x-auto2', 'auto2');
      done();
    });
  });
  
  test('custom element automatically upgrades in ShadowDOM', function(done) {
    assert.isDefined(HTMLElement.prototype.webkitCreateShadowRoot);
    registerTestComponent('x-auto-shadow', 'auto-shadow');
    work.innerHTML = '<div></div>';
    var div = work.firstChild;
    var root = div.webkitCreateShadowRoot();
    document.watchDOM(root);
    root.innerHTML = '<x-auto-shadow></x-auto-shadow>';
    var x = root.firstChild;
    assert.isUndefined(x.value);
    setTimeout(function() {
      assert.equal(x.value, 'auto-shadow');
      done();
    }, 0);
  });
  
  
  /*
  test('document.upgradeElements upgrades custom element syntax', function() {
    registerTestComponent('x-zot', 'zot');
    registerTestComponent('x-zim', 'zim');
    work.innerHTML = '<x-zot><x-zim></x-zim></x-zot>';
    var xzot = work.firstChild, xzim = xzot.firstChild;
    document.upgradeElements(work);
    assert.equal(xzot.value, 'zot');
    assert.equal(xzim.value, 'zim');
  });
  
  test('document.upgradeElement upgrades native extendor', function() {
    var XButtonProto = Object.create(HTMLButtonElement.prototype);
    XButtonProto.test = 'xbutton';
    document.register('x-button', {
      extends: 'button',
      prototype: XButtonProto
    });
    
    work.innerHTML = '<button is="x-button"></button>';
    var xbutton = work.firstChild;
    document.upgradeElement(xbutton);
    assert.equal(xbutton.test, 'xbutton');
  });
  
  
  test('document.upgradeElement upgrades extendor of native extendor', function() {
    var XInputProto = Object.create(HTMLInputElement.prototype);
    XInputProto.xInput = 'xInput';
    var XInput = document.register('x-input', {
      extends: 'input',
      prototype: XInputProto
    });
    var XSpecialInputProto = Object.create(XInput.prototype);
    XSpecialInputProto.xSpecialInput = 'xSpecialInput';
    var XSpecialInput = document.register('x-special-input', {
      extends: 'x-input',
      prototype: XSpecialInputProto
    });
    work.innerHTML = '<input is="x-special-input">';
    var x = work.firstChild;
    document.upgradeElement(x);
    assert.equal(x.xInput, 'xInput');
    assert.equal(x.xSpecialInput, 'xSpecialInput');
  });
  
  
  test('document.upgradeElements upgrades native extendor', function() {
    var YButtonProto = Object.create(HTMLButtonElement.prototype);
    YButtonProto.test = 'ybutton';
    document.register('y-button', {
      extends: 'button',
      prototype: YButtonProto
    });
    
    work.innerHTML = '<button is="y-button">0</button>' +
      '<div><button is="y-button">1</button></div>' +
      '<div><div><button is="y-button">2</button></div></div>';
    document.upgradeElements(work);
    var b$ = work.querySelectorAll('[is=y-button]');
    Array.prototype.forEach.call(b$, function(b, i) {
      assert.equal(b.test, 'ybutton');
      assert.equal(b.textContent, i);
    });
    
    
  });
  */
  
});
