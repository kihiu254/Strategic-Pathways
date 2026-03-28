import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './i18n/config'
import App from './App.tsx'

const STALE_CHUNK_RELOAD_KEY = 'sp:stale-chunk-reload'

const scheduleChunkFailureRecovery = () => {
  if (typeof window === 'undefined') return

  window.setTimeout(() => {
    window.sessionStorage.removeItem(STALE_CHUNK_RELOAD_KEY)
  }, 10000)

  const recoverFromStaleChunk = () => {
    if (window.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) === '1') {
      window.sessionStorage.removeItem(STALE_CHUNK_RELOAD_KEY)
      return
    }

    window.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, '1')
    window.location.reload()
  }

  const isChunkLoadFailure = (message: string) =>
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module')

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    recoverFromStaleChunk()
  })

  window.addEventListener('error', (event) => {
    if (isChunkLoadFailure(event.message || '')) {
      event.preventDefault()
      recoverFromStaleChunk()
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    const message =
      event.reason instanceof Error
        ? event.reason.message
        : typeof event.reason === 'string'
          ? event.reason
          : ''

    if (isChunkLoadFailure(message)) {
      event.preventDefault()
      recoverFromStaleChunk()
    }
  })
}

scheduleChunkFailureRecovery()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
