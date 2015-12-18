module.exports = function(grunt) {
  grunt.initConfig({
     concat: {                                                        
       options: {                                                     
         separator: '',                     
       },                                                                                                                       
    }                                                                 
  });                                                                 
                                                                      
  grunt.loadNpmTasks('grunt-contrib-concat');                      
  grunt.registerTask('default', ['concat']);  

};