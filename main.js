/* ============================================================
   ARTIST PORTFOLIO — main.js
   ============================================================ */

// Footer year
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Page navigation ──────────────────────────────────────────

const pages = document.querySelectorAll('.page');

function showPage(id) {
  pages.forEach(p => {
    p.classList.toggle('active', p.id === id);
  });

  // smooth scroll to top of document instead
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Nav cards (home → other pages)
document.querySelectorAll('.nav-card').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (target) showPage(target);
  });
});

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target || 'home';
    showPage(target);
  });
});

// ── Gallery lightbox ─────────────────────────────────────────

const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxCap   = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption;
  lightboxCap.textContent = caption;
  lightbox.classList.add('open');
  document.body.classList.add('no-scroll');
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
  document.body.classList.remove('no-scroll');
}

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img     = item.querySelector('img');
    const caption = item.querySelector('.piece-title')?.textContent || '';
    if (img?.src) openLightbox(img.src, caption);
  });
  // keyboard support
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

// ── Contact / commission form ─────────────────────────────────

const sendBtn  = document.getElementById('sendBtn');
const formNote = document.getElementById('formNote');
const ctypeSelect = document.getElementById('ctype-select');

// Clicking a type pill sets the dropdown to match
document.querySelectorAll('.ctype').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.type;
    if (ctypeSelect) ctypeSelect.value = val;
    document.querySelectorAll('.ctype').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Keep pills in sync if dropdown changes
ctypeSelect?.addEventListener('change', () => {
  const val = ctypeSelect.value;
  document.querySelectorAll('.ctype').forEach(b => {
    b.classList.toggle('active', b.dataset.type === val);
  });
});

sendBtn?.addEventListener('click', async () => {
  const name     = document.getElementById('name')?.value.trim();
  const email    = document.getElementById('email')?.value.trim();
  const type     = ctypeSelect?.value || '';
  const idea     = document.getElementById('idea')?.value.trim();
  const typeLabel = ctypeSelect?.options[ctypeSelect.selectedIndex]?.text || type;

  if (!name || !email || !idea) {
    formNote.textContent = 'Fill in all fields first.';
    return;
  }

  sendBtn.disabled = true;
  formNote.textContent = 'Sending…';

  try {
    const res = await fetch('https://formspree.io/f/mzdqyqoe', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        commission_type: typeLabel,
        message: idea
      })
    });

    if (res.ok) {
      formNote.textContent = '✓ Message sent — I\'ll get back to you soon.';
      // Clear fields
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('idea').value = '';
      if (ctypeSelect) ctypeSelect.value = '';
      document.querySelectorAll('.ctype').forEach(b => b.classList.remove('active'));
    } else {
      const data = await res.json();
      formNote.textContent = data?.errors?.[0]?.message || 'Something went wrong — try emailing directly.';
    }
  } catch (err) {
    formNote.textContent = 'Network error — try emailing ggg@gmail.com directly.';
  } finally {
    sendBtn.disabled = false;
  }
});

// ── Graceful image fallback ──────────────────────────────────
// If a nav/send image is missing, show a styled text-only fallback

document.querySelectorAll('.nav-img, .send-btn-img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.className = 'img-fallback';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.style.cssText = `
      width: 100%;
      aspect-ratio: 3 / 4;
      background: var(--canvas-mid);
      border: 1px dashed var(--canvas-dark);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Courier New', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-light);
      padding: 0.5rem;
      text-align: center;
    `;
    fallback.textContent = img.alt || 'image';
    img.parentNode.insertBefore(fallback, img);
  });
});

// same for gallery items — but keep the placeholder subtle
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.cssText = `
      background: var(--canvas-mid);
      border: 1px dashed var(--canvas-dark);
      min-height: 180px;
    `;
  });
});
