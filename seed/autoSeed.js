import crypto from 'crypto';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Content from '../models/Content.js';
import Character from '../models/Character.js';
import Article from '../models/Article.js';
import Media from '../models/Media.js';
import Merchandise from '../models/Merchandise.js';
import UpcomingRelease from '../models/UpcomingRelease.js';
import Event from '../models/Event.js';
import Bookmark from '../models/Bookmark.js';
import Feedback from '../models/Feedback.js';
import FanSubmission from '../models/FanSubmission.js';
import ChatbotFAQ from '../models/ChatbotFAQ.js';
import { categoriesData, chatbotFaqsData } from './seedData.js';


const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const resolveSeedCredential = (key, label) => {
  const configured = process.env[key];
  if (configured) return configured;

  if (isProduction) {
    throw new Error(`${key} must be configured before seeding an empty production database.`);
  }

  const generated = crypto.randomBytes(18).toString('base64url');
  console.warn(`⚠️ ${key} was not set. Generated temporary local ${label}: ${generated}`);
  return generated;
};

export const autoSeedIfEmpty = async () => {
  try {
    const catCount = await Category.countDocuments();
    if (catCount > 0) {
      console.log(`ℹ️ Database already has ${catCount} categories loaded.`);
      return;
    }

    console.log('🚀 First launch detected: auto-seeding sample fandom universe data...');

    const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fanhubplus.demo';
    const seedUserEmail = process.env.SEED_USER_EMAIL || 'user@fanhubplus.demo';
    const seedAdminPassword = resolveSeedCredential('SEED_ADMIN_PASSWORD', 'admin seed password');
    const seedUserPassword = resolveSeedCredential('SEED_USER_PASSWORD', 'user seed password');

    // 1. Users
    const adminUser = await User.create({
      name: 'Eleanor Vance (Curator Admin)',
      email: seedAdminEmail,
      password: seedAdminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Head Curator & Master Administrator of the Fan Hub Plus Fandom Universe.',
      favoriteFandoms: ['Anime', 'Gaming', 'Manga', 'Arcane'],
      categoriesOfInterest: ['Anime', 'Gaming', 'TV Shows', 'Cosplay'],
      displayPreferences: { theme: 'light', fontSize: 'medium', reducedMotion: false }
    });

    const standardUser = await User.create({
      name: 'Kai Takahashi',
      email: seedUserEmail,
      password: seedUserPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Lifelong anime enthusiast, gamer, and weekend prop builder.',
      favoriteFandoms: ['Demon Slayer', 'Elden Ring', 'Solo Leveling', 'Spider-Man'],
      categoriesOfInterest: ['Anime', 'Gaming', 'Cosplay', 'Manga'],
      displayPreferences: { theme: 'light', fontSize: 'medium', reducedMotion: false }
    });

    // 2. Categories
    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.slug] = c._id; });

    // 3. Content
    const contentItems = [
      {
        title: 'Demon Slayer: Kimetsu no Yaiba - Infinity Castle Saga',
        slug: 'demon-slayer-infinity-castle-saga',
        category: catMap['anime'],
        fandom: 'Demon Slayer',
        type: 'article',
        genre: ['Action', 'Supernatural', 'Dark Fantasy', 'Shonen'],
        description: 'The ultimate clash against Kibutsuji Muzan inside the labyrinthine Infinity Castle unfolds in unprecedented cinematic glory.',
        fullContent: 'Ufotable elevates modern animation craftsmanship with the monumental Infinity Castle arc. Tanjiro, Nezuko, and the Hashira march into the dimension-shifting fortress to face the Upper Moon demons in an epic struggle for humanity\'s salvation.',
        tags: ['ufotable', 'Tanjiro', 'Hashira', 'Infinity Castle', 'Muzan'],
        bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2025-04-10'),
        releaseYear: 2025,
        popularityScore: 99,
        viewCount: 15400,
        ratingAverage: 4.95,
        ratingCount: 840,
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Jujutsu Kaisen: Culling Game Warfare',
        slug: 'jujutsu-kaisen-culling-game',
        category: catMap['anime'],
        fandom: 'Jujutsu Kaisen',
        type: 'video',
        genre: ['Supernatural', 'Martial Arts', 'Shonen'],
        description: 'Kenjaku\'s deadly ritual plunges Japan into chaos as jujutsu sorcerers and ancient reincarnated combatants fight for survival.',
        fullContent: 'With Satoru Gojo sealed away in the Prison Realm, Yuji Itadori and Megumi Fushiguro step into the lethal colony zones of the Culling Game.',
        tags: ['JJK', 'MAPPA', 'Yuji Itadori', 'Gojo', 'Sukuna'],
        bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2025-01-15'),
        releaseYear: 2025,
        popularityScore: 97,
        viewCount: 12200,
        ratingAverage: 4.9,
        ratingCount: 650,
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Solo Leveling: Arise from the Shadows',
        slug: 'solo-leveling-arise',
        category: catMap['anime'],
        fandom: 'Solo Leveling',
        type: 'profile',
        genre: ['Action', 'Fantasy', 'System'],
        description: 'The journey of Sung Jinwoo from the weakest E-Rank hunter to the sovereign Monarch of Shadows.',
        fullContent: 'When an enigmatic system grants Jinwoo the ability to level up infinitely, he ascends through perilous dungeons, raising an immortal legion of shadow soldiers.',
        tags: ['Solo Leveling', 'Jinwoo', 'Shadow Monarch', 'A-1 Pictures'],
        bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2024-03-01'),
        releaseYear: 2024,
        popularityScore: 96,
        viewCount: 11000,
        ratingAverage: 4.88,
        ratingCount: 520,
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Elden Ring: Shadow of the Erdtree Odyssey',
        slug: 'elden-ring-shadow-of-the-erdtree',
        category: catMap['gaming'],
        fandom: 'Elden Ring',
        type: 'article',
        genre: ['Action RPG', 'Dark Fantasy', 'Open World'],
        description: 'Guided by Empyrean Miquella, the Tarnished enters the Realm of Shadow to uncover the sinister origins of Queen Marika.',
        fullContent: 'FromSoftware delivers an expansive masterpiece featuring punishing boss battles, sprawling subterranean fortresses, and unforgettable lore.',
        tags: ['FromSoftware', 'Miquella', 'Messmer', 'Tarnished', 'Soulsborne'],
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2024-06-21'),
        releaseYear: 2024,
        popularityScore: 98,
        viewCount: 16800,
        ratingAverage: 4.96,
        ratingCount: 910,
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse Chronicles',
        slug: 'spider-man-beyond-the-spider-verse',
        category: catMap['movies'],
        fandom: 'Spider-Man',
        type: 'article',
        genre: ['Animation', 'Superhero', 'Multiverse'],
        description: 'Miles Morales races across dimensions against Miguel O\'Hara and the Spider-Society to save his father and his home world.',
        fullContent: 'Groundbreaking visual animation blending watercolor painting, punk-rock collages, and futuristic comic-book styling redefine the cinematic superhero experience.',
        tags: ['Miles Morales', 'Gwen Stacy', 'Spider-Verse', 'Sony Animation'],
        bannerUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2025-06-15'),
        releaseYear: 2025,
        popularityScore: 97,
        viewCount: 13500,
        ratingAverage: 4.92,
        ratingCount: 710,
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Arcane: The Piltover & Zaun Divide',
        slug: 'arcane-piltover-zaun-divide',
        category: catMap['tv-shows'],
        fandom: 'Arcane / League of Legends',
        type: 'video',
        genre: ['Animation', 'Steampunk', 'Tragedy'],
        description: 'Sisters Vi and Jinx find themselves on opposing sides of a catastrophic war between utopian Piltover and underground Zaun.',
        fullContent: 'Fortiche Production and Riot Games created an emotional masterpiece celebrated worldwide for its painterly aesthetic, orchestral score, and complex character evolution.',
        tags: ['Arcane', 'Jinx', 'Vi', 'Riot Games', 'Fortiche'],
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2024-11-09'),
        releaseYear: 2024,
        popularityScore: 98,
        viewCount: 14200,
        ratingAverage: 4.97,
        ratingCount: 880,
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'NewJeans: Supernatural World Tour & Concept Aesthetics',
        slug: 'newjeans-supernatural-world',
        category: catMap['k-pop'],
        fandom: 'NewJeans',
        type: 'audio',
        genre: ['Pop', 'R&B', 'Y2K Revival'],
        description: 'Deconstructing the nostalgic Y2K soundscapes, Takashi Murakami collaborations, and viral dance choreographies.',
        fullContent: 'From Attention and Hype Boy to Supernatural, explore how Minji, Hanni, Danielle, Haerin, and Hyein revitalized global music production.',
        tags: ['NewJeans', 'Bunnies', 'ADOR', 'HYBE', 'Y2K'],
        bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2024-07-12'),
        releaseYear: 2024,
        popularityScore: 93,
        viewCount: 8900,
        ratingAverage: 4.85,
        ratingCount: 390,
        isFeatured: false,
        isTrending: false
      },
      {
        title: 'Batman: The Court of Owls Retrospective',
        slug: 'batman-court-of-owls-retrospective',
        category: catMap['comics'],
        fandom: 'Batman / DC',
        type: 'article',
        genre: ['Mystery', 'Superhero', 'Noir'],
        description: 'Scott Snyder and Greg Capullo\'s modern classic pitting Gotham\'s Dark Knight against a century-old secret society of Talons.',
        fullContent: 'An architectural dive into Gotham City and how the Court of Owls shattered Batman\'s belief that he knew every stone and alleyway in his city.',
        tags: ['Batman', 'DC Comics', 'Court of Owls', 'Scott Snyder'],
        bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2023-10-10'),
        releaseYear: 2023,
        popularityScore: 91,
        viewCount: 6700,
        ratingAverage: 4.82,
        ratingCount: 290,
        isFeatured: false,
        isTrending: false
      },
      {
        title: 'Chainsaw Man: The Inescapable Devil Rebirth',
        slug: 'chainsaw-man-devil-rebirth',
        category: catMap['manga'],
        fandom: 'Chainsaw Man',
        type: 'image',
        genre: ['Dark Comedy', 'Action', 'Gore', 'Supernatural'],
        description: 'Tatsuki Fujimoto\'s untamed genius blending cinematic storytelling, unpredictable grief, and visceral action.',
        fullContent: 'Follow Denji and the Control Devil through Part 2\'s school life arc as the War Devil emerges to challenge the legend of Chainsaw Man.',
        tags: ['Fujimoto', 'Denji', 'Makima', 'Asa Mitaka', 'Shonen Jump'],
        bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2024-02-14'),
        releaseYear: 2024,
        popularityScore: 95,
        viewCount: 10400,
        ratingAverage: 4.89,
        ratingCount: 480,
        isFeatured: false,
        isTrending: true
      },
      {
        title: 'Master Armor Fabrication: Foam to High Fantasy',
        slug: 'master-armor-fabrication-guide',
        category: catMap['cosplay'],
        fandom: 'Cosplay Crafting',
        type: 'article',
        genre: ['Tutorial', 'Craftsmanship', 'Prop Making'],
        description: 'High-density EVA foam techniques, patterning, contact adhesives, heat shaping, and metallic airbrush weathering.',
        fullContent: 'Cosplay artists break down how complex video game armor suits from Monster Hunter and Elden Ring are engineered for lightweight mobility.',
        tags: ['Cosplay', 'EVA Foam', 'Prop Making', 'Tutorial', 'Worbla'],
        bannerUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
        releaseDate: new Date('2024-05-18'),
        releaseYear: 2024,
        popularityScore: 89,
        viewCount: 5200,
        ratingAverage: 4.86,
        ratingCount: 210,
        isFeatured: false,
        isTrending: false
      }
    ];
    const createdContent = await Content.insertMany(contentItems);

    // 4. Characters
    await Character.insertMany([
      {
        name: 'Tanjiro Kamado',
        japaneseName: '竈門 炭治郎',
        category: catMap['anime'],
        fandom: 'Demon Slayer',
        role: 'Demon Slayer Corps Swordsman (Sun Breathing)',
        bio: 'Kind-hearted young swordsman who joined the Demon Slayer Corps to find a cure for his sister Nezuko and eliminate Kibutsuji Muzan.',
        backstory: 'After his family was slaughtered by demons, Tanjiro survived with his sister Nezuko. Guided by Sakonji Urokodaki, he mastered Water Breathing before unlocking the ancient Hinokami Kagura.',
        abilities: ['Sun Breathing (Hinokami Kagura)', 'Water Breathing', 'Transparent World', 'Enhanced Olfactory Senses'],
        voiceActor: 'Natsuki Hanae / Zach Aguilar',
        appearances: ['Demon Slayer Season 1-4', 'Mugen Train Movie', 'Infinity Castle Arc'],
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        popularityScore: 99,
        isFeatured: true,
        quotes: ['Never give up. Even if it hurts, don\'t try to take the easy way out.']
      },
      {
        name: 'Satoru Gojo',
        japaneseName: '五条 悟',
        category: catMap['anime'],
        fandom: 'Jujutsu Kaisen',
        role: 'Special Grade Jujutsu Sorcerer',
        bio: 'The strongest sorcerer in the world, wielding the legendary Limitless technique and the Six Eyes ocular ability.',
        backstory: 'Born into the prestigious Gojo clan, his birth alone shifted the balance of power throughout the cursed spirits universe.',
        abilities: ['Limitless: Infinity', 'Cursed Technique Lapse: Blue', 'Cursed Technique Reversal: Red', 'Hollow Purple', 'Unlimited Void'],
        voiceActor: 'Yuichi Nakamura / Kaiji Tang',
        appearances: ['Jujutsu Kaisen Season 1-2', 'Jujutsu Kaisen 0'],
        imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
        popularityScore: 100,
        isFeatured: true,
        quotes: ['Don\'t worry, I\'m the strongest.']
      },
      {
        name: 'Sung Jinwoo',
        japaneseName: '성진우 / 水篠 旬',
        category: catMap['anime'],
        fandom: 'Solo Leveling',
        role: 'Shadow Monarch (S-Rank Hunter)',
        bio: 'Formerly known as the Weakest Hunter of All Mankind, he was chosen by the System to become the Monarch of Shadows.',
        backstory: 'Risking his life to pay for his mother\'s hospital bills, Jinwoo\'s tenacity during the Cartenon Temple massacre granted him Player status.',
        abilities: ['Shadow Extraction (Arise)', 'Shadow Exchange', 'Dominator\'s Touch', 'Monarch\'s Domain'],
        voiceActor: 'Taito Ban / Aleks Le',
        appearances: ['Solo Leveling Season 1 & 2'],
        imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        popularityScore: 98,
        isFeatured: true,
        quotes: ['Arise.']
      },
      {
        name: 'Malenia, Blade of Miquella',
        japaneseName: 'ミケラの刃、マレニア',
        category: catMap['gaming'],
        fandom: 'Elden Ring',
        role: 'Demigod Empyrean & Goddess of Rot',
        bio: 'Fierce warrior twin to Miquella, born afflicted with Scarlet Rot, undefeated in combat across the Shattering war.',
        backstory: 'Wielding an elongated prosthetically attached katana, she resisted the outer god of rot through unyielding willpower.',
        abilities: ['Waterfowl Dance', 'Scarlet Aeonia Bloom', 'Rot Infusion'],
        voiceActor: 'Pip Torrens / Pippa Bennett-Warner',
        appearances: ['Elden Ring', 'Haligtree Roots'],
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        popularityScore: 97,
        isFeatured: true,
        quotes: ['I am Malenia, Blade of Miquella. And I have never known defeat.']
      },
      {
        name: 'Jinx (Powder)',
        japaneseName: 'ジンクス',
        category: catMap['tv-shows'],
        fandom: 'Arcane',
        role: 'Zaunite Anarchist & Hextech Weaponsmith',
        bio: 'Chaotic, brilliant marksman weaponizing neon explosions, miniguns, and rocket launchers across Piltover.',
        backstory: 'Orphaned during the uprising on the bridge of Piltover, Powder was raised by Vander and later adopted by crime lord Silco.',
        abilities: ['Pow-Pow Minigun', 'Fishbones Super Mega Death Rocket', 'Flame Chompers'],
        voiceActor: 'Ella Purnell / Mia Sinclair Jenness',
        appearances: ['Arcane Season 1 & 2', 'League of Legends'],
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        popularityScore: 98,
        isFeatured: true,
        quotes: ['I\'m crazy! Got a doctor\'s note and everything.']
      },
      {
        name: 'Miles Morales',
        japaneseName: 'マイルズ・モラレス',
        category: catMap['movies'],
        fandom: 'Spider-Man',
        role: 'Spider-Man (Earth-1610)',
        bio: 'Brooklyn teenager bitten by an Alchemax radioactive spider, stepping into the mantle of Spider-Man to forge his own path.',
        backstory: 'Mentored by Peter B. Parker and Gwen Stacy, Miles learned that what makes you different is what makes you Spider-Man.',
        abilities: ['Bio-Electric Venom Blast', 'Optical Camouflage', 'Spider-Sense', 'Wall Crawling'],
        voiceActor: 'Shameik Moore',
        appearances: ['Into the Spider-Verse', 'Across the Spider-Verse'],
        imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1200&q=80',
        popularityScore: 97,
        isFeatured: true,
        quotes: ['Everyone keeps telling me how my story is supposed to go. Nah. I\'m gonna do my own thing.']
      }
    ]);

    // 5. Articles
    await Article.insertMany([
      {
        title: 'The Evolution of Modern Anime Choreography: From Cel Animation to Ufotable\'s Digital Canvas',
        slug: 'evolution-modern-anime-choreography',
        category: catMap['anime'],
        fandom: 'Anime History & Art',
        summary: 'How digital 3D camera compositing and traditional 2D hand-drawn keyframing fused to spawn the modern animation renaissance.',
        content: `<h3>The Fusion of Dimensions</h3><p>In the golden age of hand-drawn cel animation, combat sequences relied heavily on speed lines, impact frames, and static panning backgrounds. Studios like ufotable, MAPPA, and Studio Wit have completely reinvented this grammar through dynamic virtual camera rigs operating inside 3D space, combined with high-cadence hand-drawn keyframes.</p>`,
        authorName: 'Kenji Sato',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        authorRole: 'Chief Animation Critic',
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        tags: ['Animation', 'ufotable', 'MAPPA', 'Choreography', 'Deep Dive'],
        eventTimelineHighlights: [
          { year: '2019', title: 'Tanjiro vs Rui (Episode 19)', description: 'The worldwide phenomenon ignited when Hinokami Kagura first aired.' },
          { year: '2020', title: 'Mugen Train Hits Record Box Office', description: 'Becomes the highest-grossing film in Japanese history.' },
          { year: '2025', title: 'Infinity Castle Trilogy Begins', description: 'The grand cinematic finale reaches worldwide IMAX theaters.' }
        ],
        readTime: '6 min read',
        viewCount: 4210,
        likesCount: 310,
        isFeatured: true
      },
      {
        title: 'Constructing Elden Ring: How FromSoftware Designed the Open-World Subversion',
        slug: 'constructing-elden-ring-open-world',
        category: catMap['gaming'],
        fandom: 'Elden Ring',
        summary: 'Deconstructing the layered verticality, sightline landmarks, and environmental storytelling of the Lands Between.',
        content: `<p>Open world video games often struggle with map clutter, ubiquitous mini-map markers, and checklist exhaustion. Hidetaka Miyazaki took the opposite approach with Elden Ring by using the Erd-Tree as a compass needle.</p>`,
        authorName: 'Marcus Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        authorRole: 'Lead Game Design Analyst',
        coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        tags: ['Elden Ring', 'Game Design', 'FromSoftware'],
        eventTimelineHighlights: [
          { year: '2022', title: 'Global Launch to Universal Acclaim', description: 'Wins Game of the Year across multiple international awards.' },
          { year: '2024', title: 'Shadow of the Erdtree Launch', description: 'Sets a new critical benchmark for expansion content.' }
        ],
        readTime: '5 min read',
        viewCount: 3150,
        likesCount: 260,
        isFeatured: true
      }
    ]);

    // 6. Media
    await Media.insertMany([
      {
        title: 'Demon Slayer: Kimetsu no Yaiba Infinity Castle — Official Trailer',
        type: 'trailer',
        category: catMap['anime'],
        fandom: 'Demon Slayer',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        embedUrl: 'https://www.youtube.com/embed/9kb7vK11_Rw',
        mediaUrl: '',
        description: 'Official Infinity Castle trailer embedded from Aniplex USA. The entry now links to the matching publisher video instead of unrelated sample footage.',
        duration: 'Official trailer',
        artistOrCreator: 'Aniplex USA / ufotable',
        sourceUrl: 'https://www.youtube.com/watch?v=9kb7vK11_Rw',
        rightsNote: 'Official publisher embed. Demon Slayer footage, music, characters and trademarks remain the property of their respective rights holders.',
        tags: ['Official Trailer', 'Infinity Castle', 'Tanjiro', 'ufotable'],
        ratingAverage: 4.95,
        ratingCount: 310,
        thumbsUpCount: 420,
        thumbsDownCount: 5,
        viewCount: 18500,
        isFeatured: true
      },
      {
        title: 'Fan Hub Plus Audio Player Demo — Ambient Mix',
        type: 'audio',
        category: catMap['k-pop'],
        fandom: 'Fan Hub Plus Demo',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        description: 'A clearly labeled sample track used to demonstrate the HTML audio-player experience. It is not presented as an official fandom soundtrack.',
        duration: 'Demo audio',
        artistOrCreator: 'SoundHelix sample audio',
        sourceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        rightsNote: 'Demo/sample audio. Verify the source terms before redistribution or use outside this project demonstration.',
        tags: ['Audio Demo', 'Player Test', 'Sample Track'],
        ratingAverage: 4.7,
        ratingCount: 72,
        thumbsUpCount: 110,
        thumbsDownCount: 3,
        viewCount: 3600,
        isFeatured: false
      },
      {
        title: 'ELDEN RING Shadow of the Erdtree — Official Launch Trailer',
        type: 'trailer',
        category: catMap['gaming'],
        fandom: 'Elden Ring',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        embedUrl: 'https://www.youtube.com/embed/JugxpebuS_E',
        mediaUrl: '',
        description: 'Official Shadow of the Erdtree launch trailer embedded from Bandai Namco Entertainment America, replacing unrelated demo footage.',
        duration: 'Official trailer',
        artistOrCreator: 'Bandai Namco Entertainment America / FromSoftware',
        sourceUrl: 'https://www.youtube.com/watch?v=JugxpebuS_E',
        rightsNote: 'Official publisher embed. ELDEN RING footage, music, characters and trademarks remain the property of their respective rights holders.',
        tags: ['Official Trailer', 'Elden Ring', 'Shadow of the Erdtree', 'FromSoftware'],
        ratingAverage: 4.92,
        ratingCount: 280,
        thumbsUpCount: 390,
        thumbsDownCount: 8,
        viewCount: 14200,
        isFeatured: true
      },
      {
        title: 'Cosplay Craft & Convention Gallery',
        type: 'gallery',
        category: catMap['cosplay'],
        fandom: 'Cosplay Showcase',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'A curated demonstration gallery for cosplay craft, costume presentation and convention-style photography. It no longer claims to contain official World Cosplay Summit photography.',
        duration: '3 demo images',
        artistOrCreator: 'Fan Hub Plus curated demo',
        sourceUrl: 'https://unsplash.com/',
        rightsNote: 'Demo images are loaded from Unsplash-hosted URLs. Verify each source and applicable license before final redistribution.',
        tags: ['Gallery', 'Cosplay', 'Costume Craft', 'Demo'],
        ratingAverage: 4.88,
        ratingCount: 145,
        thumbsUpCount: 220,
        thumbsDownCount: 2,
        viewCount: 6800,
        isFeatured: true
      }
    ]);

    // 7. Merchandise (Showcase only)
    await Merchandise.insertMany([
      {
        name: 'Tanjiro Kamado: Hinokami Kagura 1/7 Scale Deluxe Statue',
        category: catMap['anime'],
        fandom: 'Demon Slayer',
        description: 'Showcase figure featuring clear flame effect parts with embedded micro-LED illumination recreating the iconic Dance of the Fire God.',
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'
        ],
        tag: 'Limited Edition',
        isUpcoming: false,
        releaseDate: 'Available Now',
        manufacturer: 'Aniplex+ / Good Smile Company',
        scaleOrSize: '1/7 Scale (320mm tall)',
        officialStoreUrl: 'https://www.goodsmile.info',
        popularityScore: 99,
        viewCount: 4500
      },
      {
        name: 'Satoru Gojo: Hollow Purple Masterline Diorama',
        category: catMap['anime'],
        fandom: 'Jujutsu Kaisen',
        description: 'Museum-grade resin diorama capturing Gojo floating mid-air surrounded by distorted purple energy currents and Shibuya rubble.',
        imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80'],
        tag: 'Pre-Order',
        isUpcoming: true,
        releaseDate: 'Q4 2026',
        manufacturer: 'Prime 1 Studio',
        scaleOrSize: '1/4 Scale (650mm tall)',
        officialStoreUrl: 'https://prime1studio.com',
        popularityScore: 98,
        viewCount: 3800
      },
      {
        name: 'Messmer the Impaler Helmet Replica (Wearable Collector Edition)',
        category: catMap['gaming'],
        fandom: 'Elden Ring',
        description: 'Full-scale wearable replica crafted from reinforced fiberglass with coiled serpent motifs and weathered bronze electroplating.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'],
        tag: 'Collectible',
        isUpcoming: false,
        releaseDate: 'Available Now',
        manufacturer: 'PureArts / Bandai Namco',
        scaleOrSize: '1:1 Life Size',
        officialStoreUrl: 'https://store.bandainamcoent.com',
        popularityScore: 95,
        viewCount: 3100
      },
      {
        name: 'NewJeans Official Binky Bong Lightstick (Ver. 2 Special Edition)',
        category: catMap['k-pop'],
        fandom: 'NewJeans',
        description: 'Interactive concert lightstick with Bluetooth sync, customizable bunny faceplates, and dynamic stadium lighting choreography modes.',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        galleryImages: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'],
        tag: 'Official Merch',
        isUpcoming: false,
        releaseDate: 'Available Now',
        manufacturer: 'HYBE / Weverse Shop',
        scaleOrSize: 'Standard Concert Prop',
        officialStoreUrl: 'https://weverseshop.io',
        popularityScore: 94,
        viewCount: 2900
      }
    ]);

    // 8. Upcoming Releases
    await UpcomingRelease.insertMany([
      {
        title: 'Demon Slayer: Infinity Castle - Part 1 Global Theatrical Premiere',
        category: catMap['anime'],
        fandom: 'Demon Slayer',
        releaseType: 'Anime',
        releaseDate: new Date('2026-11-20'),
        platform: 'IMAX Theaters Worldwide',
        description: 'The monumental battle against Muzan begins as the Demon Slayer Corps is plunged into the infinite shifting fortress.',
        bannerImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        hypeCount: 28400,
        isConfirmed: true
      },
      {
        title: 'Grand Theft Auto VI',
        category: catMap['gaming'],
        fandom: 'GTA',
        releaseType: 'Game',
        releaseDate: new Date('2026-12-15'),
        platform: 'PlayStation 5 / Xbox Series X',
        description: 'Return to Leonida and neon-soaked Vice City in the most anticipated interactive open-world event in entertainment history.',
        bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        hypeCount: 45000,
        isConfirmed: true
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        category: catMap['movies'],
        fandom: 'Spider-Man',
        releaseType: 'Movie',
        releaseDate: new Date('2027-02-12'),
        platform: 'Theatrical Release',
        description: 'The multiverse trilogy reaches its dramatic conclusion as Miles Morales faces the alternate prowler version of himself.',
        bannerImage: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1200&q=80',
        hypeCount: 32000,
        isConfirmed: true
      }
    ]);

    // 9. Location-Aware Events
    await Event.insertMany([
      {
        title: 'Anime Expo 2026',
        slug: 'anime-expo-los-angeles-2026',
        category: catMap['anime'],
        fandom: 'Anime Community',
        type: 'Convention',
        description: 'The largest celebration of Japanese pop culture in North America, featuring voice actor panels, premieres, and an enormous cosplay gathering.',
        city: 'Los Angeles',
        country: 'USA',
        venue: 'Los Angeles Convention Center',
        address: '1201 S Figueroa St, Los Angeles, CA 90015',
        coordinates: { lat: 34.0407, lng: -118.2695 },
        startDate: new Date('2026-10-15T09:00:00Z'),
        endDate: new Date('2026-10-18T18:00:00Z'),
        ticketLink: 'https://www.anime-expo.org',
        bannerImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        attendeesCount: 110000,
        isFeatured: true
      },
      {
        title: 'San Diego Comic-Con International',
        slug: 'san-diego-comic-con-2026',
        category: catMap['comics'],
        fandom: 'Comics & Pop Culture',
        type: 'Convention',
        description: 'The world-famous epicenter of comics, superhero cinema, and Hall H mega-announcements.',
        city: 'San Diego',
        country: 'USA',
        venue: 'San Diego Convention Center',
        address: '111 W Harbor Dr, San Diego, CA 92101',
        coordinates: { lat: 32.7072, lng: -117.1625 },
        startDate: new Date('2026-10-22T08:00:00Z'),
        endDate: new Date('2026-10-25T19:00:00Z'),
        ticketLink: 'https://www.comic-con.org',
        bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        attendeesCount: 135000,
        isFeatured: true
      },
      {
        title: 'Tokyo Game Show (TGS) 2026',
        slug: 'tokyo-game-show-2026',
        category: catMap['gaming'],
        fandom: 'Gaming & Tech',
        type: 'Tournament',
        description: 'Asia\'s premier video game expo showcasing next-generation titles, VR/AR experiences, and esports.',
        city: 'Tokyo',
        country: 'Japan',
        venue: 'Makuhari Messe',
        address: '2 Chome-1 Nakase, Mihama Ward, Chiba, 261-0023',
        coordinates: { lat: 35.6481, lng: 140.0347 },
        startDate: new Date('2026-11-05T10:00:00Z'),
        endDate: new Date('2026-11-08T18:00:00Z'),
        ticketLink: 'https://tgs.nikkeibp.co.jp',
        bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        attendeesCount: 240000,
        isFeatured: true
      }
    ]);

    // 10. Bookmarks
    await Bookmark.create([
      {
        user: standardUser._id,
        targetType: 'content',
        targetId: createdContent[0]._id,
        title: createdContent[0].title,
        imageUrl: createdContent[0].thumbnailUrl,
        fandom: createdContent[0].fandom,
        categoryName: 'Anime',
        linkUrl: `/content/${createdContent[0]._id}`,
        note: 'Rewatch season 4 swordsmith arc before the movie premiere!'
      }
    ]);

    // 11. Chatbot FAQs
    await ChatbotFAQ.insertMany(chatbotFaqsData);

    // 12. Feedback
    await Feedback.create([
      {
        user: standardUser._id,
        name: 'Kai Takahashi',
        email: seedUserEmail,
        type: 'suggestion',
        subject: 'Add 3D model viewer for character armors',
        message: 'It would be amazing to rotate character costumes in 3D for cosplay prop referencing!',
        status: 'in-progress',
        adminReply: 'Great idea! We are looking into integrating WebGL 3D viewers in the next release.'
      }
    ]);

    // 13. Submissions
    await FanSubmission.create([
      {
        user: standardUser._id,
        title: 'How I Built a Real-Life Rengoku Nichirin Blade with Aluminum Core',
        category: catMap['cosplay'],
        fandom: 'Demon Slayer',
        submissionType: 'cosplay_photo',
        summary: 'Detailed tutorial and progress photographs on forging a lightweight convention-safe Flame Hashira Nichirin blade.',
        content: '<p>Using high density wood wrapped in resin-reinforced thermoplastic and painted with metallic orange lacquer, I crafted Kyojuro Rengoku\'s iconic flame guard and blade.</p>',
        mediaUrls: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'],
        status: 'approved',
        adminFeedback: 'Excellent craftsmanship and comprehensive safety notes for conventions. Approved!'
      }
    ]);

    console.log('🎉 Auto-seed complete with full Fandom Universe dataset!');
  } catch (err) {
    console.error('⚠️ Auto-seed encountered error:', err.message);
  }
};
