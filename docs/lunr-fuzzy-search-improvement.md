# Lunr.js Fuzzy Search - Problem & Solution

## Problem

When searching on the Jekyll site powered by Lunr.js, users experienced confusing results:

- **"dress"** (not in docs) returned results containing **"press"**
- **"i3"** returned pages that don't contain "i3"
- Users expected exact matches but received fuzzy approximations without any indication

### Root Cause

The original search implementation used a 3-tier strategy for every query term:

1. **Exact match** with stemming (boost: 100)
2. **Trailing wildcard** for prefix matching (boost: 10)
3. **Fuzzy matching** with edit distance 1 (boost: 1)

The fuzzy matching (edit distance 1) allows one character operation (insertion, deletion, substitution, or transposition). This means "press" ↔ "dress" = 1 substitution (p → d), which falls within the edit distance threshold.

When no exact match existed, fuzzy results appeared without any user notification, causing confusion.

## Solution

The solution uses a **two-query approach with a warning message**:

1. **First query**: Search with exact match and wildcard only (no fuzzy)
2. **If results found**: Display them normally without any warning
3. **If no results**: Run a second query with fuzzy matching, and display a warning message indicating "No exact match found, showing fuzzy search results"

### Benefits

- **Better UX**: When exact matches exist, shows ONLY exact matches (no fuzzy noise)
- **User awareness**: Clear warning when showing approximate results
- **Efficient**: Only runs fuzzy query when needed

### Related Files

| File | Purpose |
|------|---------|
| `assets/js/lunr/lunr-en.js` | Search logic with two-query approach and warning function |
| `_sass/minimal-mistakes/_search.scss` | Styles for the warning message |

## Behavior Examples

| Query | Exact Match Found? | Result |
|-------|-------------------|--------|
| `browser` | Yes | Normal results, no warning |
| `brow` | Yes (wildcard → "browser") | Normal results, no warning |
| `dress` | No | Warning + fuzzy results ("press") |
| `i3` | No | Warning + fuzzy results |
| `xyz123` | No | "0 results found", no warning |
