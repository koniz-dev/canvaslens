import type { AppEvents } from '../core/AppEvents';
import type { EventBus } from '../core/EventBus';

/**
 * Centralised keyboard input adapter. Listens to `keydown` on `document`
 * (or a custom target) and emits a typed `key:down` event on the bus.
 * Modules subscribe to the bus instead of registering their own keyboard
 * listeners — this removes scattered `addEventListener('keydown', …)`
 * calls and centralises shortcut handling.
 *
 * @example
 * ```ts
 * const kb = new KeyboardInput(app.bus);
 * app.bus.on('key:down', (e) => {
 *   if (e.key === 'Escape') app.deactivateTool();
 * });
 * kb.attach();
 * ```
 */
export class KeyboardInput {
  private bus: EventBus<AppEvents>;
  private target: HTMLElement | Document;
  private attached = false;
  private readonly handler: (event: KeyboardEvent) => void;

  constructor(bus: EventBus<AppEvents>, target: HTMLElement | Document = document) {
    this.bus = bus;
    this.target = target;
    this.handler = (event: KeyboardEvent) => this.bus.emit('key:down', event);
  }

  attach(): void {
    if (this.attached) return;
    this.target.addEventListener('keydown', this.handler as EventListener);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    this.target.removeEventListener('keydown', this.handler as EventListener);
    this.attached = false;
  }

  isAttached(): boolean {
    return this.attached;
  }
}
