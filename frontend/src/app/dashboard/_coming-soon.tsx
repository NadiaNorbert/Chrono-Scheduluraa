import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  /** Emoji icon shown in the hero (e.g. "📅") */
  emoji: string;
  /** Optional lucide icon for the badge */
  Icon?: LucideIcon;
  /** Optional list of planned features to show as bullets */
  features?: string[];
}

/**
 * Premium "coming soon" placeholder shared by all unimplemented pages.
 *
 * Renders inside the dashboard layout (sidebar + topbar already present).
 * Shows a back link, hero icon, title, description, feature list, and
 * a milestone badge.
 */
export function ComingSoonPage({
  title,
  description,
  emoji,
  features,
}: ComingSoonPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to dashboard
      </Link>

      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-6 py-16">
        {/* Emoji icon with glow */}
        <div className="relative flex size-24 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/20 shadow-sm">
          <span className="text-5xl select-none" role="img" aria-label={title}>
            {emoji}
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            {description}
          </p>
        </div>

        {/* Planned features */}
        {features && features.length > 0 && (
          <ul className="mt-2 space-y-2 text-left w-full max-w-sm">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 size-4 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="size-1.5 rounded-full bg-primary" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Milestone badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-medium text-primary mt-2">
          <Clock className="size-3.5" />
          Under development — coming soon
        </div>
      </div>
    </div>
  );
}
