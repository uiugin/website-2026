import React from 'react';
import { motion } from 'framer-motion';
import { Map, ArrowRight, Home, Globe, User, Layout, Calendar, MessageSquare, HelpCircle, Share2 } from 'lucide-react';

const links = [
  { name: 'Home Base', path: '/', icon: Home },
  { name: 'Event Sector', path: '/#events', icon: Calendar },
  { name: 'Speaker Squad', path: '/#speakers', icon: User },
  { name: 'Project Showcase', path: '/#projects', icon: Layout },
  { name: 'The Grid (Gallery)', path: '/#gallery', icon: Globe },
  { name: 'Intel (FAQ)', path: '/#faq', icon: HelpCircle },
  { name: 'Comm Link (Contact)', path: '/#contact', icon: MessageSquare },
  { name: 'Join the Resistance', path: '/#join', icon: Share2 },
  { name: 'Events Archive', path: '/events', icon: Calendar },
  { name: 'Speakers Roster', path: '/speakers', icon: User },
  { name: 'Projects Archive', path: '/projects', icon: Layout },
  { name: 'System Error (404)', path: '/404', icon: Map },
  { name: 'Critical Failure (500)', path: '/500', icon: Map },
];

const SitemapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6 md:p-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-20 border-b-8 border-black dark:border-white pb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary text-white p-2 border-4 border-black dark:border-white">
              <Map size={32} className="shrink-0" />
            </div>
            <span className="font-black uppercase tracking-widest text-xl font-display">System Manifest</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black uppercase italic leading-none tracking-tighter font-display">
            SITEMAP
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section>
            <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-3 font-display">
              <div className="w-8 h-8 bg-black dark:bg-white shrink-0" />
              Main Navigation
            </h2>
            <div className="space-y-4">
              {links.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.path + link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <a
                      href={link.path}
                      className="group flex items-center justify-between p-6 border-4 border-black dark:border-white hover:bg-primary hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={20} className="shrink-0" />
                        <span className="text-2xl font-black uppercase italic font-display">{link.name}</span>
                      </div>
                      <ArrowRight size={20} className="shrink-0 group-hover:translate-x-2 transition-transform" />
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="space-y-12">
            <div>
              <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-3 font-display">
                <div className="w-8 h-8 bg-accent-yellow border-4 border-black shrink-0" />
                Legal & Info
              </h2>
              <div className="space-y-4">
                {['Privacy Protocol', 'Terms of Engagement', 'Cookie Policy'].map((item) => (
                  <div
                    key={item}
                    className="p-6 border-4 border-black dark:border-white opacity-50 cursor-not-allowed flex items-center justify-between"
                  >
                    <span className="text-xl font-black uppercase italic font-display">{item}</span>
                    <span className="text-xs font-bold uppercase bg-black text-white px-2 py-1 dark:bg-white dark:text-black">
                      Classified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent-yellow p-8 border-8 border-black dark:border-white shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] dark:shadow-[15px_15px_0px_0px_rgba(255,255,255,0.3)] text-black">
              <h3 className="text-2xl font-black uppercase mb-4 italic font-display">System Status</h3>
              <div className="space-y-2 font-bold uppercase tracking-tighter font-mono">
                <div className="flex justify-between border-b-2 border-black/20 pb-1">
                  <span>Core Integrity</span>
                  <span className="text-green-600">Optimal</span>
                </div>
                <div className="flex justify-between border-b-2 border-black/20 pb-1">
                  <span>Grid Connectivity</span>
                  <span className="text-green-600">Stable</span>
                </div>
                <div className="flex justify-between border-b-2 border-black/20 pb-1">
                  <span>Neural Link</span>
                  <span className="text-primary">Intermittent</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-32 pt-10 border-t-8 border-black dark:border-white flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-4xl font-black italic font-display">UIUG // 2026</div>
          <a
            href="/"
            className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest border-4 border-black dark:border-white hover:-translate-y-1 hover:translate-x-1 active:translate-y-0 active:translate-x-0 transition-transform font-display"
          >
            RETURN TO BASE
          </a>
        </footer>
      </div>
    </div>
  );
};

export default SitemapPage;
