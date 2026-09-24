import type { Orcamento } from './types'

export const katiacavalcante: Orcamento = {
  slug: 'katiacavalcante',

  // Sem monograma: o cabeçalho e o rodapé mostram só o nome.
  marca: {
    nome: 'Katia Cavalcante',
    assinatura: 'Corretora de Imóveis · Urba',
  },

  cliente: {
    nome: 'Katia Cavalcante',
    segmento: 'Corretora de imóveis — Urba',
    contexto:
      'Construir uma presença digital estratégica e consistente para a Katia — conectando conteúdo, posicionamento e gestão para fortalecer a marca, gerar autoridade e criar novas oportunidades de venda.',
  },

  proposta: {
    titulo: 'Marketing Estratégico',
    tituloDestaque: 'e Presença Digital',
    subtitulo:
      'Estratégia, conteúdo e gestão trabalhando juntos para transformar o Instagram em vitrine dos imóveis e canal de novas oportunidades.',
    emitidaEm: '2026-09-24',
    validadeDias: 7,
  },

  tema: {
    preset: 'editorial-claro',
  },

  // Imagens do book do Botanique. A do pier tem uma faixa verde com o título
  // à esquerda; o enquadramento pela direita a deixa fora do corte.
  hero: {
    imagem: '/botanique-pier.jpg',
    imagemAlt: 'Pier sobre o lago do Botanique ao pôr do sol',
    posicao: 'right',
  },

  faixaImagem: {
    imagem: '/botanique-vista-aerea.jpg',
    imagemAlt: 'Vista aérea do lago do Botanique, com pier, piscina e áreas de lazer',
    legenda: 'Botanique · Vista aérea do lago',
  },

  parceria: {
    nome: 'Vimark',
    descricao:
      'Esta proposta é uma entrega conjunta: a MajorHub conduz a estratégia de marketing e posicionamento, e a Vimark cuida da produção e da rotina de conteúdo. Um único time, uma única linha de comunicação.',
    // TODO: confirmar a divisão de papéis com a Vimark.
    frentes: [
      {
        agencia: 'MajorHub',
        papel: 'Estratégia, posicionamento e campanhas',
        itens: [
          'Diagnóstico de marketing e posicionamento',
          'Estratégia de conteúdo e direcionamento das campanhas',
          'Análise mensal de métricas e ajuste de rota',
        ],
      },
      {
        agencia: 'Vimark',
        papel: 'Produção de conteúdo e gestão do Instagram',
        itens: [
          'Criativos, vídeos editados, fotos e ideias de Stories',
          'Legendas estratégicas e CTAs',
          'Calendário editorial e gestão do perfil',
        ],
      },
    ],
  },

  alinhamentos: [
    'O conteúdo existe para gerar autoridade e oportunidades de venda, não só presença.',
    'O direcionamento é completo — estratégia, conteúdo e gestão, não artes avulsas.',
    'O conteúdo precisa ser autêntico e refletir a forma como a Katia atende.',
    'Os imóveis da Urba e a região de atuação da Katia são o centro da comunicação.',
  ],

  // Presença Digital e Operação Estratégica foram enviados pela Vimark; o
  // Autoridade Digital é o meio-termo: a estratégia e a gestão do primeiro, com
  // volume de conteúdo flexível, definido a cada mês pelo planejamento. Campanhas (estratégia e organização) ficam
  // exclusivas do último. Como os planos mudam quantidades, cada um lista tudo
  // o que entrega, na ordem Estratégia → Conteúdo → Gestão.
  planos: [
    {
      id: 'presenca',
      // TODO: nomes dos planos a confirmar com a Vimark.
      nome: 'Presença Digital',
      valor: 'R$ 2.000',
      periodo: '/mês',
      resumo:
        'Construir uma presença digital estratégica e consistente, conectando conteúdo, posicionamento e gestão para fortalecer a marca, gerar autoridade e criar novas oportunidades de venda.',
      inclui: [
        'Diagnóstico de marketing e posicionamento',
        'Planejamento mensal',
        'Estratégia de conteúdo',
        'Direcionamento de campanhas',
        'Orientação de branding',
        '8 criativos/mês',
        '5 vídeos editados/mês',
        '10 fotos/mês',
        '12 ideias de Stories/mês',
        'Legendas estratégicas',
        'CTAs direcionados para cada conteúdo',
        'Gestão do Instagram',
        'Organização do calendário editorial',
        'Planejamento das publicações',
        'Análise mensal de métricas',
        '1 reunião estratégica mensal',
      ],
      checkoutUrl: '',
    },
    {
      id: 'autoridade',
      // TODO: plano intermediário montado pela MajorHub — validar com a Vimark.
      nome: 'Autoridade Digital',
      valor: 'R$ 3.000',
      periodo: '/mês',
      resumo:
        'Mais ritmo de conteúdo sobre a mesma base estratégica, com uma produção flexível que acompanha as prioridades de cada mês — lançamentos, imóveis em destaque e oportunidades de venda.',
      destaque: true,
      inclui: [
        'Diagnóstico de marketing e posicionamento',
        'Planejamento mensal',
        'Estratégia de conteúdo',
        'Direcionamento de campanhas',
        'Direcionamento de branding',
        'Volume de conteúdo flexível, definido no planejamento de cada mês',
        'Criativos de acordo com a estratégia do mês',
        'Vídeos editados conforme as prioridades do período',
        'Fotos para feed e Stories, conforme a pauta',
        'Ideias de Stories para a rotina da semana',
        'Legendas estratégicas',
        'CTAs direcionados para cada conteúdo',
        'Gestão do Instagram',
        'Organização do calendário editorial',
        'Planejamento das publicações',
        'Análise mensal de métricas',
        '1 reunião estratégica mensal',
      ],
      checkoutUrl: '',
    },
    {
      id: 'operacao',
      nome: 'Operação Estratégica',
      valor: 'R$ 5.000',
      periodo: '/mês',
      resumo:
        'Transformar o marketing em uma operação mais estratégica e consistente, conectando posicionamento, conteúdo e campanhas para fortalecer a marca, aumentar a presença digital e gerar oportunidades de crescimento.',
      inclui: [
        'Diagnóstico de marketing',
        'Diagnóstico de posicionamento',
        'Planejamento mensal',
        'Estratégia de conteúdo',
        'Estratégia de campanhas',
        'Direcionamento de branding',
        '12 criativos/mês',
        '7 vídeos editados/mês',
        '15 fotos/mês',
        '16 ideias de Stories/mês',
        'Legendas estratégicas',
        'CTAs direcionados',
        'Gestão do Instagram',
        'Organização do calendário editorial',
        'Organização e direcionamento das campanhas',
        'Análise mensal de métricas',
        'Reunião estratégica mensal',
      ],
      checkoutUrl: '',
    },
  ],

  // As três frentes dos dois planos. As quantidades mudam conforme o plano,
  // então aqui entram só as entregas, sem números.
  escopo: [
    {
      titulo: 'Estratégia',
      itens: [
        'Diagnóstico de marketing e de posicionamento',
        'Planejamento mensal',
        'Estratégia de conteúdo',
        'Estratégia e direcionamento de campanhas',
        'Direcionamento de branding',
      ],
    },
    {
      titulo: 'Conteúdo',
      itens: [
        'Criativos para o feed',
        'Vídeos editados',
        'Fotos',
        'Ideias de Stories',
        'Legendas estratégicas',
        'CTAs direcionados para cada conteúdo',
      ],
    },
    {
      titulo: 'Gestão',
      itens: [
        'Gestão do Instagram',
        'Organização do calendário editorial',
        'Planejamento das publicações e das campanhas',
        'Análise mensal de métricas',
        'Reunião estratégica mensal',
      ],
    },
  ],

  cronograma: [
    {
      periodo: 'Semana 1',
      itens: [
        'Onboarding',
        'Diagnóstico de marketing e posicionamento',
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
        'Análise de métricas',
        'Refinamento da estratégia com base em resultados',
      ],
    },
  ],

  termos: {
    pagamento: ['Cobrança mensal', 'Valor conforme o plano escolhido'],
    // TODO: confirmar a vigência mínima do plano.
    vigencia: ['Plano mensal, com vigência a combinar no aceite'],
    naoIncluso: [
      'Verba de anúncios, quando houver campanhas pagas — investida direto nas plataformas',
      'Atendimento e negociação com os clientes finais',
      'Demandas avulsas fora do escopo contratado',
    ],
  },

  faq: [
    {
      pergunta: 'Por que duas agências?',
      resposta:
        'Porque cada uma cuida do que faz melhor: a MajorHub da estratégia e do posicionamento, a Vimark da produção e da rotina de conteúdo. Para você, é um time só, com uma única linha de comunicação.',
    },
    {
      pergunta: 'Qual a diferença entre os planos?',
      resposta:
        'O volume de conteúdo e a profundidade da estratégia. O Presença Digital tem quantidades fixas por mês. No Autoridade Digital, a produção é flexível: a quantidade de criativos, vídeos, fotos e Stories é definida a cada mês pela estratégia, concentrando esforço onde houver mais oportunidade — um lançamento, um imóvel em destaque, uma campanha da Urba. O Operação Estratégica traz o maior volume e soma a estratégia e a organização das campanhas ao dia a dia do perfil.',
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
        'Sim. As ideias de Stories entram em todos os planos — em quantidade fixa ou definidas pela estratégia do mês, conforme o plano — pensadas para o dia a dia do atendimento e das visitas.',
    },
    {
      pergunta: 'O que acontece depois da aprovação?',
      resposta:
        'É feito o onboarding, o diagnóstico de marketing e posicionamento e o início da produção dos conteúdos, seguindo o cronograma acima.',
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
