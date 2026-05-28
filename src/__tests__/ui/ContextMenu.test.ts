import { ContextMenu } from '../../ui/ContextMenu';

describe('ContextMenu', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.parentNode?.removeChild(container);
  });

  it('mounts to document.body by default with positioned style', () => {
    const menu = ContextMenu.show({
      x: 100,
      y: 200,
      items: [{ label: 'Delete', onClick: jest.fn() }]
    });
    const el = document.querySelector('.annotation-context-menu') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.top).toBe('200px');
    expect(el.style.left).toBe('100px');
    menu.close();
  });

  it('mounts to a custom parent when provided', () => {
    const menu = ContextMenu.show({
      x: 0,
      y: 0,
      items: [{ label: 'X', onClick: jest.fn() }],
      parent: container
    });
    expect(container.querySelector('.annotation-context-menu')).toBeTruthy();
    menu.close();
  });

  it('invokes onClick and closes the menu when an item is clicked', () => {
    const onClick = jest.fn();
    const menu = ContextMenu.show({
      x: 0,
      y: 0,
      items: [{ label: 'Delete', onClick }]
    });
    expect(menu.isOpen()).toBe(true);
    const item = document.querySelector('.annotation-context-menu div') as HTMLElement;
    item.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(menu.isOpen()).toBe(false);
  });

  it('close() removes the menu element from the DOM', () => {
    const menu = ContextMenu.show({
      x: 0,
      y: 0,
      items: [{ label: 'X', onClick: jest.fn() }]
    });
    menu.close();
    expect(document.querySelector('.annotation-context-menu')).toBeNull();
  });

  it('close() is idempotent', () => {
    const menu = ContextMenu.show({
      x: 0,
      y: 0,
      items: [{ label: 'X', onClick: jest.fn() }]
    });
    menu.close();
    expect(() => menu.close()).not.toThrow();
  });

  it('hover styles toggle on mouseenter / mouseleave', () => {
    ContextMenu.show({
      x: 0,
      y: 0,
      items: [{ label: 'X', onClick: jest.fn() }]
    });
    const item = document.querySelector('.annotation-context-menu div') as HTMLElement;
    item.dispatchEvent(new MouseEvent('mouseenter'));
    expect(item.style.backgroundColor).not.toBe('transparent');
    item.dispatchEvent(new MouseEvent('mouseleave'));
    expect(item.style.backgroundColor).toBe('transparent');
  });
});
