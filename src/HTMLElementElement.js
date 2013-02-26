/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// TODO(sjmiles): implement HTMLElementElement via document.register

HTMLElementElement = function(inElement) {
  // poor man's custom element: install API
  mixin(inElement, HTMLElementElement.prototype);
  // options to glean from inElement attributes
  var options = {
    name: '',
    extends: null
  };
  // glean them
  takeAttributes(inElement, options);
  // default base
  var base = HTMLUnknownElement.prototype;
  // optional specified base
  if (options.extends) {
    // build an instance of options.extends
    var archetype = document.createElement(options.extends);
    // 'realize' a Nohd 
    // TODO(sjmiles): polyfill pollution
    archetype = archetype.node || archetype;
    // acquire the prototype
    base = archetype.__proto__ || Object.getPrototypeOf(archetype);
  }
  // extend base
  options.prototype = Object.create(base);
  // install options
  inElement.options = options;
  // locate user script
  var script = inElement.querySelector('script');
  if (script) {
    // execute user script in 'inElement' context
    executeComponentScript(script.textContent, inElement, options.name);
  };
  // register our new element
  document.register(options.name, options);
  return inElement;
};

HTMLElementElement.prototype = {
  register: function(inMore) {
    if (inMore) {
      this.options.lifecycle = inMore.lifecycle;
      if (inMore.prototype) {
        mixin(this.options.prototype, inMore.prototype);
      }
    }
  }
};

// invoke inScript in inContext scope
function executeComponentScript(inScript, inContext, inName) {
  // set (highlander) context
  context = inContext;
  // compose script
  var code = "__componentScript('"
    + inName
    + "', function(){"
    + inScript
    + "});"
    + "\n//@ sourceURL=" + inContext.ownerDocument._URL + "\n"
  ;
  eval(code);
}

var context;

// global necessary for script injection
window.__componentScript = function(inName, inFunc) {
  inFunc.call(context);
};

// utilities

// each property in inDictionary takes a value
// from the matching attribute in inElement, if any
function takeAttributes(inElement, inDictionary) {
  for (var n in inDictionary) {
    var a = inElement.attributes[n];
    if (a) {
      inDictionary[n] = a.value;
    }
  }
}