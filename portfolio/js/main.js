/* يبني الصفحة من js/works-data.js. لا تحتاج تعديله عادةً. */
(function () {
  "use strict";
  var root = document.documentElement;
  var VIDEO = /\.(mp4|webm|mov|m4v)$/i;
  var YT = /^https?:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//i;
  var SCENES = [
    { sx: "72%", sy: "38%", hz: "54%" },
    { sx: "28%", sy: "34%", hz: "58%" },
    { sx: "34%", sy: "30%", hz: "56%" },
    { sx: "58%", sy: "28%", hz: "55%" },
    { sx: "42%", sy: "36%", hz: "59%" }
  ];
  var works = window.WORKS || [];
  var tools = window.TOOLS || [];
  var contact = window.CONTACT || {};

  /* ---------- theme ---------- */
  var themeBtn = document.getElementById("theme-btn");
  function currentTheme() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }
  function themeLabel() { themeBtn.textContent = currentTheme() === "dark" ? "الوضع الفاتح" : "الوضع الداكن"; }
  try { var saved = localStorage.getItem("portfolio-theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  themeLabel();
  themeBtn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("portfolio-theme", next); } catch (e) {}
    themeLabel();
  });

  /* ---------- works ---------- */
  function mediaHTML(w, i) {
    var src = w.video || "";
    if (!src) {
      var s = SCENES[i % SCENES.length];
      return '<div class="scene" style="--sx:' + s.sx + ";--sy:" + s.sy + ";--hz:" + s.hz + '"></div><span class="play" aria-hidden="true"></span>';
    }
    if (YT.test(src)) {
      var sep = src.indexOf("?") > -1 ? "&" : "?";
      return '<iframe src="' + src + sep + 'rel=0&playsinline=1&enablejsapi=1" title="' + w.title + '"' +
        ' style="width:100%;height:100%;border:0" loading="lazy"' +
        ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"' +
        ' allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    }
    if (VIDEO.test(src)) {
      return '<video controls playsinline preload="metadata"' + (w.poster ? ' poster="' + w.poster + '"' : "") +
        ' src="' + src + '#t=0.001"></video>';
    }
    return '<img src="' + src + '" alt="' + w.title + '" loading="lazy">';
  }

  var host = document.getElementById("cases");
  host.innerHTML = works.map(function (w, i) {
    var n = String(i + 1).padStart(2, "0");
    var ratio = w.ratio ? ' style="aspect-ratio:' + w.ratio + '"' : "";
    return '<article class="case' + (w.ratio ? " wide" : "") + '">' +
      '<div class="case-head"><span class="num">' + n + "</span><h3>" + w.title + "</h3>" +
        (w.sample ? '<span class="sample">مثال</span>' : "") + "</div>" +
      '<div class="case-body">' +
        '<div class="media"><div class="vid"' + ratio + '>' + mediaHTML(w, i) + "</div></div>" +
        "<div>" +
          '<div class="meta"><span>' + w.kind + '</span><span class="mono">' + w.duration + '</span><span class="mono">' + (w.tools || []).join(" · ") + "</span></div>" +
          "<h4>المطلوب</h4><p>" + w.brief + "</p>" +
          "<h4>ما الذي فعلته</h4><p>" + w.did + "</p>" +
          "<h4>كيف أنجزته</h4><ol>" + (w.steps || []).map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" +
        "</div>" +
      "</div>" +
    "</article>";
  }).join("");

  /* يوقف الفيديو عندما يخرج العمل من الشاشة */
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) return;
        en.target.querySelectorAll("video").forEach(function (v) { v.pause(); });
        en.target.querySelectorAll("iframe").forEach(function (f) {
          try { f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*"); } catch (e) {}
        });
      });
    }, { threshold: 0 });
    host.querySelectorAll(".case").forEach(function (c) { vio.observe(c); });
  }

  /* ---------- tools ---------- */
  var toolsHost = document.getElementById("tools-list");
  toolsHost.innerHTML = tools.map(function (t) {
    var logo = t.logo ? '<img class="logo-img" src="' + t.logo + '" alt="">' : '<span class="logo-slot" aria-hidden="true">الشعار</span>';
    return '<div class="tool">' + logo + "<div><b>" + t.name + "</b><span>" + t.desc + "</span></div></div>";
  }).join("");
  toolsHost.querySelectorAll("img.logo-img").forEach(function (img) {
    img.addEventListener("error", function () {
      var s = document.createElement("span");
      s.className = "logo-slot"; s.setAttribute("aria-hidden", "true"); s.textContent = "الشعار";
      img.replaceWith(s);
    });
  });

  /* ---------- contact ---------- */
  var rows = [];
  if (contact.email) rows.push({ k: "البريد", v: contact.email, href: "mailto:" + contact.email });
  if (contact.whatsapp) rows.push({ k: "واتساب", v: contact.whatsapp, href: contact.whatsappLink || "" });
  document.getElementById("contact-list").innerHTML = rows.map(function (r) {
    var ext = r.href.indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : "";
    var val = r.href ? '<a class="v" href="' + r.href + '"' + ext + ">" + r.v + "</a>" : '<span class="v">' + r.v + "</span>";
    return '<li><span class="k">' + r.k + "</span>" + val + "</li>";
  }).join("");

  /* ---------- scroll reveal ---------- */
  try {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      root.classList.add("js");
      var LIST = ".hero h1 .name, .hero h1 .role, .hero .lead, .hero .cta-row, .collage .block-y, .collage .frame-p, .collage .ph, .sec-head, .case-head, .case-body > div, .tool, .contact > div, .info li, footer";
      var stagger = function (sel, base, step) {
        document.querySelectorAll(sel).forEach(function (el, i) { el.style.setProperty("--d", (base + i * step) + "ms"); });
      };
      stagger(".hero h1 .name, .hero h1 .role, .hero .lead, .hero .cta-row", 0, 120);
      stagger(".collage .block-y, .collage .frame-p, .collage .ph", 200, 130);
      stagger(".tool", 0, 120);
      stagger(".info li", 0, 100);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      document.querySelectorAll(LIST).forEach(function (el) { io.observe(el); });
    }
  } catch (e) { root.classList.remove("js"); }
})();
