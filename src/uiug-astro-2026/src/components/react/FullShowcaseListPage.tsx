import React, { useState } from 'react';
import { ArrowLeft, Search, Terminal, Layers, Cpu, ArrowUpRight } from 'lucide-react';
import { allProjects } from '../../data/projects';

const FullShowcaseListPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'COMMERCE' | 'FINTECH' | 'GOVT' | 'ENTERPRISE' | 'STARTUP'>('ALL');
  const [search, setSearch] = useState('');

  const filteredProjects = allProjects.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.category === filter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.stack.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-y-auto">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" />

      <div className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b-4 border-black dark:border-white p-4 md:p-6 flex justify-between items-center plastic-surface relative z-10">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="group bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-primary hover:text-black transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </a>
          <h2 className="text-2xl md:text-4xl font-display font-black uppercase text-black dark:text-white leading-none hidden md:block">
            PROJECT_ARCHIVE_V1
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 w-64 focus-within:ring-2 ring-primary">
            <Terminal className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="QUERY_DATABASE.SH"
              className="bg-transparent border-none outline-none font-mono text-sm font-bold w-full uppercase text-black dark:text-white placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-primary text-black px-3 py-1 font-mono font-bold text-xs border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            BUILDS: {filteredProjects.length}
          </div>
        </div>
      </div>

      <div className="w-full p-4 md:p-8 relative z-10">
        <h2 className="md:hidden text-4xl font-display font-black uppercase text-black dark:text-white leading-none mb-6">
          PROJECT_ARCHIVE
        </h2>

        <div className="md:hidden flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 mb-6 focus-within:ring-2 ring-primary">
          <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="SEARCH_PROJECTS..."
            className="bg-transparent border-none outline-none font-mono text-sm font-bold w-full uppercase text-black dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {(['ALL', 'COMMERCE', 'FINTECH', 'GOVT', 'ENTERPRISE', 'STARTUP'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 border-2 border-black dark:border-white font-display uppercase text-sm md:text-lg transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
                filter === cat
                  ? 'bg-primary text-black'
                  : 'bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-white dark:bg-black border-4 border-black dark:border-white p-4 shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-2 hover:shadow-brutal-red transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative aspect-video border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-900 mb-6 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute top-2 left-2 bg-primary text-black px-2 py-0.5 font-mono font-bold text-[10px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {project.year}
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2 font-mono text-[10px] font-bold text-gray-500 uppercase">
                  <Layers className="w-3 h-3 shrink-0" />
                  <span>{project.client}</span>
                </div>

                <h3 className="text-2xl font-display font-black uppercase text-black dark:text-white leading-[0.9] mb-4 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>

                <p className="font-mono text-sm font-bold text-black dark:text-white mb-6 leading-relaxed opacity-80 flex-grow">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 border-2 border-black dark:border-white text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-900 text-black dark:text-white flex items-center gap-1"
                    >
                      <Cpu className="w-3 h-3 shrink-0" /> {tech}
                    </span>
                  ))}
                </div>

                <a
                  href={`/projects/${project.id}`}
                  className="w-full bg-black text-white dark:bg-white dark:text-black py-3 font-display text-base uppercase border-2 border-transparent hover:bg-accent-yellow hover:text-black hover:border-black dark:hover:border-white transition-all flex items-center justify-between px-4 group/btn"
                >
                  EXPLORE_BUILD
                  <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Terminal className="w-16 h-16 mb-4 text-gray-400" />
            <p className="font-mono font-bold text-xl uppercase">NO_BUILDS_MATCHED</p>
            <p className="font-mono text-sm">RETRY_SEARCH_PARAMETERS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullShowcaseListPage;
