import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, Github, Twitter, Linkedin, Award, Terminal, Zap, Code, User } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  category: 'MVP' | 'HQ' | 'AGENCY' | 'COMMUNITY';
  topics: string[];
  bio: string;
}

const allSpeakers: Speaker[] = [
  { 
    id: '1', 
    name: 'RAVI KUMAR', 
    role: 'MVP / ARCHITECT', 
    company: 'UMBRACO HQ', 
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop', 
    category: 'HQ', 
    topics: ['.NET 8', 'Headless'],
    bio: 'Leading the charge in .NET architecture and headless CMS solutions across enterprise scales. Passionate about clean code and community growth.'
  },
  { 
    id: '2', 
    name: 'ANITA SHARMA', 
    role: 'TECH LEAD', 
    company: 'DIGITAL AGENCY', 
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop', 
    category: 'AGENCY', 
    topics: ['Backoffice', 'UI/UX'],
    bio: 'Specializing in intuitive backoffice experiences and bridging the gap between design and dev. Creator of several popular property editors.'
  },
  { 
    id: '3', 
    name: 'VIKRAM SINGH', 
    role: 'CORE CONTRIBUTOR', 
    company: 'OPEN SOURCE CO', 
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop', 
    category: 'COMMUNITY', 
    topics: ['Packages', 'Performance'],
    bio: 'Open source advocate and package creator. obsessively optimizing Umbraco performance for high-traffic sites.'
  },
  { 
    id: '4', 
    name: 'PRIYA PATEL', 
    role: 'DEV REL', 
    company: 'CLOUD CORP', 
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop', 
    category: 'MVP', 
    topics: ['Cloud', 'DevOps'],
    bio: 'Cloud native evangelist helping teams deploy scalable, resilient Umbraco infrastructure on Azure. Speaker at 20+ conferences.'
  },
  { 
    id: '5', 
    name: 'ARJUN REDDY', 
    role: 'FULL STACK', 
    company: 'STARTUP INC', 
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop', 
    category: 'AGENCY', 
    topics: ['React', 'Frontend'],
    bio: 'Full stack wizard blending modern frontend frameworks with robust Umbraco backends. Building the next gen of web apps.'
  },
  { 
    id: '6', 
    name: 'MEERA NAIR', 
    role: 'SOLUTIONS ARCHITECT', 
    company: 'ENTERPRISE LTD', 
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1000&auto=format&fit=crop', 
    category: 'HQ', 
    topics: ['Security', 'Scale'],
    bio: 'Architecting secure, enterprise-grade digital experience platforms for global organizations. Security first mindset.'
  },
  { 
    id: '7', 
    name: 'KABIR DAS', 
    role: 'FREELANCE DEV', 
    company: 'SELF', 
    image: 'https://images.unsplash.com/photo-1485206412256-701b86684b7d?q=80&w=1000&auto=format&fit=crop', 
    category: 'COMMUNITY', 
    topics: ['uSync', 'Migrations'],
    bio: 'Migration specialist ensuring smooth transitions and data integrity for legacy upgrades. Helping you move to the modern web.'
  },
  { 
    id: '8', 
    name: 'SARA KHAN', 
    role: 'QA LEAD', 
    company: 'QUALITY FIRST', 
    image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1000&auto=format&fit=crop', 
    category: 'AGENCY', 
    topics: ['Testing', 'Automation'],
    bio: 'Ensuring code quality and reliability through automated testing strategies. Making sure your deployments never break.'
  },
];

interface FullSpeakerListProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullSpeakerList: React.FC<FullSpeakerListProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'MVP' | 'HQ' | 'AGENCY' | 'COMMUNITY'>('ALL');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);

  // Handle animation delay
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setVisible(true), 50);
    } else {
      setVisible(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const filteredSpeakers = allSpeakers.filter(s => {
    const matchesFilter = filter === 'ALL' || s.category === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[60] bg-white dark:bg-black overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
      
      {/* Background Texture */}
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none fixed"></div>

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b-4 border-black dark:border-white p-4 md:p-6 flex justify-between items-center plastic-surface">
         <div className="flex items-center gap-4">
             <button 
                onClick={onClose}
                className="group bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-primary hover:text-black transition-colors"
             >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
             </button>
             <h2 className="text-2xl md:text-4xl font-display font-black uppercase text-black dark:text-white leading-none hidden md:block">
                FULL_ROSTER_V2
             </h2>
         </div>

         <div className="flex items-center gap-4">
             {/* Search Bar - styled like a terminal input */}
             <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 w-64 focus-within:ring-2 ring-primary">
                 <Terminal className="w-4 h-4 text-gray-500 mr-2" />
                 <input 
                    type="text" 
                    placeholder="FIND_SPEAKER.EXE"
                    className="bg-transparent border-none outline-none font-mono text-sm font-bold w-full uppercase text-black dark:text-white placeholder:text-gray-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 />
             </div>
             
             <div className="bg-primary text-black px-3 py-1 font-mono font-bold text-xs border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                COUNT: {filteredSpeakers.length}
             </div>
         </div>
      </div>

      <div className="w-full p-4 md:p-8 relative z-10">
         
         {/* Mobile Header */}
         <h2 className="md:hidden text-4xl font-display font-black uppercase text-black dark:text-white leading-none mb-6">
            FULL_ROSTER_V2
         </h2>

         {/* Mobile Search */}
         <div className="md:hidden flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 mb-6 focus-within:ring-2 ring-primary">
             <Search className="w-4 h-4 text-gray-500 mr-2" />
             <input 
                type="text" 
                placeholder="SEARCH_SPEAKERS..."
                className="bg-transparent border-none outline-none font-mono text-sm font-bold w-full uppercase text-black dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
             />
         </div>

         {/* Filter Bricks */}
         <div className="flex flex-wrap gap-3 mb-12">
             {['ALL', 'MVP', 'HQ', 'AGENCY', 'COMMUNITY'].map((cat) => (
                 <button
                    key={cat}
                    onClick={() => setFilter(cat as any)}
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

         {/* Grid - Adjusted for larger tiles (fewer columns) */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
            {filteredSpeakers.map((speaker, idx) => (
                <div 
                    key={speaker.id}
                    className="group bg-white dark:bg-black border-4 border-black dark:border-white p-2 shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-2 hover:shadow-brutal-red transition-all duration-300 plastic-surface flex flex-col h-full"
                    style={{ animationDelay: `${idx * 50}ms` }}
                >
                    {/* Inner Card - Blister Pack Style */}
                    <div className="border-2 border-black dark:border-white p-4 h-full flex flex-col bg-white dark:bg-black relative overflow-hidden">
                        
                        {/* Top Studs Graphic */}
                        <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-2 opacity-20 pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1"></div>
                            <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1"></div>
                            <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1"></div>
                            <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1"></div>
                        </div>

                        {/* Rarity Badge - Larger text */}
                        <div className="flex justify-between items-start mb-4 mt-2">
                             <div className={`px-2 py-1 text-xs font-mono font-bold border border-black dark:border-white uppercase ${
                                 speaker.category === 'MVP' ? 'bg-accent-yellow text-black' : 
                                 speaker.category === 'HQ' ? 'bg-red-500 text-white' : 
                                 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
                             }`}>
                                {speaker.category}
                             </div>
                             <div className="text-xs font-mono font-bold text-gray-400">
                                #00{speaker.id}
                             </div>
                        </div>

                        {/* Image Frame */}
                        <div className="relative aspect-square border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-900 mb-6 overflow-hidden">
                            <img 
                                src={speaker.image} 
                                alt={speaker.name}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            {/* Overlay Scanlines */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-grow">
                            <h3 className="text-2xl md:text-3xl font-display font-black uppercase text-black dark:text-white leading-[0.9] mb-2 group-hover:text-primary transition-colors">
                                {speaker.name}
                            </h3>
                            <p className="font-mono text-sm font-bold text-gray-500 uppercase mb-6">
                                {speaker.company}
                            </p>

                            {/* Bio Block - Larger text */}
                            <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 flex-grow">
                                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                    <User className="w-3 h-3"/> BIO_DATA
                                </span>
                                <p className="font-mono text-sm font-medium leading-relaxed text-black dark:text-gray-300">
                                    {speaker.bio}
                                </p>
                            </div>

                            {/* Topics */}
                            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                {speaker.topics.map(t => (
                                    <span key={t} className="text-[10px] font-bold uppercase border border-black dark:border-white px-2 py-1 bg-white dark:bg-black text-black dark:text-white">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            {/* Socials - Larger Icons */}
                            <div className="flex justify-between items-center border-t-2 border-dashed border-gray-300 dark:border-gray-700 pt-4">
                                <div className="flex gap-3">
                                    <Twitter className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
                                    <Linkedin className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
                                    <Github className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
                                </div>
                                <Award className="w-5 h-5 text-accent-yellow" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
         </div>

         {filteredSpeakers.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <Terminal className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-600" />
                 <p className="font-mono font-bold text-xl uppercase text-black dark:text-white">NO_SIGNALS_FOUND</p>
                 <p className="font-mono text-sm text-gray-500 dark:text-gray-400">TRY_ADJUSTING_FILTERS</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default FullSpeakerList;

