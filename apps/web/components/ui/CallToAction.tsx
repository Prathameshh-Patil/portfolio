import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRight, Download } from "@/components/ui/icons";
import { profile, resumeFile } from "@/features/profile/profile";

// Closing band at the bottom of the main pages: one clear next step.
export function CallToAction({ title = "Let's build something that works." }: { title?: string }) {
  return (
    <section aria-labelledby="cta-heading" className="reveal relative isolate overflow-hidden rounded-3xl bg-text px-6 py-14 text-bg sm:px-12 sm:py-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_85%_0%,rgb(16_185_129/0.35),transparent_70%),radial-gradient(40%_70%_at_0%_100%,rgb(34_211_238/0.22),transparent_70%)]"
      />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-70">{profile.availability}</p>
          <h2 id="cta-heading" className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 leading-relaxed opacity-75">
            Open to {profile.openTo.join(", ")} roles. Send a message and I&apos;ll reply by email.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/contact" size="lg" variant="inverse">
            Get in touch <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </ButtonLink>
          <ButtonLink href={resumeFile} download size="lg" variant="inverse-outline">
            <Download /> Resume
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
