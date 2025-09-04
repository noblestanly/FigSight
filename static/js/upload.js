document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("uploadForm");
    const resultDiv = document.getElementById("uploadResult"); // 👈 define this

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const res = await fetch("/api/upload/", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.error) {
                resultDiv.innerText = "❌ " + data.error;
            } else {
                resultDiv.innerText = "✅ File uploaded!";
                // Save columns for filter selection page
                localStorage.setItem("columns", JSON.stringify(data.columns));
                window.location.href = "/select-columns/";
            }
        } catch (err) {
            resultDiv.innerText = "❌ Upload failed: " + err.message;
        }
    });
});
