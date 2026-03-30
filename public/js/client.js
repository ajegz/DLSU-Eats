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

  const searchForm = document.querySelector('.search-form');
  const searchInput = searchForm ? searchForm.querySelector('input[name="q"]') : null;
  const suggestionsList = document.getElementById('search-suggestions');

  if (!searchForm || !searchInput || !suggestionsList) {
    return;
  }

  let debounceTimer;

  function clearSuggestions() {
    suggestionsList.innerHTML = '';
    suggestionsList.classList.add('hidden');
  }

  function renderSuggestions(items) {
    if (!items.length) {
      clearSuggestions();
      return;
    }

    suggestionsList.innerHTML = '';
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.className = 'search-suggestion-item';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-suggestion-btn';
      button.textContent = item;
      button.addEventListener('click', function () {
        searchInput.value = item;
        clearSuggestions();
        searchForm.submit();
      });

      li.appendChild(button);
      suggestionsList.appendChild(li);
    });

    suggestionsList.classList.remove('hidden');
  }

  function fetchSuggestions(query) {
    fetch('/search/suggestions?q=' + encodeURIComponent(query))
      .then(function (response) { return response.json(); })
      .then(function (data) { renderSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []); })
      .catch(function () { clearSuggestions(); });
  }

  searchInput.addEventListener('input', function () {
    const query = searchInput.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 1) {
      clearSuggestions();
      return;
    }

    debounceTimer = setTimeout(function () {
      fetchSuggestions(query);
    }, 180);
  });

  document.addEventListener('click', function (event) {
    if (!searchForm.contains(event.target)) {
      clearSuggestions();
    }
  });
});
