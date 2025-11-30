import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="border-t border-border bg-muted/50 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Ready to share securely?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users who trust SecureShare for their sensitive file transfers. Start for free, no credit
            card required.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Free plan includes 5GB storage and unlimited file shares</p>
        </div>
      </div>
    </section>
  )
}
