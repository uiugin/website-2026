import React, { useState, useEffect } from 'react';

const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center border-4 border-black dark:border-white p-4 md:p-6 min-w-[90px] md:min-w-[140px] bg-white dark:bg-black shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-1 hover:shadow-brutal-yellow transition-all duration-200">
    <span className="text-4xl md:text-7xl font-display font-black text-black dark:text-white tabular-nums leading-none">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs md:text-sm font-bold font-mono uppercase mt-2 text-primary">
      {label}
    </span>
  </div>
);

const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    // Default to Nov 28 of current year. If passed, next year.
    const now = new Date();
    let year = now.getFullYear();
    const targetDate = new Date(`${year}-11-28T19:00:00`);

    if (now > targetDate) {
      targetDate.setFullYear(year + 1);
    }

    const difference = +targetDate - +now;
    
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full px-4 md:px-10 mb-20 md:mb-32 flex flex-col items-center justify-center relative z-20">
      
      {/* Session Title Block */}
      <div className="text-center mb-10 max-w-5xl mx-auto flex flex-col items-center">
         <div className="inline-block bg-black text-white dark:bg-white dark:text-black px-4 py-1 mb-6 font-mono font-bold text-xs md:text-sm uppercase transform -rotate-2 border-2 border-transparent shadow-brutal-red dark:shadow-brutal-white">
            WARNING: KNOWLEDGE_DROP_IMMINENT
         </div>
         <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-black uppercase text-black dark:text-white leading-[0.9] tracking-tighter mb-4 text-center">
            BUILDING SCALABLE APIS<br/>
            <span className="text-primary">WITH UMBRACO 14</span>
         </h2>
         <p className="font-mono text-sm md:text-base font-bold text-gray-500 max-w-2xl">
            // JOIN THE ARCHITECTS OF THE DIGITAL FUTURE. DON'T MISS THE SIGNAL.
         </p>
      </div>

      <div className="bg-primary px-6 py-2 border-4 border-black dark:border-white shadow-brutal-black dark:shadow-brutal-white mb-8 md:mb-12 transform rotate-1 hover:rotate-0 transition-transform duration-300">
        <h2 className="text-xl md:text-3xl font-bold font-display uppercase text-black tracking-tighter">
          T_MINUS_TO_LAUNCH
        </h2>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        <TimeBox value={timeLeft.days} label="Days" />
        <TimeBox value={timeLeft.hours} label="Hours" />
        <TimeBox value={timeLeft.minutes} label="Mins" />
        <TimeBox value={timeLeft.seconds} label="Secs" />
      </div>

      <div className="mt-8 text-center">
        <p className="font-mono text-xs md:text-sm font-bold text-gray-500 uppercase">
          [SYNCING_WITH_GLOBAL_TIME_SERVER]
        </p>
      </div>
    </section>
  );
};

export default Countdown;

