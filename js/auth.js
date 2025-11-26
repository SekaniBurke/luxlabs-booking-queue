import { supabase } from "./supabase.js";

// Redirect if already logged in
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = "/admin/index.html";
    }
});

// Login handler
document.getElementById("adminLoginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Login failed: " + error.message);
        return;
    }

    // Now check if the user is actually an admin
    const user = data.user;
    const { data: profile } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        alert("Access denied — not an admin.");
        await supabase.auth.signOut();
        return;
    }

    window.location.href = "/admin/index.html";
});