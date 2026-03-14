// import React from 'react';
// import { allEvents } from '../data';

// const AttendeeMarquee: React.FC = () => {
//   // Extract all unique attendees
//   const allAttendees = allEvents.flatMap(event => event.attendees || []);
//   const uniqueAttendees = Array.from(new Map(allAttendees.map(a => [a.name, a])).values());
  
//   // If we don't have enough attendees to fill the screen, we'll repeat them
//   // But for a marquee, we repeat the whole set anyway.
  
//   // Split into two rows for variety
//   const midPoint = Math.ceil(uniqueAttendees.length / 2);
//   const row1 = uniqueAttendees.slice(0, midPoint);
//   const row2 = uniqueAttendees.slice(midPoint);

//   const AttendeeRow = ({ attendees, reverse = false }: { attendees: typeof uniqueAttendees, reverse?: boolean }) => (
//     <div className={`flex gap-3 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} whitespace-nowrap`}>
//       {/* Repeat 8 times to ensure it covers long screens and loops smoothly */}
//       {[...Array(8)].map((_, i) => (
//         <div key={i} className="flex gap-3">
//           {attendees.map((attendee, idx) => (
//             <div 
//               key={`${i}-${idx}`} 
//               className="w-8 h-8 md:w-10 md:h-10 border-2 border-white overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 grayscale hover:grayscale-0 transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
//               title={attendee.name}
//             >
//               {attendee.image ? (
//                 <img 
//                   src={attendee.image} 
//                   alt={attendee.name} 
//                   className="w-full h-full object-cover" 
//                   referrerPolicy="no-referrer" 
//                 />
//               ) : (
//                 <span className="text-xs md:text-sm font-bold font-mono text-white">
//                   {attendee.name.charAt(0).toUpperCase()}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <section className="relative w-full overflow-hidden py-8 bg-black dark:bg-zinc-950 border-y-4 border-black dark:border-white z-30 mb-16 md:mb-24 flex flex-col gap-3">
//       <div className="absolute top-0 left-10 bg-primary text-black px-3 py-1 text-[10px] font-bold font-mono z-40 border-x-4 border-b-4 border-black uppercase tracking-widest">
//         LIVE_OPERATIVE_FEED
//       </div>
//       <AttendeeRow attendees={row1} />
//       <AttendeeRow attendees={row2} reverse />
//       <style>{`
//         .animate-marquee {
//           animation: marquee-attendee 40s linear infinite;
//         }
//         .animate-marquee-reverse {
//           animation: marquee-attendee-reverse 40s linear infinite;
//         }
//         @keyframes marquee-attendee {
//           0% { transform: translateX(0); }
//           100% { transform: translateX(-50%); }
//         }
//         @keyframes marquee-attendee-reverse {
//           0% { transform: translateX(-50%); }
//           100% { transform: translateX(0); }
//         }
//       `}</style>
//     </section>
//   );
// };

// export default AttendeeMarquee;
