import { PhotoEditorManager } from './PhotoEditorManager';
import { PhotoEditorState, PhotoEditorTool } from './types';

export class PhotoEditorUI {
  private manager: PhotoEditorManager;
  private container: HTMLElement;
  private overlay: HTMLElement | null = null;
  private mainToolbar: HTMLElement | null = null;
  private editPanel: HTMLElement | null = null;
  private imageContainer: HTMLElement | null = null;
  private currentState: PhotoEditorState;
  private currentMainTool: string = 'light'; // Start with 'light' instead of 'auto'

  constructor(manager: PhotoEditorManager, container: HTMLElement) {
    this.manager = manager;
    this.container = container;
    this.currentState = manager.getState();

    // Subscribe to state changes
    this.manager.setCallbacks(
      (state) => this.onStateChange(state),
      (imageData) => this.onImageUpdate(imageData)
    );
  }

  /**
   * Handle state changes
   */
  private onStateChange(state: PhotoEditorState): void {
    this.currentState = state;
    
    if (state.isOpen) {
      // Don't reset currentMainTool when opening - let user choose
      this.showOverlay();
      this.renderEditPanel();
    } else {
      this.hideOverlay();
    }
  }

  /**
   * Handle image updates
   */
  private onImageUpdate(imageData: ImageData): void {
    // Update the image in the overlay container with the modified image data
    this.updateOverlayImage(imageData);
  }

  /**
   * Update image in overlay container with modified image data
   */
  private updateOverlayImage(imageData: ImageData): void {
    if (!this.imageContainer) return;

    // Create a temporary canvas to convert ImageData back to image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    // Convert canvas to image and update the overlay
    const img = new Image();
    img.onload = () => {
      // Remove placeholder
      const placeholder = document.getElementById('canvaslens-image-placeholder');
      if (placeholder) {
        placeholder.remove();
      }

      // Remove existing image if any
      const existingImg = this.imageContainer!.querySelector('img');
      if (existingImg) {
        existingImg.remove();
      }

      // Add new modified image
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 4px;
        display: block;
      `;
      
      this.imageContainer!.appendChild(img);
    };
    img.src = canvas.toDataURL();
  }

  /**
   * Load image into the overlay container
   */
  loadImageToContainer(imageElement: HTMLImageElement): void {
    if (!this.imageContainer) return;

    // Convert HTMLImageElement to ImageData first
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.loadImageDataToContainer(imageData);
  }

  /**
   * Load ImageData into the overlay container
   */
  loadImageDataToContainer(imageData: ImageData): void {
    if (!this.imageContainer) {
      console.error('Image container not found!');
      return;
    }

    console.log('Loading image data:', imageData.width, 'x', imageData.height);

    // Remove placeholder
    const placeholder = document.getElementById('canvaslens-image-placeholder');
    if (placeholder) {
      console.log('Removing placeholder');
      placeholder.remove();
    }

    // Remove existing image if any
    const existingImg = this.imageContainer.querySelector('img');
    if (existingImg) {
      console.log('Removing existing image');
      existingImg.remove();
    }

    // Create a temporary canvas to convert ImageData to image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    console.log('Canvas created:', canvas.width, 'x', canvas.height);

    // Convert canvas to image and add to container
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully:', img.naturalWidth, 'x', img.naturalHeight);
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 4px;
        display: block;
      `;
      
      this.imageContainer!.appendChild(img);
      console.log('Image added to container');
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };
    
    const dataUrl = canvas.toDataURL();
    console.log('Data URL created, length:', dataUrl.length);
    img.src = dataUrl;
  }

  /**
   * Show overlay
   */
  private showOverlay(): void {
    if (this.overlay) {
      return;
    }
    this.overlay = document.createElement('div');
    this.overlay.className = 'canvaslens-photo-editor-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    `;

    // Add image container in the center
    this.imageContainer = document.createElement('div');
    this.imageContainer.className = 'canvaslens-photo-editor-image-container';
    this.imageContainer.style.cssText = `
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      background-color: #1a1a1a;
    `;

    // Add placeholder text for image (will be replaced when image loads)
    const placeholder = document.createElement('div');
    placeholder.id = 'canvaslens-image-placeholder';
    placeholder.innerHTML = '🖼️ Image will be displayed here';
    placeholder.style.cssText = `
      color: #666;
      font-size: 18px;
      text-align: center;
    `;
    this.imageContainer.appendChild(placeholder);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      z-index: 1001;
    `;
    closeBtn.onclick = () => this.manager.close();

    this.overlay.appendChild(this.imageContainer);
    this.overlay.appendChild(closeBtn);
    document.body.appendChild(this.overlay);
  }

  /**
   * Hide overlay
   */
  private hideOverlay(): void {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
    }
    if (this.editPanel) {
      this.editPanel.remove();
      this.editPanel = null;
    }
  }

  /**
   * Render main toolbar at the top
   */
  private renderMainToolbar(): void {
    if (this.mainToolbar) {
      this.mainToolbar.remove();
    }

    console.log('Rendering main toolbar, current tool:', this.currentMainTool);

    this.mainToolbar = document.createElement('div');
    this.mainToolbar.className = 'canvaslens-photo-editor-main-toolbar';
    this.mainToolbar.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      display: flex;
      gap: 8px;
    `;

    // Only show tools that are actually available in the photo editor module
    const tools = [
      { id: 'light', name: 'Light', icon: '☀️' },
      { id: 'color', name: 'Color', icon: '🎨' },
      { id: 'retouching', name: 'Retouch', icon: '🩹' },
      { id: 'effects', name: 'Effects', icon: '✨' },
      { id: 'info', name: 'Info', icon: 'ℹ️' }
    ];

    tools.forEach(tool => {
      const toolBtn = document.createElement('button');
      toolBtn.className = 'canvaslens-main-tool-btn';
      toolBtn.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 4px;">${tool.icon}</div>
        <div style="font-size: 10px;">${tool.name}</div>
      `;
      
      const isSelected = this.currentMainTool === tool.id;
      console.log(`Tool ${tool.id} selected:`, isSelected);
      
      toolBtn.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        background-color: ${isSelected ? '#4a90e2' : '#3a3a3a'};
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-size: 10px;
        transition: background-color 0.2s;
      `;
      
      toolBtn.onmouseenter = () => {
        if (!isSelected) {
          toolBtn.style.backgroundColor = '#4a4a4a';
        }
      };
      
      toolBtn.onmouseleave = () => {
        if (!isSelected) {
          toolBtn.style.backgroundColor = '#3a3a3a';
        }
      };
      
      toolBtn.onclick = () => this.selectMainTool(tool.id);
      
      if (this.mainToolbar) {
        this.mainToolbar.appendChild(toolBtn);
      }
    });

    if (this.overlay) {
      this.overlay.appendChild(this.mainToolbar);
    }
  }

  /**
   * Render edit panel based on selected main tool
   */
  private renderEditPanel(): void {
    if (this.editPanel) {
      this.editPanel.remove();
    }

    console.log('Rendering edit panel for tool:', this.currentMainTool);

    this.editPanel = document.createElement('div');
    this.editPanel.className = 'canvaslens-photo-editor-edit-panel';
    this.editPanel.style.cssText = `
      position: absolute;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      width: 280px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    // Create panel header with tabs
    this.createPanelHeaderWithTabs();
    
    // Create panel content based on selected tool
    this.createPanelContent();
    
    // Add action buttons
    this.createActionButtons();
    
    if (this.overlay) {
      this.overlay.appendChild(this.editPanel);
    }
  }

  /**
   * Create panel header with tabs
   */
  private createPanelHeaderWithTabs(): void {
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 20px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'EDIT PHOTO';
    title.style.cssText = `
      color: white;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: center;
    `;
    
    // Create tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
    `;

    const tools = [
      { id: 'light', name: 'Light', icon: '☀️' },
      { id: 'color', name: 'Color', icon: '🎨' },
      { id: 'retouching', name: 'Retouch', icon: '🩹' },
      { id: 'effects', name: 'Effects', icon: '✨' },
      { id: 'info', name: 'Info', icon: 'ℹ️' }
    ];

    tools.forEach(tool => {
      const tab = document.createElement('button');
      tab.className = 'canvaslens-tab-btn';
      tab.innerHTML = `
        <div style="font-size: 14px; margin-bottom: 2px;">${tool.icon}</div>
        <div style="font-size: 10px;">${tool.name}</div>
      `;
      
      const isSelected = this.currentMainTool === tool.id;
      
      tab.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        padding: 8px 4px;
        background-color: ${isSelected ? '#4a90e2' : '#3a3a3a'};
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 10px;
        transition: background-color 0.2s;
      `;
      
      tab.onmouseenter = () => {
        if (!isSelected) {
          tab.style.backgroundColor = '#4a4a4a';
        }
      };
      
      tab.onmouseleave = () => {
        if (!isSelected) {
          tab.style.backgroundColor = '#3a3a3a';
        }
      };
      
      tab.onclick = () => this.selectMainTool(tool.id);
      
      tabsContainer.appendChild(tab);
    });

    header.appendChild(title);
    header.appendChild(tabsContainer);
    
    if (this.editPanel) {
      this.editPanel.appendChild(header);
    }
  }

  /**
   * Create panel content based on selected tool
   */
  private createPanelContent(): void {
    const contentContainer = document.createElement('div');
    contentContainer.id = 'canvaslens-panel-content';
    
    switch (this.currentMainTool) {
      case 'light':
        console.log('Creating light adjustment sliders');
        this.createLightAdjustmentSliders(contentContainer);
        break;
      case 'color':
        console.log('Creating color adjustment sliders');
        this.createColorAdjustmentSliders(contentContainer);
        break;
      case 'retouching':
        console.log('Creating retouching tools');
        this.createRetouchingTools(contentContainer);
        break;
      case 'effects':
        console.log('Creating effects tools');
        this.createEffectsTools(contentContainer);
        break;
      case 'info':
        console.log('Creating info panel');
        this.createInfoPanel(contentContainer);
        break;
      default:
        console.log('Creating default light adjustment sliders');
        this.createLightAdjustmentSliders(contentContainer);
        break;
    }
    
    if (this.editPanel) {
      this.editPanel.appendChild(contentContainer);
    }
  }

  /**
   * Select main tool
   */
  private selectMainTool(toolId: string): void {
    console.log('Selecting main tool:', toolId);
    this.currentMainTool = toolId;
    this.renderEditPanel();
  }



  /**
   * Create light adjustment sliders
   */
  private createLightAdjustmentSliders(container: HTMLElement): void {
    const section = document.createElement('div');
    
    const adjustments = [
      { id: 'brightness', name: 'Brightness', icon: '☀️', min: -100, max: 100, step: 1, value: 0 },
      { id: 'exposure', name: 'Exposure', icon: '⚡', min: -100, max: 100, step: 1, value: 0 },
      { id: 'contrast', name: 'Contrast', icon: '⚫', min: -100, max: 100, step: 1, value: 0 },
      { id: 'highlights', name: 'Highlights', icon: '🔆', min: -100, max: 100, step: 1, value: 0 },
      { id: 'shadows', name: 'Shadows', icon: '🌑', min: -100, max: 100, step: 1, value: 0 },
      { id: 'vignette', name: 'Vignette', icon: '⭕', min: -100, max: 100, step: 1, value: 0 }
    ];

    this.createAdjustmentSliders(section, adjustments);
    if (container) {
      container.appendChild(section);
    }
  }

  /**
   * Create color adjustment sliders
   */
  private createColorAdjustmentSliders(container: HTMLElement): void {
    const section = document.createElement('div');
    
    const adjustments = [
      { id: 'saturation', name: 'Saturation', icon: '🎨', min: -100, max: 100, step: 1, value: 0 },
      { id: 'temperature', name: 'Temperature', icon: '🌡️', min: -100, max: 100, step: 1, value: 0 },
      { id: 'tint', name: 'Tint', icon: '🎭', min: -100, max: 100, step: 1, value: 0 },
      { id: 'vibrance', name: 'Vibrance', icon: '💎', min: -100, max: 100, step: 1, value: 0 }
    ];

    this.createAdjustmentSliders(section, adjustments);
    if (container) {
      container.appendChild(section);
    }
  }

  /**
   * Create retouching tools
   */
  private createRetouchingTools(container: HTMLElement): void {
    const section = document.createElement('div');
    section.innerHTML = `
      <div style="color: white; margin-bottom: 16px;">
        <p style="margin: 0 0 12px 0; font-size: 14px;">Retouching tools:</p>
        <button style="width: 100%; padding: 12px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 8px;">Spot Healing</button>
        <button style="width: 100%; padding: 12px; background: #3a3a3a; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 8px;">Clone Stamp</button>
        <button style="width: 100%; padding: 12px; background: #3a3a3a; color: white; border: none; border-radius: 4px; cursor: pointer;">Blur Tool</button>
      </div>
    `;
    if (container) {
      container.appendChild(section);
    }
  }

  /**
   * Create effects tools
   */
  private createEffectsTools(container: HTMLElement): void {
    const section = document.createElement('div');
    section.innerHTML = `
      <div style="color: white; margin-bottom: 16px;">
        <p style="margin: 0 0 12px 0; font-size: 14px;">Effects:</p>
        <button style="width: 100%; padding: 12px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 8px;">Vintage</button>
        <button style="width: 100%; padding: 12px; background: #3a3a3a; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 8px;">Black & White</button>
        <button style="width: 100%; padding: 12px; background: #3a3a3a; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 8px;">Sepia</button>
        <button style="width: 100%; padding: 12px; background: #3a3a3a; color: white; border: none; border-radius: 4px; cursor: pointer;">Dramatic</button>
      </div>
    `;
    if (container) {
      container.appendChild(section);
    }
  }

  /**
   * Create info panel
   */
  private createInfoPanel(container: HTMLElement): void {
    const section = document.createElement('div');
    section.innerHTML = `
      <div style="color: white; margin-bottom: 16px;">
        <p style="margin: 0 0 12px 0; font-size: 14px;">Image Information:</p>
        <div style="background: #3a3a3a; padding: 12px; border-radius: 4px; font-size: 12px;">
          <p style="margin: 0 0 8px 0;"><strong>Size:</strong> 800 x 600 pixels</p>
          <p style="margin: 0 0 8px 0;"><strong>Format:</strong> JPEG</p>
          <p style="margin: 0 0 8px 0;"><strong>File Size:</strong> 245 KB</p>
          <p style="margin: 0;"><strong>Color Space:</strong> sRGB</p>
        </div>
      </div>
    `;
    if (container) {
      container.appendChild(section);
    }
  }

  /**
   * Create adjustment sliders (helper method)
   */
  private createAdjustmentSliders(container: HTMLElement, adjustments: any[]): void {
    adjustments.forEach(adjustment => {
      const sliderContainer = document.createElement('div');
      sliderContainer.style.cssText = `
        margin-bottom: 16px;
      `;

      const label = document.createElement('div');
      label.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        color: white;
        font-size: 14px;
      `;
      
      const icon = document.createElement('span');
      icon.textContent = adjustment.icon;
      icon.style.cssText = `
        margin-right: 8px;
        font-size: 14px;
        width: 16px;
        text-align: center;
      `;
      
      const name = document.createElement('span');
      name.textContent = adjustment.name;
      name.style.cssText = `
        flex: 1;
      `;
      
      const value = document.createElement('span');
      value.textContent = adjustment.value.toString();
      value.style.cssText = `
        color: #888;
        font-size: 12px;
        min-width: 30px;
        text-align: right;
      `;
      value.id = `value-${adjustment.id}`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = adjustment.min.toString();
      slider.max = adjustment.max.toString();
      slider.step = adjustment.step.toString();
      slider.value = adjustment.value.toString();
      slider.style.cssText = `
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background: #4a4a4a;
        outline: none;
        -webkit-appearance: none;
      `;

      slider.oninput = (e) => {
        const newValue = parseInt((e.target as HTMLInputElement).value);
        this.updateValue(adjustment.id, newValue);
        const valueElement = document.getElementById(`value-${adjustment.id}`);
        if (valueElement) {
          valueElement.textContent = newValue.toString();
        }
      };

      label.appendChild(icon);
      label.appendChild(name);
      label.appendChild(value);
      sliderContainer.appendChild(label);
      sliderContainer.appendChild(slider);
      container.appendChild(sliderContainer);
    });
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #444;
    `;

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.style.cssText = `
      flex: 1;
      padding: 10px;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    `;
    applyBtn.onclick = () => this.applyChanges();

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
      flex: 1;
      padding: 10px;
      background-color: #666;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    `;
    cancelBtn.onclick = () => this.cancelChanges();

    buttonContainer.appendChild(applyBtn);
    buttonContainer.appendChild(cancelBtn);
    if (this.editPanel) {
      this.editPanel.appendChild(buttonContainer);
    }
  }

  /**
   * Get current value for a slider
   */
  private getCurrentValue(id: string): number {
    const adjustments = this.currentState.adjustments;
    const colorAdjustments = this.currentState.colorAdjustments;
    
    if (id in adjustments) {
      return adjustments[id as keyof typeof adjustments];
    }
    if (id in colorAdjustments) {
      return colorAdjustments[id as keyof typeof colorAdjustments];
    }
    return 0;
  }

  /**
   * Update value for a slider
   */
  private updateValue(id: string, value: number): void {
    const adjustments = this.currentState.adjustments;
    const colorAdjustments = this.currentState.colorAdjustments;
    
    if (id in adjustments) {
      this.manager.updateAdjustment(id as keyof typeof adjustments, value);
    } else if (id in colorAdjustments) {
      this.manager.updateColorAdjustment(id as keyof typeof colorAdjustments, value);
    }
  }

  /**
   * Apply changes and close overlay
   */
  private applyChanges(): void {
    // The changes are already applied to the main image through the callback
    // Just close the overlay
    this.manager.close();
  }

  /**
   * Cancel changes and close overlay
   */
  private cancelChanges(): void {
    // Reset all adjustments to original values
    this.manager.reset();
    // Close the overlay
    this.manager.close();
  }

  /**
   * Destroy UI
   */
  destroy(): void {
    this.hideOverlay();
  }
}
