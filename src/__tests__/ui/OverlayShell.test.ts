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

  it('frame background defaults to white', () => {
    const shell = new OverlayShell({ onClose: jest.fn() });
    // jsdom normalises `background: white;` to either 'white' or 'rgb(...)' depending
    // on parsing — both are accepted as 'has-bg'.
    expect(shell.canvasFrame.style.background).toMatch(/white|rgb\(255,\s*255,\s*255\)/);
    shell.destroy();
  });

  it('frameBackground="transparent" leaves the inner frame see-through', () => {
    const shell = new OverlayShell({ onClose: jest.fn(), frameBackground: 'transparent' });
    expect(shell.canvasFrame.style.background).toBe('');
    shell.destroy();
  });

  it('frameBackground=null / "" / "none" also skip the frame fill', () => {
    for (const v of [null, '', 'none'] as const) {
      const shell = new OverlayShell({ onClose: jest.fn(), frameBackground: v });
      expect(shell.canvasFrame.style.background).toBe('');
      shell.destroy();
    }
  });

  it('custom frame background is honoured', () => {
    const shell = new OverlayShell({ onClose: jest.fn(), frameBackground: '#123456' });
    expect(shell.canvasFrame.style.background).toMatch(/#123456|rgb\(18,\s*52,\s*86\)/);
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
