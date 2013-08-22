/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */


// Adapted from:
// https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/LayoutTests/fast/dom/custom/document-register-type-extensions.html
var testForm = document.createElement('form');

function isFormControl(element)
{
  testForm.appendChild(element);
  return element.form == testForm;
}

suite('register-type-extensions', function() {
  var assert = chai.assert;

  var fooConstructor = document.register('x-foo-x', {
      prototype: Object.create(HTMLElement.prototype) });
  var fooOuterHTML = '<x-foo-x></x-foo-x>';
  var barConstructor = document.register('x-bar-x', {
      prototype: Object.create(HTMLInputElement.prototype),
      extends:'input'});
  var barOuterHTML = '<input is="x-bar-x">';
  var bazConstructor = document.register('x-baz', {
      prototype: Object.create(fooConstructor.prototype) });
  var quxConstructor = document.register('x-qux', {
      prototype: Object.create(barConstructor.prototype),
      extends:'x-bar-x'});

  test('cannot register twice', function() {
    assert.throws(function() {
      document.register('x-foo-x', {
          prototype: Object.create(HTMLDivElement.prototype) });
    });
  });

  suite('generated constructors', function() {
    test('custom tag', function() {
      var fooNewed = new fooConstructor();
      assert.equal(fooNewed.outerHTML, fooOuterHTML);
      assert.instanceOf(fooNewed, fooConstructor);
      assert.instanceOf(fooNewed, HTMLElement);
      assert.notInstanceOf(fooNewed, HTMLUnknownElement);

      test('custom tag constructor', function() {
        assert.equal('a', 'b');
      });
    });

    test('type extension', function() {
      var barNewed = new barConstructor();
      assert.equal(barNewed.outerHTML, barOuterHTML);
      assert.instanceOf(barNewed, barConstructor);
      assert.instanceOf(barNewed, HTMLInputElement);
      assert.ok(isFormControl(barNewed));
    });

    test('custom tag deriving from custom tag', function() {
      var bazNewed = new bazConstructor();
      var bazOuterHTML = '<x-baz></x-baz>';
      assert.equal(bazNewed.outerHTML, bazOuterHTML);
      assert.instanceOf(bazNewed, bazConstructor);
      assert.instanceOf(bazNewed, HTMLElement);
      assert.notInstanceOf(bazNewed, HTMLUnknownElement);
    });

    test('type extension deriving from custom tag', function() {
      var quxNewed = new quxConstructor();
      var quxOuterHTML = '<input is="x-qux">';
      assert.instanceOf(quxNewed, quxConstructor);
      assert.instanceOf(quxNewed, barConstructor);
      assert.instanceOf(quxNewed, HTMLInputElement);
      assert.equal(quxNewed.outerHTML, quxOuterHTML);
      assert.ok(isFormControl(quxNewed));
    });
  });

  suite('single-parameter createElement', function() {
    test('custom tag', function() {
      var fooCreated = document.createElement('x-foo-x');
      assert.equal(fooCreated.outerHTML, fooOuterHTML);
      assert.instanceOf(fooCreated, fooConstructor);
    });

    test('type extension', function() {
      var barCreated = document.createElement('x-bar-x');
      assert.equal(barCreated.outerHTML, '<x-bar-x></x-bar-x>');
      assert.notInstanceOf(barCreated, barConstructor);
      assert.notInstanceOf(barCreated, HTMLUnknownElement);
      assert.instanceOf(barCreated, HTMLElement);
    });

    test('custom tag deriving from custom tag', function() {
      bazCreated = document.createElement('x-baz');
      assert.equal(bazCreated.outerHTML, '<x-baz></x-baz>');
      assert.instanceOf(bazCreated, bazConstructor);
      assert.notInstanceOf(bazCreated, HTMLUnknownElement);
    });

    test('type extension deriving from custom tag', function() {
      quxCreated = document.createElement('x-qux');
      assert.equal(quxCreated.outerHTML, '<x-qux></x-qux>');
      assert.notInstanceOf(quxCreated, quxConstructor);
      assert.notInstanceOf(quxCreated, HTMLUnknownElement);
      assert.instanceOf(quxCreated, HTMLElement);
    });
  });

  suite('createElement with type extensions', function() {
    test('extension is custom tag', function() {
      var divFooCreated = document.createElement('div', 'x-foo-x');
      assert.equal(divFooCreated.outerHTML, '<div is="x-foo-x"></div>');
      assert.notInstanceOf(divFooCreated, fooConstructor);
      assert.instanceOf(divFooCreated, HTMLDivElement);
    });

    test('valid extension', function() {
      var inputBarCreated = document.createElement('input', 'x-bar-x');
      assert.equal(inputBarCreated.outerHTML, barOuterHTML);
      assert.instanceOf(inputBarCreated, barConstructor);
      assert.notInstanceOf(inputBarCreated, HTMLUnknownElement);
      assert.ok(isFormControl(inputBarCreated));
    });

    test('type extension of incorrect tag', function() {
      var divBarCreated = document.createElement('div', 'x-bar-x');
      assert.equal(divBarCreated.outerHTML, '<div is="x-bar-x"></div>');
      assert.notInstanceOf(divBarCreated, barConstructor);
      assert.instanceOf(divBarCreated, HTMLDivElement);
    });

    test('incorrect extension of custom tag', function() {
      var fooBarCreated = document.createElement('x-foo-x', 'x-bar-x');
      assert.equal(fooBarCreated.outerHTML, '<x-foo-x is="x-bar-x"></x-foo-x>');
      assert.instanceOf(fooBarCreated, fooConstructor);
    });

    test('incorrect extension of type extension', function() {
      var barFooCreated = document.createElement('x-bar-x', 'x-foo-x');
      assert.equal(barFooCreated.outerHTML, '<x-bar-x is="x-foo-x"></x-bar-x>');
      assert.notInstanceOf(barFooCreated, HTMLUnknownElement);
      assert.instanceOf(barFooCreated, HTMLElement);
    });

    test('null type extension', function() {
      var fooCreatedNull = document.createElement('x-foo-x', null);
      assert.equal(fooCreatedNull.outerHTML, fooOuterHTML);
      assert.instanceOf(fooCreatedNull, fooConstructor);
    });

    test('empty type extension', function() {
      fooCreatedEmpty = document.createElement('x-foo-x', '');
      assert.equal(fooCreatedEmpty.outerHTML, fooOuterHTML);
      assert.instanceOf(fooCreatedEmpty, fooConstructor);
    });

    test('invalid tag name', function() {
      assert.throws(function() {
        document.createElement('@invalid', 'x-bar-x');
      });
    });
  });

  suite('parser', function() {
    function createElementFromHTML(html) {
      var container = document.createElement('div');
      container.innerHTML = html;
      if (window.CustomElements) {
        window.CustomElements.upgradeAll(container);
      }
      return container.firstChild;
    }

    test('custom tag', function() {
      var fooParsed = createElementFromHTML('<x-foo-x>');
      assert.instanceOf(fooParsed, fooConstructor);
    });

    test('type extension', function() {
      var barParsed = createElementFromHTML('<input is="x-bar-x">')
      assert.instanceOf(barParsed, barConstructor);
      assert.ok(isFormControl(barParsed));
    });

    test('custom tag as type extension', function() {
      var divFooParsed = createElementFromHTML('<div is="x-foo-x">')
      assert.notInstanceOf(divFooParsed, fooConstructor);
      assert.instanceOf(divFooParsed, HTMLDivElement);
    });

    // Should we upgrade invalid tags to HTMLElement?
    /*test('type extension as custom tag', function() {
      var namedBarParsed = createElementFromHTML('<x-bar-x>')
      assert.notInstanceOf(namedBarParsed, barConstructor);
      assert.notInstanceOf(namedBarParsed, HTMLUnknownElement);
      assert.instanceOf(namedBarParsed, HTMLElement);
    });*/

    test('type extension of incorrect tag', function() {
      var divBarParsed = createElementFromHTML('<div is="x-bar-x">')
      assert.notInstanceOf(divBarParsed, barConstructor);
      assert.instanceOf(divBarParsed, HTMLDivElement);
    });
  });
});
