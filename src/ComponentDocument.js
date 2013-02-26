/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// highlander object represents a primary document (the argument to 'parse')
// at the root of a tree of documents

var componentDocument = {
  preloadSelectors: [
    'link[rel=components]',
    'script[src]',
    'link[rel=stylesheet]'
  ],
  parseSelectors: [
    'link[rel=components]',
    'script[src]',
    'element',
    'link[rel=stylesheet]'
  ],
  parseMap: {
    link: 'parseLink',
    script: 'parseScript',
    element: 'parseElement'
  },
  // document parsing is asynchronous
  parse: function(inDocument, inNext) {
    // resource bucket
    cd.resources = {};
    // first we preload all resources in the complete document tree
    cd.preload(inDocument, function() {
      // then we parse document content
      cd.continueParse(inDocument, inNext);
    });
  },
  preload: function(inDocument, inNext) {
    // all preloadable nodes in inDocument
    var nodes = inDocument.querySelectorAll(cd.preloadSelectors);
    // preload all nodes, call inNext when complete, call cd.eachPreload
    // for each preloaded node
    loader.loadAll(nodes, inNext, cd.eachPreload);
  },
  eachPreload: function(data, next, url, elt) {
    // for document links
    if (elt.localName === 'link' && elt.getAttribute('rel') === 'components') {
      // generate an HTMLDocument from data
      var document = makeDocument(data, url);
      // store document resource
      cd.resources[url] = makeDocument(data, url);
      // re-enters preloader here
      cd.preload(document, next);
    } else {
      // store othe resource
      cd.resources[url] = data;
      // no preprocessing on other nodes
      next();
    }
  },
  continueParse: function(inDocument, inNext) {
    // complete document tree is loaded at this point
    // parse document content
    cd.parseElts(inDocument);
    // parsing complete
    inNext();
  },
  parseElts: function(inDocument) {
    if (inDocument) {
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(cd.parseSelectors);
      // map of localNames to parser methods
      var map = cd.parseMap;
      // for each parsable node type in inDocument, call the mapped parsing method
      forEach(elts, function(e) {
        //console.log(map[e.localName] + ":", path.nodeUrl(e));
        cd[map[e.localName]](e);
      });
    }
  },
  parseLink: function(inLinkElt) {
    // rel=components
    if (inLinkElt.getAttribute('rel') === 'components') {
      cd.parseElts(cd.fetch(inLinkElt));
    } else {
    // rel=stylesheet
    }
  },
  parseScript: function(inScriptElt) {
    // ignore scripts in primary document, they are already loaded
    if (inScriptElt.ownerDocument === document) {
      return;
    }
    // evaluate now
    console.log(cd.fetch(inScriptElt) || '(no code)');
  },
  parseElement: function(inElementElt) {
    var element = window.SDOM ? SDOM(inElementElt) : inElementElt
    new HTMLElementElement(element);
  },
  fetch: function(inNode) {
    return cd.resources[path.nodeUrl(inNode)];
  }
};

var cd = componentDocument;

cd.preloadSelectors = cd.preloadSelectors.join(',');
cd.parseSelectors = cd.parseSelectors.join(',');

var makeDocument = function(inHTML, inUrl) {
  var doc = document.implementation.createHTMLDocument('component');
  doc.body.innerHTML = inHTML;
  doc._URL = inUrl;
  return doc;
};

loader = {
  load: function(inNode, inCallback) {
    xhr.load(path.nodeUrl(inNode), function(err, data, url) {
      inCallback(err, data, url);
    });
  },
  loadAll: function(inNodes, inNext, inEach) {
    if (!inNodes.length) {
      inNext();
    }
    var inflight = 0;
    function head(inElt) {
      inflight++;
      loader.load(inElt, function(err, data, url) {
        if (err) {
          tail();
        } else {
          each(data, tail, url, inElt);
        }
      });
    };
    function tail() {
      if (!--inflight) {
        inNext();
      };
    };
    var each = inEach || tail;
    forEach(inNodes, head);
  }
};

var path = {
  nodeUrl: function(inNode) {
    var nodeUrl = inNode.getAttribute("href") || inNode.getAttribute("src");
    return path.resolveNodeUrl(inNode, nodeUrl);
  },
  resolveNodeUrl: function(inNode, inRelativeUrl) {
    var baseUrl = this.documentUrlFromNode(inNode);
    return this.resolveUrl(baseUrl, inRelativeUrl);
  },
  documentUrlFromNode: function(inNode) {
    var d = inNode.ownerDocument;
    var url = (d && (d._URL || d.URL)) || "";
    // take only the left side if there is a #
    url = url.split("#")[0];
    return url;
  },
  resolveUrl: function(inBaseUrl, inUrl) {
    if (this.isAbsUrl(inUrl)) {
      return inUrl;
    }
    var base = this.urlToPath(inBaseUrl);
    return this.compressUrl(base + inUrl);
  },
  isAbsUrl: function(inUrl) {
    return /(^data:)|(^http[s]?:)|(^\/)/.test(inUrl);
  },
  urlToPath: function(inBaseUrl) {
    var parts = inBaseUrl.split("/");
    parts.pop();
    parts.push('');
    return parts.join("/");
  },
  compressUrl: function(inUrl) {
    var parts = inUrl.split("/");
    for (var i=0, p; i<parts.length; i++) {
      p = parts[i];
      if (p === "..") {
        parts.splice(i-1, 2);
        i -= 2;
      }
    }
    return parts.join("/");
  }
};

var xhr = {
  async: true,
  ok: function(inRequest) {
    return (inRequest.status >= 200 && inRequest.status < 300)
        || (inRequest.status === 304);
  },
  load: function(url, next, nextContext) {
    var request = new XMLHttpRequest();
    request.open('GET', url, xhr.async);
    request.addEventListener('readystatechange', function(e) {
      if (request.readyState === 4) {
        next.call(nextContext, !xhr.ok(request) && request,
          request.response, url);
      }
    });
    request.send();
  }
};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
