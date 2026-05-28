import { error } from '../utils/core/logger';

export type EventMap = Record<string, unknown>;
export type Handler<T> = (payload: T) => void;
export type Unsubscribe = () => void;

export class EventBus<E extends EventMap> {
  private handlers: Map<keyof E, Set<Handler<unknown>>> = new Map();

  on<K extends keyof E>(event: K, handler: Handler<E[K]>): Unsubscribe {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as Handler<unknown>);
    return () => this.off(event, handler);
  }

  once<K extends keyof E>(event: K, handler: Handler<E[K]>): Unsubscribe {
    const wrapped: Handler<E[K]> = (payload) => {
      this.off(event, wrapped);
      handler(payload);
    };
    return this.on(event, wrapped);
  }

  off<K extends keyof E>(event: K, handler: Handler<E[K]>): void {
    const set = this.handlers.get(event);
    if (!set) return;
    set.delete(handler as Handler<unknown>);
    if (set.size === 0) this.handlers.delete(event);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const set = this.handlers.get(event);
    if (!set || set.size === 0) return;
    // Snapshot so handlers may add/remove during emit without affecting iteration.
    const snapshot = Array.from(set);
    for (const handler of snapshot) {
      try {
        handler(payload);
      } catch (err) {
        // Isolate handler failures.
        error(`[EventBus] handler for "${String(event)}" threw:`, err);
      }
    }
  }

  clear(event?: keyof E): void {
    if (event === undefined) {
      this.handlers.clear();
    } else {
      this.handlers.delete(event);
    }
  }

  count(event: keyof E): number {
    return this.handlers.get(event)?.size ?? 0;
  }
}
