
// ==========================================
// LAUNCHPAD - TASK PLANNER
// SUPABASE DATABASE INTEGRATION
// ==========================================

let currentTaskUser = null;
let tasksList = [];

// ==========================================
// INITIALIZE TASK PLANNER
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const client = window.supabaseClient;

    if (!client) {
        alert("Supabase connection failed.");
        return;
    }

    const { data: { session }, error } =
        await client.auth.getSession();

    if (error || !session) {
        window.location.href = "login.html";
        return;
    }

    currentTaskUser = session.user;

    const fullName =
        currentTaskUser.user_metadata?.full_name ||
        currentTaskUser.email?.split("@")[0] ||
        "Student";

    const initial = fullName.charAt(0).toUpperCase();

    document.getElementById("sidebarUserName").textContent = fullName;
    document.getElementById("userAvatar").textContent = initial;
    document.getElementById("topbarAvatar").textContent = initial;

    // Load tasks
    await loadTasks();

    // Add task
    document.getElementById("addTaskBtn")
        .addEventListener("click", openAddTaskModal);

    // Close modal
    document.getElementById("closeModalBtn")
        .addEventListener("click", closeTaskModal);

    document.getElementById("cancelModalBtn")
        .addEventListener("click", closeTaskModal);

    // Submit task form
    document.getElementById("taskForm")
        .addEventListener("submit", saveTask);

    // Search tasks
    document.getElementById("searchTask")
        .addEventListener("input", renderTasks);

    // Filter tasks
    document.getElementById("filterStatus")
        .addEventListener("change", renderTasks);

    // Mobile sidebar
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    menuBtn?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    // Close modal by clicking outside
    document.getElementById("taskModal")
        .addEventListener("click", function (event) {
            if (event.target === this) {
                closeTaskModal();
            }
        });

});


// ==========================================
// LOAD TASKS FROM SUPABASE
// ==========================================

async function loadTasks() {

    const { data, error } = await window.supabaseClient
        .from("tasks")
        .select("*")
        .eq("user_id", currentTaskUser.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        alert("Unable to load tasks: " + error.message);
        return;
    }

    tasksList = data || [];

    updateTaskStatistics();
    renderTasks();

}


// ==========================================
// UPDATE TASK STATISTICS
// ==========================================

function updateTaskStatistics() {

    const total = tasksList.length;

    const completed = tasksList.filter(
        task => task.status === "Completed"
    ).length;

    const pending = tasksList.filter(
        task => task.status === "Pending"
    ).length;

    const today = getLocalDateString();

    const overdue = tasksList.filter(task =>
        task.due_date &&
        task.due_date < today &&
        task.status !== "Completed"
    ).length;

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("overdueTasks").textContent = overdue;

}


// ==========================================
// DISPLAY TASKS
// ==========================================

function renderTasks() {

    const list = document.getElementById("tasksList");

    const search = document.getElementById("searchTask")
        .value.trim().toLowerCase();

    const status = document.getElementById("filterStatus").value;

    const filteredTasks = tasksList.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(search) ||
            (task.description || "").toLowerCase().includes(search);

        const matchesStatus =
            status === "All" || task.status === status;

        return matchesSearch && matchesStatus;

    });

    if (filteredTasks.length === 0) {

        list.innerHTML = `
            <div class="tasks-empty">
                <h3>No tasks found</h3>
                <p>Add a new task or change your search and filters.</p>
            </div>
        `;

        return;
    }

    const today = getLocalDateString();

    list.innerHTML = filteredTasks.map(task => {

        const priority = task.priority || "Medium";
        const taskStatus = task.status || "Pending";

        const priorityClass =
            "priority-" + priority.toLowerCase();

        const statusClass =
            "status-" + taskStatus.toLowerCase().replace(/\s+/g, "-");

        const isOverdue =
            task.due_date &&
            task.due_date < today &&
            taskStatus !== "Completed";

        const formattedDate = task.due_date
            ? new Date(task.due_date + "T00:00:00")
                .toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
            : "No due date";

        return `
            <article class="task-card ${taskStatus === "Completed" ? "task-completed" : ""}">

                <div class="task-card-main">

                    <h3>${escapeTaskHTML(task.title)}</h3>

                    ${task.description ? `
                        <p class="task-description">
                            ${escapeTaskHTML(task.description)}
                        </p>
                    ` : ""}

                    <div class="task-meta">

                        <span class="task-priority ${priorityClass}">
                            ${escapeTaskHTML(priority)} Priority
                        </span>

                        <span class="task-status ${statusClass}">
                            ${escapeTaskHTML(taskStatus)}
                        </span>

                        <span class="${isOverdue ? "task-overdue" : ""}">
                            📅 ${formattedDate}
                            ${isOverdue ? " · Overdue" : ""}
                        </span>

                    </div>

                </div>

                <div class="task-card-actions">

                    ${taskStatus !== "Completed" ? `
                        <button onclick="completeTask('${task.id}')">
                            ✓ Complete
                        </button>
                    ` : ""}

                    <button onclick="editTask('${task.id}')">
                        Edit
                    </button>

                    <button onclick="deleteTask('${task.id}')">
                        Delete
                    </button>

                </div>

            </article>
        `;

    }).join("");

}


// ==========================================
// OPEN ADD TASK MODAL
// ==========================================

function openAddTaskModal() {

    document.getElementById("taskForm").reset();

    document.getElementById("taskId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add New Task";

    document.getElementById("saveTaskBtn").textContent =
        "Save Task";

    document.getElementById("taskMessage").textContent = "";

    document.getElementById("taskModal")
        .classList.add("active");

}


// ==========================================
// CLOSE TASK MODAL
// ==========================================

function closeTaskModal() {

    document.getElementById("taskModal")
        .classList.remove("active");

}


// ==========================================
// SAVE OR UPDATE TASK
// ==========================================

async function saveTask(event) {

    event.preventDefault();

    const id = document.getElementById("taskId").value;

    const button = document.getElementById("saveTaskBtn");

    const task = {

        title: document.getElementById("taskTitle").value.trim(),

        description: document.getElementById("taskDescription").value.trim(),

        due_date: document.getElementById("dueDate").value || null,

        priority: document.getElementById("taskPriority").value,

        status: document.getElementById("taskStatus").value,

        user_id: currentTaskUser.id

    };

    if (!task.title) {
        showTaskMessage("Please enter a task title.", true);
        return;
    }

    button.disabled = true;
    button.textContent = "Saving...";

    try {

        let result;

        if (id) {

            result = await window.supabaseClient
                .from("tasks")
                .update(task)
                .eq("id", id)
                .eq("user_id", currentTaskUser.id);

        } else {

            result = await window.supabaseClient
                .from("tasks")
                .insert([task]);

        }

        if (result.error) throw result.error;

        closeTaskModal();

        await loadTasks();

    } catch (error) {

        console.error(error);

        showTaskMessage(
            error.message || "Unable to save task.",
            true
        );

    } finally {

        button.disabled = false;

        button.textContent = id
            ? "Update Task"
            : "Save Task";

    }

}


// ==========================================
// EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasksList.find(item => item.id === id);

    if (!task) return;

    document.getElementById("taskId").value = task.id;

    document.getElementById("taskTitle").value = task.title;

    document.getElementById("taskDescription").value =
        task.description || "";

    document.getElementById("dueDate").value =
        task.due_date || "";

    document.getElementById("taskPriority").value =
        task.priority || "Medium";

    document.getElementById("taskStatus").value =
        task.status || "Pending";

    document.getElementById("modalTitle").textContent =
        "Edit Task";

    document.getElementById("saveTaskBtn").textContent =
        "Update Task";

    document.getElementById("taskMessage").textContent = "";

    document.getElementById("taskModal")
        .classList.add("active");

}


// ==========================================
// MARK TASK AS COMPLETED
// ==========================================

async function completeTask(id) {

    const { error } = await window.supabaseClient
        .from("tasks")
        .update({ status: "Completed" })
        .eq("id", id)
        .eq("user_id", currentTaskUser.id);

    if (error) {

        alert("Unable to complete task: " + error.message);

        return;
    }

    await loadTasks();

}


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    const { error } = await window.supabaseClient
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", currentTaskUser.id);

    if (error) {

        alert("Unable to delete task: " + error.message);

        return;
    }

    await loadTasks();

}


// ==========================================
// MESSAGE HELPER
// ==========================================

function showTaskMessage(message, isError = false) {

    const element = document.getElementById("taskMessage");

    element.textContent = message;

    element.style.color = isError
        ? "#ff7777"
        : "#4bd6a0";

}


// ==========================================
// LOCAL DATE HELPER
// ==========================================

function getLocalDateString() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ==========================================
// HTML SECURITY HELPER
// ==========================================

function escapeTaskHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[character]);

}
