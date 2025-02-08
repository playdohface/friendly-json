/**
 * Form builder module for handling form creation and updates.
 * This module provides functionality to create and manage dynamic HTML forms
 * based on JSON data structures, supporting nested objects, arrays, and primitive values.
 */

import { updateJsonDisplay } from "./jsonDisplay.js";
import { clone, convertType } from "./utils.js";

/** @type {Object.<string, *>} Storage for default values of array items */
const defaultValues = {};

/**
 * Creates an interactive form from the provided JSON data
 * @param {Object|Array} data - The JSON data structure to create the form from
 * @param {HTMLElement} container - The DOM element to render the form within
 */
export function createForm(data, container) {
  container.innerHTML = "";
  buildForm(data, container);
  updateJsonDisplay();
}

/**
 * Recursively builds form elements from JSON data
 * @param {*} data - The JSON data to build form elements from
 * @param {HTMLElement} container - The container element to add form elements to
 * @param {string} [path=""] - The current path in the JSON structure
 * @private
 */
function buildForm(data, container, path = "") {
  if (Array.isArray(data)) {
    renderArrayField("array", data, container, path);
    return;
  }
  if (typeof data === "string") {
    renderPrimitiveField("string", data, container, path);
    return;
  }
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
 * @private
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
  addButton.onclick = () => addArrayItem(array, arrayContainer, currentPath);
  container.appendChild(addButton);
}

/**
 * Renders an object field recursively
 * @param {string} key - The field key
 * @param {Object} obj - The object value
 * @param {HTMLElement} container - The container element
 * @param {string} path - The current path in the JSON structure
 * @private
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
 * @param {Object} [parent] - The parent object containing this field
 * @private
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
 * Creates an appropriate input element based on the value type
 * @param {*} value - The value to create an input for
 * @param {Function} onChange - Callback function when the input value changes
 * @returns {HTMLElement} The created input element
 * @private
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
 * Adds a new item to an array and updates the display
 * @param {Array} array - The array to add to
 * @param {HTMLElement} container - The container element
 * @param {string} path - The current path in the JSON structure
 * @private
 */
function addArrayItem(array, container, path) {
  const newItem = array.length > 0 ? clone(array[0]) : createDefaultItem(path);
  array.push(newItem);
  renderArrayItem(newItem, array.length - 1, array, container, path);
  updateJsonDisplay();
}

/**
 * Removes an item from an array and updates the display
 * @param {Array} array - The array to remove from
 * @param {number} index - The index to remove
 * @param {HTMLElement} container - The container element
 * @param {string} path - The current path in the JSON structure
 * @private
 */
function removeArrayItem(array, index, container, path) {
  if (array.length === 1) {
    defaultValues[path] = array[0];
  }
  array.splice(index, 1);
  while (container.hasChildNodes()) {
    container.removeChild(container.firstChild);
  }
  array.forEach((item, index) => {
    renderArrayItem(item, index, array, container, path);
  });
  updateJsonDisplay();
}

/**
 * Renders an individual array item with remove button
 * @param {*} item - The array item to render
 * @param {number} index - The index of the item in the array
 * @param {Array} array - The parent array
 * @param {HTMLElement} container - The container element
 * @param {string} path - The current path in the JSON structure
 * @private
 */
function renderArrayItem(item, index, array, container, path) {
  const itemWrapper = document.createElement("div");
  itemWrapper.className = "array-item";

  const removeButton = document.createElement("span");
  removeButton.className = "remove-btn";
  removeButton.textContent = "Remove";
  removeButton.onclick = () => removeArrayItem(array, index, container, path);

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
 * Creates a default item for an array
 * @param {string} path - The path to create a default item for
 * @returns {*} The default value for the array item, empty string if no default exists
 * @private
 */
function createDefaultItem(path) {
  return defaultValues[path] ?? "";
}

export { defaultValues };
