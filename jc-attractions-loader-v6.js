(function () {
  var WP_API_URL = "https://www.ice-mountain.com/wp-json/wp/v2/pages/3932";
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

  function show(message) {
    if (app()) {
      app().innerHTML = '<p class="jc-error">' + message + "</p>";
    }
  }

  function getText(parent, selector) {
    var el = parent.querySelector(selector);
    return el ? el.textContent.trim() : "";
  }

  function makeCard(item) {
    var card = document.createElement("div");
    card.className = "attraction-card";
    card.setAttribute("data-id", item.id);
    card.setAttribute("data-name", item.name);

    var img = document.createElement("img");
    img.className = "attraction-img";
    img.src = item.image || FALLBACK_IMAGE;
    img.alt = item.title;
    img.onerror = function () {
      this.src = FALLBACK_IMAGE;
    };

    var content = document.createElement("div");
    content.className = "attraction-content";

    var title = document.createElement("strong");
    title.textContent = item.title;

    var summary = document.createElement("div");
    summary.textContent = item.summary;

    content.appendChild(title);
    content.appendChild(summary);
    card.appendChild(img);
    card.appendChild(content);

    card.onclick = function () {
      openModal(item);
    };

    return card;
  }

  function openModal(item) {
    document.getElementById("modal-title").textContent = item.title;
    document.getElementById("modal-text").textContent = item.summary ? item.summary + "\n\n" + item.details : item.details;
    document.getElementById("modal-img").src = item.image || FALLBACK_IMAGE;
    document.getElementById("modal").style.display = "block";
  }

  function closeModal() {
    document.getElementById("modal").style.display = "none";
  }

  function makeMenu() {
    var menu = document.createElement("div");
    menu.id = "stickyMenu";

    SECTIONS.forEach(function (section) {
      var link = document.createElement("a");
      link.className = "Button--primary text-center";
      link.href = "#" + section[0];
      link.textContent = section[1];
      menu.appendChild(link);
    });

    return menu;
  }

  function makeHeader(section) {
    var headerWrap = document.createElement("div");
    headerWrap.className = "jc-section-header-wrap";

    var header = document.createElement("div");
    header.id = section[0];
    header.className = "Button--primary text-center jc-section-header";
    header.textContent = section[1];

    headerWrap.appendChild(header);
    return headerWrap;
  }
