(function() {
  
ShadowDOMNohd = function(inNode) {
  Nohd.call(this, inNode);
};
ShadowDOMNohd.prototype = Object.create(Nohd.prototype);

// ShadowDOMNohd API

mixin(ShadowDOMNohd.prototype, {
  webkitCreateShadowRoot: function() {
    return new ShadowRoot(this);
  },
  // use ShadowDOM-aware query engine
  querySelector: function(inSlctr) {
    return localQuery(this, inSlctr);
  },
  querySelectorAll: function(inSlctr) {
    return localQueryAll(this, inSlctr);
  },
  // return the node array for the 'local tree'
  // JS cannot make NodeLists, so we always return
  // simple arrays (of Nohds)
  getChildNodes: function() {
    // if we own lightDOM, 'childNodes' always come from lightDOM
    if (this.lightDOM) {
      return this.lightDOM.childNodes;
    }
    // an insertion lists always represents 'childNodes' when present
    if (this.insertions) {
      return this.insertions;
    }
    // special roots specifically use alternate node array
    if (isLightRoot(this) || isShadowRoot(this)) {
      return this.nodes || [];
    }
    // otherwise, produce a Nohd array from the DOM childNodes
    return Nohd.prototype.getChildNodes.call(this);
  },
  // schedule this node for distribution
  invalidate: function() {
    //console.log("invalidating a distribution");
    addPendingDistribution(this);
    enjob(ShadowDOMNohd, 'validate', validateDistributions, 0);
  },
  appendChild: function(inChild) {
    if (isLightRoot(this)) {
      return appendChild(this, inChild);
    }
    if (isShadowRoot(this)) {
      this.host.invalidate();
      return appendChild(this, inChild);
    }
    // if has-a lightDOM
    if (this.lightDOM) {
      this.invalidate();
      inChild.lightDOMHost = this;
      return this.lightDOM.appendChild(inChild);
    }
    if (this.insertions) {
      this.insertions.push(inChild);
      return inChild;
    }
    return Nohd.prototype.appendChild.call(this, inChild);
  },
  appendComposedChild: function(inChild) {
    if (isShadowRoot(this) || isInsertionPoint(this)) {
      return appendChild(this, inChild);
    }
    return Nohd.prototype.appendChild.call(this, inChild);
  },
  getDistributedNodes: function() {
    return this.distributedNodes || [];
  },
  setDistributedNodes: function(inDistributedNodes) {
    this.distributedNodes = inDistributedNodes;
    // When flattening we sometimes create an insertion list (if we
    // are an insertion host).
    // When the distributed nodes are reassigned, the insertion 
    // list is no longer valid.
    if (this.insertions) {
      this.insertions = null;
    }
  },
  get webkitShadowRoot() {
    return this.shadow;
  },
  set webkitShadowRoot(inRoot) {
    this.shadow = inRoot;
  },
  get content() {
    if (!this.node.content && !this._content) {
      var frag = document.createDocumentFragment();
      forEach(this.childNodes, function(n) {
        frag.appendChild(n);
      });
      this._content = frag;
    }
    return SDOM(this.node.content) || this._content;
  },
  get composedNodes() {
    return this.nodes || this.fauxilate(this.node.childNodes);
  },
  clearComposedNodes: function() {
    if (this.nodes) {
      this.nodes = [];
    } else {
      this.node.textContent = '';
    }
  },
  clearChildNodes: function() {
    if (this.insertions) {
      this.insertions = null;
    }
    if (this.nodes) {
      this.nodes = [];
    }
    if (this.lightDOM) {
      this.lightDOM.clearChildNodes();
    }
    this.node.textContent = '';
  },
  project: function(inNodes) {
    this.clearChildNodes();
    forEach(inNodes, function(n) {
      this.node.appendChild(this.realize(n));
    }, this);
  }
});

// taxonomy

var isLightRoot = function(inNode) {
  return (inNode.localName == 'light-root');
};

var isShadowRoot = function(inNode) {
  return (inNode.localName == 'shadow-root');
};

// simulate DOM append on node-array inNodes

var appendChild = function(inParent, inChild) {
  var nodes = inParent.nodes = (inParent.nodes || []);
  if (inChild.nodeName === '#document-fragment') {
    forEach(inChild.childNodes, function(n) {
      nodes.push(n);
    }, this);
  } else {
    nodes.push(inChild);
  }
  return inChild;
};

// distribution cascade handling

var pendingDistributions = [];

var addPendingDistribution = function(inNode) {
  var i = pendingDistributions.indexOf(inNode);
  if (i >= 0) {
    pendingDistributions.splice(i, 1);
  }
  pendingDistributions.push(inNode);
};

var validateDistributions = function() {
  //console.group('validating distribution');
  while (pendingDistributions.length) {
    //console.log('executing cascaded distribution [' + 
    //  pendingDistributions[0].localName + ']');
    pendingDistributions.shift().distribute();       
  };
  //console.groupEnd();
};

// register named job on inObject
// will call inJob after inTimeout ms unless the job
// name is re-registered, resetting the timer
// iow, a job can be registered N times inside of inTimeout ms
// but it will only be performed once
var enjob = function(inObject, inName, inJob, inTimeout) {
  if (!inObject._jobs) {
    inObject._jobs = {};
  }
  var timeout = inTimeout || 100;
  if (inObject._jobs[inName]) {
    clearTimeout(inObject._jobs[inName]);
  }
  inObject._jobs[inName] = 
      setTimeout(function(){inJob.call(inObject);}, timeout);
};

//var $SDOM = SDOM;
SDOM = function(inNode) {
  if (!inNode) {
    return null;
  }
  if (inNode.isNohd) {
    return inNode;
  }
  if (inNode.$nohd) {
    return inNode.$nohd;
  }
  var ctor = ShadowDOMNohd;
  return inNode.$nohd = new ctor(inNode);
};

var sdocument = {
  get body() {
    return SDOM(document.body);
  }
};
mixin(sdocument, document);

// exports

window.ShadowDOMNohd = ShadowDOMNohd;
window.SDOM = SDOM;
window.sdocument = sdocument;

})();