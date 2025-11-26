console.log("submit-job.js loaded!");

const form = document.getElementById("jobForm");
const messageBox = document.getElementById("formMessage");

const EDGE_FUNCTION_URL = "https://bvaykdrhpuknissuuqyi.supabase.co/functions/v1/submit-job";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submitted!");

  messageBox.textContent = "Submitting...";
  messageBox.classList.remove("text-red-600", "text-green-600");
  messageBox.classList.add("text-blue-600");

  const formData = new FormData(form);

  // Logging to verify what the form sees
  console.log("FormData entries:");
  for (let p of formData.entries()) console.log(p);

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Edge Function Response:", data);

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit job");
    }

    messageBox.textContent = "Job submitted successfully!";
    messageBox.classList.remove("text-blue-600");
    messageBox.classList.add("text-green-600");

    form.reset();

  } catch (err) {
    console.error("Submission Error:", err);

    messageBox.textContent = "Error: " + err.message;
    messageBox.classList.remove("text-blue-600");
    messageBox.classList.add("text-red-600");
  }
});
