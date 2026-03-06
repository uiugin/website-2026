/**
 * Project mapper - Maps Umbraco Project content to Project interface
 */
import type { components } from '../api/types.js';
import { getContentItem, getPaths, getMediaUrl } from '../api/umbraco.js';
import type { Project } from '../data/projects.js';

type ProjectContentModel = components['schemas']['ProjectContentModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];

function linkHref(link: ApiLinkModel | null | undefined): string {
  if (!link) return '#';
  
  const href = link.url ?? link.route?.path ?? '#';
  
  if (href === '/#/' || href === '#/') {
    return '/';
  }
  
  if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('/')) {
    return `/${href}`;
  }
  
  return href;
}

/**
 * Extract text from rich text object (handles {markup, blocks} format)
 */
function extractRichText(richText: any): string {
  if (!richText) return '';
  
  // If it's already a string, return it
  if (typeof richText === 'string') {
    return richText;
  }
  
  // If it's an object with markup property
  if (richText && typeof richText === 'object') {
    if ('markup' in richText && typeof richText.markup === 'string') {
      // Strip HTML tags for plain text
      return richText.markup.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if ('text' in richText && typeof richText.text === 'string') {
      return richText.text;
    }
  }
  
  return '';
}

/**
 * Map Umbraco Project content to Project interface
 * @param projectContent The project content from CMS
 * @param path Optional path to use for ID extraction (if route.path is not available)
 */
export async function mapProjectFromContent(
  projectContent: ProjectContentModel | null | undefined,
  path?: string
): Promise<Project | null> {
  if (!projectContent || !projectContent.properties) {
    return null;
  }

  const props = projectContent.properties;
  
  // Extract project properties
  const projectTitle = props.projectTitle || projectContent.name || 'Project';
  const client = props.client || 'CLIENT';
  
  // Handle shortDescription - might not be in types but exists in CMS
  const propsAny = props as any;
  const shortDescription = propsAny.shortDescription || propsAny.short_description || '';
  
  // Handle description - might be rich text object with {markup, blocks}
  let description = '';
  if (props.description) {
    description = extractRichText(props.description);
  } else if (propsAny.fullDescription || propsAny.full_description) {
    description = extractRichText(propsAny.fullDescription || propsAny.full_description);
  }
  
  // Handle longDescription - also might be rich text
  let longDescription = '';
  if (propsAny.longDescription || propsAny.long_description) {
    longDescription = extractRichText(propsAny.longDescription || propsAny.long_description);
  } else if (props.description && typeof props.description === 'object' && 'markup' in props.description) {
    // Use description markup as longDescription if available
    longDescription = extractRichText(props.description);
  }
  
  const year = props.year || '';
  
  // Handle stack - might be array of strings
  let stack: string[] = [];
  if (props.stack) {
    if (Array.isArray(props.stack)) {
      stack = props.stack.map(s => {
        if (typeof s === 'string') {
          return s.toUpperCase();
        }
        return String(s).toUpperCase();
      });
    } else if (typeof props.stack === 'string') {
      stack = [props.stack.toUpperCase()];
    }
  }
  
  // Handle image - array of media items
  let imageUrl = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop';
  if (props.image && Array.isArray(props.image) && props.image.length > 0) {
    imageUrl = getMediaUrl(props.image[0]);
  }
  
  // Handle URL - array of links
  let projectUrl: string | undefined;
  if (props.url && Array.isArray(props.url) && props.url.length > 0) {
    projectUrl = linkHref(props.url[0]);
  }
  
  // Handle projectType (category) - might be array, object, or string
  // Check for projectType first (from CMS), then fallback to category
  let categoryValue: string | null | undefined = propsAny.projectType || propsAny.category;
  
  // Handle array format
  if (Array.isArray(categoryValue)) {
    categoryValue = categoryValue.length > 0 ? categoryValue[0] : null;
  }
  // Handle object format
  else if (categoryValue && typeof categoryValue === 'object' && 'value' in categoryValue) {
    categoryValue = (categoryValue as any).value;
  }
  
  // Map projectType to Project interface category
  // CMS values: "Commerce", "Fintech", "Govt", "Enterprise", "startup"
  // Interface expects: "COMMERCE", "FINTECH", "GOVT", "ENTERPRISE", "STARTUP"
  let category: Project['category'] = 'COMMERCE'; // default
  if (categoryValue) {
    const normalizedCategory = String(categoryValue).trim();
    const upperCategory = normalizedCategory.toUpperCase();
    
    // Map CMS values to interface values
    if (upperCategory === 'COMMERCE' || normalizedCategory.toLowerCase() === 'commerce') {
      category = 'COMMERCE';
    } else if (upperCategory === 'FINTECH' || normalizedCategory.toLowerCase() === 'fintech') {
      category = 'FINTECH';
    } else if (upperCategory === 'GOVT' || normalizedCategory.toLowerCase() === 'govt' || normalizedCategory.toLowerCase() === 'government') {
      category = 'GOVT';
    } else if (upperCategory === 'ENTERPRISE' || normalizedCategory.toLowerCase() === 'enterprise') {
      category = 'ENTERPRISE';
    } else if (upperCategory === 'STARTUP' || normalizedCategory.toLowerCase() === 'startup') {
      category = 'STARTUP';
    }
  }
  
  // Extract ID from project content (use URL segment from route path, or fallback to UUID)
  let projectId = 'project';
  
  // Try to get ID from route path first
  if (projectContent.route?.path) {
    const pathSegments = projectContent.route.path.split('/').filter(seg => seg && seg !== '#' && seg !== '');
    if (pathSegments.length > 0) {
      projectId = pathSegments[pathSegments.length - 1];
    }
  } else if (path) {
    // Use provided path to extract ID
    const pathSegments = path.split('/').filter(seg => seg && seg !== '#' && seg !== '');
    if (pathSegments.length > 0) {
      projectId = pathSegments[pathSegments.length - 1];
    }
  } else if (projectContent.id) {
    // Fallback to first 8 chars of UUID
    projectId = projectContent.id.substring(0, 8);
  }
  
  // Use shortDescription as description if available, otherwise use description
  const projectDescription = shortDescription || description || 'No description available.';
  
  // Validate that we have at least a title
  if (!projectTitle || projectTitle === 'Project' || projectTitle.trim() === '') {
    return null;
  }
  
  const mappedProject: Project = {
    id: projectId,
    title: projectTitle.toUpperCase(),
    client: client.toUpperCase(),
    description: projectDescription,
    image: imageUrl,
    stack: stack,
    year: year,
    category: category,
    longDescription: longDescription || description || undefined,
    // gallery can be added later if needed in CMS
  };
  
  return mappedProject;
}

/**
 * Fetch all projects from CMS
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    // Get all paths under "projects"
    const paths = await getPaths('projects');
    
    if (!paths || paths.length === 0) {
      return [];
    }
    
    // Fetch all project content in parallel
    const projectPromises = paths.map(async (pathItem) => {
      try {
        const path = pathItem.path;
        
        if (!path || path === '#') {
          return null;
        }
        
        // Clean path: remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        const projectContent = await getContentItem(cleanPath);
        
        if (projectContent) {
          // Check if it's a project content type (might be "project" or "ProjectContentModel")
          const contentType = projectContent.contentType || '';
          const isProject = contentType === 'project' || 
                           contentType === 'ProjectContentModel' ||
                           contentType.toLowerCase() === 'project' ||
                           contentType.toLowerCase().includes('project');
          
          if (isProject) {
            // Pass the original path to help with ID extraction
            const mappedProject = await mapProjectFromContent(projectContent as ProjectContentModel, path);
            return mappedProject;
          }
        }
        return null;
      } catch {
        return null;
      }
    });
    
    const projects = await Promise.all(projectPromises);
    
    // Filter out null results
    const validProjects = projects.filter((project): project is Project => project !== null);
    
    return validProjects;
  } catch {
    return [];
  }
}

/**
 * Fetch a single project by ID (URL segment or path)
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    let projectContent: ProjectContentModel | null = null;
    let usedPath: string | null = null;
    
    // Try multiple path variations
    const pathVariations = [
      `projects/${id}`,  // Most common: projects/project1
      id,              // Direct path if ID is full path
      `projects/${id.toLowerCase()}`, // Lowercase variant
    ];
    
    for (const path of pathVariations) {
      try {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const content = await getContentItem(cleanPath);
        const contentType = content?.contentType || '';
        const isProject = contentType === 'project' || 
                         contentType === 'ProjectContentModel' ||
                         contentType.toLowerCase() === 'project' ||
                         contentType.toLowerCase().includes('project');
        
        if (content && isProject) {
          projectContent = content as ProjectContentModel;
          usedPath = path;
          break;
        }
      } catch {
        // Continue to next variation
        continue;
      }
    }
    
    // If direct fetch failed, try to find by matching ID in all projects
    if (!projectContent) {
      const allProjects = await getAllProjects();
      const foundProject = allProjects.find((p) => {
        const projectId = p.id.toLowerCase();
        const requestedId = id.toLowerCase();

        // Match exact IDs (e.g., "project-1-1")
        if (projectId === requestedId) return true;

        // Also support numeric IDs (e.g., "/projects/1" → "project-1-1")
        // by checking if the project ID ends with "-{id}"
        if (/^\d+$/.test(requestedId) && projectId.endsWith(`-${requestedId}`)) {
          return true;
        }

        return false;
      });
      if (foundProject) {
        return foundProject;
      }
    }
    
    if (projectContent) {
      // Pass the used path to help with ID extraction
      return await mapProjectFromContent(projectContent, usedPath || undefined);
    }
    
    return null;
  } catch {
    return null;
  }
}
