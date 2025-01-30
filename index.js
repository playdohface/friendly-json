/**
 * Updates the JSON textarea with the current state and handles JSON validation
 */
function updateJsonDisplay() {
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
 * @param {HTMLTextAreaElement} textarea - The JSON input textarea
 * @param {HTMLElement} errorDisplay - The error display element
 */
function handleJsonInput(textarea, errorDisplay) {
  try {
    if (!textarea.value.trim()) {
      errorDisplay.style.display = "none";
      return;
    }
    const parsedData = JSON.parse(textarea.value);
    errorDisplay.style.display = "none";
    exampleData = parsedData;
    createForm(exampleData, document.getElementById("formContainer"));
  } catch (e) {
    errorDisplay.textContent = `Invalid JSON: ${e.message}`;
    errorDisplay.style.display = "block";
  }
}

/**
 * Creates a form from the provided JSON data
 * @param {Object} data - The JSON data to create the form from
 * @param {HTMLElement} container - The container element to render the form in
 */
function createForm(data, container) {
  container.innerHTML = "";
  buildForm(data, container);
  updateJsonDisplay();
}

/**
 * Recursively builds form elements from JSON data
 * @param {Object} data - The JSON data to build form elements from
 * @param {HTMLElement} container - The container element to add form elements to
 * @param {string} path - The current path in the JSON structure
 */
function buildForm(data, container, path = "") {
  Object.keys(data).forEach((key) => {
    const value = data[key];
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "field-group";

    if (Array.isArray(value)) {
      renderArrayField(key, value, fieldWrapper, path);
    } else if (typeof value === "object" && value !== null) {
      renderObjectField(key, value, fieldWrapper, path);
    } else {
      renderPrimitiveField(key, value, fieldWrapper, path, data);
    }

    container.appendChild(fieldWrapper);
  });
}

/**
 * Renders an array field with add/remove item functionality
 * @param {string} key - The field key
 * @param {Array} array - The array value
 * @param {HTMLElement} container - The container element
 * @param {string} path - The current path in the JSON structure
 */
function renderArrayField(key, array, container, path) {
  const currentPath = path ? `${path}.${key}` : key;
  const title = document.createElement("div");
  title.innerHTML = `<strong>${key}:</strong> (Array)`;
  container.appendChild(title);

  const arrayContainer = document.createElement("div");
  arrayContainer.className = "array-container";
  container.appendChild(arrayContainer);

  array.forEach((item, index) => {
    renderArrayItem(item, index, array, arrayContainer, currentPath);
  });

  const addButton = document.createElement("span");
  addButton.className = "add-btn";
  addButton.textContent = "Add Item";
  addButton.onclick = () => {
    const newItem =
      array.length > 0 ? clone(array[0]) : createDefaultItem(array);
    array.push(newItem);
    renderArrayItem(
      newItem,
      array.length - 1,
      array,
      arrayContainer,
      currentPath
    );
    updateJsonDisplay();
  };
  container.appendChild(addButton);
}

/**
 * Renders an object field recursively
 * @param {string} key - The field key
 * @param {Object} obj - The object value
 * @param {HTMLElement} container - The container element
 * @param {string} path - The current path in the JSON structure
 */
function renderObjectField(key, obj, container, path) {
  const currentPath = path ? `${path}.${key}` : key;
  const title = document.createElement("div");
  title.innerHTML = `<strong>${key}:</strong> (Object)`;
  container.appendChild(title);
  buildForm(obj, container, currentPath);
}

/**
 * Renders a primitive field (string, number, boolean)
 * @param {string} key - The field key
 * @param {*} value - The primitive value
 * @param {HTMLElement} container - The container element
 * @param {string} path - The current path in the JSON structure
 * @param {Object} parent - The parent object containing this field
 */
function renderPrimitiveField(key, value, container, path, parent) {
  const currentPath = path ? `${path}.${key}` : key;
  const label = document.createElement("label");
  label.textContent = `${key}: (${typeof value})`;

  const input = createInputForType(value, (newValue) => {
    parent[key] = convertType(newValue, typeof value);
    updateJsonDisplay();
  });

  container.appendChild(label);
  container.appendChild(input);
}

/**
 * Renders an individual array item with remove functionality
 * @param {*} item - The array item value to render
 * @param {number} index - The index of the item in the array
 * @param {Array} array - The parent array containing the item
 * @param {HTMLElement} container - The container element to render the item in
 * @param {string} path - The current path in the JSON structure
 */
function renderArrayItem(item, index, array, container, path) {
  const itemWrapper = document.createElement("div");
  itemWrapper.className = "array-item";

  const removeButton = document.createElement("span");
  removeButton.className = "remove-btn";
  removeButton.textContent = "Remove";
  removeButton.onclick = () => {
    array.splice(index, 1);
    while (container.hasChildNodes()) {
      container.removeChild(container.firstChild);
    }
    array.forEach((item, index) => {
      renderArrayItem(item, index, array, container, path);
    });
    updateJsonDisplay();
  };

  const itemContainer = document.createElement("div");
  if (typeof item === "object" && item !== null) {
    buildForm(item, itemContainer, `${path}[${index}]`);
  } else {
    const input = createInputForType(item, (value) => {
      array[index] = convertType(value, typeof item);
      updateJsonDisplay();
    });
    itemContainer.appendChild(input);
  }

  itemWrapper.appendChild(removeButton);
  itemWrapper.appendChild(itemContainer);
  container.appendChild(itemWrapper);
}

/**
 * Creates an appropriate input element based on the value type
 * @param {*} value - The value to create an input for
 * @param {Function} onChange - Callback function when the input value changes
 * @returns {HTMLElement} The created input element
 */
function createInputForType(value, onChange) {
  const type = typeof value;
  let input;

  if (type === "boolean") {
    input = document.createElement("select");
    const trueOption = document.createElement("option");
    trueOption.value = "true";
    trueOption.text = "true";
    const falseOption = document.createElement("option");
    falseOption.value = "false";
    falseOption.text = "false";
    input.appendChild(trueOption);
    input.appendChild(falseOption);
    input.value = value.toString();
    input.onchange = () => onChange(input.value === "true");
  } else if (type === "number") {
    input = document.createElement("input");
    input.type = "number";
    input.value = value;
    input.oninput = () => onChange(Number(input.value));
  } else {
    input = document.createElement("textarea");
    input.value = value;
    input.oninput = () => {
      onChange(input.value);
      if (input.value.indexOf("\n") > -1 || input.value.length > 40) {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + "px";
      }
    };
  }

  return input;
}

/**
 * Converts a value to the specified type
 * @param {*} value - The value to convert
 * @param {string} type - The target type
 * @returns {*} The converted value
 */
function convertType(value, type) {
  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    default:
      return value;
  }
}

/**
 * Creates a deep clone of an object
 * @param {Object} obj - The object to clone
 * @returns {Object} A deep clone of the object
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Creates a default item for an array
 * @param {Array} array - The array to create a default item for
 * @returns {string} An empty string as the default item
 */
function createDefaultItem(array) {
  return "";
}

/**
 * Copies the current JSON content to clipboard and shows feedback
 * @returns {Promise<void>}
 */
async function copyJsonToClipboard() {
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
async function pasteJsonFromClipboard() {
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
 */
function downloadJson() {
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

/**
 * Toggles the visibility of the JSON display panel
 */
function toggleJsonDisplay() {
  const jsonDisplay = document.getElementById("jsonDisplay");
  const toggleBtn = document.querySelector(".toggle-btn");
  const isHidden = jsonDisplay.classList.toggle("hidden");
  toggleBtn.textContent = isHidden ? "Show JSON" : "Hide JSON";
}

let exampleData = {
  instruction: "Paste JSON to begin",
};

createForm(exampleData, document.getElementById("formContainer"));

const textarea = document.getElementById("jsonTextarea");
textarea.select();
