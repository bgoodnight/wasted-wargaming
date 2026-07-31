const factionGalleries = [...document.querySelectorAll('[data-faction-gallery]')];
const factionGalleryItems = Array.isArray(window.WASTED_WARGAMING_GALLERY)
  ? window.WASTED_WARGAMING_GALLERY
  : [];

factionGalleries.forEach((gallery) => {
  const faction = gallery.dataset.factionGallery;
  const factionItems = factionGalleryItems.filter((item) => item.tags.includes('minis') && item.tags.includes(faction));
  const featuredItems = factionItems.filter((item) => item.tags.includes('featured'));
  const items = featuredItems.length ? featuredItems : factionItems;
  const image = gallery.querySelector('[data-faction-gallery-image]');
  const link = gallery.querySelector('[data-faction-gallery-link]');
  const next = gallery.querySelector('[data-faction-gallery-next]');
  if (!items.length || !image || !link || !next) return;

  const initialItem = items[Math.floor(Math.random() * items.length)];
  let index = items.findIndex((item) => item.id === initialItem.id);

  function showItem() {
    const item = items[index];
    image.src = item.src;
    image.width = item.width;
    image.height = item.height;
    image.alt = item.alt;
    image.style.objectPosition = item.homePosition || '50% 50%';
    link.href = `gallery.html?photo=${encodeURIComponent(item.id)}#archive`;
    link.setAttribute('aria-label', `Open this ${item.faction} miniature in the community gallery`);
  }

  next.hidden = items.length < 2;
  next.addEventListener('click', () => {
    index = (index + 1) % items.length;
    showItem();
  });
  showItem();
});

let factionGalleryScrollTimer;
window.addEventListener('scroll', () => {
  factionGalleries.forEach((gallery) => gallery.classList.add('is-active'));
  window.clearTimeout(factionGalleryScrollTimer);
  factionGalleryScrollTimer = window.setTimeout(() => {
    factionGalleries.forEach((gallery) => gallery.classList.remove('is-active'));
  }, 1100);
}, { passive: true });
