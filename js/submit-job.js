const EDGE_FUNCTION_URL = "https://<project>.functions.supabase.co/submit-job";

console.log("submit-job.js loaded!");
document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const messageBox = document.getElementById("formMessage");
  messageBox.textContent = "Submitting...";
  messageBox.className = "text-blue-600";

  try {
    const formData = new FormData(form);

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Unknown error occurred.");

    messageBox.textContent = "Job submitted successfully!";
    messageBox.className = "text-green-600";
    form.reset();
  } catch (err) {
    console.error(err);
    messageBox.textContent = err.message || "Error submitting job.";
    messageBox.className = "text-red-600";
  }
});
