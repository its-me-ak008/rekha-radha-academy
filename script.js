const LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyDM9wieCjogihYXrYNpAw8wbRU9POU-RNcxv0hmCI7kwvq5tJTD3lGOmVAMshZkB948g/exec';

const form = document.getElementById('leadForm');
const messageBox = document.getElementById('formMessage');
const visitorInfoInput = document.getElementById('visitorInfo');

function getVisitorInfo() {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get('utm_source') || 'direct',
    medium: params.get('utm_medium') || 'none',
    campaign: params.get('utm_campaign') || 'none',
    term: params.get('utm_term') || 'none',
  };

  return {
    page: window.location.pathname,
    referrer: document.referrer || 'direct',
    language: navigator.language,
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    visitTimestamp: new Date().toISOString(),
    utm,
  };
}

function setVisitorInfo() {
  visitorInfoInput.value = JSON.stringify(getVisitorInfo());
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `form-message ${type}`;
}

function setFieldError(input, message) {
  const errorElement = input.parentElement.querySelector('.input-error');

  if (message) {
    input.classList.add('invalid');
    errorElement.textContent = message;
  } else {
    input.classList.remove('invalid');
    errorElement.textContent = '';
  }
}

function validateField(input, rules = []) {
  const value = input.value.trim();
  let message = '';

  for (const rule of rules) {
    if (rule === 'required' && !value) {
      message = 'This field is required.';
      break;
    }

    if (rule === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = 'Please enter a valid email address.';
      break;
    }

    if (rule === 'phone' && value && !/^[0-9+()\-\s]{7,15}$/.test(value)) {
      message = 'Please enter a valid phone number.';
      break;
    }
  }

  setFieldError(input, message);
  return !message;
}

async function submitToGoogleScript(payload) {
  if (!LEAD_ENDPOINT || LEAD_ENDPOINT.includes('PASTE_')) {
    return false;
  }

  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    const finalValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    params.append(key, finalValue);
  });

  const response = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: params.toString(),
  });

  return response.type === 'opaque' || response.ok;
}

function saveFallback(payload) {
  const storedLeads = JSON.parse(localStorage.getItem('tailorcraft_leads') || '[]');
  storedLeads.push(payload);
  localStorage.setItem('tailorcraft_leads', JSON.stringify(storedLeads));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const phoneInput = form.querySelector('input[name="phone"]');

  const nameValid = validateField(nameInput, ['required']);
  const emailValid = validateField(emailInput, ['email']);
  const phoneValid = validateField(phoneInput, ['required', 'phone']);

  if (!nameValid || !emailValid || !phoneValid) {
    showMessage('Please fill in your name, valid email, and phone number correctly.', 'error');
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.visitorInfo = JSON.parse(payload.visitorInfo || '{}');

  showMessage('Submitting your details...', 'success');

  try {
    const sent = await submitToGoogleScript(payload);

    if (sent) {
      showMessage('Thank you! Your details have been submitted successfully.', 'success');
    } else {
      saveFallback(payload);
      showMessage('Your details were saved locally for testing. Add your Google Apps Script URL to send real leads to Google.', 'success');
    }

    form.reset();
    setVisitorInfo();
  } catch (error) {
    saveFallback(payload);
    showMessage('There was a temporary issue, but your lead was saved locally. Please check your Google connection later.', 'error');
    console.error(error);
  }
});

setVisitorInfo();
