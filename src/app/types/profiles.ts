
export interface Profile {
  id: string;
  name: string;
  email: string;
  tag: string;
  contact: string;
  description: string;
  location: string;
  industry: string;
  businessType: string;
  contactEmail: string;
  contactPerson: string;
  phoneNumber: string;
  tags: string[];
  status: 'Active' | 'Inactive';
  created: string;
  lastUpdated: string;
}

/**
 * Interface representing a sub-profile, linked to a main profile.
 */
export interface SubProfile {
  id: string;
  profileId: string;
  name: string;
  email: string;
  created: string;
}