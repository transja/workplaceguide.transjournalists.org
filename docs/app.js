(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  // Desktop TOC
  if (window.innerWidth >= 768) {
    // Rename the first TOC entry
    $(".table-of-contents > ul:first-child > li:first-child a").text("Introduction");

    // Hide all 3rd-level headings
    $(".table-of-contents ul li ul li ul").css("display", "none");

    // Hide empty list items (i.e., without <a> tags but contain <ul> tags)
    $(".table-of-contents > ul > li > ul > li").each((idx, el) => {
      if (!$(el).children("a").length) {
        $(el).css("display", "none");
      }
    });
    const io = new IntersectionObserver(entries => {
      if (entries.length) $(`.table-of-contents li`).css("font-weight", "normal");
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $(`.table-of-contents [href="#${entry.target.id}"]`).parent().css("font-weight", "bold");
          // console.log(
          //   $(`.table-of-contents [href="#${entry.target.id}"] ul`).children()
          // );
          // $(`.table-of-contents [href="#${entry.target.id}"] ul`)
          //   .children()
          //   .css("display", null);
        }
      });
    });

    document.querySelectorAll(".gh-content h1, .gh-content h2, .gh-content-h3").forEach(el => io.observe(el));
    const search = $('<input type="text" id="search" placeholder="Search..." />').on("keyup", evt => {
      if (evt.target.value !== "") {
        const matches = [...$(":not(.table-of-contents) p,li,h1,h2,h3,h4,h5").filter((i, el) => $(el).text().toLowerCase().includes(evt.target.value.toLowerCase())).map((i, el) => $(el).attr("id") || $(el).prevAll("[id]").attr("id") || $(el).parent().attr("id") || $(el).parent().prevAll("[id]").attr("id"))].map(d => "#" + d);
        $(".table-of-contents ul.results").empty();
        $(".table-of-contents .search").css("display", "block");
        $(".table-of-contents ul:not(.results)").css("display", "none").children("li").each((i, el) => {
          if (matches.includes($(el).children("a").attr("href"))) {
            $(el).clone().appendTo(".table-of-contents .results");
          }
        });
      } else {
        $(".table-of-contents .search").css("display", "none");
        $(".table-of-contents ul:not(.results)").css("display", "block");
      }
    });
    const searchResults = $('<div class="search"><h5>Search results</h5><ul class="results"></ul></div>').css("display", "none");
    // Add search to TOC
    $(".table-of-contents").prepend(searchResults);
    $(".table-of-contents").prepend(search);

    // Add TOC header
    $(".table-of-contents").prepend($("<h5>Table of contents</h5>"));

    // Scroll away header
    let prevScrollpos = window.pageYOffset;
    window.onscroll = () => {
      const currentScrollPos = window.pageYOffset;
      if (prevScrollpos > currentScrollPos) {
        document.querySelector("header").style.top = "0";
        document.querySelector(".table-of-contents").style.top = "100px";
        document.querySelector(".table-of-contents").style.height = "calc(100vh - 100px)";
      } else {
        document.querySelector("header").style.top = "-100px";
        document.querySelector(".table-of-contents").style.top = "0";
        document.querySelector(".table-of-contents").style.height = "100vh";
      }
      prevScrollpos = currentScrollPos;
    };
  }

  // Add updated lines
  new Date($("time.published").text());
  $("h2[updated],h3[updated]").each((i, v) => {
    const ds = new Date(v.getAttribute("updated"));
    v.setAttribute("title", `Last updated ${ds.toLocaleString("en-US", {
    dateStyle: "medium"
  })}`);
  });

}));

//# sourceMappingURL=./app.js.map