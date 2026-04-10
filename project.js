const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');

const projectHead = document.getElementById('projectHead');
const projectBanner = document.getElementById('projectBanner');
const projectOverview = document.getElementById('projectOverview');
const projectMeta = document.getElementById('projectMeta');
const projectGallery = document.getElementById('projectGallery');

const lightbox = document.getElementById('lightbox');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function clearLightbox() {
  if (!lightbox) return;
  lightbox.innerHTML = '';
}

function bindLightboxClose() {
  if (!lightbox) return;

  const closeBtn = lightbox.querySelector('.lightbox-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
}

function openLightboxImage(src, alt) {
  if (!lightbox) return;

  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close image">×</button>
    <img class="lightbox-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" />
  `;

  bindLightboxClose();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function openLightboxVideoFile(src) {
  if (!lightbox) return;

  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close video">×</button>
    <video class="lightbox-video" controls autoplay playsinline>
      <source src="${escapeHtml(src)}" type="video/mp4" />
    </video>
  `;

  bindLightboxClose();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function openLightboxVideoEmbed(src, title) {
  if (!lightbox) return;

  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close video">×</button>
    <iframe
      class="lightbox-embed"
      src="${escapeHtml(src)}"
      title="${escapeHtml(title || 'Video')}"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
    ></iframe>
  `;

  bindLightboxClose();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  clearLightbox();
  document.body.style.overflow = '';
}

function renderMissing() {
  document.title = 'Project Not Found | Few Portfolio';

  if (projectHead) {
    projectHead.innerHTML = `
      <p class="eyebrow">PROJECT</p>
      <h1>PROJECT NOT FOUND</h1>
    `;
  }

  if (projectOverview) {
    projectOverview.textContent = 'ไม่พบข้อมูลโปรเจกต์นี้';
  }

  if (projectMeta) {
    projectMeta.innerHTML = '';
  }

  if (projectBanner) {
    projectBanner.innerHTML = '';
  }

  if (projectGallery) {
    projectGallery.innerHTML = '';
  }
}

function renderBanner(project, plainTitle) {
  if (!projectBanner) return;

  if (project.mediaType === 'video' && project.video) {
    if (project.videoType === 'file') {
      projectBanner.innerHTML = `
        <video class="project-banner-video" controls autoplay muted loop playsinline>
          <source src="${escapeHtml(project.video)}" type="video/mp4" />
        </video>
      `;

      const bannerVideo = projectBanner.querySelector('video');
      if (bannerVideo) {
        bannerVideo.addEventListener('click', () => {
          openLightboxVideoFile(project.video);
        });
      }
      return;
    }

    if (project.videoType === 'embed') {
      projectBanner.innerHTML = `
        <div class="project-banner-embed-wrap">
          <iframe
            class="project-banner-embed"
            src="${escapeHtml(project.video)}"
            title="${escapeHtml(plainTitle)}"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
      return;
    }
  }

  projectBanner.innerHTML = `
    <img src="${escapeHtml(project.image || '')}" alt="${escapeHtml(plainTitle)}" />
  `;

  const bannerImg = projectBanner.querySelector('img');
  if (bannerImg) {
    bannerImg.style.cursor = 'pointer';
    bannerImg.addEventListener('click', () => {
      openLightboxImage(project.image, plainTitle);
    });
  }
}

function renderMeta(project) {
  if (!projectMeta) return;

  projectMeta.innerHTML = `
    <div class="meta-item">
      <span>Client</span>
      <strong>${escapeHtml(project.client || '-')}</strong>
    </div>
    <div class="meta-item">
      <span>Year</span>
      <strong>${escapeHtml(project.year || '-')}</strong>
    </div>
    <div class="meta-item">
      <span>Role</span>
      <strong>${escapeHtml(project.role || '-')}</strong>
    </div>
    <div class="meta-item">
      <span>Category</span>
      <strong>${escapeHtml(project.category || '-')}</strong>
    </div>
  `;
}

function renderGallery(gallery, title) {
  if (!projectGallery) return;

  projectGallery.innerHTML = gallery.map((item) => {
    const type = item.type || 'image';
    const size = item.size || 'square';

    if (type === 'video-file') {
      return `
        <div class="gallery-item ${escapeHtml(size)} is-video" data-video-file="${escapeHtml(item.src)}" data-title="${escapeHtml(title)}">
          <video class="gallery-video" muted loop playsinline preload="metadata">
            <source src="${escapeHtml(item.src)}" type="video/mp4" />
          </video>
          <div class="video-overlay">
            <span class="video-badge">VIDEO</span>
          </div>
        </div>
      `;
    }

    if (type === 'video-embed') {
      return `
        <div class="gallery-item ${escapeHtml(size)} is-video is-embed" data-video-embed="${escapeHtml(item.src)}" data-title="${escapeHtml(title)}">
          <iframe
            class="gallery-video-embed"
            src="${escapeHtml(item.src)}"
            title="${escapeHtml(title)}"
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
          ></iframe>
          <div class="video-overlay">
            <span class="video-badge">VIDEO</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="gallery-item ${escapeHtml(size)}" data-image="${escapeHtml(item.src)}" data-title="${escapeHtml(title)}">
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(title)}" />
      </div>
    `;
  }).join('');

  const imageItems = projectGallery.querySelectorAll('.gallery-item[data-image]');
  imageItems.forEach((item) => {
    item.addEventListener('click', () => {
      openLightboxImage(item.dataset.image, item.dataset.title);
    });
  });

  const fileVideoItems = projectGallery.querySelectorAll('.gallery-item[data-video-file]');
  fileVideoItems.forEach((item) => {
    const video = item.querySelector('video');
    if (video) {
      video.play().catch(() => {});
    }

    item.addEventListener('click', () => {
      openLightboxVideoFile(item.dataset.videoFile);
    });
  });

  const embedVideoItems = projectGallery.querySelectorAll('.gallery-item[data-video-embed]');
  embedVideoItems.forEach((item) => {
    item.addEventListener('click', () => {
      openLightboxVideoEmbed(item.dataset.videoEmbed, item.dataset.title);
    });
  });
}

function getFallbackGallery(project) {
  if (project.mediaType === 'video' && project.video) {
    if (project.videoType === 'embed') {
      return [
        { type: 'video-embed', src: project.video, size: 'wide' }
      ];
    }

    return [
      { type: 'video-file', src: project.video, size: 'wide' }
    ];
  }

  return [
    { type: 'image', src: project.image, size: 'square' }
  ];
}

async function loadProject() {
  try {
    const response = await fetch('./projects.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const projects = await response.json();
    const project = Array.isArray(projects)
      ? projects.find((item) => item.id === projectId)
      : null;

    if (!project) {
      renderMissing();
      return;
    }

    const plainTitle = String(project.title || '').replace(/\n/g, ' ');
    document.title = `${plainTitle} | Few Portfolio`;

    if (projectHead) {
      projectHead.innerHTML = `
        <p class="eyebrow">${escapeHtml(project.type || 'PROJECT')}</p>
        <h1>${escapeHtml(project.title || '').replace(/\n/g, '<br>')}</h1>
      `;
    }

    renderBanner(project, plainTitle);

    if (projectOverview) {
      projectOverview.textContent = project.overview || '';
    }

    renderMeta(project);

    const gallery = Array.isArray(project.gallery) && project.gallery.length
      ? project.gallery
      : getFallbackGallery(project);

    renderGallery(gallery, plainTitle);
  } catch (error) {
    console.error(error);
    renderMissing();
  }
}

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
  }
});

loadProject();