import type { AppProps } from 'next/app'
import { ACNHPocketPokeProvider } from '@/context/ACNHPocketPokeContext'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ACNHPocketPokeProvider>
      <Component {...pageProps} />
    </ACNHPocketPokeProvider>
  )
}

export default MyApp
