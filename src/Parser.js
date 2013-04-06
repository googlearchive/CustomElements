/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {

var IMPORT_LINK_TYPE = 'import';

// highlander object for parsing a document tree

var componentParser = {
  selectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']',
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
  parsed: {},
  parse: function(inDocument) {
    // TODO(sorvell): parse each document only once.
    // We should be able to mark documents that have been parsed.
    // A loading issue is preventing us from doing that, so temporarily
    // use a url cache.
    var url = inDocument.URL || inDocument._URL;
    if (inDocument && !this.parsed[url]) {
      this.parsed[url] = true;
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
    if (isDocumentLink(inLinkElt)) {
      cp.parse(inLinkElt.__resource);
    } else if (!inMainDocument(inLinkElt) && inLinkElt.parentNode && 
      !isElementElementChild(inLinkElt)) {
      document.head.appendChild(inLinkElt);
    }
  },
  parseScript: function(inScriptElt) {
    // ignore scripts in primary document, they are already loaded
    if (inMainDocument(inScriptElt)) {
      return;
    }
    // ignore scripts inside <element>
    if (isElementElementChild(inScriptElt)) {
      return;
    }
    // otherwise, evaluate now
    var code = inScriptElt.__resource || inScriptElt.textContent;
    if (code) {
      eval.call(window, code);
    }
  },
  parseStyle: function(inStyleElt) {
    if (!isElementElementChild(inStyleElt)) {
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

function isDocumentLink(inElt) {
  return (inElt.localName === 'link'
      && inElt.getAttribute('rel') === IMPORT_LINK_TYPE);
}

function isElementElementChild(inElt) {
  if (inElt.parentNode && inElt.parentNode.localName === 'element') {
    return true;
  }
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

if (window.HTMLImports) {
  document.addEventListener('HTMLImportsLoaded', bootstrap);
} else {
  window.addEventListener('load', bootstrap);
}

})();