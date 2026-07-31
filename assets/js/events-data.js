// Keep confirmed event information here so it works on GitHub Pages and in a local file preview.
// Unconfirmed fields should remain clearly labeled rather than guessed.
// detailsUrl is also the canonical sharing destination. Leave it blank until the event page exists.
window.WASTED_WARGAMING_EVENT_DATA = {
  events: [
    {
      id: 'first-gathering-tbd',
      status: 'Mission confirmed: details incoming',
      title: 'Enter the Tomb',
      message: 'A cooperative learn-to-play mission for four recruits and one experienced Commander.',
      dateDisplay: 'To be announced',
      timeDisplay: '6 PM happy hour; 7 PM walk; games until 10 PM',
      meetLocation: 'Joystick Gamebar',
      playLocation: 'Dice City Games',
      costDisplay: '$10 Dice City table fee; no added event fee',
      gameSystem: 'Warhammer 40,000: Kill Team, Joint Ops',
      formatDisplay: 'Cooperative play',
      materialsDisplay: 'Miniatures, terrain, dice, and printed rules',
      ageDisplay: 'All ages; the group leaves Joystick before its 9 PM 21+ policy',
      availability: 'RSVP not yet open',
      rsvpUrl: 'TBD',
      detailsUrl: 'joint-ops.html',
      detailsLabel: 'Read the mission briefing',
      artSrc: 'assets/images/events/tomb-world-joint-ops-v2.jpg',
      theme: 'tomb-world'
    },
    {
      id: 'war-for-octarius-planning',
      status: 'Planning signal: mission not yet confirmed',
      title: 'War for Octarius',
      message: 'The sector is collapsing into an ever-widening war. Death Korps veterans enter a scrap-built settlement while Ork Kommandos stalk its gantries, oil pumps, and barricades.',
      dateDisplay: 'To be announced',
      gameSystem: 'Warhammer 40,000: Kill Team, Killzone Octarius',
      formatDisplay: 'Cooperative or versus protocol under review',
      materialsDisplay: 'Kill teams, Octarius terrain, dice, and rules',
      audienceDisplay: 'Recruit event with Commander guidance',
      availability: 'Planning file: event not yet confirmed',
      rsvpUrl: 'TBD',
      detailsLabel: 'Full briefing classified',
      artSrc: 'assets/images/events/octarius-killzone.jpg',
      theme: 'octarius',
      classifiedFields: ['dateDisplay', 'formatDisplay']
    }
  ],
  fallback: {
    status: 'Update pending',
    title: 'Next event announcement incoming',
    message: 'Confirmed event details will be posted here.',
    dateDisplay: 'To be announced',
    availability: 'Not yet open'
  }
};
