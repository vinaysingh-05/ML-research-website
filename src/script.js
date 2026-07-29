document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Keep --navbar-h / --subnav-h / --header-h in sync ----------
     The navbar can wrap onto a second line (so every link stays visible
     instead of being clipped off-screen), which changes its real height.
     We measure it and expose it as CSS variables so the reading progress
     bar, subnav, hero, and scroll offsets always line up correctly. */
  var navbarEl = document.getElementById('navbar');
  var subnavEl = document.getElementById('subnav');
  var root = document.documentElement;

  function syncHeaderHeights() {
    var navH = navbarEl ? navbarEl.getBoundingClientRect().height : 64;
    var subH = subnavEl ? subnavEl.getBoundingClientRect().height : 44;
    root.style.setProperty('--navbar-h', navH + 'px');
    root.style.setProperty('--subnav-h', subH + 'px');
    root.style.setProperty('--header-h', (navH + subH) + 'px');
  }

  syncHeaderHeights();
  window.addEventListener('resize', syncHeaderHeights);
  window.addEventListener('load', syncHeaderHeights);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(syncHeaderHeights);
    if (navbarEl) ro.observe(navbarEl);
    if (subnavEl) ro.observe(subnavEl);
  }

  /* ---------- Current date ---------- */
  var dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* ---------- Dark mode ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var storedTheme = localStorage.getItem('ml-paper-theme');
  if (storedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('ml-paper-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('ml-paper-theme', 'dark');
      }
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ---------- Reading progress bar ---------- */
  var progressBar = document.getElementById('readingProgress');
  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 500) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Scrollspy: highlight active nav-link + subnav-link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var subnavLinks = Array.prototype.slice.call(document.querySelectorAll('.subnav-link'));

  var sectionIds = navLinks.concat(subnavLinks)
    .map(function (l) { return l.getAttribute('href'); })
    .filter(function (h) { return h && h.charAt(0) === '#'; });

  var sections = sectionIds
    .map(function (id) { return document.querySelector(id); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + id);
    });
    subnavLinks.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + id);
    });
  }

  function updateScrollspy() {
    var headerH = navbarEl && subnavEl
      ? navbarEl.getBoundingClientRect().height + subnavEl.getBoundingClientRect().height
      : 140;
    var offset = headerH + 20;
    var current = sections.length ? sections[0].id : null;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top - offset <= 0) current = sections[i].id;
    }
    if (current) setActive(current);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateProgress();
        updateBackToTop();
        updateScrollspy();
        ticking = false;
      });
      ticking = true;
    }
  });

  updateProgress();
  updateBackToTop();
  updateScrollspy();

  /* ---------- Download PDF ---------- */
  var downloadBtn = document.getElementById('downloadPdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      window.print();
    });
  }

  /* ---------- Charts ---------- */
  if (typeof Chart !== 'undefined') {
    var mutedGrid = 'rgba(128,138,158,0.15)';

    var workflowCanvas = document.getElementById('workflowChart');
    if (workflowCanvas) {
      new Chart(workflowCanvas, {
        type: 'bar',
        data: {
          labels: ['Problem Def.', 'Data Collection', 'Data Cleaning', 'Feature Eng.', 'Model Selection', 'Training', 'Validation', 'Testing', 'Deployment', 'Monitoring'],
          datasets: [{
            label: 'Typical Effort Share (%)',
            data: [5, 15, 25, 20, 8, 12, 6, 4, 3, 2],
            backgroundColor: '#0056b3'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: mutedGrid }, beginAtZero: true }, x: { grid: { display: false } } }
        }
      });
    }

    var algoCanvas = document.getElementById('algorithmChart');
    if (algoCanvas) {
      new Chart(algoCanvas, {
        type: 'bar',
        data: {
          labels: ['Linear Reg.', 'Logistic Reg.', 'Decision Tree', 'Random Forest', 'SVM', 'KNN'],
          datasets: [{
            label: 'Relative Industry Adoption',
            data: [70, 82, 75, 90, 55, 60],
            backgroundColor: ['#0056b3', '#004085', '#1f9d55', '#0056b3', '#e0a800', '#d9534f']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: mutedGrid }, beginAtZero: true, max: 100 }, x: { grid: { display: false } } }
        }
      });
    }

    var complexityCanvas = document.getElementById('complexityChart');
    if (complexityCanvas) {
      new Chart(complexityCanvas, {
        type: 'line',
        data: {
          labels: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
          datasets: [
            {
              label: 'Training Accuracy',
              data: [55, 70, 85, 94, 99],
              borderColor: '#0056b3',
              backgroundColor: 'rgba(0,86,179,0.1)',
              tension: 0.35,
              fill: true
            },
            {
              label: 'Validation Accuracy',
              data: [50, 68, 84, 80, 62],
              borderColor: '#d9534f',
              backgroundColor: 'rgba(217,83,79,0.1)',
              borderDash: [6, 4],
              tension: 0.35,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'top' } },
          scales: { y: { grid: { color: mutedGrid }, beginAtZero: true, max: 100 }, x: { title: { display: true, text: 'Model Complexity' }, grid: { display: false } } }
        }
      });
    }

    var flyrankCanvas = document.getElementById('flyrankResultsChart');
    if (flyrankCanvas) {
      new Chart(flyrankCanvas, {
        type: 'bar',
        data: {
          labels: ['Spearman Correlation', 'Precision@20', '1 - Normalized MAE'],
          datasets: [
            {
              label: 'Baseline (Position-Only)',
              data: [0.42, 0.38, 0.55],
              backgroundColor: '#9aa6bb'
            },
            {
              label: 'Candidate Model (placeholder — replace with real results)',
              data: [0.68, 0.61, 0.74],
              backgroundColor: '#0056b3'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'top' } },
          scales: { y: { grid: { color: mutedGrid }, beginAtZero: true, max: 1 }, x: { grid: { display: false } } }
        }
      });
    }
  }
});