const projectGrid = document.querySelector("#projectGrid");
const expertiseGrid = document.querySelector("#expertiseGrid");
const experienceList = document.querySelector("#experienceList");
const languageButtons = document.querySelectorAll("[data-lang]");
const estimateTypeButtons = document.querySelectorAll("[data-estimate-type]");
const estimateForms = document.querySelectorAll("[data-estimate-form]");
const calculatorInputs = document.querySelectorAll(".calculator input, .calculator select");
const projectDialog = document.querySelector("#projectDialog");
const projectDialogClose = document.querySelector("#projectDialogClose");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#primaryNav");

const SUPPORTED_LANGUAGES = ["en", "ro", "ru"];
const FALLBACK_LANGUAGE = "en";

// UI strings live in public/locales/<lang>.json and are loaded at boot.
// Project/profile content stays data-driven in portfolio.json.
let translations = {};

async function loadTranslations() {
  const entries = await Promise.all(
    SUPPORTED_LANGUAGES.map(async (lang) => {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Nu s-a putut incarca limba ${lang}.`);
      return [lang, await response.json()];
    })
  );
  translations = Object.fromEntries(entries);
}

let currentLanguage = localStorage.getItem("portfolio_language") || FALLBACK_LANGUAGE;
if (!SUPPORTED_LANGUAGES.includes(currentLanguage)) currentLanguage = FALLBACK_LANGUAGE;
let portfolioData = null;

function getLocalizedValue(source, key, language = currentLanguage) {
  return source?.translations?.[language]?.[key] || source?.[key] || "";
}

function applyTranslations() {
  const dictionary = translations[currentLanguage] || translations.en;
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = dictionary[element.dataset.i18n] || translations.en[element.dataset.i18n] || "";
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const [attribute, key] = element.dataset.i18nAttr.split(":");
    element.setAttribute(attribute, dictionary[key] || translations.en[key] || "");
  });

  languageButtons.forEach((button) => {
    const active = button.dataset.lang === currentLanguage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll("option[data-i18n]").forEach((option) => {
    option.textContent = dictionary[option.dataset.i18n] || translations.en[option.dataset.i18n] || option.textContent;
  });

  updateEstimate();
  updateMobileMenuLabel();
}

function setMobileMenu(open) {
  if (!navToggle || !navLinks) return;
  navToggle.classList.toggle("active", open);
  navLinks.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  updateMobileMenuLabel();
}

function updateMobileMenuLabel() {
  if (!navToggle) return;
  const dictionary = translations[currentLanguage] || translations.en;
  const isOpen = navToggle.classList.contains("active");
  navToggle.setAttribute("aria-label", isOpen ? dictionary.menuClose : dictionary.menuOpen);
}

function linkTemplate(link) {
  const anchor = document.createElement("a");
  anchor.href = link.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = link.label;
  return anchor;
}

function renderProfile(profile) {
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const dictionary = translations[currentLanguage] || translations.en;
  document.title = `${profile.name} | ${dictionary.portfolioTitle}`;
  document.querySelector("#brandName").textContent = profile.name;
  document.querySelector("#profileName").textContent = profile.name;
  document.querySelector("#footerName").textContent = profile.name;
  document.querySelector("#profileRole").textContent = getLocalizedValue(profile, "role");
  document.querySelector("#profileAbout").textContent = getLocalizedValue(profile, "about");
  document.querySelector("#profileLocation").textContent = getLocalizedValue(profile, "location");
  document.querySelector("#profileFocus").textContent = profile.focus || "Automation";
  document.querySelector("#profileStyle").textContent = profile.style || "Data-driven";
  document.querySelector(".monogram").textContent = initials || "P";

  const profilePhoto = document.querySelector("#profilePhoto");
  if (profile.photo) {
    profilePhoto.src = profile.photo;
    profilePhoto.alt = `${profile.name} portrait`;
    profilePhoto.classList.remove("hidden");
    document.querySelector(".monogram").classList.add("hidden");
  } else {
    profilePhoto.classList.add("hidden");
    document.querySelector(".monogram").classList.remove("hidden");
  }

  const emailLink = document.querySelector("#emailLink");
  emailLink.href = `mailto:${profile.email}`;
  emailLink.textContent = profile.email;

  const phoneLink = document.querySelector("#phoneLink");
  if (profile.phone) {
    const phoneHref = profile.phone.replace(/[^\d+]/g, "");
    phoneLink.href = `tel:${phoneHref}`;
    phoneLink.textContent = profile.phone;
    phoneLink.classList.remove("hidden");
  } else {
    phoneLink.classList.add("hidden");
  }

  const profileLinks = document.querySelector("#profileLinks");
  profileLinks.replaceChildren(...profile.links.map(linkTemplate));
}

function renderExpertise(expertise = []) {
  if (!expertise.length) {
    expertiseGrid.replaceChildren();
    return;
  }

  const cards = expertise.map((group) => {
    const card = document.createElement("article");
    card.className = "expertise-card";

    const title = document.createElement("h3");
    title.textContent = getLocalizedValue(group, "title");

    const list = document.createElement("ul");
    list.replaceChildren(
      ...group.items.map((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        return listItem;
      })
    );

    card.replaceChildren(title, list);
    return card;
  });

  expertiseGrid.replaceChildren(...cards);
}

function renderExperience(experience = []) {
  if (!experience.length) {
    experienceList.replaceChildren();
    return;
  }

  const items = experience.map((entry) => {
    const item = document.createElement("article");
    item.className = "timeline-item";

    const meta = document.createElement("p");
    meta.className = "timeline-meta";
    meta.textContent = entry.period;

    const title = document.createElement("h3");
    title.textContent = getLocalizedValue(entry, "role");

    const company = document.createElement("p");
    company.className = "timeline-company";
    company.textContent = entry.company;

    const summary = document.createElement("p");
    summary.textContent = getLocalizedValue(entry, "summary");

    const techList = document.createElement("div");
    techList.className = "tech-list";
    techList.replaceChildren(
      ...entry.technologies.map((tech) => {
        const techItem = document.createElement("span");
        techItem.textContent = tech;
        return techItem;
      })
    );

    item.replaceChildren(meta, title, company, summary, techList);
    return item;
  });

  experienceList.replaceChildren(...items);
}

function renderProjects(projects) {
  const dictionary = translations[currentLanguage] || translations.en;
  const publicProjects = projects.filter((project) => project.featured !== false);

  if (!publicProjects.length) {
    projectGrid.innerHTML = `<p class="empty-state">${dictionary.emptyProjects}</p>`;
    return;
  }

  const categoryOrder = ["automation", "web"];
  const categoryCopy = {
    automation: {
      title: dictionary.projectCategoryAutomation,
      intro: dictionary.projectCategoryAutomationIntro
    },
    web: {
      title: dictionary.projectCategoryWeb,
      intro: dictionary.projectCategoryWebIntro
    }
  };

  const createCard = (project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const preview = document.createElement("div");
    preview.className = "project-card-preview";
    if (project.mediaUrl && project.mediaType === "video") {
      const video = document.createElement("video");
      video.src = project.mediaUrl;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      preview.append(video);
    } else if (project.mediaUrl) {
      const image = document.createElement("img");
      image.src = project.mediaUrl;
      image.alt = `${getLocalizedValue(project, "name")} preview`;
      image.loading = "lazy";
      preview.append(image);
    } else {
      preview.textContent = project.category === "automation" ? "Workflow preview" : "Project preview";
    }

    const title = document.createElement("h3");
    title.textContent = getLocalizedValue(project, "name");

    const description = document.createElement("p");
    description.textContent = getLocalizedValue(project, "description");

    const techList = document.createElement("div");
    techList.className = "tech-list";
    techList.replaceChildren(
      ...project.technologies.map((tech) => {
        const item = document.createElement("span");
        item.textContent = tech;
        return item;
      })
    );

    const children = [preview, title, description, techList];
    if (project.links.length) {
      const links = document.createElement("div");
      links.className = "card-links";
      links.replaceChildren(...project.links.map(linkTemplate));
      children.push(links);
    }

    card.replaceChildren(...children);
    return card;
  };

  const openProjectDialog = (project, categoryTitle) => {
    const media = document.querySelector("#projectDialogMedia");
    const links = document.querySelector("#projectDialogLinks");
    const tech = document.querySelector("#projectDialogTech");
    const details = getLocalizedValue(project, "details") || getLocalizedValue(project, "description");

    document.querySelector("#projectDialogCategory").textContent = categoryTitle;
    document.querySelector("#projectDialogTitle").textContent = getLocalizedValue(project, "name");
    document.querySelector("#projectDialogDescription").textContent = details;
    document.querySelector("#projectDialogChallenge").textContent = getLocalizedValue(project, "challenge") || "-";
    document.querySelector("#projectDialogOutcome").textContent = getLocalizedValue(project, "outcome") || "-";

    if (project.mediaUrl) {
      if (project.mediaType === "video") {
        const video = document.createElement("video");
        video.controls = true;
        video.src = project.mediaUrl;
        media.replaceChildren(video);
      } else {
        const image = document.createElement("img");
        image.src = project.mediaUrl;
        image.alt = `${getLocalizedValue(project, "name")} preview`;
        media.replaceChildren(image);
      }
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "project-media-placeholder";
      placeholder.textContent = project.category === "automation" ? "Workflow preview" : "Project preview";
      media.replaceChildren(placeholder);
    }

    tech.replaceChildren(
      ...project.technologies.map((item) => {
        const tag = document.createElement("span");
        tag.textContent = item;
        return tag;
      })
    );
    links.replaceChildren(...project.links.map(linkTemplate));

    if (typeof projectDialog.showModal === "function") {
      projectDialog.showModal();
    } else {
      projectDialog.classList.add("open");
    }
  };

  const sections = categoryOrder
    .map((category) => {
      const categoryProjects = publicProjects.filter((project) => (project.category || "web") === category);
      if (!categoryProjects.length) return null;

      const section = document.createElement("section");
      section.className = "project-category-section";

      const heading = document.createElement("div");
      heading.className = "project-category-heading";

      const title = document.createElement("h3");
      title.textContent = categoryCopy[category].title;

      const intro = document.createElement("p");
      intro.textContent = categoryCopy[category].intro;

      const cards = document.createElement("div");
      cards.className = "project-grid-inner";
      cards.replaceChildren(...categoryProjects.map((project) => {
        const card = createCard(project);
        const action = document.createElement("button");
        action.className = "secondary-button project-details-button";
        action.type = "button";
        action.textContent = dictionary.viewProject || "View case study";
        action.addEventListener("click", () => openProjectDialog(project, categoryCopy[category].title));
        card.append(action);
        return card;
      }));

      heading.replaceChildren(title, intro);
      section.replaceChildren(heading, cards);
      return section;
    })
    .filter(Boolean);

  projectGrid.replaceChildren(...sections);
}

function activeEstimateType() {
  return document.querySelector("[data-estimate-type].active")?.dataset.estimateType || "website";
}

function formatEuro(value) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function updateRangeOutput(input) {
  const output = document.querySelector(`[data-output-for="${input.id}"]`);
  if (output) output.textContent = input.value;
}

function updateEstimate() {
  const amount = document.querySelector("#estimateAmount");
  const note = document.querySelector("#estimateNote");
  const basis = document.querySelector("#estimateBasis");
  const includes = document.querySelector("#estimateIncludes");
  const emailLink = document.querySelector("#estimateEmailLink");
  if (!amount || !note || !basis || !includes || !emailLink) return;

  const dictionary = translations[currentLanguage] || translations.en;
  const type = activeEstimateType();
  let low = 0;
  let high = 0;

  if (type === "website") {
    const pages = Number(document.querySelector("#websitePages").value);
    const complexity = Number(document.querySelector("#websiteComplexity").value);
    low = (95 + pages * 28) * complexity;
    high = (210 + pages * 55) * complexity;
    if (document.querySelector("#websiteAdmin").checked) {
      low += 120;
      high += 360;
    }
    if (document.querySelector("#websiteLanguages").checked) {
      low += 70;
      high += 180;
    }
    basis.textContent = dictionary.estimateWebsiteBasis;
    note.textContent = dictionary.estimateWebsiteNote;
    includes.replaceChildren(...dictionary.estimateWebsiteIncludes.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
  } else {
    const steps = Number(document.querySelector("#automationSteps").value);
    const integrations = Number(document.querySelector("#automationIntegrations").value);
    low = 80 + steps * 14 + integrations * 45;
    high = 210 + steps * 34 + integrations * 110;
    if (document.querySelector("#automationAi").checked) {
      low += 120;
      high += 380;
    }
    if (document.querySelector("#automationDashboard").checked) {
      low += 120;
      high += 340;
    }
    basis.textContent = dictionary.estimateAutomationBasis;
    note.textContent = dictionary.estimateAutomationNote;
    includes.replaceChildren(...dictionary.estimateAutomationIncludes.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
  }

  amount.textContent = `${formatEuro(low)} - ${formatEuro(high)}`;
  const subject = type === "website"
    ? "Free project review for a website"
    : "Free project review for an automation";
  const body = [
    "Hi Alex,",
    "",
    `I saw the estimated range: ${amount.textContent}. I would like a free project review for my ${type} project.`,
    "",
    "Project idea:",
    "",
    "Main goal:",
    "",
    "Timeline:",
    "",
    "Thanks!"
  ].join("\n");
  emailLink.href = `mailto:negaraalex25@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setupContactForm() {
  const redirectInput = document.querySelector("#contactRedirect");
  if (redirectInput) {
    redirectInput.value = `${window.location.origin}/#contact`;
  }
}

async function loadPortfolio() {
  const response = await fetch("/api/portfolio");
  portfolioData = await response.json();
  applyTranslations();
  renderProfile(portfolioData.profile);
  renderExpertise(portfolioData.expertise);
  renderExperience(portfolioData.experience);
  renderProjects(portfolioData.projects);
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.lang;
    localStorage.setItem("portfolio_language", currentLanguage);
    applyTranslations();
    if (portfolioData) {
      renderProfile(portfolioData.profile);
      renderExpertise(portfolioData.expertise);
      renderExperience(portfolioData.experience);
      renderProjects(portfolioData.projects);
    }
  });
});

estimateTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    estimateTypeButtons.forEach((item) => item.classList.toggle("active", item === button));
    estimateForms.forEach((form) => {
      form.classList.toggle("active", form.dataset.estimateForm === button.dataset.estimateType);
    });
    updateEstimate();
  });
});

calculatorInputs.forEach((input) => {
  input.addEventListener("input", () => {
    updateRangeOutput(input);
    updateEstimate();
  });
  input.addEventListener("change", () => {
    updateRangeOutput(input);
    updateEstimate();
  });
  updateRangeOutput(input);
});

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    setMobileMenu(!navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMobileMenu(false);
  });
}

projectDialogClose.addEventListener("click", () => {
  if (typeof projectDialog.close === "function") {
    projectDialog.close();
  } else {
    projectDialog.classList.remove("open");
  }
});

projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) {
    projectDialog.close();
  }
});

setupContactForm();

async function init() {
  await loadTranslations();
  applyTranslations();
  await loadPortfolio();
}

init().catch(() => {
  const dictionary = translations[currentLanguage] || translations[FALLBACK_LANGUAGE] || {};
  applyTranslations();
  projectGrid.innerHTML = `<p class="empty-state">${dictionary.loadError || "Error"}</p>`;
});
