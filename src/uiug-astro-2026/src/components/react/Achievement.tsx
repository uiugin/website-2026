import React from 'react';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { Reveal } from './Reveal';
import type { AchievementProps } from '../../lib/achievement-mapper';

interface Props {
  achievement?: AchievementProps | null;
}

const Achievement: React.FC<Props> = ({ achievement }) => {
  if (!achievement?.category) return null;

  const contributors = achievement.contributors ?? [];
  const hasContributors = contributors.length > 0;
  const linkTarget = achievement.linkTarget ?? '_blank';
  const isExternal =
    linkTarget === '_blank' || /^https?:\/\//i.test(achievement.linkUrl ?? '');

  return (
    <section
      className="w-full relative z-10 mb-20 md:mb-28"
      id="achievement"
      aria-labelledby="achievement-heading"
    >
      <Reveal width="100%">
        <div className="px-4 md:px-10 mb-6 md:mb-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            // {achievement.title || 'ACHIEVEMENT_UNLOCKED'}
          </p>
        </div>
      </Reveal>

      <Reveal width="100%" delay={0.08}>
        <article className="group relative mx-4 md:mx-10 overflow-hidden bg-accent-yellow text-black border-4 border-black dark:border-white rotate-1 scale-[1.01] shadow-brutal-black dark:shadow-brutal-white hover:rotate-0 hover:scale-100 transition-transform duration-500">
          <div className="absolute inset-0 lego-studs opacity-10 pointer-events-none" aria-hidden />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 px-6 md:px-10 lg:px-12 py-10 md:py-14 items-center">
            <div className="lg:col-span-4 flex flex-col gap-4">
              {(achievement.event || achievement.year) && (
                <div className="inline-flex items-center gap-3 self-start bg-black text-accent-yellow px-3 py-2 border-2 border-black font-mono text-xs font-bold uppercase tracking-widest">
                  <Trophy className="w-4 h-4 shrink-0" aria-hidden />
                  {achievement.event && <span>{achievement.event}</span>}
                  {achievement.event && achievement.year && <span aria-hidden>·</span>}
                  {achievement.year && <span>{achievement.year}</span>}
                </div>
              )}

              {achievement.context && (
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/70">
                  {achievement.context}
                </p>
              )}

              {hasContributors && (
                <div className="mt-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/70 mb-3">
                    // CONTRIBUTORS
                  </p>
                  <ul className="flex flex-wrap gap-2" aria-label="GitHub contributors">
                    {contributors.map((person) => (
                      <li key={person.login}>
                        <a
                          href={person.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${person.login} · ${person.contributions} commits`}
                          className="block w-10 h-10 md:w-11 md:h-11 border-2 border-black bg-black overflow-hidden hover:scale-110 hover:z-10 relative transition-transform"
                        >
                          <img
                            src={person.avatarUrl}
                            alt={person.login}
                            width={44}
                            height={44}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {achievement.githubUrl && (
                    <a
                      href={achievement.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-black/80 underline underline-offset-2 hover:text-black"
                    >
                      VIEW_REPO
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col gap-5">
              <div>
                {achievement.placement && (
                  <p className="font-mono text-sm font-bold uppercase tracking-[0.25em] mb-2">
                    {achievement.placement}
                  </p>
                )}
                <h2
                  id="achievement-heading"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase leading-[0.85] tracking-tighter text-black"
                >
                  {achievement.category}
                </h2>
                {achievement.partners && (
                  <p className="mt-4 font-mono text-sm md:text-base font-bold uppercase tracking-wide text-black/85">
                    {achievement.partners}
                  </p>
                )}
                {achievement.description && (
                  <p className="mt-3 max-w-2xl font-mono text-sm font-medium leading-relaxed text-black/90">
                    {achievement.description}
                  </p>
                )}
              </div>

              {achievement.linkUrl && (
                <a
                  href={achievement.linkUrl}
                  target={linkTarget || undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-3 self-start bg-black text-white px-5 py-3 font-display text-base uppercase border-4 border-black hover:bg-white hover:text-black transition-colors"
                >
                  {achievement.linkLabel || 'READ MORE'}
                  <ArrowUpRight className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </article>
      </Reveal>
    </section>
  );
};

export default Achievement;
