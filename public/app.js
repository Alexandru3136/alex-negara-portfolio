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

const translations = {
  en: {
    brandAria: "Home",
    languageAria: "Language selector",
    summaryAria: "Portfolio summary",
    navAbout: "About",
    navServices: "Services",
    navExperience: "Experience",
    navProjects: "Projects",
    navEstimate: "Estimate",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    heroServiceLine: "n8n automations, AI workflows and business websites for small teams.",
    available: "Available for Fiverr-style projects",
    styleLabel: "Style",
    servicesEyebrow: "Freelance services",
    servicesTitle: "What clients can hire me for",
    servicesIntro: "Focused project types that fit Fiverr gigs and small business needs.",
    serviceAutomationTitle: "n8n & AI automation",
    serviceAutomationText: "Automate lead handling, internal alerts, reporting, data sync, approvals and AI classification flows.",
    serviceWebsiteTitle: "Business landing pages",
    serviceWebsiteText: "Clean responsive websites for local businesses, services, portfolios and campaign pages.",
    serviceWebappTitle: "Lightweight web apps",
    serviceWebappText: "Small dashboards, admin panels, CRUD tools and internal apps with practical data workflows.",
    selectedWork: "Selected work",
    expertiseEyebrow: "Core strengths",
    expertiseTitle: "Expertise",
    expertiseIntro: "Practical engineering experience across automation, data workflows and full-stack web tools.",
    experienceEyebrow: "Recent work",
    experienceTitle: "Experience",
    experienceIntro: "Selected roles that shaped the current focus of this portfolio.",
    projectsTitle: "Projects",
    projectsIntro: "Real automation and web projects selected for clients who need practical delivery, not just pretty screens.",
    projectCategoryAutomation: "Automation & AI Workflows",
    projectCategoryWeb: "Web Apps & Sites",
    projectCategoryAutomationIntro: "Systems that reduce manual work through integrations, AI and operational workflows.",
    projectCategoryWebIntro: "Interfaces, dashboards and websites built around clear user flows.",
    projectChallengeLabel: "Challenge",
    projectOutcomeLabel: "Outcome",
    viewProject: "View case study",
    contactEyebrow: "Free project review",
    contactTitle: "Tell me about your project",
    contactIntro: "Share the goal, current process and what you want to improve. I will reply with next steps and a realistic scope.",
    formName: "Name",
    formEmail: "Email",
    formPhone: "Phone optional",
    formBudget: "Estimated budget optional",
    formBudgetPlaceholder: "Not sure yet",
    formIdea: "Project idea",
    formSubmit: "Send project request",
    formNote: "The form sends the request to my email. You can also contact me directly from Fiverr.",
    estimateEyebrow: "Before ordering",
    estimateTitle: "Project fit calculator",
    estimateIntro: "Use this as a quick pre-check before requesting a website or automation project. Final pricing depends on scope, integrations and timeline.",
    websiteTab: "Website",
    automationTab: "Automation",
    websitePages: "Pages",
    websiteComplexity: "Complexity",
    complexitySimple: "Simple presentation",
    complexityBusiness: "Business website",
    complexityApp: "Web app / dashboard",
    websiteAdmin: "Admin panel / CMS",
    websiteLanguages: "Multilingual version",
    automationSteps: "Workflow steps",
    automationIntegrations: "Integrations",
    automationAi: "AI analysis / classification",
    automationDashboard: "Dashboard or database tracking",
    estimateResultLabel: "Estimated range",
    estimateIncludesTitle: "What this usually includes",
    estimateWebsiteIncludes: [
      "Scope clarification and content structure",
      "Responsive design for desktop and mobile",
      "Frontend implementation and basic SEO setup",
      "Contact links/forms and deployment preparation",
      "Short handoff with guidance for future updates"
    ],
    estimateAutomationIncludes: [
      "Process review and workflow mapping",
      "n8n/API implementation with test data",
      "Error handling and practical edge-case checks",
      "Documentation so the workflow can be maintained",
      "Free consultation before confirming the scope"
    ],
    estimateWebsiteBasis: "Calibrated as an entry-to-standard Fiverr range for fixed-scope websites.",
    estimateAutomationBasis: "Calibrated as an entry-to-standard Fiverr range for clear n8n/API workflows.",
    estimateWebsiteNote: "Good for landing pages, service websites and small business sites. Complex apps are quoted separately.",
    estimateAutomationNote: "Good for lead routing, alerts, reports, bots and simple-to-medium operational workflows.",
    estimateCta: "Request a free project review",
    estimateFallback: "Send the idea by email and I will reply with next steps and a realistic scope.",
    footerNote: "Updated locally through the admin panel.",
    emptyProjects: "No projects have been published yet.",
    loadError: "The portfolio could not be loaded.",
    portfolioTitle: "Portfolio"
  },
  ro: {
    brandAria: "Acasa",
    languageAria: "Selector de limba",
    summaryAria: "Rezumat portofoliu",
    navAbout: "Despre",
    navServices: "Servicii",
    navExperience: "Experienta",
    navProjects: "Proiecte",
    navEstimate: "Estimare",
    menuOpen: "Deschide meniul",
    menuClose: "Inchide meniul",
    heroServiceLine: "Automatizari n8n, AI workflows si website-uri business pentru echipe mici.",
    available: "Disponibil pentru proiecte tip Fiverr",
    styleLabel: "Stil",
    servicesEyebrow: "Servicii freelance",
    servicesTitle: "Pentru ce ma pot angaja clientii",
    servicesIntro: "Tipuri clare de proiecte potrivite pentru Fiverr si businessuri mici.",
    serviceAutomationTitle: "Automatizari n8n si AI",
    serviceAutomationText: "Automatizez leaduri, alerte interne, rapoarte, sincronizare de date, aprobari si clasificare cu AI.",
    serviceWebsiteTitle: "Landing page-uri business",
    serviceWebsiteText: "Website-uri responsive pentru businessuri locale, servicii, portofolii si pagini de campanie.",
    serviceWebappTitle: "Aplicatii web usoare",
    serviceWebappText: "Dashboarduri mici, panouri admin, CRUD tools si aplicatii interne cu fluxuri practice de date.",
    selectedWork: "Lucrari selectate",
    expertiseEyebrow: "Puncte forte",
    expertiseTitle: "Expertiza",
    expertiseIntro: "Experienta practica in automatizari, fluxuri de date si instrumente web full-stack.",
    experienceEyebrow: "Roluri recente",
    experienceTitle: "Experienta",
    experienceIntro: "Roluri selectate care definesc directia actuala a portofoliului.",
    projectsTitle: "Proiecte",
    projectsIntro: "Proiecte reale de automatizare si web, selectate pentru clienti care au nevoie de livrare practica.",
    projectCategoryAutomation: "Automatizari si AI Workflows",
    projectCategoryWeb: "Aplicatii web si site-uri",
    projectCategoryAutomationIntro: "Sisteme care reduc munca manuala prin integrari, AI si fluxuri operationale.",
    projectCategoryWebIntro: "Interfete, dashboarduri si site-uri construite in jurul unor fluxuri clare.",
    projectChallengeLabel: "Problema",
    projectOutcomeLabel: "Rezultat",
    viewProject: "Vezi detalii",
    contactEyebrow: "Review gratuit de proiect",
    contactTitle: "Descrie-mi proiectul tau",
    contactIntro: "Scrie obiectivul, procesul actual si ce vrei sa imbunatatesti. Iti raspund cu urmatorii pasi si un scope realist.",
    formName: "Nume",
    formEmail: "Email",
    formPhone: "Telefon optional",
    formBudget: "Buget estimativ optional",
    formBudgetPlaceholder: "Nu sunt sigur inca",
    formIdea: "Ideea proiectului",
    formSubmit: "Trimite cererea",
    formNote: "Formularul trimite cererea pe emailul meu. Ma poti contacta si direct pe Fiverr.",
    estimateEyebrow: "Inainte de comanda",
    estimateTitle: "Calculator de potrivire",
    estimateIntro: "Foloseste-l ca pre-check rapid pentru un website sau automatizare. Pretul final depinde de scop, integrari si termen.",
    websiteTab: "Website",
    automationTab: "Automatizare",
    websitePages: "Pagini",
    websiteComplexity: "Complexitate",
    complexitySimple: "Prezentare simpla",
    complexityBusiness: "Website business",
    complexityApp: "Aplicatie web / dashboard",
    websiteAdmin: "Panou admin / CMS",
    websiteLanguages: "Versiune multilingva",
    automationSteps: "Pasi in workflow",
    automationIntegrations: "Integrari",
    automationAi: "Analiza / clasificare AI",
    automationDashboard: "Dashboard sau urmarire in baza de date",
    estimateResultLabel: "Interval estimat",
    estimateIncludesTitle: "Ce include de obicei",
    estimateWebsiteIncludes: [
      "Clarificarea scopului si structurii continutului",
      "Design responsive pentru desktop si mobil",
      "Implementare frontend si SEO de baza",
      "Linkuri/formulare de contact si pregatire pentru deploy",
      "Predare scurta cu ghid pentru actualizari viitoare"
    ],
    estimateAutomationIncludes: [
      "Analiza procesului si maparea workflow-ului",
      "Implementare n8n/API cu date de test",
      "Error handling si verificari pentru cazuri practice",
      "Documentatie pentru mentenanta workflow-ului",
      "Consultatie gratuita inainte de confirmarea scopului"
    ],
    estimateWebsiteBasis: "Calibrat ca interval entry-to-standard pentru website-uri cu scope fix pe Fiverr.",
    estimateAutomationBasis: "Calibrat ca interval entry-to-standard pentru workflow-uri n8n/API clare.",
    estimateWebsiteNote: "Potrivit pentru landing page-uri, site-uri de servicii si businessuri mici. Aplicatiile complexe se estimeaza separat.",
    estimateAutomationNote: "Potrivit pentru lead routing, alerte, rapoarte, boti si workflow-uri operationale simple spre medii.",
    estimateCta: "Cere un review gratuit",
    estimateFallback: "Trimite ideea pe email si iti raspund cu urmatorii pasi si un scope realist.",
    footerNote: "Actualizat local prin panoul admin.",
    emptyProjects: "Nu exista proiecte publicate inca.",
    loadError: "Portofoliul nu a putut fi incarcat.",
    portfolioTitle: "Portofoliu"
  },
  ru: {
    brandAria: "Главная",
    languageAria: "Выбор языка",
    summaryAria: "Краткое описание портфолио",
    navAbout: "Обо мне",
    navExperience: "Опыт",
    navProjects: "Проекты",
    navEstimate: "Оценка",
    available: "Открыт для сотрудничества",
    styleLabel: "Стиль",
    selectedWork: "Избранные работы",
    expertiseEyebrow: "Ключевые навыки",
    expertiseTitle: "Экспертиза",
    expertiseIntro: "Практический инженерный опыт в автоматизации, data workflows и full-stack веб-инструментах.",
    experienceEyebrow: "Недавняя работа",
    experienceTitle: "Опыт",
    experienceIntro: "Избранные роли, которые сформировали текущий фокус портфолио.",
    projectsTitle: "Проекты",
    projectsIntro: "Короткая подборка проектов с технологиями и полезными ссылками.",
    projectCategoryAutomation: "Автоматизации и AI Workflows",
    projectCategoryWeb: "Веб-приложения и сайты",
    projectCategoryAutomationIntro: "Системы, которые уменьшают ручную работу через интеграции, AI и операционные workflows.",
    projectCategoryWebIntro: "Интерфейсы, dashboards и сайты, построенные вокруг понятных пользовательских сценариев.",
    contactEyebrow: "Связаться",
    estimateEyebrow: "Оценка проекта",
    estimateTitle: "Калькулятор стоимости",
    estimateIntro: "Быстрая стартовая оценка для сайта или workflow автоматизации. Финальная цена зависит от объема и интеграций.",
    websiteTab: "Сайт",
    automationTab: "Автоматизация",
    websitePages: "Страницы",
    websiteComplexity: "Сложность",
    complexitySimple: "Простая презентация",
    complexityBusiness: "Бизнес-сайт",
    complexityApp: "Web app / dashboard",
    websiteAdmin: "Админ-панель / CMS",
    websiteLanguages: "Мультиязычная версия",
    automationSteps: "Шаги workflow",
    automationIntegrations: "Интеграции",
    automationAi: "AI анализ / классификация",
    automationDashboard: "Dashboard или database tracking",
    estimateResultLabel: "Оценочный диапазон",
    estimateIncludesTitle: "Что обычно входит",
    estimateWebsiteIncludes: [
      "Уточнение scope и структуры контента",
      "Responsive design для desktop и mobile",
      "Frontend implementation и базовый SEO setup",
      "Contact links/forms и подготовка к deploy",
      "Короткая передача с рекомендациями для обновлений"
    ],
    estimateAutomationIncludes: [
      "Разбор процесса и workflow mapping",
      "n8n/API implementation с тестовыми данными",
      "Error handling и проверка practical edge cases",
      "Документация для поддержки workflow",
      "Бесплатная консультация перед финальным scope"
    ],
    estimateWebsiteBasis: "На основе оценочного времени разработки при EUR 18-30/час плюс сложность проекта.",
    estimateAutomationBasis: "На основе времени сборки workflow при EUR 20-35/час плюс интеграции и AI complexity.",
    estimateWebsiteNote: "Подходит для портфолио, бизнес-сайтов и легких web applications.",
    estimateAutomationNote: "Подходит для n8n workflows, интеграций, ботов и операционной автоматизации.",
    estimateCta: "Ask for a free consultation",
    estimateFallback: "If your email app does not open, write directly to negaraalex25@gmail.com.",
    footerNote: "Обновляется локально через панель администратора.",
    emptyProjects: "Пока нет опубликованных проектов.",
    loadError: "Не удалось загрузить портфолио.",
    portfolioTitle: "Портфолио"
  }
};

translations.ru = {
  ...translations.en,
  brandAria: "Главная",
  languageAria: "Выбор языка",
  summaryAria: "Краткое описание портфолио",
  navAbout: "Обо мне",
  navServices: "Услуги",
  navExperience: "Опыт",
  navProjects: "Проекты",
  navEstimate: "Оценка",
  menuOpen: "Открыть меню",
  menuClose: "Закрыть меню",
  heroServiceLine: "n8n автоматизации, AI workflows и бизнес-сайты для небольших команд.",
  available: "Доступен для проектов в стиле Fiverr",
  styleLabel: "Стиль",
  servicesEyebrow: "Freelance услуги",
  servicesTitle: "С чем я могу помочь клиентам",
  servicesIntro: "Четкие типы проектов для Fiverr и малого бизнеса.",
  serviceAutomationTitle: "n8n и AI автоматизация",
  serviceAutomationText: "Автоматизация лидов, внутренних уведомлений, отчетов, синхронизации данных, approvals и AI классификации.",
  serviceWebsiteTitle: "Бизнес landing pages",
  serviceWebsiteText: "Чистые responsive сайты для локального бизнеса, услуг, портфолио и кампаний.",
  serviceWebappTitle: "Легкие web apps",
  serviceWebappText: "Небольшие dashboards, admin panels, CRUD tools и внутренние приложения с практичными data workflows.",
  selectedWork: "Избранные работы",
  expertiseEyebrow: "Сильные стороны",
  expertiseTitle: "Экспертиза",
  expertiseIntro: "Практический инженерный опыт в автоматизации, data workflows и full-stack web tools.",
  experienceEyebrow: "Недавний опыт",
  experienceTitle: "Опыт",
  experienceIntro: "Выбранные роли, которые сформировали текущий фокус портфолио.",
  projectsTitle: "Проекты",
  projectsIntro: "Реальные automation и web проекты для клиентов, которым нужна практическая реализация.",
  projectCategoryAutomation: "Automation & AI Workflows",
  projectCategoryWeb: "Web Apps & Sites",
  projectCategoryAutomationIntro: "Системы, которые уменьшают ручную работу через интеграции, AI и операционные workflows.",
  projectCategoryWebIntro: "Интерфейсы, dashboards и сайты, построенные вокруг понятных пользовательских сценариев.",
  projectChallengeLabel: "Задача",
  projectOutcomeLabel: "Результат",
  viewProject: "Смотреть кейс",
  contactEyebrow: "Бесплатный обзор проекта",
  contactTitle: "Расскажите о вашем проекте",
  contactIntro: "Опишите цель, текущий процесс и что вы хотите улучшить. Я отвечу с дальнейшими шагами и реалистичным scope.",
  formName: "Имя",
  formEmail: "Email",
  formPhone: "Телефон опционально",
  formBudget: "Ориентировочный бюджет опционально",
  formBudgetPlaceholder: "Пока не уверен",
  formIdea: "Идея проекта",
  formSubmit: "Отправить запрос",
  formNote: "Форма отправляет запрос на мой email. Также можно связаться со мной напрямую на Fiverr.",
  estimateEyebrow: "Перед заказом",
  estimateTitle: "Калькулятор проекта",
  estimateIntro: "Используйте это как быстрый pre-check перед сайтом или automation проектом. Финальная цена зависит от scope, интеграций и сроков.",
  websiteTab: "Website",
  automationTab: "Automation",
  websitePages: "Страницы",
  websiteComplexity: "Сложность",
  complexitySimple: "Простая презентация",
  complexityBusiness: "Бизнес-сайт",
  complexityApp: "Web app / dashboard",
  websiteAdmin: "Admin panel / CMS",
  websiteLanguages: "Многоязычная версия",
  automationSteps: "Шаги workflow",
  automationIntegrations: "Интеграции",
  automationAi: "AI анализ / классификация",
  automationDashboard: "Dashboard или database tracking",
  estimateResultLabel: "Оценочный диапазон",
  estimateIncludesTitle: "Что обычно входит",
  estimateWebsiteBasis: "Откалибровано как entry-to-standard Fiverr диапазон для сайтов с фиксированным scope.",
  estimateAutomationBasis: "Откалибровано как entry-to-standard Fiverr диапазон для понятных n8n/API workflows.",
  estimateWebsiteNote: "Подходит для landing pages, сайтов услуг и малого бизнеса. Сложные приложения оцениваются отдельно.",
  estimateAutomationNote: "Подходит для lead routing, alerts, reports, bots и simple-to-medium operational workflows.",
  estimateCta: "Запросить бесплатный обзор",
  estimateFallback: "Отправьте идею по email, и я отвечу с дальнейшими шагами и реалистичным scope.",
  footerNote: "Обновляется локально через admin panel.",
  emptyProjects: "Пока нет опубликованных проектов.",
  loadError: "Не удалось загрузить портфолио.",
  portfolioTitle: "Портфолио"
};

let currentLanguage = localStorage.getItem("portfolio_language") || "en";
if (!translations[currentLanguage]) currentLanguage = "en";
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

loadPortfolio().catch(() => {
  const dictionary = translations[currentLanguage] || translations.en;
  applyTranslations();
  projectGrid.innerHTML = `<p class="empty-state">${dictionary.loadError}</p>`;
});
