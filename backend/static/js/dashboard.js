let currentChart = null;

async function loadDashboard(filters = {}) {
    const selectedFilters = JSON.parse(localStorage.getItem("filter_columns") || "[]");
    const chartType = localStorage.getItem("chart_type") || ""; // optional
    const xCol = localStorage.getItem("x_col");
    const yCol = localStorage.getItem("y_col");

    // Build API query
    const params = new URLSearchParams(filters);
    selectedFilters.forEach(f => params.append("filters", f));
    if (chartType) params.set("chart_type", chartType);
    if (xCol) params.set("x_col", xCol);
    if (yCol) params.set("y_col", yCol);

    const res = await fetch(`/api/dashboard/?${params.toString()}`);
    const data = await res.json();

    console.log("Dashboard API response:", data); // 👈 debug in DevTools

    if (data.error) {
        document.getElementById("dataTable").innerHTML =
            `<tr><td>${data.error}</td></tr>`;
        return;
    }

    // Build filter dropdowns
    const filterForm = document.getElementById("filterForm");
    filterForm.innerHTML = "";
    const filtersData = data.filters || {}; // 👈 avoid undefined crash

    for (const [col, values] of Object.entries(filtersData)) {
        if (!selectedFilters.includes(col)) continue;

        const select = document.createElement("select");
        select.name = col;
        select.innerHTML = `<option value="">-- All ${col} --</option>`;
        values.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v;
            opt.textContent = v;
            if (data.filters_applied[col] === v) opt.selected = true;
            select.appendChild(opt);
        });
        filterForm.appendChild(select);
    }

    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply Filters";
    applyBtn.type = "submit";
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

    // Chart (optional)
    const chartCard = document.getElementById("chartCard");
    const ctx = document.getElementById("chart").getContext("2d");

    if (!chartType) {
        chartCard.style.display = "none"; // hide if user skipped chart
    } else {
        chartCard.style.display = "block"; // show chart
        if (currentChart) currentChart.destroy();

        if (data.chart_data && Object.keys(data.chart_data).length > 0) {
            currentChart = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: Object.keys(data.chart_data),
                    datasets: [{
                        data: Object.values(data.chart_data),
                        backgroundColor: [
                            "#4e79a7","#f28e2b","#e15759",
                            "#76b7b2","#59a14f","#edc949"
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        } else {
            ctx.font = "16px Arial";
            ctx.fillText("No data available for chart", 20, 40);
        }
    }

    // Table
    const table = document.getElementById("dataTable");
    table.innerHTML = "";
    if (data.rows && data.rows.length > 0) {
        const headerRow =
            "<tr>" + Object.keys(data.rows[0])
                .map(c => `<th>${c}</th>`).join("") + "</tr>";
        const rows =
            data.rows.map(r =>
                "<tr>" + Object.values(r)
                    .map(v => `<td>${v}</td>`).join("") + "</tr>"
            ).join("");
        table.innerHTML = headerRow + rows;
    } else {
        table.innerHTML = "<tr><td colspan='99'>No records available</td></tr>";
    }
}

window.onload = () => loadDashboard();
