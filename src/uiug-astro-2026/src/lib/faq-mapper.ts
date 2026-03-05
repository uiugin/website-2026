/**
 * FAQ component props mapper
 * Maps Umbraco FAQ block properties to FAQ component props
 */
import type { components } from '../api/types.js';

type FaqElementModel = components['schemas']['FaqElementModel'];
type FaqSubBlockElementModel = components['schemas']['FaqSubBlockElementModel'];
type ApiBlockListModel = components['schemas']['ApiBlockListModel'];
type RichTextModel = components['schemas']['RichTextModel'];

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQProps {
  title?: string;
  faqs?: FAQItem[];
  titleCard?: string;
  titleDescription?: string;
  tipOfTheDay?: string;
}

/**
 * Extract plain text from RichTextModel
 */
function extractRichText(richText: RichTextModel | null | undefined): string {
  if (!richText) return '';
  
  // RichTextModel can be a string or an object with markup
  if (typeof richText === 'string') {
    return richText;
  }
  
  // If it's an object, try to extract text from markup
  if (richText && typeof richText === 'object') {
    // Check for common rich text properties
    if ('markup' in richText && typeof richText.markup === 'string') {
      // Strip HTML tags for plain text
      return richText.markup.replace(/<[^>]*>/g, '').trim();
    }
    if ('text' in richText && typeof richText.text === 'string') {
      return richText.text;
    }
  }
  
  return '';
}

/**
 * Map Umbraco FAQ Element to FAQ component props
 */
export async function mapFAQProps(
  faqElement: FaqElementModel | null | undefined
): Promise<FAQProps> {
  if (!faqElement?.properties) {
    return {};
  }

  const props = faqElement.properties;
  const faqs: FAQItem[] = [];

  // Handle FAQ blocks - ApiBlockListModel contains items array
  if (props.faqBlocks && 'items' in props.faqBlocks && Array.isArray(props.faqBlocks.items)) {
    props.faqBlocks.items.forEach((blockItem) => {
      // Check if this is a FAQ Sub Block
      if (blockItem?.content && blockItem.content.contentType === 'faqSubBlock') {
        const faqSubBlock = blockItem.content as FaqSubBlockElementModel;
        const subBlockProps = faqSubBlock.properties;
        
        if (subBlockProps) {
          const question = subBlockProps.question || '';
          const answer = extractRichText(subBlockProps.answer);
          
          if (question || answer) {
            faqs.push({
              question: question.toUpperCase(),
              answer: answer
            });
          }
        }
      }
    });
  }

  return {
    title: props.title || undefined,
    faqs: faqs.length > 0 ? faqs : undefined,
    titleCard: props.titleCard || undefined,
    titleDescription: props.titleDescription || undefined,
    tipOfTheDay: props.tipOfTheDay || undefined,
  };
}
