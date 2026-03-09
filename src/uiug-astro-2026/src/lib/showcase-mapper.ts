/**
 * Showcase component props mapper
 * Maps Umbraco Projects Showcase block properties to Showcase component props
 */
import type { components } from '../api/types.js';
import { getContentItem, getMediaUrl } from '../api/umbraco.js';

type ProjectsShowcaseElementModel = components['schemas']['ProjectsShowcaseElementModel'];
type ProjectContentModel = components['schemas']['ProjectContentModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];

export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  image: string;
  stack: string[];
  year: string;
  url?: string;
}

export interface ShowcaseProps {
  title?: string;
  projects?: Project[];
  moreButtonUrl?: string;
  submissionHeading?: string;
  submissionDescription?: string;
  submissionButtonUrl?: string;
}

function linkHref(link: ApiLinkModel | null | undefined): string {
  if (!link) return '#';
  
  // Prefer url, then route.path
  const href = link.url ?? link.route?.path ?? '#';
  
  // Normalize special cases like "/#/" to "/"
  if (href === '/#/' || href === '#/') {
    return '/';
  }
  
  // Ensure href starts with / for relative paths, or is absolute
  if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('/')) {
    return `/${href}`;
  }
  
  return href;
}

async function fetchProjectContent(project: components['schemas']['IApiContentModel'] | null | undefined): Promise<Project | null> {
  if (!project) {
    return null;
  }
  
  try {
    // If properties are already expanded, try to use them regardless of contentType
    if ('properties' in project) {
      const projectProps = (project as ProjectContentModel).properties;
      // Check if properties have the expected fields (projectTitle, client, etc.)
      if (projectProps && (projectProps.projectTitle || projectProps.client || projectProps.description)) {
        return mapProjectFromProps(projectProps, project.id);
      }
    }
    
    // If not expanded, fetch by route path
    if (project.route?.path) {
      // Remove leading slash and trailing slash if present
      let cleanPath = project.route.path.startsWith('/') ? project.route.path.substring(1) : project.route.path;
      cleanPath = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
      if (cleanPath && cleanPath !== '#' && cleanPath !== '') {
        try {
          const projectContent = await getContentItem(cleanPath);
          if (projectContent) {
            // Check for any project-related contentType (could be 'project', 'ProjectContentModel', or document type alias)
            // First check if it has properties and try to access them
            if ('properties' in projectContent) {
              const projectProps = (projectContent as unknown as ProjectContentModel).properties;
              if (projectProps && (projectProps.projectTitle || projectProps.client || projectProps.description)) {
                return mapProjectFromProps(projectProps, projectContent.id);
              }
            }
          }
        } catch (fetchError) {
          // Silently handle fetch errors
        }
      }
    }
  } catch (error) {
    // Silently handle errors
  }
  
  return null;
}

function mapProjectFromProps(projectProps: components['schemas']['ProjectPropertiesModel'], projectId: string): Project {
  // Get image URL
  let imageUrl = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop';
  if (projectProps.image && Array.isArray(projectProps.image) && projectProps.image.length > 0) {
    imageUrl = getMediaUrl(projectProps.image[0]);
  }
  
  // Get URL from url link
  let projectUrl: string | undefined;
  if (projectProps.url && Array.isArray(projectProps.url) && projectProps.url.length > 0) {
    projectUrl = linkHref(projectProps.url[0]);
  }
  
  return {
    id: projectId.substring(0, 8),
    title: (projectProps.projectTitle || 'Project').toUpperCase(),
    client: (projectProps.client || 'CLIENT').toUpperCase(),
    description: projectProps.description || '',
    image: imageUrl,
    stack: projectProps.stack ? projectProps.stack.map(s => s.toUpperCase()) : [],
    year: projectProps.year || '',
    url: projectUrl
  };
}

/**
 * Map Umbraco Projects Showcase element to Showcase component props
 */
export async function mapShowcaseProps(
  showcaseElement: ProjectsShowcaseElementModel | null | undefined
): Promise<ShowcaseProps> {
  if (!showcaseElement?.properties) {
    return {};
  }

  const props = showcaseElement.properties;
  const projects: Project[] = [];

  // Handle projects - could be single item, array, or content picker
  let projectItems: components['schemas']['IApiContentModel'][] = [];
  
  if (props.projects) {
    if (Array.isArray(props.projects)) {
      projectItems = props.projects;
    } else {
      // Single item
      projectItems = [props.projects];
    }
  }

  // Fetch all project content in parallel
  if (projectItems.length > 0) {
    const projectPromises = projectItems.map(project => fetchProjectContent(project));
    const projectResults = await Promise.all(projectPromises);
    
    projectResults.forEach((project) => {
      if (project) {
        projects.push(project);
      }
    });
  }

  // Get moreButton URL
  let moreButtonUrl: string | undefined;
  if (props.moreButton && Array.isArray(props.moreButton) && props.moreButton.length > 0) {
    moreButtonUrl = linkHref(props.moreButton[0]);
  }

  // Get submissionButton URL
  let submissionButtonUrl: string | undefined;
  if (props.submissionButton && Array.isArray(props.submissionButton) && props.submissionButton.length > 0) {
    submissionButtonUrl = linkHref(props.submissionButton[0]);
  }

  return {
    title: props.title || undefined,
    projects: projects.length > 0 ? projects : undefined,
    moreButtonUrl,
    submissionHeading: props.submissionHeading || undefined,
    submissionDescription: props.submissionDescription || undefined,
    submissionButtonUrl,
  };
}
