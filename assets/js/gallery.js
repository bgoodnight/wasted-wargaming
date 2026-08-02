const galleryItems = Array.isArray(window.WASTED_WARGAMING_GALLERY)
  ? window.WASTED_WARGAMING_GALLERY
  : [];

const galleryGrid = document.querySelector('[data-gallery-grid]');
const galleryStage = document.querySelector('[data-gallery-stage]');
const galleryEmpty = document.querySelector('[data-gallery-empty]');
const galleryCount = document.querySelector('[data-gallery-count]');
const galleryHeroImage = document.querySelector('[data-gallery-hero-image]');
const galleryPrimaryFilters = document.querySelector('[data-gallery-primary-filters]');
const gallerySubfilters = document.querySelector('[data-gallery-subfilters]');
const featureImages = [...document.querySelectorAll('[data-feature-image]')];
const featureTags = document.querySelector('[data-feature-tags]');
const featureCredit = document.querySelector('[data-feature-credit]');
const featureNumber = document.querySelector('[data-feature-number]');
const featureOpen = document.querySelector('[data-feature-open]');
const previousButton = document.querySelector('[data-gallery-previous]');
const nextButton = document.querySelector('[data-gallery-next]');
const lightbox = document.querySelector('[data-gallery-lightbox]');
const lightboxViewport = document.querySelector('[data-lightbox-viewport]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxMeta = document.querySelector('[data-lightbox-meta]');
const lightboxTags = document.querySelector('[data-lightbox-tags]');
const lightboxCredit = document.querySelector('[data-lightbox-credit]');
const lightboxClose = document.querySelector('[data-lightbox-close]');
const lightboxPrevious = document.querySelector('[data-lightbox-previous]');
const lightboxNext = document.querySelector('[data-lightbox-next]');

let taxonomyTags = new Map();
let filterButtons = [];
let primaryFilterButtons = [];
let secondaryFilterButtons = [];
let clearFilterButton = null;

const activePrimaryFilters = new Set(['featured']);
let activeSecondaryFilter = null;
let filteredItems = galleryItems.filter((item) => item.tags.includes('featured'));
let lastViewedPhotoId = filteredItems[0]?.id || null;
let featuredIndex = 0;
let lightboxIndex = 0;
let activeFeatureLayer = 0;
let hasRenderedFeature = false;
let featureTimer;
let scrollResumeTimer;
let stageInView = true;
let stageIsActive = false;
let pageIsScrolling = false;

const featureDelay = 9000;
const galleryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function itemMeta(item) {
  return `${item.type} // ${item.faction}`;
}

function formatTag(tag) {
  const taxonomyLabel = taxonomyTags.get(tag)?.label;
  if (taxonomyLabel) return taxonomyLabel;
  return tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createFilterButton(tag, level) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.galleryFilter = tag.id;
  button.dataset.filterLevel = level;
  button.setAttribute('aria-pressed', String(level === 'primary' && tag.id === 'featured'));
  button.textContent = tag.label || formatTag(tag.id);
  return button;
}

function refreshFilterButtonReferences() {
  filterButtons = [...document.querySelectorAll('[data-gallery-filter]')];
  primaryFilterButtons = filterButtons.filter((button) => button.dataset.filterLevel === 'primary');
  secondaryFilterButtons = filterButtons.filter((button) => button.dataset.filterLevel === 'secondary');
  clearFilterButton = filterButtons.find((button) => button.dataset.filterLevel === 'clear') || null;
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.galleryFilter, button.dataset.filterLevel));
  });
}

function buildGalleryFilters(taxonomy) {
  taxonomyTags = new Map((taxonomy?.tags || []).map((tag) => [tag.id, tag]));
  const representedTags = new Set(galleryItems.flatMap((item) => item.tags || []));
  const enabledTags = [...taxonomyTags.values()]
    .filter((tag) => tag.status === 'active' && tag.filter?.enabled)
    .sort((left, right) => (left.filter.order || 0) - (right.filter.order || 0));

  const primaryTags = enabledTags.filter((tag) => tag.filter.group === 'primary');
  const factionTags = enabledTags.filter((tag) => tag.facet === 'faction' && representedTags.has(tag.id));

  if (!primaryTags.length) {
    ['featured', 'event-photos', 'minis'].forEach((id, order) => primaryTags.push({ id, label: formatTag(id), filter: { order } }));
  }

  const primaryButtons = primaryTags.map((tag) => createFilterButton(tag, 'primary'));
  const clearButton = document.createElement('button');
  clearButton.className = 'gallery-filter-clear';
  clearButton.type = 'button';
  clearButton.dataset.galleryFilter = 'all';
  clearButton.dataset.filterLevel = 'clear';
  clearButton.setAttribute('aria-pressed', 'false');
  clearButton.setAttribute('aria-label', 'Clear all gallery filters and show all photos');
  clearButton.append('All ');
  const clearMark = document.createElement('span');
  clearMark.setAttribute('aria-hidden', 'true');
  clearMark.textContent = '×';
  clearButton.append(clearMark);
  galleryPrimaryFilters?.replaceChildren(...primaryButtons, clearButton);

  const subfilterLabel = gallerySubfilters?.querySelector('span');
  const factionButtons = factionTags.map((tag) => createFilterButton(tag, 'secondary'));
  gallerySubfilters?.replaceChildren(...(subfilterLabel ? [subfilterLabel] : []), ...factionButtons);
  refreshFilterButtonReferences();
}

async function loadGalleryTaxonomy() {
  try {
    const response = await fetch('assets/data/gallery-taxonomy.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const taxonomy = await response.json();
    if (!Array.isArray(taxonomy.tags)) throw new Error('Missing tags array');
    return taxonomy;
  } catch (error) {
    console.warn('Gallery taxonomy could not be loaded; using readable fallback filters and labels.', error);
    const representedFactions = [...new Set(galleryItems.map((item) => {
      const factionId = item.faction?.toLowerCase().replaceAll("'", '').replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return item.tags?.find((tag) => tag === factionId);
    }).filter(Boolean))];
    return {
      tags: [
        ...['featured', 'event-photos', 'minis'].map((id, order) => ({ id, label: formatTag(id), facet: id === 'featured' ? 'editorial' : 'content-type', status: 'active', filter: { enabled: true, group: 'primary', order } })),
        ...representedFactions.map((id, order) => ({ id, label: formatTag(id), facet: 'faction', status: 'active', filter: { enabled: true, group: 'faction', order } }))
      ]
    };
  }
}

function activeChannelLabel() {
  const tags = [...activePrimaryFilters];
  if (activeSecondaryFilter) tags.push(activeSecondaryFilter);
  return tags.length ? tags.map(formatTag).join(' // ') : 'All';
}

function renderImageTags(container, tags) {
  if (!container) return;
  const badges = tags.map((tag) => {
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.dataset.tag = tag;
    badge.dataset.imageTag = tag;
    const isActive = activePrimaryFilters.has(tag) || activeSecondaryFilter === tag;
    badge.dataset.filterActive = String(isActive);
    badge.setAttribute('aria-pressed', String(isActive));
    badge.setAttribute('aria-label', isActive
      ? `Remove ${formatTag(tag)} from the gallery filters`
      : `Add ${formatTag(tag)} to the gallery filters`);
    badge.append(formatTag(tag));
    if (isActive) {
      const removeMark = document.createElement('span');
      removeMark.className = 'gallery-tag-remove-mark';
      removeMark.setAttribute('aria-hidden', 'true');
      removeMark.textContent = '×';
      badge.append(removeMark);
    }
    return badge;
  });
  container.replaceChildren(...badges);
}

function itemLabel(item) {
  return `${item.type} photo featuring ${item.faction}`;
}

function stopFeatureRotation() {
  window.clearTimeout(featureTimer);
}

function scheduleFeatureRotation() {
  stopFeatureRotation();
  if (galleryReducedMotion.matches || filteredItems.length < 2 || !stageInView || stageIsActive || pageIsScrolling || document.hidden || lightbox?.open) return;
  featureTimer = window.setTimeout(() => updateFeature(featuredIndex + 1), featureDelay);
}

function displayFeatureImage(item, immediate) {
  const outgoing = featureImages[activeFeatureLayer];
  const incomingLayer = immediate ? activeFeatureLayer : (activeFeatureLayer + 1) % featureImages.length;
  const incoming = featureImages[incomingLayer];

  incoming.src = item.src;
  incoming.width = item.width;
  incoming.height = item.height;
  incoming.style.objectPosition = item.homePosition || '50% 50%';

  if (immediate) {
    featureImages.forEach((image, index) => image.classList.toggle('is-active', index === incomingLayer));
  } else {
    const revealIncoming = () => window.requestAnimationFrame(() => {
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
    });
    if (incoming.complete) revealIncoming();
    else incoming.addEventListener('load', revealIncoming, { once: true });
  }
  activeFeatureLayer = incomingLayer;
}

function selectFeaturedHero() {
  if (!galleryHeroImage) return;
  const featuredItems = galleryItems.filter((item) => item.tags.includes('featured'));
  if (!featuredItems.length) return;

  let previousId = null;
  try {
    previousId = window.sessionStorage.getItem('wasted-gallery-hero');
  } catch (error) {
    previousId = null;
  }
  const choices = featuredItems.filter((item) => item.id !== previousId);
  const pool = choices.length ? choices : featuredItems;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  galleryHeroImage.style.backgroundImage = `url("${selected.src}")`;
  galleryHeroImage.style.backgroundPosition = selected.homePosition || '50% 50%';
  try {
    window.sessionStorage.setItem('wasted-gallery-hero', selected.id);
  } catch (error) {
    // The random backdrop still works when browser storage is unavailable.
  }
}

function fitLightboxImage() {
  if (!lightboxViewport || !filteredItems.length) return;
  const item = filteredItems[lightboxIndex];
  const availableWidth = lightboxViewport.clientWidth;
  const availableHeight = lightboxViewport.clientHeight;
  if (!availableWidth || !availableHeight) return;

  const scale = Math.min(availableWidth / item.width, availableHeight / item.height);
  lightboxImage.style.width = `${Math.round(item.width * scale)}px`;
  lightboxImage.style.height = `${Math.round(item.height * scale)}px`;
}

function setLightboxZoom(isZoomed, focalPoint) {
  if (!lightboxViewport) return;
  lightboxViewport.classList.toggle('is-zoomed', isZoomed);
  lightboxViewport.setAttribute('aria-pressed', String(isZoomed));
  lightboxViewport.setAttribute('aria-label', isZoomed
    ? 'Fit image to screen'
    : 'Zoom image to original resolution');

  if (!isZoomed) {
    lightboxViewport.scrollTo({ top: 0, left: 0 });
    window.requestAnimationFrame(fitLightboxImage);
    return;
  }

  const item = filteredItems[lightboxIndex];
  lightboxImage.style.width = `${item.width}px`;
  lightboxImage.style.height = `${item.height}px`;

  window.requestAnimationFrame(() => {
    const x = focalPoint?.x ?? 0.5;
    const y = focalPoint?.y ?? 0.5;
    lightboxViewport.scrollLeft = Math.max(0, (lightboxImage.scrollWidth * x) - (lightboxViewport.clientWidth / 2));
    lightboxViewport.scrollTop = Math.max(0, (lightboxImage.scrollHeight * y) - (lightboxViewport.clientHeight / 2));
  });
}

function updateFeature(index) {
  if (!filteredItems.length) return;
  featuredIndex = (index + filteredItems.length) % filteredItems.length;
  const item = filteredItems[featuredIndex];
  lastViewedPhotoId = item.id;
  displayFeatureImage(item, !hasRenderedFeature);
  hasRenderedFeature = true;
  renderImageTags(featureTags, item.tags);
  window.WASTED_WARGAMING_CONTRIBUTOR_UI?.renderContributorCredits(featureCredit, item, { iconLimit: 3 });
  featureNumber.textContent = `${activeChannelLabel()} // ${featuredIndex + 1} of ${filteredItems.length}`;
  galleryStage.setAttribute('aria-label', `${activeChannelLabel()} gallery image ${featuredIndex + 1} of ${filteredItems.length}`);
  featureOpen.setAttribute('aria-label', `Open ${activeChannelLabel()} image ${featuredIndex + 1} of ${filteredItems.length}, ${itemLabel(item)}, full screen`);
  scheduleFeatureRotation();
}

function buildCard(item, index) {
  const card = document.createElement('button');
  card.className = `gallery-card gallery-card--${index % 4}`;
  card.type = 'button';
  card.setAttribute('aria-label', `Open ${itemLabel(item)} full screen`);

  const image = document.createElement('img');
  image.src = item.src;
  image.width = item.width;
  image.height = item.height;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';

  const caption = document.createElement('span');
  caption.className = 'gallery-card__caption';

  const meta = document.createElement('small');
  meta.textContent = itemMeta(item);
  const credit = document.createElement('span');
  credit.className = 'gallery-card__credit';
  const creditRecord = item.credits?.[0];
  const contributor = window.WASTED_WARGAMING_CONTRIBUTORS?.[creditRecord?.contributorId];
  credit.textContent = contributor ? `${creditRecord.role || 'Contributor'} by ${contributor.name}` : '';

  caption.append(meta, credit);
  card.append(image, caption);
  card.addEventListener('click', () => openLightbox(index));
  return card;
}

function renderGrid(preferredPhotoId = lastViewedPhotoId) {
  galleryGrid.replaceChildren(...filteredItems.map(buildCard));
  const hasItems = filteredItems.length > 0;
  galleryStage.hidden = !hasItems;
  galleryGrid.hidden = !hasItems;
  galleryEmpty.hidden = hasItems;
  galleryCount.textContent = hasItems
    ? `${filteredItems.length} ${filteredItems.length === 1 ? 'image' : 'images'} on this channel.`
    : 'No images on this channel yet.';
  if (hasItems) {
    const preferredIndex = filteredItems.findIndex((item) => item.id === preferredPhotoId);
    const nextIndex = preferredIndex >= 0 ? preferredIndex : 0;
    updateFeature(nextIndex);
    if (lightbox?.open) updateLightbox(nextIndex);
  } else {
    stopFeatureRotation();
    if (lightbox?.open) lightbox.close();
  }
}

function applyFilter(filter, level) {
  const preferredPhotoId = lastViewedPhotoId;

  if (level === 'clear' || filter === 'all') {
    activePrimaryFilters.clear();
    activeSecondaryFilter = null;
  } else if (level === 'secondary') {
    activePrimaryFilters.delete('event-photos');
    activePrimaryFilters.add('minis');
    activeSecondaryFilter = filter;
    const requestedTags = [...activePrimaryFilters, filter];
    const hasMatchingPhotos = galleryItems.some((item) => requestedTags.every((tag) => item.tags.includes(tag)));
    if (!hasMatchingPhotos) activePrimaryFilters.delete('featured');
  } else {
    if (filter === 'featured') {
      activePrimaryFilters.add(filter);
    } else {
      activePrimaryFilters.delete('event-photos');
      activePrimaryFilters.delete('minis');
      activePrimaryFilters.add(filter);
      if (filter !== 'minis') activeSecondaryFilter = null;
    }
  }

  refreshGalleryFilters(preferredPhotoId);
}

function refreshGalleryFilters(preferredPhotoId = lastViewedPhotoId) {
  const activeTags = [...activePrimaryFilters];
  if (activeSecondaryFilter) activeTags.push(activeSecondaryFilter);
  filteredItems = activeTags.length
    ? galleryItems.filter((item) => activeTags.every((tag) => item.tags.includes(tag)))
    : [...galleryItems];

  primaryFilterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(activePrimaryFilters.has(button.dataset.galleryFilter)));
  });
  secondaryFilterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.galleryFilter === activeSecondaryFilter));
  });
  clearFilterButton?.setAttribute('aria-pressed', String(activeTags.length === 0));
  gallerySubfilters.hidden = !activePrimaryFilters.has('minis');
  renderGrid(preferredPhotoId);
}

function removeFilter(filter) {
  const preferredPhotoId = lastViewedPhotoId;
  if (activePrimaryFilters.has(filter)) {
    activePrimaryFilters.delete(filter);
    if (filter === 'minis') activeSecondaryFilter = null;
  } else if (activeSecondaryFilter === filter) {
    activeSecondaryFilter = null;
  }
  refreshGalleryFilters(preferredPhotoId);
}

function updateLightbox(index) {
  if (!filteredItems.length) return;
  setLightboxZoom(false);
  lightboxIndex = (index + filteredItems.length) % filteredItems.length;
  const item = filteredItems[lightboxIndex];
  lastViewedPhotoId = item.id;
  lightboxImage.src = item.src;
  lightboxImage.width = item.width;
  lightboxImage.height = item.height;
  lightboxImage.alt = item.alt;
  lightboxMeta.textContent = `${activeChannelLabel()} // ${lightboxIndex + 1} of ${filteredItems.length}`;
  renderImageTags(lightboxTags, item.tags);
  lightbox.setAttribute('aria-label', `Full-screen ${itemLabel(item)}`);
  window.WASTED_WARGAMING_CONTRIBUTOR_UI?.renderContributorCredits(lightboxCredit, item, { iconLimit: 3 });
}

function openLightbox(index) {
  stopFeatureRotation();
  updateLightbox(index);
  if (typeof lightbox.showModal === 'function') {
    lightbox.showModal();
  } else {
    lightbox.setAttribute('open', '');
  }
  window.requestAnimationFrame(fitLightboxImage);
}

function applyImageTag(event) {
  const button = event.target.closest('[data-image-tag]');
  if (!button) return;
  const tag = button.dataset.imageTag;
  if (button.dataset.filterActive === 'true') {
    removeFilter(tag);
    return;
  }
  const level = ['featured', 'event-photos', 'minis'].includes(tag) ? 'primary' : 'secondary';
  applyFilter(tag, level);
}

featureTags?.addEventListener('click', applyImageTag);
lightboxTags?.addEventListener('click', applyImageTag);

previousButton?.addEventListener('click', () => updateFeature(featuredIndex - 1));
nextButton?.addEventListener('click', () => updateFeature(featuredIndex + 1));
featureOpen?.addEventListener('click', () => openLightbox(featuredIndex));
lightboxPrevious?.addEventListener('click', () => updateLightbox(lightboxIndex - 1));
lightboxNext?.addEventListener('click', () => updateLightbox(lightboxIndex + 1));
lightboxClose?.addEventListener('click', () => {
  setLightboxZoom(false);
  lightbox.close();
  scheduleFeatureRotation();
});

lightboxImage?.addEventListener('click', (event) => {
  const isZoomed = lightboxViewport.classList.contains('is-zoomed');
  if (isZoomed) {
    setLightboxZoom(false);
    return;
  }

  const bounds = lightboxImage.getBoundingClientRect();
  setLightboxZoom(true, {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
  });
});

lightboxViewport?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  setLightboxZoom(!lightboxViewport.classList.contains('is-zoomed'));
});

window.addEventListener('resize', () => {
  if (lightbox?.open && !lightboxViewport.classList.contains('is-zoomed')) fitLightboxImage();
});

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    lightbox.close();
    scheduleFeatureRotation();
  }
});

lightbox?.addEventListener('close', scheduleFeatureRotation);

galleryStage?.addEventListener('pointerenter', () => {
  stageIsActive = true;
  stopFeatureRotation();
});

galleryStage?.addEventListener('pointerleave', () => {
  stageIsActive = false;
  scheduleFeatureRotation();
});

galleryStage?.addEventListener('focusin', () => {
  stageIsActive = true;
  stopFeatureRotation();
});

galleryStage?.addEventListener('focusout', (event) => {
  if (galleryStage.contains(event.relatedTarget)) return;
  stageIsActive = false;
  scheduleFeatureRotation();
});

window.addEventListener('scroll', () => {
  pageIsScrolling = true;
  stopFeatureRotation();
  window.clearTimeout(scrollResumeTimer);
  scrollResumeTimer = window.setTimeout(() => {
    pageIsScrolling = false;
    scheduleFeatureRotation();
  }, 1200);
}, { passive: true });

if ('IntersectionObserver' in window) {
  const stageObserver = new IntersectionObserver(([entry]) => {
    stageInView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
    if (stageInView) scheduleFeatureRotation();
    else stopFeatureRotation();
  }, { threshold: [0, 0.35] });
  stageObserver.observe(galleryStage);
}

document.addEventListener('visibilitychange', scheduleFeatureRotation);

document.addEventListener('keydown', (event) => {
  if (lightbox?.open) {
    if (lightboxViewport?.classList.contains('is-zoomed')) return;
    if (event.key === 'ArrowLeft') updateLightbox(lightboxIndex - 1);
    if (event.key === 'ArrowRight') updateLightbox(lightboxIndex + 1);
    return;
  }
  if (event.key === 'ArrowLeft') updateFeature(featuredIndex - 1);
  if (event.key === 'ArrowRight') updateFeature(featuredIndex + 1);
});

async function initializeGallery() {
  buildGalleryFilters(await loadGalleryTaxonomy());
  selectFeaturedHero();
  renderGrid();

  const requestedPhotoId = new URLSearchParams(window.location.search).get('photo');
  const requestedPhotoIndex = filteredItems.findIndex((item) => item.id === requestedPhotoId);
  if (requestedPhotoIndex >= 0) updateFeature(requestedPhotoIndex);
}

initializeGallery();
