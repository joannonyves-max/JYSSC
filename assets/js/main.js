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

  if (mount && Array.isArray(projects)) {
    var esc = function (s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    };

    mount.innerHTML = projects.map(function (p) {
      var cover = p.image
        ? '<img class="project-cover" src="' + esc(p.image) + '" alt="' + esc(p.name) + '">'
        : '<div class="project-cover" aria-hidden="true">' + esc(p.initials || "•") + "</div>";

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
        : '<a class="btn btn-sm btn-ghost" href="#contact">En savoir plus</a>';

      return (
        '<article class="project reveal">' +
          cover +
          '<div class="project-body">' +
            '<div class="project-head"><h3>' + esc(p.name) + "</h3>" + status + category + "</div>" +
            "<p>" + esc(p.description) + "</p>" +
            tags +
            '<div class="project-actions">' + action + "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* --- Apparition au défilement ----------------------------------------- */
  var targets = document.querySelectorAll(
    ".card, .project, .steps li, .stat, .form, .about > div, .contact > div"
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

  /* --- Formulaire de contact -------------------------------------------- */
  /* Sans serveur, le formulaire ouvre le client mail du visiteur.
     Pour recevoir les messages directement par email, créez un compte sur
     https://formspree.io (gratuit) et renseignez votre endpoint ci-dessous. */
  var FORMSPREE_ENDPOINT = ""; // ex. "https://formspree.io/f/xxxxxxxx"
  var CONTACT_EMAIL = "contact@jyssc.fr";

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form) {
    var setError = function (input, message) {
      var field = input.closest(".field");
      var existing = field.querySelector(".error");
      if (existing) existing.remove();
      if (message) {
        input.setAttribute("aria-invalid", "true");
        var span = document.createElement("span");
        span.className = "error";
        span.textContent = message;
        field.appendChild(span);
      } else {
        input.removeAttribute("aria-invalid");
      }
    };

    var validate = function () {
      var ok = true;
      var name = form.elements.name;
      var email = form.elements.email;
      var message = form.elements.message;

      if (!name.value.trim()) { setError(name, "Merci d'indiquer votre nom."); ok = false; }
      else setError(name, "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        setError(email, "Merci d'indiquer une adresse email valide."); ok = false;
      } else setError(email, "");

      if (message.value.trim().length < 10) {
        setError(message, "Décrivez votre besoin en quelques mots (10 caractères minimum).");
        ok = false;
      } else setError(message, "");

      return ok;
    };

    var say = function (text, kind) {
      if (!status) return;
      status.textContent = text;
      status.className = "form-status" + (kind ? " " + kind : "");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      say("", "");

      if (!validate()) {
        say("Merci de corriger les champs signalés.", "ko");
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        subject: form.elements.subject.value,
        message: form.elements.message.value.trim()
      };

      if (FORMSPREE_ENDPOINT) {
        var button = form.querySelector("button[type=submit]");
        button.disabled = true;
        say("Envoi en cours…", "");

        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            form.reset();
            say("Merci ! Votre message a bien été envoyé. Je vous réponds rapidement.", "ok");
          })
          .catch(function () {
            say("L'envoi a échoué. Vous pouvez m'écrire directement à " + CONTACT_EMAIL + ".", "ko");
          })
          .then(function () {
            button.disabled = false;
          });
        return;
      }

      // Repli sans serveur : ouverture du client mail pré-rempli.
      var body =
        "Nom : " + data.name + "\n" +
        "Email : " + data.email + "\n" +
        "Sujet : " + data.subject + "\n\n" +
        data.message;

      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent("[Jyssc] " + data.subject) +
        "&body=" + encodeURIComponent(body);

      say("Votre logiciel de messagerie va s'ouvrir pour finaliser l'envoi.", "ok");
    });
  }
})();
