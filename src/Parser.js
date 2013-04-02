/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {

// highlander object for parsing a document tree

var componentParser = {
  selectors: [
    'link[rel=component]',
    'link[rel=stylesheet]',
    'script[src]',
    'script',
    'style',
    'element'
  ],
  map: {
    link: 'parseLink',
    script: 'parseScript',
    element: 'parseElement',
    style: 'parseStyle'
  },
  parse: function(inDocument) {
    if (inDocument) {
      // upgrade all upgradeable static elements, anything dynamically
      // created should be caught by a watchDOM() observer
      document.upgradeElements(inDocument);
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(cp.selectors);
      // for each parsable node type in inDocument, call the parsing method
      // to it's local name
      forEach(elts, function(e) {
        //console.log(map[e.localName] + ":", path.nodeUrl(e));
        cp[cp.map[e.localName]](e);
      });
    }
  },
  parseLink: function(inLinkElt) {
    // rel=components
    if (this.isDocumentLink(inLinkElt)) {
      cp.parse(inLinkElt.__resource);
    } else if (!inMainDocument(inLinkElt) && !this.isElementElementChild(inLinkElt)) {
      // rel=stylesheet
      // inject into main document
      var style = document.createElement('style');
      style.textContent = inLinkElt.__resource;
      document.head.appendChild(style);
    }
  },
  isDocumentLink: function(inElt) {
    return (inElt.localName === 'link'
        && inElt.getAttribute('rel') === 'component');
  },
  isElementElementChild: function(inElt) {
    if (inElt.parentNode && inElt.parentNode.localName === 'element') {
      return true;
    }
  },
  parseScript: function(inScriptElt) {
    // ignore scripts in primary document, they are already loaded
    if (inMainDocument(inScriptElt)) {
      return;
    }
    // ignore scripts inside <element>
    if (this.isElementElementChild(inScriptElt)) {
      return;
    }
    // otherwise, evaluate now
    var code = inScriptElt.__resource || inScriptElt.textContent;
    if (code) {
      eval.call(window, code);
    }
  },
  parseStyle: function(inStyleElt) {
    if (!this.isElementElementChild(inStyleElt)) {
      document.querySelector('head').appendChild(inStyleElt);
    }
  },
  parseElement: function(inElementElt) {
    new HTMLElementElement(inElementElt);
  }
};

var cp = componentParser;

function inMainDocument(inElt) {
  return inElt.ownerDocument === document ||
    // TODO(sjmiles): ShadowDOMPolyfill intrusion
    inElt.ownerDocument.impl === document;
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

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
    // install auto-upgrader on main document
    document.watchDOM(document.body);
    // parse document
    componentParser.parse(document);
    // TODO(sjmiles): ShadowDOM polyfill pollution
    var doc = window.ShadowDOMPolyfill ? 
          ShadowDOMPolyfill.wrap(document) 
              : document;
    // notify system
    doc.body.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true})
    );
  }, 0);
}

// TODO(sjmiles): 'window' has no wrappability under ShadowDOM polyfill, so 
// we are forced to split into two versions
if (window.WebComponents) {
  document.addEventListener('WebComponentsLoaded', bootstrap);
} else {
  window.addEventListener('load', bootstrap);
}

})();