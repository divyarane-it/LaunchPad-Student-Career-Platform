
// ==========================================
// LAUNCHPAD - USER AUTHENTICATION
// ==========================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const terms = document.getElementById("terms").checked;

        const message = document.getElementById("authMessage");
        const button = signupForm.querySelector("button[type='submit']");

        // Basic validation
        if (password.length < 8) {
            message.textContent = "Password must contain at least 8 characters.";
            message.style.color = "#ff7777";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "#ff7777";
            return;
        }

        if (!terms) {
            message.textContent = "Please accept the terms and conditions.";
            message.style.color = "#ff7777";
            return;
        }

        button.disabled = true;
        button.textContent = "Creating account...";
        message.textContent = "";

        try {
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                message.style.color = "#5ee6a8";
                message.textContent = "Account created successfully! Redirecting...";

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1200);
            } else {
                message.style.color = "#5ee6a8";
                message.textContent =
                    "Registration successful! Please check your email to confirm your account.";
                button.disabled = false;
                button.textContent = "Create Account →";
            }

        } catch (error) {
            message.style.color = "#ff7777";
            message.textContent = error.message || "Registration failed. Please try again.";

            button.disabled = false;
            button.textContent = "Create Account →";
        }
    });
}

// ==========================================
// LAUNCHPAD - LOGIN FUNCTIONALITY
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("authMessage");
        const button = loginForm.querySelector("button[type='submit']");

        button.disabled = true;
        button.textContent = "Signing in...";
        message.textContent = "";

        try {
            const { data, error } =
                await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            message.style.color = "#5ee6a8";
            message.textContent = "Login successful! Opening dashboard...";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            message.style.color = "#ff7777";
            message.textContent = error.message || "Login failed. Please try again.";

            button.disabled = false;
            button.textContent = "Sign In →";
        }
    });
}

// ==========================================
// LAUNCHPAD - LOGOUT FUNCTIONALITY
// ==========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        const confirmLogout = confirm(
            "Are you sure you want to sign out?"
        );

        if (!confirmLogout) return;

        logoutBtn.disabled = true;
        logoutBtn.textContent = "Signing out...";

        try {

            const { error } =
                await window.supabaseClient.auth.signOut();

            if (error) throw error;

            window.location.href = "login.html";

        } catch (error) {

            alert("Unable to sign out: " + error.message);

            logoutBtn.disabled = false;
            logoutBtn.textContent = "↪ Sign Out";

        }

    });

}
