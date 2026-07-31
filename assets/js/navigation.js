(function renderSiteNavigation() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const isHome = currentFile === 'index.html';
  const homeLink = (hash) => isHome ? hash : `index.html${hash}`;
  const galleryIsCurrent = currentFile === 'gallery.html' || currentFile === 'contributor.html';
  const commanderIsCurrent = currentFile === 'commander.html' || currentFile === 'commander-thanks.html';
  const eventsAreCurrent = currentFile === 'joint-ops.html';
  const pathsAreCurrent = currentFile === 'recruit.html' || currentFile === 'veteran.html';

  const currentAttribute = (condition) => condition ? ' aria-current="page"' : '';

  document.querySelectorAll('[data-site-navigation]').forEach((header) => {
    header.innerHTML = `
      <a class="wordmark" href="${homeLink('#top')}" aria-label="Wasted Wargaming home">
        <span class="wordmark__window" aria-hidden="true">
          <img src="assets/images/branding/wasted-wargaming-logo.png" alt="" width="1536" height="1024">
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
        <span class="nav-toggle__label">Menu</span>
        <span class="nav-toggle__mark" aria-hidden="true"></span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation" data-nav>
        <a href="${homeLink('#about')}">What we're building</a>
        <a href="${homeLink('#events')}"${currentAttribute(eventsAreCurrent)}>Upcoming events</a>
        <a href="${homeLink('#roles')}"${currentAttribute(pathsAreCurrent)}>Choose your path</a>
        <a href="${homeLink('#how-it-works')}">How it works</a>
        <a href="${homeLink('#partners')}">Partners</a>
        <a href="gallery.html"${currentAttribute(galleryIsCurrent)}>Gallery</a>
        <a href="${homeLink('#faq')}">FAQ</a>
        <a class="nav-recruit" href="commander.html"${currentAttribute(commanderIsCurrent)}>Become a commander</a>
      </nav>
    `;
  });
})();
