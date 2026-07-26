import type { FestivalBannerProps } from '../lib/festival-mapper';

export interface LayoutLink {
    title: string;
    url: string;
    target: string | null;
}

export interface FooterData {
    footerLogo: string;
    description: string | null;
    footerMenu: LayoutLink[];
    copyright: string | null;
    marquee: string | null;
}

export interface SocialLinks {
    discord?: string;
    meetup?: string;
    github?: string;
    youtube?: string;
    linkedin?: string;
}

export interface LayoutData {
    siteName: string;
    logo: string;
    navItems: LayoutLink[];
    ctaItem: LayoutLink | null;
    footer: FooterData;
    social: SocialLinks;
    /** Under-nav festival marquee from Site Settings (`headerMarquee` / `headerMarqueeLink`). */
    headerMarquee?: FestivalBannerProps | null;
}
