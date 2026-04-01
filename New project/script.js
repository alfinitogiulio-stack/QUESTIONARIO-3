const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");
const dropdownToggles = document.querySelectorAll(".nav-dropdown-toggle");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      dropdownToggles.forEach((toggle) => {
        toggle.parentElement?.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  });
}

if (dropdownToggles.length) {
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const parent = toggle.parentElement;
      if (!parent) {
        return;
      }

      const shouldOpen = !parent.classList.contains("open");

      dropdownToggles.forEach((otherToggle) => {
        otherToggle.parentElement?.classList.remove("open");
        otherToggle.setAttribute("aria-expanded", "false");
      });

      parent.classList.toggle("open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || event.target.closest(".nav-dropdown")) {
      return;
    }

    dropdownToggles.forEach((toggle) => {
      toggle.parentElement?.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

const slider = document.querySelector("#photo-slider");
const sliderButtons = document.querySelectorAll(".slider-button");
const profileSliderButtons = document.querySelectorAll("[data-profile-slider]");
const accountLink = document.querySelector("#account-link");
const logoutButton = document.querySelector("#logout-button");
const categoryTabs = document.querySelectorAll("[data-category-target]");
const categoryTabRow = document.querySelector(".hire-market-tabs-row");
const protectedChatLinks = document.querySelectorAll('a[href="chat.html"]');
const brokenEmailLinks = document.querySelectorAll('[data-broken-email="true"]');
const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
const profileStorageKey = "woki-profile-data";
const selectedChatProfileKey = "woki-selected-chat-profile";
const defaultProfileData = {
  displayName: "WOKI",
  handle: "@cilli.official",
  role: "Creatore del progetto",
  city: "Milano",
  email: "cilli@example.com",
  interests: "Foto, contenuti, profilo personale",
  goal: "Presentare il progetto in modo chiaro e moderno",
  status: "Profilo attivo",
  bio: "Profilo personale del progetto con foto, presentazione, informazioni principali e contenuti in evidenza.",
  introTitle: "Chi Sono",
  introText: "Questa pagina funziona come un profilo social: contiene una parte visiva forte, informazioni rapide e uno spazio per raccontare chi sei e cosa vuoi condividere con chi visita il sito.",
};

const getStoredProfileData = () => {
  try {
    const stored = localStorage.getItem(profileStorageKey);
    const profileData = stored ? { ...defaultProfileData, ...JSON.parse(stored) } : { ...defaultProfileData };

    if (profileData.introTitle === "Chi e WOKI" || profileData.introTitle === "Chi e' WOKI" || profileData.introTitle === "Chi sono") {
      profileData.introTitle = "Chi Sono";
    }

    return profileData;
  } catch (error) {
    return { ...defaultProfileData };
  }
};

const slugifyChatId = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getRoleFromCategory = (categoryLabel) => {
  const label = (categoryLabel || "").toLowerCase();

  if (label.includes("baby")) {
    return "babysitter";
  }

  if (label.includes("pet")) {
    return "petsitter";
  }

  return "traslochi";
};

const storeSelectedChatProfile = (profile) => {
  try {
    sessionStorage.setItem(selectedChatProfileKey, JSON.stringify(profile));
  } catch (error) {
    // Ignore storage errors and keep default navigation behavior.
  }
};

const profileGenderByImage = {
  "profilo 1.png": "f",
  "profilo 2.png": "m",
  "profilo 3.jpg": "f",
  "profilo 4.jpg": "m",
  "profilo 5.jpg": "m",
  "profilo 6.jpg": "m",
  "profilo 7.jpg": "m",
  "profilo 8.jpg": "f",
};

const profileNamesByPage = {
  "babysitting.html": {
    f: [
      "Sofia", "Giada", "Martina", "Elisa", "Noemi",
      "Camilla", "Arianna", "Beatrice", "Giorgia", "Serena",
      "Rebecca", "Melissa", "Gaia", "Nicole", "Vittoria",
      "Linda", "Chiara", "Federica", "Alessia", "Valentina",
    ],
    m: [
      "Luca", "Matteo", "Andrea", "Paolo", "Simone",
      "Davide", "Tommaso", "Riccardo", "Edoardo", "Filippo",
    ],
  },
  "petsitting.html": {
    f: [
      "Chiara", "Amina", "Aurora", "Veronica", "Elena",
      "Giulia", "Martina", "Giada", "Sofia", "Laura",
      "Marta", "Francesca",
    ],
    m: [
      "Matteo", "Luca", "Paolo", "Lorenzo", "Edoardo",
      "Simone", "Davide", "Tommaso", "Filippo", "Riccardo",
      "Andrea", "Nicolo'",
    ],
  },
  "traslochi.html": {
    f: [
      "Chiara", "Sofia", "Martina", "Elena", "Giulia",
      "Arianna", "Beatrice", "Valentina",
    ],
    m: [
      "Marco", "Andrea", "Stefano", "Davide", "Lorenzo",
      "Michele", "Gabriele", "Alessandro", "Riccardo", "Tommaso",
      "Matteo", "Simone", "Cristian", "Federico", "Samuele",
      "Emanuele", "Nicola", "Daniele", "Paolo", "Fabio",
    ],
  },
};

if (window.location.pathname.toLowerCase().endsWith("/chat.html") && !isLoggedIn) {
  window.location.href = "accesso.html";
}

if (window.location.pathname.toLowerCase().endsWith("/profilo.html") && !isLoggedIn) {
  window.location.href = "accesso.html";
}

if (window.location.pathname.toLowerCase().endsWith("/modifica-profilo.html") && !isLoggedIn) {
  window.location.href = "accesso.html";
}

protectedChatLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (isLoggedIn) {
      return;
    }

    event.preventDefault();
    window.location.href = "accesso.html";
  });
});

brokenEmailLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.alert("Errore: email non disponibile.");
  });
});

const hireMarketCards = document.querySelectorAll(".hire-market-card");
if (hireMarketCards.length) {
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();
  const pageNames = profileNamesByPage[currentPage];
  const genderIndexes = { f: 0, m: 0 };

  hireMarketCards.forEach((card, index) => {
    const footer = card.querySelector(".hire-market-card-footer");
    const image = card.querySelector(".hire-market-card-media img");
    const title = card.querySelector("h3");
    const category = card.querySelector(".hire-market-tag")?.textContent?.trim();

    if (!footer || !image || !category || !title) {
      return;
    }

    const imageFileName = decodeURIComponent((image.getAttribute("src") || "").split("/").pop() || "");
    const gender = profileGenderByImage[imageFileName] || (category.toLowerCase().includes("traslochi") ? "m" : "f");
    const nextName = pageNames?.[gender]?.[genderIndexes[gender]];

    if (nextName) {
      title.textContent = nextName;
      genderIndexes[gender] += 1;
    } else if (pageNames?.f?.[index]) {
      title.textContent = pageNames.f[index];
    }

    const name = title.textContent?.trim();
    if (!name) {
      return;
    }

    const profile = {
      id: slugifyChatId(name),
      name,
      category,
      role: getRoleFromCategory(category),
      image: image.getAttribute("src") || "",
    };

    footer.querySelectorAll("a").forEach((link) => {
      link.remove();
    });

    let chatAction = card.querySelector(".hire-market-chat-link");
    if (!chatAction) {
      chatAction = document.createElement("a");
      chatAction.className = "hire-market-chat-link";
      chatAction.href = "chat.html";
      chatAction.setAttribute("aria-label", `Apri chat con ${name}`);
      chatAction.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18.2 6.8 15A7 7 0 1 1 19 10.5 7 7 0 0 1 8.7 17.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      title.appendChild(chatAction);
    }

    const attachChatHandler = (element) => {
      element.addEventListener("click", (event) => {
        if (!isLoggedIn) {
          event.preventDefault();
          window.location.href = "accesso.html";
          return;
        }

        storeSelectedChatProfile(profile);
      });
    };

    attachChatHandler(chatAction);
  });
}

if (slider && sliderButtons.length) {
  const getSliderStep = () => {
    const firstSlide = slider.querySelector(".slide");
    if (!firstSlide) {
      return Math.min(slider.clientWidth * 0.85, 340);
    }

    const slideStyles = window.getComputedStyle(slider);
    const gap = Number.parseFloat(slideStyles.columnGap || slideStyles.gap || "20");
    return firstSlide.getBoundingClientRect().width + gap;
  };

  sliderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-direction");
      const step = getSliderStep();

      slider.scrollBy({
        left: direction === "next" ? step * 1.15 : -step * 1.15,
        behavior: "smooth",
      });
    });
  });
}

if (profileSliderButtons.length) {
  profileSliderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sliderId = button.getAttribute("data-profile-slider");
      const direction = button.getAttribute("data-direction");
      const track = sliderId ? document.getElementById(sliderId) : null;
      const firstCard = track?.querySelector(".hire-market-card");

      if (!track || !firstCard) {
        return;
      }

      const trackStyles = window.getComputedStyle(track);
      const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || "18");
      const step = (firstCard.getBoundingClientRect().width + gap) * 5;

      track.scrollBy({
        left: direction === "prev" ? -step : step,
        behavior: "smooth",
      });
    });
  });
}

if (categoryTabs.length) {
  const setActiveCategoryTab = (activeId) => {
    categoryTabs.forEach((tab) => {
      const isActive = tab.getAttribute("data-category-target") === activeId;
      tab.classList.toggle("active", isActive);

      if (isActive && categoryTabRow) {
        tab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    });
  };

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-category-target");
      const target = targetId ? document.getElementById(targetId) : null;

      if (!targetId || !target) {
        return;
      }

      setActiveCategoryTab(targetId);
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  const categorySections = Array.from(categoryTabs)
    .map((tab) => tab.getAttribute("data-category-target"))
    .filter(Boolean)
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (categorySections.length && "IntersectionObserver" in window) {
    const categoryObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveCategoryTab(visibleEntry.target.id);
        }
      },
      {
        threshold: 0.35,
        rootMargin: "-10% 0px -45% 0px",
      }
    );

    categorySections.forEach((section) => {
      categoryObserver.observe(section);
    });
  }
}

if (accountLink) {
  if (isLoggedIn) {
    accountLink.textContent = "Profilo";
    accountLink.setAttribute("href", "profilo.html");
  } else {
    accountLink.textContent = "Accedi";
    accountLink.setAttribute("href", "accesso.html");
  }
}

const profileFieldElements = document.querySelectorAll("[data-profile-field]");
if (profileFieldElements.length) {
  const profileData = getStoredProfileData();

  profileFieldElements.forEach((element) => {
    const key = element.getAttribute("data-profile-field");
    if (!key || !(key in profileData)) {
      return;
    }

    element.textContent = profileData[key];
  });
}

const profileEditForm = document.querySelector("#profile-edit-form");
if (profileEditForm) {
  const profileData = getStoredProfileData();
  const saveNote = document.querySelector("#profile-save-note");

  const formFields = {
    displayName: profileEditForm.querySelector("#display-name"),
    handle: profileEditForm.querySelector("#handle"),
    role: profileEditForm.querySelector("#role"),
    city: profileEditForm.querySelector("#city"),
    email: profileEditForm.querySelector("#email"),
    interests: profileEditForm.querySelector("#interests"),
    goal: profileEditForm.querySelector("#goal"),
    status: profileEditForm.querySelector("#status"),
    bio: profileEditForm.querySelector("#bio"),
    introText: profileEditForm.querySelector("#intro-text"),
  };

  Object.entries(formFields).forEach(([key, field]) => {
    if (field) {
      field.value = profileData[key] || "";
    }
  });

  profileEditForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nextProfileData = { ...defaultProfileData };
    Object.entries(formFields).forEach(([key, field]) => {
      if (field) {
        nextProfileData[key] = field.value.trim() || defaultProfileData[key];
      }
    });

    localStorage.setItem(profileStorageKey, JSON.stringify(nextProfileData));

    if (saveNote) {
      saveNote.classList.remove("hidden");
    }

    window.setTimeout(() => {
      window.location.href = "profilo.html";
    }, 500);
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
  });
}

const chatItems = document.querySelectorAll(".wa-chat-item");
const chatPanels = document.querySelectorAll(".wa-conversation");
const chatNavButtons = document.querySelectorAll("[data-chat-nav]");

if (chatItems.length && chatPanels.length) {
  const setActiveChat = (chatId) => {
    chatItems.forEach((entry) => {
      entry.classList.toggle("active", entry.getAttribute("data-chat") === chatId);
    });

    chatPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.getAttribute("data-chat-panel") === chatId);
    });
  };

  chatItems.forEach((item) => {
    item.addEventListener("click", () => {
      const chatId = item.getAttribute("data-chat");
      setActiveChat(chatId);
    });
  });

  chatNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const activeItem = document.querySelector(".wa-chat-item.active");
      if (!activeItem) {
        return;
      }

      const currentIndex = Array.from(chatItems).indexOf(activeItem);
      const direction = button.getAttribute("data-chat-nav");
      const offset = direction === "next" ? 1 : -1;
      const nextIndex = (currentIndex + offset + chatItems.length) % chatItems.length;
      const nextChatId = chatItems[nextIndex].getAttribute("data-chat");

      if (nextChatId) {
        setActiveChat(nextChatId);
      }
    });
  });
}

const desktopChatItems = document.querySelectorAll(".chat-desktop-thread");
const desktopChatPanels = document.querySelectorAll(".chat-desktop-panel");
const desktopChatEmpty = document.querySelector("#chat-desktop-empty");
const chatSearchInput = document.querySelector("#chat-search-input");

if (desktopChatItems.length && desktopChatPanels.length && desktopChatEmpty) {
  const chatStorageKey = "woki-chat-state";
  const chatProfilesStorageKey = "woki-chat-profiles";
  const removedChatsStorageKey = "woki-removed-chats";
  const chatStorageVersionKey = "woki-chat-state-version";
  const chatStorageVersion = "2";
  const builtInChatIds = ["giulia", "luca", "team-nord"];
  const chatProfiles = {
    giulia: {
      name: "Giulia",
      role: "babysitter",
      availability: "Sono disponibile soprattutto pomeriggio e sera, e posso organizzarmi anche nel weekend.",
      pricing: "Per il babysitting di solito valuto in base a orari, zona ed eta dei bambini.",
      followUp: "Se vuoi, dimmi l'eta' dei bambini, la fascia oraria e la zona, cosi' ti rispondo in modo preciso.",
    },
    luca: {
      name: "Luca",
      role: "petsitter",
      availability: "Posso gestire visite a domicilio, passeggiate e cura quotidiana con orari flessibili.",
      pricing: "Per il petsitting considero numero di visite, durata e tipo di animale.",
      followUp: "Scrivimi pure se si tratta di cane, gatto o altro animale e per quali giorni ti serve.",
    },
    "team-nord": {
      name: "Team Nord",
      role: "traslochi",
      availability: "Possiamo organizzarci per sopralluogo, imballaggio e trasporto in base alla data che preferisci.",
      pricing: "Per i traslochi il costo dipende da piano, ascensore, quantita di mobili e distanza.",
      followUp: "Mandami indirizzi di partenza e arrivo, piano e data prevista e ti rispondo meglio.",
    },
  };
  const desktopThreadList = document.querySelector(".chat-desktop-thread-list");
  const desktopStage = document.querySelector(".chat-desktop-stage");
  const getDesktopChatItems = () => Array.from(document.querySelectorAll(".chat-desktop-thread"));
  const getDesktopChatPanels = () => Array.from(document.querySelectorAll(".chat-desktop-panel"));
  let activeDesktopChatId = null;

  const createDesktopThread = (profile) => {
    const thread = document.createElement("button");
    thread.className = "chat-desktop-thread";
    thread.type = "button";
    thread.setAttribute("data-desktop-chat", profile.id);
    thread.innerHTML = `
      <img src="${profile.image}" alt="Profilo ${profile.name}">
      <div class="chat-desktop-thread-copy">
        <div class="chat-desktop-thread-top">
          <strong>${profile.name}</strong>
        </div>
        <div class="chat-desktop-thread-bottom">
          <p>Inizia tu la conversazione</p>
        </div>
      </div>
    `;
    return thread;
  };

  const createDesktopPanel = (profile) => {
    const panel = document.createElement("section");
    panel.className = "chat-desktop-panel";
    panel.setAttribute("data-desktop-panel", profile.id);
    panel.innerHTML = `
      <header class="chat-desktop-panel-header">
        <div class="chat-desktop-panel-user">
          <img src="${profile.image}" alt="Profilo ${profile.name}">
          <div>
            <strong>${profile.name}</strong>
            <span>${profile.category}</span>
          </div>
        </div>
      </header>

      <div class="chat-desktop-messages"></div>

      <form class="chat-desktop-compose" data-chat-compose="${profile.id}">
        <input type="text" placeholder="Scrivi un messaggio">
        <button class="cta" type="submit">Invia</button>
      </form>
    `;
    return panel;
  };

  const saveRemovedChats = (removedChats) => {
    try {
      localStorage.setItem(removedChatsStorageKey, JSON.stringify(Array.from(removedChats)));
    } catch (error) {
      // Ignore storage errors for removed chats.
    }
  };

  const bindDesktopThread = (item) => {
    item.addEventListener("click", () => {
      const chatId = item.getAttribute("data-desktop-chat");
      if (chatId) {
        setDesktopChat(chatId);
      }
    });
  };

  const bindDesktopPanelForm = (panel) => {
    const chatId = panel.getAttribute("data-desktop-panel");
    const form = panel.querySelector(".chat-desktop-compose");
    const input = form?.querySelector("input");

    if (!chatId || !form || !input) {
      return;
    }

    renderChat(chatId);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const messageText = input.value.trim();
      if (!messageText) {
        return;
      }

      addMessage(chatId, {
        sender: "sent",
        text: messageText,
        time: getCurrentTime(),
      });

      input.value = "";

      const typingMessage = {
        sender: "received",
        text: "Sta scrivendo...",
        time: getCurrentTime(),
        typing: true,
      };

      chatState[chatId].push(typingMessage);
      renderChat(chatId);

      window.setTimeout(() => {
        chatState[chatId] = chatState[chatId].filter((message) => !message.typing);
        addMessage(chatId, {
          sender: "received",
          text: buildAiReply(chatId, messageText),
          time: getCurrentTime(),
        });

        const thread = document.querySelector(`[data-desktop-chat="${chatId}"]`);
        if (thread && !thread.classList.contains("active")) {
          thread.classList.add("unread");
        }
      }, 900 + Math.floor(Math.random() * 800));
    });
  };

  const removeDesktopChat = (chatId) => {
    const thread = document.querySelector(`[data-desktop-chat="${chatId}"]`);
    const panel = document.querySelector(`[data-desktop-panel="${chatId}"]`);

    delete chatState[chatId];
    saveChatState();

    removedChats.add(chatId);
    saveRemovedChats(removedChats);

    if (!builtInChatIds.includes(chatId)) {
      delete chatProfiles[chatId];
      saveChatProfiles();
    }

    thread?.remove();
    panel?.remove();

    if (activeDesktopChatId === chatId) {
      activeDesktopChatId = null;
      const nextThread = getDesktopChatItems()[0];
      const nextChatId = nextThread?.getAttribute("data-desktop-chat");

      if (nextChatId) {
        setDesktopChat(nextChatId);
        return;
      }

      desktopChatEmpty.classList.add("active");
      getDesktopChatPanels().forEach((existingPanel) => existingPanel.classList.remove("active"));
    }
  };

  const ensureDeleteButton = (panel) => {
    const header = panel.querySelector(".chat-desktop-panel-header");
    const chatId = panel.getAttribute("data-desktop-panel");

    if (!header || !chatId || header.querySelector(".chat-desktop-delete")) {
      return;
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "chat-desktop-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Cancella chat";
    deleteButton.addEventListener("click", () => {
      removeDesktopChat(chatId);
    });
    header.appendChild(deleteButton);
  };

  const ensureDynamicChatProfile = (profile) => {
    if (!profile?.id || !profile?.name || !desktopThreadList || !desktopStage) {
      return null;
    }

    removedChats.delete(profile.id);
    saveRemovedChats(removedChats);

    chatProfiles[profile.id] = {
      name: profile.name,
      role: profile.role || getRoleFromCategory(profile.category),
      availability:
        profile.role === "traslochi"
          ? "Possiamo organizzarci per sopralluogo, imballaggio e trasporto in base alla data che preferisci."
          : "Sono disponibile in base agli orari e ai dettagli che mi scrivi in chat.",
      pricing:
        profile.role === "traslochi"
          ? "Per i traslochi il costo dipende da piano, ascensore, quantita di mobili e distanza."
          : `Per ${profile.category.toLowerCase()} valuto il costo in base ai dettagli del servizio richiesto.`,
      followUp:
        profile.role === "traslochi"
          ? "Mandami indirizzi, data e piano, cosi' ti rispondo in modo preciso."
          : "Scrivimi orari, zona e dettagli principali, cosi' ti rispondo meglio.",
      category: profile.category || "",
      image: profile.image || "gallery-01.jpg",
    };
    saveChatProfiles();

    if (!chatState[profile.id]) {
      chatState[profile.id] = [];
      saveChatState();
    }

    let thread = document.querySelector(`[data-desktop-chat="${profile.id}"]`);
    if (!thread) {
      thread = createDesktopThread(profile);
      desktopThreadList.prepend(thread);
      bindDesktopThread(thread);
    }

    let panel = document.querySelector(`[data-desktop-panel="${profile.id}"]`);
    if (!panel) {
      panel = createDesktopPanel(profile);
      desktopStage.appendChild(panel);
      ensureDeleteButton(panel);
      bindDesktopPanelForm(panel);
    }

    return profile.id;
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const saveChatProfiles = () => {
    try {
      localStorage.setItem(chatProfilesStorageKey, JSON.stringify(chatProfiles));
    } catch (error) {
      // Ignore storage errors for chat profiles.
    }
  };

  const extractInitialMessages = () => {
    const initialState = {};

    getDesktopChatPanels().forEach((panel) => {
      const chatId = panel.getAttribute("data-desktop-panel");
      if (!chatId) {
        return;
      }

      initialState[chatId] = [];
    });

    return initialState;
  };

  const storedVersion = localStorage.getItem(chatStorageVersionKey);
  const storedState = storedVersion === chatStorageVersion ? localStorage.getItem(chatStorageKey) : null;
  const chatState = storedState ? JSON.parse(storedState) : extractInitialMessages();
  const removedChats = new Set(JSON.parse(localStorage.getItem(removedChatsStorageKey) || "[]"));
  const storedProfiles = localStorage.getItem(chatProfilesStorageKey);
  if (storedProfiles) {
    try {
      Object.assign(chatProfiles, JSON.parse(storedProfiles));
    } catch (error) {
      // Ignore invalid stored profiles.
    }
  }

  const saveChatState = () => {
    localStorage.setItem(chatStorageKey, JSON.stringify(chatState));
    localStorage.setItem(chatStorageVersionKey, chatStorageVersion);
  };

  const createBubble = (message) => {
    const bubble = document.createElement("div");
    bubble.className = `chat-desktop-bubble ${message.sender}`;

    if (message.typing) {
      bubble.classList.add("typing");
    }

    const text = document.createElement("p");
    text.textContent = message.text;

    const time = document.createElement("span");
    time.textContent = message.time;

    bubble.append(text, time);
    return bubble;
  };

  const updateThreadPreview = (chatId) => {
    const thread = document.querySelector(`[data-desktop-chat="${chatId}"]`);
    const messages = chatState[chatId];
    const lastMessage = messages?.[messages.length - 1];

    if (!thread) {
      return;
    }

    const preview = thread.querySelector(".chat-desktop-thread-bottom p");
    if (preview && lastMessage) {
      preview.textContent = lastMessage.text;
    } else if (preview) {
      preview.textContent = "Inizia tu la conversazione";
    }
  };

  const renderChat = (chatId) => {
    const panel = document.querySelector(`[data-desktop-panel="${chatId}"]`);
    const messagesWrap = panel?.querySelector(".chat-desktop-messages");
    if (!panel || !messagesWrap) {
      return;
    }

    messagesWrap.innerHTML = "";
    (chatState[chatId] || []).forEach((message) => {
      messagesWrap.appendChild(createBubble(message));
    });
    messagesWrap.scrollTop = messagesWrap.scrollHeight;
    updateThreadPreview(chatId);
  };

  const addMessage = (chatId, message) => {
    chatState[chatId] = chatState[chatId] || [];
    chatState[chatId].push(message);
    saveChatState();
    renderChat(chatId);
  };

  const getChatTranscript = (chatId) =>
    (chatState[chatId] || [])
      .filter((message) => !message.typing)
      .map((message) => `${message.sender}: ${message.text.toLowerCase()}`)
      .join(" ");

  const getLastBotMessage = (chatId) => {
    const messages = [...(chatState[chatId] || [])].reverse();
    return messages.find((message) => message.sender === "received" && !message.typing)?.text || "";
  };

  const detectConversationData = (chatId, userMessage, role) => {
    const transcript = `${getChatTranscript(chatId)} sent: ${userMessage.toLowerCase()}`;
    const hasTime =
      /mattina|pomeriggio|sera|notte|weekend|lunedi|martedi|mercoledi|giovedi|venerdi|sabato|domenica|\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\b\s*ore/.test(transcript);
    const hasZone =
      /milano|roma|torino|napoli|bologna|via|zona|quartiere|indirizzo|partenza|arrivo/.test(transcript);
    const hasDate =
      /oggi|domani|settimana|mese|data|luned|marted|mercoled|gioved|venerd|sabat|domenic|\b\d{1,2}\/\d{1,2}\b/.test(transcript);
    const hasPriceMention = /prezzo|costo|budget|quanto/.test(transcript);

    if (role === "babysitter") {
      return {
        hasChildrenInfo: /bambin|anni|figli|figlio|figlia|eta/.test(transcript),
        hasTime,
        hasZone,
        hasDate,
        hasPriceMention,
      };
    }

    if (role === "petsitter") {
      return {
        hasPetInfo: /cane|gatto|animale|cucciolo|taglia|passegg|lettiera/.test(transcript),
        hasTime,
        hasZone,
        hasDate,
        hasPriceMention,
      };
    }

    return {
      hasAddresses: /indirizzo|partenza|arrivo|via|piazza|zona/.test(transcript),
      hasBuildingInfo: /piano|ascensore|mobili|scatol|volume|smontaggio/.test(transcript),
      hasDate,
      hasPriceMention,
    };
  };

  const avoidRepeat = (chatId, reply, fallback) => {
    const lastBotMessage = getLastBotMessage(chatId).trim().toLowerCase();
    if (reply.trim().toLowerCase() === lastBotMessage) {
      return fallback;
    }

    return reply;
  };

  const buildAiReply = (chatId, userMessage) => {
    const profile = chatProfiles[chatId];
    const message = userMessage.toLowerCase();

    if (!profile) {
      return "Ho letto il tuo messaggio. Se vuoi, dammi qualche dettaglio in piu' e ti rispondo meglio.";
    }

    const agreementIntent =
      message.includes("siamo d'accordo") ||
      message.includes("siamo daccordo") ||
      message.includes("d'accordo") ||
      message.includes("daccordo") ||
      message.includes("accordo") ||
      message.includes("confermo") ||
      message.includes("va bene cosi") ||
      message.includes("perfetto allora") ||
      message.includes("ok allora");

    if (agreementIntent) {
      return avoidRepeat(
        chatId,
        "Perfetto, siamo d'accordo. Ti confermo tutto e resto disponibile qui in chat se vuoi aggiungere un ultimo dettaglio.",
        "Perfetto, accordo confermato. Grazie, allora procediamo cosi' e ci aggiorniamo qui se serve altro."
      );
    }

    if (message.includes("grazie")) {
      return avoidRepeat(
        chatId,
        "Volentieri. Se vuoi continuare, mandami pure altri dettagli e ti rispondo subito.",
        "Figurati, resto qui a disposizione se vuoi definire meglio gli ultimi dettagli."
      );
    }

    if (message.includes("ciao") || message.includes("salve") || message.includes("buongiorno")) {
      return avoidRepeat(
        chatId,
        `Ciao, sono ${profile.name}. ${profile.followUp}`,
        `Piacere, sono ${profile.name}. Raccontami pure di cosa hai bisogno e ti rispondo in modo preciso.`
      );
    }

    if (message.includes("prezzo") || message.includes("costo") || message.includes("quanto")) {
      return avoidRepeat(
        chatId,
        `${profile.pricing} ${profile.followUp}`,
        `${profile.pricing} Se mi dai qualche dettaglio in piu', posso essere piu' preciso.`
      );
    }

    if (message.includes("orario") || message.includes("orari") || message.includes("disponib")) {
      return avoidRepeat(
        chatId,
        `${profile.availability} ${profile.followUp}`,
        `${profile.availability} Se vuoi, scrivimi la fascia oraria che preferisci.`
      );
    }

    if (message.includes("oggi") || message.includes("domani") || message.includes("settimana") || message.includes("data")) {
      return avoidRepeat(
        chatId,
        `Posso verificare la disponibilita' in base alla data che preferisci. ${profile.followUp}`,
        "Perfetto, scrivimi pure la data e gli altri dettagli principali, cosi' ti confermo meglio."
      );
    }

    if (profile.role === "babysitter") {
      const details = detectConversationData(chatId, userMessage, profile.role);
      if (!details.hasChildrenInfo) {
        return avoidRepeat(
          chatId,
          "Per il babysitting mi aiuta sapere quanti anni hanno i bambini.",
          "Mi dici l'eta' dei bambini? Cosi' capisco meglio come organizzarmi."
        );
      }

      if (!details.hasTime) {
        return avoidRepeat(
          chatId,
          "Perfetto. Mi indichi anche per quante ore ti serve supporto e in quale fascia della giornata?",
          "Ottimo, ora mi manca solo capire orario e durata del servizio."
        );
      }

      if (!details.hasZone) {
        return avoidRepeat(
          chatId,
          "Bene, adesso mi serve anche la zona in cui ti trovi, cosi' capisco la disponibilita'.",
          "Mi scrivi anche la zona o l'indirizzo indicativo?"
        );
      }

      return avoidRepeat(
        chatId,
        "Perfetto, ho capito il quadro generale. Se vuoi possiamo confermare qui gli ultimi dettagli pratici.",
        "Direi che ora ho quasi tutto. Se ti va, possiamo chiudere accordandoci qui in chat."
      );
    }

    if (profile.role === "petsitter") {
      const details = detectConversationData(chatId, userMessage, profile.role);
      if (!details.hasPetInfo) {
        return avoidRepeat(
          chatId,
          "Per il petsitting dimmi pure che animale hai e se ci sono esigenze particolari.",
          "Mi dici se si tratta di cane, gatto o altro animale?"
        );
      }

      if (!details.hasDate) {
        return avoidRepeat(
          chatId,
          "Perfetto. Mi indichi anche per quali giorni o date ti serve il servizio?",
          "Ottimo, ora mi servono le date o i giorni precisi."
        );
      }

      if (!details.hasTime) {
        return avoidRepeat(
          chatId,
          "Va bene. Mi scrivi anche quante visite o in quali orari ti servirebbe supporto?",
          "Mi manca solo capire orari e numero di visite o passeggiate."
        );
      }

      return avoidRepeat(
        chatId,
        "Perfetto, mi sembra tutto chiaro. Se vuoi possiamo confermare il servizio qui in chat.",
        "Ottimo, adesso abbiamo quasi tutto. Se per te va bene possiamo definirlo."
      );
    }

    const details = detectConversationData(chatId, userMessage, profile.role);
    if (!details.hasAddresses) {
      return avoidRepeat(
        chatId,
        "Per il trasloco mi servono indirizzo di partenza e indirizzo di arrivo.",
        "Mi scrivi i due indirizzi principali del trasloco?"
      );
    }

    if (!details.hasBuildingInfo) {
      return avoidRepeat(
        chatId,
        "Perfetto. Mi indichi anche piano, ascensore e quantita indicativa di mobili o scatole?",
        "Ora mi servono piano, ascensore e volume del trasloco."
      );
    }

    if (!details.hasDate) {
      return avoidRepeat(
        chatId,
        "Bene, mi manca solo la data prevista del trasloco.",
        "Ottimo, puoi dirmi anche la data o il periodo in cui vuoi farlo?"
      );
    }

    return avoidRepeat(
      chatId,
      "Perfetto, il quadro e chiaro. Se vuoi possiamo considerarci d'accordo e definire gli ultimi dettagli operativi.",
      "Direi che ci siamo quasi. Se per te va bene, possiamo confermare tutto qui."
    );
  };

  const setDesktopChat = (chatId) => {
    activeDesktopChatId = chatId;
    getDesktopChatItems().forEach((item) => {
      const isActive = item.getAttribute("data-desktop-chat") === chatId;
      item.classList.toggle("active", isActive);

      if (isActive) {
        item.classList.remove("unread");
      }
    });

    getDesktopChatPanels().forEach((panel) => {
      panel.classList.toggle("active", panel.getAttribute("data-desktop-panel") === chatId);
    });

    desktopChatEmpty.classList.remove("active");
    renderChat(chatId);
  };

  desktopChatItems.forEach(bindDesktopThread);
  desktopChatPanels.forEach((panel) => {
    ensureDeleteButton(panel);
    bindDesktopPanelForm(panel);
  });

  removedChats.forEach((chatId) => {
    document.querySelector(`[data-desktop-chat="${chatId}"]`)?.remove();
    document.querySelector(`[data-desktop-panel="${chatId}"]`)?.remove();
  });

  Object.entries(chatProfiles).forEach(([chatId, profile]) => {
    if (builtInChatIds.includes(chatId) || removedChats.has(chatId)) {
      return;
    }

    ensureDynamicChatProfile({
      id: chatId,
      name: profile.name,
      category: profile.category || "",
      role: profile.role,
      image: profile.image || "gallery-01.jpg",
    });
  });

  try {
    const selectedProfile = JSON.parse(sessionStorage.getItem(selectedChatProfileKey) || "null");
    const selectedChatId = ensureDynamicChatProfile(selectedProfile);
    if (selectedChatId) {
      setDesktopChat(selectedChatId);
      sessionStorage.removeItem(selectedChatProfileKey);
    }
  } catch (error) {
    sessionStorage.removeItem(selectedChatProfileKey);
  }

  if (chatSearchInput) {
    chatSearchInput.addEventListener("input", () => {
      const query = chatSearchInput.value.trim().toLowerCase();

      getDesktopChatItems().forEach((item) => {
        const label = item.textContent?.toLowerCase() || "";
        item.style.display = label.includes(query) ? "" : "none";
      });
    });
  }
}
