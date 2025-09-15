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
    toggleComparison: document.querySelector('button[onclick="toggleComparison()"]')
};

// Tool button group for managing active states
const toolButtons = [
    buttons.setToolsAll,
    buttons.setToolsZoomOnly,
    buttons.setToolsAnnotationOnly,
    buttons.toggleComparison
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
        buttons.toggleComparison
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
            // Add secondary class to make it gray
            button.classList.add('secondary');
        }
    });
    if (activeButton) {
        activeButton.classList.add('active');
        // Remove secondary class to make it blue
        activeButton.classList.remove('secondary');
    }
}

// Function to show/hide annotation tools
function toggleAnnotationTools(show) {
    const annotationTools = document.getElementById('annotationTools');
    const annotationSettings = document.getElementById('annotationSettings');
    if (annotationTools) {
        annotationTools.style.display = show ? 'flex' : 'none';
    }
    if (annotationSettings) {
        annotationSettings.style.display = show ? 'flex' : 'none';
    }
}

// Function to change annotation color
window.changeAnnotationColor = function(color) {
    if (viewer.canvasLens && viewer.canvasLens.imageViewer && viewer.canvasLens.imageViewer.annotationManager) {
        viewer.canvasLens.imageViewer.annotationManager.updateStyle({ strokeColor: color });
        // Sync hex input
        document.getElementById('colorHex').value = color;
        updateStatus(`Color changed to: ${color}`);
    }
};

// Function to change color from hex input
window.changeAnnotationColorFromHex = function(hex) {
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        if (viewer.canvasLens && viewer.canvasLens.imageViewer && viewer.canvasLens.imageViewer.annotationManager) {
            viewer.canvasLens.imageViewer.annotationManager.updateStyle({ strokeColor: hex });
            // Sync color picker
            document.getElementById('colorPicker').value = hex;
            updateStatus(`Color changed to: ${hex}`);
        }
    } else {
        // Invalid hex, revert to previous value
        const colorPicker = document.getElementById('colorPicker');
        document.getElementById('colorHex').value = colorPicker.value;
        updateStatus('Invalid hex color format');
    }
};

// Function to change stroke width
window.changeStrokeWidth = function(width) {
    const numWidth = parseInt(width);
    if (numWidth >= 1 && numWidth <= 20) {
        if (viewer.canvasLens && viewer.canvasLens.imageViewer && viewer.canvasLens.imageViewer.annotationManager) {
            viewer.canvasLens.imageViewer.annotationManager.updateStyle({ strokeWidth: numWidth });
            updateStatus(`Stroke width changed to: ${numWidth}px`);
        }
    } else {
        // Invalid width, revert to previous value
        const currentWidth = document.getElementById('strokeWidth').value;
        updateStatus('Width must be between 1-20px');
    }
};

// Function to increase stroke width
window.increaseWidth = function() {
    const widthInput = document.getElementById('strokeWidth');
    const currentWidth = parseInt(widthInput.value);
    if (currentWidth < 20) {
        widthInput.value = currentWidth + 1;
        changeStrokeWidth(widthInput.value);
    }
};

// Function to decrease stroke width
window.decreaseWidth = function() {
    const widthInput = document.getElementById('strokeWidth');
    const currentWidth = parseInt(widthInput.value);
    if (currentWidth > 1) {
        widthInput.value = currentWidth - 1;
        changeStrokeWidth(widthInput.value);
    }
};

// Function to change line style
window.changeLineStyle = function(style) {
    if (viewer.canvasLens && viewer.canvasLens.imageViewer && viewer.canvasLens.imageViewer.annotationManager) {
        viewer.canvasLens.imageViewer.annotationManager.updateStyle({ lineStyle: style });
        updateStatus(`Line style changed to: ${style}`);
    }
};

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

viewer.addEventListener('toolchange', (e) => {
    const toolType = e.detail;
    if (toolType) {
        updateStatus(`Tool activated: ${toolType} - Click and drag to draw`);
        updateToolButtonStates(toolType);
    } else {
        updateStatus('Tool deactivated');
        updateToolButtonStates(null);
    }
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
    // Use new API instead of setAttribute to avoid reinitializing
    viewer.updateTools(config);
    setActiveToolButton(buttons.setToolsAll);
    toggleAnnotationTools(false); // Hide annotation tools
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
    // Use new API instead of setAttribute to avoid reinitializing
    viewer.updateTools(config);
    setActiveToolButton(buttons.setToolsZoomOnly);
    toggleAnnotationTools(false); // Hide annotation tools
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
    // Use new API instead of setAttribute to avoid reinitializing
    viewer.updateTools(config);
    setActiveToolButton(buttons.setToolsAnnotationOnly);
    toggleAnnotationTools(true); // Show annotation tools
    updateStatus('Annotation tools only - select a tool to start drawing');
};

window.toggleComparison = function () {
    // Toggle comparison mode
    if (viewer.canvasLens && viewer.canvasLens.imageViewer) {
        const currentComparison = viewer.canvasLens.getComparisonEnabled();
        viewer.canvasLens.setComparisonEnabled(!currentComparison);
        
        if (!currentComparison) {
            setActiveToolButton(buttons.toggleComparison);
            toggleAnnotationTools(false); // Hide annotation tools
            updateStatus('Comparison mode enabled - Load before/after images to compare');
        } else {
            setActiveToolButton(null);
            updateStatus('Comparison mode disabled');
        }
    } else {
        updateStatus('Comparison functionality not available');
    }
};

// Annotation tool functions
window.activateTool = function(toolType) {
    if (viewer.canvasLens && viewer.canvasLens.imageViewer && viewer.canvasLens.imageViewer.annotationManager) {
        const success = viewer.canvasLens.imageViewer.annotationManager.activateTool(toolType);
        if (success) {
            updateStatus(`Tool activated: ${toolType} - Click and drag to draw`);
            // Update button states
            updateToolButtonStates(toolType);
        } else {
            updateStatus(`Failed to activate tool: ${toolType}`);
        }
    } else {
        updateStatus('Annotation manager not available');
    }
};

window.toggleTool = function(toolType) {
    if (viewer.canvasLens && viewer.canvasLens.imageViewer && viewer.canvasLens.imageViewer.annotationManager) {
        const annotationManager = viewer.canvasLens.imageViewer.annotationManager;
        const currentTool = annotationManager.getActiveToolType();
        
        // If the same tool is already active, deactivate it
        if (currentTool === toolType) {
            annotationManager.deactivateTool();
            updateStatus('Tool deactivated');
            updateToolButtonStates(null);
        } else {
            // Otherwise, activate the new tool
            const success = annotationManager.activateTool(toolType);
            if (success) {
                updateStatus(`Tool activated: ${toolType} - Click and drag to draw`);
                updateToolButtonStates(toolType);
            } else {
                updateStatus(`Failed to activate tool: ${toolType}`);
            }
        }
    } else {
        updateStatus('Annotation manager not available');
    }
};

window.deactivateTool = function() {
    if (viewer.canvasLens && viewer.canvasLens.imageViewer && viewer.canvasLens.imageViewer.annotationManager) {
        viewer.canvasLens.imageViewer.annotationManager.deactivateTool();
        updateStatus('Tool deactivated');
        // Update button states
        updateToolButtonStates(null);
    } else {
        updateStatus('Annotation manager not available');
    }
};

// Function to update tool button states
function updateToolButtonStates(activeTool) {
    const toolButtons = document.querySelectorAll('[onclick^="activateTool"], [onclick^="toggleTool"]');
    toolButtons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        const toolType = onclick.match(/activateTool\('([^']+)'\)/)?.[1] || 
                        onclick.match(/toggleTool\('([^']+)'\)/)?.[1];
        if (toolType === activeTool) {
            button.classList.add('active');
            button.classList.remove('secondary');
        } else {
            button.classList.remove('active');
            button.classList.add('secondary');
        }
    });
}

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
        buttons.toggleComparison
    ];
    allButtons.forEach(button => {
        if (button) {
            button.disabled = true;
        }
    });
    
    updateButtonStates(); // Initialize button states
    // Don't set active tool button initially since all are disabled
});
