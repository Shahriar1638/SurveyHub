/**
 * Escape regex special characters to prevent ReDoS via user-supplied search params.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
