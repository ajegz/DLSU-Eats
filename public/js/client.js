// Client-side JavaScript for DLSU Eats
// Server-side rendering handles most functionality.
// This file provides progressive enhancements only.

document.addEventListener('DOMContentLoaded', function () {
  // Auto-dismiss flash alerts after 5 seconds
  document.querySelectorAll('.alert').forEach(function (el) {
    setTimeout(function () {
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 500);
    }, 5000);
  });
});
