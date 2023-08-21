// Rename the first TOC entry
$(".table-of-contents > ul:first-child > li:first-child a").text(
  "Introduction"
);

const search = $(
  '<input type="text" id="search" placeholder="Search..." />'
).on("keyup", (evt) => {
  const getId = (el) => $(el).attr("id") || getId($(el).parent());

  if (evt.target.value !== "") {
    const matches = [
      ...$(":not(.table-of-contents) p,li,h1,h2,h3,h4,h5")
        .filter((i, el) =>
          $(el).text().toLowerCase().includes(evt.target.value.toLowerCase())
        )
        .map(
          (i, el) =>
            $(el).attr("id") ||
            $(el).prev("[id]").attr("id") ||
            $(el).parent().attr("id") ||
            $(el).parent().prev("[id]").attr("id")
        ),
    ].map((d) => "#" + d);

    $(".table-of-contents ul.results").empty();
    $(".table-of-contents .search").css("display", "block");
    $(".table-of-contents ul:not(.results)")
      .css("display", "none")
      .children("li")
      .each((i, el) => {
        if (matches.includes($(el).children("a").attr("href"))) {
          $(el).clone().appendTo(".table-of-contents .results");
        }
      });
  } else {
    $(".table-of-contents .search").css("display", "none");
    $(".table-of-contents ul:not(.results)").css("display", "block");
  }
});

const searchResults = $(
  '<div class="search"><h5>Search results</h5><ul class="results"></ul></div>'
).css("display", "none");
// Add search to TOC
$(".table-of-contents").prepend(searchResults);
$(".table-of-contents").prepend(search);

// Add TOC header
$(".table-of-contents").prepend($("<h5>Table of contents</h5>"));

// Add updated lines
const pubDate = new Date($("time.published").text());
$("h2[updated],h3[updated]").each((i, v) => {
  const ds = new Date(v.getAttribute("updated"));
  if (ds !== pubDate) {
    $(v).append(
      `<div class="last-updated">Last updated ${ds.toLocaleString("en-US", {
        dateStyle: "medium",
      })}</div>`
    );
  }
});
