/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {
  /*
    Shim :unresolved via an attribute unresolved.
    TODO(sorvell): This is currently done once when the first
    round of elements are upgraded. This is incorrect, and it will
    need to be done dynamically.
    The 'resolved' attribute is experimental and may be removed.
  */
  var TRANSITION_TIME = 0.3;
  var UNRESOLVED = 'unresolved';
  var RESOLVED = 'resolved';
  var UNRESOLVED_SELECTOR = '[' + UNRESOLVED + ']';
  var RESOLVED_SELECTOR = '[' + RESOLVED + ']';
  var style = document.createElement('style');
  
  style.textContent = UNRESOLVED_SELECTOR + ' { ' +
      'opacity: 0; display: block; overflow: hidden; } \n' +
      RESOLVED_SELECTOR +  '{ display: block; overflow: hidden;\n' +
      '-webkit-transition: opacity ' + TRANSITION_TIME + 's; ' +
      'transition: opacity ' + TRANSITION_TIME +'s; }\n';
  var head = document.querySelector('head');
  head.insertBefore(style, head.firstChild);

  // remove unresolved and apply resolved class
  function resolveElements() {
    requestAnimationFrame(function() {
      var nodes = document.querySelectorAll(UNRESOLVED_SELECTOR);
      for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
        n.removeAttribute(UNRESOLVED);
        n.setAttribute(RESOLVED, '');
      }

      // NOTE: depends on transition end event to remove 'resolved' class.
      if (nodes.length) {
        var removeResolved = function() {
          for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
            n.removeAttribute(RESOLVED);
          }
          document.body.removeEventListener(endEvent, removeResolved, false);
        }
        document.body.addEventListener(endEvent, removeResolved, false);
      };

    });
  }

  // determine transition end event
  var endEvent = (document.documentElement.style.webkitTransition !== undefined) ?
      'webkitTransitionEnd' : 'transitionend';

  // hookup auto-unveiling
  window.addEventListener('WebComponentsReady', resolveElements);

})(CustomElements);
