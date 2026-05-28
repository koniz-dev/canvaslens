import { ErrorPlaceholder } from '../../ui/ErrorPlaceholder';

describe('ErrorPlaceholder', () => {
  let parent: HTMLDivElement;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  afterEach(() => {
    parent.parentNode?.removeChild(parent);
  });

  it('renders default title / icon when none provided', () => {
    ErrorPlaceholder.show({ parent });
    const el = parent.querySelector('.canvaslens-error-placeholder');
    expect(el).toBeTruthy();
    expect(parent.textContent).toContain('Failed to load image');
    expect(parent.textContent).toContain('⚠️');
  });

  it('uses provided title / detail / icon', () => {
    ErrorPlaceholder.show({
      parent,
      title: 'Something broke',
      detail: 'https://bad.url',
      icon: '💥'
    });
    expect(parent.textContent).toContain('💥');
    expect(parent.textContent).toContain('Something broke');
    expect(parent.textContent).toContain('https://bad.url');
  });

  it('clears existing children before mounting', () => {
    const stale = document.createElement('span');
    stale.textContent = 'stale';
    parent.appendChild(stale);
    ErrorPlaceholder.show({ parent });
    expect(parent.querySelector('span')).toBeNull();
  });

  it('destroy() removes the placeholder', () => {
    const ph = ErrorPlaceholder.show({ parent });
    ph.destroy();
    expect(parent.querySelector('.canvaslens-error-placeholder')).toBeNull();
  });
});
