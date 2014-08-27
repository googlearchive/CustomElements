/*
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

module.exports = function(karma) {
  var common = require('../../tools/test/karma-common.conf.js');

  karma.set(common.mixin_common_opts(karma, {
    // base path, that will be used to resolve files and exclude
    basePath: '../../',

    // list of files / patterns to load in the browser
    files: [
      'tools/test/mocha-htmltest.js',
      'CustomElements/conf/mocha.conf.js',
      'CustomElements/../tools/test/chai/chai.js',
      'CustomElements/custom-elements.js',
      'CustomElements/test/js/*.js',
      {pattern: 'CustomElements/src/*', included: false},
      {pattern: 'CustomElements/test/html/*.html', included: false},
      {pattern: 'MutationObservers/*.js', included: false},
      {pattern: 'WeakMap/*.js', included: false},
      {pattern: 'tools/**/*.js', included: false}
    ]
  }));
};
