export const WHATSAPP_URL =
  'https://wa.me/5565992178164?text=Ol%C3%A1%2C+vim+pelo+site+e+quero+entender+como+a+MajorHub+pode+me+ajudar'

declare global {
  interface Window {
    fbq?: (command: string, event: string, data?: Record<string, unknown>) => void
    dataLayer?: Array<Record<string, unknown>>
  }
}

// Meta Pixel — eventos customizados
export function trackLeadClick(source: string) {
  window.fbq?.('track', 'Lead', { content_name: source })

}

// GTM — push de eventos
export function pushEvent(event: string, data?: Record<string, unknown>) {
  window.dataLayer?.push({ event, ...data })

}
