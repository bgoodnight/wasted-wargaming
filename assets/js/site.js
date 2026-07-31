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

const eventCard = document.querySelector('[data-event-card]');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function eventDetail(label, value) {
  if (!value) return '';
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function renderEvent(event) {
  const hasRsvp = Boolean(event.rsvpUrl && event.rsvpUrl !== 'TBD');
  const rsvpButton = hasRsvp
    ? `<a class="button" href="${escapeHtml(event.rsvpUrl)}" rel="noopener noreferrer">RSVP on Meetup</a>`
    : '<button class="button" type="button" disabled>RSVP link incoming</button>';
  const detailsButton = event.detailsUrl
    ? `<a class="button event-card__details-link" href="${escapeHtml(event.detailsUrl)}">${escapeHtml(event.detailsLabel || 'View event details')}</a>`
    : '';

  eventCard.innerHTML = `
    <p class="event-card__status">${escapeHtml(event.status || 'Update pending')}</p>
    <div class="event-card__art">
      <h3>${escapeHtml(event.title || 'Next event announcement incoming')}</h3>
    </div>
    <dl class="event-card__details">
      ${eventDetail('Date', event.dateDisplay)}
      ${eventDetail('Featured game', event.gameSystem)}
      ${eventDetail('Format', event.formatDisplay)}
      ${eventDetail('Provided', event.materialsDisplay)}
      ${eventDetail('Availability', event.availability)}
    </dl>
    <div class="event-card__actions">
      ${detailsButton}
      ${rsvpButton}
    </div>
  `;
}

if (eventCard) {
  const data = window.WASTED_WARGAMING_EVENT_DATA;
  renderEvent(data?.events?.[0] || data?.fallback || {
    status: 'Signal interrupted',
    title: 'Next event announcement incoming',
    message: 'We could not load the event details. Check back soon for the complete briefing.',
    dateDisplay: 'To be announced',
    availability: 'Not yet open'
  });
}
