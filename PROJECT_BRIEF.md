# Wasted Wargaming Website Project Brief

Create and maintain the official website for **Wasted Wargaming**, a beginner-friendly miniature-wargaming event and collaboration between **Joystick Gamebar** and **Dice City Games** in East Atlanta Village, Atlanta.

## Core purpose

The website should:

1. Make miniature wargaming feel approachable to complete newcomers.
2. Explain what Wasted Wargaming is and how an event works.
3. Direct visitors to upcoming events and RSVP through Meetup.
4. Help experienced players volunteer as teachers.
5. Cross-promote Joystick, Dice City, and participating local gaming groups.
6. Establish a distinctive identity for Wasted Wargaming without making it feel like a formal business.

The event is intended as a community-building collaboration rather than primarily a profit-making venture.

## Audience

The primary audience is:

- People curious about Warhammer or miniature wargaming who have never played.
- Casual hobbyists who may feel intimidated by rules, cost, painting, or established gaming communities.
- Existing players interested in teaching newcomers.
- Customers of Joystick and Dice City who may not currently visit the other business.

The site must make it clear that visitors do **not** need to own miniatures, know the rules, or have prior experience.

## Event concept

A typical event works like this:

1. Guests meet at **Joystick Gamebar** for a relaxed wargaming happy hour.
2. Newcomers can meet players, ask questions, get a drink, and choose what they want to try.
3. The group walks together from Joystick to **Dice City Games**.
4. Volunteers run beginner-friendly games using provided miniatures, terrain, rules references, dice, and other materials.
5. The featured introductory game will initially be **Kill Team: Joint Ops**, a cooperative mode that allows newcomers and teachers to play together rather than immediately competing.
6. Other beginner sessions, such as Age of Sigmar Spearhead, may be offered through collaborating groups.

This progression is important because it literally leads new customers from one neighborhood business to the other while removing the social friction of arriving alone at an unfamiliar game store.

## Initial website format

Build the first release as a **single-page, mobile-first static website**. Use clearly separated sections and anchor navigation.

Initial sections:

1. **Hero**
   - Wasted Wargaming logo
   - “Beginner-friendly miniature wargaming in East Atlanta Village”
   - Prominent “New players welcome” message
   - Primary button for the next event or RSVP
   - Secondary button explaining how it works

2. **What is Wasted Wargaming?**
   - Brief explanation of the Joystick and Dice City collaboration
   - Emphasis on welcoming newcomers and providing everything needed

3. **How it works**
   - Visual three-step or four-step timeline:
     - Meet at Joystick
     - Grab a drink and meet the group
     - Walk together to Dice City
     - Learn and play
   - This should be one of the clearest parts of the site

4. **Upcoming events**
   - Featured next-event card
   - Date, start time, locations, cost, game system, and availability
   - RSVP button leading to Meetup
   - Link to view all events
   - Event data should not be duplicated throughout the HTML

5. **What we provide**
   - Miniatures
   - Dice
   - Terrain
   - Rules references
   - Beginner instruction
   - No purchase or prior preparation required

6. **What you can play**
   - Initially highlight Kill Team: Joint Ops
   - Allow room for future systems such as Age of Sigmar Spearhead
   - Avoid overwhelming newcomers with detailed game rules

7. **For experienced players**
   - Invite friendly, patient volunteers to teach
   - Explain that volunteering is about welcoming newcomers rather than demonstrating expertise
   - Include a volunteer/contact link

8. **Partners**
   - Joystick Gamebar
   - Dice City Games
   - Space for collaborating groups such as South of the Sump
   - Include outbound links and concise descriptions

9. **FAQ**
   Include questions such as:
   - Do I need to know how to play?
   - Do I need to bring miniatures?
   - Do I need to paint anything?
   - Is this a tournament?
   - Can I come alone?
   - Is there an age requirement?
   - How much does it cost?
   - Can experienced players attend?
   - Where should I park?
   - What happens if an event fills up?

10. **Stay connected**
    - Meetup
    - Discord
    - Instagram or other social accounts
    - Email/contact option if added later

11. **Footer**
    - Partner links
    - Basic copyright text
    - Clear statement that relevant game trademarks belong to their respective owners
    - Do not imply official sponsorship by Games Workshop

## Future page structure

The initial site should remain one page, but its components and file structure should make it easy to create these pages later:

- `/events/`
- `/learn-to-play/`
- `/volunteer/`
- `/about/`
- `/faq/`

Do not create unnecessary empty pages in the first release.

## Visual direction

The visual identity should combine:

- Grimdark miniature-wargaming atmosphere
- Neon, nightlife, and retro crime-game energy
- East Atlanta Village bar-and-game-store character
- Printed underground event flyer aesthetics
- A slightly distressed or photocopied texture
- Selective neon accents rather than an overwhelming rainbow effect

The existing Wasted Wargaming identity draws loosely from the dramatic “WASTED” presentation associated with crime games, combined with a gothic wargaming sensibility. Do not directly copy protected game branding or official Warhammer graphics.

The site should feel:

- Stylish
- Fun
- Welcoming
- Slightly irreverent
- Community-oriented
- Legible and polished

It should **not** feel:

- Corporate
- Like a software startup
- Like an esports tournament
- Hostile or overly militaristic
- So grimdark that newcomers feel unwelcome
- Like an official Games Workshop website

## Accessibility and mobile design

Mobile is the priority because many visitors will arrive through social media, Meetup, Discord, or a QR code on printed material.

Requirements:

- Strong text contrast
- Readable body type
- Comfortable tap targets
- No essential information communicated only through color
- Keyboard-accessible navigation
- Meaningful alt text
- Respect reduced-motion preferences
- Responsive layouts at common phone, tablet, and desktop sizes
- Avoid large media files that slow mobile loading
- No autoplaying audio or video

## Technical requirements

For the initial version:

- Use plain HTML, CSS, and JavaScript.
- Do not use React, Next.js, or another framework unless later requirements justify it.
- Do not add a package manager or build process.
- Keep the site compatible with GitHub Pages.
- Use relative file paths.
- Preserve the existing `CNAME` file containing:

  ```text
  www.wastedwargaming.com
  ```

- Do not delete, rename, or overwrite the `CNAME` file.
- Keep event information in a clearly separated data source such as `events.json`.
- Include a graceful manually maintained event card.
- Leave a clearly documented place where a Meetup widget can later be inserted.
- Structure the event display so it can eventually consume a Vercel serverless API endpoint without redesigning the visible page.
- Do not expose API keys or secrets in browser-side JavaScript.
- Keep the code understandable to a nonprofessional developer working with Codex.

## Hosting plan

Current hosting:

- GitHub repository: `bgoodnight/wasted-wargaming`
- GitHub Pages
- Custom domain: `www.wastedwargaming.com`

Future possibility:

- Migrate the same GitHub repository to Vercel when server-side functionality is required.
- Possible future Meetup integration through an approved API, third-party widget, or other supported event feed.

Do not make the site dependent on Vercel yet.

## Content handling

Use clearly labeled placeholders for information that has not been finalized, including:

- First event date
- Exact schedule
- Admission or table fee
- Meetup URL
- Volunteer form
- Discord link
- Instagram link
- Partner logos
- Event photographs

Do not invent confirmed details.

## Working rules

Before making substantial changes:

1. Read this project brief.
2. Inspect the current repository.
3. Preserve working deployment and domain configuration.
4. Explain the proposed implementation briefly.
5. Make changes locally.
6. Run a local preview and check desktop and mobile layouts.
7. Check links, paths, accessibility, and browser errors.
8. Do not commit or push changes unless explicitly instructed.

