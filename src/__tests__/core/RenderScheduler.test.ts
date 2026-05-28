import { RenderScheduler } from '../../core/RenderScheduler';

describe('RenderScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const flushRaf = () => {
    jest.advanceTimersByTime(16);
  };

  it('schedules render exactly once per frame regardless of request count', () => {
    const render = jest.fn();
    const scheduler = new RenderScheduler(render);
    scheduler.request('a');
    scheduler.request('b');
    scheduler.request('c');
    expect(render).not.toHaveBeenCalled();
    flushRaf();
    expect(render).toHaveBeenCalledTimes(1);
    const reasons = render.mock.calls[0]![0] as Set<string>;
    expect(reasons.has('a')).toBe(true);
    expect(reasons.has('b')).toBe(true);
    expect(reasons.has('c')).toBe(true);
  });

  it('allows another render to be scheduled after current frame completes', () => {
    const render = jest.fn();
    const scheduler = new RenderScheduler(render);
    scheduler.request();
    flushRaf();
    scheduler.request();
    flushRaf();
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('cancel() prevents pending render', () => {
    const render = jest.fn();
    const scheduler = new RenderScheduler(render);
    scheduler.request('a');
    scheduler.cancel();
    flushRaf();
    expect(render).not.toHaveBeenCalled();
  });

  it('flush() runs render synchronously with queued reasons', () => {
    const render = jest.fn();
    const scheduler = new RenderScheduler(render);
    scheduler.request('foo');
    scheduler.flush();
    expect(render).toHaveBeenCalledTimes(1);
    flushRaf();
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('flush() is a no-op when nothing pending', () => {
    const render = jest.fn();
    const scheduler = new RenderScheduler(render);
    scheduler.flush();
    expect(render).not.toHaveBeenCalled();
  });

  it('isPending reflects scheduler state', () => {
    const scheduler = new RenderScheduler(jest.fn());
    expect(scheduler.isPending()).toBe(false);
    scheduler.request();
    expect(scheduler.isPending()).toBe(true);
    flushRaf();
    expect(scheduler.isPending()).toBe(false);
  });

  it('destroy() prevents any further renders', () => {
    const render = jest.fn();
    const scheduler = new RenderScheduler(render);
    scheduler.request();
    scheduler.destroy();
    flushRaf();
    expect(render).not.toHaveBeenCalled();

    scheduler.request();
    flushRaf();
    expect(render).not.toHaveBeenCalled();
  });

  it('forwards an empty reason set when no reasons given', () => {
    const render = jest.fn();
    const scheduler = new RenderScheduler(render);
    scheduler.request();
    flushRaf();
    const reasons = render.mock.calls[0]![0] as Set<string>;
    expect(reasons.size).toBe(0);
  });
});
