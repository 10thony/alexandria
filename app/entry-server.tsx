import { renderToStream } from 'react-dom/server'
import { StartServer } from '@tanstack/start/server'
import { createRouter } from './router'

const router = createRouter()

export default async function handleRequest(request: Request) {
  const url = new URL(request.url)
  
  const stream = await renderToStream(<StartServer router={router} url={url} />, {
    onError(error) {
      console.error(error)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

