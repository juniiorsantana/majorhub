/**
 * Limite de requisições em memória, por instância serverless.
 *
 * Imperfeito de propósito — cada instância conta a sua parte —, mas barra o
 * abuso básico sem depender de serviço externo. O mesmo desenho que
 * `/api/diagnostico` já usava.
 */
export function criarLimite(janelaMs: number, maximo: number) {
  const acessos = new Map<string, number[]>()

  return function limitado(chave: string, agora: number = Date.now()): boolean {
    const recentes = (acessos.get(chave) || []).filter(t => agora - t < janelaMs)
    if (recentes.length >= maximo) {
      acessos.set(chave, recentes)
      return true
    }
    recentes.push(agora)
    acessos.set(chave, recentes)
    if (acessos.size > 5000) {
      for (const [k, tempos] of acessos) {
        if (tempos.every(t => agora - t >= janelaMs)) acessos.delete(k)
      }
    }
    return false
  }
}
