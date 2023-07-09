import '@/styles/globals.css'
import "@/styles/markdown.css"
import "@/styles/tagInputs.css"

import { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Component {...pageProps}/>
    )
}
