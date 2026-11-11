
// ==========================================
// LAUNCHPAD - INTERNSHIP TRACKER
// SUPABASE DATABASE INTEGRATION
// ==========================================

let currentUser = null;
let internshipList = [];

document.addEventListener("DOMContentLoaded", async () => {

    const client = window.supabaseClient;

    if (!client) {
        alert("Supabase connection failed.");
        return;
    }

    // Check logged-in user
    const { data: { session }, error } =
        await client.auth.getSession();

    if (error || !session) {
        window.location.href = "login.html";
        return;
    }

    currentUser = session.user;

    // Display user information
    const fullName =
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split("@")[0] ||
        "Student";

    const initial = fullName.charAt(0).toUpperCase();

    document.getElementById("sidebarUserName").textContent = fullName;
    document.getElementById("userAvatar").textContent = initial;
    document.getElementById("topbarAvatar").textContent = initial;

    // Load applications
    await loadInternships();

    // Open modal
    document.getElementById("addInternshipBtn")
        .addEventListener("click", openAddModal);

    // Close modal
    document.getElementById("closeModalBtn")
        .addEventListener("click", closeModal);

    document.getElementById("cancelModalBtn")
        .addEventListener("click", closeModal);

    // Submit form
    document.getElementById("internshipForm")
        .addEventListener("submit", saveInternship);

    // Search
    document.getElementById("searchInternship")
        .addEventListener("input", renderInternships);

    // Filter
    document.getElementById("filterStatus")
        .addEventListener("change", renderInternships);

    // Mobile sidebar
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    menuBtn?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

});


// ==========================================
// LOAD APPLICATIONS
// ==========================================

async function loadInternships() {

    const { data, error } = await window.supabaseClient
        .from("internships")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        showMessage("Unable to load applications.", true);
        return;
    }

    internshipList = data || [];

    updateStatistics();
    renderInternships();

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    document.getElementById("statTotal").textContent =
        internshipList.length;

    document.getElementById("statProgress").textContent =
        internshipList.filter(item =>
            ["Applied", "In Progress"].includes(item.status)
        ).length;

    document.getElementById("statInterviews").textContent =
        internshipList.filter(item =>
            item.status === "Interview"
        ).length;

    document.getElementById("statSelected").textContent =
        internshipList.filter(item =>
            item.status === "Selected"
        ).length;

}


// ==========================================
// DISPLAY APPLICATIONS
// ==========================================

function renderInternships() {

    const table = document.getElementById("internshipTable");

    const search =
        document.getElementById("searchInternship")
            .value.toLowerCase().trim();

    const filter =
        document.getElementById("filterStatus").value;

    const filtered = internshipList.filter(item => {

        const matchesSearch =
            (item.company || "").toLowerCase().includes(search) ||
            (item.role || "").toLowerCase().includes(search);

        const matchesStatus =
            filter === "All" || item.status === filter;

        return matchesSearch && matchesStatus;

    });

    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No applications found. Add an opportunity to get started!
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = filtered.map(item => {

        const status = item.status || "Applied";

        const statusClass = status
            .toLowerCase()
            .replace(/\s+/g, "-");

        const deadline = item.deadline
            ? new Date(item.deadline + "T00:00:00").toLocaleDateString("en-IN")
            : "—";

        return `
            <tr>
                <td><strong>${escapeHTML(item.company)}</strong></td>
                <td>${escapeHTML(item.role)}</td>
                <td>${escapeHTML(item.location || "—")}</td>
                <td>${deadline}</td>
                <td>
                    <span class="status-badge status-${statusClass}">
                        ${escapeHTML(status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editInternship('${item.id}')">
                            Edit
                        </button>

                        <button onclick="deleteInternship('${item.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;

    }).join("");

}


// ==========================================
// OPEN ADD MODAL
// ==========================================

function openAddModal() {

    document.getElementById("internshipForm").reset();

    document.getElementById("internshipId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add Application";

    document.getElementById("saveInternshipBtn").textContent =
        "Save Application";

    document.getElementById("internshipMessage").textContent = "";

    document.getElementById("internshipModal")
        .classList.add("active");

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    document.getElementById("internshipModal")
        .classList.remove("active");

}


// ==========================================
// ADD / UPDATE APPLICATION
// ==========================================

async function saveInternship(event) {

    event.preventDefault();

    const id = document.getElementById("internshipId").value;

    const button = document.getElementById("saveInternshipBtn");

    const internship = {

        company: document.getElementById("company").value.trim(),

        role: document.getElementById("role").value.trim(),

        location: document.getElementById("location").value.trim(),

        internship_type:
            document.getElementById("internshipType").value,

        deadline:
            document.getElementById("deadline").value || null,

        status:
            document.getElementById("status").value,

        notes:
            document.getElementById("notes").value.trim(),

        user_id: currentUser.id

    };

    if (!internship.company || !internship.role) {
        showMessage("Company and role are required.", true);
        return;
    }

    button.disabled = true;
    button.textContent = "Saving...";

    try {

        let result;

        if (id) {

            result = await window.supabaseClient
                .from("internships")
                .update(internship)
                .eq("id", id)
                .eq("user_id", currentUser.id);

        } else {

            result = await window.supabaseClient
                .from("internships")
                .insert([internship]);

        }

        if (result.error) throw result.error;

        closeModal();

        await loadInternships();

    } catch (error) {

        console.error(error);

        showMessage(error.message || "Unable to save application.", true);

    } finally {

        button.disabled = false;

        button.textContent = id
            ? "Update Application"
            : "Save Application";

    }

}


// ==========================================
// EDIT APPLICATION
// ==========================================

function editInternship(id) {

    const item = internshipList.find(app => app.id === id);

    if (!item) return;

    document.getElementById("internshipId").value = item.id;

    document.getElementById("company").value = item.company || "";

    document.getElementById("role").value = item.role || "";

    document.getElementById("location").value = item.location || "";

    document.getElementById("internshipType").value =
        item.internship_type || "Remote";

    document.getElementById("deadline").value =
        item.deadline || "";

    document.getElementById("status").value =
        item.status || "Applied";

    document.getElementById("notes").value =
        item.notes || "";

    document.getElementById("modalTitle").textContent =
        "Edit Application";

    document.getElementById("saveInternshipBtn").textContent =
        "Update Application";

    document.getElementById("internshipMessage").textContent = "";

    document.getElementById("internshipModal")
        .classList.add("active");

}


// ==========================================
// DELETE APPLICATION
// ==========================================

async function deleteInternship(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) return;

    const { error } = await window.supabaseClient
        .from("internships")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id);

    if (error) {

        alert("Unable to delete application: " + error.message);

        return;

    }

    await loadInternships();

}


// ==========================================
// MESSAGE HELPER
// ==========================================

function showMessage(message, isError = false) {

    const element =
        document.getElementById("internshipMessage");

    element.textContent = message;

    element.style.color = isError
        ? "#ff7777"
        : "#4bd6a0";

}


// ==========================================
// HTML SECURITY HELPER
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
