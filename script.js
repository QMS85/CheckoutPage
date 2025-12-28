// script.js
// Live grouping (#### #### #### ####), optional masking, Luhn checksum, brand detection,
// inline brand text labels, accessible tooltip, and expiry + CVV validation with inline hints.

(function () {
  const form = document.getElementById('payment-form');
  const cardInput = document.getElementById('card-number');
  const rawInput = document.getElementById('card-number-raw');
  const maskToggle = document.getElementById('mask-toggle');
  const cardError = document.getElementById('card-number-error');
  const nameInput = document.getElementById('card-name');
  const nameError = document.getElementById('card-name-error');

  const brandIcon = document.getElementById('card-brand-icon');
  const brandText = document.getElementById('card-brand-text');
  const brandInfoBtn = document.getElementById('brand-info');
  const brandTooltip = document.getElementById('brand-tooltip');

  const expiryInput = document.getElementById('expiry');
  const expiryError = document.getElementById('expiry-error');
  const cvvInput = document.getElementById('cvv');
  const cvvError = document.getElementById('cvv-error');

  // Utility: strip non-digits
  function digitsOnly(value) {
    return (value || '').replace(/\D/g, '');
  }

  // Format digits into groups of 4: "#### #### #### ####"
  function formatGroups(digits) {
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  // Masking: show bullets except last 4 digits
  function maskValue(formatted) {
    const digits = digitsOnly(formatted);
    if (digits.length <= 4) return formatted;
    const last4 = digits.slice(-4);
    const masked = '•'.repeat(Math.max(0, digits.length - 4)) + last4;
    return formatGroups(masked);
  }

  // Luhn algorithm: returns true if number passes checksum
  function luhnCheck(numberString) {
    const digits = numberString.split('').reverse().map(d => parseInt(d, 10));
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let val = digits[i];
      if (i % 2 === 1) {
        val *= 2;
        if (val > 9) val -= 9;
      }
      sum += val;
    }
    return sum % 10 === 0;
  }

  // Brand detection using common BIN patterns
  function detectBrand(digits) {
    if (!digits) return null;
    if (/^4/.test(digits)) return 'visa';
    if (/^(5[1-5])/.test(digits) || /^(22[2-9]|2[3-6]\d|27[01]|2720)/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';
    if (/^35/.test(digits)) return 'jcb';
    if (/^(30[0-5]|36|38|39)/.test(digits)) return 'diners';
    return 'unknown';
  }

  // Minimal inline SVGs for brands
  const brandSvgs = {
    visa: '<svg viewBox="0 0 48 30" width="48" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="48" height="30" rx="3" fill="#1a1f71"/><text x="24" y="20" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#fff" text-anchor="middle">VISA</text></svg>',
    mastercard: '<svg viewBox="0 0 48 30" width="48" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="48" height="30" rx="3" fill="#fff"/><circle cx="20" cy="15" r="9" fill="#ff5f00"/><circle cx="28" cy="15" r="9" fill="#eb001b" opacity="0.95"/></svg>',
    amex: '<svg viewBox="0 0 48 30" width="48" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="48" height="30" rx="3" fill="#2e77bb"/><text x="24" y="20" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#fff" text-anchor="middle">AMEX</text></svg>',
    discover: '<svg viewBox="0 0 48 30" width="48" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="48" height="30" rx="3" fill="#fff"/><text x="24" y="20" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#f76b00" text-anchor="middle">DISCOVER</text></svg>',
    jcb: '<svg viewBox="0 0 48 30" width="48" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="48" height="30" rx="3" fill="#0b5fff"/><text x="24" y="20" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#fff" text-anchor="middle">JCB</text></svg>',
    diners: '<svg viewBox="0 0 48 30" width="48" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="48" height="30" rx="3" fill="#0b5fff"/><text x="24" y="20" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#fff" text-anchor="middle">DINERS</text></svg>',
    unknown: '<svg viewBox="0 0 48 30" width="48" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="48" height="30" rx="3" fill="#f3f4f6"/><text x="24" y="20" font-family="Arial, Helvetica, sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">CARD</text></svg>'
  };

  // Update displayed value while preserving caret as best as possible
  function updateDisplayFromDigits(digits, setCaret) {
    const formatted = formatGroups(digits);
    const display = maskToggle && maskToggle.checked ? maskValue(formatted) : formatted;
    const prev = cardInput.value;
    const prevPos = cardInput.selectionStart || prev.length;
    cardInput.value = display;
    rawInput.value = digits;
    if (setCaret) {
      const digitCountBefore = digitsOnly(prev.slice(0, prevPos)).length;
      let pos = 0, seen = 0;
      while (pos < cardInput.value.length && seen < digitCountBefore) {
        if (/\d|•/.test(cardInput.value[pos])) seen++;
        pos++;
      }
      cardInput.setSelectionRange(pos, pos);
    }
    updateBrand(digits);
  }

  // Show/hide card error
  function setCardError(message) {
    if (message) {
      cardError.textContent = message;
      cardError.hidden = false;
      cardInput.setAttribute('aria-invalid', 'true');
    } else {
      cardError.textContent = '';
      cardError.hidden = true;
      cardInput.removeAttribute('aria-invalid');
    }
  }

  // Update brand icon and text
  function updateBrand(digits) {
    const brand = detectBrand(digits);
    if (!brand) {
      brandIcon.innerHTML = '';
      brandText.textContent = 'Card';
      brandIcon.setAttribute('aria-hidden', 'true');
      brandText.setAttribute('aria-hidden', 'true');
      return;
    }
    brandIcon.innerHTML = brandSvgs[brand] || brandSvgs.unknown;
    brandText.textContent = brand === 'unknown' ? 'Card' : brand.charAt(0).toUpperCase() + brand.slice(1);
    brandIcon.setAttribute('aria-hidden', 'false');
    brandText.setAttribute('aria-hidden', 'false');
  }

  // Expiry helpers
  function parseExpiry(value) {
    const cleaned = value.replace(/\s+/g, '');
    const m = cleaned.match(/^(\d{1,2})\/?(\d{2}|\d{4})$/);
    if (!m) return null;
    let month = parseInt(m[1], 10);
    let year = parseInt(m[2], 10);
    if (year < 100) {
      // two-digit year -> convert to 2000+
      year += 2000;
    }
    return { month, year };
  }

  function isExpiryValid(value) {
    const parsed = parseExpiry(value);
    if (!parsed) return { valid: false, reason: 'Format must be MM/YY' };
    const { month, year } = parsed;
    if (month < 1 || month > 12) return { valid: false, reason: 'Month must be between 01 and 12' };
    // end of month
    const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
    const now = new Date();
    if (expiryDate < now) return { valid: false, reason: 'Card is expired' };
    return { valid: true };
  }

  // CVV helpers: length depends on brand (Amex 4, others 3)
  function requiredCvvLength(brand) {
    return brand === 'amex' ? 4 : 3;
  }

  function validateCvv(value, brand) {
    const digits = digitsOnly(value);
    const required = requiredCvvLength(brand);
    if (!digits) return { valid: false, reason: 'CVV is required' };
    if (!/^\d+$/.test(digits)) return { valid: false, reason: 'CVV must contain only digits' };
    if (digits.length !== required) return { valid: false, reason: `CVV must be ${required} digits` };
    return { valid: true };
  }

  // Live input handler for card number
  cardInput.addEventListener('input', (e) => {
    const raw = e.target.value;
    const digits = digitsOnly(raw).slice(0, 16);
    updateDisplayFromDigits(digits, true);

    // validation feedback
    if (digits.length === 0) {
      setCardError('');
      cardInput.setCustomValidity('');
    } else if (digits.length < 16) {
      setCardError('Card number must be 16 digits.');
      cardInput.setCustomValidity('Card number must be 16 digits.');
    } else {
      // 16 digits entered — run Luhn
      if (!luhnCheck(digits)) {
        setCardError('Card number failed Luhn check.');
        cardInput.setCustomValidity('Card number failed Luhn check.');
      } else {
        setCardError('');
        cardInput.setCustomValidity('');
      }
    }

    // Update CVV hint maxlength based on brand
    const brand = detectBrand(digits);
    const cvvLen = requiredCvvLength(brand);
    cvvInput.maxLength = cvvLen;
    // update CVV hint text if present
    const cvvHelp = document.getElementById('cvv-help');
    if (cvvHelp) {
      cvvHelp.textContent = brand === 'amex'
        ? '4 digits for American Express.'
        : '3 digits for most cards.';
    }
  });

  // Handle paste into card input
  cardInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const digits = digitsOnly(paste).slice(0, 16);
    const start = cardInput.selectionStart || 0;
    const end = cardInput.selectionEnd || 0;
    const before = digitsOnly(cardInput.value.slice(0, start));
    const after = digitsOnly(cardInput.value.slice(end));
    const combined = (before + digits + after).slice(0, 16);
    updateDisplayFromDigits(combined, false);
    cardInput.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Toggle masking on change
  if (maskToggle) {
    maskToggle.addEventListener('change', () => {
      const digits = rawInput.value || digitsOnly(cardInput.value);
      updateDisplayFromDigits(digits, false);
    });
  }

  // Expiry input: format as MM/YY while typing and validate
  expiryInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/[^\d]/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length >= 3) {
      v = v.slice(0, 2) + '/' + v.slice(2);
    }
    e.target.value = v;
    const check = isExpiryValid(v);
    if (!v) {
      expiryError.textContent = '';
      expiryError.hidden = true;
      expiryInput.setCustomValidity('');
    } else if (!check.valid) {
      expiryError.textContent = check.reason;
      expiryError.hidden = false;
      expiryInput.setCustomValidity(check.reason);
    } else {
      expiryError.textContent = '';
      expiryError.hidden = true;
      expiryInput.setCustomValidity('');
    }
  });

  expiryInput.addEventListener('blur', () => {
    const check = isExpiryValid(expiryInput.value);
    if (!check.valid) {
      expiryError.textContent = check.reason;
      expiryError.hidden = false;
      expiryInput.setCustomValidity(check.reason);
    } else {
      expiryError.textContent = '';
      expiryError.hidden = true;
      expiryInput.setCustomValidity('');
    }
  });

  // CVV input: allow only digits, enforce length based on detected brand
  cvvInput.addEventListener('input', () => {
    const brand = detectBrand(digitsOnly(cardInput.value));
    const required = requiredCvvLength(brand);
    let v = digitsOnly(cvvInput.value).slice(0, required);
    cvvInput.value = v;
    const result = validateCvv(v, brand);
    if (!v) {
      cvvError.textContent = '';
      cvvError.hidden = true;
      cvvInput.setCustomValidity('');
    } else if (!result.valid) {
      cvvError.textContent = result.reason;
      cvvError.hidden = false;
      cvvInput.setCustomValidity(result.reason);
    } else {
      cvvError.textContent = '';
      cvvError.hidden = true;
      cvvInput.setCustomValidity('');
    }
  });

  cvvInput.addEventListener('blur', () => {
    const brand = detectBrand(digitsOnly(cardInput.value));
    const result = validateCvv(cvvInput.value, brand);
    if (!result.valid) {
      cvvError.textContent = result.reason;
      cvvError.hidden = false;
      cvvInput.setCustomValidity(result.reason);
    } else {
      cvvError.textContent = '';
      cvvError.hidden = true;
      cvvInput.setCustomValidity('');
    }
  });

  // Name field simple validation
  nameInput.addEventListener('input', () => {
    if (!nameInput.value.trim()) {
      nameError.textContent = 'Cardholder name is required.';
      nameError.hidden = false;
      nameInput.setCustomValidity('Required');
    } else {
      nameError.textContent = '';
      nameError.hidden = true;
      nameInput.setCustomValidity('');
    }
  });

  // Tooltip accessibility: show/hide on focus/blur and mouseenter/mouseleave
  function showTooltip() {
    brandTooltip.hidden = false;
    brandTooltip.setAttribute('aria-hidden', 'false');
  }
  function hideTooltip() {
    brandTooltip.hidden = true;
    brandTooltip.setAttribute('aria-hidden', 'true');
  }

  brandInfoBtn.addEventListener('focus', showTooltip);
  brandInfoBtn.addEventListener('blur', hideTooltip);
  brandInfoBtn.addEventListener('mouseenter', showTooltip);
  brandInfoBtn.addEventListener('mouseleave', hideTooltip);

  // On submit: ensure all validations pass (card number, expiry, cvv, name)
  form.addEventListener('submit', (e) => {
    const digits = digitsOnly(cardInput.value);
    rawInput.value = digits;

    let valid = true;

    // Name
    if (!nameInput.value.trim()) {
      nameError.textContent = 'Cardholder name is required.';
      nameError.hidden = false;
      nameInput.setCustomValidity('Required');
      valid = false;
      nameInput.focus();
    } else {
      nameError.textContent = '';
      nameError.hidden = true;
      nameInput.setCustomValidity('');
    }

    // Card number
    if (!digits || digits.length !== 16) {
      setCardError('Card number must be exactly 16 digits with no spaces or dashes.');
      cardInput.setCustomValidity('Invalid card number');
      valid = false;
      cardInput.focus();
    } else if (!luhnCheck(digits)) {
      setCardError('Card number failed Luhn check.');
      cardInput.setCustomValidity('Invalid card number');
      valid = false;
      cardInput.focus();
    } else {
      setCardError('');
      cardInput.setCustomValidity('');
    }

    // Expiry
    const expiryCheck = isExpiryValid(expiryInput.value);
    if (!expiryCheck.valid) {
      expiryError.textContent = expiryCheck.reason;
      expiryError.hidden = false;
      expiryInput.setCustomValidity(expiryCheck.reason);
      valid = false;
      expiryInput.focus();
    } else {
      expiryError.textContent = '';
      expiryError.hidden = true;
      expiryInput.setCustomValidity('');
    }

    // CVV
    const brand = detectBrand(digits);
    const cvvCheck = validateCvv(cvvInput.value, brand);
    if (!cvvCheck.valid) {
      cvvError.textContent = cvvCheck.reason;
      cvvError.hidden = false;
      cvvInput.setCustomValidity(cvvCheck.reason);
      valid = false;
      cvvInput.focus();
    } else {
      cvvError.textContent = '';
      cvvError.hidden = true;
      cvvInput.setCustomValidity('');
    }

    if (!valid) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    // Demo: prevent actual submission and show raw card number (digits only)
    e.preventDefault();
    alert('Payment validated (demo). Raw card number: ' + rawInput.value);
  });

  // Initialize display if any prefilled value exists
  (function init() {
    const initialDigits = digitsOnly(cardInput.value).slice(0, 16);
    updateDisplayFromDigits(initialDigits, false);
    hideTooltip();
    // set initial CVV maxlength based on brand if any
    const brand = detectBrand(initialDigits);
    cvvInput.maxLength = requiredCvvLength(brand);
  })();
})();
      
