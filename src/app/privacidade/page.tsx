import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { BlogFooter } from '@/components/blog/BlogFooter'
import { EMPRESA, enderecoEmLinha } from '@/lib/empresa'

const ATUALIZADA_EM = '11 de outubro de 2026'

export const metadata: Metadata = {
  title: 'Política de Privacidade — MajorHub',
  description:
    'Como a MajorHub coleta, usa, guarda e protege dados pessoais no site, no WhatsApp e na plataforma Núcleo Major, conforme a LGPD.',
  alternates: { canonical: '/privacidade' },
}

function Secao({ id, titulo, children }: { id?: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 mt-12">
      <h2 className="font-sora text-xl md:text-2xl font-bold text-[#0a2540] mb-4">{titulo}</h2>
      <div className="space-y-4 text-slate-600 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#f6f9fc] text-[#0a2540]">
      <Navbar />

      <article className="relative pt-32 md:pt-40 pb-24 px-6">
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0099ff] transition-colors mb-8"
          >
            ← Voltar para o início
          </Link>

          <h1 className="font-sora text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Política de Privacidade
          </h1>
          <p className="text-slate-500 text-sm">Última atualização: {ATUALIZADA_EM}</p>

          <Secao titulo="1. Quem somos">
            <p>
              A <strong>{EMPRESA.nomeFantasia}</strong> é o nome comercial de{' '}
              <strong>{EMPRESA.razaoSocial}</strong>, inscrita no CNPJ sob o nº{' '}
              <strong>{EMPRESA.cnpj}</strong>, com endereço em {enderecoEmLinha}.
            </p>
            <p>
              Somos uma agência de marketing e tecnologia. Além deste site, operamos o{' '}
              <strong>Núcleo Major</strong>, nossa plataforma de atendimento e CRM, que conecta
              empresas clientes ao WhatsApp para organizar conversas, contatos, agenda e
              atendimento com apoio de inteligência artificial.
            </p>
            <p>
              Esta política explica quais dados pessoais tratamos, por que, com quem compartilhamos
              e como você exerce seus direitos, conforme a Lei Geral de Proteção de Dados
              (Lei nº 13.709/2018 — LGPD).
            </p>
          </Secao>

          <Secao titulo="2. Que dados coletamos">
            <p><strong>No site</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Dados que você informa nos formulários (por exemplo, no diagnóstico gratuito): nome,
                número de WhatsApp, e-mail e o endereço do site que você pediu para analisarmos.
              </li>
              <li>
                Dados técnicos de acesso: endereço IP, tipo de navegador e páginas acessadas,
                registrados pelos servidores de hospedagem para segurança e prevenção de abuso.
              </li>
            </ul>
            <p><strong>No WhatsApp e na plataforma Núcleo Major</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Quando você fala com a MajorHub pelo WhatsApp: seu número, nome de perfil e o
                conteúdo das mensagens, incluindo áudios, imagens e documentos que você enviar.
              </li>
              <li>
                Quando você fala com uma empresa cliente que usa o Núcleo Major: os mesmos dados
                acima, tratados em nome dessa empresa (veja o item 4).
              </li>
            </ul>
          </Secao>

          <Secao titulo="3. Para que usamos">
            <ul className="list-disc pl-6 space-y-2">
              <li>Responder seus contatos, enviar propostas e prestar os serviços contratados.</li>
              <li>Gerar o diagnóstico do site que você solicitou.</li>
              <li>
                Organizar o atendimento: histórico de conversas, ficha do contato, agenda e
                tarefas da equipe.
              </li>
              <li>
                Sugerir ou redigir respostas com inteligência artificial, sempre sob as regras
                definidas pela empresa responsável pelo atendimento.
              </li>
              <li>Manter a segurança do site e da plataforma e cumprir obrigações legais.</li>
            </ul>
            <p>
              As bases legais são: execução de contrato ou de procedimentos preliminares a pedido
              do titular, legítimo interesse (segurança e melhoria do atendimento), cumprimento de
              obrigação legal e, quando aplicável, o seu consentimento.
            </p>
            <p>Não vendemos dados pessoais.</p>
          </Secao>

          <Secao titulo="4. Quando tratamos dados em nome de clientes">
            <p>
              Para as empresas que usam o Núcleo Major, a MajorHub atua como{' '}
              <strong>operadora</strong>: tratamos as conversas e os contatos conforme as instruções
              da empresa cliente, que é a <strong>controladora</strong> desses dados. Se você falou
              com uma dessas empresas e quer exercer seus direitos, procure primeiro a própria
              empresa. Também podemos encaminhar o seu pedido a ela.
            </p>
          </Secao>

          <Secao titulo="5. Com quem compartilhamos">
            <p>Somente com fornecedores necessários para operar os serviços:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Meta Platforms (WhatsApp), para enviar e receber mensagens;</li>
              <li>provedores de hospedagem, banco de dados e servidores em nuvem;</li>
              <li>provedores de inteligência artificial, para processar mensagens quando a IA está ativa;</li>
              <li>autoridades públicas, quando exigido por lei ou ordem judicial.</li>
            </ul>
            <p>
              Alguns desses fornecedores podem armazenar dados fora do Brasil. Nesses casos,
              exigimos garantias de proteção compatíveis com a LGPD.
            </p>
          </Secao>

          <Secao titulo="6. Cookies">
            <p>
              Este site usa apenas cookies essenciais ao funcionamento, como os que mantêm o acesso
              às áreas restritas. Hoje não usamos cookies de publicidade. Se isso mudar, por
              exemplo com ferramentas de mensuração de anúncios, esta política será atualizada.
            </p>
          </Secao>

          <Secao titulo="7. Por quanto tempo guardamos">
            <p>
              Guardamos os dados pelo tempo necessário às finalidades acima ou pelo prazo exigido
              por lei. Os dados tratados em nome de clientes seguem o prazo definido pela empresa
              cliente e são excluídos ou devolvidos ao fim do contrato.
            </p>
          </Secao>

          <Secao titulo="8. Segurança">
            <p>
              Usamos conexão criptografada (HTTPS), controle de acesso por empresa e por usuário,
              credenciais separadas por conexão e registros de acesso. Nenhum sistema é
              invulnerável. Se houver um incidente relevante, avisaremos os afetados e a ANPD,
              conforme a lei.
            </p>
          </Secao>

          <Secao titulo="9. Seus direitos">
            <p>
              Você pode pedir a qualquer momento: confirmação de que tratamos seus dados, acesso,
              correção, anonimização, portabilidade, exclusão, informação sobre compartilhamentos e
              revogação do consentimento. Também pode reclamar à Autoridade Nacional de Proteção
              de Dados (ANPD).
            </p>
          </Secao>

          <Secao id="exclusao" titulo="10. Como pedir a exclusão dos seus dados">
            <p>
              Envie um e-mail para{' '}
              <a href={`mailto:${EMPRESA.email}`} className="text-[#0099ff] font-semibold">
                {EMPRESA.email}
              </a>{' '}
              ou uma mensagem pelo WhatsApp {EMPRESA.telefone} com o assunto “Exclusão de dados” e o
              número ou e-mail usado no contato. Confirmamos o pedido e concluímos a exclusão em até
              15 dias, exceto os dados que a lei nos obriga a manter.
            </p>
          </Secao>

          <Secao titulo="11. Contato do encarregado (DPO)">
            <p>
              Dúvidas sobre esta política ou sobre seus dados:{' '}
              <a href={`mailto:${EMPRESA.email}`} className="text-[#0099ff] font-semibold">
                {EMPRESA.email}
              </a>{' '}
              · {EMPRESA.telefone} · {enderecoEmLinha}.
            </p>
            <p>
              Podemos atualizar esta política. A data da última atualização fica sempre no topo
              desta página.
            </p>
          </Secao>
        </div>
      </article>

      <BlogFooter />
    </main>
  )
}
