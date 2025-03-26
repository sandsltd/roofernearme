import { BlogPost } from './types';

export type { BlogPost } from './types';

import signsYouNeedNewRoof from './blog-posts/signs-you-need-a-new-roof';
import costOfRoofReplacement from './blog-posts/cost-of-roof-replacement-uk';
import roofersInGlasgow from './blog-posts/roofers-in-glasgow';
import roofersInLondon from './blog-posts/roofers-in-london';
import emergencyRoofRepairs from './blog-posts/emergency-roof-repairs';
import choosingRoofingMaterial from './blog-posts/choosing-roofing-material';
import winterRoofMaintenance from './blog-posts/winter-roof-maintenance';
import roofingServicesChichester from './blog-posts/roofing-services-chichester';
import flatRoofMaintenance from './blog-posts/flat-roof-maintenance';
import roofWarranties from './blog-posts/roof-warranties';
import comparingRoofingMaterials from './blog-posts/comparing-roofing-materials';
import roofSafetyTips from './blog-posts/roof-safety-tips';

// Update image paths for each post
const posts: BlogPost[] = [
  {
    ...signsYouNeedNewRoof,
    image: '/blog/signs-you-need-new-roof.png'
  },
  {
    ...costOfRoofReplacement,
    image: '/blog/cost-of-roof-replacement.png'
  },
  {
    ...roofersInGlasgow,
    image: '/blog/glasgow-clyde-river-roofing-services.png'
  },
  {
    ...roofersInLondon,
    image: '/blog/london-skyline-tower-bridge-roofing.png'
  },
  {
    ...emergencyRoofRepairs,
    image: '/blog/roofers-in-london.png'
  },
  {
    ...choosingRoofingMaterial,
    image: '/blog/roofers-in-glasgow.png'
  },
  {
    ...winterRoofMaintenance,
    image: '/blog/winter-roof-maintenance-snow.png'
  },
  {
    ...roofingServicesChichester,
    image: '/blog/chichester-cathedral-roofing-services.png'
  },
  {
    ...flatRoofMaintenance,
    image: '/blog/flat-roof-maintenance.png'
  },
  {
    ...roofWarranties,
    image: '/blog/signs-you-need-new-roof.png'
  },
  {
    ...comparingRoofingMaterials,
    image: '/blog/cost-of-roof-replacement.png'
  },
  {
    ...roofSafetyTips,
    image: '/blog/roofers-in-glasgow.png'
  }
];

// Sort posts by date (newest first)
export const blogPosts: BlogPost[] = posts.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

// Helper function to get a post by its slug
export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

// Helper function to get all posts
export const getAllPosts = (): BlogPost[] => {
  return blogPosts;
}; 