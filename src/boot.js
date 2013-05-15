/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(){

// bootstrap parsing

// IE shim for CustomEvent
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = function(inType) {
     var e = document.createEvent('HTMLEvents');
     e.initEvent(inType, true, true);
     return e;
  };
}

function bootstrap() {
  // go async so call stack can unwind
  setTimeout(function() {
    // parse document
    CustomElements.parser.parse(document);
    // set internal flag
    CustomElements.ready = true;
    CustomElements.readyTime = new Date().getTime();
    if (window.HTMLImports) {
      CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;
    }
    // notify system
    document.body.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true})
    );
  }, 0);
}

// TODO(sjmiles): 'window' has no wrappability under ShadowDOM polyfill, so
// we are forced to split into two versions

if (window.HTMLImports) {
  document.addEventListener('HTMLImportsLoaded', bootstrap);
} else {
  window.addEventListener('load', bootstrap);
}

})();
