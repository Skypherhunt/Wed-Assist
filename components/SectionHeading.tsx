import Ornament from "./Ornament";
import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-12 text-center">
      <Reveal>
        <p className="eyebrow mb-4">{eyebrow}</p>
      </Reveal>
      <Reveal delay={90}>
        <h2 className="display text-3xl sm:text-5xl">{title}</h2>
      </Reveal>
      <Reveal delay={170} className="my-6">
        <Ornament className="mx-auto" />
      </Reveal>
      {subtitle && (
        <Reveal delay={240}>
          <p className="mx-auto max-w-2xl font-body text-muted">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
