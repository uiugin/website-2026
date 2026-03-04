import React, { useState } from 'react';
import { Plus, Minus, Terminal, CornerDownRight, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "PROTOCOL: WHAT IS UIUG?",
    answer: "The Umbraco India User Group (UIUG) is the central node for the Umbraco CMS community in India. We are a collective of developers, architects, and agencies dedicated to the .NET-based open-source CMS."
  },
  {
    question: "ACCESS: IS MEMBERSHIP FREE?",
    answer: "AFFIRMATIVE. Access to our knowledge base, meetups, and discord server is open source and free of charge. No paywalls. No subscription tokens required."
  },
  {
    question: "CONTRIBUTE: CAN I SPEAK?",
    answer: "We are always scanning for new signals. Whether it's a deep dive into .NET Core, a case study, or a lightning talk, submit your proposal via the Contact module below."
  },
  {
    question: "LOCATION: WHERE ARE EVENTS?",
    answer: "Our physical node is in Bengaluru, but we operate in a hybrid cloud environment. Most sessions are streamed live. Check the Event Log for specific coordinates."
  },
  {
    question: "LEGACY: UMBRACO 7 SUPPORT?",
    answer: "WARNING: LEGACY SYSTEMS DETECTED. While we respect the history, our focus is on current Long Term Support (LTS) versions and the bleeding edge. Upgrade sequence recommended immediately."
  }
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="faq">
       {/* Header */}
       <div className="flex items-center gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4">
         <div className="bg-accent-yellow p-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-black" />
         </div>
         <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
            SYS_QUERIES
         </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Deco Column */}
        <div className="lg:col-span-4 hidden lg:flex flex-col gap-6">
            <div className="bg-black dark:bg-white text-white dark:text-black p-6 border-4 border-black dark:border-white shadow-brutal-red transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <Terminal className="w-12 h-12 mb-4" />
                <h3 className="text-3xl font-display uppercase mb-4">HELP_DESK_V2</h3>
                <p className="font-mono text-sm font-bold opacity-80 mb-6">
                    SEARCHING DATABASE...<br/>
                    5 RECORDS FOUND.<br/>
                    DISPLAYING RESULTS.
                </p>
                <div className="w-full h-2 bg-gray-800 dark:bg-gray-200 overflow-hidden">
                    <div className="h-full bg-primary w-2/3 animate-pulse"></div>
                </div>
            </div>
            
             <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 relative overflow-hidden shadow-brutal-black dark:shadow-brutal-white transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                 <p className="font-mono text-xs font-bold text-gray-500 uppercase">
                    // TIP_OF_THE_DAY<br/>
                    ALWAYS CHECK THE LOGS BEFORE DEPLOYING ON FRIDAY.
                 </p>
             </div>
        </div>

        {/* Right FAQ List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
            {faqs.map((faq, index) => (
                <div 
                    key={index}
                    className={`border-4 border-black dark:border-white transition-all duration-300 relative group ${activeIndex === index ? 'bg-white dark:bg-black shadow-brutal-yellow scale-[1.02] z-10' : 'bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-black hover:shadow-brutal-black dark:hover:shadow-brutal-white'}`}
                >
                    <button 
                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                        className="w-full text-left p-4 md:p-6 flex items-start md:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <span className={`font-mono font-bold text-xl md:text-2xl ${activeIndex === index ? 'text-primary' : 'text-gray-400'}`}>
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className={`text-xl md:text-2xl font-display uppercase leading-none ${activeIndex === index ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                {faq.question}
                            </h3>
                        </div>
                        <div className={`p-1 border-2 border-black dark:border-white transition-colors flex-shrink-0 ${activeIndex === index ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-black dark:text-white'}`}>
                            {activeIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                        </div>
                    </button>

                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="p-4 md:p-6 pt-0 font-mono font-bold text-sm md:text-base text-gray-600 dark:text-gray-300 border-t-2 border-dashed border-gray-300 dark:border-gray-700 mx-4 md:mx-6 mb-4 md:mb-6 mt-2 flex gap-4">
                            <CornerDownRight className="w-5 h-5 flex-shrink-0 text-primary mt-1" />
                            <div>
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

