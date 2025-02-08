/**
 * Utility functions for type conversion and object manipulation
 */

/**
 * Converts a value to the specified type
 * @param {*} value - The value to convert
 * @param {string} type - The target type
 * @returns {*} The converted value
 */
export function convertType(value, type) {
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
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
