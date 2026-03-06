export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  image: string;
  stack: string[];
  year: string;
  category: 'COMMERCE' | 'FINTECH' | 'GOVT' | 'ENTERPRISE' | 'STARTUP';
  longDescription?: string;
  gallery?: string[];
}

export const allProjects: Project[] = [
  { id: '1', title: 'NEURAL_COMMERCE', client: 'RETAIL_GIANT_ASIA', description: 'A high-performance headless commerce solution handling 5M+ SKUs with sub-second load times. Integrated with ERP and AI recommendation engines.', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop', stack: ['UMBRACO 13', '.NET 8', 'BLAZOR'], year: '2024', category: 'COMMERCE' },
  { id: '2', title: 'QUANTUM_LEDGER', client: 'FINTECH_CORP', description: 'Secure, multi-region content delivery platform with banking-grade security compliance and real-time stock visualization widgets.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop', stack: ['UMB_CLOUD', 'AZURE', 'REACT'], year: '2023', category: 'FINTECH' },
  { id: '3', title: 'CIVIC_CONNECT_V2', client: 'GOVT_MUNICIPAL', description: 'Accessibility-first citizen portal aggregating data from 40+ disparate legacy systems into a unified Umbraco content mesh.', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop', stack: ['UMBRACO 10', 'ANGULAR', 'ELASTIC'], year: '2023', category: 'GOVT' },
  { id: '4', title: 'ENTERPRISE_CORE', client: 'GLOBAL_LOGISTICS', description: 'Centralized content hub for a global logistics firm, managing 200+ localized sites from a single Umbraco instance.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop', stack: ['UMBRACO 13', 'AZURE', 'VUE'], year: '2024', category: 'ENTERPRISE' },
  { id: '5', title: 'STARTUP_LAUNCHPAD', client: 'TECH_ACCELERATOR', description: 'Rapid deployment framework for startup landing pages with integrated marketing automation and A/B testing capabilities.', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop', stack: ['UMBRACO 12', 'NEXT.JS', 'TAILWIND'], year: '2022', category: 'STARTUP' },
  { id: '6', title: 'HEALTH_SYNC', client: 'MEDICAL_NETWORK', description: 'HIPAA-compliant patient portal and resource center built on Umbraco Heartcore for seamless cross-platform delivery.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop', stack: ['HEARTCORE', 'REACT NATIVE', 'NODE'], year: '2023', category: 'ENTERPRISE' },
  { id: '7', title: 'EDU_PORTAL_360', client: 'UNIVERSITY_SYSTEM', description: 'Comprehensive learning management system integration with Umbraco as the primary content and student resource hub.', image: 'https://images.unsplash.com/photo-1523050335102-c3250908b30f?q=80&w=1000&auto=format&fit=crop', stack: ['UMBRACO 11', '.NET 7', 'SQL_SERVER'], year: '2022', category: 'GOVT' },
  { id: '8', title: 'FINANCE_FLOW', client: 'BANKING_GROUP', description: 'Real-time financial dashboard and reporting tool for institutional investors, featuring complex data visualization.', image: 'https://images.unsplash.com/photo-1611974717484-245397218283?q=80&w=1000&auto=format&fit=crop', stack: ['UMBRACO 13', 'D3.JS', 'AZURE'], year: '2024', category: 'FINTECH' },
];

export function getProjectById(id: string): Project | undefined {
  return allProjects.find((p) => p.id === id);
}
