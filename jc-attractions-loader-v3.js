(function () {
  var WP_API_URL = "https://www.ice-mountain.com/wp-json/wp/v2/pages?slug=jc-attractions-data";
  var FALLBACK_IMAGE = "https://www.jungle-city.be/site/layout/img/junglecity-logo.png";
  var SECTIONS = [
    ["attractions", "ATTRACTIES"],
    ["aires", "SPEELZONES"],
    ["restauration", "HORECA"],
    ["animations", "ANIMATIES"],
    ["boutiques", "WINKELS"]
  ];

  function app() {
    return document.getElementById("jc-attractions-app");
  }

  function status(message) {
    if (app()) app().innerHTML = '<p class="jc-error">' + message + "</p>";
  }

  function textFrom(parent, selector) {
    var found = parent.querySelector(selector);
    return found ? found.textContent.trim() : "";
  }

  function itemFromElement(element, index) {
    var title = element.getAttribute("data-title") || textFrom(element, "h2") || "Attractie";
    return {
      id: element.getAttribute("data-id") || String(index + 1),
      category: element.getAttribute("data-category") || "attractions",
      name: element.getAttribute("data-name") || title,
      title: title,
      summary: element.getAttribute("data-summary") || textFrom(element, ".summary"),
      image: element.getAttribute("data-image") || textFrom(element, ".image") || FALLBACK_IMAGE,
      visible: element.getAttribute("data-visible") !== "false",
      details: element.getAttribute("data-details") || textFrom(element, ".details") || element.textContent.trim()
    };
  }

  function makeCard(item) {
    var card = document.createElement("div");
    card.className = "attraction-card";
    card.setAttribute("data-id", item.id);
    card.setAttribute("data-name", item.name);

    var img = document.createElement("img");
    img.className = "attraction-img";
    img.src = item.image;
    img.alt = item.title;
    img.onerror = function () {
      this.src = FALLBACK_IMAGE;
    };

    var content = document.createElement("div");
    content.className = "attraction-content";
    content.innerHTML = "<strong></strong><div></div>";
    content.querySelector("strong").textContent = item.title;
    content.querySelector("div").textContent = item.summary;

    card.appendChild(img);
    card.appendChild(content);
    card.onclick = function () {
      openModal(item);
    };
    return card;
  }

  function openModal(item) {
    document.getElementById("modal-title").textContent = item.title;
    document.getElementById("modal-text").textContent = item.summary + "\n\n" + item.details;
    document.getElementById("modal-img").src = item.image;
    document.getElementById("modal").style.display = "block";
  }

  function closeModal() {
    document.getElementById("modal").style.display = "none";
  }

  function render(items) {
    var root = app();
    root.innerHTML = "";

    var menu = document.createElement("div");
    menu.id = "stickyMenu";
    SECTIONS.forEach(function (section) {
      var link = document.createElement("a");
      link.className = "Button--primary text-center";
      link.href = "#" + section[0];
      link.textContent = section[1];
      menu.appendChild(link);
    });
    root.appendChild(menu);

    var grid = document.createElement("div");
    grid.className = "attraction-grid";

    SECTIONS.forEach(function (section) {
      var sectionItems = items.filter(function (item) {
        return item.visible && item.category === section[0];
      });
      if (!sectionItems.length) return;
