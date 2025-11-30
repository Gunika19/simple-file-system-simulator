import { Shield, Lock, Users } from "lucide-react"

export function FileFlowDiagram() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative rounded-xl border border-border bg-card p-8 md:p-12">
        {/* Main Flow Diagram */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-4">
          {/* Step 1: File Upload */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-border bg-background">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-10 w-10 text-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Your File</span>
          </div>

          {/* Arrow 1 */}
          <div className="hidden h-0.5 flex-1 bg-gradient-to-r from-border via-foreground/30 to-border md:block" />
          <div className="h-8 w-0.5 bg-gradient-to-b from-border via-foreground/30 to-border md:hidden" />

          {/* Step 2: Encryption (Center Shield) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground bg-foreground">
                <Shield className="h-12 w-12 text-background" />
              </div>
              {/* Encryption rings */}
              <div className="absolute -inset-2 animate-pulse rounded-full border border-foreground/20" />
              <div className="absolute -inset-4 rounded-full border border-foreground/10" />
            </div>
            <span className="text-sm font-medium">SecureShare</span>
            <span className="text-xs text-muted-foreground">AES-256 Encrypted</span>
          </div>

          {/* Arrow 2 */}
          <div className="hidden h-0.5 flex-1 bg-gradient-to-r from-border via-foreground/30 to-border md:block" />
          <div className="h-8 w-0.5 bg-gradient-to-b from-border via-foreground/30 to-border md:hidden" />

          {/* Step 3: Recipients */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-border bg-background">
              <Users className="h-10 w-10 text-foreground" />
            </div>
            <span className="text-sm font-medium">Recipients</span>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Zero-knowledge encryption</span>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Auto-expiring links</span>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <span>Access control</span>
          </div>
        </div>
      </div>
    </div>
  )
}
