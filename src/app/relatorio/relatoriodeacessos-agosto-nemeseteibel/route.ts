import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'relatorio_acessos_nemeseteibel.html')
    const html = await fs.readFile(filePath, 'utf-8')
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error reading Nemes e Teibel report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
