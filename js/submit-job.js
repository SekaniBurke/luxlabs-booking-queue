import { supabase } from "./supabase.js";

document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const job = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    affiliation: document.getElementById("affiliation").value,
    id_number: document.getElementById("id_number").value || null,
    is_class_project: document.getElementById("is_class_project").value === "yes",
    class_name: document.getElementById("class_name").value || null,
    service_type: document.getElementById("service_type").value,
    description: document.getElementById("description").value,
    file_link: document.getElementById("file_link").value || null,
    status: "pending_review",
  };

  const { data, error } = await supabase.from("jobs").insert(job);

  const statusMessage = document.getElementById("statusMessage");

  if (error) {
    console.error(error);
    statusMessage.textContent = "Error submitting job. Please try again.";
    statusMessage.style.color = "red";
  } else {
    statusMessage.textContent =
      "Job submitted successfully! You will receive a confirmation email after review.";
    statusMessage.style.color = "green";

    document.getElementById("jobForm").reset();
  }
});
