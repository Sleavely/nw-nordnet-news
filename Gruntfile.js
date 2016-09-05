module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nwjs: {
      options: {
        version: '0.12.3',
        platforms: ['win'],
        buildDir: './builds',
        winIco: './src/img/logo4.ico'
      },
      src: ['./package.json', './node_modules/**', './src/**'] // Your NW.js app
    },
  });
  grunt.loadNpmTasks('grunt-nw-builder');

  grunt.registerTask('default', ['nwjs']);

};
