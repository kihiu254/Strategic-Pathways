export type FeaturedSuccessStory = {
  id: string;
  full_name: string;
  role: string;
  organization: string | null;
  story: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
};

export const FEATURED_SUCCESS_STORIES: FeaturedSuccessStory[] = [
  {
    id: 'featured-john-david',
    full_name: 'John David',
    role: 'Financial Analyst',
    organization: null,
    story:
      "The platform's verification system gave me the credibility I needed to win contracts with institutional partners across the country.",
    image_url: null,
    is_published: true,
    created_at: '2026-03-27T00:00:00.000Z',
  },
  {
    id: 'featured-sarah-blessings',
    full_name: 'Sarah Blessings',
    role: 'Strategy Consultant',
    organization: null,
    story:
      'Strategic Pathways connected me with a high-impact infrastructure project that perfectly matched my expertise in sustainable development.',
    image_url: null,
    is_published: true,
    created_at: '2026-03-26T00:00:00.000Z',
  },
];

const buildStoryKey = (story: { full_name: string; story: string }) =>
  `${story.full_name.trim().toLowerCase()}::${story.story.trim().toLowerCase()}`;

export const prependFeaturedSuccessStories = <
  T extends {
    id: string;
    full_name: string;
    story: string;
    role: string | null;
    organization: string | null;
    image_url: string | null;
    created_at: string;
    is_published?: boolean;
  },
>(
  stories: T[]
): T[] => {
  const existingKeys = new Set(stories.map((story) => buildStoryKey(story)));
  const featured = FEATURED_SUCCESS_STORIES.filter((story) => !existingKeys.has(buildStoryKey(story))) as unknown as T[];
  return [...featured, ...stories];
};
