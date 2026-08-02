const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      navToggle.focus();
    }
  });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

function revealHashDetails() {
  const targetId = window.location.hash.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;
  if (target?.tagName === 'DETAILS') target.open = true;
}

window.addEventListener('hashchange', revealHashDetails);
revealHashDetails();

const routeDialog = document.querySelector('[data-route-dialog]');
const routeOpen = document.querySelector('[data-route-open]');
const routeClose = document.querySelector('[data-route-close]');
const routeMapViewport = document.querySelector('[data-route-map-viewport]');
const routeMapCanvas = document.querySelector('[data-route-map-canvas]');
const routeMapPlaces = [...document.querySelectorAll('[data-route-map-place]')];
const routeMapZoomIn = document.querySelector('[data-route-map-zoom-in]');
const routeMapZoomOut = document.querySelector('[data-route-map-zoom-out]');
const routeMapReset = document.querySelector('[data-route-map-reset]');
const routeMapFullscreenClose = document.querySelector('[data-route-map-fullscreen-close]');
const routeMapZoomStatus = document.querySelector('[data-route-map-zoom-status]');
const routeMapHint = document.querySelector('[data-route-map-hint]');
const routeMapMobile = window.matchMedia('(max-width: 759px)');
const routeMapPointers = new Map();
let routeMapScale = 1;
let routeMapX = 0;
let routeMapY = 0;
let routeMapLastPinchDistance = 0;
let routeMapDragged = false;

function routeMapMinimumScale() {
  return 1;
}

function closeRouteMapPlaces(exception) {
  routeMapPlaces.forEach((place) => {
    if (place === exception) return;
    place.setAttribute('aria-expanded', 'false');
  });
  if (!exception) routeMapViewport?.classList.remove('has-open-place');
}

function constrainRouteMap() {
  if (!routeMapViewport) return;
  const width = routeMapViewport.clientWidth;
  const height = routeMapViewport.clientHeight;
  const scaledWidth = width * routeMapScale;
  const scaledHeight = height * routeMapScale;
  routeMapX = Math.min(0, Math.max(width - scaledWidth, routeMapX));
  routeMapY = Math.min(0, Math.max(height - scaledHeight, routeMapY));
}

function renderRouteMap(announce = false) {
  if (!routeMapViewport || !routeMapCanvas) return;
  constrainRouteMap();
  routeMapCanvas.style.transform = `translate(${routeMapX}px, ${routeMapY}px) scale(${routeMapScale})`;
  routeMapViewport.classList.toggle('is-zoomed', routeMapScale > routeMapMinimumScale() + 0.01);
  if (routeMapZoomStatus) routeMapZoomStatus.value = `${Math.round(routeMapScale * 100)}%`;
  if (announce && routeMapZoomStatus) routeMapZoomStatus.textContent = `${Math.round(routeMapScale * 100)}%`;
}

function zoomRouteMap(nextScale, clientX, clientY, announce = true) {
  if (!routeMapViewport) return;
  const minimum = routeMapMinimumScale();
  const scale = Math.max(minimum, Math.min(4, nextScale));
  const bounds = routeMapViewport.getBoundingClientRect();
  const focusX = (clientX ?? (bounds.left + bounds.width / 2)) - bounds.left;
  const focusY = (clientY ?? (bounds.top + bounds.height / 2)) - bounds.top;
  const contentX = (focusX - routeMapX) / routeMapScale;
  const contentY = (focusY - routeMapY) / routeMapScale;
  routeMapX = focusX - contentX * scale;
  routeMapY = focusY - contentY * scale;
  routeMapScale = scale;
  renderRouteMap(announce);
}

function resetRouteMap(announce = false) {
  routeMapScale = routeMapMinimumScale();
  if (routeMapViewport) {
    routeMapX = (routeMapViewport.clientWidth - routeMapViewport.clientWidth * routeMapScale) / 2;
    routeMapY = (routeMapViewport.clientHeight - routeMapViewport.clientHeight * routeMapScale) / 2;
  } else {
    routeMapX = 0;
    routeMapY = 0;
  }
  renderRouteMap(announce);
}

function enterRouteMapFullscreen() {
  if (!routeMapViewport || !routeMapMobile.matches) return;
  closeRouteMapPlaces();
  routeMapViewport.classList.add('is-fullscreen');
  routeMapViewport.setAttribute('aria-label', 'Full-screen interactive rally route map. Pinch or use controls to zoom, and swipe or use arrow keys to pan.');
  if (routeMapHint) routeMapHint.textContent = 'Pinch to zoom. Swipe to pan.';
  resetRouteMap(true);
  routeMapFullscreenClose?.focus();
}

function exitRouteMapFullscreen() {
  if (!routeMapViewport?.classList.contains('is-fullscreen')) return;
  routeMapViewport.classList.remove('is-fullscreen');
  routeMapViewport.setAttribute('aria-label', 'Interactive rally route map. Tap open map space for a full-screen view.');
  if (routeMapHint) routeMapHint.textContent = 'Tap open map space for full screen.';
  resetRouteMap();
  routeMapViewport.focus();
}

function updateRouteMapMode() {
  if (!routeMapViewport?.classList.contains('is-fullscreen') && routeMapHint) {
    routeMapHint.textContent = routeMapMobile.matches
      ? 'Tap open map space for full screen.'
      : 'Use controls to zoom. Drag to pan when zoomed.';
  }
  resetRouteMap();
}

if (routeDialog && routeOpen) {
  routeOpen.addEventListener('click', () => {
    routeDialog.showModal();
    if (routeMapMobile.matches) {
      window.requestAnimationFrame(() => enterRouteMapFullscreen());
      return;
    }
    if (routeMapHint) routeMapHint.textContent = 'Use controls to zoom. Drag to pan when zoomed.';
    window.requestAnimationFrame(() => resetRouteMap());
  });
  routeClose?.addEventListener('click', () => {
    exitRouteMapFullscreen();
    routeDialog.close();
  });
  routeDialog.addEventListener('click', (event) => {
    if (event.target === routeDialog) {
      routeDialog.close();
      return;
    }
  });
  routeDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    routeDialog.close();
  });
  routeDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (routeMapViewport?.classList.contains('is-fullscreen')) {
        exitRouteMapFullscreen();
        if (routeMapMobile.matches) routeDialog.close();
        return;
      }
      routeDialog.close();
    }
  });
  routeDialog.addEventListener('close', () => {
    routeMapViewport?.classList.remove('is-fullscreen');
    closeRouteMapPlaces();
    resetRouteMap();
    routeOpen.focus();
  });
}

routeMapPlaces.forEach((place) => {
  place.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = place.getAttribute('aria-expanded') !== 'true';
    closeRouteMapPlaces(place);
    place.setAttribute('aria-expanded', String(willOpen));
    routeMapViewport?.classList.toggle('has-open-place', willOpen);
  });
});

routeMapViewport?.addEventListener('click', (event) => {
  if (event.target.closest('[data-route-map-place], .route-map__controls')) return;
  closeRouteMapPlaces();
  if (routeMapMobile.matches && !routeMapViewport.classList.contains('is-fullscreen') && !routeMapDragged) {
    enterRouteMapFullscreen();
  }
  routeMapDragged = false;
});

routeMapZoomIn?.addEventListener('click', () => zoomRouteMap(routeMapScale * 1.3));
routeMapZoomOut?.addEventListener('click', () => zoomRouteMap(routeMapScale / 1.3));
routeMapReset?.addEventListener('click', () => resetRouteMap(true));
routeMapFullscreenClose?.addEventListener('click', () => {
  exitRouteMapFullscreen();
  if (routeMapMobile.matches) routeDialog?.close();
});

routeMapViewport?.addEventListener('wheel', (event) => {
  if (routeMapMobile.matches) return;
  event.preventDefault();
  zoomRouteMap(routeMapScale * (event.deltaY < 0 ? 1.12 : 0.89), event.clientX, event.clientY, false);
}, { passive: false });

routeMapViewport?.addEventListener('pointerdown', (event) => {
  if (event.target.closest('[data-route-map-place], .route-map__controls')) return;
  if (routeMapMobile.matches && !routeMapViewport.classList.contains('is-fullscreen')) return;
  routeMapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  routeMapViewport.setPointerCapture(event.pointerId);
  routeMapDragged = false;
  if (routeMapPointers.size === 2) {
    const points = [...routeMapPointers.values()];
    routeMapLastPinchDistance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  }
});

routeMapViewport?.addEventListener('pointermove', (event) => {
  const previous = routeMapPointers.get(event.pointerId);
  if (!previous) return;
  routeMapPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  const points = [...routeMapPointers.values()];
  if (points.length >= 2) {
    const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const midpointX = (points[0].x + points[1].x) / 2;
    const midpointY = (points[0].y + points[1].y) / 2;
    if (routeMapLastPinchDistance) zoomRouteMap(routeMapScale * (distance / routeMapLastPinchDistance), midpointX, midpointY, false);
    routeMapLastPinchDistance = distance;
    routeMapDragged = true;
    return;
  }
  if (routeMapScale <= routeMapMinimumScale() + 0.01) return;
  const deltaX = event.clientX - previous.x;
  const deltaY = event.clientY - previous.y;
  if (Math.abs(deltaX) + Math.abs(deltaY) > 1) routeMapDragged = true;
  routeMapX += deltaX;
  routeMapY += deltaY;
  routeMapViewport.classList.add('is-dragging');
  renderRouteMap();
});

function endRouteMapPointer(event) {
  routeMapPointers.delete(event.pointerId);
  routeMapLastPinchDistance = 0;
  routeMapViewport?.classList.remove('is-dragging');
}

routeMapViewport?.addEventListener('pointerup', endRouteMapPointer);
routeMapViewport?.addEventListener('pointercancel', endRouteMapPointer);

routeMapViewport?.addEventListener('keydown', (event) => {
  if (event.target.closest('button')) return;
  if (event.key === '+' || event.key === '=') {
    event.preventDefault();
    zoomRouteMap(routeMapScale * 1.3);
  } else if (event.key === '-') {
    event.preventDefault();
    zoomRouteMap(routeMapScale / 1.3);
  } else if (event.key === '0') {
    event.preventDefault();
    resetRouteMap(true);
  } else if (event.key.startsWith('Arrow') && routeMapScale > routeMapMinimumScale()) {
    event.preventDefault();
    const step = 32;
    if (event.key === 'ArrowLeft') routeMapX += step;
    if (event.key === 'ArrowRight') routeMapX -= step;
    if (event.key === 'ArrowUp') routeMapY += step;
    if (event.key === 'ArrowDown') routeMapY -= step;
    renderRouteMap();
  }
});

window.addEventListener('resize', () => resetRouteMap());
routeMapMobile.addEventListener('change', updateRouteMapMode);

const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.type = 'button';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.title = 'Back to top';
backToTop.innerHTML = '<span aria-hidden="true">\u2191</span>';
document.body.append(backToTop);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let backToTopTimer;
let backToTopFrame;

function updateBackToTop() {
  const shouldShow = window.scrollY > Math.max(420, window.innerHeight * 0.7);
  backToTop.classList.toggle('is-visible', shouldShow);

  if (shouldShow) {
    backToTop.classList.add('is-active');
    window.clearTimeout(backToTopTimer);
    backToTopTimer = window.setTimeout(() => {
      backToTop.classList.remove('is-active');
    }, 850);
  } else {
    backToTop.classList.remove('is-active');
  }

  backToTopFrame = undefined;
}

window.addEventListener('scroll', () => {
  if (!backToTopFrame) backToTopFrame = window.requestAnimationFrame(updateBackToTop);
}, { passive: true });

window.addEventListener('resize', updateBackToTop);
updateBackToTop();

backToTop.addEventListener('click', () => {
  const main = document.querySelector('main');
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });

  const restoreFocus = () => {
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
  };

  if (reducedMotion.matches) {
    restoreFocus();
  } else if ('onscrollend' in window) {
    window.addEventListener('scrollend', restoreFocus, { once: true });
  } else {
    window.setTimeout(restoreFocus, 550);
  }
});

const eventDossier = document.querySelector('[data-event-dossier]');
const eventStack = document.querySelector('[data-event-stack]');
const eventPrevious = document.querySelector('[data-event-previous]');
const eventNext = document.querySelector('[data-event-next]');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function eventDetail(label, value, field, event) {
  if (!value) return '';
  const isClassified = event.classifiedFields?.includes(field);
  return `
    <div class="${isClassified ? 'is-classified' : ''}">
      <dt>${escapeHtml(label)}</dt>
      <dd>
        <span class="event-card__detail-value">${escapeHtml(value)}</span>
        ${isClassified ? `<small>${escapeHtml(event.classifiedNote || 'This detail is still under review. Follow the Meetup for the final notice.')}</small>` : ''}
      </dd>
    </div>
  `;
}

function eventShareUrl(event) {
  if (!event?.detailsUrl) return null;
  const url = new URL(event.detailsUrl, window.location.href);
  return url.href;
}

function shareIcon(name) {
  const paths = {
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4M8.6 13.4l6.8 4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    facebook: '<path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3.5l.5-4h-4V9c0-.6.4-1 1-1Z"/>',
    linkedin: '<path d="M6.5 9.5V19M6.5 6.5v.1M11 19v-9.5M11 13.5c1-3.1 6.5-3.4 6.5 1.3V19"/>',
    bluesky: '<path d="M12 11.3C10.8 9 7.5 5.1 5.2 3.5 3 2 2.1 2.3 1.5 2.6.8 3 .5 4.2.5 5.5c0 1.4.8 11.4 1.3 13.1.5 1.8 2 2.4 3.4 2.2 2.5-.4 4.7-2.2 5.1-4.4.5 2.2 2.6 4 5.1 4.4 1.4.2 2.9-.4 3.4-2.2.5-1.7 1.3-11.7 1.3-13.1 0-1.3-.3-2.5-1-2.9-.6-.3-1.5-.6-3.7.9-2.3 1.6-5.6 5.5-6.8 7.8Z"/>',
    x: '<path d="M5 4h4.7l9.3 16h-4.7L5 4Zm1 16L18 4"/>',
    reddit: '<circle cx="12" cy="13" r="7"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 16c1.7 1 4.3 1 6 0M15 6l1-3 3 1M5.5 10 3 8M18.5 10 21 8"/>',
    discord: '<path d="M8 7.2A10 10 0 0 1 12 6a10 10 0 0 1 4 1.2c1.3 1.8 2.2 4.6 2 7.4-1.2 1-2.5 1.6-3.8 1.9l-.9-1.2c.7-.2 1.4-.6 2-1-2.1 1-4.5 1-6.6 0 .6.4 1.3.8 2 1l-.9 1.2c-1.3-.3-2.6-.9-3.8-1.9-.2-2.8.7-5.6 2-7.4Z"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/>',
    whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.2c.5 3.4 2.4 5.3 5.8 5.8l1.3-1.3"/>',
    pinterest: '<circle cx="12" cy="12" r="9"/><path d="M10 18c1-2.5 1.5-4.8 2-7 .5-2.1 3.4-1.7 2.9.5-.5 2.3-3.8 2.1-4.6.7-.9-1.7-.1-5 3.4-5.4 3.7-.4 5.3 3.9 3 6.8-1 1.3-2.7 1.8-4.2 1"/>',
    sms: '<path d="M4 5h16v12H9l-5 4V5Z"/><path d="M8 10h8M8 13h5"/>',
    email: '<path d="M3 6h18v12H3V6Z"/><path d="m4 7 8 6 8-6"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1"/><path d="M16 8V4H5v12h3"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.share}</svg>`;
}

function eventShareButton(event) {
  if (!event.detailsUrl) {
    return `<button class="button event-card__share-trigger" type="button" disabled data-event-card-action aria-label="Sharing will be available when the full briefing is published">${shareIcon('share')}<span>Share unavailable</span></button>`;
  }
  return `<button class="button event-card__share-trigger" type="button" data-event-share-open data-event-id="${escapeHtml(event.id)}" data-event-card-action>${shareIcon('share')}<span>Share</span></button>`;
}

const eventRecords = window.WASTED_WARGAMING_EVENT_DATA?.events || [];
const shareDialog = eventRecords.length ? document.createElement('dialog') : null;
let activeShareEvent;
let shareReturnFocus;

function shareDestination(name, label, href, icon) {
  return `<a class="event-share-dialog__option" href="${href}" ${name === 'email' || name === 'sms' ? '' : 'target="_blank" rel="noopener noreferrer"'} data-share-destination="${name}" aria-label="Share with ${label}">${shareIcon(icon || name)}<span>${label}</span></a>`;
}

function openEventShareDialog(eventRecord, trigger) {
  const url = eventShareUrl(eventRecord);
  if (!shareDialog || !url) return;
  const title = `${eventRecord.title} | Wasted Wargaming`;
  const message = `${eventRecord.title}: ${eventRecord.gameSystem}. ${eventRecord.status}.`;
  const messageWithUrl = `${message} ${url}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedMessage = encodeURIComponent(messageWithUrl);
  const artUrl = eventRecord.artSrc ? new URL(eventRecord.artSrc, window.location.href).href : '';
  const encodedArt = encodeURIComponent(artUrl);
  activeShareEvent = eventRecord;
  shareReturnFocus = trigger;
  shareDialog.innerHTML = `
    <div class="event-share-dialog__panel">
      <button class="event-share-dialog__close" type="button" data-event-share-close aria-label="Close sharing options">${shareIcon('close')}</button>
      <p class="event-share-dialog__eyebrow">Transmit mission</p>
      <h2 id="event-share-dialog-title">Share this event</h2>
      <div class="event-share-dialog__preview" style="--share-art: url(&quot;${escapeHtml(artUrl)}&quot;)">
        <img src="assets/images/branding/wasted-wargaming-logo.png" alt="" width="1536" height="1024">
        <div><strong>${escapeHtml(eventRecord.title)}</strong><span>${escapeHtml(url)}</span></div>
      </div>
      <p class="event-share-dialog__hint">Choose a destination. Each option sends the event link in the format that platform accepts.</p>
      <div class="event-share-dialog__options" aria-label="Sharing destinations">
        <button class="event-share-dialog__option" type="button" data-event-copy-link aria-label="Copy event link">${shareIcon('copy')}<span>Copy link</span></button>
        <button class="event-share-dialog__option" type="button" data-event-share-discord aria-label="Copy a Discord-ready event message">${shareIcon('discord')}<span>Discord</span></button>
        <button class="event-share-dialog__option" type="button" data-event-share-native aria-label="Open device sharing options">${shareIcon('share')}<span>Share</span></button>
        ${shareDestination('sms', 'Message', `sms:?&body=${encodedMessage}`)}
        ${shareDestination('facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        ${shareDestination('bluesky', 'Bluesky', `https://bsky.app/intent/compose?text=${encodedMessage}`)}
        ${shareDestination('reddit', 'Reddit', `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`)}
        ${shareDestination('whatsapp', 'WhatsApp', `https://api.whatsapp.com/send?text=${encodedMessage}`)}
        ${shareDestination('linkedin', 'LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
        ${shareDestination('x', 'X', `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodedUrl}`)}
        ${shareDestination('email', 'Email', `mailto:?subject=${encodedTitle}&body=${encodedMessage}`)}
        ${artUrl ? shareDestination('pinterest', 'Pinterest', `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedArt}&description=${encodeURIComponent(message)}`) : ''}
      </div>
      <p class="event-share-dialog__feedback" data-event-share-feedback role="status" aria-live="polite"></p>
    </div>
  `;
  document.dispatchEvent(new CustomEvent('eventshareopen', { detail: { eventId: eventRecord.id } }));
  shareDialog.showModal();
}

if (shareDialog) {
  shareDialog.className = 'event-share-dialog';
  shareDialog.setAttribute('aria-labelledby', 'event-share-dialog-title');
  document.body.append(shareDialog);

  document.querySelectorAll('[data-event-share-open]').forEach((trigger) => {
    if (!trigger.querySelector('svg')) trigger.insertAdjacentHTML('afterbegin', shareIcon('share'));
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-event-share-open]');
    if (!trigger || trigger.disabled) return;
    const eventId = trigger.dataset.eventId || document.body.dataset.eventPageId;
    const eventRecord = eventRecords.find((record) => record.id === eventId);
    if (eventRecord) openEventShareDialog(eventRecord, trigger);
  });

  shareDialog.addEventListener('click', async (event) => {
    const feedback = shareDialog.querySelector('[data-event-share-feedback]');
    if (event.target === shareDialog || event.target.closest('[data-event-share-close]')) {
      shareDialog.close();
      return;
    }
    if (!activeShareEvent) return;
    if (event.target.closest('[data-event-share-native]')) {
      const shareData = {
        title: `${activeShareEvent.title} | Wasted Wargaming`,
        text: `${activeShareEvent.title}: ${activeShareEvent.gameSystem}. ${activeShareEvent.status}.`,
        url: eventShareUrl(activeShareEvent)
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (error) {
          if (error.name !== 'AbortError' && feedback) feedback.textContent = 'Sharing was unavailable.';
        }
      } else if (feedback) {
        feedback.textContent = 'Device sharing is unavailable here. Choose another option.';
      }
    }
    if (event.target.closest('[data-event-copy-link]')) {
      try {
        await navigator.clipboard.writeText(eventShareUrl(activeShareEvent));
        if (feedback) feedback.textContent = 'Link copied.';
      } catch {
        if (feedback) feedback.textContent = 'Copy unavailable. Use your browser address bar.';
      }
    }
    if (event.target.closest('[data-event-share-discord]')) {
      const discordMessage = `**${activeShareEvent.title}**\n${activeShareEvent.gameSystem}\n${activeShareEvent.status}\n${eventShareUrl(activeShareEvent)}`;
      try {
        await navigator.clipboard.writeText(discordMessage);
        if (feedback) feedback.textContent = 'Discord-ready message copied. Paste it into the community Discord.';
      } catch {
        if (feedback) feedback.textContent = 'Copy unavailable. Copy the event link from your browser.';
      }
    }
  });

  shareDialog.addEventListener('close', () => {
    document.dispatchEvent(new CustomEvent('eventshareclose', { detail: { eventId: activeShareEvent?.id } }));
    shareReturnFocus?.focus();
    activeShareEvent = undefined;
  });
}

function renderEventCard(event, index, total) {
  const hasRsvp = Boolean(event.rsvpUrl && event.rsvpUrl !== 'TBD');
  const rsvpButton = hasRsvp
    ? `<a class="button meetup-button" href="${escapeHtml(event.rsvpUrl)}" target="_blank" rel="noopener noreferrer" data-event-card-action><img src="assets/icons/meetup.svg" alt="" width="22" height="22"> ${escapeHtml(event.rsvpLabel || 'Join the Meetup')}</a>`
    : '<button class="button" type="button" disabled data-event-card-action>RSVP link incoming</button>';
  const detailsButton = event.detailsUrl
    ? `<a class="button event-card__details-link" href="${escapeHtml(event.detailsUrl)}" data-event-card-action>${escapeHtml(event.detailsLabel || 'View event details')}</a>`
    : `<button class="button event-card__details-link" type="button" disabled data-event-card-action>${escapeHtml(event.detailsLabel || 'Full briefing classified')}</button>`;
  const card = document.createElement('article');
  const hasClassifiedFields = Boolean(event.classifiedFields?.length);
  const classifiedStamps = event.classifiedStamps?.length
    ? event.classifiedStamps
    : [{ label: 'Field notice', value: 'Details pending', modifier: 'redacted' }];
  card.className = `event-card event-card--${escapeHtml(event.theme || 'default')}`;
  card.dataset.eventCard = event.id;
  card.setAttribute('role', 'group');
  card.setAttribute('aria-roledescription', 'slide');
  card.setAttribute('aria-label', `${index + 1} of ${total}: ${event.title}`);
  card.innerHTML = `
    <span class="event-card__mission-count">Mission ${index + 1} of ${total}</span>
    ${hasClassifiedFields ? classifiedStamps.map((stamp) => `
      <div class="event-card__classified-stamp event-card__classified-stamp--${escapeHtml(stamp.modifier || 'redacted')}" aria-hidden="true"><span>${escapeHtml(stamp.label)}</span><strong>${escapeHtml(stamp.value)}</strong></div>
    `).join('') : ''}
    <p class="event-card__status">${escapeHtml(event.status || 'Update pending')}</p>
    <div class="event-card__art">
      ${event.artSrc ? `<img src="${escapeHtml(event.artSrc)}" alt="">` : ''}
      <h3>${escapeHtml(event.title || 'Next event announcement incoming')}</h3>
    </div>
    ${event.message ? `<p class="event-card__message">${escapeHtml(event.message)}</p>` : ''}
    <dl class="event-card__details">
      ${eventDetail('Date', event.dateDisplay, 'dateDisplay', event)}
      ${eventDetail('Featured game', event.gameSystem, 'gameSystem', event)}
      ${eventDetail('Format', event.formatDisplay, 'formatDisplay', event)}
      ${eventDetail('For', event.audienceDisplay, 'audienceDisplay', event)}
      ${eventDetail('Provided', event.materialsDisplay, 'materialsDisplay', event)}
      ${eventDetail('Availability', event.availability, 'availability', event)}
    </dl>
    <div class="event-card__actions">
      ${detailsButton}
      ${rsvpButton}
      ${eventShareButton(event)}
    </div>
  `;
  return card;
}

if (eventDossier && eventStack) {
  const data = window.WASTED_WARGAMING_EVENT_DATA;
  const events = data?.events?.length ? data.events : [data?.fallback || {
    status: 'Signal interrupted',
    title: 'Next event announcement incoming',
    message: 'We could not load the event details. Check back soon for the complete briefing.',
    dateDisplay: 'To be announced',
    availability: 'Not yet open'
  }];
  const requestedEvent = new URL(window.location.href).searchParams.get('event');
  let activeEventIndex = Math.max(0, events.findIndex((event) => event.id === requestedEvent));
  let eventRotationTimer;
  let eventScrollTimer;
  const eventPauseReasons = new Set();

  const cards = events.map((event, index) => renderEventCard(event, index, events.length));
  eventStack.replaceChildren(...cards);

  function scheduleEventRotation() {
    window.clearTimeout(eventRotationTimer);
    if (events.length < 2 || reducedMotion.matches || eventPauseReasons.size) return;
    eventRotationTimer = window.setTimeout(() => selectEvent(activeEventIndex + 1, false), 11000);
  }

  function selectEvent(nextIndex, userInitiated = true) {
    activeEventIndex = (nextIndex + events.length) % events.length;
    cards.forEach((card, index) => {
      const distance = (index - activeEventIndex + events.length) % events.length;
      const isActive = distance === 0;
      card.classList.toggle('is-active', isActive);
      card.dataset.stackPosition = isActive ? 'active' : distance === 1 ? 'next' : 'queued';
      card.setAttribute('aria-hidden', String(!isActive));
      card.querySelectorAll('[data-event-card-action]').forEach((control) => {
        control.tabIndex = isActive && !control.disabled ? 0 : -1;
      });
    });
    if (eventPrevious) eventPrevious.hidden = events.length < 2 || activeEventIndex === 0;
    if (eventNext) eventNext.hidden = events.length < 2 || activeEventIndex === events.length - 1;
    scheduleEventRotation();
  }

  function pauseEventRotation(reason) {
    eventPauseReasons.add(reason);
    scheduleEventRotation();
  }

  function resumeEventRotation(reason) {
    eventPauseReasons.delete(reason);
    scheduleEventRotation();
  }

  eventPrevious?.addEventListener('click', () => {
    if (activeEventIndex > 0) selectEvent(activeEventIndex - 1);
  });
  eventNext?.addEventListener('click', () => {
    if (activeEventIndex < events.length - 1) selectEvent(activeEventIndex + 1);
  });
  cards.forEach((card, index) => {
    card.addEventListener('click', (event) => {
      if (index !== activeEventIndex && !event.target.closest('a, button')) selectEvent(index);
    });
  });

  eventDossier.addEventListener('mouseenter', () => pauseEventRotation('pointer'));
  eventDossier.addEventListener('mouseleave', () => resumeEventRotation('pointer'));
  eventDossier.addEventListener('focusin', () => pauseEventRotation('focus'));
  eventDossier.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!eventDossier.contains(document.activeElement)) resumeEventRotation('focus');
    }, 0);
  });
  window.addEventListener('scroll', () => {
    pauseEventRotation('scroll');
    window.clearTimeout(eventScrollTimer);
    eventScrollTimer = window.setTimeout(() => resumeEventRotation('scroll'), 1400);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseEventRotation('visibility');
    else resumeEventRotation('visibility');
  });
  document.addEventListener('eventshareopen', () => pauseEventRotation('share'));
  document.addEventListener('eventshareclose', () => resumeEventRotation('share'));

  selectEvent(activeEventIndex, false);
}
