const contributorDirectory = window.WASTED_WARGAMING_CONTRIBUTORS || {};

function socialGlyph(type) {
  if (type === 'linkedin') return 'in';
  if (type === 'facebook') return 'f';
  return '⌂';
}

function sortedContributorLinks(contributor, limit = Infinity) {
  return [...(contributor?.links || [])]
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    .slice(0, limit);
}

function createSocialLink(contributor, link, showLabel = false) {
  const anchor = document.createElement('a');
  anchor.className = `contributor-social contributor-social--${link.type}`;
  anchor.href = link.url;
  anchor.rel = 'noopener noreferrer';
  anchor.setAttribute('aria-label', `${contributor.name}: ${link.label}`);
  anchor.title = link.label;

  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = socialGlyph(link.type);
  anchor.append(icon);
  if (showLabel) {
    const label = document.createElement('span');
    label.className = 'contributor-social__label';
    label.textContent = link.label;
    anchor.append(label);
  }
  return anchor;
}

function createSocialList(contributor, limit = 3, showLabels = false) {
  const list = document.createElement('span');
  list.className = 'contributor-socials';
  sortedContributorLinks(contributor, limit).forEach((link) => {
    list.append(createSocialLink(contributor, link, showLabels));
  });
  return list;
}

function renderContributorCredits(container, item, options = {}) {
  const { iconLimit = 3 } = options;
  container.replaceChildren();
  const credits = Array.isArray(item?.credits) ? item.credits : [];

  credits.forEach((credit) => {
    const contributor = contributorDirectory[credit.contributorId];
    if (!contributor) return;

    const line = document.createElement('span');
    line.className = 'contributor-credit';

    const role = document.createElement('span');
    role.className = 'contributor-credit__role';
    role.textContent = `${credit.role || 'Contributor'} by`;

    const name = document.createElement('a');
    name.className = 'contributor-credit__name';
    name.href = `contributor.html?id=${encodeURIComponent(contributor.id)}`;
    name.textContent = contributor.name;

    line.append(role, name, createSocialList(contributor, iconLimit));
    container.append(line);
  });

  container.hidden = !container.childElementCount;
}

window.WASTED_WARGAMING_CONTRIBUTOR_UI = {
  contributors: contributorDirectory,
  createSocialList,
  renderContributorCredits,
  sortedContributorLinks
};
