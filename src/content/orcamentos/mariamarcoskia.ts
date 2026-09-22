import type { Orcamento } from './types'

export const mariamarcoskia: Orcamento = {
  slug: 'mariamarcoskia',

  // Sem monograma: o cabeçalho e o rodapé mostram só o nome.
  marca: {
    nome: 'Maria Marcoskia',
    assinatura: 'Corretora de Imóveis · Brasil Beach',
  },

  cliente: {
    nome: 'Maria Marcoskia',
    segmento: 'Corretora de imóveis — Brasil Beach',
    contexto:
      'Atrair mais clientes pelo digital e fortalecer o posicionamento da Maria como corretora de referência — com presença consistente, profissional e que gera oportunidades de venda.',
  },

  proposta: {
    titulo: 'Posicionamento e Aquisição',
    tituloDestaque: 'de Clientes',
    subtitulo:
      'Um plano de conteúdo e presença digital pensado para transformar o Instagram em vitrine de imóveis e canal de novos clientes.',
    emitidaEm: '2026-09-22',
    validadeDias: 7,
  },

  tema: {
    preset: 'editorial-claro',
  },

  hero: {
    imagem: '/brasil-beach-capa.jpg',
    imagemAlt: 'Brasil Beach Home Resort, em Cuiabá: torres residenciais ao redor da lagoa',
  },

  parceria: {
    nome: 'Vimark',
    descricao:
      'Esta proposta é uma entrega conjunta: a MajorHub conduz a estratégia de posicionamento e aquisição, e a Vimark cuida da produção e da rotina de conteúdo. Um único time, uma única linha de comunicação.',
    // TODO: confirmar a divisão de papéis com a Vimark.
    frentes: [
      {
        agencia: 'MajorHub',
        papel: 'Estratégia, posicionamento e aquisição de clientes',
        itens: [
          'Direção estratégica do posicionamento da marca pessoal',
          'Conteúdos pensados para gerar contatos e visitas a imóveis',
          'Leitura dos resultados e ajuste de rota mensal',
        ],
      },
      {
        agencia: 'Vimark',
        papel: 'Produção de conteúdo e gestão do Instagram',
        itens: [
          'Criativos, vídeos editados e ideias de Stories',
          'Legendas estratégicas e CTAs',
          'Calendário editorial e gestão do perfil',
        ],
      },
    ],
  },

  alinhamentos: [
    'O foco é aquisição de clientes: o conteúdo existe para gerar contatos e oportunidades de venda.',
    'O direcionamento é completo — estratégia e conteúdo, não artes avulsas.',
    'O conteúdo precisa ser autêntico e refletir a forma como a Maria atende.',
    'Os imóveis e a região do Brasil Beach são o centro da comunicação.',
    'Nos planos com tráfego, a verba de anúncios é de no mínimo R$ 2.000/mês, investida direto nas plataformas.',
  ],

  planos: [
    {
      id: 'presenca',
      // TODO: nomes dos planos e links de checkout a definir.
      nome: 'Presença Digital',
      valor: 'R$ 2.000',
      periodo: '/mês',
      resumo:
        'Para estruturar a presença no Instagram com constância e estratégia, no orgânico.',
      inclui: [
        'Diagnóstico inicial de posicionamento',
        'Planejamento mensal e calendário editorial',
        'Legendas estratégicas e CTAs',
        'Gestão do Instagram',
        'Acompanhamento de métricas',
      ],
      checkoutUrl: '',
    },
    {
      id: 'aquisicao',
      nome: 'Aquisição de Clientes',
      valor: 'R$ 3.000',
      periodo: '/mês',
      observacao: '+ verba mínima de R$ 2.000/mês em anúncios',
      resumo:
        'Para transformar o conteúdo em contatos: anúncios que levam interessados direto para o WhatsApp da Maria.',
      destaque: true,
      herdaDe: 'Presença Digital',
      // TODO: confirmar as entregas deste plano.
      inclui: [
        'Gestão de tráfego pago (Meta Ads)',
        'Campanhas de captação de leads para os imóveis',
        'Criativos específicos para anúncios',
        'Direcionamento dos contatos para o WhatsApp',
        'Relatório mensal com métricas reais (alcance, leads, custo por lead)',
      ],
      checkoutUrl: '',
    },
    {
      id: 'completo',
      nome: 'Sistema Completo',
      valor: 'R$ 5.000',
      periodo: '/mês',
      observacao: '+ verba de anúncios à parte',
      resumo:
        'Para quem quer a operação rodando como sistema: captação, atendimento e acompanhamento de cada contato.',
      herdaDe: 'Aquisição de Clientes',
      // TODO: confirmar as entregas deste plano.
      inclui: [
        'Google Ads para quem já busca imóveis na região',
        'Landing page dos imóveis em destaque',
        'Automação de atendimento e qualificação de leads no WhatsApp',
        'CRM com funil de vendas estruturado',
        'Reunião estratégica quinzenal',
      ],
      checkoutUrl: '',
    },
  ],

  // As três primeiras frentes são as entregas da Vimark (Presença Digital);
  // tráfego entra na Aquisição de Clientes e automação no Sistema Completo.
  escopo: [
    {
      titulo: 'Estratégia',
      itens: [
        'Diagnóstico inicial de posicionamento',
        'Planejamento mensal',
        'Estratégia de conteúdo',
        'Definição de pilares de conteúdo',
        'Calendário editorial',
      ],
    },
    {
      titulo: 'Conteúdo',
      itens: [
        '10 criativos/mês',
        '3 vídeos editados/mês',
        '12 ideias de Stories/mês',
        'Legendas estratégicas',
        'CTAs para os conteúdos',
      ],
    },
    {
      titulo: 'Organização',
      itens: [
        'Organização do calendário de conteúdo',
        'Organização dos temas e campanhas',
        'Gestão do Instagram',
        '1 reunião estratégica mensal',
        'Acompanhamento básico de métricas',
      ],
    },
    {
      titulo: 'Tráfego e captação',
      itens: [
        'Gestão de tráfego pago (Meta Ads e Google Ads)',
        'Campanhas de captação de leads para os imóveis',
        'Criativos específicos para anúncios',
        'Landing page dos imóveis em destaque',
        'Relatório mensal com métricas reais',
      ],
    },
    {
      titulo: 'Atendimento e relacionamento',
      itens: [
        'Automação de atendimento no WhatsApp',
        'Qualificação de leads',
        'CRM com funil de vendas estruturado',
        'Reunião estratégica quinzenal',
      ],
    },
  ],

  cronograma: [
    {
      periodo: 'Semana 1',
      itens: [
        'Onboarding',
        'Diagnóstico de posicionamento',
        'Coleta de referências e dos imóveis em carteira',
        'Acesso às contas',
        'Alinhamento de tom de voz',
      ],
    },
    {
      periodo: 'Semana 2',
      itens: [
        'Definição dos pilares de conteúdo',
        'Montagem do calendário editorial',
        'Estruturação dos roteiros',
        'Início da produção das primeiras peças',
      ],
    },
    {
      periodo: 'Semana 3',
      itens: [
        'Revisão com a cliente',
        'Ajustes de linguagem e identidade',
        'Organização dos temas e campanhas',
        'Liberação dos primeiros conteúdos',
      ],
    },
    {
      periodo: 'Semana 4 em diante',
      itens: [
        'Rotina de publicação e gestão do perfil',
        'Reunião estratégica mensal',
        'Acompanhamento de métricas',
        'Refinamento da estratégia com base em resultados',
      ],
    },
  ],

  termos: {
    pagamento: [
      'Cobrança mensal',
      'Valor conforme o plano escolhido',
      'Verba de anúncios paga direto às plataformas',
    ],
    // TODO: confirmar a vigência mínima do plano.
    vigencia: ['Plano mensal, com vigência a combinar no aceite'],
    naoIncluso: [
      'Gestão de tráfego pago no plano Presença Digital',
      'Verba de anúncios, em qualquer plano — investida direto nas plataformas (mínimo de R$ 2.000/mês)',
      'Produção presencial de vídeo e foto, salvo se combinada à parte',
      'Atendimento e negociação com os clientes finais',
      'Demandas avulsas fora do escopo contratado',
    ],
  },

  faq: [
    {
      pergunta: 'Por que duas agências?',
      resposta:
        'Porque cada uma cuida do que faz melhor: a MajorHub da estratégia e da aquisição, a Vimark da produção e da rotina de conteúdo. Para você, é um time só, com uma única linha de comunicação.',
    },
    {
      pergunta: 'A proposta inclui tráfego pago?',
      resposta:
        'No Presença Digital, não — o foco é conteúdo e orgânico. A gestão de tráfego entra a partir do Aquisição de Clientes, com verba mínima de R$ 2.000/mês investida direto nas plataformas, fora do valor do plano.',
    },
    {
      pergunta: 'Preciso gravar vídeos?',
      resposta:
        'Sim, de forma progressiva e adaptada à sua rotina. Enviamos os roteiros prontos e cuidamos da edição.',
    },
    {
      pergunta: 'Vocês divulgam os imóveis que eu tenho em carteira?',
      resposta:
        'Sim. Os imóveis entram no calendário junto com conteúdos de autoridade e da região, para que o perfil não vire só um catálogo.',
    },
    {
      pergunta: 'Vocês ajudam com ideias de Stories?',
      resposta:
        'Sim. São 12 ideias de Stories por mês, pensadas para o dia a dia do atendimento e das visitas.',
    },
    {
      pergunta: 'O que acontece depois da aprovação?',
      resposta:
        'É feito o onboarding, o diagnóstico de posicionamento e o início da produção dos conteúdos, seguindo o cronograma acima.',
    },
  ],

  contato: {
    whatsapp: '5565992178164',
    responsavel: 'MajorHub',
    email: '',
    telefone: '',
    site: '',
    instagram: '',
  },
}
