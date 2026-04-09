// Fetch and render markdown content for journals and assignments
async function loadMarkdown(entry, bodySelector) {
  const src = entry.getAttribute('data-src');
  const body = entry.querySelector(bodySelector);
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(res.statusText);
    const md = await res.text();
    body.innerHTML = marked.parse(md);
  } catch {
    body.innerHTML =
      '<p class="load-error">Could not load content. Run the site via a local server (e.g. <code>python3 -m http.server 8000</code>).</p>';
  }
}

document
  .querySelectorAll('.journal-entry[data-src]')
  .forEach((entry) => loadMarkdown(entry, '.journal-body'));

document
  .querySelectorAll('.assignment-entry[data-src]')
  .forEach((entry) => loadMarkdown(entry, '.assignment-body'));

// Load rationale
const rationaleBody = document.getElementById('rationale-body');
if (rationaleBody) {
  fetch('rationale.md')
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText);
      return res.text();
    })
    .then((md) => {
      rationaleBody.innerHTML = marked.parse(md);
    })
    .catch(() => {
      rationaleBody.innerHTML =
        '<p class="load-error">Could not load rationale. Run the site via a local server (e.g. <code>python3 -m http.server 8000</code>).</p>';
    });
}

// Render PDF pages as canvases so they appear when printing
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.querySelectorAll('.file-embed').forEach((embed) => {
  const iframe = embed.querySelector('iframe');
  if (!iframe) return;

  const container = document.createElement('div');
  container.className = 'print-pdf-pages print-only';
  embed.insertAdjacentElement('afterend', container);

  pdfjsLib.getDocument(iframe.src).promise.then(async (pdf) => {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      container.appendChild(canvas);
    }
  });
});

const navLinks = {
  journals: document.getElementById('nav-journals'),
  assignments: document.getElementById('nav-assignments'),
  rationale: document.getElementById('nav-rationale'),
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        Object.values(navLinks).forEach((link) =>
          link.classList.remove('active'),
        );
        const link = navLinks[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  },
  { rootMargin: '-20% 0px -70% 0px' },
);

document
  .querySelectorAll('section[id]')
  .forEach((section) => observer.observe(section));
