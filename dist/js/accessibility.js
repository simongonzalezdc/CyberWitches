class ScreenReaderAnnouncer {
  constructor() {
    this.announcer = null;
    this.announcementQueue = [];
    this.isAnnouncing = false;
    this.init();
  }
  init() {
    this.announcer = document.createElement("div");
    this.announcer.setAttribute("aria-live", "polite");
    this.announcer.setAttribute("aria-atomic", "true");
    this.announcer.setAttribute("class", "sr-only");
    this.announcer.style.position = "absolute";
    this.announcer.style.left = "-10000px";
    this.announcer.style.width = "1px";
    this.announcer.style.height = "1px";
    this.announcer.style.overflow = "hidden";
    document.body.appendChild(this.announcer);
  }
  announce(message, priority = "normal") {
    if (!this.announcer) return;
    this.announcementQueue.push({ message, priority });
    if (!this.isAnnouncing) {
      this.processQueue();
    }
  }
  processQueue() {
    if (this.announcementQueue.length === 0) {
      this.isAnnouncing = false;
      return;
    }
    this.isAnnouncing = true;
    this.announcementQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    const { message } = this.announcementQueue.shift();
    this.announcer.textContent = "";
    setTimeout(() => {
      this.announcer.textContent = message;
      setTimeout(() => {
        this.processQueue();
      }, 100);
    }, 50);
  }
  announceResourceGain(resource, amount) {
    this.announce(`Gained ${amount} ${resource}`, "normal");
  }
  announceAchievement(achievementName) {
    this.announce(`Achievement unlocked: ${achievementName}`, "high");
  }
  announceLevelUp(level) {
    this.announce(`Level up! You are now level ${level}`, "high");
  }
  announceTabChange(tabName) {
    this.announce(`Switched to ${tabName} tab`, "normal");
  }
  announceError(errorMessage) {
    this.announce(`Error: ${errorMessage}`, "high");
  }
}
class KeyboardNavigationManager {
  constructor() {
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.trapElement = null;
    this.previousFocus = null;
    this.init();
  }
  init() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("focusin", this.handleFocusIn.bind(this));
  }
  handleKeyDown(e) {
    switch (e.key) {
      case "Tab":
        this.handleTabNavigation(e);
        break;
      case "Escape":
        this.handleEscape(e);
        break;
      case "Enter":
      case " ":
        this.handleActivation(e);
        break;
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        this.handleArrowNavigation(e);
        break;
      case "Home":
      case "End":
        this.handleHomeEnd(e);
        break;
    }
  }
  handleTabNavigation(e) {
    setTimeout(() => {
      this.updateFocusIndicator();
    }, 0);
  }
  handleEscape(e) {
    if (this.trapElement) {
      this.releaseFocusTrap();
      e.preventDefault();
    } else {
      const modals = document.querySelectorAll(".modal.active");
      if (modals.length > 0) {
        modals[0].classList.remove("active");
        e.preventDefault();
      }
    }
  }
  handleActivation(e) {
    const target = e.target;
    if (e.key === " " && target.tagName === "BUTTON") {
      e.preventDefault();
      target.click();
    }
    if (target.classList.contains("card") || target.classList.contains("tab-button")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        target.click();
      }
    }
  }
  handleArrowNavigation(e) {
    const target = e.target;
    if (target.classList.contains("tab-button")) {
      e.preventDefault();
      this.navigateTabs(e.key);
    }
    if (target.closest(".scroll-container")) {
      e.preventDefault();
      this.navigateCards(e.key, target.closest(".scroll-container"));
    }
  }
  handleHomeEnd(e) {
    const target = e.target;
    if (target.classList.contains("tab-button")) {
      e.preventDefault();
      const tabs = Array.from(document.querySelectorAll(".tab-button"));
      const targetTab = e.key === "Home" ? tabs[0] : tabs[tabs.length - 1];
      if (targetTab) {
        targetTab.focus();
      }
    }
  }
  handleFocusIn(e) {
    this.updateFocusIndicator();
    const target = e.target;
    if (target.classList.contains("tab-button")) {
      screenReaderAnnouncer.announceTabChange(target.textContent.trim());
    }
  }
  navigateTabs(direction) {
    const tabs = Array.from(document.querySelectorAll(".tab-button"));
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    let nextIndex;
    if (direction === "ArrowLeft" || direction === "ArrowUp") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    } else {
      nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    }
    if (tabs[nextIndex]) {
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    }
  }
  navigateCards(direction, container) {
    const cards = Array.from(container.querySelectorAll(".card, .primary-button, .secondary-button"));
    const currentIndex = cards.findIndex((card) => card.contains(document.activeElement));
    let nextIndex;
    if (direction === "ArrowUp" || direction === "ArrowLeft") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
    } else {
      nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
    }
    if (cards[nextIndex]) {
      cards[nextIndex].focus();
    }
  }
  createFocusTrap(element) {
    this.trapElement = element;
    this.previousFocus = document.activeElement;
    this.focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }
  releaseFocusTrap() {
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
    this.trapElement = null;
    this.focusableElements = [];
    this.previousFocus = null;
  }
  updateFocusIndicator() {
    document.querySelectorAll(".keyboard-focus-indicator").forEach((el) => {
      el.classList.remove("keyboard-focus-indicator");
    });
    if (document.activeElement) {
      document.activeElement.classList.add("keyboard-focus-indicator");
    }
  }
}
class HighContrastManager {
  constructor() {
    this.isHighContrast = false;
    this.init();
  }
  init() {
    if (window.matchMedia && window.matchMedia("(prefers-contrast: high)").matches) {
      this.enableHighContrast();
    }
    if (window.matchMedia) {
      window.matchMedia("(prefers-contrast: high)").addEventListener("change", (e) => {
        if (e.matches) {
          this.enableHighContrast();
        } else {
          this.disableHighContrast();
        }
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.key === "h") {
        e.preventDefault();
        this.toggleHighContrast();
      }
    });
  }
  enableHighContrast() {
    this.isHighContrast = true;
    document.body.classList.add("high-contrast-mode");
    document.documentElement.style.setProperty("--primary", "#FFFFFF");
    document.documentElement.style.setProperty("--secondary", "#FFFF00");
    document.documentElement.style.setProperty("--accent", "#00FF00");
    document.documentElement.style.setProperty("--success", "#00FFFF");
    document.documentElement.style.setProperty("--mystical", "#FF00FF");
    document.documentElement.style.setProperty("--bg-dark", "#000000");
    document.documentElement.style.setProperty("--text", "#FFFFFF");
    document.documentElement.style.setProperty("--text-dim", "#CCCCCC");
    screenReaderAnnouncer.announce("High contrast mode enabled", "normal");
  }
  disableHighContrast() {
    this.isHighContrast = false;
    document.body.classList.remove("high-contrast-mode");
    document.documentElement.style.setProperty("--primary", "#FF2DAA");
    document.documentElement.style.setProperty("--secondary", "#22E3FF");
    document.documentElement.style.setProperty("--accent", "#FFDB6E");
    document.documentElement.style.setProperty("--success", "#3CE3C5");
    document.documentElement.style.setProperty("--mystical", "#C9A0FF");
    document.documentElement.style.setProperty("--bg-dark", "#0E0E12");
    document.documentElement.style.setProperty("--text", "#FFFFFF");
    document.documentElement.style.setProperty("--text-dim", "#AAAAAA");
    screenReaderAnnouncer.announce("High contrast mode disabled", "normal");
  }
  toggleHighContrast() {
    if (this.isHighContrast) {
      this.disableHighContrast();
    } else {
      this.enableHighContrast();
    }
  }
}
class TextScalingManager {
  constructor() {
    this.currentScale = 1;
    this.minScale = 0.8;
    this.maxScale = 2;
    this.init();
  }
  init() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("reduced-motion");
    }
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "=":
          case "+":
            e.preventDefault();
            this.increaseTextScale();
            break;
          case "-":
          case "_":
            e.preventDefault();
            this.decreaseTextScale();
            break;
          case "0":
            e.preventDefault();
            this.resetTextScale();
            break;
        }
      }
    });
  }
  increaseTextScale() {
    if (this.currentScale < this.maxScale) {
      this.currentScale = Math.min(this.currentScale + 0.1, this.maxScale);
      this.applyTextScale();
      screenReaderAnnouncer.announce(`Text size increased to ${Math.round(this.currentScale * 100)}%`, "normal");
    }
  }
  decreaseTextScale() {
    if (this.currentScale > this.minScale) {
      this.currentScale = Math.max(this.currentScale - 0.1, this.minScale);
      this.applyTextScale();
      screenReaderAnnouncer.announce(`Text size decreased to ${Math.round(this.currentScale * 100)}%`, "normal");
    }
  }
  resetTextScale() {
    this.currentScale = 1;
    this.applyTextScale();
    screenReaderAnnouncer.announce("Text size reset to 100%", "normal");
  }
  applyTextScale() {
    document.documentElement.style.fontSize = `${this.currentScale}rem`;
    const rootFontSize = 16 * this.currentScale;
    document.documentElement.style.setProperty("--root-font-size", `${rootFontSize}px`);
  }
}
class ColorBlindThemeManager {
  constructor() {
    this.currentTheme = "default";
    this.themes = {
      default: {
        primary: "#FF2DAA",
        secondary: "#22E3FF",
        accent: "#FFDB6E",
        success: "#3CE3C5",
        mystical: "#C9A0FF"
      },
      protanopia: {
        primary: "#0066CC",
        secondary: "#FF9900",
        accent: "#FFFF00",
        success: "#00CC66",
        mystical: "#9933CC"
      },
      deuteranopia: {
        primary: "#0066CC",
        secondary: "#FF9900",
        accent: "#FFFF00",
        success: "#00CC66",
        mystical: "#9933CC"
      },
      tritanopia: {
        primary: "#CC0066",
        secondary: "#00CCFF",
        accent: "#FFFF00",
        success: "#00CC66",
        mystical: "#CC00CC"
      }
    };
    this.init();
  }
  init() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            this.setTheme("default");
            break;
          case "2":
            e.preventDefault();
            this.setTheme("protanopia");
            break;
          case "3":
            e.preventDefault();
            this.setTheme("deuteranopia");
            break;
          case "4":
            e.preventDefault();
            this.setTheme("tritanopia");
            break;
        }
      }
    });
  }
  setTheme(themeName) {
    if (!this.themes[themeName]) return;
    this.currentTheme = themeName;
    const theme = this.themes[themeName];
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    document.body.className = document.body.className.replace(/color-blind-\w+/g, "");
    if (themeName !== "default") {
      document.body.classList.add(`color-blind-${themeName}`);
    }
    screenReaderAnnouncer.announce(`Color blind theme changed to ${themeName}`, "normal");
  }
}
const screenReaderAnnouncer = new ScreenReaderAnnouncer();
const keyboardNavigation = new KeyboardNavigationManager();
const highContrastManager = new HighContrastManager();
const textScalingManager = new TextScalingManager();
const colorBlindThemeManager = new ColorBlindThemeManager();
function announceGameEvent(eventType, data) {
  switch (eventType) {
    case "cast":
      screenReaderAnnouncer.announceResourceGain("Arcane Bits", data.amount || 1);
      break;
    case "workstation_crafted":
      screenReaderAnnouncer.announce(`Crafted ${data.name} workstation`, "normal");
      break;
    case "upgrade_purchased":
      screenReaderAnnouncer.announce(`Purchased ${data.name} upgrade`, "normal");
      break;
    case "achievement_unlocked":
      screenReaderAnnouncer.announceAchievement(data.name);
      break;
    case "level_up":
      screenReaderAnnouncer.announceLevelUp(data.level);
      break;
    case "error":
      screenReaderAnnouncer.announceError(data.message);
      break;
  }
}
function addAriaLabels() {
  const abDisplay = document.getElementById("ab-display");
  if (abDisplay) {
    abDisplay.setAttribute("aria-label", "Arcane Bits balance");
    abDisplay.setAttribute("role", "status");
  }
  const abpsDisplay = document.getElementById("abps-display");
  if (abpsDisplay) {
    abpsDisplay.setAttribute("aria-label", "Arcane Bits per second production rate");
    abpsDisplay.setAttribute("role", "status");
  }
  document.querySelectorAll(".progress-bar").forEach((bar) => {
    const fill = bar.querySelector(".progress-fill");
    if (fill) {
      const percentage = Math.round(parseFloat(fill.style.width) || 0);
      bar.setAttribute("aria-label", `Progress: ${percentage}%`);
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuenow", percentage);
      bar.setAttribute("aria-valuemin", 0);
      bar.setAttribute("aria-valuemax", 100);
    }
  });
  document.querySelectorAll(".card").forEach((card) => {
    const title = card.querySelector(".card-title");
    if (title) {
      card.setAttribute("aria-label", title.textContent.trim());
    }
  });
}
function initSkipLinks() {
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(skipLink.getAttribute("href"));
      if (target) {
        target.focus();
        target.scrollIntoView();
        screenReaderAnnouncer.announce("Skipped to main content", "normal");
      }
    });
    skipLink.addEventListener("focus", () => {
      skipLink.style.opacity = "1";
      skipLink.style.transform = "translateY(0)";
    });
    skipLink.addEventListener("blur", () => {
      skipLink.style.opacity = "0";
      skipLink.style.transform = "translateY(-100%)";
    });
  }
}
window.Accessibility = {
  announceGameEvent,
  addAriaLabels,
  initSkipLinks,
  screenReaderAnnouncer,
  keyboardNavigation,
  highContrastManager,
  textScalingManager,
  colorBlindThemeManager
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    addAriaLabels();
    initSkipLinks();
  });
} else {
  addAriaLabels();
  initSkipLinks();
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvYWNjZXNzaWJpbGl0eS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBBY2Nlc3NpYmlsaXR5IE1vZHVsZSBmb3IgQ3liZXIgV2l0Y2hlc1xuICogSGFuZGxlcyBzY3JlZW4gcmVhZGVyIGFubm91bmNlbWVudHMsIGtleWJvYXJkIG5hdmlnYXRpb24sIGFuZCBhY2Nlc3NpYmlsaXR5IGZlYXR1cmVzXG4gKi9cblxuLy8gU2NyZWVuIHJlYWRlciBhbm5vdW5jZW1lbnQgc3lzdGVtXG5jbGFzcyBTY3JlZW5SZWFkZXJBbm5vdW5jZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmFubm91bmNlciA9IG51bGw7XG4gICAgICAgIHRoaXMuYW5ub3VuY2VtZW50UXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5pc0Fubm91bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICAgIFxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIENyZWF0ZSBoaWRkZW4gYW5ub3VuY2VyIGVsZW1lbnRcbiAgICAgICAgdGhpcy5hbm5vdW5jZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5hbm5vdW5jZXIuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgICAgIHRoaXMuYW5ub3VuY2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1hdG9taWMnLCAndHJ1ZScpO1xuICAgICAgICB0aGlzLmFubm91bmNlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3NyLW9ubHknKTtcbiAgICAgICAgdGhpcy5hbm5vdW5jZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICB0aGlzLmFubm91bmNlci5zdHlsZS5sZWZ0ID0gJy0xMDAwMHB4JztcbiAgICAgICAgdGhpcy5hbm5vdW5jZXIuc3R5bGUud2lkdGggPSAnMXB4JztcbiAgICAgICAgdGhpcy5hbm5vdW5jZXIuc3R5bGUuaGVpZ2h0ID0gJzFweCc7XG4gICAgICAgIHRoaXMuYW5ub3VuY2VyLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5hbm5vdW5jZXIpO1xuICAgIH1cbiAgICBcbiAgICBhbm5vdW5jZShtZXNzYWdlLCBwcmlvcml0eSA9ICdub3JtYWwnKSB7XG4gICAgICAgIGlmICghdGhpcy5hbm5vdW5jZXIpIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYW5ub3VuY2VtZW50UXVldWUucHVzaCh7IG1lc3NhZ2UsIHByaW9yaXR5IH0pO1xuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLmlzQW5ub3VuY2luZykge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcm9jZXNzUXVldWUoKSB7XG4gICAgICAgIGlmICh0aGlzLmFubm91bmNlbWVudFF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pc0Fubm91bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5pc0Fubm91bmNpbmcgPSB0cnVlO1xuICAgICAgICBcbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoaGlnaCA+IG5vcm1hbCA+IGxvdylcbiAgICAgICAgdGhpcy5hbm5vdW5jZW1lbnRRdWV1ZS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcmlvcml0eU9yZGVyID0geyBoaWdoOiAzLCBub3JtYWw6IDIsIGxvdzogMSB9O1xuICAgICAgICAgICAgcmV0dXJuIHByaW9yaXR5T3JkZXJbYi5wcmlvcml0eV0gLSBwcmlvcml0eU9yZGVyW2EucHJpb3JpdHldO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gdGhpcy5hbm5vdW5jZW1lbnRRdWV1ZS5zaGlmdCgpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYXIgY3VycmVudCBjb250ZW50XG4gICAgICAgIHRoaXMuYW5ub3VuY2VyLnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgbmV3IG1lc3NhZ2Ugd2l0aCBzbGlnaHQgZGVsYXkgZm9yIHNjcmVlbiByZWFkZXJzIHRvIGRldGVjdCBjaGFuZ2VcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFubm91bmNlci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgbmV4dCBhbm5vdW5jZW1lbnQgYWZ0ZXIgdGhpcyBvbmUgaXMgcmVhZFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUXVldWUoKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH0sIDUwKTtcbiAgICB9XG4gICAgXG4gICAgYW5ub3VuY2VSZXNvdXJjZUdhaW4ocmVzb3VyY2UsIGFtb3VudCkge1xuICAgICAgICB0aGlzLmFubm91bmNlKGBHYWluZWQgJHthbW91bnR9ICR7cmVzb3VyY2V9YCwgJ25vcm1hbCcpO1xuICAgIH1cbiAgICBcbiAgICBhbm5vdW5jZUFjaGlldmVtZW50KGFjaGlldmVtZW50TmFtZSkge1xuICAgICAgICB0aGlzLmFubm91bmNlKGBBY2hpZXZlbWVudCB1bmxvY2tlZDogJHthY2hpZXZlbWVudE5hbWV9YCwgJ2hpZ2gnKTtcbiAgICB9XG4gICAgXG4gICAgYW5ub3VuY2VMZXZlbFVwKGxldmVsKSB7XG4gICAgICAgIHRoaXMuYW5ub3VuY2UoYExldmVsIHVwISBZb3UgYXJlIG5vdyBsZXZlbCAke2xldmVsfWAsICdoaWdoJyk7XG4gICAgfVxuICAgIFxuICAgIGFubm91bmNlVGFiQ2hhbmdlKHRhYk5hbWUpIHtcbiAgICAgICAgdGhpcy5hbm5vdW5jZShgU3dpdGNoZWQgdG8gJHt0YWJOYW1lfSB0YWJgLCAnbm9ybWFsJyk7XG4gICAgfVxuICAgIFxuICAgIGFubm91bmNlRXJyb3IoZXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuYW5ub3VuY2UoYEVycm9yOiAke2Vycm9yTWVzc2FnZX1gLCAnaGlnaCcpO1xuICAgIH1cbn1cblxuLy8gS2V5Ym9hcmQgbmF2aWdhdGlvbiBtYW5hZ2VyXG5jbGFzcyBLZXlib2FyZE5hdmlnYXRpb25NYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5mb2N1c2FibGVFbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmN1cnJlbnRGb2N1c0luZGV4ID0gLTE7XG4gICAgICAgIHRoaXMudHJhcEVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMgPSBudWxsO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gICAgXG4gICAgaW5pdCgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIHRoaXMuaGFuZGxlRm9jdXNJbi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgXG4gICAgaGFuZGxlS2V5RG93bihlKSB7XG4gICAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ1RhYic6XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVUYWJOYXZpZ2F0aW9uKGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUVzY2FwZShlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aXZhdGlvbihlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFycm93TmF2aWdhdGlvbihlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0hvbWUnOlxuICAgICAgICAgICAgY2FzZSAnRW5kJzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUhvbWVFbmQoZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaGFuZGxlVGFiTmF2aWdhdGlvbihlKSB7XG4gICAgICAgIC8vIExldCBicm93c2VyIGhhbmRsZSB0YWIgbmF2aWdhdGlvbiBieSBkZWZhdWx0XG4gICAgICAgIC8vIEJ1dCB3ZSBhZGQgY3VzdG9tIGJlaGF2aW9yIGZvciBzcGVjaWZpYyBzY2VuYXJpb3NcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZvY3VzSW5kaWNhdG9yKCk7XG4gICAgICAgIH0sIDApO1xuICAgIH1cbiAgICBcbiAgICBoYW5kbGVFc2NhcGUoZSkge1xuICAgICAgICAvLyBDbG9zZSBtb2RhbHMgb3IgZXhpdCBmb2N1cyB0cmFwc1xuICAgICAgICBpZiAodGhpcy50cmFwRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5yZWxlYXNlRm9jdXNUcmFwKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gY2xvc2UgYW55IG9wZW4gbW9kYWxzXG4gICAgICAgICAgICBjb25zdCBtb2RhbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubW9kYWwuYWN0aXZlJyk7XG4gICAgICAgICAgICBpZiAobW9kYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBtb2RhbHNbMF0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGhhbmRsZUFjdGl2YXRpb24oZSkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgXG4gICAgICAgIC8vIEhhbmRsZSBzcGFjZSBrZXkgb24gYnV0dG9ucyB0aGF0IGRvbid0IG5vcm1hbGx5IHN1cHBvcnQgaXRcbiAgICAgICAgaWYgKGUua2V5ID09PSAnICcgJiYgdGFyZ2V0LnRhZ05hbWUgPT09ICdCVVRUT04nKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0YXJnZXQuY2xpY2soKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSGFuZGxlIGFjdGl2YXRpb24gb24gY3VzdG9tIGludGVyYWN0aXZlIGVsZW1lbnRzXG4gICAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdjYXJkJykgfHwgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygndGFiLWJ1dHRvbicpKSB7XG4gICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgfHwgZS5rZXkgPT09ICcgJykge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0YXJnZXQuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBoYW5kbGVBcnJvd05hdmlnYXRpb24oZSkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgXG4gICAgICAgIC8vIEFycm93IG5hdmlnYXRpb24gZm9yIHRhYnNcbiAgICAgICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3RhYi1idXR0b24nKSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZVRhYnMoZS5rZXkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBBcnJvdyBuYXZpZ2F0aW9uIGZvciBjYXJkIGxpc3RzXG4gICAgICAgIGlmICh0YXJnZXQuY2xvc2VzdCgnLnNjcm9sbC1jb250YWluZXInKSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZUNhcmRzKGUua2V5LCB0YXJnZXQuY2xvc2VzdCgnLnNjcm9sbC1jb250YWluZXInKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaGFuZGxlSG9tZUVuZChlKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBcbiAgICAgICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3RhYi1idXR0b24nKSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgdGFicyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhYi1idXR0b24nKSk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUYWIgPSBlLmtleSA9PT0gJ0hvbWUnID8gdGFic1swXSA6IHRhYnNbdGFicy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICh0YXJnZXRUYWIpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRUYWIuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBoYW5kbGVGb2N1c0luKGUpIHtcbiAgICAgICAgdGhpcy51cGRhdGVGb2N1c0luZGljYXRvcigpO1xuICAgICAgICBcbiAgICAgICAgLy8gQW5ub3VuY2UgZm9jdXMgY2hhbmdlcyBmb3Igc2NyZWVuIHJlYWRlcnNcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCd0YWItYnV0dG9uJykpIHtcbiAgICAgICAgICAgIHNjcmVlblJlYWRlckFubm91bmNlci5hbm5vdW5jZVRhYkNoYW5nZSh0YXJnZXQudGV4dENvbnRlbnQudHJpbSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBuYXZpZ2F0ZVRhYnMoZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRhYnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50YWItYnV0dG9uJykpO1xuICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSB0YWJzLmZpbmRJbmRleCh0YWIgPT4gdGFiID09PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICAgICAgXG4gICAgICAgIGxldCBuZXh0SW5kZXg7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdBcnJvd0xlZnQnIHx8IGRpcmVjdGlvbiA9PT0gJ0Fycm93VXAnKSB7XG4gICAgICAgICAgICBuZXh0SW5kZXggPSBjdXJyZW50SW5kZXggPiAwID8gY3VycmVudEluZGV4IC0gMSA6IHRhYnMubGVuZ3RoIC0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHRJbmRleCA9IGN1cnJlbnRJbmRleCA8IHRhYnMubGVuZ3RoIC0gMSA/IGN1cnJlbnRJbmRleCArIDEgOiAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGFic1tuZXh0SW5kZXhdKSB7XG4gICAgICAgICAgICB0YWJzW25leHRJbmRleF0uZm9jdXMoKTtcbiAgICAgICAgICAgIHRhYnNbbmV4dEluZGV4XS5jbGljaygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIG5hdmlnYXRlQ2FyZHMoZGlyZWN0aW9uLCBjb250YWluZXIpIHtcbiAgICAgICAgY29uc3QgY2FyZHMgPSBBcnJheS5mcm9tKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuY2FyZCwgLnByaW1hcnktYnV0dG9uLCAuc2Vjb25kYXJ5LWJ1dHRvbicpKTtcbiAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gY2FyZHMuZmluZEluZGV4KGNhcmQgPT4gY2FyZC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgbmV4dEluZGV4O1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnQXJyb3dVcCcgfHwgZGlyZWN0aW9uID09PSAnQXJyb3dMZWZ0Jykge1xuICAgICAgICAgICAgbmV4dEluZGV4ID0gY3VycmVudEluZGV4ID4gMCA/IGN1cnJlbnRJbmRleCAtIDEgOiBjYXJkcy5sZW5ndGggLSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dEluZGV4ID0gY3VycmVudEluZGV4IDwgY2FyZHMubGVuZ3RoIC0gMSA/IGN1cnJlbnRJbmRleCArIDEgOiAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoY2FyZHNbbmV4dEluZGV4XSkge1xuICAgICAgICAgICAgY2FyZHNbbmV4dEluZGV4XS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNyZWF0ZUZvY3VzVHJhcChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMudHJhcEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIHRoZSB0cmFwXG4gICAgICAgIHRoaXMuZm9jdXNhYmxlRWxlbWVudHMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnYnV0dG9uLCBbaHJlZl0sIGlucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICAvLyBGb2N1cyBmaXJzdCBlbGVtZW50XG4gICAgICAgIGlmICh0aGlzLmZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNhYmxlRWxlbWVudHNbMF0uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZWxlYXNlRm9jdXNUcmFwKCkge1xuICAgICAgICBpZiAodGhpcy5wcmV2aW91c0ZvY3VzKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzRm9jdXMuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy50cmFwRWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuZm9jdXNhYmxlRWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5wcmV2aW91c0ZvY3VzID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgdXBkYXRlRm9jdXNJbmRpY2F0b3IoKSB7XG4gICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBmb2N1cyBpbmRpY2F0b3JzXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5rZXlib2FyZC1mb2N1cy1pbmRpY2F0b3InKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2tleWJvYXJkLWZvY3VzLWluZGljYXRvcicpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBmb2N1cyBpbmRpY2F0b3IgdG8gY3VycmVudCBlbGVtZW50XG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2tleWJvYXJkLWZvY3VzLWluZGljYXRvcicpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBIaWdoIGNvbnRyYXN0IG1vZGUgbWFuYWdlclxuY2xhc3MgSGlnaENvbnRyYXN0TWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaXNIaWdoQ29udHJhc3QgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICAgIFxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIENoZWNrIGZvciBoaWdoIGNvbnRyYXN0IHByZWZlcmVuY2VcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhICYmIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb250cmFzdDogaGlnaCknKS5tYXRjaGVzKSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZUhpZ2hDb250cmFzdCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXNcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKSB7XG4gICAgICAgICAgICB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtY29udHJhc3Q6IGhpZ2gpJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5tYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlSGlnaENvbnRyYXN0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlSGlnaENvbnRyYXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBrZXlib2FyZCBzaG9ydGN1dCBmb3IgaGlnaCBjb250cmFzdCB0b2dnbGVcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5jdHJsS2V5ICYmIGUuYWx0S2V5ICYmIGUua2V5ID09PSAnaCcpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVIaWdoQ29udHJhc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGVuYWJsZUhpZ2hDb250cmFzdCgpIHtcbiAgICAgICAgdGhpcy5pc0hpZ2hDb250cmFzdCA9IHRydWU7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnaGlnaC1jb250cmFzdC1tb2RlJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgQ1NTIHZhcmlhYmxlcyBmb3IgaGlnaCBjb250cmFzdFxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJy0tcHJpbWFyeScsICcjRkZGRkZGJyk7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1zZWNvbmRhcnknLCAnI0ZGRkYwMCcpO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJy0tYWNjZW50JywgJyMwMEZGMDAnKTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLXN1Y2Nlc3MnLCAnIzAwRkZGRicpO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJy0tbXlzdGljYWwnLCAnI0ZGMDBGRicpO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJy0tYmctZGFyaycsICcjMDAwMDAwJyk7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS10ZXh0JywgJyNGRkZGRkYnKTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLXRleHQtZGltJywgJyNDQ0NDQ0MnKTtcbiAgICAgICAgXG4gICAgICAgIHNjcmVlblJlYWRlckFubm91bmNlci5hbm5vdW5jZSgnSGlnaCBjb250cmFzdCBtb2RlIGVuYWJsZWQnLCAnbm9ybWFsJyk7XG4gICAgfVxuICAgIFxuICAgIGRpc2FibGVIaWdoQ29udHJhc3QoKSB7XG4gICAgICAgIHRoaXMuaXNIaWdoQ29udHJhc3QgPSBmYWxzZTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdoaWdoLWNvbnRyYXN0LW1vZGUnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFJlc2V0IENTUyB2YXJpYWJsZXMgdG8gZGVmYXVsdHNcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLXByaW1hcnknLCAnI0ZGMkRBQScpO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJy0tc2Vjb25kYXJ5JywgJyMyMkUzRkYnKTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLWFjY2VudCcsICcjRkZEQjZFJyk7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1zdWNjZXNzJywgJyMzQ0UzQzUnKTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLW15c3RpY2FsJywgJyNDOUEwRkYnKTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLWJnLWRhcmsnLCAnIzBFMEUxMicpO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJy0tdGV4dCcsICcjRkZGRkZGJyk7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS10ZXh0LWRpbScsICcjQUFBQUFBJyk7XG4gICAgICAgIFxuICAgICAgICBzY3JlZW5SZWFkZXJBbm5vdW5jZXIuYW5ub3VuY2UoJ0hpZ2ggY29udHJhc3QgbW9kZSBkaXNhYmxlZCcsICdub3JtYWwnKTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlSGlnaENvbnRyYXN0KCkge1xuICAgICAgICBpZiAodGhpcy5pc0hpZ2hDb250cmFzdCkge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlSGlnaENvbnRyYXN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZUhpZ2hDb250cmFzdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBUZXh0IHNjYWxpbmcgbWFuYWdlclxuY2xhc3MgVGV4dFNjYWxpbmdNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2NhbGUgPSAxLjA7XG4gICAgICAgIHRoaXMubWluU2NhbGUgPSAwLjg7XG4gICAgICAgIHRoaXMubWF4U2NhbGUgPSAyLjA7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cbiAgICBcbiAgICBpbml0KCkge1xuICAgICAgICAvLyBDaGVjayBmb3IgcmVkdWNlZCBtb3Rpb24gcHJlZmVyZW5jZVxuICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEgJiYgd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcykge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdyZWR1Y2VkLW1vdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQga2V5Ym9hcmQgc2hvcnRjdXRzIGZvciB0ZXh0IHNjYWxpbmdcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmNyZWFzZVRleHRTY2FsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdfJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjcmVhc2VUZXh0U2NhbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICcwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRUZXh0U2NhbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlVGV4dFNjYWxlKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50U2NhbGUgPCB0aGlzLm1heFNjYWxlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY2FsZSA9IE1hdGgubWluKHRoaXMuY3VycmVudFNjYWxlICsgMC4xLCB0aGlzLm1heFNjYWxlKTtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlUZXh0U2NhbGUoKTtcbiAgICAgICAgICAgIHNjcmVlblJlYWRlckFubm91bmNlci5hbm5vdW5jZShgVGV4dCBzaXplIGluY3JlYXNlZCB0byAke01hdGgucm91bmQodGhpcy5jdXJyZW50U2NhbGUgKiAxMDApfSVgLCAnbm9ybWFsJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZGVjcmVhc2VUZXh0U2NhbGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY2FsZSA+IHRoaXMubWluU2NhbGUpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjYWxlID0gTWF0aC5tYXgodGhpcy5jdXJyZW50U2NhbGUgLSAwLjEsIHRoaXMubWluU2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5hcHBseVRleHRTY2FsZSgpO1xuICAgICAgICAgICAgc2NyZWVuUmVhZGVyQW5ub3VuY2VyLmFubm91bmNlKGBUZXh0IHNpemUgZGVjcmVhc2VkIHRvICR7TWF0aC5yb3VuZCh0aGlzLmN1cnJlbnRTY2FsZSAqIDEwMCl9JWAsICdub3JtYWwnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXNldFRleHRTY2FsZSgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2NhbGUgPSAxLjA7XG4gICAgICAgIHRoaXMuYXBwbHlUZXh0U2NhbGUoKTtcbiAgICAgICAgc2NyZWVuUmVhZGVyQW5ub3VuY2VyLmFubm91bmNlKCdUZXh0IHNpemUgcmVzZXQgdG8gMTAwJScsICdub3JtYWwnKTtcbiAgICB9XG4gICAgXG4gICAgYXBwbHlUZXh0U2NhbGUoKSB7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IGAke3RoaXMuY3VycmVudFNjYWxlfXJlbWA7XG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgcm9vdCBmb250IHNpemUgZm9yIHJlbS1iYXNlZCBzY2FsaW5nXG4gICAgICAgIGNvbnN0IHJvb3RGb250U2l6ZSA9IDE2ICogdGhpcy5jdXJyZW50U2NhbGU7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1yb290LWZvbnQtc2l6ZScsIGAke3Jvb3RGb250U2l6ZX1weGApO1xuICAgIH1cbn1cblxuLy8gQ29sb3IgYmxpbmQgZnJpZW5kbHkgdGhlbWVzXG5jbGFzcyBDb2xvckJsaW5kVGhlbWVNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50VGhlbWUgPSAnZGVmYXVsdCc7XG4gICAgICAgIHRoaXMudGhlbWVzID0ge1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIHByaW1hcnk6ICcjRkYyREFBJyxcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk6ICcjMjJFM0ZGJyxcbiAgICAgICAgICAgICAgICBhY2NlbnQ6ICcjRkZEQjZFJyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAnIzNDRTNDNScsXG4gICAgICAgICAgICAgICAgbXlzdGljYWw6ICcjQzlBMEZGJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb3Rhbm9waWE6IHtcbiAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzAwNjZDQycsXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI0ZGOTkwMCcsXG4gICAgICAgICAgICAgICAgYWNjZW50OiAnI0ZGRkYwMCcsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogJyMwMENDNjYnLFxuICAgICAgICAgICAgICAgIG15c3RpY2FsOiAnIzk5MzNDQydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXV0ZXJhbm9waWE6IHtcbiAgICAgICAgICAgICAgICBwcmltYXJ5OiAnIzAwNjZDQycsXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiAnI0ZGOTkwMCcsXG4gICAgICAgICAgICAgICAgYWNjZW50OiAnI0ZGRkYwMCcsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogJyMwMENDNjYnLFxuICAgICAgICAgICAgICAgIG15c3RpY2FsOiAnIzk5MzNDQydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cml0YW5vcGlhOiB7XG4gICAgICAgICAgICAgICAgcHJpbWFyeTogJyNDQzAwNjYnLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeTogJyMwMENDRkYnLFxuICAgICAgICAgICAgICAgIGFjY2VudDogJyNGRkZGMDAnLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICcjMDBDQzY2JyxcbiAgICAgICAgICAgICAgICBteXN0aWNhbDogJyNDQzAwQ0MnXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cbiAgICBcbiAgICBpbml0KCkge1xuICAgICAgICAvLyBBZGQga2V5Ym9hcmQgc2hvcnRjdXRzIGZvciBjb2xvciBibGluZCB0aGVtZXNcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5jdHJsS2V5ICYmIGUuYWx0S2V5KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICcxJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VGhlbWUoJ2RlZmF1bHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICcyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VGhlbWUoJ3Byb3Rhbm9waWEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICczJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VGhlbWUoJ2RldXRlcmFub3BpYScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUaGVtZSgndHJpdGFub3BpYScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgc2V0VGhlbWUodGhlbWVOYW1lKSB7XG4gICAgICAgIGlmICghdGhpcy50aGVtZXNbdGhlbWVOYW1lXSkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jdXJyZW50VGhlbWUgPSB0aGVtZU5hbWU7XG4gICAgICAgIGNvbnN0IHRoZW1lID0gdGhpcy50aGVtZXNbdGhlbWVOYW1lXTtcbiAgICAgICAgXG4gICAgICAgIC8vIFVwZGF0ZSBDU1MgdmFyaWFibGVzXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoZW1lKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShgLS0ke2tleX1gLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZS5yZXBsYWNlKC9jb2xvci1ibGluZC1cXHcrL2csICcnKTtcbiAgICAgICAgaWYgKHRoZW1lTmFtZSAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoYGNvbG9yLWJsaW5kLSR7dGhlbWVOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBzY3JlZW5SZWFkZXJBbm5vdW5jZXIuYW5ub3VuY2UoYENvbG9yIGJsaW5kIHRoZW1lIGNoYW5nZWQgdG8gJHt0aGVtZU5hbWV9YCwgJ25vcm1hbCcpO1xuICAgIH1cbn1cblxuLy8gSW5pdGlhbGl6ZSBhY2Nlc3NpYmlsaXR5IGZlYXR1cmVzXG5jb25zdCBzY3JlZW5SZWFkZXJBbm5vdW5jZXIgPSBuZXcgU2NyZWVuUmVhZGVyQW5ub3VuY2VyKCk7XG5jb25zdCBrZXlib2FyZE5hdmlnYXRpb24gPSBuZXcgS2V5Ym9hcmROYXZpZ2F0aW9uTWFuYWdlcigpO1xuY29uc3QgaGlnaENvbnRyYXN0TWFuYWdlciA9IG5ldyBIaWdoQ29udHJhc3RNYW5hZ2VyKCk7XG5jb25zdCB0ZXh0U2NhbGluZ01hbmFnZXIgPSBuZXcgVGV4dFNjYWxpbmdNYW5hZ2VyKCk7XG5jb25zdCBjb2xvckJsaW5kVGhlbWVNYW5hZ2VyID0gbmV3IENvbG9yQmxpbmRUaGVtZU1hbmFnZXIoKTtcblxuLy8gR2FtZS1zcGVjaWZpYyBhY2Nlc3NpYmlsaXR5IGZ1bmN0aW9uc1xuZnVuY3Rpb24gYW5ub3VuY2VHYW1lRXZlbnQoZXZlbnRUeXBlLCBkYXRhKSB7XG4gICAgc3dpdGNoIChldmVudFR5cGUpIHtcbiAgICAgICAgY2FzZSAnY2FzdCc6XG4gICAgICAgICAgICBzY3JlZW5SZWFkZXJBbm5vdW5jZXIuYW5ub3VuY2VSZXNvdXJjZUdhaW4oJ0FyY2FuZSBCaXRzJywgZGF0YS5hbW91bnQgfHwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnd29ya3N0YXRpb25fY3JhZnRlZCc6XG4gICAgICAgICAgICBzY3JlZW5SZWFkZXJBbm5vdW5jZXIuYW5ub3VuY2UoYENyYWZ0ZWQgJHtkYXRhLm5hbWV9IHdvcmtzdGF0aW9uYCwgJ25vcm1hbCcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VwZ3JhZGVfcHVyY2hhc2VkJzpcbiAgICAgICAgICAgIHNjcmVlblJlYWRlckFubm91bmNlci5hbm5vdW5jZShgUHVyY2hhc2VkICR7ZGF0YS5uYW1lfSB1cGdyYWRlYCwgJ25vcm1hbCcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjaGlldmVtZW50X3VubG9ja2VkJzpcbiAgICAgICAgICAgIHNjcmVlblJlYWRlckFubm91bmNlci5hbm5vdW5jZUFjaGlldmVtZW50KGRhdGEubmFtZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbGV2ZWxfdXAnOlxuICAgICAgICAgICAgc2NyZWVuUmVhZGVyQW5ub3VuY2VyLmFubm91bmNlTGV2ZWxVcChkYXRhLmxldmVsKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICBzY3JlZW5SZWFkZXJBbm5vdW5jZXIuYW5ub3VuY2VFcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG4vLyBBZGQgQVJJQSBsYWJlbHMgdG8gZHluYW1pYyBjb250ZW50XG5mdW5jdGlvbiBhZGRBcmlhTGFiZWxzKCkge1xuICAgIC8vIEFkZCBsYWJlbHMgdG8gY3VycmVuY3kgZGlzcGxheXNcbiAgICBjb25zdCBhYkRpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWItZGlzcGxheScpO1xuICAgIGlmIChhYkRpc3BsYXkpIHtcbiAgICAgICAgYWJEaXNwbGF5LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdBcmNhbmUgQml0cyBiYWxhbmNlJyk7XG4gICAgICAgIGFiRGlzcGxheS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnc3RhdHVzJyk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGFicHNEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FicHMtZGlzcGxheScpO1xuICAgIGlmIChhYnBzRGlzcGxheSkge1xuICAgICAgICBhYnBzRGlzcGxheS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQXJjYW5lIEJpdHMgcGVyIHNlY29uZCBwcm9kdWN0aW9uIHJhdGUnKTtcbiAgICAgICAgYWJwc0Rpc3BsYXkuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3N0YXR1cycpO1xuICAgIH1cbiAgICBcbiAgICAvLyBBZGQgbGFiZWxzIHRvIHByb2dyZXNzIGJhcnNcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucHJvZ3Jlc3MtYmFyJykuZm9yRWFjaChiYXIgPT4ge1xuICAgICAgICBjb25zdCBmaWxsID0gYmFyLnF1ZXJ5U2VsZWN0b3IoJy5wcm9ncmVzcy1maWxsJyk7XG4gICAgICAgIGlmIChmaWxsKSB7XG4gICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gTWF0aC5yb3VuZCgocGFyc2VGbG9hdChmaWxsLnN0eWxlLndpZHRoKSB8fCAwKSk7XG4gICAgICAgICAgICBiYXIuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYFByb2dyZXNzOiAke3BlcmNlbnRhZ2V9JWApO1xuICAgICAgICAgICAgYmFyLnNldEF0dHJpYnV0ZSgncm9sZScsICdwcm9ncmVzc2JhcicpO1xuICAgICAgICAgICAgYmFyLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW5vdycsIHBlcmNlbnRhZ2UpO1xuICAgICAgICAgICAgYmFyLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW1pbicsIDApO1xuICAgICAgICAgICAgYmFyLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW1heCcsIDEwMCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvLyBBZGQgbGFiZWxzIHRvIGNhcmRzXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNhcmQnKS5mb3JFYWNoKGNhcmQgPT4ge1xuICAgICAgICBjb25zdCB0aXRsZSA9IGNhcmQucXVlcnlTZWxlY3RvcignLmNhcmQtdGl0bGUnKTtcbiAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICBjYXJkLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRpdGxlLnRleHRDb250ZW50LnRyaW0oKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLy8gU2tpcCBsaW5rIGZ1bmN0aW9uYWxpdHlcbmZ1bmN0aW9uIGluaXRTa2lwTGlua3MoKSB7XG4gICAgY29uc3Qgc2tpcExpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tpcC1saW5rJyk7XG4gICAgaWYgKHNraXBMaW5rKSB7XG4gICAgICAgIHNraXBMaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2tpcExpbmsuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuICAgICAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIHRhcmdldC5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEFubm91bmNlIHRvIHNjcmVlbiByZWFkZXJcbiAgICAgICAgICAgICAgICBzY3JlZW5SZWFkZXJBbm5vdW5jZXIuYW5ub3VuY2UoJ1NraXBwZWQgdG8gbWFpbiBjb250ZW50JywgJ25vcm1hbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIE1ha2Ugc2tpcCBsaW5rIHZpc2libGUgd2hlbiBmb2N1c2VkXG4gICAgICAgIHNraXBMaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICAgICAgc2tpcExpbmsuc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgICAgICAgICAgIHNraXBMaW5rLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKDApJztcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBza2lwTGluay5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgICAgICAgc2tpcExpbmsuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICAgICAgICAgIHNraXBMaW5rLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKC0xMDAlKSc7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy8gRXhwb3J0IGZvciBnbG9iYWwgYWNjZXNzXG53aW5kb3cuQWNjZXNzaWJpbGl0eSA9IHtcbiAgICBhbm5vdW5jZUdhbWVFdmVudCxcbiAgICBhZGRBcmlhTGFiZWxzLFxuICAgIGluaXRTa2lwTGlua3MsXG4gICAgc2NyZWVuUmVhZGVyQW5ub3VuY2VyLFxuICAgIGtleWJvYXJkTmF2aWdhdGlvbixcbiAgICBoaWdoQ29udHJhc3RNYW5hZ2VyLFxuICAgIHRleHRTY2FsaW5nTWFuYWdlcixcbiAgICBjb2xvckJsaW5kVGhlbWVNYW5hZ2VyXG59O1xuXG4vLyBBdXRvLWluaXRpYWxpemUgd2hlbiBET00gaXMgcmVhZHlcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAgICAgICBhZGRBcmlhTGFiZWxzKCk7XG4gICAgICAgIGluaXRTa2lwTGlua3MoKTtcbiAgICB9KTtcbn0gZWxzZSB7XG4gICAgYWRkQXJpYUxhYmVscygpO1xuICAgIGluaXRTa2lwTGlua3MoKTtcbn0iXSwKICAibWFwcGluZ3MiOiAiQUFNQSxNQUFNLHNCQUFzQjtBQUFBLEVBQ3hCLGNBQWM7QUFDVixTQUFLLFlBQVk7QUFDakIsU0FBSyxvQkFBb0IsQ0FBQztBQUMxQixTQUFLLGVBQWU7QUFDcEIsU0FBSyxLQUFLO0FBQUEsRUFDZDtBQUFBLEVBRUEsT0FBTztBQUVILFNBQUssWUFBWSxTQUFTLGNBQWMsS0FBSztBQUM3QyxTQUFLLFVBQVUsYUFBYSxhQUFhLFFBQVE7QUFDakQs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
