import { CanvasLens } from '../../dist/index.js';

const viewer = document.getElementById('canvasContainer');
const status = document.getElementById('status');

// Set up event listeners
viewer.addEventListener('imageload', (e) => {
    updateStatus(`Image loaded: ${e.detail.naturalSize.width} × ${e.detail.naturalSize.height}`);
});

viewer.addEventListener('imageloaderror', (e) => {
    updateStatus(`❌ Failed to load image: ${e.detail.message}`);
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
    // Use Picsum for reliable sample images
    viewer.loadImage('https://picsum.photos/800/600', 'image/jpeg', 'sample.jpg').catch(err => {
        updateStatus(`❌ Failed to load sample image: ${err.message}`);
    });
};

// Open overlay
window.openOverlay = function () {
    if (viewer.isImageLoaded()) {
        viewer.openOverlay();
    } else {
        updateStatus('Please load an image first');
    }
};

// Reset view
window.resetView = function () {
    viewer.resetView();
    updateStatus('View reset');
};

// Fit to view
window.fitToView = function () {
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
    updateStatus('Custom configuration applied');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateStatus('CanvasLens Web Component ready!');
});
