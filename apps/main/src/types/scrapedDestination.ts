export interface ScrapedDestination {
  id: number;
  created_at: Date;
  updated_at: Date;
  url: string;
  http_code: number;
  title: string;
  description: string;
  language: string;
  headers: Headers;
  meta_tags: MetaTag[];
  headings: Heading[];
  images: Image[];
  internal_links: Link[];
  external_social_links: Link[];
  external_competitor_links: null;
  external_subdomain_links: Link[];
  external_other_links: Link[];
  socials: Socials;
  app_store_links: Link[];
  emails: null;
  phone_numbers: null;
  contact_page_url: string;
  login_page_url: null;
  register_page_url: string;
  privacy_policy_page_url: string;
  terms_and_conditions_page_url: string;
  cookie_policy_page_url: null;
  primary_color: null;
  primary_image: string;
  technologies: null;
  scrape_time: number;
}

export interface Link {
  uri: string;
  text: string;
  count: number;
  app_id?: string;
  username?: string;
}

export interface Headers {
  Date: string[];
  "Content-Type": string[];
  "Cache-Control": string[];
  "Content-Length": string[];
  "Referrer-Policy": string[];
  "X-Frame-Options": string[];
  "Strict-Transport-Security": string[];
}

export interface Heading {
  tag: Tag;
  text: string;
}

export enum Tag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
  H6 = "h6",
}

export interface Image {
  alt: string;
  src: string;
}

export interface MetaTag {
  name: string;
  content: string;
  property: string;
}

export interface Socials {
  "instagram.com": string;
  "facebook.com": string;
  "twitter.com": string;
}
