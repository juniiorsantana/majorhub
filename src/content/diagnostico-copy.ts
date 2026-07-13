import type { CategoriaId, Faixa } from '@/lib/diagnostico/types'

export const diagnosticoCopy = {
  hero: {
    badge: 'Diagnóstico gratuito · 60 segundos',
    titulo: ['A IA pode estar recomendando', 'o seu concorrente.'],
    subtitulo:
      'Quando alguém pergunta ao ChatGPT ou ao Google qual a melhor empresa do seu segmento, a resposta vem de quem está estruturado pra ser encontrado. Descubra se a sua empresa aparece — ou se quem aparece é o concorrente.',
    cta: 'Analisar meu site grátis',
  },

  mockup: {
    janela: 'Assistente de IA',
    pergunta: 'Qual a melhor empresa da região pra me atender?',
    respostaIntro: 'Encontrei uma opção bem avaliada pra você:',
    concorrente: 'Concorrente LTDA',
    concorrenteDetalhe: 'Site profissional, informações claras e presença digital consistente.',
    alerta: 'Sua empresa não apareceu nesta resposta.',
  },

  plataformas: {
    titulo: 'Seus clientes não pesquisam mais só no Google',
    texto:
      'Hoje as pessoas perguntam direto pra IA — e ela responde com uma indicação, não com uma lista de links. Se o seu site não está preparado pra ser lido por essas ferramentas, você simplesmente não entra na conversa.',
    lista: ['ChatGPT', 'Google AI', 'Gemini', 'Claude', 'Grok', 'Perplexity', 'Meta AI', 'Copilot'],
    fechamento: 'A pergunta não é se seus clientes usam IA. É quem a IA indica quando eles usam.',
  },

  ferramenta: {
    tituloSecao: 'Descubra em 60 segundos onde sua empresa está perdendo',
    subtituloSecao:
      'Cole o link do seu site. Nossa análise verifica desempenho, SEO, visibilidade para IA e presença digital — e mostra exatamente o que corrigir.',
    placeholder: 'seusite.com.br',
    cta: 'Analisar meu site grátis',
  },

  loadingSteps: [
    { icon: '🌐', label: 'Acessando seu site...' },
    { icon: '⚡', label: 'Medindo velocidade e desempenho...' },
    { icon: '🔍', label: 'Analisando SEO e conteúdo...' },
    { icon: '🤖', label: 'Testando visibilidade para IA...' },
    { icon: '📱', label: 'Checando presença digital...' },
    { icon: '📊', label: 'Montando seu relatório...' },
  ],

  faixaMensagem: {
    critico: 'Seu site está deixando dinheiro na mesa — ele afasta clientes em vez de atrair.',
    regular: 'Seu site tem potencial, mas ainda perde clientes pra concorrência por detalhes que dá pra corrigir.',
    bom: 'Seu site já tem uma boa base — o próximo passo é escalar isso com estrutura comercial.',
    otimo: 'Seu site está bem estruturado. Poucos detalhes separam você de estar no topo do seu mercado.',
  } satisfies Record<Faixa, string>,

  faixaLabel: {
    critico: 'Crítico',
    regular: 'Regular',
    bom: 'Bom',
    otimo: 'Ótimo',
  } satisfies Record<Faixa, string>,

  gate: {
    titulo: 'Veja exatamente o que está errado e como corrigir',
    texto: 'Informe seu nome e WhatsApp para desbloquear o relatório completo, item por item.',
    nomePlaceholder: 'Seu nome',
    whatsappPlaceholder: 'Seu WhatsApp com DDD',
    cta: 'Desbloquear relatório completo',
  },

  servicoPorCategoria: {
    desempenho: 'site',
    seo: 'site',
    ia: 'site',
    presenca: 'identidade',
  } satisfies Record<CategoriaId, string>,

  ctaFinal: {
    titulo: 'Quer que a gente corrija isso pra você?',
    texto: 'A Major estrutura o comercial, o site e a identidade de empresas que querem crescer no digital com seriedade.',
    cta: 'Falar com a Major',
  },

  erroAnalise: 'Não conseguimos acessar esse site. Verifique se o link está correto e tente novamente.',
}
