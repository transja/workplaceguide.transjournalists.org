/*
Process text files as ArchieML
Anything that has a .txt extension in /data will be loaded
*/

var path = require("path");
var betty = require("@nprapps/betty");

module.exports = function (grunt) {
  grunt.registerTask(
    "archieml",
    "Loads ArchieML files from data/*.txt",
    function () {
      grunt.task.requires("state");
      grunt.data.md = {};

      var files = grunt.file.expand("data/*.txt");

      files.forEach(function (f) {
        var name = path.basename(f).replace(/(\.docs)?\.txt$/, "");
        var raw = grunt.file.read(f);
        var sections = JSON.parse(grunt.file.read(f.replace(".txt", ".json")));

        grunt.data.md[name] = {
          raw,
          sections,
        };
      });
    }
  );
};
