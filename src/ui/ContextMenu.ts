/**
 * Lightweight DOM context menu. Replaces the inline DOM building that used
 * to live inside AnnotationManager.showContextMenu.
 *
 * @example
 * ```ts
 * ContextMenu.show({
 *   x: event.clientX,
 *   y: event.clientY,
 *   items: [{ label: 'Delete', onClick: () => removeAnnotation(id) }]
 * });
 * ```
 */
export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  /** Optional class applied to the item element. */
  className?: string;
}

export interface ContextMenuOptions {
  /** Viewport x coordinate where the menu's top-left should land. */
  x: number;
  /** Viewport y coordinate. */
  y: number;
  items: ContextMenuItem[];
  /** Where to mount; defaults to document.body. */
  parent?: HTMLElement;
}

const MENU_STYLE = `
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
  padding: 4px 0;
  min-width: 120px;
`;

const ITEM_STYLE = `
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
`;

export class ContextMenu {
  private el: HTMLDivElement;
  private parent: HTMLElement;
  private documentClickHandler: (e: Event) => void;
  private closed = false;

  private constructor(el: HTMLDivElement, parent: HTMLElement) {
    this.el = el;
    this.parent = parent;
    this.documentClickHandler = (e: Event) => {
      if (!this.el.contains(e.target as Node)) this.close();
    };
    // Defer until the originating click has finished bubbling, otherwise
    // the very click that opened the menu would immediately close it.
    requestAnimationFrame(() => {
      if (!this.closed) document.addEventListener('click', this.documentClickHandler);
    });
  }

  static show(options: ContextMenuOptions): ContextMenu {
    const parent = options.parent ?? document.body;
    const el = document.createElement('div');
    el.className = 'annotation-context-menu';
    el.style.cssText = `${MENU_STYLE} top: ${options.y}px; left: ${options.x}px;`;

    const menu = new ContextMenu(el, parent);

    for (const item of options.items) {
      const node = document.createElement('div');
      node.textContent = item.label;
      node.style.cssText = ITEM_STYLE;
      if (item.className) node.classList.add(item.className);
      node.addEventListener('click', () => {
        item.onClick();
        menu.close();
      });
      node.addEventListener('mouseenter', () => {
        node.style.backgroundColor = '#f0f0f0';
      });
      node.addEventListener('mouseleave', () => {
        node.style.backgroundColor = 'transparent';
      });
      el.appendChild(node);
    }

    parent.appendChild(el);
    return menu;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    document.removeEventListener('click', this.documentClickHandler);
    if (this.el.parentNode === this.parent) {
      this.parent.removeChild(this.el);
    }
  }

  isOpen(): boolean {
    return !this.closed;
  }
}
