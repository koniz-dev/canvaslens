import { warn } from '../../../utils/core/logger';
import type { ToolPlugin } from './ToolPlugin';

/**
 * Registry of available tool plugins. Lookups are by `plugin.type`.
 *
 * The registry is intentionally tiny: it is a thin layer over a Map so the
 * AnnotationToolsController can construct tool instances from whatever set
 * of plugins the App has been given.
 */
export class ToolRegistry {
  private plugins: Map<string, ToolPlugin> = new Map();

  constructor(initial?: Iterable<ToolPlugin>) {
    if (initial) for (const p of initial) this.register(p);
  }

  register(plugin: ToolPlugin): void {
    if (this.plugins.has(plugin.type)) {
      warn(`[ToolRegistry] overriding plugin "${plugin.type}"`);
    }
    this.plugins.set(plugin.type, plugin);
  }

  unregister(type: string): boolean {
    return this.plugins.delete(type);
  }

  get(type: string): ToolPlugin | undefined {
    return this.plugins.get(type);
  }

  has(type: string): boolean {
    return this.plugins.has(type);
  }

  list(): ToolPlugin[] {
    return Array.from(this.plugins.values());
  }

  size(): number {
    return this.plugins.size;
  }

  clear(): void {
    this.plugins.clear();
  }
}
