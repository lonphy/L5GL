module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: { separator: "\n\n"},
			dist: {
				src: [
					'src/L5.js',
                    'src/Math/*.js',
                    'src/core/D3Object.js',
                    'src/core/*.js',
                    'src/shader/shader.js',
					'src/controller/ControlledObject.js',
					'src/sceneTree/Spatial.js',
					'src/sceneTree/Node.js',
					'src/renderer/Renderer.js',
					'src/renderer/webgl/GLShader.js',
					'src/application/Application.js',
					'src/**/*.js'
                ],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/**\n' +
						'*lib:<%= pkg.name %>\n' +
						'*version:<%= pkg.version %>\n' +
						'*description:<%= pkg.description %>\n' +
						'*author:<%= pkg.author.name %> - <%= pkg.author.url %>\n' +
						'*/\n'
			},
			dist: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		watch: {
			files: ['<%= concat.dist.src %>'],
			tasks: ['concat', 'uglify' ]
		},
		jshint: {
			options: {esnext:true},
			files: ['gruntfile.js', 'src/*.js', 'src/**/*.js']
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['jshint', 'concat']);
};