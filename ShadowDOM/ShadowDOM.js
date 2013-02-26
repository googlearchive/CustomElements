/*
Copyright 2013 The Toolkitchen Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

(function() {

// stent IE console
if (!console.group) {
  console.group = console.log;
  console.groupEnd = console.log;
}

var ShadowRoot = function(inHost) {
  // ShadowDOM implies LightDOM
  if (!inHost.lightDOM) {
    // install lightDOM
    new LightDOM(inHost);
    // attach distribution method
    inHost.distribute = distribute;
  }
  // make a new root
  var root = document.createElement('shadow-root');
  // chain shadows
  root.olderSubtree = inHost.shadow;
  // mutual references
  root.host = inHost;
  inHost.webkitShadowRoot = root;
  // return the reference
  return root;
};

var LightDOM = function(inNode) {
  // make node for lightDOM
  var lightDOM = document.createElement('light-root');
  // back-reference host
  lightDOM.host = inNode;
  // move our children into the node
  moveChildren(inNode, lightDOM);
  // install lightDOM
  inNode.lightDOM = lightDOM;
  // return the node
  return lightDOM;
};

// utilities

var isInsertionPoint = function(inNode) {
  return {SHADOW:1, CONTENT:1}[inNode.tagName];
};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

var moveChildren = function(inElement, inUpgrade) {
  var n$ = inElement.childNodes;
  inElement.clearChildNodes();
  forEach(n$, function(n) {
    // flag insertion points in inElement's immediate lightDOM to support 
    // distribution dependency resolution
    // see: distributeInsertions
    if (isInsertionPoint(n)) {
      n.lightDOMHost = inElement;
    }
    inUpgrade.appendChild(n);
  });
};

// distribution

var poolify = function(inNodes) {
  // construct a pool
  var pool = [];
  // our base set
  var base = inNodes;
  // for each node in our base set
  for (var i=0, n; (n=base[i]); i++) {
    // the contents of insertion points go into pool, not the points themselves
    if (isInsertionPoint(n)) {
      // recursively add contents of insertion point to pool
      pool = pool.concat(poolify(n.getDistributedNodes()));
    } else {
      // add this node directly to pool
      pool.push(n);
    }
  }
  // for IE console
  fixconsole(pool);
  return pool;
};

var distribute = function() {
  // primary shadow root
  var root = this.webkitShadowRoot;
  // content pool from lightDOM
  var pool = poolify(this.childNodes);
  // distribute any lightDOM to our shadowDOM(s)
  distributePool(pool, root);
  // virtualize insertion points
  flattenInsertionHosts(root);
  // project composed tree into the real DOM
  this.project(root.composedNodes);
};

var distributePool = function(inPool, inRoot) {
  // locate content nodes
  var insertions = localQueryAll(inRoot, 'content');
  // distribute pool to <content> nodes
  insertions.forEach(function(insertion) {
    distributeInsertions(inPool, insertion);
  });
  // distribute older shadow to <shadow>
  var shadow = localQuery(inRoot, 'shadow');
  if (shadow) {
    var olderRoot = inRoot.olderSubtree; 
    if (olderRoot) {
      // distribute pool into older <shadow>
      distributePool(inPool, olderRoot);
      // project subtree onto shadow
      shadow.setDistributedNodes(olderRoot.childNodes);
    }
  }
};

// extract a set of nodes from inPool matching inSlctr
var extract = function(inPool, inSlctr) {
  // generate a matcher function 
  var matcher = generateMatcher(inSlctr);
  // catch-all
  if (!matcher) {
    // remove all nodes form pool, and return the removed set
    return inPool.splice(0);
  } else {
    // move matching nodes from pool into result
    var result = [];
    for (var i=0, n; (n=inPool[i]); i++) {
      if (matcher(n)) {
        result.push(n);
        inPool.splice(i--, 1);
      }
    }
    // return the matched set
    return result;
  }
};

var distributeInsertions = function(inPool, inInsertionPoint) {
  var insertable = extract(inPool, inInsertionPoint.getAttribute('select'));
  // TODO(sjmiles): remember where/why we depend on this
  // create back-pointers from inserted nodes to the insertion point
  for (var i=0, n; (n=insertable[i]); i++) {
    if (n.host && n.host.tagName !== 'CONTENT') {
      console.warn('node already has host', n.host, inInsertionPoint, n);
    }
    n.host = inInsertionPoint;
  }
  // project nodes into insertion point
  inInsertionPoint.setDistributedNodes(insertable);
  // if the insertion point (inHost) is an IMMEDIATE child of
  // a lightDOM host, the lightDOM host needs redistribution
  // only immediate children are selectable (as content) so only immediate
  // children can affect the actual distribution of any lightDOM host
  if (inInsertionPoint.lightDOMHost) {
    inInsertionPoint.lightDOMHost.invalidate();
  }
};

var flattenInsertionHosts = function(inNode) {
  // first we determine the effective root for the composed tree:
  // 
  // if inNode is a regular node, the regular node is the root
  // if inNode is a shadow-host, it's the primary shadow-root
  //
  var root = inNode.webkitShadowRoot || inNode;
  //
  // next we locate the composed tree nodes
  // root's distributed nodes are not part of the canonical composed tree,
  // so we select them manually
  var nodes = root.distributedNodes || root.childNodes;
  if (nodes.length) {
    // if there is an insertion point in our nodes, then we are
    // an insertion host
    var isInsertionHost = false;
    // iterate over nodes
    for (var i=0, n; (n=nodes[i]); i++) {
      // flatten this subtree first
      flattenInsertionHosts(n);
      // if n is an 'insertion point', inNode is an 'insertion host'
      isInsertionHost = isInsertionHost || isInsertionPoint(n);
    }
    // if we are an insertion host...
    if (isInsertionHost) {
      // put our composed tree into 'insertions' and our flattened tree into 
      // 'childNodes'
      flattenInsertionHost(root);
    }
  }
};

var flattenInsertionHost = function(inNode) {
  // create insertion list if needed
  requireInsertionList(inNode);
  // notes
  // 
  // host will never have lightDOM (see root-finding above)
  // host can never be <content> or <shadow> as these do not exist
  //   in composed tree
  // insertion-lists do not express composed tree, and can be ignored
  // 
  // clear the composed tree (working nodes are captured in insertions)
  inNode.clearComposedNodes();
  // use insertion list to compile composed DOM
  for (var i=0, n; (n=inNode.insertions[i]); i++) {
    // if n is not flattenable
    if (!isInsertionPoint(n)) {
      // add n itself to the flattened-composed DOM
      inNode.appendComposedChild(n);
    } else {
      // add the pre-flattened nodes to the flattened composed DOM
      var nodes = n.nodes || n.getDistributedNodes();
      // add each node to the flattened-composed DOM
      for (var j=0, c; (c=nodes[j]); j++) {
        inNode.appendComposedChild(c);
      }
    }
  }
};

// ensure inNode has a populated insertion list
var requireInsertionList = function(inNode) {
  if (!inNode.insertions) {
    // distributedNodes must be managed specially
    var nodes = isInsertionPoint(inNode) ? inNode.getDistributedNodes() 
      : inNode.childNodes;
    inNode.insertions = nodes.slice(0);
  }
};

// exports

window.ShadowRoot = ShadowRoot;
window.ShadowDOM = {
  isInsertionPoint: isInsertionPoint
};

})();