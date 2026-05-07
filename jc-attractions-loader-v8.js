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

  function makeModal() {
    var modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "modal";
    modal.innerHTML = '<div class="modal-content"><span class="close" id="jc-modal-close">&times;</span><h2 id="modal-title">&nbsp;</h2><p id="modal-text">&nbsp;</p><img alt="Attractie-afbeelding" id="modal-img" src="" /></div>';
    modal.onclick = function (event) {
      if (event.target === modal) closeModal();
    };
    return modal;
  }

  function makeTopButton() {
    var button = document.createElement("button");
    button.id = "scrollToTopBtn";
    button.title = "Terug naar boven";
    button.textContent = "↑";
    button.onclick = function () {
      window.scrollTo(0, 0);
    };

    window.addEventListener("scroll", function () {
      button.style.display = window.pageYOffset > 400 ? "block" : "none";
    });

    return button;
  }

  function render(items) {
    var root = app();
    root.innerHTML = "";
    root.appendChild(makeMenu());

    var grid = document.createElement("div");
    grid.className = "attraction-grid";

    SECTIONS.forEach(function (section) {
      var addedHeader = false;

      items.forEach(function (item) {
        if (!item.visible || item.category !== section[0]) {
          return;
        }

        if (!addedHeader) {
          grid.appendChild(makeHeader(section));
          addedHeader = true;
        }

        grid.appendChild(makeCard(item));
      });
    });

    if (!grid.querySelector(".attraction-card")) {
      show("Er zijn momenteel geen zichtbare attracties.");
      return;
    }

    root.appendChild(grid);
    root.appendChild(makeModal());
    root.appendChild(makeTopButton());

    document.getElementById("jc-modal-close").onclick = closeModal;
  }

  function load() {
    show("Attracties laden...");

    fetch(WP_API_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("WordPress API status " + response.status);
        }
        return response.json();
      })
      .then(function (page) {
        var html = page && page.content && page.content.rendered ? page.content.rendered : "";
        if (!html) {
          throw new Error("Geen content.rendered gevonden.");
        }

        var doc = new DOMParser().parseFromString(html, "text/html");
        var blocks = Array.prototype.slice.call(doc.querySelectorAll(".jc-item"));
        if (!blocks.length) {
          throw new Error("Geen .jc-item blokken gevonden in WordPress.");
        }

        var items = blocks.map(function (block, index) {
          return {
            id: block.getAttribute("data-id") || String(index + 1),
            category: block.getAttribute("data-category") || "attractions",
            name: block.getAttribute("data-name") || block.getAttribute("data-title") || getText(block, "h2") || "Attractie",
            title: block.getAttribute("data-title") || getText(block, "h2") || "Attractie",
            summary: block.getAttribute("data-summary") || getText(block, ".summary"),
            image: block.getAttribute("data-image") || getText(block, ".image"),
            details: block.getAttribute("data-details") || getText(block, ".details") || block.textContent.trim(),
            visible: block.getAttribute("data-visible") !== "false"
          };
        });

        render(items);
      })
      .catch(function (error) {
        show("De attracties konden niet geladen worden: " + error.message);
        if (window.console) {
          console.error(error);
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
