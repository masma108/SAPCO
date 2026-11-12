(() => {
  'use strict';
  const data = window.SAPCO || {};
  const navToggle = document.querySelector('#nav-toggle');
  const nav = document.querySelector('#header-nav');
  if (navToggle && nav) {
    const close = () => {nav.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open navigation');};
    navToggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => {if (e.key === 'Escape') close();});
    document.addEventListener('click', e => {if (!nav.contains(e.target) && !navToggle.contains(e.target)) close();});
  }

  document.querySelectorAll('[data-copy]').forEach(element => {
    const k = element.getAttribute('data-copy');
    const value = data[k];
    if (typeof value === 'string' && value.trim()) element.textContent = value;
    else if (element.hasAttribute('data-placeholder')) element.textContent = element.getAttribute('data-placeholder');
  });

  const year = document.querySelector('#current-year');
  if(year) year.textContent = new Date().getFullYear();

  // A dedicated founder profile instead of a cropped LinkedIn screenshot.
  const spotlight=document.querySelector('#founder-spotlight');
  if(spotlight && data.founderName){
    const name=spotlight.querySelector('[data-founder-name]');
    if(name) name.textContent=data.founderName;
  }

  // Web3Forms Free plan: quote fields only; file attachments require its Pro plan.
  const form = document.querySelector('#contact-form');
  if (form) {
    const status = document.querySelector('#contact-status');
    const submit = form.querySelector('button[type="submit"]');
    const key = String(data.web3formsAccessKey || '').trim();
    const configured = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(key);
    const setStatus = (message, isError = false) => {
      if (!status) return;
      status.textContent = message;
      status.style.color = isError ? '#a14635' : '#435c3f';
    };
    if (!configured) {
      if (submit) submit.disabled = true;
      setStatus('Online submissions are being activated. For now, please email sapco.cgroup@gmail.com or call (682) 702-5746.', true);
    } else {
      setStatus('Your inquiry will be sent directly to SAPCO after submission.');
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!configured || !form.reportValidity()) return;
      if (submit) submit.disabled = true;
      setStatus('Submitting your inquiry…');
      try {
        const formData = new FormData(form);
        if (String(formData.get('website') || '').trim()) throw new Error('Unable to process this submission.');
        const dataToSend = {
          access_key: key,
          subject: 'SAPCO Website — ' + String(formData.get('inquiryType') || 'New Inquiry'),
          from_name: 'SAPCO Website',
          name: String(formData.get('name') || ''),
          company: String(formData.get('company') || ''),
          email: String(formData.get('email') || ''),
          phone: String(formData.get('phone') || ''),
          'Inquiry Type': String(formData.get('inquiryType') || ''),
          'Project Location': String(formData.get('location') || ''),
          'Project Timeline': String(formData.get('timeline') || ''),
          message: String(formData.get('message') || ''),
          'Plans or Photo Link': String(formData.get('filesLink') || ''),
          'Contact Consent': formData.has('consent') ? 'Yes' : 'No',
          botcheck: String(formData.get('botcheck') || '')
        };
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
          body: JSON.stringify(dataToSend)
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error(result.message || 'The form service did not accept your inquiry.');
        form.reset();
        setStatus('Thank you! Your inquiry has been submitted to SAPCO. We will review your message and follow up.');
      } catch (error) {
        setStatus('We could not send your inquiry. ' + (error.message || '') + ' Please email sapco.cgroup@gmail.com or call (682) 702-5746.', true);
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }
})();



// Optional homepage film: starts only when the visitor requests it, with original audio.
(() => {
  const film = document.getElementById('sapco-film');
  const button = document.getElementById('sapco-film-play');
  if (!film || !button) return;
  film.autoplay = false;
  film.loop = false;
  film.muted = false;
  film.defaultMuted = false;
  film.pause();
  const update = () => {
    const playing = !film.paused && !film.ended;
    button.classList.toggle('playing', playing);
    button.setAttribute('aria-label', playing ? 'Pause SAPCO promotional video' : 'Play SAPCO promotional video with sound');
    const label = button.querySelector('span');
    if(label)label.textContent = playing ? 'Pause video' : 'Play video';
  };
  button.addEventListener('click', () => {
    if (film.paused || film.ended) {
      if (film.ended) film.currentTime = 0;
      film.muted = false;
      film.play().catch(() => {button.querySelector('span').textContent = 'Unable to play video';});
    } else film.pause();
  });
  film.addEventListener('play',update);
  film.addEventListener('pause',update);
  film.addEventListener('ended',update);
  update();
})();
