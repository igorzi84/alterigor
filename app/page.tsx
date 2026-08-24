import { site } from '@/lib/site';

const principles = [
  ['Grounded', 'Answers will use only reviewed portfolio knowledge.'],
  ['Bounded', 'The assistant will not access private systems or take actions.'],
  ['Observable', 'Quality, safety, and cost checks will be visible in GitHub.'],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08111f] px-6 py-10 text-slate-100 sm:px-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300">
          {site.name.toUpperCase()}
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          A portfolio assistant for reliable platform engineering.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          A focused public portfolio and AI assistant built to explain Igor’s
          platform, Kubernetes, GitOps, and Python service experience with clear
          evidence and honest boundaries.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {principles.map(([title, detail]) => (
            <section
              className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"
              key={title}
            >
              <h2 className="font-semibold text-cyan-200">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
            </section>
          ))}
        </div>
        <section className="mt-12 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-6">
          <h2 className="text-xl font-semibold">Chat experience in progress</h2>
          <p className="mt-2 max-w-2xl text-slate-300">
            The foundation is live. The next pull requests add reviewed
            portfolio content, a limited-knowledge chat workflow, and public
            safety controls.
          </p>
        </section>
      </div>
    </main>
  );
}
