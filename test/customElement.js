/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('customElements', function() {
  var work;
  var assert = chai.assert;

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });

  test('document.register', function() {
    // register x-foo
    var XFoo = document.register('x-foo');
    // create an instance via new
    var xfoo = new XFoo();
    // test localName
    assert.equal(xfoo.localName, 'x-foo');
    // attach content
    work.appendChild(xfoo).textContent = '[x-foo]';
    // reacquire
    var xfoo = work.querySelector('x-foo');
    // test textContent
    assert.equal(xfoo.textContent, '[x-foo]');
    // create an instance via createElement
    var xfoo2 = document.createElement('x-foo');
    // test localName
    assert.equal(xfoo2.localName, 'x-foo');
    // attach content
    xfoo2.textContent = '[x-foo2]';
    // test textContent
    assert.equal(xfoo2.textContent, '[x-foo2]');
  });

  test('document.register extend native element', function() {
    // test native element extension
    var XBarPrototype = Object.create(HTMLButtonElement.prototype);
    var XBar = document.register('x-bar', {
      prototype: XBarPrototype,
      extends: 'button'
    });
    var xbar = new XBar();
    work.appendChild(xbar).textContent = 'x-bar';
    xbar = work.querySelector('button[is=x-bar]');
    assert(xbar);
    assert.equal(xbar.textContent, 'x-bar');
    // test extension of native element extension
    var XBarBarPrototype = Object.create(XBarPrototype);
    var XBarBar = document.register('x-barbar', {
      prototype: XBarBarPrototype,
      extends: 'x-bar'
    });
    var xbarbar = new XBarBar();
    work.appendChild(xbarbar).textContent = 'x-barbar';
    xbarbar = work.querySelector('button[is=x-barbar]');
    assert(xbarbar);
    assert.equal(xbarbar.textContent, 'x-barbar');
    // test extension^3
    var XBarBarBarPrototype = Object.create(XBarBarPrototype);
    var XBarBarBar = document.register('x-barbarbar', {
      prototype: XBarBarBarPrototype,
      extends: 'x-barbar'
    });
    var xbarbarbar = new XBarBarBar();
    work.appendChild(xbarbarbar).textContent = 'x-barbarbar';
    xbarbarbar = work.querySelector('button[is=x-barbarbar]');
    assert(xbarbarbar);
    assert.equal(xbarbarbar.textContent, 'x-barbarbar');
  });

  test('document.register prototype/lifecycle', function() {
    var XZotPrototype = Object.create(HTMLElement.prototype);
    XZotPrototype.bluate = function() {
      this.color = 'lightblue';
    };
    var XZot = document.register('x-zot', {
      prototype: XZotPrototype,
      lifecycle: {
        created: function() {
          this.style.fontStyle = 'italic';
        }
      }
    });
    var xzot = new XZot();
    assert.equal(xzot.style.fontStyle, 'italic');
    xzot.bluate();
    assert.equal(xzot.color, 'lightblue');
    //
    var XBazPrototype = Object.create(XZotPrototype);
    XBazPrototype.splat = function() {
      this.textContent = 'splat';
    };
    var XBaz = document.register('x-baz', {
      prototype: XBazPrototype,
      extends: 'x-zot',
      lifecycle: {
        created: function() {
          this.style.fontSize = '32pt';
        }
      }
    });
    var xbaz = new XBaz();
    assert.equal(xbaz.style.fontStyle, 'italic');
    assert.equal(xbaz.style.fontSize, '32pt');
    xbaz.bluate();
    assert.equal(xbaz.color, 'lightblue');
    xbaz.splat();
    assert.equal(xbaz.textContent, 'splat');
  });
});
