export type SiteConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
  ogImage: string;
  copyright: string;
  mainNav: MainNavItem[];
};

export type NavItem =
  | {
      title: string;
      href: string;
    }
  | {
      title: string;
      subItems: {
        title: string;
        href: string;
        description?: string;
      }[];
    };

export type MainNavItem = NavItem;
