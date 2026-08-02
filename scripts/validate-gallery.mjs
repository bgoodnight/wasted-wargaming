import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const info = [];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function loadBrowserData(relativePath, globalName) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: relativePath });
  return context.window[globalName];
}

const taxonomy = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/gallery-taxonomy.json'), 'utf8'));
const gallery = loadBrowserData('assets/js/gallery-data.js', 'WASTED_WARGAMING_GALLERY');
const contributors = loadBrowserData('assets/js/contributors-data.js', 'WASTED_WARGAMING_CONTRIBUTORS');

if (!Number.isInteger(taxonomy.schemaVersion) || taxonomy.schemaVersion < 1) errors.push('taxonomy.schemaVersion must be a positive integer.');
if (!Array.isArray(taxonomy.facets)) errors.push('taxonomy.facets must be an array.');
if (!Array.isArray(taxonomy.tags)) errors.push('taxonomy.tags must be an array.');

const facetIds = new Set();
for (const facet of taxonomy.facets || []) {
  if (!idPattern.test(facet.id || '')) errors.push(`Malformed facet ID: ${facet.id || '(missing)'}`);
  if (facetIds.has(facet.id)) errors.push(`Duplicate facet ID: ${facet.id}`);
  facetIds.add(facet.id);
}

const tagsById = new Map();
const aliases = new Map();
for (const tag of taxonomy.tags || []) {
  if (!idPattern.test(tag.id || '')) errors.push(`Malformed tag ID: ${tag.id || '(missing)'}`);
  if (tagsById.has(tag.id)) errors.push(`Duplicate tag ID: ${tag.id}`);
  tagsById.set(tag.id, tag);
  if (!facetIds.has(tag.facet)) errors.push(`Tag ${tag.id} uses unknown facet: ${tag.facet}`);
  if (!Array.isArray(tag.broader)) errors.push(`Tag ${tag.id} must have a broader array.`);
  if (!Array.isArray(tag.aliases)) errors.push(`Tag ${tag.id} must have an aliases array.`);
  for (const alias of tag.aliases || []) {
    if (!idPattern.test(alias)) errors.push(`Malformed alias on ${tag.id}: ${alias}`);
    if (aliases.has(alias)) errors.push(`Duplicate alias ${alias} on ${tag.id} and ${aliases.get(alias)}.`);
    aliases.set(alias, tag.id);
  }
}

for (const [alias, tagId] of aliases) {
  if (tagsById.has(alias)) errors.push(`Alias ${alias} on ${tagId} duplicates a canonical tag ID.`);
}
for (const tag of tagsById.values()) {
  for (const broaderId of tag.broader || []) {
    if (!tagsById.has(broaderId)) errors.push(`Tag ${tag.id} references missing broader tag ${broaderId}.`);
  }
}

function findCycle(id, visiting = new Set(), visited = new Set()) {
  if (visiting.has(id)) return [...visiting, id];
  if (visited.has(id)) return null;
  visiting.add(id);
  for (const parent of tagsById.get(id)?.broader || []) {
    const cycle = findCycle(parent, new Set(visiting), visited);
    if (cycle) return cycle;
  }
  visited.add(id);
  return null;
}
for (const id of tagsById.keys()) {
  const cycle = findCycle(id);
  if (cycle) errors.push(`Circular broader relationship: ${cycle.join(' -> ')}`);
}

const requiredFields = ['id', 'src', 'width', 'height', 'alt', 'type', 'faction', 'homePosition', 'credits', 'tags'];
const galleryIds = new Set();
const usedTags = new Set();
for (const item of gallery || []) {
  for (const field of requiredFields) {
    if (item[field] === undefined || item[field] === null || item[field] === '') errors.push(`Gallery item ${item.id || '(missing ID)'} is missing ${field}.`);
  }
  if (!idPattern.test(item.id || '')) errors.push(`Malformed gallery item ID: ${item.id || '(missing)'}`);
  if (galleryIds.has(item.id)) errors.push(`Duplicate gallery item ID: ${item.id}`);
  galleryIds.add(item.id);
  if (!Number.isFinite(item.width) || item.width <= 0 || !Number.isFinite(item.height) || item.height <= 0) errors.push(`Gallery item ${item.id} has invalid dimensions.`);
  if (!Array.isArray(item.tags)) errors.push(`Gallery item ${item.id} must have a tags array.`);
  for (const tagId of item.tags || []) {
    usedTags.add(tagId);
    if (!tagsById.has(tagId)) errors.push(`Gallery item ${item.id} uses unknown tag ${tagId}.`);
  }
  const factionMatches = [...tagsById.values()].some((tag) => tag.facet === 'faction' && tag.label === item.faction && item.tags?.includes(tag.id));
  if (!factionMatches) errors.push(`Gallery item ${item.id} faction "${item.faction}" has no matching faction tag.`);
  if (!Array.isArray(item.credits)) errors.push(`Gallery item ${item.id} must have a credits array.`);
  for (const credit of item.credits || []) {
    if (!credit.contributorId || !contributors?.[credit.contributorId]) errors.push(`Gallery item ${item.id} references unknown contributor ${credit.contributorId || '(missing)'}.`);
    if (!credit.role) errors.push(`Gallery item ${item.id} has a credit without a role.`);
  }
}

for (const tagId of tagsById.keys()) {
  if (!usedTags.has(tagId)) info.push(`Taxonomy tag is currently unused: ${tagId}`);
}

console.log(`Gallery validation: ${gallery?.length || 0} items, ${tagsById.size} tags, ${facetIds.size} facets.`);
for (const message of info) console.log(`INFO: ${message}`);
for (const message of errors) console.error(`ERROR: ${message}`);
if (errors.length) {
  console.error(`FAILED with ${errors.length} error${errors.length === 1 ? '' : 's'}.`);
  process.exitCode = 1;
} else {
  console.log(`PASSED with ${info.length} informational coverage gap${info.length === 1 ? '' : 's'}.`);
}
