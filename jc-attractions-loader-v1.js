(function () {
  var WP_API_URL = "https://www.ice-mountain.com/wp-json/wp/v2/pages/3932";
  var FALLBACK_IMAGE = "https://www.jungle-city.be/site/layout/img/junglecity-logo.png";

  var sections = [
    { id: "attractions", label: "ATTRACTIES" },
    { id: "aires", label: "SPEELZONES" },
    { id: "restauration", label: "HORECA" },
    { id: "animations", label: "ANIMATIES" },
    { id: "boutiques", label: "WINKELS" }
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function textFrom(parent, selector) {
    var element = parent.querySelector(selector);
    return element ? element.textContent.trim() : "";
  }

  function getItemData(item, index) {
    var title = item.getAttribute("data-title") || textFrom(item, "h2") || item.getAttribute("data-name") || "Attractie";
    var summary = item.getAttribute("data-summary") || textFrom(item, ".summary");
    var details = item.getAttribute("data-details") || textFrom(item, ".details") || item.textContent.trim();
    var image = item.getAttribute("data-image") || textFrom(item, ".image") || FALLBACK_IMAGE;
    var visible = item.getAttribute("data-visible");

    return {
      id: item.getAttribute("data-id") || String(index + 1),
      category: item.getAttribute("data-category") || "attractions",
      name: item.getAttribute("data-name") || title,
      title: title,
      summary: summary,
      details: details,
      image: image,
      visible: visible !== "false"
    };
  }

  function createStickyMenu() {
    var menu = document.createElement("div");
    menu.id = "stickyMenu";

    sections.forEach(function (section) {
      var link = document.createElement("a");
      link.className = "Button--primary text-center";
      link.href = "#" + section.id;
      link.textContent = section.label;
      menu.appendChild(link);
    });

    return menu;
  }

  function createSectionHeader(section) {
    var wrap = document.createElement("div");
    wrap.className = "jc-section-header-wrap";

    var header = document.createElement("div");
    header.className = "Button--primary text-center jc-section-header";
    header.id = section.id;
    header.textContent = section.label;

    wrap.appendChild(header);
    return wrap;
  }

  function createCard(item) {
    var card = document.createElement("div");
    card.className = "attraction-card";
    card.setAttribute("data-id", item.id);
    card.setAttribute("data-name", item.name);
    card.setAttribute("data-details", item.summary ? item.summary + "\n" + item.details : item.details);

    var img = document.createElement("img");
    img.className = "attraction-img";
    img.src = item.image;
    img.alt = item.title;
    img.onerror = function () {
      this.src = FALLBACK_IMAGE;
    };

    var content = document.createElement("div");
    content.className = "attraction-content";

    var strong = document.createElement("strong");
    strong.textContent = item.title;

    var summary = document.createElement("div");
    summary.textContent = item.summary;
