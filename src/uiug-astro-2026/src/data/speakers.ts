import type { PageSeo } from '../types/seo.js';

export interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  category: 'MVP' | 'HQ' | 'AGENCY' | 'COMMUNITY';
  topics: string[];
  bio: string;
  /** Optional GitHub profile URL from CMS (alias: githubUrl). */
  githubUrl?: string;
  /** Optional LinkedIn profile URL from CMS (alias: linkedinUrl). */
  linkedinUrl?: string;
  seo?: PageSeo | null;
}

export const allSpeakers: Speaker[] = [
  { id: '1', name: 'RAVI KUMAR', role: 'MVP / ARCHITECT', company: 'UMBRACO HQ', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop', category: 'HQ', topics: ['.NET 8', 'Headless'], bio: 'Leading the charge in .NET architecture and headless CMS solutions across enterprise scales. Passionate about clean code and community growth.' },
  { id: '2', name: 'ANITA SHARMA', role: 'TECH LEAD', company: 'DIGITAL AGENCY', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop', category: 'AGENCY', topics: ['Backoffice', 'UI/UX'], bio: 'Specializing in intuitive backoffice experiences and bridging the gap between design and dev. Creator of several popular property editors.' },
  { id: '3', name: 'VIKRAM SINGH', role: 'CORE CONTRIBUTOR', company: 'OPEN SOURCE CO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop', category: 'COMMUNITY', topics: ['Packages', 'Performance'], bio: 'Open source advocate and package creator. obsessively optimizing Umbraco performance for high-traffic sites.' },
  { id: '4', name: 'PRIYA PATEL', role: 'DEV REL', company: 'CLOUD CORP', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop', category: 'MVP', topics: ['Cloud', 'DevOps'], bio: 'Cloud native evangelist helping teams deploy scalable, resilient Umbraco infrastructure on Azure. Speaker at 20+ conferences.' },
  { id: '5', name: 'ARJUN REDDY', role: 'FULL STACK', company: 'STARTUP INC', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop', category: 'AGENCY', topics: ['React', 'Frontend'], bio: 'Full stack wizard blending modern frontend frameworks with robust Umbraco backends. Building the next gen of web apps.' },
  { id: '6', name: 'MEERA NAIR', role: 'SOLUTIONS ARCHITECT', company: 'ENTERPRISE LTD', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1000&auto=format&fit=crop', category: 'HQ', topics: ['Security', 'Scale'], bio: 'Architecting secure, enterprise-grade digital experience platforms for global organizations. Security first mindset.' },
  { id: '7', name: 'KABIR DAS', role: 'FREELANCE DEV', company: 'SELF', image: 'https://images.unsplash.com/photo-1485206412256-701b86684b7d?q=80&w=1000&auto=format&fit=crop', category: 'COMMUNITY', topics: ['uSync', 'Migrations'], bio: 'Migration specialist ensuring smooth transitions and data integrity for legacy upgrades. Helping you move to the modern web.' },
  { id: '8', name: 'SARA KHAN', role: 'QA LEAD', company: 'QUALITY FIRST', image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1000&auto=format&fit=crop', category: 'AGENCY', topics: ['Testing', 'Automation'], bio: 'Ensuring code quality and reliability through automated testing strategies. Making sure your deployments never break.' },
];

export function getSpeakerById(id: string): Speaker | undefined {
  return allSpeakers.find((s) => s.id === id);
}
