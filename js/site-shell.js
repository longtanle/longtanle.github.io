(function () {
  "use strict";

  var currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var isHome = currentPage === "" || currentPage === "index.html";

  function hrefFor(anchor) {
    return isHome ? anchor : "index.html" + anchor;
  }

  function menuItems() {
    return [
      { label: "Home", href: hrefFor("#home") },
      { label: "About", href: hrefFor("#about") },
      { label: "Research", href: hrefFor("#services") },
      { label: "Publications", href: currentPage === "full_publication.html" ? "#full_publication" : hrefFor("#publication") },
      { label: "Projects", href: hrefFor("#news") },
      { label: "Gallery", href: "portfolio.html" },
      { label: "CV", href: "data/LongLT_CV.pdf" },
      { label: "Contact", href: hrefFor("#contact") }
    ];
  }

  function socialItems() {
    return [
      { href: "https://www.linkedin.com/in/long-le-tan-660018128/", icon: "fa-linkedin-square", label: "LinkedIn" },
      { href: "https://github.com/longtanle", icon: "fa-github-square", label: "GitHub" },
      { href: "https://scholar.google.com.au/citations?user=CZZTrOoAAAAJ&hl=en", icon: "fa-google", label: "Google Scholar" },
      { href: "https://orcid.org/0000-0003-3284-1990", icon: "fa-id-badge", label: "ORCID" }
    ];
  }

  function renderMenu() {
    return menuItems().map(function (item) {
      return '<li><a href="' + item.href + '">' + item.label + "</a></li>";
    }).join("");
  }

  function renderSocial() {
    return socialItems().map(function (item) {
      return '<li><a href="' + item.href + '" aria-label="' + item.label + '"><i class="fa ' + item.icon + '"></i></a></li>';
    }).join("");
  }

  function renderMobileHeader() {
    return [
      '<div class="arlo_tm_mobile_header_wrap">',
      '<div class="main_wrap">',
      '<div class="logo"></div>',
      '<div class="arlo_tm_trigger">',
      '<div class="hamburger hamburger--collapse-r">',
      '<div class="hamburger-box"><div class="hamburger-inner"></div></div>',
      "</div>",
      "</div>",
      "</div>",
      '<div class="arlo_tm_mobile_menu_wrap">',
      '<div class="mob_menu"><ul class="anchor_nav">' + renderMenu() + "</ul></div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderSidebar() {
    return [
      '<div class="arlo_tm_leftpart_wrap">',
      '<div class="leftpart_inner">',
      '<div class="logo_wrap"><a href="' + hrefFor("#home") + '"><img src="img/logo/logo-imlong-0.png" alt="" /></a></div>',
      '<div class="menu_list_wrap"><ul class="anchor_nav">' + renderMenu() + "</ul></div>",
      '<div class="leftpart_bottom"><div class="social_wrap"><ul>' + renderSocial() + "</ul></div></div>",
      '<a class="arlo_tm_resize" href="#"><i class="xcon-angle-left"></i></a>',
      "</div>",
      "</div>"
    ].join("");
  }

  function applyShell() {
    document.querySelectorAll('[data-site-shell="mobile-header"]').forEach(function (el) {
      el.outerHTML = renderMobileHeader();
    });

    document.querySelectorAll('[data-site-shell="sidebar"]').forEach(function (el) {
      el.outerHTML = renderSidebar();
    });

    document.querySelectorAll(".arlo_tm_mobile_menu_wrap .mob_menu ul").forEach(function (el) {
      el.innerHTML = renderMenu();
    });

    document.querySelectorAll(".menu_list_wrap ul").forEach(function (el) {
      el.innerHTML = renderMenu();
    });

    document.querySelectorAll(".social_wrap ul").forEach(function (el) {
      el.innerHTML = renderSocial();
    });

    document.querySelectorAll(".logo_wrap a").forEach(function (el) {
      el.setAttribute("href", hrefFor("#home"));
    });

    document.querySelectorAll(".arlo_tm_footer_wrap .container").forEach(function (el) {
      el.innerHTML = "<p>&copy; Copyright 2026. All rights reserved.</p>";
    });

    if (isHome) {
      var highlights = document.querySelector(".arlo_tm_skills_wrap .arlo_tm_mini_title_holder");
      if (highlights) {
        highlights.innerHTML = [
          "<h4><span>Recent Highlights</span></h4>",
          '<p><b>2026:</b> Published new work in IEEE Journal on Selected Areas in Communications and IEEE Internet of Things Journal.</p>',
          '<p><b>2025:</b> Federated Koopman-Reservoir Learning appeared at SIAM SDM (<a href="https://epubs.siam.org/doi/abs/10.1137/1.9781611978520.7">paper</a>).</p>',
          "<p><b>March 2025:</b> Successfully defended my PhD thesis at the University of Sydney.</p>",
          "<p><b>2024:</b> Published papers in ACM CIKM and IEEE/ACM Transactions on Networking.</p>"
        ].join("");
      }

      var contactLeftBox = document.querySelector("#contact .leftbox .short_info_wrap");
      if (contactLeftBox) {
        contactLeftBox.innerHTML = [
          "<ul>",
          '<li><p><label>Address:</label><span> Sydney, NSW, Australia</span></p></li>',
          '<li><p><label>Email:</label><span><a href="mailto:tanlong.ce@gmail.com">tanlong.ce@gmail.com</a></span></p></li>',
          '<li><p><label>Website:</label><span><a href="https://longtanle.github.io">longtanle.github.io</a></span></p></li>',
          '<li><p><label>Google Scholar:</label><span><a href="https://scholar.google.com.au/citations?user=CZZTrOoAAAAJ&hl=en">profile</a></span></p></li>',
          "</ul>"
        ].join("");
      }

      var contactBox = document.querySelector("#contact .rightbox");
      if (contactBox) {
        contactBox.innerHTML = [
          '<div class="arlo_tm_mini_title_holder contact"><h4>Preferred contact</h4></div>',
          '<div class="short_info_wrap">',
          "<p>The quickest way to reach me is by email. For research collaboration, data science work, or speaking opportunities, please get in touch through one of the links below.</p>",
          "<ul>",
          '<li><p><label>Email:</label><span><a href="mailto:tanlong.ce@gmail.com">tanlong.ce@gmail.com</a></span></p></li>',
          '<li><p><label>LinkedIn:</label><span><a href="https://www.linkedin.com/in/long-le-tan-660018128/">long-le-tan</a></span></p></li>',
          '<li><p><label>GitHub:</label><span><a href="https://github.com/longtanle">github.com/longtanle</a></span></p></li>',
          '<li><p><label>ORCID:</label><span><a href="https://orcid.org/0000-0003-3284-1990">0000-0003-3284-1990</a></span></p></li>',
          "</ul>",
          "</div>"
        ].join("");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyShell);
  } else {
    applyShell();
  }

  window.addEventListener("load", applyShell);
})();
