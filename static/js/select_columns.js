document.addEventListener("DOMContentLoaded", () => {
    const columns = JSON.parse(localStorage.getItem("columns") || "[]");
    const form = document.getElementById("filterColumnsForm");
    const graphOptions = document.getElementById("graphOptions");

    // Build checkboxes for filters
    columns.forEach((col, i) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <input type="checkbox" id="col_${i}" value="${col}">
            <label for="col_${i}">${col}</label>
        `;
        form.appendChild(div);
    });

    // Function to build graph options
    function buildGraphOptions() {
        const type = document.getElementById("chartType").value;
        graphOptions.innerHTML = "";

        if (!type) return; // 👈 allow skipping graph selection

        if (type === "pie") {
            graphOptions.innerHTML = `
                <label>Category Column:</label>
                <select id="xCol">
                    ${columns.map(c => `<option value="${c}">${c}</option>`).join("")}
                </select>
            `;
        } else if (type === "bar" || type === "line") {
            graphOptions.innerHTML = `
                <label>X-axis Column:</label>
                <select id="xCol">
                    ${columns.map(c => `<option value="${c}">${c}</option>`).join("")}
                </select>
                <label>Y-axis Column:</label>
                <select id="yCol">
                    ${columns.map(c => `<option value="${c}">${c}</option>`).join("")}
                </select>
            `;
        }
    }

    buildGraphOptions();
    document.getElementById("chartType").addEventListener("change", buildGraphOptions);

    // Save selections and go to dashboard
    document.getElementById("proceedBtn").addEventListener("click", () => {
        // Save filter columns
        const selectedFilters = [];
        document.querySelectorAll("#filterColumnsForm input:checked").forEach(cb => {
            selectedFilters.push(cb.value);
        });
        localStorage.setItem("filter_columns", JSON.stringify(selectedFilters));

        // Save graph config
        const type = document.getElementById("chartType").value;
        localStorage.setItem("chart_type", type || ""); // 👈 may be blank
        if (document.getElementById("xCol")) {
            localStorage.setItem("x_col", document.getElementById("xCol").value);
        }
        if (document.getElementById("yCol")) {
            localStorage.setItem("y_col", document.getElementById("yCol").value);
        }

        // Redirect
        window.location.href = "/dashboard/";
    });
});
