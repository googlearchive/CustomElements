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
    'element'
  ],
  map: {
    link: 'parseLink',
    script: 'parseScript',
    element: 'parseElement'
  },
  parse: function(inDocument) {
    if (inDocument) {
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
    } else {
    // rel=stylesheet
    }
  },
  isDocumentLink: function(inElt) {
    return (inElt.localName === 'link' 
        && inElt.getAttribute('rel') === 'component');
  },
  parseScript: function(inScriptElt) {
    // ignore scripts in primary document, they are already loaded
    if (inScriptElt.ownerDocument === document) {
      return;
    }
    // evaluate now
    var code = inScriptElt.__resource;
    if (code) {
      eval(code);
    }
  },
  parseElement: function(inElementElt) {
    // TODO(sjmiles): ShadowDOM polyfill pollution
    var element = window.wrap ? wrap(inElementElt) : inElementElt;
    new HTMLElementElement(element);
  }
};

var cp = componentParser;

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// bootstrap parsing

var parseTimeEvent = window.WebComponents ? 'WebComponentsLoaded' : 'load';

window.addEventListener(parseTimeEvent, function() {
  // parse document
  componentParser.parse(document);
  // upgrade everything
  document.upgradeElements();
  // notify system
  document.body.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true}));
});

})();