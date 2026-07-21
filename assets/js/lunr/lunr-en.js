---
layout: none
---

var idx = lunr(function () {
  this.field('title')
  this.field('excerpt')
  this.field('categories')
  this.field('tags')
  this.ref('id')

  this.pipeline.remove(lunr.trimmer)

  for (var item in store) {
    this.add({
      title: store[item].title,
      excerpt: store[item].excerpt,
      categories: store[item].categories,
      tags: store[item].tags,
      id: item
    })
  }
});

// Show warning if only fuzzy matches found
function showNoExactMatchWarning(hasExactMatch, result, resultdiv, query) {
  if (!hasExactMatch && result.length > 0) {
    resultdiv.append(
      '<div class="search-no-exact-match">' +
      '<i class="fas fa-info-circle"></i> ' +
      'No exact match found for "<strong>' + escapeHtml(query) + '</strong>". ' +
      'Showing fuzzy search results:' +
      '</div>'
    );
  }
}

$(document).ready(function() {
  var $input = $('input#search');
  var $scopes = $('#search-scopes');

  // Empty string = search all books; otherwise a book URL prefix.
  var activeScope = '';

  // Map book prefix -> chip label, built from the rendered scope chips.
  var scopeLabels = {};
  $scopes.find('.search-scope').each(function () {
    var prefix = $(this).attr('data-scope');
    if (prefix) { scopeLabels[prefix] = $(this).text(); }
  });

  // Context-aware default: preselect the book of the page the user is on.
  // Match any scope prefix that appears as a path segment (baseurl-safe).
  var pathSegments = window.location.pathname.split('/');
  for (var prefix in scopeLabels) {
    if (scopeLabels.hasOwnProperty(prefix) && pathSegments.indexOf(prefix) !== -1) {
      activeScope = prefix;
      $scopes.find('.search-scope').removeClass('is-active').attr('aria-pressed', 'false');
      $scopes.find('.search-scope[data-scope="' + prefix + '"]')
        .addClass('is-active').attr('aria-pressed', 'true');
      break;
    }
  }

  // Keep only results whose book matches the active scope.
  function filterByScope(results) {
    if (!activeScope) { return results; }
    return results.filter(function (r) {
      return store[r.ref] && store[r.ref].book === activeScope;
    });
  }

  function runSearch() {
    var resultdiv = $('#results');
    var query = $input.val().toLowerCase();
    var queryTerms = query.split(lunr.tokenizer.separator).filter(function(t) {
      return t.length > 0;
    });

    // Skip empty queries
    if (queryTerms.length === 0) {
      resultdiv.empty();
      return;
    }

    // === Query 1: Exact + Wildcard only (no fuzzy) ===
    var exactResult = filterByScope(idx.query(function (q) {
      queryTerms.forEach(function (term) {
        // Exact match with stemming
        q.term(term, { boost: 100 })
        // Trailing wildcard (prefix match)
        q.term(term, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 })
      })
    }));

    var hasExactMatch = exactResult.length > 0;
    var result;

    if (hasExactMatch) {
      // Use exact results only
      result = exactResult;
    } else {
      // === Query 2: Fuzzy only (exact/wildcard already found nothing) ===
      result = filterByScope(idx.query(function (q) {
        queryTerms.forEach(function (term) {
          q.term(term, { usePipeline: false, editDistance: 1, boost: 1 })
        })
      }));
    }

    // === Render results ===
    resultdiv.empty();

    showNoExactMatchWarning(hasExactMatch, result, resultdiv, query);

    resultdiv.append('<p class="results__found">' + result.length + ' {{ site.data.ui-text[site.locale].results_found | default: "Result(s) found" }}</p>');

    for (var item in result) {
      var ref = result[item].ref;
      var doc = store[ref];
      var searchitem;

      // When searching all books, tag each hit with its book for context.
      var bookBadge = '';
      if (!activeScope && doc.book && scopeLabels[doc.book]) {
        bookBadge = '<span class="archive__item-book">' + scopeLabels[doc.book] + '</span>';
      }

      if (hasTeaserImage(doc)) {
        searchitem =
          '<div class="list__item">' +
            '<article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">' +
              bookBadge +
              '<h2 class="archive__item-title" itemprop="headline">' +
                '<a href="' + doc.url + '" rel="permalink">' + doc.title + '</a>' +
              '</h2>' +
              '<div class="archive__item-teaser">' +
                '<img src="' + doc.teaser + '" alt="">' +
              '</div>' +
              '<p class="archive__item-excerpt" itemprop="description">' + doc.excerpt.split(" ").splice(0,20).join(" ") + '...</p>' +
            '</article>' +
          '</div>';
      } else {
        searchitem =
          '<div class="list__item">' +
            '<article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">' +
              bookBadge +
              '<h2 class="archive__item-title" itemprop="headline">' +
                '<a href="' + doc.url + '" rel="permalink">' + doc.title + '</a>' +
              '</h2>' +
              '<div class="page-url">' + doc.url + '</div>' +
              '<p class="archive__item-excerpt" itemprop="description">' + doc.excerpt.split(" ").splice(0,20).join(" ") + '...</p>' +
            '</article>' +
          '</div>';
      }
      resultdiv.append(searchitem);
    }
  }

  $input.on('keyup', runSearch);

  // Switching scope re-runs the current query without retyping.
  $scopes.on('click', '.search-scope', function () {
    activeScope = $(this).attr('data-scope') || '';
    $scopes.find('.search-scope').removeClass('is-active').attr('aria-pressed', 'false');
    $(this).addClass('is-active').attr('aria-pressed', 'true');
    runSearch();
  });
});

// Helper function to escape HTML (prevent XSS)
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if document has a teaser image
 */
function hasTeaserImage(doc) {
  return doc && doc.teaser;
}
