# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Jekyll theme repository for "Minimal Mistakes" - a flexible two-column Jekyll theme. The repository contains both the theme source code and documentation/example content.

## Development Commands

### Building and Development
- `bundle install` - Install Ruby dependencies
- `bundle exec rake preview` - Start development server with auto-regeneration for testing (serves from `/test` directory)
- `bundle exec jekyll serve` - Standard Jekyll development server
- `bundle exec jekyll build` - Build the site

### JavaScript Assets
- `npm install` - Install Node.js dependencies
- `npm run build:js` - Build and minify JavaScript assets
- `npm run watch:js` - Watch for JavaScript changes and rebuild automatically
- `npm run uglify` - Minify JavaScript files
- `npm run add-banner` - Add theme banner to minified JS

### Theme Distribution
- `bundle exec rake build` - Build the gem
- `bundle exec rake release` - Release new version to RubyGems

## Architecture

### Theme Structure
- `_sass/minimal-mistakes/` - Core SCSS files organized by component
- `_includes/` - Reusable HTML components and partials
- `_layouts/` - Page layout templates
- `_data/` - YAML data files for navigation and UI text
- `assets/` - Static assets (CSS, JS, images)

### Key Components
- **Skins**: Color variations in `_sass/minimal-mistakes/skins/`
- **Navigation**: Managed via `_data/navigation.yml`
- **Layouts**: Multiple layout options (single, archive, splash, etc.)
- **JavaScript**: Built using uglify-js, concatenated into `main.min.js`

### Custom Modifications
- Custom ZK theme skin at `_sass/minimal-mistakes/skins/_zk.scss`
- Custom navigation styling in `_sass/minimal-mistakes/_navigation.scss`
- Custom assets in `assets/images/` including ZK-logo.svg
- Custom JavaScript files: `page-control.js`, `report-issue.js`

### Build Process
1. SCSS files are compiled via Jekyll's built-in Sass processor
2. JavaScript files are concatenated and minified using Node.js scripts
3. Theme assets are included in the gem via gemspec file patterns

### Testing
- Use `/test` directory for local development and testing
- `/docs` directory contains full documentation site
- Preview changes with `bundle exec rake preview`

## Configuration

### Jekyll Configuration
- Main config in `_config.yml`
- Theme skin set via `minimal_mistakes_skin` variable
- Plugin dependencies: jekyll-paginate, jekyll-sitemap, jekyll-gist, jekyll-feed, jekyll-include-cache

### Theme Customization
- Modify `_sass/minimal-mistakes/_variables.scss` for global style changes
- Override layouts by placing files in `_layouts/` directory
- Add custom CSS/JS via `_includes/head/custom.html` and `assets/js/`
- Customize navigation via `_data/navigation.yml`

## Important Notes

- This is a Jekyll theme distributed as a Ruby gem
- The theme uses jekyll-include-cache plugin for performance
- JavaScript build process requires Node.js
- Main branch is `master`, current working branch is `zk`
- Modified files: `_sass/minimal-mistakes/_navigation.scss` and `.claude/` directory