(function () {
  var WP_API_URL = "https://www.ice-mountain.com/wp-json/wp/v2/pages/3932";
  var FALLBACK_IMAGE = "https://www.jungle-city.be/site/layout/img/junglecity-logo.png";

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

    return card;
  }

  function render(items) {
    var root = app();
    root.innerHTML = "";

    var headerWrap = document.createElement("div");
    headerWrap.className = "jc-section-header-wrap";

    var header = document.createElement("div");
    header.id = "attractions";
    header.className = "Button--primary text-center jc-section-header";
    header.textContent = "ATTRACTIES";

    headerWrap.appendChild(header);

    var grid = document.createElement("div");
    grid.className = "attraction-grid";
    grid.appendChild(headerWrap);

    items.forEach(function (item) {
      grid.appendChild(makeCard(item));
    });

    root.appendChild(grid);
  }

  function load() {
    show("Stap 1/4: WordPress data ophalen...");

    fetch(WP_API_URL)
      .then(function (response) {
        show("Stap 2/4: WordPress antwoord ontvangen...");
        if (!response.ok) {
          throw new Error("WordPress API status " + response.status);
        }
        return response.json();
      })
      .then(function (page) {
        show("Stap 3/4: WordPress inhoud lezen...");

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
            title: block.getAttribute("data-title") || getText(block, "h2") || "Attractie",
            summary: block.getAttribute("data-summary") || getText(block, ".summary"),
            image: block.getAttribute("data-image") || getText(block, ".image"),
            details: block.getAttribute("data-details") || getText(block, ".details") || block.textContent.trim()
          };
        });

        show("Stap 4/4: " + items.length + " attractie(s) tonen...");
        render(items);
      })
      .catch(function (error) {
        show("Fout: " + error.message);
        if (window.console) {
          console.error(error);
        }
      });
  }

  setTimeout(function () {
    if (app() && app().textContent.indexOf("Stap 1/4") !== -1) {
      show("Fout: WordPress antwoordde niet binnen 10 seconden.");
    }
  }, 10000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
