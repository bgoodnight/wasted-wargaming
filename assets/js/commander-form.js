const commanderForm = document.querySelector('[data-commander-form]');

if (commanderForm) {
  const endpoint = window.WASTED_WARGAMING_COMMANDER_FORM_ENDPOINT?.trim() || commanderForm.action;
  const setupNote = commanderForm.querySelector('[data-form-setup-note]');
  const status = commanderForm.querySelector('[data-form-status]');
  const submitButton = commanderForm.querySelector('button[type="submit"]');

  if (endpoint && setupNote) setupNote.hidden = true;

  commanderForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!commanderForm.reportValidity()) return;

    if (!endpoint) {
      status.textContent = 'Application delivery is not connected yet. Your information has not been sent.';
      status.className = 'form-status form-status--error';
      status.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    status.textContent = 'Sending your application…';
    status.className = 'form-status';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(commanderForm),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Submission failed');
      window.location.assign('commander-thanks.html');
    } catch {
      status.textContent = 'We could not send your application. Please try again or contact us through the Dice City Discord.';
      status.className = 'form-status form-status--error';
      submitButton.disabled = false;
      submitButton.textContent = 'Send application';
      status.focus();
    }
  });
}
