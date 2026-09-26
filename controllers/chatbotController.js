import ChatbotFAQ from '../models/ChatbotFAQ.js';
import ChatbotMessage from '../models/ChatbotMessage.js';
import Content from '../models/Content.js';
import Category from '../models/Category.js';
import Character from '../models/Character.js';

export const handleMessage = async (req, res, next) => {
  try {
    const { message, sessionId = 'guest-session' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const cleanInput = message.trim().toLowerCase();
    let botResponse = '';
    let options = [];
    let matchedIntent = 'general';

    // 1. Check quick conversational greetings & guided onboarding
    if (/^(hi|hello|hey|greetings|start|help|sup)\b/.test(cleanInput)) {
      matchedIntent = 'greeting';
      botResponse = `Hello there, fellow fan! Welcome to Fan Hub Plus. I'm Nova, your AI Fandom Universe Navigator. How can I assist your exploration today?`;
      options = [
        { label: 'Explore Anime Universe', value: 'Tell me about Anime', link: '/category/anime' },
        { label: 'Upcoming Releases', value: 'What releases are coming up?', link: '/releases' },
        { label: 'Find Live Events', value: 'Show me nearby fan events', link: '/events' },
        { label: 'Browse Multimedia', value: 'Show me trailers and music', link: '/media' }
      ];
    }
    // 2. Platform navigation queries
    else if (/events|conventions|meetup|tickets|calendar/.test(cleanInput)) {
      matchedIntent = 'events';
      botResponse = `Looking for fan gatherings? We have interactive location-aware Event Discovery and an Event Calendar featuring anime conventions, cosplay meetups, and premiere screenings with interactive maps and ticket links!`;
      options = [
        { label: 'Open Event Explorer', value: 'Open events', link: '/events' },
        { label: 'View Calendar', value: 'View calendar', link: '/calendar' }
      ];
    }
    else if (/bookmark|save|notes/.test(cleanInput)) {
      matchedIntent = 'bookmarks';
      botResponse = `You can bookmark articles, characters, multimedia, and merchandise items anytime! Registered users can also attach private personal notes to their bookmarks and manage them in their personalized dashboard.`;
      options = [
        { label: 'Go to Dashboard', value: 'Open dashboard', link: '/dashboard' },
        { label: 'Explore Content', value: 'Explore content', link: '/explore' }
      ];
    }
    else if (/merchandise|merch|buy|store|shop/.test(cleanInput)) {
      matchedIntent = 'merchandise';
      botResponse = `Our Merchandise Showcase is curated for discovery and collection browsing across all 8 fandom universes (Limited Edition, Pre-Orders, and Collectibles). Note: Fan Hub Plus provides showcase discovery links to official licensee hubs.`;
      options = [
        { label: 'Browse Merchandise', value: 'Browse merch', link: '/merchandise' }
      ];
    }
    else if (/submit|fan content|fan art|submission|contribute/.test(cleanInput)) {
      matchedIntent = 'submissions';
      botResponse = `Fan Hub Plus celebrates community creators! Registered members can submit fan articles, cosplay showcases, and reviews. Once approved by our curators, your work appears in our community showcase!`;
      options = [
        { label: 'Submit Fan Content', value: 'Submit content', link: '/submit-content' }
      ];
    }
    // 3. Database FAQ knowledge base search
    else {
      // Find matching FAQs
      const faqs = await ChatbotFAQ.find({ active: true });
      let bestFaq = null;
      let highestScore = 0;

      for (const faq of faqs) {
        let score = 0;
        const qText = faq.question.toLowerCase();
        
        // Exact keyword hits
        faq.keywords.forEach(kw => {
          if (cleanInput.includes(kw.toLowerCase())) {
            score += 3;
          }
        });

        // Common words matching
        const words = cleanInput.split(/\s+/).filter(w => w.length > 2);
        words.forEach(w => {
          if (qText.includes(w)) score += 1;
        });

        if (score > highestScore) {
          highestScore = score;
          bestFaq = faq;
        }
      }

      if (bestFaq && highestScore >= 2) {
        matchedIntent = 'faq_match';
        botResponse = bestFaq.answer;
        if (bestFaq.actionLink && bestFaq.actionText) {
          options.push({
            label: bestFaq.actionText,
            value: bestFaq.actionText,
            link: bestFaq.actionLink
          });
        }
      } else {
        // 4. Dynamic MongoDB Content & Category Recommendation
        const matchedCategories = await Category.find({
          $or: [
            { name: new RegExp(cleanInput, 'i') },
            { slug: new RegExp(cleanInput, 'i') },
            { description: new RegExp(cleanInput, 'i') }
          ]
        }).limit(2);

        const matchedContent = await Content.find({
          $or: [
            { title: new RegExp(cleanInput, 'i') },
            { fandom: new RegExp(cleanInput, 'i') },
            { tags: new RegExp(cleanInput, 'i') }
          ]
        }).limit(3);

        const matchedCharacters = await Character.find({
          $or: [
            { name: new RegExp(cleanInput, 'i') },
            { fandom: new RegExp(cleanInput, 'i') }
          ]
        }).limit(2);

        if (matchedCategories.length > 0 || matchedContent.length > 0 || matchedCharacters.length > 0) {
          matchedIntent = 'recommendation';
          let parts = [`Here is what I uncovered in our universe for "${message}":`];
          
          if (matchedCategories.length > 0) {
            matchedCategories.forEach(c => {
              options.push({ label: `Explore ${c.name}`, value: `Go to ${c.name}`, link: `/category/${c.slug}` });
            });
          }

          if (matchedContent.length > 0) {
            matchedContent.forEach(item => {
              options.push({ label: `View: ${item.title}`, value: item.title, link: `/content/${item._id}` });
            });
          }

          if (matchedCharacters.length > 0) {
            matchedCharacters.forEach(ch => {
              options.push({ label: `Character: ${ch.name}`, value: ch.name, link: `/characters/${ch._id}` });
            });
          }

          botResponse = parts.join(' ');
        } else {
          matchedIntent = 'fallback';
          botResponse = `I'm still expanding my cosmic knowledge base on "${message}". You can browse all 8 fandom categories, explore character dossiers, check trailers and music, or search our library.`;
          options = [
            { label: 'Explore Library', value: 'Search library', link: '/explore' },
            { label: 'Browse Categories', value: 'All categories', link: '/#universes' },
            { label: 'Send Feedback', value: 'Send feedback', link: '/feedback' }
          ];
        }
      }
    }

    // Persist conversation step in database
    await ChatbotMessage.create({
      user: req.user ? req.user._id : null,
      sessionId,
      sender: 'user',
      message
    });

    const savedBotMsg = await ChatbotMessage.create({
      user: req.user ? req.user._id : null,
      sessionId,
      sender: 'bot',
      message: botResponse,
      options,
      matchedIntent
    });

    res.status(200).json({
      success: true,
      data: {
        message: botResponse,
        options,
        matchedIntent,
        timestamp: savedBotMsg.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const query = {};

    if (req.user) {
      query.$or = [{ user: req.user._id }, { sessionId }];
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return res.status(200).json({ success: true, data: [] });
    }

    const history = await ChatbotMessage.find(query).sort('createdAt').limit(50);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

export const getFAQs = async (req, res, next) => {
  try {
    const faqs = await ChatbotFAQ.find().sort('-helpfulCount');
    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (err) {
    next(err);
  }
};

export const createFAQ = async (req, res, next) => {
  try {
    const faq = await ChatbotFAQ.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
};

export const updateFAQ = async (req, res, next) => {
  try {
    const faq = await ChatbotFAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.status(200).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await ChatbotFAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
};
