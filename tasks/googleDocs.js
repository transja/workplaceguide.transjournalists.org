var { google } = require("googleapis");
var os = require("os");
var path = require("path");
var { authenticate } = require("./googleAuth");

var description = "Save Google Docs into the data folder";

module.exports = function (grunt) {
  grunt.registerTask("docs", description, function () {
    var done = this.async();

    var config = grunt.file.readJSON("project.json");
    var auth = null;
    try {
      auth = authenticate();
    } catch (err) {
      console.log(err);
      return grunt.fail.warn(
        "Couldn't load access token for Docs, try running `grunt google-auth`"
      );
    }
    var docs = google.docs({ auth, version: "v1" }).documents;

    var formatters = {
      link: (text, style) => `<a href="${style.link.url}">${text}</a>`,
      bold: (text) => `<b>${text}</b>`,
      italic: (text) => `<i>${text}</i>`,
    };

    /*
     * Large document sets may hit rate limits; you can find details on your quota at:
     * https://console.developers.google.com/apis/api/drive.googleapis.com/quotas?project=<project>
     * where <project> is the project you authenticated with using `grunt google-auth`
     */

    var rateLimit = 2;
    var keys = Object.keys(config.docs);

    var batchProcess = async function () {
      for (var i = 0; i < keys.length; i += rateLimit) {
        var chunk = keys.slice(i, i + rateLimit);
        var batch = chunk.map(async function (key) {
          var documentId = config.docs[key];
          var suggestionsViewMode = "PREVIEW_WITHOUT_SUGGESTIONS";
          var docResponse = await docs.get({
            documentId,
            suggestionsViewMode,
          });

          var name = key + ".docs.txt";
          var body = docResponse.data.body.content;
          var text = "";

          var lists = docResponse.data.lists;

          body.forEach(function (block, idx, arr) {
            // if (block.paragraph?.paragraphStyle?.namedStyleType)
            //   console.log(block.paragraph?.paragraphStyle?.namedStyleType);
            if (!block.paragraph) return;

            const { namedStyleType } = block.paragraph?.paragraphStyle;

            let bullet = "";
            if (block.paragraph?.bullet) {
              const list = lists[block.paragraph.bullet?.listId];
              const level = block.paragraph.bullet.nestingLevel || 0;
              const style = list.listProperties.nestingLevels[level];
              bullet = "ul";

              if (style) {
                if (style.glyphType == "DECIMAL") {
                  bullet = "ol";
                }
              }
              // var indent = "  ".repeat(level);
              if (
                arr.findIndex(
                  (d) =>
                    d?.paragraph?.bullet?.listId ===
                    block.paragraph.bullet?.listId
                ) === idx
              ) {
                text += `<${bullet}>\n`;
              }
              text += "<li>";
            } else if (namedStyleType.startsWith("HEADING_")) {
              text += `<h${namedStyleType.replace("HEADING_", "")}>`;
            } else if (namedStyleType === "NORMAL_TEXT") {
              text += `<p>`;
            }

            block.paragraph.elements.forEach(function (element) {
              // console.log(element);
              if (!element.textRun) return;
              var { content, textStyle } = element.textRun;
              if (content.trim())
                for (var f in formatters) {
                  if (textStyle[f]) {
                    var [_, before, inside, after] =
                      content.match(/^(\s*)(.*?)(\s*)$/);
                    content = before + formatters[f](inside, textStyle) + after;
                  }
                }
              text += content;
            });

            if (block.paragraph?.bullet) {
              text += "</li>\n";
              const lastIdx =
                arr.length -
                [...arr]
                  .reverse()
                  .findIndex(
                    (d) =>
                      d.paragraph?.bullet?.listId ===
                      block.paragraph.bullet?.listId
                  ) -
                1;
              if (idx === lastIdx) {
                text += `</${bullet}>\n`;
              }
            } else if (namedStyleType.startsWith("HEADING_")) {
              text += `</h${namedStyleType.replace("HEADING_", "")}>\n`;
            } else if (namedStyleType === "NORMAL_TEXT") {
              text += `</p>\n`;
            }
          });

          text = text
            .replace(/\x0b/g, "\n")
            .replace(/<p>\n?<\/p>\n?/g, "")
            .replace(/\n<\/(p|h\d|li)>/g, "</$1>");

          console.log(`Writing document as data/${name}`);
          grunt.file.write(path.join("data", name), text);
        });
        await Promise.all(batch);
      }
    };

    batchProcess().then(done);
  });
};
