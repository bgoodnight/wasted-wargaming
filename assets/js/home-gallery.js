const homeGallery = document.querySelector('[data-home-gallery]');
const homeGalleryItems = Array.isArray(window.WASTED_WARGAMING_GALLERY)
  ? window.WASTED_WARGAMING_GALLERY.filter((item) => item.tags.includes('featured'))
  : [];

if (homeGallery && homeGalleryItems.length) {
  const preferredOrder = ['death-guard-03', 'necrons-01', 'death-guard-01'];
  const orderedItems = [
    ...preferredOrder.map((id) => homeGalleryItems.find((item) => item.id === id)).filter(Boolean),
    ...homeGalleryItems.filter((item) => !preferredOrder.includes(item.id))
  ];
  const image = homeGallery.querySelector('[data-home-gallery-image]');
  const tags = homeGallery.querySelector('[data-home-gallery-tags]');
  const credit = homeGallery.querySelector('[data-home-gallery-credit]');
  const count = homeGallery.querySelector('[data-home-gallery-count]');
  const photoLink = homeGallery.querySelector('[data-home-gallery-link]');
  const previous = homeGallery.querySelector('[data-home-gallery-previous]');
  const next = homeGallery.querySelector('[data-home-gallery-next]');
  const controls = homeGallery.querySelector('[data-home-gallery-controls]');
  let activeIndex = 0;
  let touchStartX = null;
  let suppressNextClick = false;
  let controlsTimer;

  function itemLabel(item) {
    return `${item.type} photo featuring ${item.faction}`;
  }

  function wakeControls() {
    controls.classList.add('is-active');
    window.clearTimeout(controlsTimer);
    controlsTimer = window.setTimeout(() => controls.classList.remove('is-active'), 900);
  }

  function showItem(index) {
    activeIndex = Math.max(0, Math.min(index, orderedItems.length - 1));
    const item = orderedItems[activeIndex];
    image.src = item.src;
    image.width = item.width;
    image.height = item.height;
    image.alt = item.alt;
    image.style.objectPosition = item.homePosition || '50% 50%';
    tags.textContent = `${item.type} // ${item.faction}`;
    count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(orderedItems.length).padStart(2, '0')}`;
    count.setAttribute('aria-label', `Image ${activeIndex + 1} of ${orderedItems.length}`);
    photoLink.href = `gallery.html?photo=${encodeURIComponent(item.id)}#archive`;
    photoLink.setAttribute('aria-label', `View ${itemLabel(item)} in the gallery`);
    window.WASTED_WARGAMING_CONTRIBUTOR_UI?.renderContributorCredits(credit, item, { iconLimit: 3 });
    previous.hidden = activeIndex === 0;
    next.hidden = activeIndex === orderedItems.length - 1;
    wakeControls();
  }

  previous.addEventListener('click', () => showItem(activeIndex - 1));
  next.addEventListener('click', () => showItem(activeIndex + 1));

  window.addEventListener('scroll', wakeControls, { passive: true });
  homeGallery.addEventListener('pointerenter', wakeControls);
  homeGallery.addEventListener('focusin', wakeControls);
  homeGallery.addEventListener('touchstart', wakeControls, { passive: true });

  photoLink.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    suppressNextClick = false;
  }, { passive: true });

  photoLink.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 45) return;
    suppressNextClick = true;
    if (distance > 0) showItem(activeIndex - 1);
    else showItem(activeIndex + 1);
  }, { passive: true });

  photoLink.addEventListener('click', (event) => {
    if (!suppressNextClick) return;
    event.preventDefault();
    suppressNextClick = false;
  });

  showItem(0);
}
