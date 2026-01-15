const chatFeed = document.getElementById("chat-feed");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const thinking = document.getElementById("thinking");

const sessionId = localStorage.getItem("session_id");

if (!sessionId) {
  alert("Session expired. Please upload dataset again.");
  window.location.href = "upload.html";
}

/* ---------------- HELPERS ---------------- */

function scrollToBottom() {
  chatFeed.scrollTo({ top: chatFeed.scrollHeight, behavior: "smooth" });
}

function addUserMessage(text) {
  const div = document.createElement("div");
  div.className = "flex flex-col gap-2 max-w-4xl mx-auto items-end";
  div.innerHTML = `
    <div class="user-bubble px-5 py-3 rounded-2xl rounded-tr-none text-sm text-sky-100 shadow-lg">
      ${text}
    </div>
    <span class="text-[9px] font-bold text-slate-600 uppercase mr-1">
      ${new Date().toLocaleTimeString()}
    </span>
  `;
  chatFeed.appendChild(div);
  scrollToBottom();
}

function addAIMessage(html) {
  const div = document.createElement("div");
  div.className = "flex flex-col gap-3 max-w-4xl mx-auto";
  div.innerHTML = `
    <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
      AI Analyst
    </div>
    <div class="ai-bubble p-5 rounded-2xl rounded-tl-none shadow-xl space-y-4">
      ${html}
    </div>
  `;
  chatFeed.appendChild(div);
  scrollToBottom();
}

/* ---------------- CHART RENDERING ---------------- */

function renderChart(chartConfig) {
  const canvasId = "chart-" + Date.now();
  addAIMessage(`
    <canvas id="${canvasId}" height="200"></canvas>
  `);

  setTimeout(() => {
    new Chart(document.getElementById(canvasId), chartConfig);
  }, 50);
}

/* ---------------- SEND QUESTION ---------------- */

async function sendQuestion() {
  const question = chatInput.value.trim();
  if (!question) return;

  chatInput.value = "";
  addUserMessage(question);

  thinking.classList.remove("hidden");
  scrollToBottom();

  try {
    const res = await fetch("http://127.0.0.1:8000/query/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: sessionId,
        question: question
      })
    });

    if (!res.ok) throw new Error("Query failed");

    const data = await res.json();

    thinking.classList.add("hidden");

    // Text response
    addAIMessage(`
      <p class="text-sm text-slate-300">
        Showing <strong>${data.operation}</strong> of 
        <strong>${data.metric}</strong> by 
        <strong>${data.dimension}</strong>.
      </p>
    `);

    if (data.rows && data.rows.length) {
      renderTable(data.rows, data.dimension, data.metric);
    }

    if (data.chart) {
      renderChart(data.chart);
    }
    } catch (err) {
      thinking.classList.add("hidden");
      addAIMessage(`
        <p class="text-red-400 text-sm">
          Unable to process query. Please try again.
        </p>
      `);
    }
    console.log("Chart object:", data.chart);
}

/* ---------------- EVENTS ---------------- */

sendBtn.addEventListener("click", sendQuestion);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendQuestion();
  }
});

function renderTable(rows, dimension, metric) {
  let html = `
    <div class="overflow-x-auto">
      <table class="w-full text-sm border border-slate-800 rounded-xl overflow-hidden">
        <thead class="bg-slate-900">
          <tr>
            <th class="px-4 py-2 text-left text-slate-400 uppercase text-[10px]">${dimension}</th>
            <th class="px-4 py-2 text-right text-slate-400 uppercase text-[10px]">${metric}</th>
          </tr>
        </thead>
        <tbody>
  `;

  rows.forEach(r => {
    html += `
      <tr class="border-t border-slate-800">
        <td class="px-4 py-2 text-slate-300">${r[dimension]}</td>
        <td class="px-4 py-2 text-right text-sky-400 font-semibold">${r.sum}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  addAIMessage(html);
}

function renderChart(chart) {
  const id = "chart-" + Date.now();

  addAIMessage(`
    <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
      <canvas id="${id}" height="240"></canvas>
    </div>
  `);

  setTimeout(() => {
    const ctx = document.getElementById(id);
    if (!ctx) return;

    new Chart(ctx, {
      type: chart.type,
      data: chart.data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#cbd5f5",
              font: { size: 10 }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8" },
            grid: { display: false }
          },
          y: {
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(148,163,184,0.1)" }
          }
        }
      }
    });
  }, 100);
}

