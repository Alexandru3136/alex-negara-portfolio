const loginPanel = document.querySelector("#loginPanel");
const adminPanel = document.querySelector("#adminPanel");
const loginForm = document.querySelector("#loginForm");
const projectForm = document.querySelector("#projectForm");
const loginMessage = document.querySelector("#loginMessage");
const projectMessage = document.querySelector("#projectMessage");
const adminProjectList = document.querySelector("#adminProjectList");
const logoutButton = document.querySelector("#logoutButton");
const newProjectButton = document.querySelector("#newProjectButton");
const cancelEditButton = document.querySelector("#cancelEditButton");

let projects = [];

const categoryLabels = {
  automation: "Automatizari si AI Workflows",
  web: "Aplicatii web si site-uri"
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Cererea a esuat.");
  return data;
}

function setAuthenticated(authenticated) {
  loginPanel.classList.toggle("hidden", authenticated);
  adminPanel.classList.toggle("hidden", !authenticated);
  logoutButton.classList.toggle("hidden", !authenticated);
}

function getLinksFromForm(formData) {
  return [
    { label: formData.get("linkLabel1"), url: formData.get("linkUrl1") },
    { label: formData.get("linkLabel2"), url: formData.get("linkUrl2") }
  ].filter((link) => String(link.label).trim() && String(link.url).trim());
}

function fillForm(project = null) {
  projectForm.reset();
  projectMessage.textContent = "";
  projectForm.elements.id.value = project?.id || "";
  projectForm.elements.name.value = project?.name || "";
  projectForm.elements.description.value = project?.description || "";
  projectForm.elements.details.value = project?.details || "";
  projectForm.elements.challenge.value = project?.challenge || "";
  projectForm.elements.outcome.value = project?.outcome || "";
  projectForm.elements.category.value = project?.category || "web";
  projectForm.elements.mediaUrl.value = project?.mediaUrl || "";
  projectForm.elements.mediaType.value = project?.mediaType || "image";
  projectForm.elements.technologies.value = project?.technologies?.join(", ") || "";
  projectForm.elements.linkLabel1.value = project?.links?.[0]?.label || "";
  projectForm.elements.linkUrl1.value = project?.links?.[0]?.url || "";
  projectForm.elements.linkLabel2.value = project?.links?.[1]?.label || "";
  projectForm.elements.linkUrl2.value = project?.links?.[1]?.url || "";
}

function renderAdminProjects() {
  if (!projects.length) {
    adminProjectList.innerHTML = '<p class="empty-state">Nu exista proiecte inca.</p>';
    return;
  }

  const items = projects.map((project) => {
    const item = document.createElement("article");
    item.className = "admin-item";

    const title = document.createElement("h3");
    title.textContent = project.name;

    const description = document.createElement("p");
    description.textContent = project.description;

    const meta = document.createElement("p");
    meta.className = "admin-meta";
    meta.textContent = project.mediaUrl ? "Are media pentru detalii" : "Fara media inca";

    const category = document.createElement("span");
    category.className = "project-category";
    category.textContent = categoryLabels[project.category] || categoryLabels.web;

    const techList = document.createElement("div");
    techList.className = "tech-list";
    techList.replaceChildren(
      ...project.technologies.map((tech) => {
        const techItem = document.createElement("span");
        techItem.textContent = tech;
        return techItem;
      })
    );

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const editButton = document.createElement("button");
    editButton.className = "secondary-button";
    editButton.type = "button";
    editButton.textContent = "Editeaza";
    editButton.addEventListener("click", () => fillForm(project));

    const deleteButton = document.createElement("button");
    deleteButton.className = "danger-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Sterge";
    deleteButton.addEventListener("click", async () => {
      const confirmed = confirm(`Stergi proiectul "${project.name}"?`);
      if (!confirmed) return;
      await api(`/api/projects/${project.id}`, { method: "DELETE" });
      await loadPortfolio();
      fillForm();
      projectMessage.textContent = "Proiect sters.";
    });

    actions.replaceChildren(editButton, deleteButton);
    item.replaceChildren(category, title, description, meta, techList, actions);
    return item;
  });

  adminProjectList.replaceChildren(...items);
}

async function loadPortfolio() {
  const data = await api("/api/portfolio");
  projects = data.projects;
  renderAdminProjects();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";

  try {
    const formData = new FormData(loginForm);
    await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ password: formData.get("password") })
    });
    loginForm.reset();
    setAuthenticated(true);
    await loadPortfolio();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  projectMessage.textContent = "";

  try {
    const formData = new FormData(projectForm);
    const id = formData.get("id");
    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      details: formData.get("details"),
      challenge: formData.get("challenge"),
      outcome: formData.get("outcome"),
      category: formData.get("category"),
      mediaUrl: formData.get("mediaUrl"),
      mediaType: formData.get("mediaType"),
      technologies: formData.get("technologies"),
      links: getLinksFromForm(formData)
    };

    await api(id ? `/api/projects/${id}` : "/api/projects", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    await loadPortfolio();
    fillForm();
    projectMessage.textContent = "Proiect salvat.";
  } catch (error) {
    projectMessage.textContent = error.message;
  }
});

logoutButton.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  setAuthenticated(false);
  fillForm();
});

newProjectButton.addEventListener("click", () => fillForm());
cancelEditButton.addEventListener("click", () => fillForm());

async function boot() {
  const session = await api("/api/session");
  setAuthenticated(session.authenticated);
  if (session.authenticated) await loadPortfolio();
}

boot().catch((error) => {
  loginMessage.textContent = error.message;
});
