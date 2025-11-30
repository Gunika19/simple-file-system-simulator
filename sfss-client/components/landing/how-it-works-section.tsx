import { Upload, Clock, Mail, Check } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your file",
    description:
      "Drag and drop or select any file up to 10GB. Your file is encrypted before it ever leaves your device.",
  },
  {
    number: "02",
    icon: Clock,
    title: "Set expiration",
    description: "Choose when your file should be automatically deleted. From 1 hour to 30 days — you're in control.",
  },
  {
    number: "03",
    icon: Mail,
    title: "Add recipients",
    description:
      "Enter the email addresses of people who should access your file. Only they can decrypt and download it.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="border-y border-border bg-muted/50 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to share files securely. No complicated setup required.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute left-full top-12 hidden h-0.5 w-full -translate-y-1/2 bg-border md:block" />
                )}

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground">
                      <step.icon className="h-6 w-6 text-background" />
                    </div>
                    <span className="text-4xl font-bold text-muted-foreground/30">{step.number}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Done indicator */}
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
                <Check className="h-4 w-4 text-background" />
              </div>
              <span className="font-medium">Done! Your file is shared securely.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
