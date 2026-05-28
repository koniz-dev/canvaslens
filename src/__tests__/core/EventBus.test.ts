import { EventBus } from '../../core/EventBus';

interface TestEvents {
  ping: string;
  count: number;
  silent: undefined;
}

describe('EventBus', () => {
  let bus: EventBus<TestEvents>;

  beforeEach(() => {
    bus = new EventBus<TestEvents>();
  });

  it('delivers payload to subscribers', () => {
    const handler = jest.fn();
    bus.on('ping', handler);
    bus.emit('ping', 'hello');
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('supports multiple subscribers per event', () => {
    const a = jest.fn();
    const b = jest.fn();
    bus.on('count', a);
    bus.on('count', b);
    bus.emit('count', 7);
    expect(a).toHaveBeenCalledWith(7);
    expect(b).toHaveBeenCalledWith(7);
  });

  it('unsubscribes via returned function', () => {
    const handler = jest.fn();
    const off = bus.on('ping', handler);
    off();
    bus.emit('ping', 'x');
    expect(handler).not.toHaveBeenCalled();
  });

  it('once: handler only fires for first emit', () => {
    const handler = jest.fn();
    bus.once('count', handler);
    bus.emit('count', 1);
    bus.emit('count', 2);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1);
  });

  it('off() removes a specific handler only', () => {
    const a = jest.fn();
    const b = jest.fn();
    bus.on('count', a);
    bus.on('count', b);
    bus.off('count', a);
    bus.emit('count', 9);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith(9);
  });

  it('isolates handler exceptions', () => {
    const failing = jest.fn(() => {
      throw new Error('boom');
    });
    const ok = jest.fn();
    bus.on('ping', failing);
    bus.on('ping', ok);
    bus.emit('ping', 'x');
    expect(failing).toHaveBeenCalled();
    expect(ok).toHaveBeenCalled();
  });

  it('emit is safe when there are no subscribers', () => {
    expect(() => bus.emit('ping', 'x')).not.toThrow();
  });

  it('handlers can subscribe/unsubscribe during emit without affecting iteration', () => {
    const order: string[] = [];
    const a = () => {
      order.push('a');
      bus.on('ping', c);
    };
    const b = () => {
      order.push('b');
    };
    const c = () => {
      order.push('c');
    };
    bus.on('ping', a);
    bus.on('ping', b);
    bus.emit('ping', 'first');
    expect(order).toEqual(['a', 'b']);

    order.length = 0;
    bus.emit('ping', 'second');
    expect(order).toContain('c');
  });

  it('clear() removes all listeners for an event', () => {
    const a = jest.fn();
    const b = jest.fn();
    bus.on('count', a);
    bus.on('count', b);
    bus.clear('count');
    bus.emit('count', 1);
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('clear() with no args removes everything', () => {
    const a = jest.fn();
    const b = jest.fn();
    bus.on('count', a);
    bus.on('ping', b);
    bus.clear();
    bus.emit('count', 1);
    bus.emit('ping', 'x');
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('count() reports subscriber count per event', () => {
    expect(bus.count('ping')).toBe(0);
    const off1 = bus.on('ping', jest.fn());
    const off2 = bus.on('ping', jest.fn());
    expect(bus.count('ping')).toBe(2);
    off1();
    expect(bus.count('ping')).toBe(1);
    off2();
    expect(bus.count('ping')).toBe(0);
  });

  it('supports undefined-payload events', () => {
    const handler = jest.fn();
    bus.on('silent', handler);
    bus.emit('silent', undefined);
    expect(handler).toHaveBeenCalledWith(undefined);
  });
});
