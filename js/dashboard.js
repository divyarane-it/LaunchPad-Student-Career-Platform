
// ==========================================
// LAUNCHPAD - DASHBOARD FUNCTIONALITY
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const client = window.supabaseClient;

    if (!client) {
        console.error("Supabase client not initialized.");
        return;
    }

    // Check logged-in student
    const { data: { session }, error: sessionError } =
        await client.auth.getSession();

    if (sessionError || !session) {
        window.location.href = "login.html";
        return;
    }

    const user = session.user;

    // Display student information
    const fullName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Student";

    const firstName = fullName.split(" ")[0];
    const initial = fullName.charAt(0).toUpperCase();

    document.getElementById("welcomeName").textContent = firstName;
    document.getElementById("sidebarUserName").textContent = fullName;
    document.getElementById("userAvatar").textContent = initial;
    document.getElementById("topbarAvatar").textContent = initial;

    // Load dashboard data
    await loadDashboardData(user.id);

    // Mobile sidebar
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    menuBtn?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (event) => {
        if (
            window.innerWidth <= 700 &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }
    });

});

// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboardData(userId) {

    const client = window.supabaseClient;

    try {

        const [
            internshipResponse,
            skillResponse,
            taskResponse
        ] = await Promise.all([

            client
                .from("internships")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false }),

            client
                .from("skills")
                .select("*")
                .eq("user_id", userId),

            client
                .from("tasks")
                .select("*")
                .eq("user_id", userId)

        ]);

        if (internshipResponse.error) throw internshipResponse.error;
        if (skillResponse.error) throw skillResponse.error;
        if (taskResponse.error) throw taskResponse.error;

        const internships = internshipResponse.data || [];
        const skills = skillResponse.data || [];
        const tasks = taskResponse.data || [];

        // Application statistics
        document.getElementById("totalApplications").textContent =
            internships.length;

        const inProgress = internships.filter(item =>
            ["Applied", "In Progress", "Under Review", "Interview"]
                .includes(item.status)
        ).length;

        document.getElementById("inProgress").textContent = inProgress;

        // Skills count
        document.getElementById("totalSkills").textContent =
            skills.length;

        // Pending tasks
        const pendingTasks = tasks.filter(task =>
            !["Completed", "Done"].includes(task.status)
        ).length;

        document.getElementById("pendingTasks").textContent =
            pendingTasks;

        // Task progress
        const completedTasks = tasks.length - pendingTasks;

        const progress = tasks.length
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0;

        document.getElementById("taskProgress").textContent =
            progress + "%";

        document.getElementById("taskProgressCircle").style.background =
            `conic-gradient(var(--accent) ${progress * 3.6}deg, var(--surface-hover) 0deg)`;

        document.getElementById("taskSummaryText").textContent =
            tasks.length
                ? `${completedTasks} of ${tasks.length} tasks completed. Keep it up!`
                : "Start adding tasks to track your progress.";

        // Recent applications
        displayRecentApplications(internships);

        // Application chart
        createApplicationChart(internships);

    } catch (error) {

        console.error("Dashboard loading error:", error);

        alert(
            "Unable to load dashboard data. Please refresh the page or check your database setup."
        );

    }

}

// ==========================================
// RECENT APPLICATIONS TABLE
// ==========================================

function displayRecentApplications(internships) {

    const tableBody =
        document.getElementById("recentApplications");

    if (!internships.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No applications yet. Add your first opportunity!
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = internships.slice(0, 5).map(item => {

        const status = item.status || "Applied";

        const date = item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-IN")
            : "—";

        return `
            <tr>
                <td>${escapeHTML(item.company)}</td>
                <td>${escapeHTML(item.role)}</td>
                <td>${escapeHTML(status)}</td>
                <td>${date}</td>
            </tr>
        `;

    }).join("");

}

// ==========================================
// APPLICATION CHART
// ==========================================

function createApplicationChart(internships) {

    const canvas = document.getElementById("applicationChart");

    if (!canvas || typeof Chart === "undefined") return;

    const statuses = [
        "Applied",
        "In Progress",
        "Interview",
        "Selected",
        "Rejected"
    ];

    const counts = statuses.map(status => {

        if (status === "In Progress") {
            return internships.filter(item =>
                ["In Progress", "Under Review"].includes(item.status)
            ).length;
        }

        return internships.filter(item =>
            item.status === status
        ).length;

    });

    if (window.applicationChartInstance) {
        window.applicationChartInstance.destroy();
    }

    window.applicationChartInstance = new Chart(canvas, {

        type: "bar",

        data: {
            labels: statuses,

            datasets: [{
                label: "Applications",
                data: counts,
                backgroundColor: [
                    "#9585ff",
                    "#61b5ff",
                    "#ffb56b",
                    "#4bd6a0",
                    "#ff7777"
                ],
                borderRadius: 7,
                maxBarThickness: 42
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        color: getComputedStyle(document.body)
                            .getPropertyValue("--muted")
                    },
                    grid: {
                        color: getComputedStyle(document.body)
                            .getPropertyValue("--border")
                    }
                },

                x: {
                    ticks: {
                        color: getComputedStyle(document.body)
                            .getPropertyValue("--muted")
                    },
                    grid: {
                        display: false
                    }
                }

            }

        }

    });

}

// ==========================================
// SAFE TEXT DISPLAY
// ==========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}
