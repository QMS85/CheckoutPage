# Checkout Page

A complete, accessible, and secure front end demo for a checkout form with live card formatting, masking, brand detection, Luhn validation, expiry and CVV checks, and helpful accessibility features. This README explains the project structure, installation, usage, testing, accessibility considerations, security guidance, and contribution notes so you can copy, run, and extend the project quickly.  

## Project Overview.  

### Purpose:
This project demonstrates a small, production-minded checkout UI that validates and formats payment inputs on the client side. It is intended for learning, prototyping, and front-end validation examples. It is not a payment processor and must never be used to store or transmit raw card data in production.

### Key Features:  

Live grouping of card number into #### #### #### #### format.

Optional masking of the card number with bullets while typing.

Luhn checksum validation for card number integrity.

Card brand detection with inline icon and text label.

Accessible tooltip explaining brand detection.

Expiry date formatting and validation.

CVV validation that adapts to detected brand (Amex 4 digits, others 3 digits).

Clear inline help text and ARIA attributes for screen readers.

Hidden raw input that stores digits only for demonstration and testing.

Minimal, dependency free HTML CSS and JavaScript.  

## Files. 
### Included files:  

index.html — Main markup with semantic structure, form, and ARIA attributes.

style.css — Styling for layout, form, brand icons, tooltip, hints, and error states.

script.js — All client-side logic: formatting, masking, brand detection, Luhn, expiry and CVV validation, tooltip behavior, and form submission handling.

README.md — This file.

### Where to paste  
Create a project folder and add the three files above. Copy the contents of each file into the corresponding file in your editor.  

## Quick Start:  

1 Create project folder and files:
```mkdir checkout-demo
cd checkout-demo
# create files: index.html style.css script.js
```
2 Copy the provided file contents  
Open each file in your editor and paste the corresponding content from the project (index.html, style.css, script.js).

3 Open locally  
Open index.html in your browser. No build step or server is required for local testing.

4 Optional local server  
To serve via a local HTTP server (recommended for some browser features):  

```
# Python 3
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

## Usage
### Filling the form

### Cardholder Name is required.

### Card Number accepts digits only. The UI groups digits into blocks of four and enforces a 16-digit limit for the demo. Masking can be toggled. The field is validated with Luhn when 16 digits are present.

### Expiry accepts MM/YY and validates month range and expiry date.

### CVV accepts digits only and enforces length depending on detected brand (3 or 4 digits).

On submit the demo prevents actual submission and shows a validation success alert. In production you would send a tokenized payment method to your server or payment gateway.

### Developer notes

The script keeps a hidden input card-number-raw containing digits only. In production you should never send raw card numbers to your server; instead use a payment gateway SDK to tokenize card data in the browser and send only tokens to your backend.  

## Accessibility
### Semantic markup

Headings use h1 and h2 for structure.

Form controls are associated with label elements using for and id.

Required fields include a visible * inside the label with aria-hidden="true" to visually indicate requirement without interfering with screen readers.

### ARIA and live regions

Inline error containers use aria-live="polite" so screen readers announce validation messages.

The card number input references help text with aria-describedby.

The brand tooltip uses role="tooltip" and is toggled on focus and hover for keyboard and pointer users.

### Keyboard and focus

Tooltip is reachable via keyboard focus on the info button.

All interactive elements are reachable by keyboard and have visible focus outlines.

### Testing suggestions

Run Lighthouse accessibility audit in Chrome DevTools.

Use axe-core browser extension to find issues.

Test with a screen reader (NVDA, VoiceOver) to confirm announcements and focus order.  

## Validation and Testing
#@ Manual tests to run

Type non-digit characters into card number and confirm they are stripped.

Paste a formatted card number with spaces and dashes and confirm only digits remain and grouping is applied.

Enter 16 digits and verify Luhn check passes for valid test numbers and fails for invalid ones.

Toggle mask and confirm last four digits remain visible while others are masked.

Enter expiry values like 01/25, 12/99, 13/25 and confirm validation messages.

Enter CVV values and confirm length enforcement for Amex and other brands.

## Automated testing ideas

Unit test formatGroups, luhnCheck, detectBrand, parseExpiry, and validateCvv functions using a JS test runner (Jest, Mocha).

Add end-to-end tests with Playwright or Cypress to simulate typing, pasting, and submission flows.

## Example test cases

Card number 4242 4242 4242 4242 should format and pass Luhn.

Card number 4111-1111-1111-1111 pasted should become 4111111111111111.

Expiry 00/22 should fail month validation.

CVV 1234 should fail for Visa but pass for Amex when brand detection indicates Amex.  

## Security and Privacy
### Important production rules

Never store or log raw card numbers on your server. Use tokenization provided by a PCI compliant payment gateway (Stripe, Braintree, Adyen, etc.).

Always use HTTPS for any page that collects payment information.

Use the payment provider’s client-side SDK to create tokens or payment methods; send only tokens to your backend.

Do not implement your own payment processing or storage unless you are fully PCI compliant.

### Client side guidance 

The demo uses a hidden raw input for demonstration only. Remove or replace this with a tokenization call in production.

Sanitize and validate inputs on the server side as well as client side. Client side validation improves UX but is not a security boundary.  

## Extending the Project
## Suggested enhancements

Replace demo submission with integration to a payment SDK to tokenize card data.

Add card brand icons as external SVG assets and lazy load them.

Add localization for help text and error messages.

Add analytics events for form interactions while ensuring no sensitive data is captured.

Add unit tests and CI pipeline to run linting and tests on push.

## Integration checklist

Remove hidden raw card input.

Integrate payment gateway client SDK.

Ensure tokenization happens before any network request to your server.

Confirm server receives only non-sensitive tokens and order metadata.  

## Contribution
## How to contribute

Fork the repository.

Create a feature branch.

Add tests for new logic.

Open a pull request with a clear description of changes.

##@ Coding style. 

Keep JavaScript dependency free and modular.

Use semantic HTML and accessible ARIA patterns.

Keep CSS simple and responsive.

## Changelog
v1.0.0

Initial demo release with card formatting, masking, brand detection, Luhn validation, expiry and CVV checks, accessible tooltip, and inline help.

### Contact
If you need help adapting this demo to a real payment integration or want suggestions for testing and CI, include a short description of your target payment provider and I can provide tailored guidance.
