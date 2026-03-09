const API = "https://phi-lab-server.vercel.app/api/v1/lab";

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initDashboard();
});

function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    if (u === "admin" && p === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "index.html";
    } else {
      document.getElementById("errorMessage").classList.remove("hidden");
    }
  });
}

function initDashboard() {
  const grid = document.getElementById("issuesGrid");
  if (!grid) return;

  const spinner = document.getElementById("loadingSpinner");
  const issueCount = document.getElementById("issueCount");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  let allIssues = [];
  let filter = "all";

  loadIssues();

  async function loadIssues() {
    spinner.classList.remove("hidden");

    const res = await fetch(API + "/issues");
    const data = await res.json();

    allIssues = data.data;

    spinner.classList.add("hidden");
    render();
  }

  function render() {
    grid.innerHTML = "";

    let list = allIssues;

    if (filter === "open") {
      list = allIssues.filter((i) => i.status === "open");
    }

    if (filter === "closed") {
      list = allIssues.filter((i) => i.status === "closed");
    }

    issueCount.textContent = list.length;

    list.forEach((issue) => {
      const card = document.createElement("div");

      // ✅ STATUS CLASS ADDED
      card.className = `issue-card ${issue.status}`;

      let statusImage =
        issue.status === "open"
          ? "assets/Open-Status.png"
          : "assets/Closed-Status.png";

      card.innerHTML = `
        <div class="card-header">
          <img class="status-icon" src="${statusImage}">
          <span class="priority-badge ${issue.priority}">
            ${issue.priority}
          </span>
        </div>

        <div class="card-content">
          <h3>${issue.title}</h3>
          <p>${issue.description}</p>
        </div>

        <div class="labels-container">
          ${(issue.labels || [])
            .map((l) => `<span class="label-badge">${l}</span>`)
            .join("")}
        </div>

        <div class="card-footer">
          <span>${issue.author}</span>
          <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>
      `;

      card.onclick = () => openModal(issue.id);

      grid.appendChild(card);
    });
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll(".tab-btn").forEach((b) =>
        b.classList.remove("active")
      );

      btn.classList.add("active");

      filter = btn.dataset.tab;
      render();
    };
  });

  searchBtn.onclick = async () => {
    const q = searchInput.value;

    const res = await fetch(API + "/issues/search?q=" + q);
    const data = await res.json();

    allIssues = data.data;
    render();
  };

  const modal = document.getElementById("issueModal");
  const modalHeader = document.getElementById("modalHeader");
  const modalBody = document.getElementById("modalBody");

  async function openModal(id) {
    const res = await fetch(API + "/issue/" + id);
    const data = await res.json();

    const issue = data.data;
    const date = new Date(issue.createdAt).toLocaleDateString();

    modal.classList.remove("hidden");

    modalHeader.innerHTML = `
      <h2>${issue.title}</h2>

      <div class="modal-meta">
        <span class="status-pill">${issue.status}</span>
        <span>Opened by <b>${issue.author}</b> • ${date}</span>
      </div>
    `;

    modalBody.innerHTML = `
      <div class="modal-labels">
        ${(issue.labels || [])
          .map((label) => `<span class="label-badge">${label}</span>`)
          .join("")}
      </div>

      <div class="modal-description">
        <p>${issue.description}</p>
      </div>

      <div class="modal-info-grid">

        <div class="info-item">
          <label>Assignee</label>
          <p>${issue.assignee || "Unassigned"}</p>
        </div>

        <div class="info-item">
          <label>Priority</label>
          <span class="priority-pill">${issue.priority}</span>
        </div>

      </div>
    `;
  }

  document.getElementById("closeModal").onclick = () =>
    modal.classList.add("hidden");

  document.getElementById("closeModalBtn").onclick = () =>
    modal.classList.add("hidden");

  document.getElementById("modalOverlay").onclick = () =>
    modal.classList.add("hidden");
}