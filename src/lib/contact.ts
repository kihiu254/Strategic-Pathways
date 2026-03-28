export const SUPPORT_EMAIL = 'info@joinstrategicpathways.com';

interface SupportEmailOptions {
  subject?: string;
  body?: string;
}

export const buildMailtoLink = ({ subject = '', body = '' }: SupportEmailOptions = {}) => {
  const params = new URLSearchParams();

  if (subject) {
    params.set('subject', subject);
  }

  if (body) {
    params.set('body', body);
  }

  const query = params.toString();
  return `mailto:${SUPPORT_EMAIL}${query ? `?${query}` : ''}`;
};

export const openSupportEmail = (options: SupportEmailOptions = {}) => {
  window.location.href = buildMailtoLink(options);
};
