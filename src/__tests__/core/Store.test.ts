import { Store } from '../../core/Store';

interface CounterState {
  value: number;
  meta: { tag: string };
}

type CounterAction =
  | { type: 'inc' }
  | { type: 'add'; payload: number }
  | { type: 'set-tag'; payload: string }
  | { type: 'noop' };

const reducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'inc':
      return { ...state, value: state.value + 1 };
    case 'add':
      return { ...state, value: state.value + action.payload };
    case 'set-tag':
      if (state.meta.tag === action.payload) return state;
      return { ...state, meta: { tag: action.payload } };
    case 'noop':
      return state;
    default:
      return state;
  }
};

describe('Store', () => {
  let store: Store<CounterState, CounterAction>;

  beforeEach(() => {
    store = new Store<CounterState, CounterAction>(
      { value: 0, meta: { tag: 'init' } },
      reducer
    );
  });

  it('exposes initial state', () => {
    expect(store.getState()).toEqual({ value: 0, meta: { tag: 'init' } });
  });

  it('dispatch applies reducer and updates state', () => {
    store.dispatch({ type: 'inc' });
    expect(store.getState().value).toBe(1);
  });

  it('notifies subscribers with next and prev state', () => {
    const listener = jest.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'add', payload: 5 });
    expect(listener).toHaveBeenCalledTimes(1);
    const [next, prev] = listener.mock.calls[0]!;
    expect(next.value).toBe(5);
    expect(prev.value).toBe(0);
  });

  it('does not notify when reducer returns same state reference', () => {
    const listener = jest.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'noop' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe stops notifications', () => {
    const listener = jest.fn();
    const off = store.subscribe(listener);
    off();
    store.dispatch({ type: 'inc' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('select() invokes listener only when selected slice changes', () => {
    const valueListener = jest.fn();
    store.select((s) => s.value, valueListener);

    store.dispatch({ type: 'set-tag', payload: 'tag2' });
    expect(valueListener).not.toHaveBeenCalled();

    store.dispatch({ type: 'inc' });
    expect(valueListener).toHaveBeenCalledTimes(1);
    expect(valueListener).toHaveBeenCalledWith(1, 0);
  });

  it('select() supports custom equality', () => {
    const listener = jest.fn();
    store.select(
      (s) => s.meta,
      listener,
      (a, b) => a.tag === b.tag
    );
    store.dispatch({ type: 'set-tag', payload: 'init' });
    expect(listener).not.toHaveBeenCalled();
    store.dispatch({ type: 'set-tag', payload: 'changed' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('isolates listener exceptions', () => {
    const failing = jest.fn(() => {
      throw new Error('listener boom');
    });
    const ok = jest.fn();
    store.subscribe(failing);
    store.subscribe(ok);
    store.dispatch({ type: 'inc' });
    expect(failing).toHaveBeenCalled();
    expect(ok).toHaveBeenCalled();
  });

  it('throws when dispatch is called from inside reducer', () => {
    const recursiveStore = new Store<CounterState, CounterAction>(
      { value: 0, meta: { tag: 'init' } },
      (state, action) => {
        if (action.type === 'inc') {
          recursiveStore.dispatch({ type: 'inc' });
        }
        return state;
      }
    );
    expect(() => recursiveStore.dispatch({ type: 'inc' })).toThrow(/Reducers cannot dispatch/);
  });

  it('clear() removes all listeners', () => {
    const a = jest.fn();
    const b = jest.fn();
    store.subscribe(a);
    store.subscribe(b);
    store.clear();
    store.dispatch({ type: 'inc' });
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('subscribers added during emit do not fire for current dispatch', () => {
    const late = jest.fn();
    const first = jest.fn(() => {
      store.subscribe(late);
    });
    store.subscribe(first);
    store.dispatch({ type: 'inc' });
    expect(first).toHaveBeenCalledTimes(1);
    expect(late).not.toHaveBeenCalled();

    store.dispatch({ type: 'inc' });
    expect(late).toHaveBeenCalledTimes(1);
  });
});
