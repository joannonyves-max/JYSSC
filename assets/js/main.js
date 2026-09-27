/* ==========================================================================
   Jyssc — interactions du site
   Vanilla JS, aucune dépendance.
   ========================================================================== */
(function () {
  "use strict";

  /* --- Année courante dans le pied de page ------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* --- Menu mobile ------------------------------------------------------ */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* --- Ombre de l'en-tête au défilement --------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Rendu des réalisations ------------------------------------------- */
  var mount = document.getElementById("projects");
  var projects = window.JYSSC_PROJECTS;

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  if (mount && Array.isArray(projects)) {
    mount.innerHTML = projects.map(function (p) {
      var coverStyle = p.cover ? ' style="--cover:' + esc(p.cover) + '"' : "";
      var cover =
        '<div class="project-cover"' + coverStyle + ">" +
          (p.image
            ? '<img src="' + esc(p.image) + '" alt="Logo ' + esc(p.name) + '" loading="lazy">'
            : '<span class="initials" aria-hidden="true">' + esc(p.initials || "•") + "</span>") +
        "</div>";

      var status = p.status
        ? '<span class="badge badge-' + esc(p.status) + '">' + esc(p.statusLabel || "") + "</span>"
        : "";

      var category = p.category ? '<span class="badge">' + esc(p.category) + "</span>" : "";

      var tags = Array.isArray(p.tags) && p.tags.length
        ? '<ul class="tags">' + p.tags.map(function (t) {
            return '<li class="tag">' + esc(t) + "</li>";
          }).join("") + "</ul>"
        : "";

      var external = p.url && p.url.indexOf("#") !== 0;
      var action = p.url
        ? '<a class="btn btn-sm btn-primary" href="' + esc(p.url) + '"' +
          (external ? ' target="_blank" rel="noopener"' : "") + ">" +
          esc(p.urlLabel || "En savoir plus") + "</a>"
        : "";

      return (
        '<article class="project">' +
          cover +
          '<div class="project-body">' +
            '<div class="project-head"><h3>' + esc(p.name) + "</h3>" + status + category + "</div>" +
            "<p>" + esc(p.description) + "</p>" +
            tags +
            (action ? '<div class="project-actions">' + action + "</div>" : "") +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* --- Apparition au défilement ----------------------------------------- */
  var targets = document.querySelectorAll(
    ".offer, .why-card, .approach-col, .not-offered, .project, .upcoming, " +
    ".journey-steps li, .rent, .price-card, .price-row, .trust-panel, .stat, .form, " +
    ".about > div, .contact-intro"
  );

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 3) * 80 + "ms";
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add("visible");
    });
  }

  /* --- Formulaire de contact guidé -------------------------------------- */
  /* Envoi vers contact.php, sur le serveur. Si le serveur ne répond pas,
     bascule automatiquement sur le logiciel de messagerie du visiteur :
     aucune demande n'est perdue. */
  var ENDPOINT = "contact.php";
  var CONTACT_EMAIL = "contact@jyssc.fr";

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  // Les boutons « Demander mon site », « Être informé »… pré-choisissent le besoin.
  var preselect = function (value) {
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll('input[name="besoin"]'), function (r) {
      r.checked = r.value === value;
    });
    setError(document.getElementById("besoin"), "");
  };

  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("[data-besoin]") : null;
    if (link) preselect(link.getAttribute("data-besoin"));
  });

  // Affiche ou retire le message d'erreur sous un champ (ou un groupe de pastilles).
  var setError = function (el, message) {
    if (!el) return;
    var field = el.closest(".field");
    var existing = field.querySelector(".error");
    if (existing) existing.remove();
    if (message) {
      el.setAttribute("aria-invalid", "true");
      var span = document.createElement("span");
      span.className = "error";
      span.textContent = message;
      field.appendChild(span);
    } else {
      el.removeAttribute("aria-invalid");
    }
  };

  if (form) {
    var radioValue = function (name) {
      var checked = form.querySelector('input[name="' + name + '"]:checked');
      return checked ? checked.value : "";
    };

    var validate = function () {
      var first = null;
      var check = function (el, ok, message) {
        setError(el, ok ? "" : message);
        if (!ok && !first) first = el;
      };

      var name = form.elements.name;
      var email = form.elements.email;
      var message = form.elements.message;

      check(name, name.value.trim() !== "", "Merci d'indiquer votre nom.");
      check(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()),
        "Merci d'indiquer une adresse email valide.");
      check(document.getElementById("activite"), radioValue("activite") !== "",
        "Choisissez ce qui correspond le mieux à votre activité.");
      check(document.getElementById("besoin"), radioValue("besoin") !== "",
        "Choisissez le type de besoin.");
      check(message, message.value.trim().length >= 10,
        "Décrivez votre objectif en quelques mots (10 caractères minimum).");

      if (first) {
        var target = first.querySelector ? (first.querySelector("input") || first) : first;
        target.focus({ preventScroll: true });
        first.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return !first;
    };

    // Dès qu'un choix est fait, on efface l'erreur correspondante.
    form.addEventListener("change", function (e) {
      if (e.target.type === "radio") setError(document.getElementById(e.target.name), "");
    });

    var say = function (text, kind) {
      if (!status) return;
      status.textContent = text;
      status.className = "form-status" + (kind ? " " + kind : "");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      say("", "");

      if (!validate()) {
        say("Merci de compléter les champs signalés.", "ko");
        return;
      }

      var val = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ""; };
      var data = {
        name: val("name"),
        email: val("email"),
        phone: val("phone"),
        activite: radioValue("activite"),
        metier: val("metier"),
        besoin: radioValue("besoin"),
        message: val("message"),
        formule: radioValue("formule"),
        delai: val("delai"),
        website: val("website")
      };

      var button = form.querySelector("button[type=submit]");

      // Repli : ouverture du logiciel de messagerie, pré-rempli.
      var replierSurMailto = function () {
        var lignes = [
          "Nom : " + data.name,
          "Email : " + data.email,
          data.phone ? "Téléphone : " + data.phone : "",
          "Activité : " + data.activite + (data.metier ? " (" + data.metier + ")" : ""),
          "Besoin : " + data.besoin,
          data.formule ? "Formule : " + data.formule : "",
          data.delai ? "Délai : " + data.delai : "",
          "",
          data.message
        ].filter(function (l, i, all) { return l !== "" || i === all.length - 2; });

        window.location.href =
          "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent("[JYSSC] " + data.besoin + " - " + data.name) +
          "&body=" + encodeURIComponent(lignes.join("\n"));

        say("Votre logiciel de messagerie va s'ouvrir pour finaliser l'envoi.", "ok");
      };

      if (!window.fetch) {
        replierSurMailto();
        return;
      }

      button.disabled = true;
      say("Envoi en cours…", "");

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () {
            throw new Error("reponse illisible");
          }).then(function (json) {
            return { status: res.status, json: json };
          });
        })
        .then(function (r) {
          if (r.json && r.json.ok) {
            form.reset();
            say(r.json.message, "ok");
          } else if (r.status === 400 || r.status === 422 || r.status === 429) {
            // Refus légitime du serveur : on affiche son message tel quel.
            say(r.json.message, "ko");
          } else {
            throw new Error("HTTP " + r.status);
          }
        })
        .catch(function () {
          // Serveur injoignable, page ouverte en local… : on ne laisse pas
          // le visiteur dans une impasse.
          replierSurMailto();
        })
        .then(function () {
          button.disabled = false;
        });
    });
  }
})();
