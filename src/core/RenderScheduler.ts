export type RenderFn = (reasons: ReadonlySet<string>) => void;

export class RenderScheduler {
  private readonly render: RenderFn;
  private rafId: number | null = null;
  private reasons: Set<string> = new Set();
  private destroyed = false;

  constructor(render: RenderFn) {
    this.render = render;
  }

  request(reason?: string): void {
    if (this.destroyed) return;
    if (reason) this.reasons.add(reason);
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      const reasons = this.reasons;
      this.reasons = new Set();
      this.render(reasons);
    });
  }

  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.reasons.clear();
  }

  /** Force a synchronous render for the queued reasons. Used by tests and forced flushes. */
  flush(): void {
    if (this.rafId === null) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
    const reasons = this.reasons;
    this.reasons = new Set();
    this.render(reasons);
  }

  isPending(): boolean {
    return this.rafId !== null;
  }

  destroy(): void {
    this.cancel();
    this.destroyed = true;
  }
}
