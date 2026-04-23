export type TrackEventParams = {
  category: string;
  action: string;
  label?: string;
  value?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(params: TrackEventParams) {
  window.gtag?.('event', params.action, {
    event_category: params.category,
    event_label: params.label,
    value: params.value,
  });

  window.fbq?.('trackCustom', params.action, {
    category: params.category,
    label: params.label,
    value: params.value,
  });
}

export function trackLineClick(source: string) {
  trackEvent({
    category: 'lead',
    action: 'line_click',
    label: source,
  });
}

export function trackCtaClick(source: string) {
  trackEvent({
    category: 'lead',
    action: 'cta_click',
    label: source,
  });
}

export function trackPhoneClick(source: string) {
  trackEvent({
    category: 'lead',
    action: 'phone_click',
    label: source,
  });
}
