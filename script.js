/* ==========================================================================
   Machine Learning vs Rules — Research Paper Interactivity
   ========================================================================== */

(() => {
  'use strict';

  /* ---------------- Current date in hero ---------------- */
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /* ---------------- Theme toggle (light / dark) ---------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const THEME_KEY = 'ml-paper-theme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /* ---------------- Mobile nav toggle ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Navbar shadow + reading progress on scroll ---------------- */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('readingProgress');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + '%';
    if (navbar) navbar.classList.toggle('scrolled', scrollTop > 8);
    if (backToTop) backToTop.classList.toggle('visible', scrollTop > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Active nav link highlighting ---------------- */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------------- Reveal-on-scroll animations ---------------- */
  const revealSelectors = [
    '.intro-card', '.algorithm-card', '.algo-detail', '.concept-card',
    '.task-card', '.case-component', '.workflow-step', '.takeaway',
    '.solution', '.pitfall', '.abstract-box', '.info-box',
    '.framework-column', '.overfitting-visual', '.section-chart',
    '.comparison-table-wrapper', '.decision-tree-final',
  ];
  const revealEls = document.querySelectorAll(revealSelectors.join(','));

  if ('IntersectionObserver' in window) {
    revealEls.forEach((el) => el.classList.add('reveal'));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- Download PDF button ---------------- */
  const downloadBtn = document.getElementById('downloadPdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /* ---------------- Chart.js visualizations ---------------- */
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    const isDark = () => root.getAttribute('data-theme') === 'dark';
    const gridColor = () => (isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)');
    const textColor = () => (isDark() ? '#a7b0c2' : '#565f70');

    Chart.defaults.font.family = "'Inter', sans-serif";

    /* --- Workflow effort distribution --- */
    const workflowCanvas = document.getElementById('workflowChart');
    if (workflowCanvas) {
      new Chart(workflowCanvas, {
        type: 'bar',
        data: {
          labels: [
            'Problem Def.', 'Data Collection', 'Data Cleaning', 'Feature Eng.',
            'Model Selection', 'Training', 'Validation', 'Testing',
            'Deployment', 'Monitoring',
          ],
          datasets: [{
            label: 'Typical effort share (%)',
            data: [5, 15, 25, 20, 8, 12, 6, 4, 3, 2],
            backgroundColor: '#0056b3',
            borderRadius: 4,
            maxBarThickness: 36,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor(), maxRotation: 45, minRotation: 45 }, grid: { display: false } },
            y: { ticks: { color: textColor(), callback: (v) => v + '%' }, grid: { color: gridColor() }, beginAtZero: true },
          },
        },
      });
    }

    /* --- Algorithm popularity --- */
    const algoCanvas = document.getElementById('algorithmChart');
    if (algoCanvas) {
      new Chart(algoCanvas, {
        type: 'bar',
        data: {
          labels: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'Random Forest', 'SVM', 'KNN'],
          datasets: [{
            label: 'Relative usage in industry surveys',
            data: [72, 78, 68, 85, 55, 48],
            backgroundColor: ['#0056b3', '#3d7fc9', '#1f8a4c', '#1f8a4c', '#b8791a', '#c0432f'],
            borderRadius: 4,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor(), callback: (v) => v + '%' }, grid: { color: gridColor() }, beginAtZero: true, max: 100 },
            y: { ticks: { color: textColor() }, grid: { display: false } },
          },
        },
      });
    }

    /* --- Complexity vs accuracy --- */
    const complexityCanvas = document.getElementById('complexityChart');
    if (complexityCanvas) {
      const complexity = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      new Chart(complexityCanvas, {
        type: 'line',
        data: {
          labels: complexity.map((c) => 'Level ' + c),
          datasets: [
            {
              label: 'Training accuracy',
              data: [55, 63, 71, 78, 85, 90, 94, 97, 99, 100],
              borderColor: '#0056b3',
              backgroundColor: 'rgba(0,86,179,0.12)',
              tension: 0.35,
              fill: true,
            },
            {
              label: 'Validation accuracy',
              data: [50, 60, 68, 76, 82, 86, 85, 80, 72, 62],
              borderColor: '#c0432f',
              backgroundColor: 'rgba(192,67,47,0.08)',
              borderDash: [6, 4],
              tension: 0.35,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: textColor() } } },
          scales: {
            x: { title: { display: true, text: 'Model complexity', color: textColor() }, ticks: { color: textColor() }, grid: { display: false } },
            y: { title: { display: true, text: 'Accuracy (%)', color: textColor() }, ticks: { color: textColor() }, grid: { color: gridColor() }, min: 40, max: 100 },
          },
        },
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
  } else {
    initCharts();
  }
})();
