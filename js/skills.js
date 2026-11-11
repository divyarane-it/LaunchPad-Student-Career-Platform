
// ==========================================
// LAUNCHPAD - SKILLS TRACKER
// SUPABASE DATABASE INTEGRATION
// ==========================================

let currentSkillUser = null;
let skillsList = [];

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

    currentSkillUser = session.user;

    // Display user information
    const fullName =
        currentSkillUser.user_metadata?.full_name ||
        currentSkillUser.email?.split("@")[0] ||
        "Student";

    const initial = fullName.charAt(0).toUpperCase();

    document.getElementById("sidebarUserName").textContent = fullName;
    document.getElementById("userAvatar").textContent = initial;
    document.getElementById("topbarAvatar").textContent = initial;

    // Load skills
    await loadSkills();

    // Add skill
    document.getElementById("addSkillBtn")
        .addEventListener("click", openAddSkillModal);

    // Close modal
    document.getElementById("closeModalBtn")
        .addEventListener("click", closeSkillModal);

    document.getElementById("cancelModalBtn")
        .addEventListener("click", closeSkillModal);

    // Submit form
    document.getElementById("skillForm")
        .addEventListener("submit", saveSkill);

    // Category filter
    document.getElementById("categoryFilter")
        .addEventListener("change", renderSkills);

    // Proficiency slider
    document.getElementById("proficiency")
        .addEventListener("input", function () {

            document.getElementById("proficiencyValue")
                .textContent = this.value + "%";

        });

    // Mobile sidebar
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    menuBtn?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

});


// ==========================================
// LOAD SKILLS FROM SUPABASE
// ==========================================

async function loadSkills() {

    const { data, error } = await window.supabaseClient
        .from("skills")
        .select("*")
        .eq("user_id", currentSkillUser.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        showSkillMessage("Unable to load skills.", true);
        return;
    }

    skillsList = data || [];

    updateSkillStatistics();
    renderSkills();

}


// ==========================================
// UPDATE SKILL STATISTICS
// ==========================================

function updateSkillStatistics() {

    const total = skillsList.length;

    const average = total
        ? Math.round(
            skillsList.reduce(
                (sum, skill) => sum + Number(skill.proficiency || 0),
                0
            ) / total
        )
        : 0;

    const advanced = skillsList.filter(
        skill => Number(skill.proficiency) >= 75
    ).length;

    document.getElementById("totalSkills").textContent = total;

    document.getElementById("averageProficiency").textContent =
        average + "%";

    document.getElementById("advancedSkills").textContent = advanced;

}


// ==========================================
// DISPLAY SKILL CARDS
// ==========================================

function renderSkills() {

    const grid = document.getElementById("skillsGrid");

    const category =
        document.getElementById("categoryFilter").value;

    const filteredSkills = skillsList.filter(skill => {

        return category === "All" || skill.category === category;

    });

    if (filteredSkills.length === 0) {

        grid.innerHTML = `
            <div class="skills-empty">
                <h3>No skills found</h3>
                <p>Add your first skill to start tracking your progress.</p>
            </div>
        `;

        return;
    }

    grid.innerHTML = filteredSkills.map(skill => {

        const proficiency = Math.max(
            0,
            Math.min(100, Number(skill.proficiency) || 0)
        );

        const level =
            proficiency >= 75 ? "Advanced" :
            proficiency >= 40 ? "Intermediate" :
            "Beginner";

        return `

            <article class="skill-card">

                <div class="skill-card-header">

                    <div>
                        <h3>${escapeSkillHTML(skill.name)}</h3>

                        <span class="skill-category">
                            ${escapeSkillHTML(skill.category)}
                        </span>
                    </div>

                    <span class="skill-level">
                        ${proficiency}%
                    </span>

                </div>

                <div class="skill-progress-info">
                    <span>${level}</span>
                    <span>${proficiency}% completed</span>
                </div>

                <div
                    class="skill-progress-track"
                    role="progressbar"
                    aria-valuenow="${proficiency}"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="${escapeSkillHTML(skill.name)} proficiency"
                >
                    <div
                        class="skill-progress-fill"
                        style="width: ${proficiency}%"
                    ></div>
                </div>

                <div class="skill-card-actions">

                    <button onclick="editSkill('${skill.id}')">
                        Edit
                    </button>

                    <button onclick="deleteSkill('${skill.id}')">
                        Delete
                    </button>

                </div>

            </article>

        `;

    }).join("");

}


// ==========================================
// OPEN ADD SKILL MODAL
// ==========================================

function openAddSkillModal() {

    document.getElementById("skillForm").reset();

    document.getElementById("skillId").value = "";

    document.getElementById("proficiency").value = 50;

    document.getElementById("proficiencyValue").textContent = "50%";

    document.getElementById("modalTitle").textContent =
        "Add New Skill";

    document.getElementById("saveSkillBtn").textContent =
        "Save Skill";

    document.getElementById("skillMessage").textContent = "";

    document.getElementById("skillModal")
        .classList.add("active");

}


// ==========================================
// CLOSE SKILL MODAL
// ==========================================

function closeSkillModal() {

    document.getElementById("skillModal")
        .classList.remove("active");

}


// ==========================================
// SAVE OR UPDATE SKILL
// ==========================================

async function saveSkill(event) {

    event.preventDefault();

    const id = document.getElementById("skillId").value;

    const button = document.getElementById("saveSkillBtn");

    const skill = {

        name: document.getElementById("skillName").value.trim(),

        category: document.getElementById("skillCategory").value,

        proficiency: Number(
            document.getElementById("proficiency").value
        ),

        user_id: currentSkillUser.id

    };

    if (!skill.name) {
        showSkillMessage("Please enter a skill name.", true);
        return;
    }

    button.disabled = true;
    button.textContent = "Saving...";

    try {

        let result;

        if (id) {

            result = await window.supabaseClient
                .from("skills")
                .update(skill)
                .eq("id", id)
                .eq("user_id", currentSkillUser.id);

        } else {

            result = await window.supabaseClient
                .from("skills")
                .insert([skill]);

        }

        if (result.error) throw result.error;

        closeSkillModal();

        await loadSkills();

    } catch (error) {

        console.error(error);

        showSkillMessage(
            error.message || "Unable to save skill.",
            true
        );

    } finally {

        button.disabled = false;

        button.textContent = id
            ? "Update Skill"
            : "Save Skill";

    }

}


// ==========================================
// EDIT SKILL
// ==========================================

function editSkill(id) {

    const skill = skillsList.find(item => item.id === id);

    if (!skill) return;

    document.getElementById("skillId").value = skill.id;

    document.getElementById("skillName").value = skill.name;

    document.getElementById("skillCategory").value =
        skill.category || "Other";

    document.getElementById("proficiency").value =
        skill.proficiency || 0;

    document.getElementById("proficiencyValue").textContent =
        (skill.proficiency || 0) + "%";

    document.getElementById("modalTitle").textContent =
        "Edit Skill";

    document.getElementById("saveSkillBtn").textContent =
        "Update Skill";

    document.getElementById("skillMessage").textContent = "";

    document.getElementById("skillModal")
        .classList.add("active");

}


// ==========================================
// DELETE SKILL
// ==========================================

async function deleteSkill(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this skill?"
    );

    if (!confirmDelete) return;

    const { error } = await window.supabaseClient
        .from("skills")
        .delete()
        .eq("id", id)
        .eq("user_id", currentSkillUser.id);

    if (error) {

        alert("Unable to delete skill: " + error.message);

        return;

    }

    await loadSkills();

}


// ==========================================
// MESSAGE HELPER
// ==========================================

function showSkillMessage(message, isError = false) {

    const element = document.getElementById("skillMessage");

    element.textContent = message;

    element.style.color = isError
        ? "#ff7777"
        : "#4bd6a0";

}


// ==========================================
// HTML SECURITY HELPER
// ==========================================

function escapeSkillHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[character]);

}
