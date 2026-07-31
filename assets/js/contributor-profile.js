const contributorProfile = document.querySelector('[data-contributor-profile]');
const contributorId = new URLSearchParams(window.location.search).get('id');
const contributor = window.WASTED_WARGAMING_CONTRIBUTORS?.[contributorId];
const contributedItems = (window.WASTED_WARGAMING_GALLERY || []).filter((item) =>
  item.credits?.some((credit) => credit.contributorId === contributorId)
);

if (contributorProfile && contributor) {
  document.title = `${contributor.name} | Wasted Wargaming Contributor`;
  contributorProfile.querySelector('[data-contributor-initials]').textContent = contributor.initials || contributor.name.slice(0, 2);
  contributorProfile.querySelector('[data-contributor-name]').textContent = contributor.name;
  contributorProfile.querySelector('[data-contributor-roles]').textContent = contributor.roles.join(' // ');
  contributorProfile.querySelector('[data-contributor-bio]').textContent = contributor.bio;
  contributorProfile.querySelector('[data-contributor-count]').textContent = `${contributedItems.length} ${contributedItems.length === 1 ? 'archive contribution' : 'archive contributions'}`;

  const socialContainer = contributorProfile.querySelector('[data-contributor-socials]');
  socialContainer.replaceChildren(
    window.WASTED_WARGAMING_CONTRIBUTOR_UI.createSocialList(contributor, Infinity, true)
  );

  const workGrid = contributorProfile.querySelector('[data-contributor-work]');
  const cards = contributedItems.map((item) => {
    const card = document.createElement('a');
    card.className = 'contributor-work-card';
    card.href = `gallery.html?photo=${encodeURIComponent(item.id)}#archive`;
    card.setAttribute('aria-label', `View ${item.type} photo featuring ${item.faction} in the gallery`);

    const image = document.createElement('img');
    image.src = item.src;
    image.width = item.width;
    image.height = item.height;
    image.alt = item.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.style.objectPosition = item.homePosition || '50% 50%';

    const caption = document.createElement('span');
    const meta = document.createElement('small');
    meta.textContent = `${item.type} // ${item.faction}`;
    caption.append(meta);
    card.append(image, caption);
    return card;
  });
  workGrid.replaceChildren(...cards);
} else if (contributorProfile) {
  contributorProfile.querySelector('[data-contributor-name]').textContent = 'Contributor not found';
  contributorProfile.querySelector('[data-contributor-roles]').textContent = 'Field archive';
  contributorProfile.querySelector('[data-contributor-bio]').textContent = 'This contributor profile is unavailable. Return to the field archive to keep exploring.';
  contributorProfile.querySelector('[data-contributor-count]').textContent = 'No contributions found';
  contributorProfile.querySelector('[data-contributor-socials]').hidden = true;
  contributorProfile.querySelector('[data-contributor-work]').hidden = true;
}
