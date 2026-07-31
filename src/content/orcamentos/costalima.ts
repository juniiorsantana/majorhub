import type { Orcamento } from './types'

export const costalima: Orcamento = {
  slug: 'costalima',

  marca: {
    monograma: 'CL',
    nome: 'Costa Lima',
    assinatura: 'Advocacia',
  },

  cliente: {
    nome: 'Sarah Lima Costa',
    tratamento: 'Dra.',
    segmento: 'Advocacia — Direito Imobiliário e Previdenciário',
    contexto:
      'Fortalecer o posicionamento do escritório no Instagram com uma presença orgânica, profissional e autêntica — aumentando reconhecimento, alcance e geração de oportunidades futuras.',
  },

  proposta: {
    titulo: 'Conteúdo e Posicionamento',
    tituloDestaque: 'Digital',
    subtitulo:
      'Um plano de conteúdo construído para transformar autoridade jurídica em presença digital reconhecida.',
    emitidaEm: '2026-07-31',
    validadeDias: 7,
  },

  tema: {
    preset: 'editorial-claro',
  },

  hero: {
    // TODO: caminho de uma imagem em /public, ex.: '/Costa Lima Id Visual.avif'.
    // Vazio = painel tipográfico com o monograma.
    imagem: '/costalimamockup.avif',
    imagemAlt: 'Mockup da identidade visual da Costa Lima Advocacia',
  },

  alinhamentos: [
    'O começo é orgânico: tráfego pago só entra quando fizer sentido, a partir da Gestão de Performance.',
    'O direcionamento é completo — estratégia e conteúdo, não artes avulsas.',
    'O conteúdo precisa ser autêntico e refletir a essência da Sarah.',
    'O foco principal é Direito Imobiliário, com o previdenciário como vertente importante.',
  ],

  planos: [
    {
      id: 'fundacao',
      nome: 'Fundação Estratégica',
      valor: 'R$ 1.800',
      periodo: '/mês',
      observacao: 'Plano de 90 dias',
      condicao: { valor: 'R$ 1.500' },
      resumo:
        'Para construir a base de comunicação que sustenta qualquer operação de conteúdo: identidade, linha editorial e direção criativa.',
      inclui: [
        'Diagnóstico de posicionamento e público-alvo',
        'Criação de identidade de comunicação e tom de voz',
        'Linha editorial completa (temas, formatos, calendário estratégico)',
        'Copywriting estratégico (roteiros, legendas, CTAs)',
        'Direção de arte e diretrizes visuais',
        'Produção e execução de social media',
        'Manual de marca de conteúdo como entrega final',
      ],
      checkoutUrl: 'https://www.asaas.com/c/vzw4toy82sqswsrd',
    },
    {
      id: 'performance',
      nome: 'Gestão de Performance',
      valor: 'R$ 2.500',
      periodo: '/mês',
      observacao: 'Plano de 180 dias',
      condicao: { valor: 'R$ 2.000' },
      resumo:
        'Para quem quer atrair e converter mais clientes com tráfego pago e presença qualificada em busca por IA.',
      destaque: true,
      herdaDe: 'Fundação Estratégica',
      inclui: [
        'Gestão de tráfego pago (Google Ads e/ou Meta Ads)',
        'Otimização para busca por IA (GEO) e SEO',
        'Landing page ou página de captura',
        'Relatório mensal com métricas reais (visitas, leads, conversão, ROAS)',
      ],
      checkoutUrl: 'https://www.asaas.com/c/05bmb622gk7ya0zn',
    },
    {
      id: 'sistema',
      nome: 'Sistema Completo',
      valor: 'R$ 4.900',
      periodo: '/mês',
      observacao: 'Plano de 180 dias',
      condicao: { valor: 'R$ 3.000' },
      resumo:
        'Para quem quer a operação rodando como sistema: inteligência artificial, automação e relacionamento com cliente.',
      herdaDe: 'Gestão de Performance',
      inclui: [
        'Automação com IA (qualificação de lead, atendimento via WhatsApp)',
        'Sistema de relacionamento com cliente (CRM + funil estruturado)',
        'Funil completo de conversão multicanal',
        'Newsletter ou email marketing recorrente',
        'Reunião estratégica mensal e consultoria contínua',
      ],
      // Intencionalmente sem checkout: por ser negociado, o aceite vai para o
      // WhatsApp em contato.whatsapp com o plano já citado na mensagem.
      checkoutUrl: '',
    },
  ],

  // As quatro frentes espelham os planos: 1 e 2 entram na Fundação Estratégica,
  // 3 na Gestão de Performance e 4 no Sistema Completo.
  escopo: [
    {
      titulo: 'Base e identidade',
      itens: [
        'Diagnóstico de posicionamento e público-alvo',
        'Criação de identidade de comunicação e tom de voz',
        'Linha editorial completa (temas, formatos, calendário estratégico)',
        'Direção de arte e diretrizes visuais',
        'Manual de marca de conteúdo como entrega final',
      ],
    },
    {
      titulo: 'Produção e social media',
      itens: [
        'Copywriting estratégico (roteiros, legendas, CTAs)',
        'Produção e execução de social media',
        'Conteúdos voltados para autoridade no nicho',
        'Conteúdos para o perfil imobiliário, com foco em investidores e empresas',
        'Adaptação do tom para o previdenciário quando necessário',
      ],
    },
    {
      titulo: 'Tráfego e busca',
      itens: [
        'Gestão de tráfego pago (Google Ads e/ou Meta Ads)',
        'Otimização para busca por IA (GEO) e SEO',
        'Landing page ou página de captura',
        'Relatório mensal com métricas reais (visitas, leads, conversão, ROAS)',
      ],
    },
    {
      titulo: 'Automação e relacionamento',
      itens: [
        'Automação com IA (qualificação de lead, atendimento via WhatsApp)',
        'Sistema de relacionamento com cliente (CRM + funil estruturado)',
        'Funil completo de conversão multicanal',
        'Newsletter ou email marketing recorrente',
        'Reunião estratégica mensal e consultoria contínua',
      ],
    },
  ],

  cronograma: [
    {
      periodo: 'Semana 1',
      itens: [
        'Onboarding',
        'Definição de posicionamento',
        'Coleta de referências',
        'Acesso às contas',
        'Alinhamento de tom de voz',
      ],
    },
    {
      periodo: 'Semana 2',
      itens: [
        'Montagem da linha editorial',
        'Definição dos primeiros temas',
        'Estruturação dos roteiros',
        'Início da produção das primeiras peças',
      ],
    },
    {
      periodo: 'Semana 3',
      itens: [
        'Revisão com a cliente',
        'Ajustes de linguagem e identidade',
        'Organização do calendário de postagens',
        'Liberação dos primeiros conteúdos',
      ],
    },
    {
      periodo: 'Semana 4 em diante',
      itens: [
        'Rotina de acompanhamento',
        'Ajustes mensais',
        'Testes de Reels',
        'Refinamento da estratégia com base em performance',
      ],
    },
  ],

  termos: {
    pagamento: [
      'Cobrança mensal',
      'Valor conforme o plano escolhido',
    ],
    vigencia: [
      'Fundação Estratégica: plano de 90 dias',
      'Gestão de Performance e Sistema Completo: planos de 180 dias',
    ],
    naoIncluso: [
      'Gestão de tráfego pago no plano Fundação Estratégica',
      'Verba de anúncios, em qualquer plano — investida direto nas plataformas',
      'Produção presencial de vídeo e foto, salvo se combinada à parte',
      'Atendimento jurídico ao público final',
      'Demandas avulsas fora do escopo contratado',
    ],
  },

  faq: [
    {
      pergunta: 'A proposta inclui tráfego pago?',
      resposta:
        'Na Fundação Estratégica, não — ali o foco é orgânico, em base, posicionamento e conteúdo. A gestão de tráfego pago entra a partir da Gestão de Performance; a verba dos anúncios é sempre à parte, investida direto nas plataformas.',
    },
    {
      pergunta: 'Vocês fazem só Instagram?',
      resposta:
        'Sim. A Fundação Estratégica é exatamente isso: identidade, linha editorial e produção de social media, sem tráfego pago nem automação.',
    },
    {
      pergunta: 'A cliente precisa gravar vídeos?',
      resposta:
        'Sim, mas de forma progressiva e adaptada à rotina dela. Enviamos roteiros prontos e cuidamos da edição.',
    },
    {
      pergunta: 'Vocês ajudam com ideias de Stories?',
      resposta:
        'Sim. O planejamento inclui sugestões de Stories e direcionamento de conteúdo para o dia a dia.',
    },
    {
      pergunta: 'O conteúdo precisa ser engraçado ou viral?',
      resposta:
        'Não. A proposta é posicionamento com autenticidade, sem depender de viralização.',
    },
    {
      pergunta: 'Dá para adaptar o conteúdo ao público imobiliário?',
      resposta:
        'Sim — inclusive esse é o foco principal do posicionamento atual, com o previdenciário como vertente complementar.',
    },
    {
      pergunta: 'O que acontece depois da aprovação?',
      resposta:
        'É feito o onboarding, a definição de posicionamento e o início da produção e organização dos conteúdos, seguindo o cronograma acima.',
    },
  ],

  contato: {
    whatsapp: '5565992178164',
    responsavel: 'MajorHub',
    // TODO: preencher para aparecerem na faixa de contato do rodapé.
    // Campos vazios simplesmente não são renderizados.
    email: '',
    telefone: '',
    site: '',
    instagram: '',
  },
}
