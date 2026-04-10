const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main .section');
const heroBg = document.querySelector('.hero-bg img');
const projectGrid = document.getElementById('projectGrid');
const projectFilter = document.getElementById('projectFilter');
const isWorksPage = window.location.pathname.includes('works.html');

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
        link.classList.toggle('active', href === 'works.html' || href === '#projects');
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
    typeof item.title === 'string' &&
    typeof item.type === 'string' &&
    typeof item.category === 'string' &&
    typeof item.image === 'string'
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

function createProjectCard(project) {
  const titleHtml = project.titleHtml
    ? project.titleHtml
    : escapeHtml(project.title).replace(/\n/g, '<br>');

  const link = project.link ? project.link : '#';

  return `
    <article class="project-card reveal" data-category="${escapeHtml(project.category)}">
      <a href="${escapeHtml(link)}" aria-label="${escapeHtml(project.title)}">
        <div class="project-image">
          <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" />
          <div class="project-overlay">
            <p class="project-type">${escapeHtml(project.type)}</p>
            <h3>${titleHtml}</h3>
          </div>
        </div>
      </a>
    </article>
  `;
}

function renderProjects(projects) {
  if (!projectGrid) return;

  if (!projects.length) {
    projectGrid.innerHTML = '<div class="project-empty">No projects found.</div>';
    return;
  }

  projectGrid.innerHTML = projects.map(createProjectCard).join('');
  setupReveal(projectGrid.querySelectorAll('.reveal'));
}

function renderFilters(projects) {
  if (!projectFilter) return;

  const categories = [...new Set(projects.map((project) => project.category))];
  const allFilters = ['all', ...categories];

  projectFilter.innerHTML = allFilters.map((category, index) => `
    <button class="filter-btn ${index === 0 ? 'active' : ''}" data-filter="${escapeHtml(category)}">
      ${escapeHtml(getCategoryLabel(category))}
    </button>
  `).join('');

  const filterButtons = projectFilter.querySelectorAll('.filter-btn');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const cards = projectGrid.querySelectorAll('.project-card');
      cards.forEach((card) => {
        const matched = selected === 'all' || card.dataset.category === selected;
        card.style.display = matched ? 'block' : 'none';
      });
    });
  });
}

function setupReveal(elements = document.querySelectorAll('.reveal')) {
  elements.forEach((item) => revealObserver.observe(item));
}

async function loadProjects() {
  try {
    const response = await fetch('./projects.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawData = await response.json();
    let projects = normalizeProjects(rawData);

    if (!isWorksPage) {
      projects = projects.filter((project) => project.featured === true);
    }

    renderFilters(projects);
    renderProjects(projects);
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