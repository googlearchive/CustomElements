/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
(function() {
  
var thisFile = 'CustomElements.js';

var modules = [
  '../MutationObservers/mutation-observers.js',
  'src/base.js',
  'src/traverse.js',
  'src/observe.js',
  'src/upgrade.js',
  'src/register.js',
  'src/boot.js'
];

var src = document.querySelector('script[src*="' + thisFile +
    '"]').attributes.src.value;
var basePath = src.slice(0, src.indexOf(thisFile));

function loadFiles(files) {
  files.forEach(function(f) {
    document.write('<script src="' + basePath + f + '"></script>');
  });
}

// for simplicity, we directly check here if native imports is supported.
loadFiles(modules);

})();

