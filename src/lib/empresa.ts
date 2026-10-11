// Dados legais da empresa, iguais aos do cadastro verificado na Meta
// (portfólio Major Hub). A revisão do WhatsApp compara o site com esse
// cadastro: mudou aqui, mude lá também.
export const EMPRESA = {
  nomeFantasia: 'MajorHub',
  razaoSocial: '64.833.198 ESVANEI SANTANA DO NASCIMENTO JUNIOR',
  cnpj: '64.833.198/0001-77',
  endereco: {
    logradouro: 'Av. Governador Dante Martins de Oliveira',
    bairro: 'Campo Verde',
    cidade: 'Cuiabá',
    uf: 'MT',
    cep: '78050-889',
  },
  telefone: '+55 65 99217-8164',
  telefoneE164: '+5565992178164',
  email: 'cmo@majorhub.com.br',
  site: 'https://www.majorhub.com.br',
} as const

export const enderecoEmLinha = `${EMPRESA.endereco.logradouro}, ${EMPRESA.endereco.bairro}, ${EMPRESA.endereco.cidade} - ${EMPRESA.endereco.uf}, CEP ${EMPRESA.endereco.cep}`
