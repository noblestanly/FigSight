document.addEventListener("DOMContentLoaded", () => {
  const columns = JSON.parse(localStorage.getItem("columns") || "[]");
  const form = document.getElementById("filterColumnsForm");
  const graphOptions = document.getElementById("graphOptions");
  const proceedBtn = document.getElementById("proceedBtn");

  // populate chips
  form.innerHTML = "";
  columns.forEach((col, i) => {
    const id = `col_${i}`;
    const wrap = document.createElement("label");
    wrap.className = "chip";
    wrap.innerHTML = `
      <input type="checkbox" id="${id}" value="${col}">
      <span>${col}</span>
    `;
    form.appendChild(wrap);
  });

  // Enable proceed only after at least one action (file already uploaded)
  proceedBtn.disabled = false;

  function buildGraphOptions() {
    const type = document.getElementById("chartType").value;
    graphOptions.innerHTML = "";
    if (!type) return;
    if (type === "pie") {
      graphOptions.innerHTML = `
        <label class="label">Category</label>
        <select id="xCol" class="input">
          ${columns.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      `;
    } else {
      graphOptions.innerHTML = `
        <label class="label">X-axis</label>
        <select id="xCol" class="input">
          ${columns.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
        <label class="label">Y-axis</label>
        <select id="yCol" class="input">
          ${columns.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      `;
    }
  }

  buildGraphOptions();
  document.getElementById("chartType").addEventListener("change", buildGraphOptions);

  proceedBtn.addEventListener("click", () => {
    // save filters
    const selected = [];
    form.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => selected.push(cb.value));
    localStorage.setItem("filter_columns", JSON.stringify(selected));

    // save graph config
    const type = document.getElementById("chartType").value;
    localStorage.setItem("chart_type", type || "");
    const x = document.getElementById("xCol");
    const y = document.getElementById("yCol");
    if (x) localStorage.setItem("x_col", x.value);
    if (y) localStorage.setItem("y_col", y.value);

    showLoader("Preparing dashboard…");
    window.location.href = "/dashboard/";
  });
});

function showLoader(text) {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.querySelector(".loader-text").textContent = text || "Loading…";
  loader.classList.remove("hidden");
}
