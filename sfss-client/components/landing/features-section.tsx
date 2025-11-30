import { Shield, Zap, Eye, Trash2, Globe, Key } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "End-to-end encryption",
    description: "Files are encrypted on your device before upload. We never see your unencrypted data.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Optimized infrastructure ensures your files are available instantly to recipients.",
  },
  {
    icon: Eye,
    title: "Access tracking",
    description: "See exactly who accessed your files and when. Full transparency over your shared content.",
  },
  {
    icon: Trash2,
    title: "Auto-deletion",
    description: "Files are permanently deleted after expiration. No traces left behind.",
  },
  {
    icon: Globe,
    title: "Share anywhere",
    description: "Recipients don't need an account. Just a secure link delivered to their email.",
  },
  {
    icon: Key,
    title: "Granular permissions",
    description: "Control who can view, download, or forward your files with detailed permissions.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Security without sacrifice</h2>
          <p className="text-lg text-muted-foreground">
            Built for teams and individuals who value privacy and simplicity equally.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted transition-colors group-hover:bg-foreground group-hover:text-background">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
