(function () {
  'use strict';

  /* ====================================================================
     Portfolio — Kevin Surya Augusto
     ==================================================================== */

  /* ── Data Rendering ───────────────────────────────────────────────── */

  function renderSkillGroups(data) {
    var grid = document.querySelector('[data-skills-grid]');
    if (!grid) return;
    grid.innerHTML = '';

    data.skillGroups.forEach(function (group, gi) {
      var card = document.createElement('div');
      card.className = 'skill-card';
      card.setAttribute('data-reveal', '');
      card.setAttribute('data-delay', gi * 90);

      var chips = group.items.map(function (skill) {
        var star = skill.strong ? '★ ' : '';
        var cls = skill.strong ? 'chip chip--strong' : 'chip chip--default';
        var iconHtml = skill.icon
          ? '<span class="chip-icon"><img src="' + skill.icon + '" alt="" loading="lazy"></span>'
          : '';
        return '<span class="' + cls + '">' + iconHtml + star + skill.name + '</span>';
      }).join('');

      card.innerHTML =
        '<div class="skill-card-header">' +
        '  <span class="skill-card-glyph">' + group.glyph + '</span>' +
        '  <h3 class="skill-card-label">' + group.label + '</h3>' +
        '</div>' +
        '<div class="skill-chips">' + chips + '</div>';

      grid.appendChild(card);
    });

    initReveal();
  }

  function renderEducation(data) {
    var container = document.querySelector('[data-education-list]');
    if (!container) return;
    container.innerHTML = '';

    data.education.forEach(function (ed) {
      container.innerHTML +=
        '<div class="timeline-entry">' +
        '  <span class="timeline-dot"></span>' +
        '  <div class="timeline-card">' +
        '    <div class="timeline-date">' + ed.period + '</div>' +
        '    <div class="timeline-title">' + ed.name + '</div>' +
        '    <div class="timeline-subtitle">' + ed.field + '</div>' +
        '  </div>' +
        '</div>';
    });
  }

  function renderExperience(data) {
    var container = document.querySelector('[data-experience-list]');
    if (!container) return;
    container.innerHTML = '';

    data.experience.forEach(function (ex) {
      container.innerHTML +=
        '<div class="timeline-entry">' +
        '  <span class="timeline-dot"></span>' +
        '  <div class="timeline-card">' +
        '    <div class="timeline-date">' + ex.date + '</div>' +
        '    <div class="timeline-title">' + ex.company + '</div>' +
        '    <div class="timeline-subtitle">' + ex.role + '</div>' +
        '  </div>' +
        '</div>';
    });
  }

  function renderProjects(data) {
    var grid = document.querySelector('[data-projects-grid]');
    if (!grid) return;
    grid.innerHTML = '';

    data.projects.forEach(function (project, pi) {
      var card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-reveal', '');
      card.setAttribute('data-delay', pi * 90);

      var techTags = project.tech.map(function (t) {
        return '<span class="tech-tag">' + t + '</span>';
      }).join('');

      card.innerHTML =
        '<img class="project-image" src="' + project.image + '" alt="' + project.title + ' screenshot" loading="lazy">' +
        '<div class="project-body">' +
        '  <div class="project-header">' +
        '    <h3 class="project-title">' + project.title + '</h3>' +
        '    <svg class="project-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '      <path d="M7 17 17 7M9 7h8v8"/>' +
        '    </svg>' +
        '  </div>' +
        '  <p class="project-desc">' + project.desc + '</p>' +
        '  <div class="project-tech">' + techTags + '</div>' +
        '</div>';

      grid.appendChild(card);
    });

    initReveal();
  }

  function renderFooter() {
    var yearEl = document.querySelector('[data-year]');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ── Scroll Reveal ────────────────────────────────────────────────── */

  function initReveal() {
    var els = Array.from(document.querySelectorAll('[data-reveal]')).filter(function (el) {
      return el.style.opacity !== '1' && !el.classList.contains('revealed');
    });

    if (els.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var reveal = function (el) {
      var delay = parseFloat(el.getAttribute('data-delay') || '0');
      el.style.transitionDelay = delay + 'ms';
      el.classList.add('revealed');
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(function (el) { io.observe(el); });

    requestAnimationFrame(function () {
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          reveal(el);
          io.unobserve(el);
        }
      });
    });

    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains('revealed')) {
          reveal(el);
        }
      });
    }, 1200);
  }

  /* ── Contact Form ─────────────────────────────────────────────────── */

  function initContactForm() {
    var form = document.getElementById('contact-form');
    var success = document.getElementById('contact-success');
    var errorEl = document.getElementById('form-error');
    var submitBtn = document.querySelector('[data-submit-btn]');

    if (!form || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var formData = new FormData(form);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      if (errorEl) errorEl.classList.remove('visible');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send message';
          }

          if (data.success) {
            form.style.display = 'none';
            success.style.display = '';
            form.reset();
          } else {
            var msg = data.message || 'Something went wrong. Please try again.';
            if (errorEl) {
              errorEl.textContent = msg;
              errorEl.classList.add('visible');
            }
          }
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send message';
          }
          if (errorEl) {
            errorEl.textContent = 'Network error. Please check your connection and try again.';
            errorEl.classList.add('visible');
          }
        });
    });

    var resetBtn = document.querySelector('[data-reset-btn]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.style.display = '';
        success.style.display = 'none';
      });
    }
  }

  /* ── Nav Smooth Scroll ────────────────────────────────────────────── */

  function initNavScroll() {
    var links = document.querySelectorAll('.nav-link');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href[0] !== '#') return;
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    var ctaLinks = document.querySelectorAll('a[href^="#"]');
    ctaLinks.forEach(function (link) {
      if (!link.classList.contains('nav-link')) {
        link.addEventListener('click', function (e) {
          var href = link.getAttribute('href');
          if (!href || href[0] !== '#') return;
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    });
  }

  /* ── Boot ──────────────────────────────────────────────────────────── */

  function boot() {
    renderFooter();
    initNavScroll();
    initContactForm();
    initReveal();

    fetch('data/data.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load data');
        return res.json();
      })
      .then(function (data) {
        renderSkillGroups(data);
        renderEducation(data);
        renderExperience(data);
        renderProjects(data);
      })
      .catch(function (err) {
        console.error('Portfolio: data loading failed', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
