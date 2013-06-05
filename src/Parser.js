/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
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
  parse: function(inDocument) {
    if (!inDocument.__parsed) {
      // only parse once
      inDocument.__parsed = true;
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(cp.selectors);
      // for each parsable node type, call the mapped parsing method
      forEach(elts, function(e) {
        //console.log(map[e.localName] + ":", path.nodeUrl(e));
        cp[cp.map[e.localName]](e);
      });
      // upgrade all upgradeable static elements, anything dynamically
      // created should be caught by observer
      CustomElements.upgradeDocument(inDocument);
      // observe document for dom changes
      CustomElements.observeDocument(inDocument);
    }
  },
  parseLink: function(inLinkElt) {
    // imports
    if (isDocumentLink(inLinkElt)) {
      if (inLinkElt.content) {
        cp.parse(inLinkElt.content);
      }
    } else if (canAddToMainDoument(inLinkElt)) {
      document.head.appendChild(inLinkElt);
    }
  },
  parseScript: function(inScriptElt) {
    if (canAddToMainDoument(inScriptElt)) {
      // otherwise, evaluate now
      var code = inScriptElt.__resource || inScriptElt.textContent;
      if (code) {
        code += "\n//@ sourceURL=" + inScriptElt.__nodeUrl + "\n";
        eval.call(window, code);
      }
    }
  },
  parseStyle: function(inStyleElt) {
    if (canAddToMainDoument(inStyleElt)) {
      document.head.appendChild(inStyleElt);
    }
  },
  parseElement: function(inElementElt) {
    new HTMLElementElement(inElementElt);
  }
};

var cp = componentParser;

// nodes can be moved to the main document
// if they are not in the main document, are not children of <element>
// and are in a tree at parse time.
function canAddToMainDoument(node) {
  return !inMainDocument(node)
    && node.parentNode
    && !isElementElementChild(node);
}

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

// exports

CustomElements.parser = componentParser;

})();