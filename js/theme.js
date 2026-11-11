
// ==========================================
// LAUNCHPAD - DARK / LIGHT THEME
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");

    // Load previously selected theme
    const savedTheme = localStorage.getItem("launchpad-theme") || "dark";

    applyTheme(savedTheme);

    // Theme toggle button
    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            const isLight =
                document.body.classList.contains("light-theme");

            const newTheme = isLight ? "dark" : "light";

            localStorage.setItem("launchpad-theme", newTheme);

            applyTheme(newTheme);

        });

    }

});

// Apply selected theme
function applyTheme(theme) {

    const isLight = theme === "light";

    document.body.classList.toggle("light-theme", isLight);

    const themeToggle = document.getElementById("themeToggle");

    if (themeToggle) {
        themeToggle.textContent = isLight ? "☾" : "☼";

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark theme" : "Switch to light theme"
        );
    }

}
