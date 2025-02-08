/**
 * JSON display module for handling JSON operations and display.
 * This module provides functionality for JSON validation, display,
 * clipboard operations, and file download capabilities.
 */

let exampleData = {
  instruction: "Paste JSON to begin",
};

/**
 * Updates the JSON textarea with the current state and initializes JSON validation
 * @fires textarea#oninput - Sets up input validation handler
 */
export function updateJsonDisplay() {
  const textarea = document.getElementById("jsonTextarea");
  textarea.value = JSON.stringify(exampleData, null, 2);

  let errorDisplay = document.getElementById("jsonError");
  if (!errorDisplay) {
    errorDisplay = document.createElement("div");
    errorDisplay.id = "jsonError";
    textarea.parentNode.insertBefore(errorDisplay, textarea);
  }

  errorDisplay.style.color = "red";
  errorDisplay.style.marginBottom = "10px";
  errorDisplay.style.display = "none";
  textarea.placeholder = "enter JSON here";

  textarea.oninput = () => handleJsonInput(textarea, errorDisplay);
}

/**
 * Handles JSON input validation and form updates
 * @param {HTMLTextAreaElement} textarea - The JSON input textarea element
 * @param {HTMLElement} errorDisplay - The error display element
 */
function handleJsonInput(textarea, errorDisplay) {
  try {
    if (!textarea.value.trim()) {
      errorDisplay.style.display = "none";
      return;
    }
    const parsedData = JSON5.parse(textarea.value);
    errorDisplay.style.display = "none";
    exampleData = parsedData;
    createForm(exampleData, document.getElementById("formContainer"));
  } catch (e) {
    errorDisplay.textContent = `Invalid JSON: ${e.message}`;
    errorDisplay.style.display = "block";
  }
}

/**
 * Copies the current JSON content to clipboard and shows feedback
 * @returns {Promise<void>}
 */
export async function copyJsonToClipboard() {
  const textarea = document.getElementById("jsonTextarea");
  const copyBtn = document.querySelector(".copy-btn");

  try {
    await navigator.clipboard.writeText(textarea.value);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

/**
 * Pastes JSON content from clipboard and updates the form
 * @returns {Promise<void>}
 */
export async function pasteJsonFromClipboard() {
  try {
    const clipboardText = await navigator.clipboard.readText();
    const textarea = document.getElementById("jsonTextarea");
    textarea.value = clipboardText;
    exampleData = JSON.parse(clipboardText);
    createForm(exampleData, document.getElementById("formContainer"));
  } catch (err) {
    console.error("Failed to paste text:", err);
  }
}

/**
 * Downloads the current JSON data as a file
 * @returns {void}
 */
export function downloadJson() {
  const dataStr = JSON.stringify(exampleData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { exampleData };
