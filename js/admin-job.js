// js/admin-job.js
import { supabase } from "./supabase.js";
import { requireAdminOrRedirect } from "./auth.js";

await requireAdminOrRedirect();

const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");

const container = document.getElementById("jobContainer");
const signOutBtn = document.getElementById("signOutBtn");
signOutBtn?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/admin/login.html";
});

if (!jobId) {
  container.innerHTML = "<p class='text-red-600'>Missing job id</p>";
  throw new Error("No job id");
}

async function loadJob() {
  container.innerHTML = "<p>Loading...</p>";
  const { data: job, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  if (error || !job) {
    container.innerHTML = `<p class="text-red-600">Error loading job: ${error?.message || "Not found"}</p>`;
    return;
  }

  const files = Array.isArray(job.file_urls) ? job.file_urls : (job.file_url ? [job.file_url] : []);
  const fileLinks = await Promise.all(files.map(async (p) => {
    // create signed URL for each private file
    const { data: signed, error: urlErr } = await supabase.storage.from("job-files").createSignedUrl(p, 60 * 60); // 1 hour
    if (urlErr) return { name: p.split("/").pop(), url: null, error: urlErr.message };
    return { name: p.split("/").pop(), url: signed.signedUrl };
  }));

  container.innerHTML = `
    <h2 class="text-xl font-bold mb-2">${escapeHtml(job.customer_name || "No name")}</h2>
    <div class="text-sm text-gray-600 mb-4">Submitted: ${new Date(job.created_at).toLocaleString()}</div>

    <div class="mb-4">
      <strong>Service:</strong> ${escapeHtml(job.service_type || "")}<br/>
      <strong>Role:</strong> ${escapeHtml(job.role || "")}<br/>
      <strong>ID #:</strong> ${escapeHtml(job.id_number || "")}
    </div>

    <div class="mb-4">
      <strong>Description / Notes:</strong>
      <div class="p-3 bg-gray-50 rounded mt-2">${escapeHtml(job.description || job.notes || "")}</div>
    </div>

    <div class="mb-4">
      <strong>Files:</strong>
      <ul id="filesList" class="list-disc ml-6 mt-2">
        ${fileLinks.map(f => `<li>${f.url ? `<a target="_blank" href="${f.url}" class="text-indigo-600">${escapeHtml(f.name)}</a>` : `${escapeHtml(f.name)} (no access)`}</li>`).join("")}
      </ul>
    </div>

    <div class="mb-4">
      <label class="font-semibold">Queue Status</label>
      <select id="queueStatus" class="p-2 border rounded">
        <option value="submitted">Submitted</option>
        <option value="approved">Approved</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button id="updateStatusBtn" class="ml-3 p-2 bg-indigo-600 text-white rounded">Update</button>
    </div>

    <div class="mb-4">
      <label class="font-semibold">Admin Notes</label>
      <textarea id="adminNotes" class="w-full p-2 border rounded h-28">${escapeHtml(job.admin_notes || "")}</textarea>
      <div class="mt-2">
        <button id="saveNotesBtn" class="p-2 bg-green-600 text-white rounded">Save Notes</button>
      </div>
    </div>

    <div id="actions" class="mt-4"></div>
  `;

  // set queueStatus current
  document.getElementById("queueStatus").value = job.queue_status || "submitted";

  document.getElementById("updateStatusBtn").addEventListener("click", async () => {
    const newStatus = document.getElementById("queueStatus").value;
    await supabase.from("jobs").update({ queue_status: newStatus }).eq("id", jobId);
    alert("Status updated");
    loadJob();
  });

  document.getElementById("saveNotesBtn").addEventListener("click", async () => {
    const notes = document.getElementById("adminNotes").value;
    await supabase.from("jobs").update({ admin_notes: notes }).eq("id", jobId);
    alert("Notes saved");
    loadJob();
  });
}

function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, function (m) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m];
  });
}

loadJob();
