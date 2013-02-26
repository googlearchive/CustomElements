/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
module.exports = function(grunt) {
	CustomElements = [
		'src/CustomElements.js',
		'src/HTMLElementElement.js',
		'src/ComponentDocument.js'
	];
  grunt.initConfig({
		uglify: {
      CustomElements: {
			  options: {
					sourceMap: 'custom-elements.min.source-map.js'
				},
				files: {
					'custom-elements.min.js': CustomElements
				}
      }
		}
  });

  // plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // tasks
  grunt.registerTask('default', ['uglify']);
};

