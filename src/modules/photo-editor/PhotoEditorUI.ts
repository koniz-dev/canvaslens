import { PhotoEditorManager } from './PhotoEditorManager';
import { PhotoEditorState, PhotoEditorTool } from './types';

export class PhotoEditorUI {
  private manager: PhotoEditorManager;
  private container: HTMLElement;
  private overlay: HTMLElement | null = null;
  private toolPanel: HTMLElement | null = null;
  private sliderPanel: HTMLElement | null = null;
  private currentState: PhotoEditorState;

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
      this.showOverlay();
      this.renderToolPanel();
      this.renderSliderPanel();
    } else {
      this.hideOverlay();
    }
  }

  /**
   * Handle image updates
   */
  private onImageUpdate(imageData: ImageData): void {
    // This will be handled by the main CanvasLens instance
    // We just need to notify that image data has changed
  }

  /**
   * Show overlay
   */
  private showOverlay(): void {
    if (this.overlay) return;

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
      align-items: center;
      justify-content: center;
    `;

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
    if (this.toolPanel) {
      this.toolPanel.remove();
      this.toolPanel = null;
    }
    if (this.sliderPanel) {
      this.sliderPanel.remove();
      this.sliderPanel = null;
    }
  }

  /**
   * Render tool panel
   */
  private renderToolPanel(): void {
    if (this.toolPanel) {
      this.toolPanel.remove();
    }

    this.toolPanel = document.createElement('div');
    this.toolPanel.className = 'canvaslens-photo-editor-tool-panel';
    this.toolPanel.style.cssText = `
      position: absolute;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      min-width: 200px;
    `;

    const toolConfigs = this.manager.getToolConfigs();
    
    toolConfigs.forEach(config => {
      const toolBtn = document.createElement('button');
      toolBtn.className = 'canvaslens-tool-btn';
      toolBtn.innerHTML = `
        <div style="font-size: 20px; margin-bottom: 4px;">${config.icon}</div>
        <div style="font-size: 12px;">${config.name}</div>
      `;
      toolBtn.style.cssText = `
        display: block;
        width: 100%;
        padding: 12px 8px;
        margin-bottom: 8px;
        background: ${this.currentState.currentTool === config.id ? '#4a90e2' : '#3a3a3a'};
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        text-align: center;
        transition: background-color 0.2s;
      `;
      
      toolBtn.onclick = () => this.manager.setTool(config.id);
      toolBtn.onmouseenter = () => {
        if (this.currentState.currentTool !== config.id) {
          toolBtn.style.backgroundColor = '#4a4a4a';
        }
      };
      toolBtn.onmouseleave = () => {
        if (this.currentState.currentTool !== config.id) {
          toolBtn.style.backgroundColor = '#3a3a3a';
        }
      };

      if (this.toolPanel) {
        this.toolPanel.appendChild(toolBtn);
      }
    });

    if (this.overlay) {
      this.overlay.appendChild(this.toolPanel);
    }
  }

  /**
   * Render slider panel
   */
  private renderSliderPanel(): void {
    if (this.sliderPanel) {
      this.sliderPanel.remove();
    }

    this.sliderPanel = document.createElement('div');
    this.sliderPanel.className = 'canvaslens-photo-editor-slider-panel';
    this.sliderPanel.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      min-width: 400px;
      max-width: 600px;
    `;

    const sliderConfigs = this.manager.getSliderConfigs();
    
    if (sliderConfigs.length === 0) {
      const noSliders = document.createElement('div');
      noSliders.innerHTML = `
        <div style="text-align: center; color: #888; padding: 20px;">
          <div style="font-size: 24px; margin-bottom: 8px;">${this.getToolIcon()}</div>
          <div>No adjustments available for this tool</div>
        </div>
      `;
      this.sliderPanel.appendChild(noSliders);
    } else {
      sliderConfigs.forEach(config => {
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
        label.innerHTML = `
          <span style="margin-right: 8px; font-size: 16px;">${config.icon}</span>
          <span>${config.name}</span>
          <span style="margin-left: auto; color: #888;" id="value-${config.id}">0</span>
        `;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = config.min.toString();
        slider.max = config.max.toString();
        slider.step = config.step.toString();
        slider.value = this.getCurrentValue(config.id).toString();
        slider.style.cssText = `
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: #4a4a4a;
          outline: none;
          -webkit-appearance: none;
        `;

        // Custom slider styling
        slider.style.setProperty('--slider-color', '#4a90e2');
        
        // Add CSS for custom slider
        if (!document.getElementById('canvaslens-slider-styles')) {
          const style = document.createElement('style');
          style.id = 'canvaslens-slider-styles';
          style.textContent = `
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: var(--slider-color, #4a90e2);
              cursor: pointer;
            }
            input[type="range"]::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: var(--slider-color, #4a90e2);
              cursor: pointer;
              border: none;
            }
          `;
          document.head.appendChild(style);
        }

        slider.oninput = (e) => {
          const value = parseInt((e.target as HTMLInputElement).value);
          this.updateValue(config.id, value);
          const valueElement = document.getElementById(`value-${config.id}`);
          if (valueElement) {
            valueElement.textContent = value.toString();
          }
        };

        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        if (this.sliderPanel) {
          this.sliderPanel.appendChild(sliderContainer);
        }
      });
    }

    if (this.overlay) {
      this.overlay.appendChild(this.sliderPanel);
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
   * Get tool icon for current tool
   */
  private getToolIcon(): string {
    const toolConfigs = this.manager.getToolConfigs();
    const currentTool = toolConfigs.find(tool => tool.id === this.currentState.currentTool);
    return currentTool?.icon || '⚙️';
  }

  /**
   * Destroy UI
   */
  destroy(): void {
    this.hideOverlay();
  }
}
