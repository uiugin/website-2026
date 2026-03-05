/**
 * Features component props mapper
 * Maps Umbraco Features block properties to Features component props
 */
import type { components } from '../api/types.js';

type FeaturesElementModel = components['schemas']['FeaturesElementModel'];

export interface FeatureItem {
  number: string;
  title: string;
  description: string;
  variant?: 'red' | 'yellow' | 'black';
}

export interface FeaturesProps {
  features?: FeatureItem[];
}

/**
 * Map Umbraco Features element to Features component props
 */
export function mapFeaturesProps(
  featuresElement: FeaturesElementModel | null | undefined
): FeaturesProps {
  if (!featuresElement?.properties) {
    return {};
  }

  const props = featuresElement.properties;
  const features: FeatureItem[] = [];

  // Map the three features
  const featureData = [
    {
      heading: props.headingOne,
      description: props.descriptionOne,
      variant: 'red' as const,
      number: '01'
    },
    {
      heading: props.headingSecond,
      description: props.descriptionSecond,
      variant: 'yellow' as const,
      number: '02'
    },
    {
      heading: props.headingThird,
      description: props.descriptionThird,
      variant: 'black' as const,
      number: '03'
    }
  ];

  // Always include all three features, even if some fields are empty
  featureData.forEach((feature) => {
    features.push({
      number: feature.number,
      title: feature.heading || '',
      description: feature.description || '',
      variant: feature.variant
    });
  });

  return {
    features: features.length > 0 ? features : undefined,
  };
}
