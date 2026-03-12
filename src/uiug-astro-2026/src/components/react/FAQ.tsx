import React, { useState } from 'react';
import { Plus, Minus, Terminal, CornerDownRight, HelpCircle } from 'lucide-react';
import type { FAQProps } from '../../lib/faq-mapper';

interface Props {
  faq?: FAQProps;
}

const FAQ: React.FC<Props> = ({ faq }) => {
  // Use dynamic FAQs from props, fallback to empty array
  const faqs = faq?.faqs || [];
  const title = faq?.title || 'SYS_QUERIES';
  const titleCard = faq?.titleCard || 'HELP_DESK_V2';
  const titleDescription = faq?.titleDescription || 'SEARCHING DATABASE...\n5 RECORDS FOUND.\nDISPLAYING RESULTS.';
  const tipOfTheDay = faq?.tipOfTheDay || 'ALWAYS CHECK THE LOGS BEFORE DEPLOYING ON FRIDAY.';
  
  const [activeIndex, setActiveIndex] = useState<number | null>(faqs.length > 0 ? 0 : null);

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="faq">
       {/* Header */}
       <div className="flex items-center gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4">
         <div className="h-4 w-4 md:h-8 md:w-8 inline-flex items-center justify-center border-2 border-black dark:border-white bg-accent-yellow shrink-0 [&_svg]:block [&_svg]:shrink-0">
            <HelpCircle className="w-3 h-3 md:w-5 md:h-5 text-black" />
         </div>
         <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
            {title.toUpperCase()}
         </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Deco Column */}
        <div className="lg:col-span-4 hidden lg:flex flex-col gap-6">
            <div className="bg-black dark:bg-white text-white dark:text-black p-6 border-4 border-black dark:border-white shadow-brutal-red transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <Terminal className="w-12 h-12 mb-4" />
                <h3 className="text-3xl font-display uppercase mb-4">{titleCard.toUpperCase()}</h3>
                <p className="font-mono text-sm font-bold opacity-80 mb-6 whitespace-pre-line">
                    {titleDescription.toUpperCase()}
                </p>
                <div className="w-full h-2 bg-gray-800 dark:bg-gray-200 overflow-hidden">
                    <div className="h-full bg-primary w-2/3 animate-pulse"></div>
                </div>
            </div>
            
             <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 relative overflow-hidden shadow-brutal-black dark:shadow-brutal-white transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                 <p className="font-mono text-xs font-bold text-gray-500 uppercase whitespace-pre-line">
                    // TIP_OF_THE_DAY<br/>
                    {tipOfTheDay.toUpperCase()}
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
                            <span className={`font-mono font-bold text-xl md:text-2xl ${activeIndex === index ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className={`text-xl md:text-2xl font-display uppercase leading-none ${activeIndex === index ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white'}`}>
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
                        <div className="p-4 md:p-6 pt-0 font-mono font-bold text-sm md:text-base text-gray-700 dark:text-gray-300 border-t-2 border-dashed border-gray-300 dark:border-gray-700 mx-4 md:mx-6 mb-4 md:mb-6 mt-2 flex gap-4">
                            <CornerDownRight className="w-5 h-5 flex-shrink-0 text-black dark:text-white mt-1" aria-hidden />
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

