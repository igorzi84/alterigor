import { profile } from '@/content/profile';
import { site } from '@/lib/site';
import { ChatPanel } from './components/chat-panel';
import { ContactForm } from './components/contact-form';
import { InsightsProvider } from './components/insights';
import { LinkedInProfileBadge } from './components/linkedin-profile-badge';
import { TrackedLink } from './components/tracked-link';

const navigation = [
  ['Work', '#work'],
  ['Experience', '#experience'],
  ['Approach', '#approach'],
] as const;

export default function Home() {
  return (
    <InsightsProvider>
      <main className="overflow-hidden bg-[#07111f] text-slate-100">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_75%_5%,rgba(14,116,144,0.28),transparent_33rem)]" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
          <a
            className="text-sm font-semibold tracking-[0.18em] text-cyan-200"
            href="#top"
          >
            {site.name.toUpperCase()}
          </a>
          <nav
            aria-label="Primary navigation"
            className="hidden gap-6 text-sm text-slate-300 sm:flex"
          >
            {navigation.map(([label, href]) => (
              <a
                className="transition hover:text-cyan-200"
                href={href}
                key={href}
              >
                {label}
              </a>
            ))}
          </nav>
        </header>

        <section
          className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 sm:px-10 sm:pb-32 sm:pt-24"
          id="top"
        >
          <div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300">
                PLATFORM ENGINEERING
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-7xl">
                {profile.headline}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                {profile.introduction}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  href="#work"
                >
                  Explore selected work
                </a>
                <a
                  className="rounded-full border border-cyan-300 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
                  href="#chat"
                >
                  Talk to AlterIgor
                </a>
                <a
                  className="rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100"
                  href="#contact"
                >
                  Contact Igor
                </a>
                <TrackedLink
                  className="rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100"
                  href={profile.contact.github}
                  event="github_click"
                  rel="noreferrer"
                  target="_blank"
                >
                  View GitHub
                </TrackedLink>
              </div>
              <dl className="mt-20 grid max-w-3xl gap-6 border-t border-slate-700 pt-7 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400">
                    FOCUS
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-200">
                    Cloud platforms and reliable services
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400">
                    TOOLKIT
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-200">
                    Kubernetes, GitOps, Python, observability
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400">
                    APPROACH
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-200">
                    Operationally grounded engineering
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section
          className="border-y border-slate-800 bg-slate-950/60 px-6 py-20 sm:px-10"
          id="chat"
        >
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300">
              ASK THE PORTFOLIO
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Talk to AlterIgor.
            </h2>
            <p className="mt-4 text-slate-300">
              It answers from Igor&apos;s approved portfolio information and
              says when it does not know.
            </p>
            <ChatPanel />
          </div>
        </section>

        <section
          className="border-y border-slate-800 bg-slate-950/60"
          id="work"
        >
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300">
              SELECTED WORK
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Systems designed for clear operational outcomes.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-700 bg-slate-700 lg:grid-cols-3">
              {profile.projects.map((project) => (
                <article
                  className="flex flex-col bg-[#0b1728] p-7"
                  key={project.name}
                >
                  <h3 className="text-xl font-semibold text-slate-100">
                    {project.name}
                  </h3>
                  <p className="mt-4 flex-1 leading-7 text-slate-300">
                    {project.description}
                  </p>
                  <ul
                    aria-label={`${project.name} technologies`}
                    className="mt-7 flex flex-wrap gap-2"
                  >
                    {project.technologies.map((technology) => (
                      <li
                        className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-medium text-cyan-100"
                        key={technology}
                      >
                        {technology}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28"
          id="experience"
        >
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300">
                EXPERIENCE
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                A long view of infrastructure.
              </h2>
            </div>
            <ol className="divide-y divide-slate-800 border-t border-slate-800">
              {profile.experience.map((role) => (
                <li
                  className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr]"
                  key={`${role.company}-${role.period}`}
                >
                  <p className="text-sm text-slate-400">{role.period}</p>
                  <div>
                    <h3 className="font-semibold text-slate-100">
                      {role.role}
                    </h3>
                    <p className="mt-1 text-slate-300">{role.company}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-cyan-300 px-6 py-20 text-slate-950 sm:px-10 sm:py-28"
          id="approach"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-cyan-950/70">
                ENGINEERING APPROACH
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Build systems that are easier to operate.
              </h2>
            </div>
            <div>
              <p className="max-w-2xl text-lg leading-8 text-slate-800">
                The portfolio focuses on the practical work behind reliable
                platforms: clear deployment paths, observable services, secure
                configuration, and durable workflow automation.
              </p>
              <ul
                className="mt-8 flex flex-wrap gap-2"
                aria-label="Core skills"
              >
                {profile.skills.map((skill) => (
                  <li
                    className="rounded-full border border-slate-950/20 px-3 py-1.5 text-sm font-medium"
                    key={skill}
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 sm:px-10" id="contact">
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300">
            CONTACT
          </p>
          <h2 className="mt-5 text-3xl font-semibold sm:text-5xl">
            Start a conversation.
          </h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-start">
            <ContactForm className="mt-0" />
            <aside className="mx-auto w-full max-w-[310px] lg:mx-0 lg:justify-self-end">
              <LinkedInProfileBadge className="mt-0" />
            </aside>
          </div>
        </section>

        <footer className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <div className="flex gap-5">
            <TrackedLink
              aria-label="Connect with Igor Zilberman on LinkedIn"
              className="transition hover:text-cyan-200"
              href={profile.contact.linkedin}
              event="linkedin_click"
              rel="noreferrer"
              target="_blank"
            >
              LinkedIn
            </TrackedLink>
            <TrackedLink
              className="transition hover:text-cyan-200"
              href={profile.contact.github}
              event="github_click"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </TrackedLink>
          </div>
        </footer>
      </main>
    </InsightsProvider>
  );
}
