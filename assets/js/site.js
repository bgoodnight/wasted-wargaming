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
    <h3>${escapeHtml(event.title || 'Next event announcement incoming')}</h3>
    <p class="event-card__message">${escapeHtml(event.message || 'We are finalizing the details. Check back soon for the complete briefing.')}</p>
    <dl class="event-card__details">
      ${eventDetail('Date', event.dateDisplay)}
      ${eventDetail('Start', event.timeDisplay)}
      ${eventDetail('Rally point', event.meetLocation)}
      ${eventDetail('Game site', event.playLocation)}
      ${eventDetail('Cost', event.costDisplay)}
      ${eventDetail('Featured game', event.gameSystem)}
      ${eventDetail('Format', event.formatDisplay)}
      ${eventDetail('Provided', event.materialsDisplay)}
      ${eventDetail('Ages', event.ageDisplay)}
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
