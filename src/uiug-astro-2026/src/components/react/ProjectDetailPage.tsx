import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Database, Cpu, ExternalLink, Code, Layout, Zap } from 'lucide-react';
import { SiGithub } from './SocialIcons';
import type { Project } from '../../data/projects';

interface ProjectDetailPageProps {
  project: Project;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project }) => {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" />

      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b-4 border-black dark:border-white plastic-surface p-4 md:p-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <a
            href="/projects"
            className="group bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-primary hover:text-black transition-colors"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </a>
          <h2 className="text-xl md:text-3xl font-display font-black uppercase text-black dark:text-white leading-none">
            BUILD_LOG // {project.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-accent-yellow text-black px-3 py-1 font-mono font-bold text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hidden md:block">
            DEPLOYED_V{project.year}.0
          </div>
        </div>
      </header>

      <div style={{ minHeight: headerHeight || 80 }} aria-hidden="true" />

      <div className="max-w-7xl mx-auto p-4 md:p-12 relative z-10">
        <div className="relative mb-16 border-8 border-black dark:border-white shadow-brutal-black dark:shadow-brutal-white overflow-hidden group">
          <div className="aspect-video md:aspect-[21/9] overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              width={1280}
              height={549}
              fetchPriority="high"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/80 to-transparent flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-primary font-black uppercase mb-2">
                <Database className="w-5 h-5 shrink-0" /> // PROJECT_ID: {project.id}
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-black uppercase text-white leading-none tracking-tighter">
                {project.title}
              </h1>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="bg-primary text-black px-8 py-4 font-display text-xl uppercase border-4 border-black shadow-brutal-black hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3"
              >
                LAUNCH_LIVE <ExternalLink className="w-6 h-6 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
          <div className="lg:col-span-8">
            <section className="mb-16">
              <h3 className="font-display text-3xl uppercase text-black dark:text-white border-b-4 border-black dark:border-white pb-4 mb-8 flex items-center gap-4">
                <Code className="w-8 h-8 text-primary shrink-0" /> PROJECT_OVERVIEW
              </h3>
              <p className="font-mono text-xl md:text-2xl font-bold text-black dark:text-white mb-8 leading-relaxed">
                {project.description}
              </p>
              <div className="prose prose-xl dark:prose-invert font-mono max-w-none text-gray-700 dark:text-gray-400 leading-relaxed">
                {project.longDescription ||
                  'Detailed technical documentation for this build is currently being indexed. This project represents a significant milestone in the Umbraco India community showcase, demonstrating advanced implementation patterns and architectural excellence.'}
              </div>
            </section>

            {project.gallery && project.gallery.length > 0 && (
              <section className="mb-16">
                <h3 className="font-display text-3xl uppercase text-black dark:text-white border-b-4 border-black dark:border-white pb-4 mb-8 flex items-center gap-4">
                  <Layout className="w-8 h-8 text-primary shrink-0" /> INTERFACE_GALLERY
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="border-4 border-black dark:border-white p-2 bg-white dark:bg-black shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-2 transition-transform"
                    >
                      <img src={img} alt={`Gallery ${idx + 1}`} width={640} height={360} loading="lazy" className="w-full aspect-video object-cover grayscale hover:grayscale-0 transition-all" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-black text-white dark:bg-white dark:text-black p-8 border-4 border-black dark:border-white shadow-brutal-red">
                <h4 className="font-display text-2xl uppercase mb-6 flex items-center gap-3">
                  <Cpu className="w-6 h-6 shrink-0" /> TECH_STACK
                </h4>
                <div className="flex flex-col gap-4">
                  {project.stack.map((tech) => (
                    <div
                      key={tech}
                      className="flex items-center justify-between border-b border-white/20 dark:border-black/20 pb-2 font-mono font-bold uppercase"
                    >
                      <span>{tech}</span>
                      <Zap className="w-4 h-4 text-primary shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-900 p-8 border-4 border-black dark:border-white">
                <h4 className="font-display text-2xl uppercase mb-6">PROJECT_SPECS</h4>
                <div className="space-y-6">
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">CLIENT_ENTITY</span>
                    <span className="text-xl font-display uppercase text-black dark:text-white">{project.client}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">DEPLOYMENT_YEAR</span>
                    <span className="text-xl font-display uppercase text-black dark:text-white">{project.year}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">CATEGORY_TAG</span>
                    <span className="text-xl font-display uppercase text-black dark:text-white">{project.category}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full group bg-white dark:bg-black border-4 border-black dark:border-white p-6 font-display text-2xl uppercase hover:bg-primary hover:text-black transition-all shadow-brutal-black dark:shadow-brutal-white flex items-center justify-between"
              >
                VIEW_REPO <SiGithub className="w-8 h-8 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
