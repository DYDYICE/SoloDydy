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

      var headerWrap = document.createElement("div");
      headerWrap.className = "jc-section-header-wrap";
      var header = document.createElement("div");
      header.id = section[0];
      header.className = "Button--primary text-center jc-section-header";
      header.textContent = section[1];
      headerWrap.appendChild(header);
      grid.appendChild(headerWrap);

      sectionItems.forEach(function (item) {
        grid.appendChild(makeCard(item));
      });
    });

    root.appendChild(grid);

    var modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "modal";
    modal.innerHTML = '<div class="modal-content"><span class="close" id="jc-modal-close">&times;</span><h2 id="modal-title">&nbsp;</h2><p id="modal-text">&nbsp;</p><img alt="Attractie-afbeelding" id="modal-img" src="" /></div>';
    modal.onclick = function (event) {
      if (event.target === modal) closeModal();
    };
    root.appendChild(modal);
    document.getElementById("jc-modal-close").onclick = closeModal;
  }

  function load() {
    status("Attracties laden...");
    fetch(WP_API_URL)
      .then(function (response) {
        if (!response.ok) throw new Error("WordPress API status " + response.status);
        return response.json();
      })
      .then(function (pages) {
        var page = pages[0];
        var html = page && page.content && page.content.rendered;
        if (!html) throw new Error("Geen WordPress inhoud gevonden.");

        var doc = new DOMParser().parseFromString(html, "text/html");
        var items = Array.prototype.slice.call(doc.querySelectorAll(".jc-item")).map(itemFromElement);
        if (!items.length) throw new Error("Geen .jc-item blokken gevonden.");

        render(items);
      })
      .catch(function (error) {
        status("De attracties konden niet geladen worden: " + error.message);
        if (window.console) console.error(error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
