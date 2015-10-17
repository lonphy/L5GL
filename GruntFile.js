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
					'src/graphics/dataTypes/Color.js',
					'src/graphics/resources/*.js',
					'src/graphics/shaders/shader.js',
					'src/graphics/shaders/*.js',
					'src/graphics/controllers/ControlledObject.js',
					'src/graphics/controllers/Controller.js',
					'src/graphics/controllers/TransformController.js',
					'src/graphics/sceneTree/Spatial.js',
					'src/graphics/sceneTree/Node.js',
					'src/graphics/sceneTree/Visual.js',
					'src/graphics/sceneTree/Triangles.js',
					'src/graphics/sceneTree/TriMesh.js',
					'src/graphics/renderer/Renderer.js',
					'src/graphics/renderer/webgl/GLShader.js',
					'src/application/Application.js',
					'src/graphics/shaderFloat/ShaderFloat.js',
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
		},
		copy: {
			dist: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'test/res/l5.js'
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default', ['jshint', 'concat', 'copy']);
};