export interface Video {
  id: number;
  name: string;
  size: string;
  uploaded: string;
}

export interface MenuItem {
  name: string;
  icon: string;
}

export type ViewMode = 'grid' | 'list' | 'compact';

export interface User {
  name: string;
  username: string;
  avatar?: string;
}