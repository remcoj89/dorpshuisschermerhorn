// Talentenkaart: sends the form to a Google Apps Script web app,
// which appends each submission as a row to the Google Sheet.
// The endpoint is the form's action attribute (the web app URL ending in /exec).
const form = document.getElementById('talentenkaart');
const statusEl = document.getElementById('form-status');
const successEl = document.getElementById('form-success');

if (form && statusEl && successEl) {
  const submitButton = form.querySelector('[type="submit"]');
  const errorMessage = 'Er ging iets mis bij het versturen. Probeer het later nog eens, of mail je antwoorden naar info@dorpshuisschermerhorn.nl.';

  const showError = (message, field) => {
    statusEl.textContent = message;
    if (field) field.focus();
  };

  // Our own check instead of the browser bubbles, so messages are in Dutch and consistent
  const validate = () => {
    if (!form.naam.value.trim()) {
      showError('Vul je naam in.', form.naam);
      return false;
    }

    // Basic format check (name@domain.tld); novalidate turns off the browser's own check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) {
      showError('Vul een geldig e-mailadres in.', form.email);
      return false;
    }

    if (!form.toestemming.checked) {
      showError('Geef toestemming dat we contact met je mogen opnemen.', form.toestemming);
      return false;
    }

    return true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusEl.textContent = '';

    if (!validate()) return;

    if (!form.action.startsWith('https://script.google.com/')) {
      showError(errorMessage);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Bezig met versturen…';

    try {
      // URLSearchParams keeps this a "simple" request, so no CORS preflight is needed
      const response = await fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(new FormData(form))
      });
      const result = await response.json();

      if (!result.ok) throw new Error(result.error || 'Onbekende fout');

      form.hidden = true;
      successEl.hidden = false;
      successEl.focus();
    } catch (error) {
      showError(errorMessage);
      submitButton.disabled = false;
      submitButton.textContent = 'Verstuur mijn talentenkaart';
    }
  });
}
