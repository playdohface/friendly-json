import { createForm } from "./modules/formBuilder.js";
import {
  copyJsonToClipboard,
  downloadJson,
  exampleData,
  pasteJsonFromClipboard,
} from "./modules/jsonDisplay.js";

function toggleJsonDisplay() {
  const jsonDisplay = document.getElementById("jsonDisplay");
  const toggleBtn = document.querySelector(".toggle-btn");
  const isHidden = jsonDisplay.classList.toggle("hidden");
  toggleBtn.textContent = isHidden ? "Show JSON" : "Hide JSON";
}

function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "" : "dark";
  root.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// Initialize theme based on system preference and localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else {
  // Check system color scheme preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

// Initialize the form with example data
createForm(exampleData, document.getElementById("formContainer"));

// Select the textarea for initial focus
const textarea = document.getElementById("jsonTextarea");
textarea.select();

// Export functions for use in HTML
window.toggleJsonDisplay = toggleJsonDisplay;
window.toggleTheme = toggleTheme;
window.copyJsonToClipboard = copyJsonToClipboard;
window.pasteJsonFromClipboard = pasteJsonFromClipboard;
window.downloadJson = downloadJson;
window.createForm = createForm;
