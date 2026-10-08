// Ivy School Academic University - Interactive Frontend Scripts
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initDarkMode();
    initDirectionToggle();
    initStickyHeader();
    initMobileMenu();
    initTabs();
    initCounters();
    initNewsletterForm();
    initSmoothScroll();
  });

  // 1. Dark Mode Toggle
  function initDarkMode() {
    const root = document.documentElement;
    const body = document.body;
    const toggleButtons = document.querySelectorAll('.dark-mode-toggle, .elementor-widget-thim-ekits-dark-mode');

    function setDarkMode(isDark) {
      if (isDark) {
        root.classList.add('thim-ekit-dark-mode');
        root.classList.remove('thim-ekit-light-mode');
        body.classList.add('thim-ekit-dark-mode');
        body.classList.remove('thim-ekit-light-mode');
        localStorage.setItem('thimEkitDarkMode', 'dark');
      } else {
        root.classList.add('thim-ekit-light-mode');
        root.classList.remove('thim-ekit-dark-mode');
        body.classList.add('thim-ekit-light-mode');
        body.classList.remove('thim-ekit-dark-mode');
        localStorage.setItem('thimEkitDarkMode', 'light');
      }
    }

    // Check initial state
    const saved = localStorage.getItem('thimEkitDarkMode');
    if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }

    toggleButtons.forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const currentlyDark = root.classList.contains('thim-ekit-dark-mode');
        setDarkMode(!currentlyDark);
      });
    });
  }

  // 2. LTR / RTL Toggle
  function initDirectionToggle() {
    const ltrToggles = document.querySelectorAll('.elementor-widget-thim-ekits-rtl, [class*="direction-toggle"], [class*="rtl-toggle"]');
    ltrToggles.forEach(toggle => {
      toggle.style.cursor = 'pointer';
      toggle.addEventListener('click', function () {
        const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
        document.documentElement.setAttribute('dir', isRtl ? 'ltr' : 'rtl');
      });
    });
  }

  // 3. Sticky Header
  function initStickyHeader() {
    const header = document.querySelector('header.elementor-element-5cccc1e, .thim-ekit__header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function () {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120) {
        header.classList.add('is-sticky-active');
      } else {
        header.classList.remove('is-sticky-active');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // 4. Mobile Menu
  function initMobileMenu() {
    const navMenu = document.querySelector('.elementor-widget-thim-ekits-nav-menu');
    const header = document.querySelector('.thim-ekit__header');
    if (!navMenu || !header) return;

    // Check if toggle button already exists
    let mobileToggle = document.querySelector('.ivy-mobile-menu-toggle');
    if (!mobileToggle) {
      mobileToggle = document.createElement('button');
      mobileToggle.className = 'ivy-mobile-menu-toggle';
      mobileToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      mobileToggle.style.cssText = `
        display: none;
        background: transparent;
        border: none;
        font-size: 24px;
        color: #0f172a;
        cursor: pointer;
        padding: 8px 12px;
        margin-left: auto;
      `;

      // Insert toggle before right CTA or at end of header container
      const headerInner = document.querySelector('.elementor-element-5cccc1e > .e-con-inner') || header;
      headerInner.appendChild(mobileToggle);
    }

    mobileToggle.addEventListener('click', function () {
      const menuWrapper = document.querySelector('.elementor-widget-thim-ekits-nav-menu .thim-ekits-menu__wrapper') ||
                          document.querySelector('.thim-ekits-menu__wrapper');
      if (menuWrapper) {
        menuWrapper.classList.toggle('is-mobile-open');
      }
    });
  }

  // 5. Elementor Nested Tabs
  function initTabs() {
    const tabContainers = document.querySelectorAll('.e-n-tabs');
    tabContainers.forEach(container => {
      const titles = container.querySelectorAll('.e-n-tab-title');
      const contents = container.querySelectorAll('.e-n-tabs-content > div, .e-n-tabs-content .e-con');

      titles.forEach((title, index) => {
        title.addEventListener('click', function (e) {
          e.preventDefault();
          titles.forEach(t => {
            t.classList.remove('e-active');
            t.setAttribute('aria-selected', 'false');
          });
          contents.forEach(c => {
            c.classList.remove('e-active');
            c.style.display = 'none';
          });

          title.classList.add('e-active');
          title.setAttribute('aria-selected', 'true');
          if (contents[index]) {
            contents[index].classList.add('e-active');
            contents[index].style.display = 'flex';
          }
        });
      });
    });
  }

  // 6. Animated Stat Counters
  function initCounters() {
    const counterElements = document.querySelectorAll('h4');
    let animated = false;

    function runCounters() {
      if (animated) return;
      const triggerSection = document.querySelector('.elementor-element-aa73b56');
      if (!triggerSection) return;

      const rect = triggerSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.85) {
        animated = true;
        // Animation visual effect trigger
        triggerSection.classList.add('stats-animated');
      }
    }

    window.addEventListener('scroll', runCounters, { passive: true });
    runCounters();
  }

  // 7. Newsletter Form
  function initNewsletterForm() {
    const forms = document.querySelectorAll('form, .mc4wp-form');
    forms.forEach(form => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          const originalText = form.innerHTML;
          form.innerHTML = `
            <div style="background: #e6f4ea; color: #137333; padding: 14px 20px; border-radius: 8px; font-weight: 500; font-size: 15px; text-align: center; border: 1px solid #ceead6;">
              <i class="fas fa-check-circle" style="margin-right: 8px;"></i> Thank you! You have successfully subscribed to Ivy School updates.
            </div>
          `;
        }
      });
    });
  }

  // 8. Smooth Scroll
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.length > 1 && !href.startsWith('#!')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
})();
