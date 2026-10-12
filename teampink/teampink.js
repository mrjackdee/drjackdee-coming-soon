(() => {
  const form = document.querySelector('#order-form');
  const button = document.querySelector('#submit-button');
  const status = document.querySelector('#form-status');
  let orderId = crypto.randomUUID();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || button.disabled) return;
    const values = new FormData(form);
    const data = { orderId, name: values.get('name').trim(), address: values.get('address').trim(), phone: values.get('phone').trim(), email: values.get('email').trim(), mail: values.has('mail'), website: values.get('website') };
    button.disabled = true;
    status.classList.remove('error');
    status.textContent = 'Submitting your order…';
    try {
      const response = await fetch('/api/teampink-order', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(30000)});
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Your order could not be submitted. Please try again.');
      form.hidden = true;
      const confirmation = document.querySelector('#confirmation');
      confirmation.hidden = false;
      document.querySelector('#delivery-confirmation').textContent = data.mail ? 'You requested mailing to the address you provided.' : 'You requested that your tumbler not be mailed.';
      document.querySelector('#order-reference').textContent = 'Order reference: ' + orderId;
      confirmation.focus();
    } catch (error) {
      status.classList.add('error');
      status.textContent = error.name === 'TimeoutError' ? 'The connection timed out. Please submit again; your order reference prevents duplicate orders.' : error.message;
    } finally { button.disabled = false; }
  });
})();
