# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development Workflow
- **Start development server**: `npm run dev` (serves at http://localhost:5173)
- **Build for production**: `npm run build` (outputs to `dist/`)
- **Preview production build**: `npm run preview`

### Code Quality
- **Lint code**: `npm run lint` (ESLint for Vue, JS, TS files in src/)
- **Auto-fix linting issues**: `npm run lint:fix`

### Testing
- No test framework is currently configured in this project

## Architecture Overview

### Hybrid Vue 3 + Legacy Structure
This project has a unique dual architecture:

1. **Primary Vue 3 App** (`src/`): Modern Vue 3 SPA using ES modules from CDN
2. **Legacy Static Version** (`legacy-index.html`): Original vanilla JS implementation preserved for reference

### Key Architecture Decisions

**Vue 3 Implementation**:
- Uses Vue 3 ESM build from CDN (not npm package) for simplicity
- Single-file component pattern with `.vue.js` extension
- No build step required for Vue components (ES modules in browser)
- Vite config present but primarily for development server

**State Management**:
- localStorage for persistent settings
- Reactive data in main Vue component
- Global `window.TimeCoinsApp` object for legacy animation system integration

**Styling Approach**:
- Tailwind CSS from CDN
- Custom CSS in `css/styles.css` for glassmorphism effects
- Font Awesome 6.4 for icons
- Google Fonts (Inter) for typography

### File Structure Importance

**Core Application**:
- `index.html`: Vue app mount point with SEO meta tags
- `src/App.vue.js`: Main Vue component (all application logic)
- `src/main.js`: Vue app initialization
- `js/`: Legacy JavaScript modules (i18n, animations, config)

**Data Files**:
- `data/currencies.json`: 33+ supported currencies with localization
- `data/timezones.json`: 50+ timezones with multi-language support

**Legacy Preservation**:
- `legacy-index.html`: Complete standalone HTML/JS version

## Key Technical Details

### Animation System Integration
The Vue app integrates with a legacy JavaScript animation system through `window.animationManager`. The hourglass particle animation requires:
- DOM element with ID `hourglassContainer`
- Global settings sync via `window.TimeCoinsApp.settings`
- Initialization timing to wait for DOM rendering

### Internationalization
- Custom i18n system in `js/i18n.js`
- Supports English and Chinese
- Browser language detection
- Currency and timezone localization

### Settings System
Settings are persisted to localStorage and include:
- Hourly rate, work schedule, timezone, currency
- Monthly calculations (base income, overtime, work days)
- Milestone tracking system

### Deployment
- GitHub Pages deployment
- Base path configuration in vite.config.js: `base: './'`
- SEO optimized with meta tags, structured data, and robots.txt

### SEO Best Practices
- **HTML Structure**: Use proper H1/H2 heading hierarchy for content structure
- **ALT Attributes**: All icons and images must have descriptive ALT attributes for accessibility
- **Meta Tags**: Comprehensive SEO meta tags including OpenGraph and Twitter Cards
- **Structured Data**: Schema.org JSON-LD markup for rich snippets
- **Minified Assets**: Use minified CSS (styles.min.css) for better performance
- **Internal Links**: Include navigation with internal anchors to improve link ratio
- **Semantic HTML**: Use proper section IDs for deep linking and navigation

## Development Guidelines

### When Adding Features
1. Vue components should be added to `src/` directory
2. Maintain compatibility with animation system globals
3. Update i18n files for new text content
4. Test both Vue and legacy versions if changes affect shared data

### Code Style
- Follow existing Vue 3 Composition API patterns
- Use Tailwind CSS classes for styling
- Maintain glassmorphism design theme (gold/black/white palette)
- ESLint configuration enforces Vue.js style guide

### Common Pitfalls
- Animation system requires DOM timing considerations
- Settings must be synced between Vue reactivity and global objects
- Legacy version in `legacy-index.html` should remain functional
- CDN dependencies require internet connection for development