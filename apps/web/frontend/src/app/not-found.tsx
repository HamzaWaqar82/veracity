import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-section pt-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-6xl font-semibold leading-none text-primary sm:text-7xl">
          404
        </p>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          The address may have moved, or never existed. Start from the home page, browse the
          resources, or ask the assistant about anything else.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/resources" className="btn btn-outline">
            Browse resources
          </Link>
          <Link href="/pricing" className="btn btn-outline">
            See pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
