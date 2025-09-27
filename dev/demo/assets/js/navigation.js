/**
 * Navigation Module for CanvasLens Examples
 * Handles navigation bar rendering and mobile menu functionality
 */

export class Navigation {
    constructor(options = {}) {
        this.currentPage = options.currentPage || '';
        this.pages = [
            { path: '../index.html', title: '🏠 Home', id: 'home' },
            { path: 'basic-image-viewer.html', title: '🖼️ Basic Viewer', id: 'basic' },
            { path: 'zoom-pan-demo.html', title: '🔍 Zoom & Pan', id: 'zoom' },
            { path: 'annotation-demo.html', title: '✏️ Annotation', id: 'annotation' },
            { path: 'comparison-demo.html', title: '⚖️ Comparison', id: 'comparison' },
            { path: 'photo-editor-demo.html', title: '🎨 Photo Editor', id: 'editor' }
        ];
    }

    /**
     * Render navigation bar HTML
     */
    render() {
        return `
            <nav class="nav-bar">
                <div class="nav-container">
                    <a href="../index.html" class="nav-brand">CanvasLens</a>
                    <button class="nav-toggle" id="navToggle">
                        <span class="hamburger"></span>
                        <span class="hamburger"></span>
                        <span class="hamburger"></span>
                    </button>
                    <ul class="nav-menu" id="navMenu">
                        ${this.pages.map(page => `
                            <li><a href="${page.path}" ${page.id === this.currentPage ? 'class="active"' : ''}>${page.title}</a></li>
                        `).join('')}
                    </ul>
                </div>
            </nav>
        `;
    }

    /**
     * Initialize navigation functionality
     */
    init() {
        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });

            // Close menu when clicking on a link
            navMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    /**
     * Insert navigation into the page
     */
    mount() {
        // Insert navigation at the beginning of body
        const body = document.body;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.render();
        const navElement = tempDiv.firstElementChild;
        
        body.insertBefore(navElement, body.firstChild);
        
        // Initialize functionality
        this.init();
    }
}

/**
 * Utility function to quickly create and mount navigation
 */
export function createNavigation(currentPage) {
    const nav = new Navigation({ currentPage });
    nav.mount();
    return nav;
}

/**
 * Auto-detect current page and create navigation
 */
export function autoCreateNavigation() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // Map filename to page ID
    const pageMap = {
        'index.html': 'home',
        'basic-image-viewer.html': 'basic',
        'zoom-pan-demo.html': 'zoom',
        'annotation-demo.html': 'annotation',
        'comparison-demo.html': 'comparison',
        'photo-editor-demo.html': 'editor'
    };
    
    const currentPage = pageMap[filename] || '';
    return createNavigation(currentPage);
}
