# Gallery metadata

The gallery uses `assets/js/gallery-data.js` for published image records and `assets/data/gallery-taxonomy.json` for the canonical classification vocabulary. Wasted Content Studio may propose metadata, but a person must review and approve every new or changed public taxonomy entry.

## Gallery item contract

Every item keeps these fields:

- `id`: stable kebab-case public identifier; never reuse or change it after publication.
- `src`: relative image URL.
- `width` and `height`: positive intrinsic pixel dimensions.
- `alt`: concise description of meaningful visible content.
- `type`: convenient public display text retained for compatibility.
- `faction`: convenient public display text retained for compatibility; it must match the label of a faction tag on the item.
- `homePosition`: CSS object-position used in cropped views.
- `credits`: an array of `{ contributorId, role }` records.
- `tags`: stable canonical IDs used for classification and filtering.

`type` and `faction` are display conveniences. `tags` are the canonical filtering and classification layer. Contributor roles are independent: a Painter credit does not imply that person was the Photographer, and vice versa.

## Taxonomy contract

`gallery-taxonomy.json` has a positive integer `schemaVersion`, ordered `facets`, and `tags`. Each facet has `id`, `label`, `description`, and `order`. Each tag has:

- stable kebab-case `id`
- public `label`
- `facet` ID
- plain-language `description`
- zero or more `broader` tag IDs
- zero or more kebab-case `aliases`
- `status` such as `active` or `deprecated`
- `filter.enabled`, `filter.group`, and `filter.order`

The available facets are `content-type`, `game-system`, `faction`, `subject`, `context`, and `editorial`. A broader relationship means “narrower than,” not merely “often associated with.” Cross-facet associations should usually remain as multiple tags on an item rather than forced parentage. For example, `daemon-engine` is a subject and its faction is recorded separately.

## Adding taxonomy entries

For a faction, game system, or subject, add a unique tag under the corresponding facet with a description, status, relationship arrays, and filter metadata. Faction filters appear automatically only when the tag is active, has `filter.enabled: true`, has facet `faction`, and is used by at least one gallery item. Game-system and subject tags currently remain badge metadata unless deliberately enabled in a future interface.

To rename a public label, keep the canonical ID unchanged. To accept an older or alternate machine term, add it to `aliases`. To retire an alias, first ensure no producer emits it; remove it only after consumers have migrated. To retire a canonical tag, mark it `deprecated`, document its replacement in the description, and migrate published items deliberately—never silently rename an ID.

## Adding gallery items

Use a descriptive, unique kebab-case image ID and a matching lowercase filename where practical. Do not encode mutable captions or contributor names into IDs. Supply accurate intrinsic dimensions and meaningful alt text that describes the visible subject without repeating “image of.” Decorative contact-sheet thumbnails use empty alt text because their containing buttons already have accessible names; the lightbox exposes the full item alt text.

Add separate credits for each known role. Use the contributor ID from `assets/js/contributors-data.js`, and do not infer a Photographer from a Painter credit.

Run validation after every metadata change:

```text
node scripts/validate-gallery.mjs
```

## Filter generation and failure behavior

The browser loads the JSON taxonomy before building controls. Primary and faction buttons use taxonomy labels and order. Only represented factions are shown. Tag badges also use taxonomy labels. Unknown tag IDs fall back to readable title case. If JSON loading fails, gallery images still render and a data-derived fallback supplies the established primary and represented-faction filters; the browser console receives a concise diagnostic.

Photo query parameters and lightbox behavior continue to use stable gallery item IDs. Keep all URLs relative for GitHub Pages.

## Wasted Content Studio boundary

The tool should consume the taxonomy and gallery contracts exactly, report coverage gaps, and propose new tags with a suggested facet, label, description, relationships, aliases, status, and filter metadata. It must not automatically approve, publish, rename, or deprecate taxonomy entries. Human review is required before a proposal enters `gallery-taxonomy.json`.
