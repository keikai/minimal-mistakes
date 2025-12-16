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
  $('input#search').on('keyup', function () {
    var resultdiv = $('#results');
    var query = $(this).val().toLowerCase();
    var queryTerms = query.split(lunr.tokenizer.separator).filter(function(t) {
      return t.length > 0;
    });

    // Skip empty queries
    if (queryTerms.length === 0) {
      resultdiv.empty();
      return;
    }

    // === Query 1: Exact + Wildcard only (no fuzzy) ===
    var exactResult = idx.query(function (q) {
      queryTerms.forEach(function (term) {
        // Exact match with stemming
        q.term(term, { boost: 100 })
        // Trailing wildcard (prefix match)
        q.term(term, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 })
      })
    });

    var hasExactMatch = exactResult.length > 0;
    var result;

    if (hasExactMatch) {
      // Use exact results only
      result = exactResult;
    } else {
      // === Query 2: Fuzzy only (exact/wildcard already found nothing) ===
      result = idx.query(function (q) {
        queryTerms.forEach(function (term) {
          q.term(term, { usePipeline: false, editDistance: 1, boost: 1 })
        })
      });
    }

    // === Render results ===
    resultdiv.empty();

    showNoExactMatchWarning(hasExactMatch, result, resultdiv, query);

    resultdiv.append('<p class="results__found">' + result.length + ' {{ site.data.ui-text[site.locale].results_found | default: "Result(s) found" }}</p>');

    for (var item in result) {
      var ref = result[item].ref;
      var searchitem;

      if (hasTeaserImage(store[ref])) {
        searchitem =
          '<div class="list__item">' +
            '<article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">' +
              '<h2 class="archive__item-title" itemprop="headline">' +
                '<a href="' + store[ref].url + '" rel="permalink">' + store[ref].title + '</a>' +
              '</h2>' +
              '<div class="archive__item-teaser">' +
                '<img src="' + store[ref].teaser + '" alt="">' +
              '</div>' +
              '<p class="archive__item-excerpt" itemprop="description">' + store[ref].excerpt.split(" ").splice(0,20).join(" ") + '...</p>' +
            '</article>' +
          '</div>';
      } else {
        searchitem =
          '<div class="list__item">' +
            '<article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">' +
              '<h2 class="archive__item-title" itemprop="headline">' +
                '<a href="' + store[ref].url + '" rel="permalink">' + store[ref].title + '</a>' +
              '</h2>' +
              '<div class="page-url">' + store[ref].url + '</div>' +
              '<p class="archive__item-excerpt" itemprop="description">' + store[ref].excerpt.split(" ").splice(0,20).join(" ") + '...</p>' +
            '</article>' +
          '</div>';
      }
      resultdiv.append(searchitem);
    }
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
