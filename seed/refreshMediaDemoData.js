import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import Category from '../models/Category.js';
import Media from '../models/Media.js';

dotenv.config();

const findCategory = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) throw new Error(`Category '${slug}' was not found.`);
  return category._id;
};

const run = async () => {
  try {
    await connectDB();

    const anime = await findCategory('anime');
    const gaming = await findCategory('gaming');
    const kpop = await findCategory('k-pop');
    const cosplay = await findCategory('cosplay');

    const patches = [
      {
        titles: [
          'Demon Slayer: Kimetsu no Yaiba - Official Movie Teaser',
          'Demon Slayer: Kimetsu no Yaiba Infinity Castle — Official Trailer'
        ],
        set: {
          title: 'Demon Slayer: Kimetsu no Yaiba Infinity Castle — Official Trailer',
          type: 'trailer',
          category: anime,
          fandom: 'Demon Slayer',
          embedUrl: 'https://www.youtube.com/embed/9kb7vK11_Rw',
          mediaUrl: '',
          audioUrl: '',
          description: 'Official Infinity Castle trailer embedded from Aniplex USA. The entry now links to the matching publisher video instead of unrelated sample footage.',
          duration: 'Official trailer',
          artistOrCreator: 'Aniplex USA / ufotable',
          sourceUrl: 'https://www.youtube.com/watch?v=9kb7vK11_Rw',
          rightsNote: 'Official publisher embed. Demon Slayer footage, music, characters and trademarks remain the property of their respective rights holders.',
          tags: ['Official Trailer', 'Infinity Castle', 'Tanjiro', 'ufotable'],
          isFeatured: true
        }
      },
      {
        titles: [
          'Gurenge & Kamado Tanjiro no Uta - Orchestral Suite Sample',
          'Fan Hub Plus Audio Player Demo — Ambient Mix'
        ],
        set: {
          title: 'Fan Hub Plus Audio Player Demo — Ambient Mix',
          type: 'audio',
          category: kpop,
          fandom: 'Fan Hub Plus Demo',
          embedUrl: '',
          mediaUrl: '',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          description: 'A clearly labeled sample track used to demonstrate the HTML audio-player experience. It is not presented as an official fandom soundtrack.',
          duration: 'Demo audio',
          artistOrCreator: 'SoundHelix sample audio',
          sourceUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          rightsNote: 'Demo/sample audio. Verify the source terms before redistribution or use outside this project demonstration.',
          tags: ['Audio Demo', 'Player Test', 'Sample Track'],
          isFeatured: false
        }
      },
      {
        titles: [
          'Elden Ring: Shadow of the Erdtree Cinematic Launch Trailer',
          'ELDEN RING Shadow of the Erdtree — Official Launch Trailer'
        ],
        set: {
          title: 'ELDEN RING Shadow of the Erdtree — Official Launch Trailer',
          type: 'trailer',
          category: gaming,
          fandom: 'Elden Ring',
          embedUrl: 'https://www.youtube.com/embed/JugxpebuS_E',
          mediaUrl: '',
          audioUrl: '',
          description: 'Official Shadow of the Erdtree launch trailer embedded from Bandai Namco Entertainment America, replacing unrelated demo footage.',
          duration: 'Official trailer',
          artistOrCreator: 'Bandai Namco Entertainment America / FromSoftware',
          sourceUrl: 'https://www.youtube.com/watch?v=JugxpebuS_E',
          rightsNote: 'Official publisher embed. ELDEN RING footage, music, characters and trademarks remain the property of their respective rights holders.',
          tags: ['Official Trailer', 'Elden Ring', 'Shadow of the Erdtree', 'FromSoftware'],
          isFeatured: true
        }
      },
      {
        titles: [
          'World Cosplay Summit Championship Gallery',
          'Cosplay Craft & Convention Gallery'
        ],
        set: {
          title: 'Cosplay Craft & Convention Gallery',
          type: 'gallery',
          category: cosplay,
          fandom: 'Cosplay Showcase',
          description: 'A curated demonstration gallery for cosplay craft, costume presentation and convention-style photography.',
          duration: '3 demo images',
          artistOrCreator: 'Fan Hub Plus curated demo',
          sourceUrl: 'https://unsplash.com/',
          rightsNote: 'Demo images are loaded from Unsplash-hosted URLs. Verify each source and applicable license before final redistribution.',
          tags: ['Gallery', 'Cosplay', 'Costume Craft', 'Demo'],
          isFeatured: true
        }
      }
    ];

    let matched = 0;

    for (const patch of patches) {
      const result = await Media.updateOne(
        { title: { $in: patch.titles } },
        { $set: patch.set }
      );

      matched += result.matchedCount;
      console.log(
        `${patch.set.title}: ${result.matchedCount ? 'updated' : 'not found'}`
      );
    }

    const explainerData = {
      title: 'Fan Hub Plus — Animated Feature Showcase',
      type: 'explainer',
      category: anime,
      fandom: 'Fan Hub Plus',
      thumbnailUrl: '/media/fan-hub-plus-animated-explainer-poster.png',
      mediaUrl: '/media/fan-hub-plus-animated-explainer.mp4',
      embedUrl: '',
      audioUrl: '',
      galleryImages: [],
      description:
        'A short animated feature showcase presenting Fan Hub Plus home, discovery, search, personalized dashboard, multimedia and analytics experiences.',
      duration: '00:18',
      artistOrCreator: 'Fan Hub Plus',
      sourceUrl: '',
      rightsNote:
        'Original project explainer prepared for the Fan Hub Plus demonstration.',
      tags: [
        'Animated Explainer',
        'Fan Hub Plus',
        'Feature Showcase',
        'Platform Tour'
      ],
      ratingAverage: 5,
      ratingCount: 1,
      thumbsUpCount: 1,
      thumbsDownCount: 0,
      viewCount: 0,
      isFeatured: true
    };

    const existingExplainer = await Media.findOne({
      $or: [
        { title: explainerData.title },
        { mediaUrl: '/media/fan-hub-plus-animated-explainer.mp4' }
      ]
    });

    if (existingExplainer) {
      await Media.updateOne(
        { _id: existingExplainer._id },
        { $set: explainerData }
      );
      console.log('Fan Hub Plus animated explainer: updated');
    } else {
      await Media.create(explainerData);
      console.log('Fan Hub Plus animated explainer: created');
    }

    console.log(
      `✅ Media quality refresh complete. ${matched}/${patches.length} existing demo records matched. Animated explainer ensured.`
    );
  } catch (error) {
    console.error('❌ Media quality refresh failed:', error.message);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
};

run();
