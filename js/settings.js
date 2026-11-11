
document.addEventListener("DOMContentLoaded", async () => {

    const supabase = window.supabaseClient;

    const themePreference = document.getElementById("themePreference");
    const accountEmail = document.getElementById("accountEmail");
    const memberSince = document.getElementById("memberSince");

    const passwordModal = document.getElementById("passwordModal");
    const passwordForm = document.getElementById("passwordForm");
    const passwordMessage = document.getElementById("passwordMessage");

    const changePasswordBtn = document.getElementById("changePasswordBtn");
    const closePasswordModal = document.getElementById("closePasswordModal");
    const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");

    const settingsMessage = document.getElementById("settingsMessage");

    // Check login session
    const { data: { session }, error } =
        await supabase.auth.getSession();

    if (error || !session) {
        window.location.href = "login.html";
        return;
    }

    const user = session.user;

    // Load account information
    accountEmail.textContent = user.email || "Not available";

    if (user.created_at) {
        memberSince.textContent = new Date(user.created_at)
            .toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    } else {
        memberSince.textContent = "Not available";
    }

    // Sidebar user information
    const sidebarUserName = document.getElementById("sidebarUserName");
    const userAvatar = document.getElementById("userAvatar");

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

    const displayName = profile?.full_name || "Student";

    if (sidebarUserName) {
        sidebarUserName.textContent = displayName;
    }

    if (userAvatar) {
        userAvatar.textContent = displayName.charAt(0).toUpperCase();
    }

    // Mobile sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // Theme preference
    const savedTheme = localStorage.getItem("launchpad-theme") || "dark";

    themePreference.value = savedTheme;

    themePreference.addEventListener("change", () => {

        const selectedTheme = themePreference.value;

        localStorage.setItem("launchpad-theme", selectedTheme);

        if (typeof applyTheme === "function") {
            applyTheme(selectedTheme);
        } else {
            document.body.classList.toggle(
                "light-theme",
                selectedTheme === "light"
            );
        }

        showSettingsMessage("Theme preference updated!", "success");
    });

    // Open password modal
    changePasswordBtn.addEventListener("click", () => {

        passwordForm.reset();
        passwordMessage.textContent = "";

        passwordModal.classList.add("active");
    });

    // Close password modal
    function closeModal() {
        passwordModal.classList.remove("active");
        passwordForm.reset();
        passwordMessage.textContent = "";
    }

    closePasswordModal.addEventListener("click", closeModal);
    cancelPasswordBtn.addEventListener("click", closeModal);

    passwordModal.addEventListener("click", (event) => {
        if (event.target === passwordModal) {
            closeModal();
        }
    });

    // Update password
    passwordForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const savePasswordBtn = document.getElementById("savePasswordBtn");

        if (newPassword.length < 8) {
            showPasswordMessage(
                "Password must contain at least 8 characters.",
                "error"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showPasswordMessage(
                "Passwords do not match.",
                "error"
            );
            return;
        }

        savePasswordBtn.disabled = true;
        savePasswordBtn.textContent = "Updating...";

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        savePasswordBtn.disabled = false;
        savePasswordBtn.textContent = "Update Password";

        if (error) {
            showPasswordMessage(error.message, "error");
            return;
        }

        closeModal();
        showSettingsMessage("Password updated successfully!", "success");
    });

    // Sign out
    const settingsLogoutBtn =
        document.getElementById("settingsLogoutBtn");

    if (settingsLogoutBtn) {
        settingsLogoutBtn.addEventListener("click", async () => {

            const confirmed = confirm("Are you sure you want to sign out?");

            if (!confirmed) return;

            settingsLogoutBtn.disabled = true;
            settingsLogoutBtn.textContent = "Signing out...";

            const { error } = await supabase.auth.signOut();

            if (error) {
                settingsLogoutBtn.disabled = false;
                settingsLogoutBtn.textContent = "Sign Out";
                showSettingsMessage(error.message, "error");
                return;
            }

            window.location.href = "login.html";
        });
    }

    // Message helpers
    function showSettingsMessage(text, type) {
        settingsMessage.textContent = text;
        settingsMessage.className = "settings-message " + type;
    }

    function showPasswordMessage(text, type) {
        passwordMessage.textContent = text;
        passwordMessage.className = "settings-message " + type;
    }

});
