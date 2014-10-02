/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * Implements custom element observation and attached/detached callbacks
 * @module observe
*/
(function(scope){

// imports
var flags = scope.flags;
var useNative = scope.useNative;
var forSubtree = scope.forSubtree;
var forDocumentTree = scope.forDocumentTree;

if (useNative) {
  return;
}

// manage lifecycle on added node
function added(node) {
  if (scope.upgrade(node)) {
    return true;
  }
  inserted(node);
}

// manage lifecycle on added node's subtree only
function addedSubtree(node) {
  forSubtree(node, function(e) {
    if (added(e)) {
      return true;
    }
  });
}

// manage lifecycle on added node and it's subtree
function addedNode(node) {
  return added(node) || addedSubtree(node);
}

function upgradeSubtree(node) {
  node = wrap(node);
  return addedSubtree(node);
}

function insertedNode(node) {
  inserted(node);
  if (inDocument(node)) {
    forSubtree(node, function(e) {
      inserted(e);
    });
  }
}

// TODO(sorvell): on platforms without MutationObserver, mutations may not be
// reliable and therefore attached/detached are not reliable.
// To make these callbacks less likely to fail, we defer all inserts and removes
// to give a chance for elements to be inserted into dom.
// This ensures attachedCallback fires for elements that are created and
// immediately added to dom.
var hasPolyfillMutations = (!window.MutationObserver ||
    (window.MutationObserver === window.JsMutationObserver));
scope.hasPolyfillMutations = hasPolyfillMutations;

var isPendingMutations = false;
var pendingMutations = [];
function deferMutation(fn) {
  pendingMutations.push(fn);
  if (!isPendingMutations) {
    isPendingMutations = true;
    var async = (window.Platform && window.Platform.endOfMicrotask) ||
        setTimeout;
    async(takeMutations);
  }
}

function takeMutations() {
  isPendingMutations = false;
  var $p = pendingMutations;
  for (var i=0, l=$p.length, p; (i<l) && (p=$p[i]); i++) {
    p();
  }
  pendingMutations = [];
}

function inserted(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _inserted(element);
    });
  } else {
    _inserted(element);
  }
}

// TODO(sjmiles): if there are descents into trees that can never have inDocument(*) true, fix this
function _inserted(element) {
  if ((element.attachedCallback || element.detachedCallback) &&
      element.__upgraded__ && !element.__inserted && inDocument(element)) {
    element.__inserted = true;
    if (element.attachedCallback) {
      element.attachedCallback();
    }
  }
}

function removedNode(node) {
  removed(node);
  forSubtree(node, function(e) {
    removed(e);
  });
}

function removed(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _removed(element);
    });
  } else {
    _removed(element);
  }
}

function _removed(element) {
  if ((element.attachedCallback || element.detachedCallback) && 
    element.__upgraded__ && element.__inserted && !inDocument(element)) {
    element.__inserted = false;
    if (element.detachedCallback) {
      element.detachedCallback();
    }
  }
}

function inDocument(element) {
  var p = element;
  var doc = wrap(document);
  while (p) {
    if (p == doc) {
      return true;
    }
    p = p.parentNode || p.host;
  }
}

function watchShadow(node) {
  if (node.shadowRoot && !node.shadowRoot.__watched) {
    flags.dom && console.log('watching shadow-root for: ', node.localName);
    // watch all unwatched roots...
    var root = node.shadowRoot;
    while (root) {
      watchRoot(root);
      root = root.olderShadowRoot;
    }
  }
}

function watchRoot(root) {
  observe(root);
}

function handler(mutations) {
  // for logging only
  if (flags.dom) {
    var mx = mutations[0];
    if (mx && mx.type === 'childList' && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || (d.host && d.host.localName)) || '';
          u = u.split('/?').shift().split('/').pop();
        }
    }
    console.group('mutations (%d) [%s]', mutations.length, u || '');
  }
  // handle mutations
  mutations.forEach(function(mx) {
    if (mx.type === 'childList') {
      forEach(mx.addedNodes, function(n) {
        if (!n.localName) {
          return;
        }
        addedNode(n);
      });
      forEach(mx.removedNodes, function(n) {
        if (!n.localName) {
          return;
        }
        removedNode(n);
      });
    }
  });
  flags.dom && console.groupEnd();
};

function takeRecords(node) {
  node = wrap(node);
  // If the optional node is not supplied, assume we mean the whole document.
  if (!node) {
    node = wrap(document);
  }
  // Find the root of the tree, which will be an Document or ShadowRoot.
  while (node.parentNode) {
    node = node.parentNode;
  }
  var observer = node.__observer;
  if (observer) {
    handler(observer.takeRecords());
    takeMutations();
  }
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

function observe(inRoot) {
  if (inRoot.__observer) {
    return;
  }
  // For each ShadowRoot, we create a new MutationObserver, so the root can be
  // garbage collected once all references to the `inRoot` node are gone.
  var observer = new MutationObserver(handler);
  observer.observe(inRoot, {childList: true, subtree: true});
  inRoot.__observer = observer;
}

function upgradeDocument(doc) {
  doc = wrap(doc);
  flags.dom && console.group('upgradeDocument: ', (doc.baseURI).split('/').pop());
  addedNode(doc);
  observe(doc);
  flags.dom && console.groupEnd();
}

/*
This method is intended to be called when the document tree (including imports)
has pending custom elements to upgrade. It can be called multiple times and 
should do nothing if no elements are in need of upgrade.

Note that the import tree can consume itself and therefore special care
must be taken to avoid recursion.
*/
function upgradeDocumentTree(doc) {
  forDocumentTree(doc, upgradeDocument);
}


// ensure that all ShadowRoots watch for CustomElements.
var originalCreateShadowRoot = Element.prototype.createShadowRoot;
Element.prototype.createShadowRoot = function() {
  var root = originalCreateShadowRoot.call(this);
  CustomElements.watchShadow(this);
  return root;
};

// exports
scope.watchShadow = watchShadow;
scope.upgradeDocumentTree = upgradeDocumentTree;
scope.upgradeSubtree = upgradeSubtree;
scope.upgradeAll = addedNode;
scope.insertedNode = insertedNode;
scope.takeRecords = takeRecords;

})(window.CustomElements);
