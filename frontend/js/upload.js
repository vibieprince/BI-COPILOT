async function uploadCSV() {
  const fileInput = document.getElementById("csvFile");
  const resultDiv = document.getElementById("result");
  const meta = document.getElementById("meta");
  const summary = document.getElementById("summary");

  if (!fileInput.files.length) {
    alert("Please select a CSV file");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch("http://127.0.0.1:8000/upload/", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    meta.innerText = `File: ${data.filename} | Rows: ${data.rows} | Columns: ${data.columns}`;
    summary.innerText = JSON.stringify(data.summary, null, 2);

    resultDiv.classList.remove("hidden");

  } catch (error) {
    alert("Error uploading file");
    console.error(error);
  }
}

// Attach a safe click handler to the Analyze button to prevent any default navigation
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("analyzeBtn");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Analyze button clicked — starting uploadCSV");
    uploadCSV();
  });
});
