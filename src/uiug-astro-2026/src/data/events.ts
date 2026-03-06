export interface Event {
  id: string;
  title: string;
  type: 'TECHNICAL_BRIEFING' | 'WORKSHOP' | 'KEYNOTE' | 'MEETUP' | 'HACKATHON';
  speaker: string;
  date: string;
  time: string;
  location: string;
  status: 'INCOMING' | 'ARCHIVED';
  description: string;
  agenda?: { time: string; task: string }[];
}

export const allEvents: Event[] = [
  { id: '042', title: 'BUILDING SCALABLE APIS WITH UMBRACO 14', type: 'TECHNICAL_BRIEFING', speaker: 'RAVI_KUMAR', date: 'NOV 28, 2024', time: '18:00 IST', location: 'VIRTUAL_STREAM', status: 'INCOMING', description: 'Deep dive into the new API capabilities of Umbraco 14 and how to leverage them for high-traffic applications.' },
  { id: '041', title: 'ADVANCED BACKOFFICE CUSTOMIZATION', type: 'WORKSHOP', speaker: 'ANITA_SHARMA', date: 'OCT 15, 2024', time: '14:00 IST', location: 'BENGALURU_HUB', status: 'ARCHIVED', description: 'Hands-on workshop on creating custom property editors and dashboard extensions for the Umbraco backoffice.' },
  { id: '040', title: 'THE STATE OF UMBRACO IN INDIA', type: 'KEYNOTE', speaker: 'VIKRAM_SINGH', date: 'SEP 02, 2024', time: '10:00 IST', location: 'MUMBAI_CONVENTION', status: 'ARCHIVED', description: 'A look at the growth of the Umbraco community in India and what the future holds for developers in the region.' },
  { id: '039', title: 'UMBRACO CLOUD MIGRATION STRATEGIES', type: 'TECHNICAL_BRIEFING', speaker: 'PRIYA_PATEL', date: 'AUG 12, 2024', time: '16:30 IST', location: 'VIRTUAL_STREAM', status: 'ARCHIVED', description: 'Best practices for moving your on-premise Umbraco installations to the cloud with minimal downtime.' },
  { id: '038', title: 'COMMUNITY HACKATHON: PACKAGE EDITION', type: 'HACKATHON', speaker: 'COMMUNITY_LEADS', date: 'JUL 20, 2024', time: '09:00 IST', location: 'PUNE_TECH_PARK', status: 'ARCHIVED', description: 'A 24-hour sprint to build and publish new Umbraco packages that solve real-world developer problems.' },
  { id: '037', title: 'FRONTEND PERFORMANCE IN UMBRACO', type: 'MEETUP', speaker: 'ARJUN_REDDY', date: 'JUN 05, 2024', time: '18:30 IST', location: 'HYDERABAD_OFFICE', status: 'ARCHIVED', description: 'Optimizing the delivery of Umbraco content to ensure the fastest possible frontend experience for users.' },
  { id: '036', title: 'SECURITY BEST PRACTICES FOR CMS', type: 'TECHNICAL_BRIEFING', speaker: 'MEERA_NAIR', date: 'MAY 18, 2024', time: '15:00 IST', location: 'VIRTUAL_STREAM', status: 'ARCHIVED', description: 'Hardening your Umbraco installations against common web vulnerabilities and ensuring data privacy.' },
];

export function getEventById(id: string): Event | undefined {
  return allEvents.find((e) => e.id === id);
}
