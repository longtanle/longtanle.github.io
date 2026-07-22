(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderLinks(links) {
    if (!Array.isArray(links) || !links.length) {
      return '<span class="text-muted">&mdash;</span>';
    }

    return links.map(function (link) {
      return '<a href="' + escapeHtml(link.url) + '">' + escapeHtml(link.label) + "</a>";
    }).join(" / ");
  }

  function sortPublications(items) {
    return items.slice().sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
      return (a.title || "").localeCompare(b.title || "");
    });
  }

  function publicationText(item) {
    return escapeHtml([item.authors, '"' + item.title + '"', item.venue].filter(Boolean).join(", "));
  }

  function initPublicationTable(tableId) {
    if (!window.jQuery || !jQuery.fn || !jQuery.fn.DataTable) return;

    var selector = "#" + tableId;
    if (!jQuery(selector).length) return;

    if (jQuery.fn.DataTable.isDataTable(selector)) {
      jQuery(selector).DataTable().destroy();
    }

    jQuery(selector).DataTable({ order: [[1, "desc"]] });
    jQuery(".dataTables_length").addClass("bs-select");
  }

  function renderPublications(items, targetId, tableId, selectedOnly) {
    var target = document.getElementById(targetId);
    if (!target) return;

    target.innerHTML = sortPublications(items)
      .filter(function (item) { return selectedOnly ? item.selected : true; })
      .map(function (item) {
        return [
          "<tr>",
          '<td class="d-none d-sm-table-cell">' + escapeHtml(item.field) + "</td>",
          "<td>" + escapeHtml(item.year) + "</td>",
          '<td class="d-none d-sm-table-cell">' + escapeHtml(item.type) + "</td>",
          "<td>" + publicationText(item) + "</td>",
          "<td>" + renderLinks(item.links) + "</td>",
          "</tr>"
        ].join("");
      }).join("");

    initPublicationTable(tableId);
  }

  function renderProjectLinks(links) {
    if (!Array.isArray(links) || !links.length) return "";

    return '<div class="arlo_tm_popup_share_wrap"><ul>' +
      links.map(function (link) {
        return '<li><a href="' + escapeHtml(link.url) + '">' + escapeHtml(link.label) + "</a></li>";
      }).join("") +
      "</ul></div>";
  }

  function renderProjects(items) {
    var target = document.getElementById("projects-list");
    if (!target) return;

    target.innerHTML = items.map(function (item, index) {
      var delay = index % 2 === 1 ? ' data-wow-delay="0.2s"' : "";

      return [
        '<li class="wow fadeInUp" data-wow-duration="1.2s"' + delay + ">",
        '<div class="inner_list">',
        '<div class="image_wrap">',
        '<img class="small" src="' + escapeHtml(item.thumbnail) + '" alt="' + escapeHtml(item.title) + '"/>',
        '<div class="news_image" data-url="' + escapeHtml(item.thumbnail) + '"></div>',
        '<a class="link_news" href="index.html"></a>',
        "</div>",
        '<div class="definitions_wrap">',
        '<div class="date_wrap"><p>' + escapeHtml(item.period) + ' <a href="index.html">' + escapeHtml(item.category) + "</a></p></div>",
        '<div class="title_holder"><h3><a href="index.html">' + escapeHtml(item.title) + "</a></h3></div>",
        '<div class="definition"><p>' + escapeHtml(item.summary) + "</p></div>",
        '<div class="full_def"><img style="display: block; margin-left: auto; margin-right: auto;" src="' + escapeHtml(item.popupImage) + '" alt="' + escapeHtml(item.title) + '" width="400" /><p></p><p>' + escapeHtml(item.description) + "</p></div>",
        renderProjectLinks(item.links),
        '<div class="read_more"><a href="#"><span>Read More</span></a></div>',
        "</div></div></li>"
      ].join("");
    }).join("");

    if (typeof window.arlo_tm_popup_blog === "function") {
      window.arlo_tm_popup_blog();
    }
  }

  function loadJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadJson("data/publications.json")
      .then(function (items) {
        renderPublications(items, "selected-publications-body", "selected-publications-table", true);
        renderPublications(items, "all-publications-body", "all-publications-table", false);
      })
      .catch(function (error) {
        console.error(error);
      });

    loadJson("data/projects.json")
      .then(function (items) {
        renderProjects(items);
      })
      .catch(function (error) {
        console.error(error);
      });
  });
})();
