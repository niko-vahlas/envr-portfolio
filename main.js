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
