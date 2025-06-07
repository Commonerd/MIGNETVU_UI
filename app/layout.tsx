import "./globals.css"
import { ReactNode } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"

export default function RootLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient()
  return (
    <html lang="ko">
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <QueryClientProvider client={queryClient}>
            <Header />
            <main>{children}</main>
            <Footer />
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
