/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
module.exports = function(grunt) {
  ShadowDOM = [
		'ShadowDOM/sdom.js',
		'ShadowDOM/ShadowDOMNohd.js',
		'ShadowDOM/querySelector.js',
		'ShadowDOM/ShadowDOM.js'
	];
	CustomElements = [
		'CustomElements/CustomElements.js',
		'CustomElements/HTMLElementElement.js',
		'CustomElements/ComponentDocument.js'
	];
	WebComponents = CustomElements.concat(ShadowDOM);

  grunt.initConfig({
    concat: {
      ShadowDOM: {
        src: ShadowDOM,
        dest: 'min/ShadowDOM.js'
      },
      CustomElements: {
        src: CustomElements,
        dest: 'min/CustomElements.js'
      }
    },
		uglify: {
      CustomElements: {
			  options: {
					sourceMap: 'CustomElements/custom-elements-source-map.js'
				},
				files: {
					'CustomElements/custom-elements.min.js': CustomElements
				}
      },
      ShadowDOM: {
			  options: {
					sourceMap: 'ShadowDOM/shadowdom-source-map.js'
				},
				files: {
					'ShadowDOM/shadowdom.min.js': ShadowDOM
				}
      },
      WebComponents: {
			  options: {
					sourceMap: 'webcomponents-source-map.js'
				},
				files: {
					'webcomponents.min.js': WebComponents
				}
			}
		}
  });

  // plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // tasks
  grunt.registerTask('default', ['uglify']);
};

