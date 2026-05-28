import type { AppEvents } from '../../core/AppEvents';
import { EventBus } from '../../core/EventBus';
import { KeyboardInput } from '../../input/KeyboardInput';

describe('KeyboardInput', () => {
  let bus: EventBus<AppEvents>;

  beforeEach(() => {
    bus = new EventBus<AppEvents>();
  });

  it('attaches a keydown listener that emits key:down on the bus', () => {
    const kb = new KeyboardInput(bus);
    const handler = jest.fn();
    bus.on('key:down', handler);

    kb.attach();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]![0].key).toBe('Escape');
    kb.detach();
  });

  it('detach stops emission', () => {
    const kb = new KeyboardInput(bus);
    const handler = jest.fn();
    bus.on('key:down', handler);

    kb.attach();
    kb.detach();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('attach is idempotent', () => {
    const kb = new KeyboardInput(bus);
    kb.attach();
    kb.attach();
    expect(kb.isAttached()).toBe(true);
    const handler = jest.fn();
    bus.on('key:down', handler);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(handler).toHaveBeenCalledTimes(1);
    kb.detach();
  });

  it('supports a custom target element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const kb = new KeyboardInput(bus, el);
    const handler = jest.fn();
    bus.on('key:down', handler);

    kb.attach();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'X' }));
    expect(handler).toHaveBeenCalled();
    kb.detach();
    el.remove();
  });
});
