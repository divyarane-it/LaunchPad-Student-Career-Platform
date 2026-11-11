
document.addEventListener("DOMContentLoaded", async () => {

    const supabase = window.supabaseClient;

    // DOM elements
    const profileForm = document.getElementById("profileForm");
    const editBtn = document.getElementById("editProfileBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const formActions = document.getElementById("formActions");
    const message = document.getElementById("profileMessage");
    const saveBtn = document.getElementById("saveProfileBtn");

    const fields = {
        full_name: document.getElementById("fullName"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        location: document.getElementById("location"),
        education: document.getElementById("education"),
        college: document.getElementById("college"),
        bio: document.getElementById("bio")
    };

    let currentUser = null;
    let originalData = {};

    // Get logged-in user
    const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

    if (sessionError || !session) {
        window.location.href = "login.html";
        return;
    }

    currentUser = session.user;

    // Mobile sidebar menu
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // Load profile from Supabase
    async function loadProfile() {

        message.textContent = "";
        message.className = "profile-message";

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

        if (error) {
            showMessage("Unable to load profile: " + error.message, "error");
            return;
        }

        const profile = data || {};

        fields.full_name.value = profile.full_name || "";
        fields.email.value = currentUser.email || profile.email || "";
        fields.phone.value = profile.phone || "";
        fields.location.value = profile.location || "";
        fields.education.value = profile.education || "";
        fields.college.value = profile.college || "";
        fields.bio.value = profile.bio || "";

        updateProfileDisplay(
            fields.full_name.value,
            fields.email.value
        );

        originalData = getFormData();
    }

    // Update profile display
    function updateProfileDisplay(name, email) {

        const displayName = document.getElementById("displayName");
        const displayEmail = document.getElementById("displayEmail");
        const profileAvatar = document.getElementById("profileAvatar");
        const sidebarUserName = document.getElementById("sidebarUserName");
        const userAvatar = document.getElementById("userAvatar");

        const finalName = name || "Student";
        const initial = finalName.charAt(0).toUpperCase();

        if (displayName) displayName.textContent = finalName;
        if (displayEmail) displayEmail.textContent = email || "";

        if (profileAvatar) profileAvatar.textContent = initial;
        if (sidebarUserName) sidebarUserName.textContent = finalName;
        if (userAvatar) userAvatar.textContent = initial;
    }

    // Collect editable form values
    function getFormData() {
        return {
            full_name: fields.full_name.value.trim(),
            phone: fields.phone.value.trim(),
            location: fields.location.value.trim(),
            education: fields.education.value.trim(),
            college: fields.college.value.trim(),
            bio: fields.bio.value.trim()
        };
    }

    // Enable editing
    editBtn.addEventListener("click", () => {

        Object.values(fields).forEach(field => {
            if (field.id !== "email") {
                field.disabled = false;
            }
        });

        editBtn.hidden = true;
        formActions.hidden = false;
        message.textContent = "";

        fields.full_name.focus();
    });

    // Cancel editing
    cancelBtn.addEventListener("click", () => {

        fields.full_name.value = originalData.full_name || "";
        fields.phone.value = originalData.phone || "";
        fields.location.value = originalData.location || "";
        fields.education.value = originalData.education || "";
        fields.college.value = originalData.college || "";
        fields.bio.value = originalData.bio || "";

        setEditing(false);
        message.textContent = "";
    });

    // Save profile
    profileForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const profileData = getFormData();

        if (!profileData.full_name) {
            showMessage("Please enter your full name.", "error");
            fields.full_name.focus();
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        const { error } = await supabase
            .from("profiles")
            .update(profileData)
            .eq("id", currentUser.id);

        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";

        if (error) {
            showMessage("Unable to save profile: " + error.message, "error");
            return;
        }

        originalData = { ...profileData };

        updateProfileDisplay(
            profileData.full_name,
            fields.email.value
        );

        setEditing(false);
        showMessage("Profile updated successfully!", "success");
    });

    // Enable or disable form editing
    function setEditing(enabled) {

        Object.values(fields).forEach(field => {
            if (field.id !== "email") {
                field.disabled = !enabled;
            }
        });

        editBtn.hidden = enabled;
        formActions.hidden = !enabled;
    }

    // Display messages
    function showMessage(text, type) {
        message.textContent = text;
        message.className = "profile-message " + type;
    }

    // Initial profile load
    await loadProfile();

});
