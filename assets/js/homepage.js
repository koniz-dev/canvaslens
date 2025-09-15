import { CanvasLens } from '../../dist/index.js';

const viewer = document.getElementById('canvasContainer');
const status = document.getElementById('status');

// Button references for state management
const buttons = {
    openOverlay: document.querySelector('button[onclick="openOverlay()"]'),
    resetView: document.querySelector('button[onclick="resetView()"]'),
    fitToView: document.querySelector('button[onclick="fitToView()"]'),
    setToolsAll: document.querySelector('button[onclick="setToolsAll()"]'),
    setToolsZoomOnly: document.querySelector('button[onclick="setToolsZoomOnly()"]'),
    setToolsAnnotationOnly: document.querySelector('button[onclick="setToolsAnnotationOnly()"]'),
    setToolsCustom: document.querySelector('button[onclick="setToolsCustom()"]')
};

// Tool button group for managing active states
const toolButtons = [
    buttons.setToolsAll,
    buttons.setToolsZoomOnly,
    buttons.setToolsAnnotationOnly,
    buttons.setToolsCustom
];

// Function to update button states based on image load status
function updateButtonStates() {
    const hasImage = viewer.isImageLoaded();
    
    // All buttons that require an image to be loaded
    const imageDependentButtons = [
        buttons.openOverlay,
        buttons.resetView,
        buttons.fitToView,
        buttons.setToolsAll,
        buttons.setToolsZoomOnly,
        buttons.setToolsAnnotationOnly,
        buttons.setToolsCustom
    ];
    
    // Disable all buttons when no image is loaded
    imageDependentButtons.forEach(button => {
        if (button) {
            button.disabled = !hasImage;
        }
    });
}

// Function to set active tool button
function setActiveToolButton(activeButton) {
    toolButtons.forEach(button => {
        if (button) {
            button.classList.remove('active');
        }
    });
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Set up event listeners
viewer.addEventListener('imageload', (e) => {
    updateStatus(`Image loaded: ${e.detail.naturalSize.width} × ${e.detail.naturalSize.height}`);
    updateButtonStates(); // Enable buttons when image loads
    setActiveToolButton(buttons.setToolsAll); // Set "All Tools" as default active when image loads
});

viewer.addEventListener('imageloaderror', (e) => {
    updateStatus(`❌ Failed to load image: ${e.detail.message}`);
    updateButtonStates(); // Keep buttons disabled on error
});

viewer.addEventListener('zoomchange', (e) => {
    updateStatus(`Zoom level: ${(e.detail * 100).toFixed(0)}%`);
});

viewer.addEventListener('annotationadd', (e) => {
    updateStatus(`Annotation added: ${e.detail.type}`);
});

// Load sample image
window.loadSampleImage = function () {
    updateStatus('Loading sample image...');
    // Reset file input to allow selecting the same file again
    document.getElementById('imageInput').value = '';
    // Use Picsum for reliable sample images
    viewer.loadImage('https://picsum.photos/800/600', 'image/jpeg', 'sample.jpg').catch(err => {
        updateStatus(`❌ Failed to load sample image: ${err.message}`);
    });
};

// Open overlay
window.openOverlay = function () {
    if (buttons.openOverlay.disabled) return;
    if (viewer.isImageLoaded()) {
        viewer.openOverlay();
    } else {
        updateStatus('Please load an image first');
    }
};

// Reset view
window.resetView = function () {
    if (buttons.resetView.disabled) return;
    viewer.resetView();
    updateStatus('View reset');
};

// Fit to view
window.fitToView = function () {
    if (buttons.fitToView.disabled) return;
    viewer.fitToView();
    updateStatus('Fitted to view');
};

// Update status
function updateStatus(message) {
    status.innerHTML = `<strong>Status:</strong> ${message}`;
}


// File input handler
document.getElementById('imageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        updateStatus(`Loading ${file.name}...`);
        viewer.loadImageFromFile(file);
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    }
});

// Tool configuration functions
window.setToolsAll = function () {
    const config = {
        zoom: true,
        pan: true,
        annotation: {
            rect: true,
            arrow: true,
            text: true,
            circle: true,
            line: true
        },
        comparison: true
    };
    viewer.setAttribute('tools', JSON.stringify(config));
    setActiveToolButton(buttons.setToolsAll);
    updateStatus('All tools enabled');
};

window.setToolsZoomOnly = function () {
    const config = {
        zoom: true,
        pan: true,
        annotation: {
            rect: false,
            arrow: false,
            text: false,
            circle: false,
            line: false
        },
        comparison: false
    };
    viewer.setAttribute('tools', JSON.stringify(config));
    setActiveToolButton(buttons.setToolsZoomOnly);
    updateStatus('Zoom and pan only');
};

window.setToolsAnnotationOnly = function () {
    const config = {
        zoom: false,
        pan: false,
        annotation: {
            rect: true,
            arrow: true,
            text: true,
            circle: true,
            line: true
        },
        comparison: false
    };
    viewer.setAttribute('tools', JSON.stringify(config));
    setActiveToolButton(buttons.setToolsAnnotationOnly);
    updateStatus('Annotation tools only');
};

window.setToolsCustom = function () {
    const config = {
        zoom: true,
        pan: false,
        annotation: {
            rect: true,
            arrow: false,
            text: true,
            circle: false,
            line: false
        },
        comparison: true
    };
    viewer.setAttribute('tools', JSON.stringify(config));
    setActiveToolButton(buttons.setToolsCustom);
    updateStatus('Custom configuration applied');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateStatus('CanvasLens Web Component ready!');
    
    // Force disable all buttons initially (except Load Image and Load Sample)
    const allButtons = [
        buttons.openOverlay, 
        buttons.resetView, 
        buttons.fitToView,
        buttons.setToolsAll,
        buttons.setToolsZoomOnly,
        buttons.setToolsAnnotationOnly,
        buttons.setToolsCustom
    ];
    allButtons.forEach(button => {
        if (button) {
            button.disabled = true;
        }
    });
    
    updateButtonStates(); // Initialize button states
    // Don't set active tool button initially since all are disabled
});
