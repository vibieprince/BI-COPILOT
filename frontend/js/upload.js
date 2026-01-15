const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const analyzeBtn = document.getElementById('analyze-btn');

const states = {
  idle: document.getElementById('state-idle'),
  selected: document.getElementById('state-selected'),
  error: document.getElementById('state-error'),
  processing: document.getElementById('state-processing')
};

const fileNameEl = document.getElementById('file-name');
const fileSizeEl = document.getElementById('file-size');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const errorMsg = document.getElementById('error-msg');

let selectedFile = null;

/* ---------------- UI STATE HANDLER ---------------- */

function setUIState(active) {
  Object.keys(states).forEach(k => {
    states[k].classList.toggle('hidden', k !== active);
  });
}

/* ---------------- FILE PICKER ---------------- */

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
  handleFile(e.target.files[0]);
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
});

/* ---------------- FILE VALIDATION ---------------- */

function handleFile(file) {
  if (!file) return;

  if (!file.name.endsWith('.csv')) {
    errorMsg.textContent = 'Only CSV files are supported.';
    setUIState('error');
    analyzeBtn.disabled = true;
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    errorMsg.textContent = 'File exceeds 50MB limit.';
    setUIState('error');
    return;
  }

  selectedFile = file;
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';

  setUIState('selected');
  analyzeBtn.disabled = false;
}

/* ---------------- BACKEND UPLOAD ---------------- */

analyzeBtn.addEventListener('click', uploadDataset);

async function uploadDataset() {
  if (!selectedFile) return;

  setUIState('processing');
  analyzeBtn.disabled = true;

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    statusText.textContent = 'Uploading file...';
    progressBar.style.width = '30%';

    const res = await fetch('http://127.0.0.1:8000/upload/', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');

    statusText.textContent = 'Processing dataset...';
    progressBar.style.width = '70%';

    const data = await res.json();

    // Store session
    localStorage.setItem('session_id', data.session_id);

    progressBar.style.width = '100%';
    statusText.textContent = 'Redirecting...';

    setTimeout(() => {
      window.location.href = 'chat.html';
    }, 600);

  } catch (err) {
    errorMsg.textContent = 'Upload failed. Please try again.';
    setUIState('error');
    analyzeBtn.disabled = false;
  }
}
