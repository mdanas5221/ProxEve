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

    async function handleCreateKeySubmit() {
      if (isKeyGenerated) {
        closeCreateKeyModal();
        return;
      }

      const nameVal = keyNameInput ? keyNameInput.value.trim() : "";

      const projectVal = keyProjectSelect ? keyProjectSelect.value : "";

      const envVal = keyEnvSelect ? keyEnvSelect.value : "";

      if (!nameVal || !projectVal || !envVal) {
        showToast("Please fill all required fields.");
        return;
      }

      try {
        const response = await fetch("/dashboard/api-keys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: nameVal,
            project: projectVal,
            environment: envVal,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create API key");
        }

        currentGeneratedKey = data.apiKey.key;

        if (generatedKeyInput) {
          generatedKeyInput.value = currentGeneratedKey;
        }

        if (generatedKeyGroup) {
          generatedKeyGroup.style.display = "flex";
        }

        if (keyNameInput) keyNameInput.disabled = true;
        if (keyProjectSelect) keyProjectSelect.disabled = true;
        if (keyEnvSelect) keyEnvSelect.disabled = true;

        if (submitModalBtn) {
          submitModalBtn.textContent = "Done";
          submitModalBtn.classList.add("is-done");
        }

        if (cancelModalBtn) {
          cancelModalBtn.textContent = "Close";
        }

        isKeyGenerated = true;

        showToast(`API Key "${nameVal}" generated successfully!`);
      } catch (error) {
        console.error("API key creation error:", error);

        showToast(error.message || "Failed to create API key");
      }
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
        window.location.href = "/dashboard/api-keys";
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
  // 5. Projects Page Module (projects.ejs)
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
    const closeModalBtn = document.getElementById("btn-close-project-modal");
    const cancelModalBtn = document.getElementById("btn-cancel-project-modal");
    const submitModalBtn = document.getElementById("btn-submit-project-modal");
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

    async function handleCreateProject() {
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

      submitModalBtn.disabled = true;

      try {
        const response = await fetch("/dashboard/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: nameVal,
            description: descVal,
            aiProvider: providerVal,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Project creation failed");
        }

        const createdProject = data.project;

        // Add project card after successful database creation
        const projectsGrid = document.querySelector("#projects-grid");

        if (projectsGrid) {
          const newCard = document.createElement("article");

          newCard.className = "project-card";

          const providerClass = createdProject.aiProvider.toLowerCase();

          newCard.innerHTML = `
    <div class="project-card-top">
      <div class="project-card-header">
        <div class="project-title-group">
          <h2 class="project-name">
            ${createdProject.name}
          </h2>

          <span class="status-pill active">
            <span class="status-dot"></span>
            <span>Active</span>
          </span>
        </div>
      </div>

      <p class="project-description">
        ${createdProject.description}
      </p>

      <div class="provider-tag-row">
        <span class="provider-tag">
          <span class="provider-dot ${providerClass}"></span>
          <span>${createdProject.aiProvider}</span>
        </span>
      </div>
    </div>

    <div class="project-card-bottom">
      <div class="project-metrics-grid">
        <div class="project-metric-item">
          <span class="project-metric-label">Requests</span>
          <span class="project-metric-val">0</span>
        </div>

        <div class="project-metric-item">
          <span class="project-metric-label">Cache Hit Rate</span>
          <span class="project-metric-val">0%</span>
        </div>
      </div>

      <div class="project-activity-row">
        <span>Last Activity: Just now</span>
      </div>

      <div class="project-card-footer">
        <button
          type="button"
          class="btn-view-project"
          data-project="${createdProject.name}"
        >
          <span>View project</span>
        </button>
      </div>
    </div>
  `;

          // New card ko sabse upar add karo
          projectsGrid.prepend(newCard);
        }

        setActiveProject(createdProject.name);

        closeModal();

        showToast(`Project "${createdProject.name}" created successfully!`);
      } catch (error) {
        console.log("Project creation error:", error);

        showToast(error.message || "Something went wrong");
      } finally {
        submitModalBtn.disabled = false;
      }
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
  // 6. API Keys Page Module (api-keys.ejs)
  // =========================================================================
  function initApiKeysModule() {
    const isApiKeys =
      document.getElementById("keys-tbody") ||
      (document.getElementById("btn-open-create-key") &&
        !document.getElementById("api-key-display")) ||
      window.location.pathname.includes("dashboard/api-keys");
    if (!isApiKeys) return;
  }

  // =========================================================================
  // 7. Usage Page Module (usage.html)
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
  // 8. Settings Page Module (settings.html)
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
  // 9. Documentation Page Module (docs.html)
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
