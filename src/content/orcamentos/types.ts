import type { TemaOrcamento } from './temas'

/**
 * Tipos das propostas comerciais servidas em /orc/[slug].
 * Cada cliente tem um arquivo próprio em src/content/orcamentos/.
 */

export interface PlanoOrcamento {
  /** Usado como âncora e no link de checkout. Sem espaços. */
  id: string
  nome: string
  /** Valor já formatado, ex.: 'R$ 1.500'. */
  valor: string
  /** Sufixo do valor, ex.: '/mês'. */
  periodo: string
  /** Nota curta exibida sob o valor, ex.: 'Plano de 90 dias'. */
  observacao?: string
  /**
   * Condição comercial exibida num badge acima do botão de aceite,
   * ex.: valor com desconto para fechamento. Sem prazo embutido.
   */
  condicao?: {
    /** Rótulo do badge. Vazio = 'Condição'. */
    rotulo?: string
    /** Valor já formatado, ex.: 'R$ 1.500'. */
    valor: string
    /** Sufixo do valor. Vazio = '/mês'. */
    periodo?: string
  }
  /** Uma linha sobre para quem o plano faz sentido. */
  resumo: string
  /** Destaca visualmente o plano recomendado. Use em apenas um. */
  destaque?: boolean
  /** Nome do plano imediatamente anterior, quando este o inclui por completo. */
  herdaDe?: string
  inclui: string[]
  /**
   * URL de pagamento (Asaas, Mercado Pago, Stripe Link etc).
   * Enquanto estiver vazia, o botão cai no WhatsApp com mensagem pré-preenchida.
   */
  checkoutUrl: string
}

export interface BlocoEscopo {
  titulo: string
  itens: string[]
}

export interface EtapaCronograma {
  periodo: string
  itens: string[]
}

export interface FaqItem {
  pergunta: string
  resposta: string
}

export interface Orcamento {
  slug: string
  /** Identidade do cliente exibida no cabeçalho e no rodapé da proposta. */
  marca: {
    /** Iniciais do monograma, ex.: 'CL'. Vazio = só o nome, sem monograma. */
    monograma?: string
    nome: string
    /** Linha de apoio sob o nome, ex.: 'Advocacia'. */
    assinatura?: string
  }
  cliente: {
    nome: string
    /** Pronome de tratamento no bloco "Proposta para", ex.: 'Dra.'. */
    tratamento?: string
    segmento: string
    contexto: string
  }
  proposta: {
    titulo: string
    /** Segunda linha do título, renderizada em itálico. */
    tituloDestaque?: string
    subtitulo: string
    /** Data de emissão no formato AAAA-MM-DD. */
    emitidaEm: string
    validadeDias: number
  }
  /** Visual da proposta. Presets em src/app/orc/orcamento.css. */
  tema: TemaOrcamento
  hero?: {
    /** Caminho em /public. Vazio = painel tipográfico com o monograma (ou o nome). */
    imagem?: string
    imagemAlt?: string
  }
  /**
   * Proposta feita em conjunto com outra agência. Aparece no cabeçalho,
   * numa seção de quem faz o quê e na assinatura do rodapé.
   */
  parceria?: {
    /** Nome da agência parceira, ex.: 'Vimark'. */
    nome: string
    /** Frase curta sobre por que a entrega é conjunta. */
    descricao: string
    /** Papel de cada agência, na ordem em que devem aparecer. */
    frentes: { agencia: string; papel: string; itens: string[] }[]
  }
  /** O que ficou combinado na conversa — reforça que a proposta é sob medida. */
  alinhamentos: string[]
  planos: PlanoOrcamento[]
  escopo: BlocoEscopo[]
  cronograma: EtapaCronograma[]
  termos: {
    pagamento: string[]
    vigencia: string[]
    naoIncluso: string[]
  }
  faq: FaqItem[]
  contato: {
    /** Somente dígitos, com DDI. Ex.: '5565992178164'. */
    whatsapp: string
    responsavel: string
    /** Opcionais: o rodapé só renderiza o que estiver preenchido. */
    email?: string
    telefone?: string
    site?: string
    instagram?: string
  }
}

export type { TemaOrcamento, TemaPreset, TemaToken } from './temas'
