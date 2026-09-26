export const categoriesData = [
  {
    name: 'Anime',
    slug: 'anime',
    tagline: 'Infinite Worlds, Unstoppable Passions',
    description: 'Immerse yourself in breathtaking animation, unforgettable sagas, legendary battles, and the profound stories of Japanese anime culture.',
    icon: 'Sparkles',
    color: '#8b5cf6', // Electric Violet
    bannerImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 1,
    active: true
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    tagline: 'Press Start to Transcend Reality',
    description: 'From sprawling open-world RPGs to high-octane competitive esports, experience interactive entertainment at its pinnacle.',
    icon: 'Gamepad2',
    color: '#3b82f6', // Bright Blue
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 2,
    active: true
  },
  {
    name: 'Movies',
    slug: 'movies',
    tagline: 'Cinematic Spectacles on the Grandest Scale',
    description: 'Explore cinematic universes, blockbuster premieres, deep cinematic analyses, behind-the-scenes insights, and visionary directors.',
    icon: 'Film',
    color: '#ec4899', // Soft Magenta
    bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 3,
    active: true
  },
  {
    name: 'TV Shows',
    slug: 'tv-shows',
    tagline: 'Epic Series & Binge-Worthy Universes',
    description: 'Follow multi-season character arcs, serialized mysteries, groundbreaking prestige television, and cult fandom phenomenons.',
    icon: 'Tv',
    color: '#06b6d4', // Cyan
    bannerImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 4,
    active: true
  },
  {
    name: 'K-Pop',
    slug: 'k-pop',
    tagline: 'Global Rhythms, Electrifying Stages',
    description: 'Celebrate chart-topping idols, dazzling concept albums, dynamic choreography, lightstick culture, and passionate global fan armies.',
    icon: 'Music2',
    color: '#f43f5e', // Rose
    bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 5,
    active: true
  },
  {
    name: 'Comics',
    slug: 'comics',
    tagline: 'Heroes, Legends & Multiversal Epics',
    description: 'Discover legendary comic runs, groundbreaking graphic novels, superhero pantheons, indie masterpieces, and illustrated storytelling.',
    icon: 'BookOpen',
    color: '#eab308', // Amber
    bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 6,
    active: true
  },
  {
    name: 'Manga',
    slug: 'manga',
    tagline: 'The Master Art of Ink and Emotion',
    description: 'Follow serialization arcs, legendary mangaka retrospectives, weekly chapter drops, and timeless black-and-white visual mastery.',
    icon: 'ScrollText',
    color: '#10b981', // Emerald
    bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 7,
    active: true
  },
  {
    name: 'Cosplay',
    slug: 'cosplay',
    tagline: 'Where Imagination Becomes Living Art',
    description: 'Celebrate costume engineering, prop fabrication, masquerades, photo shoots, makeup artistry, and convention community culture.',
    icon: 'Crown',
    color: '#a855f7', // Purple
    bannerImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=80',
    displayOrder: 8,
    active: true
  }
];

export const chatbotFaqsData = [
  {
    question: 'What is Fan Hub Plus?',
    answer: 'Fan Hub Plus is an all-in-one immersive Fandom Universe portal uniting fans of Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga, and Cosplay. Explore rich character dossiers, multimedia streaming, articles, upcoming release timelines, location-aware events, and merchandise showcases.',
    category: 'Platform Overview',
    keywords: ['fan hub plus', 'about', 'platform', 'what is', 'overview'],
    actionLink: '/explore',
    actionText: 'Explore Universe'
  },
  {
    question: 'How do I bookmark content and add personal notes?',
    answer: 'Simply click the bookmark icon on any article, character profile, media item, or merchandise showcase card. You can open your personalized Dashboard at /dashboard to review your saved collection and attach custom notes to each bookmark.',
    category: 'User Experience',
    keywords: ['bookmark', 'save', 'favorite', 'notes', 'dashboard'],
    actionLink: '/dashboard',
    actionText: 'Open Dashboard'
  },
  {
    question: 'Can I purchase merchandise on Fan Hub Plus?',
    answer: 'No. As specified by the Fan Hub Plus platform guidelines, our Merchandise Hub is strictly designed for discovery and showcase. We provide collector metadata, release schedules, and direct links to official licensed distributors, with no cart or checkout.',
    category: 'Merchandise',
    keywords: ['buy', 'purchase', 'cart', 'checkout', 'merchandise', 'store'],
    actionLink: '/merchandise',
    actionText: 'View Merch Showcase'
  },
  {
    question: 'How do I find fan conventions and cosplay meetups near me?',
    answer: 'Navigate to our Event Discovery portal or Calendar. Our platform features GPS/location-aware filtering, city filters, venue coordinates, and direct links to official convention ticket passes.',
    category: 'Events',
    keywords: ['event', 'convention', 'con', 'cosplay meetup', 'calendar', 'map', 'nearby'],
    actionLink: '/events',
    actionText: 'Browse Events'
  },
  {
    question: 'How can I submit my own fan articles or cosplay photography?',
    answer: 'Registered community members can visit /submit-content to submit fan articles, cosplay galleries, reviews, or guides. Our curation desk moderates every submission, and approved articles appear in our live community spotlight.',
    category: 'Community',
    keywords: ['submit', 'submission', 'fan content', 'fan article', 'publish', 'contribute'],
    actionLink: '/submit-content',
    actionText: 'Submit Fan Content'
  },
  {
    question: 'Where can I watch anime trailers and listen to soundtrack samples?',
    answer: 'Our Interactive Multimedia Center houses high-definition video trailers, soundtrack clips, podcast episodes, and character galleries. You can rate any media item using our 5-star scoring and thumbs up/down system.',
    category: 'Multimedia',
    keywords: ['media', 'trailer', 'video', 'music', 'soundtrack', 'audio', 'stream'],
    actionLink: '/media',
    actionText: 'Open Media Center'
  }
];
