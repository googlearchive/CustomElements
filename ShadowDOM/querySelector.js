/*
Copyright 2012 The Toolkitchen Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

// custom selectors:
//
// ~        = any node with lightDOM
// #<id>    = node with id = <id>
// *        = any non-Text node
// .<class> = any node with <class> in it's classList
// [<attr>] = any node with attribute <attr>
//
var generateMatcher = function(inSlctr) {
  if (!inSlctr) {
    return;
  }
  var c = inSlctr[0];
  if (inSlctr === "~") {
    return function(inNode) { 
      return Boolean(inNode.lightDOM);
    };
  }
  if (c === '#') {
    m = inSlctr.slice(1);
    return function(inNode) {
      return inNode.id === m;
    };
  }
  if (inSlctr === '*') {
    return function(inNode) {
      return inNode.nodeName !== '#text';
    };
  }
  if (c === '.') {
    m = inSlctr.slice(1);
    return function(inNode) {
      return inNode.classList && inNode.classList.contains(m);
    };
  }
  if (c === '[') {
    m = inSlctr.slice(1, -1);
    return function(inNode) {
      return inNode.hasAttribute && inNode.hasAttribute(m);
    };
  }
  var slctrs = inSlctr.split(',');
  return function(inNode) {
    return (slctrs.indexOf(inNode.localName) >= 0);
    //return (inNode.localName === inSlctr);
  };
};

// utility

var isInsertionPoint = function(inNode) {
  return {SHADOW:1, CONTENT:1}[inNode.tagName];
};

var search = function(inNodes, inMatcher) {
  var results = [];
  for (var i=0, n; (n=inNodes[i]); i++) {
    if (inMatcher(n)) {
      results.push(n);
    }
    if (!isInsertionPoint(n)) {
      results = results.concat(_search(n, inMatcher));
    }
  }
  return results;
};

var _search = function(inNode, inMatcher) {
  return search(inNode.childNodes, inMatcher);
};

var localQueryAll = function(inNode, inSlctr) {
  var results = search(inNode.childNodes, generateMatcher(inSlctr));
  fixconsole(results);
  return results;
};

var localQuery = function(inNode, inSlctr) {
  return localQueryAll(inNode, inSlctr)[0];
};