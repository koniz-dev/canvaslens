import { error } from '../utils/core/logger';

export type Listener<S> = (state: S, prev: S) => void;
export type Selector<S, R> = (state: S) => R;
export type Reducer<S, A> = (state: S, action: A) => S;
export type Unsubscribe = () => void;

export class Store<S, A extends { type: string }> {
  private state: S;
  private readonly reducer: Reducer<S, A>;
  private listeners: Set<Listener<S>> = new Set();
  private dispatching = false;

  constructor(initial: S, reducer: Reducer<S, A>) {
    this.state = initial;
    this.reducer = reducer;
  }

  getState(): S {
    return this.state;
  }

  dispatch(action: A): void {
    if (this.dispatching) {
      throw new Error(`[Store] Reducers cannot dispatch. Action "${action.type}" was dispatched during a reducer.`);
    }

    let next: S;
    this.dispatching = true;
    try {
      next = this.reducer(this.state, action);
    } finally {
      this.dispatching = false;
    }

    if (next === this.state) return;

    const prev = this.state;
    this.state = next;

    const snapshot = Array.from(this.listeners);
    for (const listener of snapshot) {
      try {
        listener(next, prev);
      } catch (err) {
        error('[Store] listener threw:', err);
      }
    }
  }

  subscribe(listener: Listener<S>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  select<R>(
    selector: Selector<S, R>,
    listener: (value: R, prev: R) => void,
    equals: (a: R, b: R) => boolean = Object.is
  ): Unsubscribe {
    let lastValue = selector(this.state);
    return this.subscribe((next, prev) => {
      const nextValue = selector(next);
      if (!equals(nextValue, lastValue)) {
        const prevValue = selector(prev);
        lastValue = nextValue;
        listener(nextValue, prevValue);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}
