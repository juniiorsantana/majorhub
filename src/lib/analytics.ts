export const WHATSAPP_URL =
  'https://wa.me/5565992178164?text=Ol%C3%A1%2C+vim+pelo+site+e+quero+entender+como+a+MajorHub+pode+me+ajudar'

// Meta Pixel — eventos customizados
export function trackLeadClick(source: string) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead', { content_name: source })
  }
}

// GTM — push de eventos
export function pushEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...data })
  }
}
