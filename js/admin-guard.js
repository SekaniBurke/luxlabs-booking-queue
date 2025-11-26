import { supabase } from "./supabase.js";

async function enforceAdminAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = "/admin/login.html";
        return;
    }

    const user = session.user;

    const { data: profile, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        window.location.href = "/admin/login.html";
    }
}

enforceAdminAuth();
