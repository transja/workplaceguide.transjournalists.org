/*

Build HTML files using any data loaded onto the shared state. See also loadCSV
and loadSheets, which import data in a compatible way.

*/

// we use a custom template engine for better errors
var template = require("./lib/template");

var path = require("path");
var typogr = require("typogr");
var MarkdownIt = require("markdown-it");
var md = new MarkdownIt();
var markdownItAttrs = require("markdown-it-attrs");
var markdownItTocs = require("markdown-it-table-of-contents");
var markdownItAnchor = require("markdown-it-anchor");
var { DateTime } = require("luxon");

md.use(markdownItTocs, {
  format: (content) => content,
  includeLevel: [1, 2, 3],
});
md.use(markdownItAttrs);
md.use(markdownItAnchor, {
  permalink: markdownItAnchor.permalink.headerLink(),
});

module.exports = function (grunt) {
  var process = function (source, data, filename) {
    var fn = template(source, {
      imports: { grunt: grunt, require: require },
      sourceURL: filename,
    });
    var input = Object.create(data || grunt.data);
    input.t = grunt.template;
    return fn(input);
  };

  //expose this for other tasks to use
  grunt.template.process = process;

  grunt.template.formatNumber = function (s) {
    s = s + "";
    var start = s.indexOf(".");
    if (start == -1) start = s.length;
    for (var i = start - 3; i > 0; i -= 3) {
      s = s.slice(0, i) + "," + s.slice(i);
    }
    return s;
  };

  grunt.template.formatMoney = function (s) {
    s = grunt.template.formatNumber(s);
    return s.replace(/^(-)?/, function (_, captured) {
      return (captured || "") + "$";
    });
  };

  grunt.template.smarty = function (text) {
    var filters = ["amp", "widont", "smartypants", "ord"];
    filters = filters.map((k) => typogr[k]);
    var filtered = filters.reduce((t, f) => f(t), text);
    return filtered;
  };

  grunt.template.include = function (where, data) {
    grunt.verbose.writeln(" - Including file: " + where);
    var file = grunt.file.read(path.resolve("src/", where));
    var templateData = Object.create(data || grunt.data);
    templateData.t = grunt.template;
    return process(file, templateData, where);
  };

  grunt.template.renderMarkdown = function (input) {
    var rendered = md.render(input);

    // var walker = parsed.walker();
    // //merge text nodes together
    // var e;
    // var previous;
    // while ((e = walker.next())) {
    //   var node = e.node;
    //   //is this an adjacent text node?
    //   if (
    //     node &&
    //     previous &&
    //     previous.parent == node.parent &&
    //     previous.type == "Text" &&
    //     node.type == "Text"
    //   ) {
    //     previous.literal += node.literal;
    //     // grunt.log.oklns(previous.literal);
    //     node.unlink();
    //   } else {
    //     previous = node;
    //   }
    // }

    // var rendered = writer.render(parsed);
    const { dateformat = "DATETIME_FULL" } =
      rendered.match(/\[\[date:(?<dateformat>[A-Z_]+)\]\]/)?.groups || {};

    return rendered
      .replace(/&#8211;/g, "&mdash;")
      .replace(/([’']) ([”"])/g, "$1&nbsp;$2")
      .replace(
        /\[\[date:[A-Z_]+\]\]/g,
        `<time class="published" datetime="${DateTime.now().toISODate()}">${DateTime.now().toLocaleString(
          DateTime[dateformat]
        )}</time>.`
      );
  };

  grunt.registerTask(
    "build",
    "Processes index.html using shared data (if available)",
    function () {
      var files = grunt.file.expandMapping(
        ["**/*.html", "!**/_*.html", "!js/**/*.html"],
        "docs",
        { cwd: "src" }
      );
      var data = Object.create(grunt.data || {});
      data.t = grunt.template;
      files.forEach(function (file) {
        var src = file.src.shift();
        grunt.verbose.writeln("Processing file: " + src);
        var input = grunt.file.read(src);
        var output = process(input, data, src);
        grunt.file.write(file.dest, output);
      });
    }
  );
};
