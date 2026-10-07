(function () {
  "use strict";

  var currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var isHome = currentPage === "" || currentPage === "index.html";
  var siteRoot = document.documentElement.getAttribute("data-site-root") || "";

  function hrefFor(anchor) {
    return isHome ? anchor : siteRoot + "index.html" + anchor;
  }

  function menuItems() {
    return [
      { label: "Home", href: hrefFor("#home") },
      { label: "About", href: hrefFor("#about") },
      { label: "Research", href: hrefFor("#services") },
      { label: "Publications", href: currentPage === "full_publication.html" ? "#full_publication" : hrefFor("#publication") },
      { label: "Projects", href: hrefFor("#news") },
      { label: "Teaching", href: hrefFor("#teaching") },
      { label: "Gallery", href: siteRoot + "portfolio.html" },
      { label: "Blog", href: siteRoot + "blog.html" },
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
      '<div class="logo"><a href="' + hrefFor("#home") + '" aria-label="Long Tan Le home"><img class="mobile_signature_logo" src="' + siteRoot + 'img/logo/logo-imlong-0.png" alt="Long Tan Le signature logo" /></a></div>',
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
      '<div class="logo_wrap"><a class="brand_mark" href="' + hrefFor("#home") + '" aria-label="Long Tan Le home"><img class="signature_logo" src="' + siteRoot + 'img/logo/logo-imlong-0.png" alt="Long Tan Le signature logo" /></a></div>',
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

      var contactContainer = document.querySelector("#contact .arlo_tm_contact_wrap_all > .container");
      if (contactContainer) {
        contactContainer.innerHTML = [
          '<div class="contact_panel">',
          '<div class="contact_intro">',
          '<span class="contact_eyebrow">Research · Data science · Collaboration</span>',
          '<h4>Let\'s connect.</h4>',
          '<p>I welcome conversations about research collaboration, applied data science, speaking, and opportunities to build dependable AI systems.</p>',
          '<p class="contact_location"><i class="fa fa-map-marker" aria-hidden="true"></i> Sydney, NSW, Australia</p>',
          '<a class="contact_primary" href="mailto:tanlong.ce@gmail.com"><i class="fa fa-envelope" aria-hidden="true"></i> Email me</a>',
          "</div>",
          '<div class="contact_methods" aria-label="Contact and research profiles">',
          '<a href="mailto:tanlong.ce@gmail.com"><span>Email</span><strong>tanlong.ce@gmail.com</strong><i class="fa fa-arrow-right" aria-hidden="true"></i></a>',
          '<a href="https://www.linkedin.com/in/long-le-tan-660018128/"><span>LinkedIn</span><strong>Professional profile</strong><i class="fa fa-arrow-right" aria-hidden="true"></i></a>',
          '<a href="https://scholar.google.com.au/citations?user=CZZTrOoAAAAJ&hl=en"><span>Google Scholar</span><strong>Research publications</strong><i class="fa fa-arrow-right" aria-hidden="true"></i></a>',
          '<a href="https://github.com/longtanle"><span>GitHub</span><strong>Code and projects</strong><i class="fa fa-arrow-right" aria-hidden="true"></i></a>',
          '<a href="https://orcid.org/0000-0003-3284-1990"><span>ORCID</span><strong>0000-0003-3284-1990</strong><i class="fa fa-arrow-right" aria-hidden="true"></i></a>',
          "</div>",
          "</div>"
        ].join("");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyShell);
  } else {
    applyShell();
  }

  window.addEventListener("load", applyShell);
})();
