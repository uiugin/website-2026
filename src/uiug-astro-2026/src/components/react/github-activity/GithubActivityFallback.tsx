import React from 'react';
import type { GithubActivity } from '../../../lib/github-activity';
import { buildCelestialBodies } from './planetMetrics';

interface GithubActivityFallbackProps {
  activity: GithubActivity;
}

const GithubActivityFallback: React.FC<GithubActivityFallbackProps> = ({ activity }) => {
  const bodies = buildCelestialBodies(activity);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list">
      {bodies
        .filter((b) => !String(b.id).startsWith('asteroid-') || b.metrics.length > 0)
        .slice(0, 8)
        .map((body) => (
          <article
            key={body.id}
            role="listitem"
            className="border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900 p-4"
          >
            <h5 className="font-display text-lg uppercase text-black dark:text-white mb-3 border-b-2 border-black dark:border-white pb-2">
              {body.label}
            </h5>
            <dl className="space-y-2">
              {body.metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-0.5">
                  <dt className="font-mono text-[10px] font-bold text-gray-500 uppercase">{m.label}</dt>
                  <dd className="font-mono text-sm font-bold text-black dark:text-white uppercase break-words">
                    {body.href && m === body.metrics[0] ? (
                      <a
                        href={body.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline-offset-2 hover:underline"
                      >
                        {m.value}
                      </a>
                    ) : (
                      m.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
    </div>
  );
};

export default GithubActivityFallback;
