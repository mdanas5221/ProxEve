(function () {
  "use strict";

  // =========================================================================
  // 1. Shared Shell & Sidebar Controller
  // =========================================================================
  const STORAGE_KEY = "proxeve_sidebar_collapsed";

  function applyCollapsedClass(collapsed) {
    if (collapsed) {
      document.documentElement.classList.add("sidebar-collapsed");
      if (document.body) document.body.classList.add("sidebar-collapsed");
    } else {
      document.documentElement.classList.remove("sidebar-collapsed");
      if (document.body) document.body.classList.remove("sidebar-collapsed");
    }
  }

  // Pre-hydration check to prevent layout shifts
  try {
    if (
      window.innerWidth > 992 &&
      localStorage.getItem(STORAGE_KEY) === "true"
    ) {
      applyCollapsedClass(true);
    }
  } catch (e) {}

  function isDesktop() {
    return window.innerWidth > 992;
  }

  function isCollapsed() {
    return (
      document.documentElement.classList.contains("sidebar-collapsed") ||
      (document.body && document.body.classList.contains("sidebar-collapsed"))
    );
  }

  function updateButtonAria(collapsed) {
    const headerToggleBtn = document.getElementById("dash-sidebar-toggle-btn");
    const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
    if (headerToggleBtn) {
      headerToggleBtn.setAttribute(
        "aria-expanded",
        collapsed ? "false" : "true",
      );
      headerToggleBtn.setAttribute(
        "title",
        collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)",
      );
    }
    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.setAttribute(
        "aria-expanded",
        collapsed ? "false" : "true",
      );
    }
  }

  function setDesktopCollapsed(collapsed) {
    applyCollapsedClass(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
    } catch (e) {}
    updateButtonAria(collapsed);
  }

  function toggleDesktopSidebar() {
    setDesktopCollapsed(!isCollapsed());
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById("dash-sidebar");
    const backdrop = document.getElementById("dash-mobile-backdrop");
    const mobileToggle = document.getElementById("dash-mobile-toggle");
    if (!sidebar || !backdrop) return;
    if (typeof window.closeMobileToc === "function") {
      window.closeMobileToc();
    }
    sidebar.classList.add("open");
    backdrop.classList.add("open");
    if (mobileToggle) {
      mobileToggle.classList.add("open");
      mobileToggle.setAttribute("aria-expanded", "true");
    }
    document.body.classList.add("mobile-nav-locked");
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById("dash-sidebar");
    const backdrop = document.getElementById("dash-mobile-backdrop");
    const mobileToggle = document.getElementById("dash-mobile-toggle");
    if (!sidebar || !backdrop) return;
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
    if (mobileToggle) {
      mobileToggle.classList.remove("open");
      mobileToggle.setAttribute("aria-expanded", "false");
    }
    document.body.classList.remove("mobile-nav-locked");
  }

  function closeSidebar() {
    closeMobileSidebar();
  }

  function toggleMobileSidebar() {
    const sidebar = document.getElementById("dash-sidebar");
    if (sidebar && sidebar.classList.contains("open")) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  }

  window.proxeveSidebar = {
    toggle: function () {
      if (isDesktop()) toggleDesktopSidebar();
      else toggleMobileSidebar();
    },
    collapse: function () {
      if (isDesktop()) setDesktopCollapsed(true);
    },
    expand: function () {
      if (isDesktop()) setDesktopCollapsed(false);
    },
    openMobile: openMobileSidebar,
    closeMobile: closeMobileSidebar,
  };

  // =========================================================================
  // 2. Shared Toast Notification System
  // =========================================================================
  let toastTimer = null;
  function showToast(message) {
    let toast = document.getElementById("dash-toast");
    let toastMsg =
      document.getElementById("dash-toast-message") ||
      document.getElementById("toast-message");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "dash-toast";
      toast.className = "dash-toast";
      toast.innerHTML = `<span id="dash-toast-message">${message}</span>`;
      document.body.appendChild(toast);
      toastMsg = document.getElementById("dash-toast-message");
    }

    if (toastMsg) {
      toastMsg.textContent = message;
    }
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
  window.showToast = showToast;

  // =========================================================================
  // 3. Shared Project Workspace Selector Controller (Persistent across all pages)
  // =========================================================================
  const PROJECT_STORAGE_KEY = "proxeve_selected_project";

  function getActiveProject() {
    try {
      return localStorage.getItem(PROJECT_STORAGE_KEY) || "my-project";
    } catch (e) {
      return "my-project";
    }
  }

  function setActiveProject(projectName) {
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, projectName);
    } catch (e) {}

    const currentProjectDisplay = document.getElementById(
      "current-project-display",
    );
    if (currentProjectDisplay) {
      currentProjectDisplay.textContent = projectName;
    }

    const projectMenu = document.getElementById("menu-project-selector");
    if (projectMenu) {
      projectMenu
        .querySelectorAll(".project-menu-item:not(.project-menu-action)")
        .forEach((item) => {
          if (item.getAttribute("data-value") === projectName) {
            item.classList.add("selected");
          } else {
            item.classList.remove("selected");
          }
        });
    }

    // Sync usage page in-content filter if present
    const usageProjectDisplay = document.getElementById(
      "selected-usage-project-name",
    );
    if (usageProjectDisplay) {
      usageProjectDisplay.innerHTML = `<span class="project-dot" aria-hidden="true"></span><span>${projectName}</span>`;
    }
  }

  function initSharedProjectSelector() {
    const projectBtn = document.getElementById("btn-project-selector");
    const projectMenu = document.getElementById("menu-project-selector");
    const dropdownCreateProjectBtn = document.getElementById(
      "dropdown-btn-create-project",
    );
    const projectWrap = document.getElementById("project-selector-wrap");

    if (!projectBtn || !projectMenu) return;

    // Apply saved project on page load
    const activeProject = getActiveProject();
    setActiveProject(activeProject);

    function toggleProjectDropdown(e) {
      if (e) e.stopPropagation();
      const isOpen = projectMenu.classList.contains("show");
      if (isOpen) {
        closeProjectDropdown();
      } else {
        openProjectDropdown();
      }
    }

    function openProjectDropdown() {
      projectMenu.classList.add("show");
      projectBtn.classList.add("open");
      projectBtn.setAttribute("aria-expanded", "true");
    }

    function closeProjectDropdown() {
      projectMenu.classList.remove("show");
      projectBtn.classList.remove("open");
      projectBtn.setAttribute("aria-expanded", "false");
    }

    projectBtn.addEventListener("click", toggleProjectDropdown);

    projectMenu
      .querySelectorAll(".project-menu-item:not(.project-menu-action)")
      .forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const val = item.getAttribute("data-value");
          if (val) {
            setActiveProject(val);
            closeProjectDropdown();
            showToast(`Active project changed to "${val}"`);
          }
        });
      });

    if (dropdownCreateProjectBtn) {
      dropdownCreateProjectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeProjectDropdown();
        const modal = document.getElementById("modal-create-project");
        if (modal) {
          modal.classList.add("open");
          const input = document.getElementById("project-name");
          if (input) setTimeout(() => input.focus(), 60);
        } else {
          window.location.href = "projects.html?create=true";
        }
      });
    }

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (projectWrap && !projectWrap.contains(e.target)) {
        closeProjectDropdown();
      }
    });

    // Close dropdown on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && projectMenu.classList.contains("show")) {
        closeProjectDropdown();
      }
    });
  }

  // =========================================================================
  // 4. Overview Page Module (dashboard.html)
  // =========================================================================
  function initOverviewModule() {
    const isOverview =
      document.getElementById("api-key-display") ||
      document.getElementById("btn-copy-key") ||
      document.querySelector(".dash-overview-grid") ||
      window.location.pathname.endsWith("dashboard.html") ||
      window.location.pathname === "/";
    if (!isOverview) return;

    // API Key Interactive Actions
    const copyKeyBtn = document.getElementById("btn-copy-key");
    const toggleKeyBtn = document.getElementById("btn-toggle-key");
    const keyDisplay = document.getElementById("api-key-display");
    let keyRevealed = false;
    let fullMockKey = "pk_live_9x8f2a1e7b4c6d03e5a84192";

    if (copyKeyBtn) {
      copyKeyBtn.addEventListener("click", () => {
        navigator.clipboard
          .writeText(fullMockKey)
          .then(() => {
            showToast("API key copied to clipboard (Demo key)");
          })
          .catch(() => {
            showToast("API key copied: " + fullMockKey);
          });
      });
    }

    if (toggleKeyBtn && keyDisplay) {
      toggleKeyBtn.addEventListener("click", () => {
        keyRevealed = !keyRevealed;
        keyDisplay.textContent = keyRevealed
          ? fullMockKey
          : "pk_live_••••••••••••••••••••";
        toggleKeyBtn.setAttribute(
          "title",
          keyRevealed ? "Hide API key" : "Show API key",
        );
      });
    }

    // Create Key Modal Handling
    const modalCreateKey = document.getElementById("modal-create-key");
    const createKeyBannerBtn = document.getElementById("btn-create-key-banner");
    const closeModalBtn = document.getElementById("btn-close-modal");
    const cancelModalBtn = document.getElementById("btn-modal-cancel");
    const submitModalBtn = document.getElementById("btn-submit-modal");
    const keyNameInput = document.getElementById("key-name-input");
    const keyProjectSelect = document.getElementById("key-project-select");
    const keyEnvSelect = document.getElementById("key-env-select");
    const copyGenKeyBtn = document.getElementById("btn-copy-modal-key");
    const generatedKeyGroup = document.getElementById("generated-key-group");
    const generatedKeyInput = document.getElementById("generated-key-input");
    const manageKeysBtn = document.getElementById("btn-manage-keys");

    let currentGeneratedKey = "";
    let isKeyGenerated = false;

    function resetCreateKeyModal() {
      isKeyGenerated = false;
      currentGeneratedKey = "";
      if (keyNameInput) {
        keyNameInput.value = "";
        keyNameInput.disabled = false;
        keyNameInput.classList.remove("is-invalid");
      }
      if (keyProjectSelect) {
        keyProjectSelect.value = "";
        keyProjectSelect.disabled = false;
        keyProjectSelect.classList.remove("is-invalid");
      }
      if (keyEnvSelect) {
        keyEnvSelect.value = "";
        keyEnvSelect.disabled = false;
        keyEnvSelect.classList.remove("is-invalid");
      }
      document
        .querySelectorAll(".form-error-msg")
        .forEach((el) => el.classList.remove("visible"));
      if (generatedKeyGroup) generatedKeyGroup.style.display = "none";
      if (generatedKeyInput) generatedKeyInput.value = "";
      if (submitModalBtn) {
        submitModalBtn.textContent = "Create API Key";
        submitModalBtn.classList.remove("is-done");
      }
      if (cancelModalBtn) {
        cancelModalBtn.textContent = "Cancel";
      }
      if (copyGenKeyBtn) {
        copyGenKeyBtn.classList.remove("copied");
        const label = copyGenKeyBtn.querySelector(".copy-label");
        if (label) label.textContent = "Copy";
      }
    }

    function openCreateKeyModal() {
      if (modalCreateKey) {
        resetCreateKeyModal();
        modalCreateKey.classList.add("open");
        if (keyNameInput) {
          setTimeout(() => keyNameInput.focus(), 60);
        }
      }
    }

    function closeCreateKeyModal() {
      if (modalCreateKey) {
        modalCreateKey.classList.remove("open");
        resetCreateKeyModal();
      }
    }

    // Wire up Create API Key button
    if (createKeyBannerBtn) {
      createKeyBannerBtn.addEventListener("click", openCreateKeyModal);
    }

    // Any elements with data-action="create-key"
    document.querySelectorAll('[data-action="create-key"]').forEach((btn) => {
      btn.addEventListener("click", openCreateKeyModal);
    });

    if (closeModalBtn)
      closeModalBtn.addEventListener("click", closeCreateKeyModal);
    if (cancelModalBtn)
      cancelModalBtn.addEventListener("click", closeCreateKeyModal);

    if (modalCreateKey) {
      modalCreateKey.addEventListener("click", (e) => {
        if (e.target === modalCreateKey) {
          closeCreateKeyModal();
        }
      });
    }

    // Close modal on Escape
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        modalCreateKey &&
        modalCreateKey.classList.contains("open")
      ) {
        closeCreateKeyModal();
      }
    });

    // Clear validation errors on user interaction
    if (keyNameInput) {
      keyNameInput.addEventListener("input", () => {
        keyNameInput.classList.remove("is-invalid");
        const err = document.getElementById("key-name-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (keyProjectSelect) {
      keyProjectSelect.addEventListener("change", () => {
        keyProjectSelect.classList.remove("is-invalid");
        const err = document.getElementById("key-project-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (keyEnvSelect) {
      keyEnvSelect.addEventListener("change", () => {
        keyEnvSelect.classList.remove("is-invalid");
        const err = document.getElementById("key-env-error");
        if (err) err.classList.remove("visible");
      });
    }

    // Handle Submit / Create Key
    function handleCreateKeySubmit() {
      if (isKeyGenerated) {
        closeCreateKeyModal();
        return;
      }

      const nameVal = keyNameInput ? keyNameInput.value.trim() : "";
      const projectVal = keyProjectSelect ? keyProjectSelect.value : "";
      const envVal = keyEnvSelect ? keyEnvSelect.value : "";

      const nameErr = document.getElementById("key-name-error");
      const projErr = document.getElementById("key-project-error");
      const envErr = document.getElementById("key-env-error");

      let hasError = false;

      if (!nameVal) {
        if (keyNameInput) keyNameInput.classList.add("is-invalid");
        if (nameErr) nameErr.classList.add("visible");
        hasError = true;
      } else {
        if (keyNameInput) keyNameInput.classList.remove("is-invalid");
        if (nameErr) nameErr.classList.remove("visible");
      }

      if (!projectVal) {
        if (keyProjectSelect) keyProjectSelect.classList.add("is-invalid");
        if (projErr) projErr.classList.add("visible");
        hasError = true;
      } else {
        if (keyProjectSelect) keyProjectSelect.classList.remove("is-invalid");
        if (projErr) projErr.classList.remove("visible");
      }

      if (!envVal) {
        if (keyEnvSelect) keyEnvSelect.classList.add("is-invalid");
        if (envErr) envErr.classList.add("visible");
        hasError = true;
      } else {
        if (keyEnvSelect) keyEnvSelect.classList.remove("is-invalid");
        if (envErr) envErr.classList.remove("visible");
      }

      if (hasError) {
        showToast("Please fill all required fields.");
        if (!nameVal && keyNameInput) keyNameInput.focus();
        else if (!projectVal && keyProjectSelect) keyProjectSelect.focus();
        else if (!envVal && keyEnvSelect) keyEnvSelect.focus();
        return;
      }

      // All fields filled! Generate random fake key
      const randChars = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");
      currentGeneratedKey = `pk_${envVal === "Development" ? "test" : "live"}_${randChars}`;
      fullMockKey = currentGeneratedKey;

      // Suddenly display "Your API Key" inside the form
      if (generatedKeyInput) generatedKeyInput.value = currentGeneratedKey;
      if (generatedKeyGroup) generatedKeyGroup.style.display = "flex";

      // Lock form inputs
      if (keyNameInput) keyNameInput.disabled = true;
      if (keyProjectSelect) keyProjectSelect.disabled = true;
      if (keyEnvSelect) keyEnvSelect.disabled = true;

      // Change submit button to Done and cancel button to Close
      if (submitModalBtn) {
        submitModalBtn.textContent = "Done";
        submitModalBtn.classList.add("is-done");
      }
      if (cancelModalBtn) {
        cancelModalBtn.textContent = "Close";
      }

      isKeyGenerated = true;

      // Update Quick Access API Key Card
      const panelKeyName = document.querySelector(
        "#panel-api-keys .api-key-name",
      );
      if (panelKeyName) panelKeyName.textContent = nameVal;
      if (keyDisplay) {
        keyRevealed = false;
        keyDisplay.textContent = "pk_live_••••••••••••••••••••";
      }

      showToast(`API Key "${nameVal}" generated successfully!`);
    }

    // Copy Generated Key button handler
    if (copyGenKeyBtn) {
      copyGenKeyBtn.addEventListener("click", () => {
        if (!currentGeneratedKey) return;

        const copySuccess = () => {
          copyGenKeyBtn.classList.add("copied");
          const label = copyGenKeyBtn.querySelector(".copy-label");
          if (label) label.textContent = "Copied!";
          showToast("API key copied to clipboard!");
          setTimeout(() => {
            copyGenKeyBtn.classList.remove("copied");
            if (label) label.textContent = "Copy";
          }, 2500);
        };

        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(currentGeneratedKey)
            .then(copySuccess)
            .catch(() => {
              copySuccess();
            });
        } else {
          copySuccess();
        }
      });
    }

    if (submitModalBtn) {
      submitModalBtn.addEventListener("click", handleCreateKeySubmit);
    }

    if (keyNameInput) {
      keyNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCreateKeySubmit();
        }
      });
    }

    if (manageKeysBtn) {
      manageKeysBtn.addEventListener("click", () => {
        window.location.href = "api-keys.html";
      });
    }

    // ==================================================
    // Create Project Modal Handling (All Fields Required)
    // ==================================================
    const modalCreateProject = document.getElementById("modal-create-project");
    const createProjectBannerBtn = document.getElementById(
      "btn-create-project-banner",
    );
    const closeProjectModalBtn = document.getElementById(
      "btn-close-project-modal",
    );
    const cancelProjectModalBtn = document.getElementById(
      "btn-cancel-project-modal",
    );
    const submitProjectModalBtn = document.getElementById(
      "btn-submit-project-modal",
    );
    const projectNameInput = document.getElementById("project-name-input");
    const projectDescInput = document.getElementById("project-desc-input");
    const projectProviderSelect = document.getElementById(
      "project-provider-select",
    );

    function resetCreateProjectModal() {
      if (projectNameInput) {
        projectNameInput.value = "";
        projectNameInput.classList.remove("is-invalid");
      }
      if (projectDescInput) {
        projectDescInput.value = "";
        projectDescInput.classList.remove("is-invalid");
      }
      if (projectProviderSelect) {
        projectProviderSelect.value = "";
        projectProviderSelect.classList.remove("is-invalid");
      }
      const nameErr = document.getElementById("project-name-error");
      const descErr = document.getElementById("project-desc-error");
      const providerErr = document.getElementById("project-provider-error");
      if (nameErr) nameErr.classList.remove("visible");
      if (descErr) descErr.classList.remove("visible");
      if (providerErr) providerErr.classList.remove("visible");
    }

    function openCreateProjectModal() {
      if (modalCreateProject) {
        resetCreateProjectModal();
        modalCreateProject.classList.add("open");
        if (projectNameInput) {
          setTimeout(() => projectNameInput.focus(), 60);
        }
      }
    }

    function closeCreateProjectModal() {
      if (modalCreateProject) {
        modalCreateProject.classList.remove("open");
        resetCreateProjectModal();
      }
    }

    if (createProjectBannerBtn) {
      createProjectBannerBtn.addEventListener("click", openCreateProjectModal);
    }

    document
      .querySelectorAll('[data-action="create-project"]')
      .forEach((btn) => {
        btn.addEventListener("click", openCreateProjectModal);
      });

    if (closeProjectModalBtn)
      closeProjectModalBtn.addEventListener("click", closeCreateProjectModal);
    if (cancelProjectModalBtn)
      cancelProjectModalBtn.addEventListener("click", closeCreateProjectModal);

    if (modalCreateProject) {
      modalCreateProject.addEventListener("click", (e) => {
        if (e.target === modalCreateProject) {
          closeCreateProjectModal();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        modalCreateProject &&
        modalCreateProject.classList.contains("open")
      ) {
        closeCreateProjectModal();
      }
    });

    // Clear Project validation errors on user interaction
    if (projectNameInput) {
      projectNameInput.addEventListener("input", () => {
        projectNameInput.classList.remove("is-invalid");
        const err = document.getElementById("project-name-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (projectDescInput) {
      projectDescInput.addEventListener("input", () => {
        projectDescInput.classList.remove("is-invalid");
        const err = document.getElementById("project-desc-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (projectProviderSelect) {
      projectProviderSelect.addEventListener("change", () => {
        projectProviderSelect.classList.remove("is-invalid");
        const err = document.getElementById("project-provider-error");
        if (err) err.classList.remove("visible");
      });
    }

    function handleCreateProjectSubmit() {
      const nameVal = projectNameInput ? projectNameInput.value.trim() : "";
      const descVal = projectDescInput ? projectDescInput.value.trim() : "";
      const providerVal = projectProviderSelect
        ? projectProviderSelect.value
        : "";

      const nameErr = document.getElementById("project-name-error");
      const descErr = document.getElementById("project-desc-error");
      const providerErr = document.getElementById("project-provider-error");

      let hasError = false;

      if (!nameVal) {
        if (projectNameInput) projectNameInput.classList.add("is-invalid");
        if (nameErr) nameErr.classList.add("visible");
        hasError = true;
      } else {
        if (projectNameInput) projectNameInput.classList.remove("is-invalid");
        if (nameErr) nameErr.classList.remove("visible");
      }

      if (!descVal) {
        if (projectDescInput) projectDescInput.classList.add("is-invalid");
        if (descErr) descErr.classList.add("visible");
        hasError = true;
      } else {
        if (projectDescInput) projectDescInput.classList.remove("is-invalid");
        if (descErr) descErr.classList.remove("visible");
      }

      if (!providerVal) {
        if (projectProviderSelect)
          projectProviderSelect.classList.add("is-invalid");
        if (providerErr) providerErr.classList.add("visible");
        hasError = true;
      } else {
        if (projectProviderSelect)
          projectProviderSelect.classList.remove("is-invalid");
        if (providerErr) providerErr.classList.remove("visible");
      }

      if (hasError) {
        showToast("Please fill all required fields.");
        if (!nameVal && projectNameInput) projectNameInput.focus();
        else if (!descVal && projectDescInput) projectDescInput.focus();
        else if (!providerVal && projectProviderSelect)
          projectProviderSelect.focus();
        return;
      }

      // All fields valid! Add project to keyProjectSelect options if available
      if (keyProjectSelect) {
        const opt = document.createElement("option");
        opt.value = nameVal;
        opt.textContent = `${nameVal} (${providerVal})`;
        keyProjectSelect.appendChild(opt);
        keyProjectSelect.value = nameVal;
      }

      // Also add new project to header project selector dropdown
      const projectMenu = document.getElementById("menu-project-selector");
      const currentProjectDisplay = document.getElementById(
        "current-project-display",
      );
      const projectBtn = document.getElementById("btn-project-selector");
      if (projectMenu) {
        const divider = projectMenu.querySelector(".project-dropdown-divider");
        const newBtn = document.createElement("button");
        newBtn.type = "button";
        newBtn.className = "project-menu-item selected";
        newBtn.setAttribute("data-value", nameVal);
        newBtn.setAttribute("role", "menuitem");
        newBtn.innerHTML = `
            <div class="project-item-info">
              <span class="project-dot" aria-hidden="true"></span>
              <span class="project-item-name">${nameVal}</span>
            </div>
            <svg class="project-item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
        // Deselect existing items
        projectMenu
          .querySelectorAll(".project-menu-item")
          .forEach((el) => el.classList.remove("selected"));
        if (divider) {
          projectMenu.insertBefore(newBtn, divider);
        } else {
          projectMenu.appendChild(newBtn);
        }
        // Attach click handler to the newly created project item
        newBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          setActiveProject(nameVal);
          const menu = document.getElementById("menu-project-selector");
          const btn = document.getElementById("btn-project-selector");
          if (menu) menu.classList.remove("show");
          if (btn) {
            btn.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
          }
          showToast(`Active project changed to "${nameVal}"`);
        });
        setActiveProject(nameVal);
      }

      closeCreateProjectModal();
      showToast(`Project "${nameVal}" created successfully!`);
    }

    if (submitProjectModalBtn) {
      submitProjectModalBtn.addEventListener(
        "click",
        handleCreateProjectSubmit,
      );
    }

    if (projectNameInput) {
      projectNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCreateProjectSubmit();
        }
      });
    }

    // Check URL query or hash for ?create=true or #create-key
    if (
      window.location.search.includes("create") ||
      window.location.hash.includes("create")
    ) {
      openCreateKeyModal();
    }

    // Recent Requests Filter Tabs
    const filterButtons = document.querySelectorAll(".filter-pill");
    const tableRows = document.querySelectorAll("#requests-tbody tr");

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.getAttribute("data-filter");

        tableRows.forEach((row) => {
          const status = row.getAttribute("data-status");
          if (filter === "all" || status === filter) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        });
      });
    });
  }

  // =========================================================================
  // 4. Projects Page Module (projects.html)
  // =========================================================================
  function initProjectsModule() {
    const isProjects =
      document.getElementById("btn-open-create-project") ||
      document.querySelector(".projects-table") ||
      window.location.pathname.includes("projects.html");
    if (!isProjects) return;

    // Modal Handling
    const openModalBtn = document.getElementById("btn-open-create-project");
    const mobileOpenModalBtn = document.getElementById(
      "btn-mobile-create-project",
    );
    const closeModalBtn = document.getElementById("btn-close-modal");
    const cancelModalBtn = document.getElementById("btn-modal-cancel");
    const submitModalBtn = document.getElementById("btn-submit-modal");
    const modalBackdrop = document.getElementById("modal-create-project");
    const emptyStateCreateBtn = document.getElementById("btn-empty-create");
    const projectNameInput = document.getElementById("project-name-input");
    const projectDescInput = document.getElementById("project-desc-input");
    const projectProviderSelect = document.getElementById(
      "project-provider-select",
    );

    function resetProjectForm() {
      if (projectNameInput) {
        projectNameInput.value = "";
        projectNameInput.classList.remove("is-invalid");
      }
      if (projectDescInput) {
        projectDescInput.value = "";
        projectDescInput.classList.remove("is-invalid");
      }
      if (projectProviderSelect) {
        projectProviderSelect.value = "";
        projectProviderSelect.classList.remove("is-invalid");
      }
      const nameErr = document.getElementById("project-name-error");
      const descErr = document.getElementById("project-desc-error");
      const provErr = document.getElementById("project-provider-error");
      if (nameErr) nameErr.classList.remove("visible");
      if (descErr) descErr.classList.remove("visible");
      if (provErr) provErr.classList.remove("visible");
    }

    function openModal() {
      if (modalBackdrop) {
        resetProjectForm();
        modalBackdrop.classList.add("open");
        if (projectNameInput) {
          setTimeout(() => projectNameInput.focus(), 60);
        }
      }
    }

    function closeModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.remove("open");
        resetProjectForm();
      }
    }

    if (openModalBtn) openModalBtn.addEventListener("click", openModal);
    if (mobileOpenModalBtn)
      mobileOpenModalBtn.addEventListener("click", openModal);
    if (emptyStateCreateBtn)
      emptyStateCreateBtn.addEventListener("click", openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) {
          closeModal();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        modalBackdrop &&
        modalBackdrop.classList.contains("open")
      ) {
        closeModal();
      }
    });

    // Clear Project validation errors on input/change
    if (projectNameInput) {
      projectNameInput.addEventListener("input", () => {
        projectNameInput.classList.remove("is-invalid");
        const err = document.getElementById("project-name-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (projectDescInput) {
      projectDescInput.addEventListener("input", () => {
        projectDescInput.classList.remove("is-invalid");
        const err = document.getElementById("project-desc-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (projectProviderSelect) {
      projectProviderSelect.addEventListener("change", () => {
        projectProviderSelect.classList.remove("is-invalid");
        const err = document.getElementById("project-provider-error");
        if (err) err.classList.remove("visible");
      });
    }

    function handleCreateProject() {
      const nameVal = projectNameInput ? projectNameInput.value.trim() : "";
      const descVal = projectDescInput ? projectDescInput.value.trim() : "";
      const providerVal = projectProviderSelect
        ? projectProviderSelect.value
        : "";

      const nameErr = document.getElementById("project-name-error");
      const descErr = document.getElementById("project-desc-error");
      const provErr = document.getElementById("project-provider-error");

      let hasError = false;

      if (!nameVal) {
        if (projectNameInput) projectNameInput.classList.add("is-invalid");
        if (nameErr) nameErr.classList.add("visible");
        hasError = true;
      } else {
        if (projectNameInput) projectNameInput.classList.remove("is-invalid");
        if (nameErr) nameErr.classList.remove("visible");
      }

      if (!descVal) {
        if (projectDescInput) projectDescInput.classList.add("is-invalid");
        if (descErr) descErr.classList.add("visible");
        hasError = true;
      } else {
        if (projectDescInput) projectDescInput.classList.remove("is-invalid");
        if (descErr) descErr.classList.remove("visible");
      }

      if (!providerVal) {
        if (projectProviderSelect)
          projectProviderSelect.classList.add("is-invalid");
        if (provErr) provErr.classList.add("visible");
        hasError = true;
      } else {
        if (projectProviderSelect)
          projectProviderSelect.classList.remove("is-invalid");
        if (provErr) provErr.classList.remove("visible");
      }

      if (hasError) {
        showToast("Please fill all required fields.");
        if (!nameVal && projectNameInput) projectNameInput.focus();
        else if (!descVal && projectDescInput) projectDescInput.focus();
        else if (!providerVal && projectProviderSelect)
          projectProviderSelect.focus();
        return;
      }

      // Add newly created project to projects table if table exists
      const tbody = document.querySelector(".projects-table tbody");
      if (tbody) {
        const newRow = document.createElement("tr");
        const providerBadgeClass = providerVal.toLowerCase();
        newRow.innerHTML = `
            <td>
              <div class="project-name-cell">
                <div class="project-icon-box" style="background: #f1f5f9; color: #0f172a;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                </div>
                <div>
                  <div class="project-title">${nameVal}</div>
                  <div class="project-desc-sub">${descVal}</div>
                </div>
              </div>
            </td>
            <td><span class="provider-pill provider-${providerBadgeClass}">${providerVal}</span></td>
            <td><span class="status-pill status-active">Active</span></td>
            <td>0</td>
            <td>0%</td>
            <td>Just now</td>
            <td>
              <button type="button" class="btn-table-action" onclick="showToast('Project ${nameVal} opened in Demo Mode')">View</button>
            </td>
          `;
        tbody.prepend(newRow);
      }

      // Update active project state in sidebar and storage
      setActiveProject(nameVal);

      closeModal();
      showToast(`Project "${nameVal}" created successfully!`);
    }

    if (submitModalBtn) {
      submitModalBtn.addEventListener("click", handleCreateProject);
    }

    if (
      window.location.search.includes("create") ||
      window.location.hash.includes("create")
    ) {
      setTimeout(openModal, 100);
    }

    if (projectNameInput) {
      projectNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCreateProject();
        }
      });
    }

    // Three-Dot Menus
    const threeDotButtons = document.querySelectorAll(".btn-three-dots");
    threeDotButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const dropdown = button.nextElementSibling;
        const isCurrentlyOpen = dropdown && dropdown.classList.contains("show");

        // Close all open dropdowns
        document
          .querySelectorAll(".menu-dropdown")
          .forEach((d) => d.classList.remove("show"));
        document
          .querySelectorAll(".btn-three-dots")
          .forEach((b) => b.classList.remove("active"));

        if (!isCurrentlyOpen && dropdown) {
          dropdown.classList.add("show");
          button.classList.add("active");
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
      document
        .querySelectorAll(".menu-dropdown")
        .forEach((d) => d.classList.remove("show"));
      document
        .querySelectorAll(".btn-three-dots")
        .forEach((b) => b.classList.remove("active"));
    });

    // View project action handlers
    const viewButtons = document.querySelectorAll(".btn-view-project");
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-project");
        showToast(`Viewing project "${name}" (Demo)`);
      });
    });

    // Menu item actions feedback
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const actionText = item.querySelector("span")
          ? item.querySelector("span").textContent.trim()
          : "Action";
        document
          .querySelectorAll(".menu-dropdown")
          .forEach((d) => d.classList.remove("show"));
        document
          .querySelectorAll(".btn-three-dots")
          .forEach((b) => b.classList.remove("active"));
        showToast(`${actionText} clicked (Demo Mode)`);
      });
    });
  }

  // =========================================================================
  // 5. API Keys Page Module (api-keys.html)
  // =========================================================================
  function initApiKeysModule() {
    const isApiKeys =
      document.getElementById("keys-tbody") ||
      (document.getElementById("btn-open-create-key") &&
        !document.getElementById("api-key-display")) ||
      window.location.pathname.includes("api-keys.html");
    if (!isApiKeys) return;

    // Modal Handling
    const openModalBtn = document.getElementById("btn-open-create-key");
    const closeModalBtn = document.getElementById("btn-close-modal");
    const cancelModalBtn = document.getElementById("btn-modal-cancel");
    const submitModalBtn = document.getElementById("btn-submit-modal");
    const modalBackdrop = document.getElementById("modal-create-key");
    const emptyStateCreateBtn = document.getElementById("btn-empty-create");
    const keyNameInput = document.getElementById("key-name-input");
    const keyProjectSelect = document.getElementById("key-project-select");
    const keyEnvSelect = document.getElementById("key-env-select");
    const copyGenKeyBtn = document.getElementById("btn-copy-modal-key");
    const generatedKeyGroup = document.getElementById("generated-key-group");
    const generatedKeyInput = document.getElementById("generated-key-input");

    let currentGeneratedKey = "";
    let isKeyGenerated = false;

    function resetModal() {
      isKeyGenerated = false;
      currentGeneratedKey = "";
      if (keyNameInput) {
        keyNameInput.value = "";
        keyNameInput.disabled = false;
        keyNameInput.classList.remove("is-invalid");
      }
      if (keyProjectSelect) {
        keyProjectSelect.value = "";
        keyProjectSelect.disabled = false;
        keyProjectSelect.classList.remove("is-invalid");
      }
      if (keyEnvSelect) {
        keyEnvSelect.value = "";
        keyEnvSelect.disabled = false;
        keyEnvSelect.classList.remove("is-invalid");
      }
      document
        .querySelectorAll(".form-error-msg")
        .forEach((el) => el.classList.remove("visible"));
      if (generatedKeyGroup) generatedKeyGroup.style.display = "none";
      if (generatedKeyInput) generatedKeyInput.value = "";
      if (submitModalBtn) {
        submitModalBtn.textContent = "Create API Key";
        submitModalBtn.classList.remove("is-done");
      }
      if (cancelModalBtn) {
        cancelModalBtn.textContent = "Cancel";
      }
      if (copyGenKeyBtn) {
        copyGenKeyBtn.classList.remove("copied");
        const label = copyGenKeyBtn.querySelector(".copy-label");
        if (label) label.textContent = "Copy";
      }
    }

    function openModal() {
      if (modalBackdrop) {
        resetModal();
        modalBackdrop.classList.add("open");
        if (keyNameInput) {
          setTimeout(() => keyNameInput.focus(), 60);
        }
      }
    }

    function closeModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.remove("open");
        resetModal();
      }
    }

    // Clear validation errors on user input
    if (keyNameInput) {
      keyNameInput.addEventListener("input", () => {
        keyNameInput.classList.remove("is-invalid");
        const err = document.getElementById("key-name-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (keyProjectSelect) {
      keyProjectSelect.addEventListener("change", () => {
        keyProjectSelect.classList.remove("is-invalid");
        const err = document.getElementById("key-project-error");
        if (err) err.classList.remove("visible");
      });
    }
    if (keyEnvSelect) {
      keyEnvSelect.addEventListener("change", () => {
        keyEnvSelect.classList.remove("is-invalid");
        const err = document.getElementById("key-env-error");
        if (err) err.classList.remove("visible");
      });
    }

    // Copy Generated Key button handler
    if (copyGenKeyBtn) {
      copyGenKeyBtn.addEventListener("click", () => {
        if (!currentGeneratedKey) return;

        const copySuccess = () => {
          copyGenKeyBtn.classList.add("copied");
          const label = copyGenKeyBtn.querySelector(".copy-label");
          if (label) label.textContent = "Copied!";
          showToast("API key copied to clipboard!");
          setTimeout(() => {
            copyGenKeyBtn.classList.remove("copied");
            if (label) label.textContent = "Copy";
          }, 2500);
        };

        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(currentGeneratedKey)
            .then(copySuccess)
            .catch(() => {
              copySuccess();
            });
        } else {
          copySuccess();
        }
      });
    }

    // Attach openModal to all Create API Key buttons
    if (openModalBtn) openModalBtn.addEventListener("click", openModal);
    const mobileOpenModalBtn = document.getElementById("btn-mobile-create-key");
    if (mobileOpenModalBtn)
      mobileOpenModalBtn.addEventListener("click", openModal);
    const bannerKeyBtn = document.getElementById("btn-create-key-banner");
    if (bannerKeyBtn) bannerKeyBtn.addEventListener("click", openModal);
    if (emptyStateCreateBtn)
      emptyStateCreateBtn.addEventListener("click", openModal);
    document.querySelectorAll('[data-action="create-key"]').forEach((btn) => {
      btn.addEventListener("click", openModal);
    });

    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) {
          closeModal();
        }
      });
    }

    // Close modal on Escape
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        modalBackdrop &&
        modalBackdrop.classList.contains("open")
      ) {
        closeModal();
      }
    });

    // Bind row actions (Copy, Revoke, Menu)
    function bindRowActions(row) {
      const copyBtn = row.querySelector(".btn-copy-key");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          const keyVal = copyBtn.getAttribute("data-key");
          if (navigator.clipboard) {
            navigator.clipboard
              .writeText(keyVal)
              .then(() => {
                showToast("API key copied to clipboard");
              })
              .catch(() => {
                showToast("API key copied: " + keyVal);
              });
          } else {
            showToast("API key copied: " + keyVal);
          }
        });
      }

      const revokeBtn = row.querySelector(".btn-revoke-key");
      if (revokeBtn) {
        revokeBtn.addEventListener("click", () => {
          const keyName = revokeBtn.getAttribute("data-name");
          const statusPill = row.querySelector(".status-pill");
          const codeBox = row.querySelector(".key-code-box");
          if (statusPill) {
            statusPill.className = "status-pill revoked";
            statusPill.innerHTML =
              '<span class="status-dot"></span><span>Revoked</span>';
          }
          if (codeBox) {
            codeBox.style.background = "#f1f5f9";
            codeBox.style.color = "#94a3b8";
            codeBox.style.borderStyle = "dashed";
          }
          showToast(`API Key "${keyName}" revoked.`);
        });
      }

      const threeDotBtn = row.querySelector(".btn-three-dots");
      if (threeDotBtn) {
        threeDotBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const dropdown = threeDotBtn.nextElementSibling;
          const isCurrentlyOpen =
            dropdown && dropdown.classList.contains("show");

          document
            .querySelectorAll(".menu-dropdown")
            .forEach((d) => d.classList.remove("show"));
          document
            .querySelectorAll(".btn-three-dots")
            .forEach((b) => b.classList.remove("active"));

          if (!isCurrentlyOpen && dropdown) {
            dropdown.classList.add("show");
            threeDotBtn.classList.add("active");
          }
        });
      }

      row.querySelectorAll(".menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const actionText = item.querySelector("span")
            ? item.querySelector("span").textContent.trim()
            : "Action";
          document
            .querySelectorAll(".menu-dropdown")
            .forEach((d) => d.classList.remove("show"));
          document
            .querySelectorAll(".btn-three-dots")
            .forEach((b) => b.classList.remove("active"));
          showToast(`${actionText} clicked (Demo Mode)`);
        });
      });
    }

    // Handle Key Creation Submit
    function handleCreateKeySubmit() {
      if (isKeyGenerated) {
        closeModal();
        return;
      }

      const input = document.getElementById("key-name-input");
      const projectSelect = document.getElementById("key-project-select");
      const envSelect = document.getElementById("key-env-select");
      const tbody = document.getElementById("keys-tbody");

      const keyName = input ? input.value.trim() : "";
      const project = projectSelect ? projectSelect.value : "";
      const env = envSelect ? envSelect.value : "";

      const nameErr = document.getElementById("key-name-error");
      const projErr = document.getElementById("key-project-error");
      const envErr = document.getElementById("key-env-error");

      let hasError = false;

      if (!keyName) {
        if (input) input.classList.add("is-invalid");
        if (nameErr) nameErr.classList.add("visible");
        hasError = true;
      } else {
        if (input) input.classList.remove("is-invalid");
        if (nameErr) nameErr.classList.remove("visible");
      }

      if (!project) {
        if (projectSelect) projectSelect.classList.add("is-invalid");
        if (projErr) projErr.classList.add("visible");
        hasError = true;
      } else {
        if (projectSelect) projectSelect.classList.remove("is-invalid");
        if (projErr) projErr.classList.remove("visible");
      }

      if (!env) {
        if (envSelect) envSelect.classList.add("is-invalid");
        if (envErr) envErr.classList.add("visible");
        hasError = true;
      } else {
        if (envSelect) envSelect.classList.remove("is-invalid");
        if (envErr) envErr.classList.remove("visible");
      }

      if (hasError) {
        showToast("Please fill all required fields.");
        if (!keyName && input) input.focus();
        else if (!project && projectSelect) projectSelect.focus();
        else if (!env && envSelect) envSelect.focus();
        return;
      }

      // All fields valid! Generate random fake key
      const randChars = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");
      currentGeneratedKey = `pk_${env === "Development" ? "test" : "live"}_${randChars}`;
      const maskedKey = `pk_${env === "Development" ? "test" : "live"}_••••••••••••••••••••`;

      // Suddenly display "Your API Key" inside the form
      if (generatedKeyInput) generatedKeyInput.value = currentGeneratedKey;
      if (generatedKeyGroup) generatedKeyGroup.style.display = "flex";

      // Lock form inputs
      if (input) input.disabled = true;
      if (projectSelect) projectSelect.disabled = true;
      if (envSelect) envSelect.disabled = true;

      // Change submit button to Done, cancel button to Close
      if (submitModalBtn) {
        submitModalBtn.textContent = "Done";
        submitModalBtn.classList.add("is-done");
      }
      if (cancelModalBtn) {
        cancelModalBtn.textContent = "Close";
      }

      isKeyGenerated = true;

      // Prepend to table
      if (tbody) {
        const newRow = document.createElement("tr");
        newRow.setAttribute("data-status", "active");
        newRow.innerHTML = `
            <td>
              <div class="key-name-group">
                <span class="key-name-text">${escapeHtml(keyName)}</span>
                <span class="key-env-badge">${env} Key</span>
              </div>
            </td>
            <td>
              <span class="project-badge">
                <svg class="project-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
                </svg>
                <span>${escapeHtml(project)}</span>
              </span>
            </td>
            <td>
              <div class="key-code-box" title="${currentGeneratedKey}">
                <span>${maskedKey}</span>
              </div>
            </td>
            <td class="date-cell">Just now</td>
            <td class="activity-cell">Never</td>
            <td>
              <span class="status-pill active">
                <span class="status-dot"></span>
                <span>Active</span>
              </span>
            </td>
            <td style="text-align: right;">
              <div class="actions-cell-group" style="justify-content: flex-end;">
                <button type="button" class="btn-action-icon btn-copy-key" data-key="${currentGeneratedKey}" title="Copy key">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                  <span>Copy</span>
                </button>
                <button type="button" class="btn-action-icon btn-action-danger btn-revoke-key" data-name="${escapeHtml(keyName)}" title="Revoke key">
                  <span>Revoke</span>
                </button>
                <div class="menu-container">
                  <button type="button" class="btn-three-dots" aria-label="Key actions" aria-haspopup="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="1.5"></circle>
                      <circle cx="12" cy="5" r="1.5"></circle>
                      <circle cx="12" cy="19" r="1.5"></circle>
                    </svg>
                  </button>
                  <div class="menu-dropdown" role="menu">
                    <button type="button" class="menu-item" role="menuitem">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                      <span>Edit Name</span>
                    </button>
                    <button type="button" class="menu-item" role="menuitem">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <span>Usage Limits</span>
                    </button>
                  </div>
                </div>
              </div>
            </td>
          `;
        tbody.prepend(newRow);
        bindRowActions(newRow);

        // Update toolbar count
        const toolbarTitle = document.querySelector(".toolbar-title");
        if (toolbarTitle) {
          const activeRows = tbody.querySelectorAll(
            'tr[data-status="active"]',
          ).length;
          toolbarTitle.textContent = `Active Credentials (${activeRows})`;
        }
      }

      showToast(`API Key "${keyName}" generated successfully!`);
    }

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    if (submitModalBtn) {
      submitModalBtn.addEventListener("click", handleCreateKeySubmit);
    }

    if (keyNameInput) {
      keyNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCreateKeySubmit();
        }
      });
    }

    // Check URL query or hash for ?create=true or #create-key
    if (
      window.location.search.includes("create") ||
      window.location.hash.includes("create")
    ) {
      openModal();
    }

    // Initial binding for existing rows
    document.querySelectorAll("#keys-tbody tr").forEach(bindRowActions);

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
      document
        .querySelectorAll(".menu-dropdown")
        .forEach((d) => d.classList.remove("show"));
      document
        .querySelectorAll(".btn-three-dots")
        .forEach((b) => b.classList.remove("active"));
    });
  }

  // =========================================================================
  // 6. Usage Page Module (usage.html)
  // =========================================================================
  function initUsageModule() {
    const isUsage =
      document.getElementById("usage-chart-bars") ||
      document.getElementById("menu-range-selector") ||
      window.location.pathname.includes("usage.html");
    if (!isUsage) return;

    // In-Page Usage Project Selector Dropdown
    const projectBtn = document.getElementById("btn-usage-project-selector");
    const projectMenu = document.getElementById("menu-usage-project-selector");
    const projectName = document.getElementById("selected-usage-project-name");

    if (projectBtn && projectMenu) {
      projectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = projectMenu.classList.contains("show");
        document
          .querySelectorAll(".selector-dropdown-menu")
          .forEach((m) => m.classList.remove("show"));
        if (!isOpen) {
          projectMenu.classList.add("show");
          projectBtn.setAttribute("aria-expanded", "true");
        } else {
          projectBtn.setAttribute("aria-expanded", "false");
        }
      });

      projectMenu.querySelectorAll(".selector-menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const val = item.getAttribute("data-value");
          projectMenu
            .querySelectorAll(".selector-menu-item")
            .forEach((i) => i.classList.remove("selected"));
          item.classList.add("selected");
          if (projectName) {
            projectName.innerHTML = `<span class="project-dot" aria-hidden="true"></span><span>${val}</span>`;
          }
          projectMenu.classList.remove("show");
          projectBtn.setAttribute("aria-expanded", "false");
          showToast(`Filtering metrics for ${val} (Demo)`);
        });
      });
    }

    // Range Selector Dropdown
    const rangeBtn = document.getElementById("btn-range-selector");
    const rangeMenu = document.getElementById("menu-range-selector");
    const rangeName = document.getElementById("selected-range-name");

    if (rangeBtn && rangeMenu) {
      rangeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = rangeMenu.classList.contains("show");
        document
          .querySelectorAll(".selector-dropdown-menu")
          .forEach((m) => m.classList.remove("show"));
        if (!isOpen) {
          rangeMenu.classList.add("show");
          rangeBtn.setAttribute("aria-expanded", "true");
        } else {
          rangeBtn.setAttribute("aria-expanded", "false");
        }
      });

      rangeMenu.querySelectorAll(".selector-menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const val = item.getAttribute("data-value");
          rangeMenu
            .querySelectorAll(".selector-menu-item")
            .forEach((i) => i.classList.remove("selected"));
          item.classList.add("selected");
          if (rangeName) {
            rangeName.innerHTML = `<span>${val}</span>`;
          }
          rangeMenu.classList.remove("show");
          rangeBtn.setAttribute("aria-expanded", "false");
          showToast(`Timeframe updated to ${val} (Demo)`);
        });
      });
    }

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
      document
        .querySelectorAll(".selector-dropdown-menu")
        .forEach((m) => m.classList.remove("show"));
      if (projectBtn) projectBtn.setAttribute("aria-expanded", "false");
      if (rangeBtn) rangeBtn.setAttribute("aria-expanded", "false");
    });

    // Chart Column Click Interaction
    const chartCols = document.querySelectorAll(".chart-col");
    chartCols.forEach((col) => {
      col.addEventListener("click", () => {
        const day = col.getAttribute("data-day");
        const total = col.getAttribute("data-total");
        const hits = col.getAttribute("data-hits");
        showToast(`${day}: ${total} total requests (${hits} hits)`);
      });
    });
  }

  // =========================================================================
  // 7. Settings Page Module (settings.html)
  // =========================================================================
  function initSettingsModule() {
    const isSettings =
      document.getElementById("btn-edit-account") ||
      document.getElementById("account-form") ||
      window.location.pathname.includes("settings.html");
    if (!isSettings) return;

    // Account Fields Interactive Editing Mode
    const editAccountBtn = document.getElementById("btn-edit-account");
    const cancelEditAccountBtn = document.getElementById(
      "btn-cancel-edit-account",
    );
    const iconEditAccount = document.getElementById("icon-edit-account");
    const textEditAccount = document.getElementById("text-edit-account");
    const displayFullName = document.getElementById("display-full-name");
    const inputFullName = document.getElementById("input-full-name");
    const displayEmail = document.getElementById("display-email");
    const inputEmail = document.getElementById("input-email");
    let isEditingAccount = false;

    function enterAccountEditMode() {
      isEditingAccount = true;
      displayFullName.style.display = "none";
      inputFullName.style.display = "block";
      displayEmail.style.display = "none";
      inputEmail.style.display = "block";
      cancelEditAccountBtn.style.display = "inline-flex";
      textEditAccount.textContent = "Save";
      editAccountBtn.classList.add("active-saving");
      iconEditAccount.innerHTML =
        '<polyline points="20 6 9 17 4 12"></polyline>';
      inputFullName.focus();
      inputFullName.select();
    }

    async function saveAccountDetails() {
      const newName = inputFullName.value.trim();
      const newEmail = inputEmail.value.trim();

      if (!newName || !newEmail) {
        showToast("Name and email are required");
        return;
      }

      try {
        const response = await fetch("/dashboard/settings/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newName,
            email: newEmail,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          showToast(data.message || "Profile update failed");
          return;
        }

        exitAccountEditMode();
        showToast("Account details updated successfully");
      } catch (error) {
        console.error("Profile update error:", error);
        showToast("Something went wrong");
      }
    }

    function cancelAccountEdit() {
      inputFullName.value = displayFullName.textContent;
      inputEmail.value = displayEmail.textContent;
      exitAccountEditMode();
      showToast("Account edits cancelled");
    }

    function exitAccountEditMode() {
      isEditingAccount = false;
      displayFullName.style.display = "inline";
      inputFullName.style.display = "none";
      displayEmail.style.display = "inline";
      inputEmail.style.display = "none";
      cancelEditAccountBtn.style.display = "none";
      textEditAccount.textContent = "Edit";
      editAccountBtn.classList.remove("active-saving");
      iconEditAccount.innerHTML =
        '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>';
    }

    if (editAccountBtn) {
      editAccountBtn.addEventListener("click", () => {
        if (!isEditingAccount) {
          enterAccountEditMode();
        } else {
          saveAccountDetails();
        }
      });
    }

    if (cancelEditAccountBtn) {
      cancelEditAccountBtn.addEventListener("click", cancelAccountEdit);
    }

    // Allow pressing Enter to save inside inputs
    [inputFullName, inputEmail].forEach((input) => {
      if (input) {
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            saveAccountDetails();
          } else if (e.key === "Escape") {
            cancelAccountEdit();
          }
        });
      }
    });

    const deleteAccountBtn = document.getElementById("btn-delete-account");
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener("click", () => {
        showToast("Account deletion protection triggered (Demo Mode)");
      });
    }

    const saveSettingsBtn = document.getElementById("btn-save-settings");
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => {
        if (isEditingAccount) {
          saveAccountDetails();
        } else {
          showToast("Preferences and configuration saved (Demo Mode)");
        }
      });
    }

    const cancelSettingsBtn = document.getElementById("btn-cancel-settings");
    if (cancelSettingsBtn) {
      cancelSettingsBtn.addEventListener("click", () => {
        if (isEditingAccount) {
          cancelAccountEdit();
        }
        showToast("Changes discarded");
      });
    }
  }

  // =========================================================================
  // 8. Documentation Page Module (docs.html)
  // =========================================================================
  function initDocsModule() {
    const isDocs =
      document.getElementById("docs-toc-toggle") ||
      document.querySelector(".docs-wrapper") ||
      window.location.pathname.includes("docs.html");
    if (!isDocs) return;

    // Mobile Table of Contents (TOC) Toggle & Menu
    const tocToggleBtn = document.getElementById("docs-toc-toggle");
    const docsMobileTocBar = document.getElementById("docs-mobile-toc-bar");
    const tocCurrentPill = document.getElementById("docs-toc-current-pill");

    function toggleMobileToc() {
      if (!docsMobileTocBar || !tocToggleBtn) return;
      closeSidebar();
      const isOpen = docsMobileTocBar.classList.toggle("open");
      tocToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    function closeMobileToc() {
      if (!docsMobileTocBar || !tocToggleBtn) return;
      docsMobileTocBar.classList.remove("open");
      tocToggleBtn.setAttribute("aria-expanded", "false");
    }

    if (tocToggleBtn) {
      tocToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMobileToc();
      });
    }

    // Close Mobile TOC when clicking outside
    document.addEventListener("click", (e) => {
      if (docsMobileTocBar && docsMobileTocBar.classList.contains("open")) {
        if (!docsMobileTocBar.contains(e.target)) {
          closeMobileToc();
        }
      }
    });

    // Close Mobile TOC and Sidebar on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMobileToc();
        closeSidebar();
      }
    });

    // 3. macOS Code Window Copy Buttons
    const copyBtns = document.querySelectorAll(".macos-copy-btn");
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-copy-id");
        const targetElem = targetId ? document.getElementById(targetId) : null;
        if (!targetElem) return;

        const text = targetElem.innerText.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              const originalHtml = btn.innerHTML;
              btn.innerHTML = `
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span style="color:#10b981">Copied!</span>
                `;
              showToast("Code snippet copied to clipboard");
              setTimeout(() => {
                btn.innerHTML = originalHtml;
              }, 2000);
            })
            .catch(() => {
              showToast("Copied to clipboard");
            });
        } else {
          showToast("Snippet ready to copy");
        }
      });
    });

    // 4. FAQ Accordion Open/Close with Smooth Animation (Closed by default)
    const faqQuestions = document.querySelectorAll(".docs-faq-question");
    faqQuestions.forEach((btn) => {
      btn.addEventListener("click", () => {
        const parentItem = btn.closest(".docs-faq-item");
        if (!parentItem) return;

        const isAlreadyOpen = parentItem.classList.contains("open");

        // Smoothly toggle the clicked FAQ item
        if (isAlreadyOpen) {
          parentItem.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        } else {
          parentItem.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    // 5. In-Content Navigation Scrollspy & Active Link (Desktop & Mobile)
    const allNavLinks = document.querySelectorAll(".docs-nav-link");
    const sections = document.querySelectorAll(
      ".docs-article-flow .docs-section",
    );

    function setActiveNav(sectionId) {
      let activeTitle = "";
      allNavLinks.forEach((link) => {
        if (link.getAttribute("data-section") === sectionId) {
          link.classList.add("active");
          activeTitle = link.textContent.trim();
        } else {
          link.classList.remove("active");
        }
      });
      if (tocCurrentPill && activeTitle) {
        tocCurrentPill.textContent = activeTitle;
      }
    }

    allNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const targetSec = link.getAttribute("data-section");
        if (targetSec) {
          setActiveNav(targetSec);
        }
        closeMobileToc();
      });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveNav(entry.target.id);
            }
          });
        },
        {
          rootMargin: "-15% 0px -70% 0px",
        },
      );

      sections.forEach((sec) => observer.observe(sec));
    }
  }

  // =========================================================================
  // Main Dashboard Initializer
  // =========================================================================
  function initDashboard() {
    const headerToggleBtn = document.getElementById("dash-sidebar-toggle-btn");
    const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
    const mobileToggle = document.getElementById("dash-mobile-toggle");
    const backdrop = document.getElementById("dash-mobile-backdrop");
    const sidebarCloseBtn = document.getElementById("sidebar-close-btn");

    if (headerToggleBtn) {
      headerToggleBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isDesktop()) toggleDesktopSidebar();
        else toggleMobileSidebar();
      });
    }

    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isDesktop()) setDesktopCollapsed(true);
        else closeMobileSidebar();
      });
    }

    if (mobileToggle) {
      mobileToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleMobileSidebar();
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        closeMobileSidebar();
        if (typeof window.closeMobileToc === "function") {
          window.closeMobileToc();
        }
      });
    }

    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
    }

    const navLinks = document.querySelectorAll(".sidebar-nav-link");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (!isDesktop()) closeMobileSidebar();
      });
    });

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        const activeTag = document.activeElement
          ? document.activeElement.tagName.toLowerCase()
          : "";
        if (
          activeTag !== "input" &&
          activeTag !== "textarea" &&
          activeTag !== "select"
        ) {
          e.preventDefault();
          if (isDesktop()) toggleDesktopSidebar();
        }
      }
      if (e.key === "Escape") {
        if (!isDesktop()) closeMobileSidebar();
      }
    });

    window.addEventListener("resize", function () {
      if (isDesktop()) {
        closeMobileSidebar();
        try {
          const persisted = localStorage.getItem(STORAGE_KEY) === "true";
          applyCollapsedClass(persisted);
          updateButtonAria(persisted);
        } catch (e) {}
      } else {
        applyCollapsedClass(false);
      }
    });

    updateButtonAria(isCollapsed());

    // Initialize all page-specific features
    initSharedProjectSelector();
    initOverviewModule();
    initProjectsModule();
    initApiKeysModule();
    initUsageModule();
    initSettingsModule();
    initDocsModule();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboard);
  } else {
    initDashboard();
  }
})();

const activeLink = document.querySelectorAll(".sidebar-nav-link");

activeLink.forEach((Link) => {
  Link.addEventListener("click", () => {
    activeLink.forEach((link) => {
      link.classList.remove("active");
    });
    Link.classList.add("active");
    console.log("Active", Link);
  });
  if (Link.pathname === window.location.pathname) {
    Link.classList.add("active");
  }
});
