import { OverlayShell } from '../../ui/OverlayShell';

describe('OverlayShell', () => {
  afterEach(() => {
    // Defensive cleanup in case a test forgets to destroy()
    document.querySelectorAll('.canvaslens-overlay-backdrop').forEach((n) => n.remove());
  });

  it('mounts a backdrop and canvas frame on construction', () => {
    const onClose = jest.fn();
    const shell = new OverlayShell({ onClose });
    expect(document.querySelector('.canvaslens-overlay-backdrop')).toBe(shell.backdrop);
    expect(shell.canvasFrame.parentNode).toBe(shell.backdrop);
    shell.destroy();
  });

  it('close button click invokes onClose', () => {
    const onClose = jest.fn();
    const shell = new OverlayShell({ onClose });
    const btn = shell.backdrop.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(onClose).toHaveBeenCalled();
    shell.destroy();
  });

  it('Escape key invokes onClose', () => {
    const onClose = jest.fn();
    const shell = new OverlayShell({ onClose });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalled();
    shell.destroy();
  });

  it('clicking on the backdrop (but not its children) invokes onClose', () => {
    const onClose = jest.fn();
    const shell = new OverlayShell({ onClose });
    shell.backdrop.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    expect(onClose).toHaveBeenCalled();
    shell.destroy();
  });

  it('show / hide toggles backdrop display', () => {
    const shell = new OverlayShell({ onClose: jest.fn() });
    shell.hide();
    expect(shell.backdrop.style.display).toBe('none');
    shell.show();
    expect(shell.backdrop.style.display).toBe('flex');
    shell.destroy();
  });

  it('destroy() removes backdrop and listeners', () => {
    const onClose = jest.fn();
    const shell = new OverlayShell({ onClose });
    shell.destroy();
    expect(document.querySelector('.canvaslens-overlay-backdrop')).toBeNull();
    // Esc after destroy should not fire onClose any more
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('destroy() is idempotent', () => {
    const shell = new OverlayShell({ onClose: jest.fn() });
    shell.destroy();
    expect(() => shell.destroy()).not.toThrow();
  });
});
