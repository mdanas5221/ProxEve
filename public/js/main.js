document.addEventListener("DOMContentLoaded", () => {
  // 1. Copy Code Snippet Handler (Supports all code windows)
  const copyButtons = document.querySelectorAll(
    ".copy-btn-generic, #copy-code-btn",
  );
  const toastNotice = document.getElementById("toast-notice");

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId =
        btn.getAttribute("data-copy-target") || "code-snippet-text";
      const codeSnippet = document.getElementById(targetId);
      if (!codeSnippet) return;

      const codeToCopy = codeSnippet.innerText.trim();
      try {
        await navigator.clipboard.writeText(codeToCopy);
        const originalText = btn.innerHTML;

        btn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Copied!</span>
        `;
        btn.style.borderColor = "#10b981";
        btn.style.color = "#10b981";

        showToast("Code copied to clipboard");

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.borderColor = "";
          btn.style.color = "";
        }, 2000);
      } catch (err) {
        // Fallback for environments where clipboard API is blocked
        showToast("Snippet ready to use");
      }
    });
  });

  // 2. Mobile Navigation Menu Toggle & Smooth Drawer
  const mobileNavToggle = document.getElementById("mobile-nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navBackdrop = document.getElementById("mobile-nav-backdrop");

  const closeMobileNav = () => {
    if (!navMenu) return;
    navMenu.classList.remove("mobile-open");
    if (mobileNavToggle) {
      mobileNavToggle.classList.remove("is-active");
      mobileNavToggle.setAttribute("aria-expanded", "false");
    }
    if (navBackdrop) {
      navBackdrop.classList.remove("visible");
    }
    document.body.classList.remove("mobile-nav-locked");
  };

  const openMobileNav = () => {
    if (!navMenu) return;
    navMenu.classList.add("mobile-open");
    if (mobileNavToggle) {
      mobileNavToggle.classList.add("is-active");
      mobileNavToggle.setAttribute("aria-expanded", "true");
    }
    if (navBackdrop) {
      navBackdrop.classList.add("visible");
    }
    document.body.classList.add("mobile-nav-locked");
  };

  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains("mobile-open");
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", () => {
        closeMobileNav();
      });
    }

    // Close menu when clicking nav links
    const navLinks = navMenu.querySelectorAll(".nav-link, .nav-mobile-btn");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileNav();
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("mobile-open")) {
        closeMobileNav();
      }
    });
  }

  // 2b. Fixed Header Scroll Shadow / Elevation
  const siteHeader = document.getElementById("site-header");
  if (siteHeader) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 10) {
        siteHeader.classList.add("header-scrolled");
      } else {
        siteHeader.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // 3. Contact Form Submission (Basic client-side validation & toast feedback)
  const contactForm = document.getElementById("contact-form");
  const topicChips = document.querySelectorAll(".topic-chip");
  const subjectInput = document.getElementById("contact-subject");

  if (topicChips.length && subjectInput) {
    topicChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        topicChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        subjectInput.value = chip.getAttribute("data-topic") || "";
        subjectInput.focus();
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name")?.value.trim();
      const email = document.getElementById("contact-email")?.value.trim();
      const subject = document.getElementById("contact-subject")?.value.trim();
      const message = document.getElementById("contact-message")?.value.trim();

      if (!name || !email || !subject || !message) {
        showToast("Please fill in all required fields");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address");
        return;
      }

      showToast("Thank you! Your message has been sent.");
      contactForm.reset();
      topicChips.forEach((c) => c.classList.remove("active"));
    });
  }

  // 4. Shared Password Visibility Toggle (Reusable for Login, Signup, Settings, etc.)
  function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll(".auth-password-toggle");

    toggleButtons.forEach((btn) => {
      // Avoid duplicate listener bindings if called multiple times
      if (btn.dataset.toggleInitialized) return;
      btn.dataset.toggleInitialized = "true";

      btn.addEventListener("click", (e) => {
        e.preventDefault();

        // Find the associated password input within the same input container
        const container =
          btn.closest(".auth-input-container") || btn.parentElement;
        const passwordInput = container
          ? container.querySelector("input")
          : null;

        if (!passwordInput) return;

        const isCurrentlyPassword = passwordInput.type === "password";
        passwordInput.type = isCurrentlyPassword ? "text" : "password";

        // Toggle eye and eye-off icon states
        const eyeIcon = btn.querySelector(".icon-eye");
        const eyeOffIcon = btn.querySelector(".icon-eye-off");

        if (eyeIcon) {
          eyeIcon.style.display = isCurrentlyPassword ? "none" : "block";
        }
        if (eyeOffIcon) {
          eyeOffIcon.style.display = isCurrentlyPassword ? "block" : "none";
        }

        btn.setAttribute(
          "aria-label",
          isCurrentlyPassword ? "Hide password" : "Show password",
        );
      });
    });
  }

  initPasswordToggles();

  // Toast Notification Helper
  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.querySelector(".toast-text").textContent = message;
    toastNotice.classList.add("visible");
    setTimeout(() => {
      toastNotice.classList.remove("visible");
    }, 2400);
  }
});
