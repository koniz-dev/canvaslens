/**
 * Renders an image-load failure placeholder into a container. Replaces the
 * inline DOM building that used to live in CanvasLensCore.showImageLoadError.
 */
export interface ErrorPlaceholderOptions {
  parent: HTMLElement;
  /** Headline (e.g. 'Failed to load image'). */
  title?: string;
  /** Subtext, typically the image URL that failed. */
  detail?: string;
  /** Emoji or character icon shown above the title. */
  icon?: string;
}

const WRAPPER_STYLE = `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #666;
  font-family: Arial, sans-serif;
  text-align: center;
  flex-direction: column;
`;

export class ErrorPlaceholder {
  private el: HTMLDivElement;
  private parent: HTMLElement;

  private constructor(el: HTMLDivElement, parent: HTMLElement) {
    this.el = el;
    this.parent = parent;
  }

  static show(options: ErrorPlaceholderOptions): ErrorPlaceholder {
    const { parent } = options;
    const wrapper = document.createElement('div');
    wrapper.className = 'canvaslens-error-placeholder';
    wrapper.style.cssText = WRAPPER_STYLE;

    const icon = document.createElement('div');
    icon.textContent = options.icon ?? '⚠️';
    icon.style.cssText = 'font-size: 24px; margin-bottom: 10px;';
    wrapper.appendChild(icon);

    const title = document.createElement('div');
    title.textContent = options.title ?? 'Failed to load image';
    title.style.cssText = 'font-size: 16px; margin-bottom: 5px;';
    wrapper.appendChild(title);

    if (options.detail) {
      const detail = document.createElement('div');
      detail.textContent = options.detail;
      detail.style.cssText = 'font-size: 12px; color: #999;';
      wrapper.appendChild(detail);
    }

    // Clear any existing children in the parent before mounting.
    while (parent.firstChild) parent.removeChild(parent.firstChild);
    parent.appendChild(wrapper);

    return new ErrorPlaceholder(wrapper, parent);
  }

  destroy(): void {
    if (this.el.parentNode === this.parent) {
      this.parent.removeChild(this.el);
    }
  }
}
