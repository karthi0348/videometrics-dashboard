export interface Video {
  id: number;
  name: string;
  url: string;
  size: string;
  uploaded: string;
  video_name?: string;
  file_size?: string;
  created_at?: string;
}



export interface Profile {
  id: number;
  name: string;
  email?: string;
  tag?: string;
  contact?: string;
  description?: string;
}

export interface SubProfile {
  id: number;
  name: string;
  profile_id: number;
  description?: string;
  areaType?: string;
  isActive?: boolean;
}


export interface Template {
  id: number;
  name: string;
  description?: string;
  type?: string;
}

export interface ProcessingVideo {
  video_id: number;
  uuid: string;
  video_name: string;
  status: string;
  estimated_completion: string;
  priority: string;
}

export type Priority = 'normal' | 'high' | 'low';


export interface ProcessVideoPageProps {
  videos?: Video[];
  profiles?: Profile[];
  subProfiles?: SubProfile[];
  templates?: Template[];
}