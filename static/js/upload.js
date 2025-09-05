document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const chooseBtn = document.querySelector('label[for="fileInput"]');
  const analyzeBtn = form.querySelector("button[type=submit]");
  const resultDiv = document.getElementById("uploadResult");
  const MAX_BYTES = 3 * 1024 * 1024; // 3MB

  // start with disabled analyze until file is picked
  analyzeBtn.disabled = true;

  fileInput.addEventListener("change", () => {
    resultDiv.textContent = "";
    const f = fileInput.files[0];
    if (!f) { analyzeBtn.disabled = true; return; }
    if (f.size > MAX_BYTES) {
      resultDiv.textContent = "❌ File too large. Max 3 MB.";
      fileInput.value = "";
      analyzeBtn.disabled = true;
      return;
    }
    analyzeBtn.disabled = false; // file ok; allow submit
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = fileInput.files[0];
    if (!f) return;

    // safety check again
    if (f.size > MAX_BYTES) {
      resultDiv.textContent = "❌ File too large. Max 3 MB.";
      return;
    }

    // show loader & disable buttons
    showLoader("Uploading file…");
    analyzeBtn.disabled = true;
    chooseBtn.classList.add("disabled");

    const formData = new FormData(form);
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
      const res = await fetch("/api/upload/", {
        method: "POST",
        headers: { "X-CSRFToken": csrf },
        body: formData
      });
      const data = await res.json();
      if (data.error) {
        resultDiv.textContent = "❌ " + data.error;
        analyzeBtn.disabled = false; // allow retry
        return;
      }
      resultDiv.textContent = "✅ File uploaded!";
      localStorage.setItem("columns", JSON.stringify(data.columns));
      hideLoader();
      // enable proceed button on next page; or redirect right away:
      window.location.href = "/select-columns/";
    } catch (err) {
      resultDiv.textContent = "❌ Upload failed: " + err.message;
    } finally {
      hideLoader();
    }
  });
});

function showLoader(text) {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.querySelector(".loader-text").textContent = text || "Loading…";
  loader.classList.remove("hidden");
}
function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("hidden");
}

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('navToggle');
  const container = document.querySelector('header .container');

  if (!toggle || !container) return;

  toggle.addEventListener('click', function () {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.classList.toggle('open');

    // add/remove nav-open on container so CSS can show/hide the nav panel
    container.classList.toggle('nav-open');
  });

  // close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.classList.contains('nav-open')) return;
    if (container.contains(e.target)) return; // click inside
    container.classList.remove('nav-open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  // close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('nav-open')) {
      container.classList.remove('nav-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
});
