/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
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

  test('document.registerElement requires name argument', function() {
    try {
      document.registerElement();
    } catch(x) {
      return;
    }
    assert.ok(false, 'document.registerElement failed to throw when given no arguments');
  });

  test('document.registerElement requires name argument to contain a dash', function() {
    try {
      document.registerElement('xfoo', {prototype: Object.create(HTMLElement.prototype)});
    } catch(x) {
      return;
    }
    assert.ok(false, 'document.registerElement failed to throw when given no arguments');
  });

  test('document.registerElement requires name argument to be unique', function() {
    var proto = {prototype: Object.create(HTMLElement.prototype)};
    document.registerElement('x-duplicate', proto);
    try {
      document.registerElement('x-duplicate', proto);
    } catch(x) {
      return;
    }
    assert.ok(false, 'document.registerElement failed to throw when called multiple times with the same element name');
  });

  test('document.registerElement create via new', function() {
    // register x-foo
    var XFoo = document.registerElement('x-foo', {prototype: Object.create(HTMLElement.prototype)});
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
  });

  test('document.registerElement create via createElement', function() {
    // register x-foo
    var XFoo = document.registerElement('x-foo2', {prototype:  Object.create(HTMLElement.prototype)});
    // create an instance via createElement
    var xfoo = document.createElement('x-foo2');
    // test localName
    assert.equal(xfoo.localName, 'x-foo2');
    // attach content
    xfoo.textContent = '[x-foo2]';
    // test textContent
    assert.equal(xfoo.textContent, '[x-foo2]');
  });

  test('document.registerElement treats names as case insensitive', function() {
    var proto = {prototype: Object.create(HTMLElement.prototype)};
    proto.prototype.isXCase = true;
    var XCase = document.registerElement('X-CASE', proto);
    // createElement
    var x = document.createElement('X-CASE');
    assert.equal(x.isXCase, true);
    x = document.createElement('x-case');
    assert.equal(x.isXCase, true);
    // upgrade
    work.innerHTML = '<X-CASE></X-CASE><x-CaSe></x-CaSe>';
    CustomElements.takeRecords();
    assert.equal(work.firstChild.isXCase, true);
    assert.equal(work.firstChild.nextSibling.isXCase, true);
  });

  test('document.registerElement create multiple instances', function() {
    var XFooPrototype = Object.create(HTMLElement.prototype);
    XFooPrototype.bluate = function() {
      this.color = 'lightblue';
    };
    var XFoo = document.registerElement('x-foo3', {
      prototype: XFooPrototype
    });
    // create an instance
    var xfoo1 = new XFoo();
    // create another instance
    var xfoo2 = new XFoo();
    // test textContent
    xfoo1.textContent = '[x-foo1]';
    xfoo2.textContent = '[x-foo2]';
    assert.equal(xfoo1.textContent, '[x-foo1]');
    assert.equal(xfoo2.textContent, '[x-foo2]');
    // test bluate
    xfoo1.bluate();
    assert.equal(xfoo1.color, 'lightblue');
    assert.isUndefined(xfoo2.color);
  });

  test('document.registerElement extend native element', function() {
    // test native element extension
    var XBarPrototype = Object.create(HTMLButtonElement.prototype);
    var XBar = document.registerElement('x-bar', {
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
    var XBarBar = document.registerElement('x-barbar', {
      prototype: XBarBarPrototype,
      extends: 'button'
    });
    var xbarbar = new XBarBar();
    work.appendChild(xbarbar).textContent = 'x-barbar';
    xbarbar = work.querySelector('button[is=x-barbar]');
    assert(xbarbar);
    assert.equal(xbarbar.textContent, 'x-barbar');
    // test extension^3
    var XBarBarBarPrototype = Object.create(XBarBarPrototype);
    var XBarBarBar = document.registerElement('x-barbarbar', {
      prototype: XBarBarBarPrototype,
      extends: 'button'
    });
    var xbarbarbar = new XBarBarBar();
    work.appendChild(xbarbarbar).textContent = 'x-barbarbar';
    xbarbarbar = work.querySelector('button[is=x-barbarbar]');
    assert(xbarbarbar);
    assert.equal(xbarbarbar.textContent, 'x-barbarbar');
  });

  test('document.registerElement createdCallback in prototype', function() {
    var XBooPrototype = Object.create(HTMLElement.prototype);
    XBooPrototype.createdCallback = function() {
      this.style.fontStyle = 'italic';
    }
    var XBoo = document.registerElement('x-boo', {
      prototype: XBooPrototype
    });
    var xboo = new XBoo();
    assert.equal(xboo.style.fontStyle, 'italic');
    //
    var XBooBooPrototype = Object.create(XBooPrototype);
    XBooBooPrototype.createdCallback = function() {
      XBoo.prototype.createdCallback.call(this);
      this.style.fontSize = '32pt';
    };
    var XBooBoo = document.registerElement('x-booboo', {
      prototype: XBooBooPrototype
    });
    var xbooboo = new XBooBoo();
    assert.equal(xbooboo.style.fontStyle, 'italic');
    assert.equal(xbooboo.style.fontSize, '32pt');
  });

  test('document.registerElement [created|attached|detached]Callbacks in prototype', function(done) {
    var ready, inserted, removed;
    var XBooPrototype = Object.create(HTMLElement.prototype);
    XBooPrototype.createdCallback = function() {
      ready = true;
    }
    XBooPrototype.attachedCallback = function() {
      inserted = true;
    }
    XBooPrototype.detachedCallback = function() {
      removed = true;
    }
    var XBoo = document.registerElement('x-boo-ir', {
      prototype: XBooPrototype
    });
    var xboo = new XBoo();
    assert(ready, 'ready must be true [XBoo]');
    assert(!inserted, 'inserted must be false [XBoo]');
    assert(!removed, 'removed must be false [XBoo]');
    work.appendChild(xboo);
    CustomElements.takeRecords();
    assert(inserted, 'inserted must be true [XBoo]');
    work.removeChild(xboo);
    CustomElements.takeRecords();
    assert(removed, 'removed must be true [XBoo]');
    //
    ready = inserted = removed = false;
    var XBooBooPrototype = Object.create(XBooPrototype);
    XBooBooPrototype.createdCallback = function() {
      XBoo.prototype.createdCallback.call(this);
    };
    XBooBooPrototype.attachedCallback = function() {
      XBoo.prototype.attachedCallback.call(this);
    };
    XBooBooPrototype.detachedCallback = function() {
      XBoo.prototype.detachedCallback.call(this);
    };
    var XBooBoo = document.registerElement('x-booboo-ir', {
      prototype: XBooBooPrototype
    });
    var xbooboo = new XBooBoo();
    assert(ready, 'ready must be true [XBooBoo]');
    assert(!inserted, 'inserted must be false [XBooBoo]');
    assert(!removed, 'removed must be false [XBooBoo]');
    work.appendChild(xbooboo);
    CustomElements.takeRecords();
    assert(inserted, 'inserted must be true [XBooBoo]');
    work.removeChild(xbooboo);
    CustomElements.takeRecords();
    assert(removed, 'removed must be true [XBooBoo]');
    done();
  });

  test('document.registerElement attributeChangedCallback in prototype', function(done) {
    var XBooPrototype = Object.create(HTMLElement.prototype);
    XBooPrototype.attributeChangedCallback = function(inName, inOldValue) {
      if (inName == 'foo' && inOldValue=='bar'
          && this.attributes.foo.value == 'zot') {
        done();
      }
    }
    var XBoo = document.registerElement('x-boo-acp', {
      prototype: XBooPrototype
    });
    var xboo = new XBoo();
    xboo.setAttribute('foo', 'bar');
    xboo.setAttribute('foo', 'zot');
  });

  test('document.registerElement attachedCallbacks in prototype', function(done) {
    var inserted = 0;
    var XBooPrototype = Object.create(HTMLElement.prototype);
    XBooPrototype.attachedCallback = function() {
      inserted++;
    };
    var XBoo = document.registerElement('x-boo-at', {
      prototype: XBooPrototype
    });
    var xboo = new XBoo();
    assert.equal(inserted, 0, 'inserted must be 0');
    work.appendChild(xboo);
    CustomElements.takeRecords();
    assert.equal(inserted, 1, 'inserted must be 1');
    work.removeChild(xboo);
    CustomElements.takeRecords();
    assert(!xboo.parentNode);
    work.appendChild(xboo);
    CustomElements.takeRecords();
    assert.equal(inserted, 2, 'inserted must be 2');
    done();
  });

  test('document.registerElement detachedCallbacks in prototype', function(done) {
    var ready, inserted, removed;
    var XBooPrototype = Object.create(HTMLElement.prototype);
    XBooPrototype.detachedCallback = function() {
      removed = true;
    }
    var XBoo = document.registerElement('x-boo-ir2', {
      prototype: XBooPrototype
    });
    var xboo = new XBoo();
    assert(!removed, 'removed must be false [XBoo]');
    work.appendChild(xboo);
    CustomElements.takeRecords();
    work.removeChild(xboo);
    CustomElements.takeRecords();
    assert(removed, 'removed must be true [XBoo]');
    //
    ready = inserted = removed = false;
    var XBooBooPrototype = Object.create(XBooPrototype);
    XBooBooPrototype.detachedCallback = function() {
      XBoo.prototype.detachedCallback.call(this);
    };
    var XBooBoo = document.registerElement('x-booboo-ir2', {
      prototype: XBooBooPrototype
    });
    var xbooboo = new XBooBoo();
    assert(!removed, 'removed must be false [XBooBoo]');
    work.appendChild(xbooboo);
    CustomElements.takeRecords();
    work.removeChild(xbooboo);
    CustomElements.takeRecords();
    assert(removed, 'removed must be true [XBooBoo]');
    done();
  });

  test('document.registerElement can use Functions as definitions', function() {
    // function used as Custom Element defintion
    function A$A() {
      this.alive = true;
    }
    A$A.prototype = Object.create(HTMLElement.prototype);
    // bind createdCallback to function body
    A$A.prototype.createdCallback = A$A;
    A$A = document.registerElement('a-a', A$A);
    // test via new
    var a = new A$A();
    assert.equal(a.alive, true);
    // test via parser upgrade
    work.innerHTML = '<a-a></a-a>';
    CustomElements.takeRecords();
    assert.equal(work.firstElementChild.alive, true);
  });

  test('node.cloneNode upgrades', function(done) {
    var XBooPrototype = Object.create(HTMLElement.prototype);
    XBooPrototype.createdCallback = function() {
      this.__ready__ = true;
    };
    var XBoo = document.registerElement('x-boo-clone', {
      prototype: XBooPrototype
    });
    var xboo = new XBoo();
    work.appendChild(xboo);
    CustomElements.takeRecords();
    var xboo2 = xboo.cloneNode(true);
    assert(xboo2.__ready__, 'clone createdCallback must be called');
    done();
  });

  test('entered left apply to view', function() {
    var invocations = [];
    var elementProto = Object.create(HTMLElement.prototype);
    elementProto.createdCallback = function() {
      invocations.push('created');
    }
    elementProto.attachedCallback = function() {
      invocations.push('entered');
    }
    elementProto.detachedCallback = function() {
      invocations.push('left');
    }
    var tagName = 'x-entered-left-view';
    var CustomElement = document.registerElement(tagName, { prototype: elementProto });

    var docB = document.implementation.createHTMLDocument('');
    docB.body.innerHTML = '<' + tagName + '></' + tagName + '>';
    CustomElements.parser.parse(docB);
    CustomElements.takeRecords();
    assert.deepEqual(invocations, ['created'], 'created but not entered view');

    var element = docB.body.childNodes[0];
    // note, cannot use instanceof due to IE
    assert.equal(element.__proto__, CustomElement.prototype, 'element is correct type');

    work.appendChild(element)
    CustomElements.takeRecords();
    assert.deepEqual(invocations, ['created', 'entered'],
        'created and entered view');

    docB.body.appendChild(element);
    CustomElements.takeRecords();
    assert.deepEqual(invocations, ['created', 'entered', 'left'],
        'created, entered then left view');
  });
});

htmlSuite('customElements (html)', function() {
  htmlTest('html/attributes.html');
});
