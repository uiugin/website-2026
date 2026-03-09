/**
 * Domain types for CMS content, aligned with exampledatabackoffice and API.
 * Used by pages, mappers, and components.
 */

export interface Speaker {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  profileUrl?: string | null;
}

export interface Attendee {
  id: string;
  name: string;
  photoUrl?: string | null;
}

export interface RichText {
  markup: string;
  blocks?: unknown[];
}

export type EventStatus = 'INCOMING' | 'ARCHIVED';
export type EventType =
  | 'TECHNICAL_BRIEFING'
  | 'WORKSHOP'
  | 'KEYNOTE'
  | 'MEETUP'
  | 'HACKATHON'
  | string;

export interface Event {
  id: string;
  title: string;
  type: EventType;
  speakers: Speaker[];
  attendees: Attendee[];
  date: string;
  time: string;
  status: EventStatus;
  briefSummary: string;
  fullSummary: string;
  location?: string | null;
  url?: string | null;
  agenda?: { time: string; task: string }[];
}
