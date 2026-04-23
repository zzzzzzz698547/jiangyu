const aiServiceUrl =
  (import.meta.env.VITE_AI_SERVICE_URL as string | undefined)?.trim() ||
  'about:blank';

let stylesInjected = false;
let panelMounted = false;
let isOpen = false;

function injectStyles() {
  if (stylesInjected) {
    return;
  }

  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    .jiangyu-ai-backdrop {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: rgba(2, 6, 23, 0.55);
      backdrop-filter: blur(10px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease;
    }

    .jiangyu-ai-backdrop[data-open="true"] {
      opacity: 1;
      pointer-events: auto;
    }

    .jiangyu-ai-panel {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 81;
      width: min(92vw, 420px);
      height: min(82vh, 720px);
      border-radius: 28px;
      background: #ffffff;
      border: 1px solid rgba(148, 163, 184, 0.28);
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(12px) scale(0.98);
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    .jiangyu-ai-panel[data-open="true"] {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .jiangyu-ai-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(226, 232, 240, 0.9);
      background: #fff;
    }

    .jiangyu-ai-eyebrow {
      margin: 0;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #0369a1;
    }

    .jiangyu-ai-title {
      margin: 4px 0 0;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .jiangyu-ai-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .jiangyu-ai-link,
    .jiangyu-ai-close {
      border: 1px solid rgba(226, 232, 240, 1);
      background: #fff;
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      border-radius: 9999px;
      padding: 8px 12px;
      cursor: pointer;
      text-decoration: none;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
    }

    .jiangyu-ai-link:hover,
    .jiangyu-ai-close:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: rgba(203, 213, 225, 1);
    }

    .jiangyu-ai-close {
      width: 32px;
      height: 32px;
      padding: 0;
      display: grid;
      place-items: center;
      font-size: 18px;
      line-height: 1;
    }

    .jiangyu-ai-frameWrap {
      flex: 1;
      background: #f8fafc;
    }

    .jiangyu-ai-frame {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: #fff;
    }

    @media (max-width: 640px) {
      .jiangyu-ai-panel {
        right: 12px;
        left: 12px;
        bottom: 12px;
        width: auto;
        height: min(78vh, 660px);
      }
    }
  `;

  document.head.appendChild(style);
}

function ensurePanel() {
  if (panelMounted) {
    return;
  }

  panelMounted = true;
  injectStyles();

  const backdrop = document.createElement('div');
  backdrop.className = 'jiangyu-ai-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  const panel = document.createElement('div');
  panel.className = 'jiangyu-ai-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'AI 客服');

  const header = document.createElement('div');
  header.className = 'jiangyu-ai-header';
  header.innerHTML = `
    <div>
      <p class="jiangyu-ai-eyebrow">AI 客服</p>
      <p class="jiangyu-ai-title">初審聊天視窗</p>
    </div>
  `;

  const actions = document.createElement('div');
  actions.className = 'jiangyu-ai-actions';

  const openLink = document.createElement('a');
  openLink.className = 'jiangyu-ai-link';
  openLink.href = aiServiceUrl;
  openLink.target = '_blank';
  openLink.rel = 'noreferrer';
  openLink.textContent = '開新視窗';

  const closeButton = document.createElement('button');
  closeButton.className = 'jiangyu-ai-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '關閉 AI 客服');
  closeButton.textContent = '×';

  actions.append(openLink, closeButton);
  header.append(actions);

  const frameWrap = document.createElement('div');
  frameWrap.className = 'jiangyu-ai-frameWrap';

  const iframe = document.createElement('iframe');
  iframe.className = 'jiangyu-ai-frame';
  iframe.title = 'AI 客服';
  iframe.src = aiServiceUrl;
  iframe.loading = 'eager';
  iframe.referrerPolicy = 'no-referrer';

  frameWrap.appendChild(iframe);
  panel.append(header, frameWrap);
  document.body.append(backdrop, panel);

  const close = () => {
    isOpen = false;
    backdrop.dataset.open = 'false';
    panel.dataset.open = 'false';
    document.body.style.overflow = '';
  };

  const open = () => {
    isOpen = true;
    backdrop.dataset.open = 'true';
    panel.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
  };

  backdrop.addEventListener('click', close);
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      close();
    }
  });

  (window as Window & { __jiangyuAiOpen?: () => void; __jiangyuAiClose?: () => void }).__jiangyuAiOpen = open;
  (window as Window & { __jiangyuAiOpen?: () => void; __jiangyuAiClose?: () => void }).__jiangyuAiClose = close;

  backdrop.dataset.open = 'false';
  panel.dataset.open = 'false';
}

function getTriggerLabel(target: Element | null) {
  if (!target) {
    return '';
  }

  const text = target.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return text;
}

function interceptAiButtons() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      const trigger = target?.closest('a,button');

      if (!trigger) {
        return;
      }

      const label = getTriggerLabel(trigger);
      const href = trigger instanceof HTMLAnchorElement ? trigger.getAttribute('href') ?? '' : '';

      if (label === 'AI 客服' || href === aiServiceUrl) {
        event.preventDefault();
        event.stopPropagation();
        ensurePanel();
        (window as Window & { __jiangyuAiOpen?: () => void }).__jiangyuAiOpen?.();
      }
    },
    true,
  );
}

function boot() {
  ensurePanel();
  interceptAiButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
