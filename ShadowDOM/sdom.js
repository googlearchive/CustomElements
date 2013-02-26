/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {
  
function Nohd(inNode) {
  this.node = inNode;
};

var base = {};
var archetype = document.createElement('div');
for (var n in archetype) {
  publishProperty(archetype, n, base);
}

var fixconsole = function(n) {
  return n;
};

// IE only
if (!Object.__proto__) {
  fixconsole = function(n) {
    n.toString = fixconsole.arrayToString;
    return n;
  };
};

fixconsole.arrayToString = function() {
  var v = [];
  for (var i=0; i<this.length; i++) {
    v.push(this[i].nodeName);
  }
  return '[' + v.join(', ') + ']';
};

Nohd.prototype = Object.create(base);
mixin(Nohd.prototype, {
  isNohd: true,
  fauxilate: function(inNodes) {
    var nodes = [];
    forEach(inNodes, function(n) {
      nodes.push(SDOM(n));
    });
    // for IE only
    fixconsole(nodes);
    return nodes;
  },
  realize: function(inNode) {
    return (inNode && inNode.node) || inNode;
  },
  getChildNodes: function() {
    return this.fauxilate(this.node.childNodes);
  },
  get childNodes() {
    return this.getChildNodes();
  },
  get children() {
    return this.fauxilate(this.node.children || []);
  },
  get parentNode() {
    return SDOM(this.node.parentNode);
  },
  get previousSibling() {
    return SDOM(this.node.previousSibling);
  },
  get previousElementSibling() {
    return SDOM(this.node.previousElementSibling);
  },
  get nextSibling() {
    return SDOM(this.node.nextSibling);
  },
  get nextElementSibling() {
    return SDOM(this.node.nextElementSibling);
  },
  get firstChild() {
    return SDOM(this.node.firstChild);
  },
  get lastChild() {
    return SDOM(this.node.lastChild);
  },
  get ownerDocument() {
    return this.node.ownerDocument;
  },
  querySelector: function(inSlctr) {
    return SDOM(this.node.querySelector(inSlctr));
  },
  querySelectorAll: function(inSlctr) {
    return this.fauxilate(this.node.querySelectorAll(inSlctr));
  },
  getElementsByClassName: function(inClassName) {
    return this.fauxilate(this.node.getElementsByClassName(inClassName));
  },
  getElementsByTagName: function(inTagName) {
    return this.fauxilate(this.node.getElementsByTagName(inTagName));
  },
  appendChild: function (inChild) {
    return SDOM(this.node.appendChild(this.realize(inChild)));
  },
  insertBefore: function (inChild, inBefore) {
    return SDOM(this.node.insertBefore(this.realize(inChild), 
        this.realize(inBefore)));
  },
  replaceChild: function(inNewchild, inOldChild) {
    return SDOM(this.node.replaceChild(this.realize(inNewchild), 
        this.realize(inOldChild)));
  },
  removeChild: function (inChild) {
    return SDOM(this.node.removeChild(this.realize(inChild)));
  },
  clearChildNodes: function() {
    this.node.textContent = '';
  },
  get textContent() {
    return this.node.textContent;
  },
  set textContent(inText) {
    this.clearChildNodes();
    if (inText) {
      this.appendChild(document.createTextNode(inText));
    }
  },
  cloneNode: function(inDeep) {
    return SDOM(this.node.cloneNode(inDeep));
  }
});

function _SDOM(inNode) {
  if (!inNode) {
    return null;
  }
  if (inNode instanceof Nohd) {
    return inNode;
  }
  if (inNode.$nohd) {
    return inNode.$nohd;
  }
  return inNode.$nohd = new Nohd(inNode);
};

fauxilate = Nohd.prototype.fauxilate;
Nohd.realize = Nohd.prototype.realize;

dqs = document.querySelector.bind(document);
dqsa = document.querySelectorAll.bind(document);
dce = document.createElement.bind(document);
dcdf = document.createDocumentFragment.bind(document);
dctn = document.createTextNode.bind(document);
dgebid = document.getElementById.bind(document);
dgebcn = document.getElementsByClassName.bind(document);
dgebn = document.getElementsByName.bind(document);
dgebtn = document.getElementsByTagName.bind(document);

document.querySelector = function(inSlctr) {
  return SDOM(dqs(inSlctr));
};
document.querySelectorAll = function(inSlctr) {
  return fauxilate(dqsa(inSlctr));
};
document.createElement = function(inTag) {
  return SDOM(dce(inTag));
};
document.createDocumentFragment = function() {
  return SDOM(dcdf());
};
document.createTextNode = function() {
  return SDOM(dctn.apply(document, arguments));
};
document.getElementById = function(inId) {
  return SDOM(dgebid(inId));
};
document.getElementsByClassName = function(inClassName) {
  return fauxilate(dgebcn(inClassName));
};
document.getElementsByName = function(inName) {
  return fauxilate(dgebn(inName));
};
document.getElementsByTagName = function(inTagName) {
  return fauxilate(dgebtn(inTagName));
};

document.addEventListener('DOMContentLoaded', function() {
  db = document.body;
  // These fail on Safari.
  // TypeError: Attempting to change access mechanism
  // for an unconfigurable property.
  //  Object.defineProperty(document, 'body', {
  //    get: function() {
  //      return SDOM(db);
  //    }
  //  });
  //  Object.defineProperty(document, 'documentElement', {
  //    get: function() {
  //      return SDOM(dde);
  //    }
  //  });
});

/*
 
// TODO(sjmiles): this doesn't work, there's no way to override window.document

// wrap document

(function() {
  var base = {};
  var archetype = document;
  for (var n in archetype) {
    console.log(n);
    publishProperty(archetype, n, base);
  }
  var dahcument = Object.create(base);
  mixin(dahcument, {
    querySelector: function(inSlctr) {
      return SDOM(dqs(inSlctr));
    },
    querySelectorAll: function(inSlctr) {
      return fauxilate(dqsa(inSlctr));
    },
    createElement: function(inTag) {
      return SDOM(dce(inTag));
    },
    createDocumentFragment: function() {
      return SDOM(dcdf());
    },
    createTextNode: function() {
      return SDOM(dctn.apply(document, arguments));
    },
    getElementById: function(inId) {
      return SDOM(dgebid(inId));
    },
    getElementsByClassName: function(inClassName) {
      return fauxilate(dgebcn(inClassName));
    },
    getElementsByName: function(inName) {
      return fauxilate(dgebn(inName));
    },
    getElementsByTagName: function(inTagName) {
      return fauxilate(dgebtn(inTagName));
    }
  });
  window.document = dahcument;
})();
*/

// utilities

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// make inSource[inName] available on inTarget as a getter/setter
// pair or a method bound to this.node
function publishProperty(inSource, inName, inTarget) {
  // access property value (unless it is a getter itself)
  var value = inSource[inName];
  if (typeof value === 'function') {
    inTarget[inName] = function () {
      return value.apply(this.node, arguments);
    };
  } else {
    Object.defineProperty(inTarget, inName, {
      get: function () {
        return this.node[inName];
      },
      set: function (inValue) {
        this.node[inName] = inValue;
      }
    });
  }
};

function mixin(inTarget, inSource) {
  var props = buildPropertyList(inSource);
  Object.defineProperties(inTarget, props);
};

function buildPropertyList(obj) {
  var props = {};
  for (var n in obj) {
    props[n] = Object.getOwnPropertyDescriptor(obj, n);
  }
  return props;
};

// exports

window.SDOM = _SDOM;
window.Nohd = Nohd;
//window.mixin = mixin;
window.forEach = forEach;
window.fixconsole = fixconsole;
window.publishProperty = publishProperty;
window.$ = document.querySelector.bind(document);

})();