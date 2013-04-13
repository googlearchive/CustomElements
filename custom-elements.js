/* 
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {
  
var thisFile = 'custom-elements.js';
var scope = 'CustomElements';

window[scope] = {
  entryPointName: thisFile,
  modules: [
    'src/sidetable.js',
    'MutationObservers/MutationObserver.js',
    'src/CustomElements.js',
    'src/HTMLElementElement.js',
    'src/Parser.js'
  ]
};

var script = document.querySelector('script[src*="' + thisFile + '"]');
var src = script.attributes.src.value;
var basePath = src.slice(0, src.indexOf(thisFile));

document.write('<script src="' + basePath + '/tools/loader/loader.js" scope="' 
  + scope + '"></script>');
  
})();