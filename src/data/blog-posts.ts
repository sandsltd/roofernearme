import { BlogPost } from './types';

export type { BlogPost } from './types';

import signsYouNeedNewRoof from './blog-posts/signs-you-need-a-new-roof';
import costOfRoofReplacement from './blog-posts/cost-of-roof-replacement-uk';
import roofersInGlasgow from './blog-posts/roofers-in-glasgow';
import roofersInLondon from './blog-posts/roofers-in-london';
import roofersInBirmingham from './blog-posts/roofers-in-birmingham';
import roofersInManchester from './blog-posts/roofers-in-manchester';
import roofersInLeeds from './blog-posts/roofers-in-leeds';
import roofersInLiverpool from './blog-posts/roofers-in-liverpool';
import roofersInNewcastle from './blog-posts/roofers-in-newcastle';
import roofersInNottingham from './blog-posts/roofers-in-nottingham';
import roofersInSheffield from './blog-posts/roofers-in-sheffield';
import roofersInBristol from './blog-posts/roofers-in-bristol';
import roofersInLeicester from './blog-posts/roofers-in-leicester';
import roofersInEdinburgh from './blog-posts/roofers-in-edinburgh';
import roofersInBrighton from './blog-posts/roofers-in-brighton';
import roofersInBournemouth from './blog-posts/roofers-in-bournemouth';
import roofersInPoole from './blog-posts/roofers-in-poole';
import roofersInCardiff from './blog-posts/roofers-in-cardiff';
import roofersInStoke from './blog-posts/roofers-in-stoke';
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
    image: '/blog/roofers-in-glasgow.png'
  },
  {
    ...roofersInLondon,
    image: '/blog/roofer-in-london.png'
  },
  {
    ...roofersInBirmingham,
    image: '/blog/roofer-in-birmingham.png'
  },
  {
    ...roofersInManchester,
    image: '/blog/roofer-in-manchester.png'
  },
  {
    ...roofersInLeeds,
    image: '/blog/roofer-in-leeds.png'
  },
  {
    ...roofersInLiverpool,
    image: '/blog/roofer-in-liverpool.png'
  },
  {
    ...roofersInNewcastle,
    image: '/blog/roofer-in-newcastle.png'
  },
  {
    ...roofersInNottingham,
    image: '/blog/roofer-in-nottingham.png'
  },
  {
    ...roofersInSheffield,
    image: '/blog/roofer-in-sheffield.png'
  },
  {
    ...roofersInBristol,
    image: '/blog/roofer-in-bristol.png'
  },
  {
    ...roofersInLeicester,
    image: '/blog/roofer-in-leicester.png'
  },
  {
    ...roofersInEdinburgh,
    image: '/blog/roofer-in-edinburgh.png'
  },
  {
    ...roofersInBrighton,
    image: '/blog/roofer-in-brighton.png'
  },
  {
    ...roofersInBournemouth,
    image: '/blog/roofer-in-bournemouth.png'
  },
  {
    ...roofersInPoole,
    image: '/blog/roofer-in-poole-2.png'
  },
  {
    ...roofersInCardiff,
    image: '/blog/roofer-in-cardiff.png'
  },
  {
    ...roofersInStoke,
    image: '/blog/roofer-in-stoke.png'
  },
  {
    ...emergencyRoofRepairs,
    image: '/blog/flat-roof-maintenance.png'
  },
  {
    ...choosingRoofingMaterial,
    image: '/blog/roof-materials.png'
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
    image: '/blog/cost-of-roof-replacement.png'
  },
  {
    ...comparingRoofingMaterials,
    image: '/blog/chichester-cathedral-roofing-services.png'
  },
  {
    ...roofSafetyTips,
    image: '/blog/winter-roof-maintenance-snow.png'
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