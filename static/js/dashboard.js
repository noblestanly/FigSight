let currentChart = null;

function q(id) { return document.getElementById(id); }
function showLoader(text) {
  const loader = q("loader");
  if (!loader) return;
  loader.querySelector(".loader-text").textContent = text || "Loading…";
  loader.classList.remove("hidden");
}
function hideLoader() {
  const loader = q("loader");
  if (!loader) return;
  loader.classList.add("hidden");
}
function showMessage(msg) {
  // Put message inside table area for visibility
  const table = q("dataTable");
  if (table) table.innerHTML = `<tr><td>${msg}</td></tr>`;
}

async function loadDashboard(filters = {}) {
  // Grab DOM targets early and validate
  const filterForm = q("filterForm");
  const chartCard  = q("chartCard");
  const chartEl    = q("chart");
  const dataTable  = q("dataTable");

  if (!filterForm || !chartCard || !chartEl || !dataTable) {
    console.error("Dashboard DOM elements missing. Check IDs: filterForm, chartCard, chart, dataTable.");
    return;
  }

  const selectedFilters = JSON.parse(localStorage.getItem("filter_columns") || "[]");
  const chartType = (localStorage.getItem("chart_type") || "").trim();
  const xCol = localStorage.getItem("x_col");
  const yCol = localStorage.getItem("y_col");

  const params = new URLSearchParams(filters);
  selectedFilters.forEach(f => params.append("filters", f));
  if (chartType) params.set("chart_type", chartType);
  if (xCol) params.set("x_col", xCol);
  if (yCol) params.set("y_col", yCol);

  console.log("Requesting /api/dashboard with:", params.toString());

  showLoader("Loading dashboard…");
  try {
    const res = await fetch(`/api/dashboard/?${params.toString()}`);
    const data = await res.json();
    console.log("Dashboard API response:", data);

    if (data.error) {
      showMessage("❌ " + data.error);
      if (chartCard) chartCard.style.display = "none";
      return;
    }

    // ---- Build Filters ----
    const filtersData = data.filters || {};
    filterForm.innerHTML = "";
    for (const [col, values] of Object.entries(filtersData)) {
      if (!selectedFilters.includes(col)) continue;

      const select = document.createElement("select");
      select.name = col;
      select.className = "input";
      select.innerHTML = `<option value="">-- All ${col} --</option>`;
      (values || []).forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        if (data.filters_applied && data.filters_applied[col] === v) opt.selected = true;
        select.appendChild(opt);
      });
      filterForm.appendChild(select);
    }

    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply Filters";
    applyBtn.type = "submit";
    applyBtn.className = "btn btn-blue";
    filterForm.appendChild(applyBtn);

    filterForm.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(filterForm);
      const newFilters = {};
      for (const [k, v] of formData.entries()) {
        if (v) newFilters[k] = v;
      }
      loadDashboard(newFilters);
    };

    // ---- Build Chart (optional) ----
    const ctx = chartEl.getContext("2d");
    const hasChartConfig = !!chartType;
    const hasChartData = data.chart_data && Object.keys(data.chart_data).length > 0;

    if (!hasChartConfig || !hasChartData) {
      chartCard.style.display = "none";
      if (!hasChartConfig) {
        console.info("No chart configured (chart_type empty) — chart section hidden.");
      } else {
        console.info("Chart configured but no data returned — chart section hidden.");
      }
    } else {
      chartCard.style.display = "block";
      if (currentChart) currentChart.destroy();

      currentChart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: Object.keys(data.chart_data),
          datasets: [{
            data: Object.values(data.chart_data),
            backgroundColor: [
              "#4e79a7","#f28e2b","#e15759",
              "#76b7b2","#59a14f","#edc949",
              "#af7aa1","#ff9da7"
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: chartType === "pie" } }
        }
      });
    }

    // ---- Build Table ----
    const rows = Array.isArray(data.rows) ? data.rows : [];
    if (!rows.length) {
      dataTable.innerHTML = "<tr><td colspan='99'>No records available</td></tr>";
    } else {
      const cols = Object.keys(rows[0]);
      const header = "<tr>" + cols.map(c => `<th>${c}</th>`).join("") + "</tr>";
      const body = rows.map(r => {
        return "<tr>" + cols.map(c => `<td>${r[c] ?? ""}</td>`).join("") + "</tr>";
      }).join("");
      dataTable.innerHTML = header + body;
    }

  } catch (e) {
    console.error("Dashboard load failed:", e);
    showMessage("❌ Error loading dashboard: " + e.message);
  } finally {
    hideLoader();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Ensure required elements exist before calling
  if (!document.getElementById("dataTable")) {
    console.error("dataTable element not found. Check your dashboard.html.");
    return;
  }
  loadDashboard();
});