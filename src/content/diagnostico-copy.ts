import type { Banda, CategoriaId, Faixa } from '@/lib/diagnostico/types'

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

  direcaoGeral: {
    '0-20':
      'Hoje sua empresa é invisível — nem a IA nem o Google conseguem te apresentar a um cliente. Antes de investir em tráfego ou redes, é preciso reconstruir a base do site: sem ela, todo real investido vaza.',
    '21-40':
      'Seu site existe, mas não compete. Quando um cliente pergunta pela melhor opção do seu segmento, a resposta vem com o nome de outra empresa. A direção aqui é estruturar o essencial: conteúdo legível, dados do negócio e presença consistente.',
    '41-50':
      'Você está no jogo, mas na arquibancada. A base técnica até segura, só que a IA e o Google não têm motivos pra te escolher. O próximo passo é dar a eles esses motivos: estrutura, autoridade e informação clara sobre quem você é.',
    '51-60':
      'Metade do caminho feito — e é exatamente aí que a maioria estaciona. Os detalhes que faltam são os que separam quem aparece na resposta de quem fica de fora. Corrigir os pontos vermelhos abaixo tira você da média.',
    '61-75':
      'Sua base é boa, mas a IA ainda hesita em te recomendar. Ela te encontra, só não tem segurança suficiente sobre quem você é. Com os ajustes certos de estrutura, você entra na conversa de verdade.',
    '76-85':
      'Você está à frente da maioria — falta o acabamento. Os poucos pontos em aberto são justamente os que dão confiança pra IA citar sua empresa pelo nome. Feche essas brechas e assuma a posição.',
    '86-100':
      'Site pronto pra ser recomendado. Sua estrutura fala a língua da IA e do Google — agora o jogo é escala: conteúdo, autoridade e estrutura comercial pra converter essa visibilidade em vendas.',
  } satisfies Record<Banda, string>,

  direcaoIa: {
    '0-20': 'Pra IA, seu site não existe. Quando perguntam pelo seu segmento, você simplesmente não é uma opção.',
    '21-40':
      'A IA até acessa seu site, mas encontra uma página que não diz nada sobre você. Sem informação estruturada, ela pula pro concorrente.',
    '41-50':
      'Existe o mínimo, mas nada que dê segurança pra IA. Ela sabe que você existe — não sabe por que deveria te indicar.',
    '51-60':
      'A IA consegue entrar e entende parte do que você faz, mas as lacunas ainda pesam mais que os acertos na hora de recomendar.',
    '61-75':
      'A IA até consegue entrar, mas tem dificuldade de entender quem você é. Sem isso, ela não tem segurança pra te recomendar.',
    '76-85':
      'A IA já entende quem você é e o que você faz. Faltam poucos sinais pra você virar recomendação recorrente.',
    '86-100':
      'Seu site fala a língua das IAs — estrutura, contexto e autoridade. Você está posicionado pra ser a resposta, não uma opção.',
  } satisfies Record<Banda, string>,

  faixaLabel: {
    critico: 'Crítico',
    regular: 'Regular',
    bom: 'Bom',
    otimo: 'Ótimo',
  } satisfies Record<Faixa, string>,

  categoriaMensagem: {
    desempenho: {
      critico: 'Seu site demora pra responder — e tanto o Google quanto o visitante desistem antes de ver o que você oferece.',
      regular: 'O site carrega, mas com atrito. Cada segundo a mais derruba conversões e posições no Google.',
      bom: 'Bom desempenho técnico. Alguns ajustes finos ainda deixam a experiência mais rápida.',
      otimo: 'Site rápido e leve. Desempenho não é o seu gargalo.',
    },
    seo: {
      critico: 'O Google mal entende do que seu site fala. Sem essa base, é quase impossível ser encontrado.',
      regular: 'Existe estrutura, mas com lacunas que o Google usa como desculpa pra rankear o concorrente.',
      bom: 'Boa base de SEO. Falta pouco pra virar autoridade no seu nicho.',
      otimo: 'SEO bem resolvido. A base está pronta pra escalar conteúdo.',
    },
    presenca: {
      critico: 'Sua presença digital passa desconfiança — e confiança é o primeiro filtro de qualquer cliente.',
      regular: 'A presença existe, mas incompleta. Detalhes soltos tiram credibilidade na hora da decisão.',
      bom: 'Presença digital sólida. Pequenos ajustes fecham as últimas brechas de confiança.',
      otimo: 'Presença digital impecável. Sua marca transmite confiança em todos os pontos de contato.',
    },
  } satisfies Record<Exclude<CategoriaId, 'ia'>, Record<Faixa, string>>,

  gate: {
    titulo: 'Veja como corrigir cada ponto do seu relatório',
    texto: 'Informe seu nome e WhatsApp para desbloquear as recomendações de correção, item por item.',
    nomePlaceholder: 'Seu nome',
    whatsappPlaceholder: '(65) 99999-9999',
    whatsappErro: 'Número inválido. Use DDD + número, ex: (65) 99999-9999.',
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
