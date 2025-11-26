import { supabase } from "./supabase.js";
import { requireAdminOrRedirect } from "./auth.js";

await requireAdminOrRedirect();

const jobsBody = document.getElementById("jobsBody");
const filterStatus = document.getElementById("filterStatus");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const signOutBtn = document.getElementById("signOutBtn");

// logout
signOutBtn?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/admin/login.html";
});

refreshBtn.addEventListener("click", loadJobs);
filterStatus.addEventListener("change", loadJobs);
searchInput.addEventListener("input", debounce(loadJobs, 300));

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

async function loadJobs() {
  jobsBody.innerHTML = `<tr><td colspan="7" class="p-4 text-center">Loading...</td></tr>`;

  const selectedStatus = filterStatus.value;

  let query = supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  const { data, error } = await query;
  if (error) return showError(error);

  let jobs = data;

  const search = searchInput.value.trim().toLowerCase();
  if (search) {
    jobs = jobs.filter((job) =>
      (job.full_name || "").toLowerCase().includes(search) ||
      (job.email || "").toLowerCase().includes(search)
    );
  }

  renderJobs(jobs);
}

function showError(err) {
  console.error(err);
  jobsBody.innerHTML = `<tr><td colspan="7" class="p-4 text-red-600">Error loading jobs</td></tr>`;
}

function renderJobs(jobs) {
  if (!jobs || jobs.length === 0) {
    jobsBody.innerHTML = `<tr><td colspan="7" class="p-4 text-gray-600">No jobs found</td></tr>`;
    return;
  }

  jobsBody.innerHTML = "";

  for (const job of jobs) {
    const fileCount = Array.isArray(job.file_urls) ? job.file_urls.length : 0;

    const row = document.createElement("tr");
    row.className = "border-b";

    row.innerHTML = `
      <td class="p-3">${escape(job.full_name)}</td>
      <td class="p-3">${escape(job.email)}</td>
      <td class="p-3">${escape(job.service_type)}</td>
      <td class="p-3">${fileCount}</td>
      <td class="p-3">${escape(job.status)}</td>
      <td class="p-3">${new Date(job.created_at).toLocaleString()}</td>
      <td class="p-3">
        <a href="/admin/job.html?id=${job.id}" class="px-3 py-1 bg-indigo-600 text-white rounded mr-2">
          View
        </a>
        <button data-id="${job.id}" class="px-3 py-1 bg-green-600 text-white rounded mark-complete">
          Complete
        </button>
      </td>
    `;

    jobsBody.appendChild(row);
  }

  document.querySelectorAll(".mark-complete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await supabase.from("jobs").update({ status: "completed" }).eq("id", id);
      loadJobs();
    });
  });
}

function escape(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m];
  });
}

loadJobs();
