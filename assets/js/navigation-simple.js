// Simple Navigation Module
export function createSimpleNavigation() {
    console.log('Creating navigation...');
    
    const nav = document.createElement('nav');
    nav.className = 'nav-bar';
    nav.innerHTML = `
        <div class="nav-container">
            <a href="../index.html" class="nav-brand">CanvasLens</a>
            <button class="nav-toggle" id="navToggle">
                <span class="hamburger"></span>
                <span class="hamburger"></span>
                <span class="hamburger"></span>
            </button>
            <ul class="nav-menu" id="navMenu">
                <li><a href="../index.html">🏠 Home</a></li>
                <li><a href="basic-image-viewer.html" class="active">🖼️ Basic Viewer</a></li>
                <li><a href="zoom-pan-demo.html">🔍 Zoom & Pan</a></li>
                <li><a href="annotation-demo.html">✏️ Annotation</a></li>
                <li><a href="comparison-demo.html">⚖️ Comparison</a></li>
                <li><a href="photo-editor-demo.html">🎨 Photo Editor</a></li>
            </ul>
        </div>
    `;
    
    document.body.insertBefore(nav, document.body.firstChild);
    console.log('Navigation created successfully');
    
    // Initialize mobile menu
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}
