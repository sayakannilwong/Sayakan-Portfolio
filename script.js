const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main .section');
const heroBg = document.querySelector('.hero-bg img');

const projectGrid = document.getElementById('projectGrid');
const projectFilter = document.getElementById('projectFilter');
const projectFooter = document.getElementById('projectFooter');
const sortToggleBtn = document.getElementById('sortToggleBtn');
const sortIcon = document.getElementById('sortIcon');

const isWorksPage = window.location.pathname.includes('works.html');

let allProjects = [];
let currentFilter = 'all';
let currentSortOrder = 'desc'; // desc = ใหม่สุดก่อน, asc = เก่าสุดก่อน
let disableHoverRevealGlobally = false;

window.addEventListener('scroll', () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.14
});

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const id = entry.target.getAttribute('id');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');

      if (isWorksPage) {
        link.classList.toggle('active', href === 'works.html');
      } else {
        link.classList.toggle('active', href === `#${id}`);
      }
    });
  });
}, {
  rootMargin: '-45% 0px -45% 0px',
  threshold: 0
});

sections.forEach((section) => spyObserver.observe(section));

function setupReveal(elements = document.querySelectorAll('.reveal')) {
  elements.forEach((item) => revealObserver.observe(item));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeProjects(data) {
  if (!Array.isArray(data)) return [];

  return data.filter((item) =>
    item &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.type === 'string' &&
    typeof item.category === 'string'
  );
}

function getCategoryLabel(category) {
  const labels = {
    all: 'All',
    social: 'Social',
    motion: 'Motion',
    exhibition: 'Exhibition'
  };

  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

function getProjectLink(project) {
  if (project.link && typeof project.link === 'string') {
    return project.link;
  }
  return `project.html?id=${project.id}`;
}

function getProjectMedia(project) {
  const isVideo = project.mediaType === 'video' && typeof project.video === 'string' && project.video.trim() !== '';

  if (!isVideo) {
    return `
      <img src="${escapeHtml(project.image || '')}" alt="${escapeHtml(project.title)}" />
    `;
  }

  if (project.videoType === 'file') {
    return `
      <video class="project-video" autoplay muted loop playsinline preload="metadata">
        <source src="${escapeHtml(project.video)}" type="video/mp4" />
      </video>
    `;
  }

  if (project.videoType === 'embed') {
    return `
      <iframe
        class="project-video-embed"
        src="${escapeHtml(project.video)}"
        title="${escapeHtml(project.title)}"
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
      ></iframe>
    `;
  }

  return `
    <img src="${escapeHtml(project.image || '')}" alt="${escapeHtml(project.title)}" />
  `;
}

function createProjectCard(project) {
  const titleHtml = project.titleHtml
    ? project.titleHtml
    : escapeHtml(project.title).replace(/\n/g, '<br>');

  const projectNo = Number.isFinite(Number(project.no))
    ? String(project.no).padStart(2, '0')
    : '--';

  return `
    <article class="project-card reveal" data-category="${escapeHtml(project.category)}">
      <a href="${escapeHtml(getProjectLink(project))}" aria-label="${escapeHtml(project.title)}">
        <div class="project-image">
          ${getProjectMedia(project)}
          <div class="project-overlay">
            <p class="project-type">${projectNo} / ${escapeHtml(project.type)}</p>
            <h3>${titleHtml}</h3>
          </div>
        </div>
      </a>
    </article>
  `;
}

function sortProjects(projects, order = 'desc') {
  return [...projects].sort((a, b) => {
    const noA = Number.isFinite(Number(a.no)) ? Number(a.no) : -999999;
    const noB = Number.isFinite(Number(b.no)) ? Number(b.no) : -999999;

    return order === 'asc' ? noA - noB : noB - noA;
  });
}

function getVisibleProjects() {
  let visible = [...allProjects];

  if (!isWorksPage) {
    visible = visible.filter((project) => project.featured === true);
  }

  if (currentFilter !== 'all') {
    visible = visible.filter((project) => project.category === currentFilter);
  }

  visible = sortProjects(visible, currentSortOrder);

  return visible;
}

function renderProjects(projects) {
  if (!projectGrid) return;

  if (!projects.length) {
    projectGrid.innerHTML = '<div class="project-empty">No projects found.</div>';
    return;
  }

  projectGrid.innerHTML = projects.map(createProjectCard).join('');
  setupReveal(projectGrid.querySelectorAll('.reveal'));

  const videos = projectGrid.querySelectorAll('video');
  videos.forEach((video) => {
    video.play().catch(() => {});
  });
}

function updateProjectView() {
  const visibleProjects = getVisibleProjects();
  renderProjects(visibleProjects);
}

function renderFilters(projects) {
  if (!projectFilter) return;

  const categories = [...new Set(projects.map((project) => project.category))];
  const allFilters = ['all', ...categories];

  projectFilter.innerHTML = allFilters.map((category) => `
    <button class="filter-btn ${category === currentFilter ? 'active' : ''}" data-filter="${escapeHtml(category)}">
      ${escapeHtml(getCategoryLabel(category))}
    </button>
  `).join('');

  const filterButtons = projectFilter.querySelectorAll('.filter-btn');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      updateProjectView();
    });
  });
}

function setupSortToggle() {
  if (!sortToggleBtn) return;

  updateSortButtonUI();

  sortToggleBtn.addEventListener('click', () => {
    currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
    updateSortButtonUI();
    updateProjectView();
  });
}

function updateSortButtonUI() {
  if (!sortToggleBtn || !sortIcon) return;

  const isNewest = currentSortOrder === 'desc';

  sortToggleBtn.dataset.order = currentSortOrder;
  sortToggleBtn.setAttribute('aria-label', isNewest ? 'Sort by newest' : 'Sort by oldest');
  sortToggleBtn.setAttribute('title', isNewest ? 'Sort by newest' : 'Sort by oldest');
  sortIcon.textContent = isNewest ? '↓' : '↑';
}

async function loadProjects() {
  try {
    const response = await fetch('./projects.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawData = await response.json();
    allProjects = normalizeProjects(rawData);

    disableHoverRevealGlobally = allProjects.some(
      (project) => project.hoverReveal === false
    );

    if (disableHoverRevealGlobally) {
      document.body.classList.add('disable-hover-reveal');
    } else {
      document.body.classList.remove('disable-hover-reveal');
    }

    if (!isWorksPage) {
      if (projectFooter) {
        projectFooter.style.display = 'flex';
      }
    } else {
      if (projectFooter) {
        projectFooter.style.display = 'none';
      }
    }

    renderFilters(allProjects);
    setupSortToggle();
    updateProjectView();
  } catch (error) {
    console.error('Failed to load projects:', error);

    if (projectGrid) {
      projectGrid.innerHTML = '<div class="project-error">Failed to load projects.json</div>';
    }
  }
}

window.addEventListener('mousemove', (event) => {
  if (!heroBg || window.innerWidth < 900) return;

  const x = (event.clientX / window.innerWidth - 0.5) * 12;
  const y = (event.clientY / window.innerHeight - 0.5) * 12;
  heroBg.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
});

setupReveal();
loadProjects();