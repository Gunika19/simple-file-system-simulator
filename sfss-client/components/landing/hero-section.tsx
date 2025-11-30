import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { FileFlowDiagram } from "./file-flow-diagram"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <span className="mr-2 h-2 w-2 rounded-full bg-foreground"></span>
          End-to-end encrypted file sharing
        </div>
        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Share files securely.
          <br />
          <span className="text-muted-foreground">No complexity.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
          Upload your file, set an expiration, and share with specific people. Your files are encrypted and
          automatically deleted when they expire.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in to your account</Link>
          </Button>
        </div>
      </div>

      {/* Hero Diagram */}
      <div className="mt-20">
        <FileFlowDiagram />
      </div>
    </section>
  )
}
