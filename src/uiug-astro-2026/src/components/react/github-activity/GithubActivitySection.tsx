import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { GithubActivity } from '../../../lib/github-activity';
import { fetchGithubActivity } from '../../../lib/github-activity';
import ActivityTimeline from './ActivityTimeline';
import GithubActivityFallback from './GithubActivityFallback';

const SystemOverview = lazy(() => import('./SystemOverview'));

interface GithubActivitySectionProps {
  activity: GithubActivity;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function useWebglSupport(): boolean {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setOk(!!(c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

const GithubActivitySection: React.FC<GithubActivitySectionProps> = ({ activity: initialActivity }) => {
  const [activity, setActivity] = useState(initialActivity);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebglSupport();
  const show3d = webgl;

  useEffect(() => {
    setActivity(initialActivity);
  }, [initialActivity]);

  const syncLatest = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const fresh = await fetchGithubActivity(activity.profileUrl, { skipCache: true });
      if (fresh) {
        setActivity(fresh);
        setSyncMessage('SYNCED');
      } else {
        setSyncMessage('SYNC_FAILED');
      }
    } catch {
      setSyncMessage('SYNC_FAILED');
    } finally {
      setSyncing(false);
    }
  }, [activity.profileUrl, syncing]);

  useEffect(() => {
    if (!syncMessage || syncMessage === 'SYNC_FAILED') return;
    const t = window.setTimeout(() => setSyncMessage(null), 2500);
    return () => window.clearTimeout(t);
  }, [syncMessage]);

  return (
    <section aria-labelledby="github-activity-heading" className="mt-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-1 flex-grow bg-black dark:bg-white" />
        <h3
          id="github-activity-heading"
          className="font-display text-2xl uppercase text-black dark:text-white shrink-0"
        >
          GITHUB_ACTIVITY
        </h3>
        <div className="h-1 w-12 bg-primary" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="font-mono text-xs font-bold text-gray-500 uppercase">
          @{activity.username} // PUBLIC_SIGNAL_ONLY
        </p>
        <button
          type="button"
          onClick={() => void syncLatest()}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-black dark:border-white bg-white dark:bg-black font-mono text-[10px] font-bold uppercase text-black dark:text-white hover:bg-primary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Sync latest GitHub activity"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${syncing ? 'animate-spin' : ''}`} aria-hidden />
          {syncing ? 'SYNCING…' : 'SYNC_LATEST'}
        </button>
        {syncMessage && (
          <span
            className={`font-mono text-[10px] font-bold uppercase ${
              syncMessage === 'SYNCED' ? 'text-emerald-600' : 'text-primary'
            }`}
            role="status"
          >
            {syncMessage === 'SYNCED' ? '// SIGNAL_UPDATED' : '// SYNC_FAILED_RETRY'}
          </span>
        )}
      </div>

      <p className="sr-only">
        GitHub activity visualization showing total contributions, current projects, recent
        activity, open-source impact, packages, and repository history for {activity.username}.
      </p>

      <div className="space-y-10">
        {show3d ? (
          <Suspense
            fallback={
              <div
                className="border-4 border-black dark:border-white bg-black text-white flex items-center justify-center font-mono text-xs font-bold uppercase"
                style={{ height: 'min(52vh, 420px)', minHeight: 260 }}
                aria-busy="true"
              >
                LOADING_PLANETARY_TEXTURES…
              </div>
            }
          >
            <SystemOverview activity={activity} reducedMotion={reducedMotion} />
          </Suspense>
        ) : (
          <div>
            <h4 className="font-mono text-xs font-bold text-gray-500 uppercase mb-3">
              // SYSTEM_OVERVIEW
            </h4>
            <GithubActivityFallback activity={activity} />
            <p className="mt-2 font-mono text-[10px] font-bold text-gray-500 uppercase">
              WEBGL_UNAVAILABLE // TEXTUAL_FALLBACK_ACTIVE
            </p>
          </div>
        )}

        <ActivityTimeline activity={activity} />
      </div>

      <p className="mt-8 font-mono text-sm font-bold text-primary uppercase text-right">
        Keep coding. The universe is watching.
      </p>
    </section>
  );
};

export default GithubActivitySection;
