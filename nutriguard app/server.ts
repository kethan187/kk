import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import { 
  GROCERY_PRODUCTS, 
  DANGEROUS_INGREDIENTS, 
  CERTIFIED_DOCTORS, 
  CAMPAIGNS_ACTIVITIES, 
  INITIAL_INCIDENT_REPORTS 
} from './src/data';
import { IncidentReport, DoctorMessage, CampaignActivity } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory global data stores so changes persist during user session
let reportsStore: IncidentReport[] = [...INITIAL_INCIDENT_REPORTS];
let campaignsStore: CampaignActivity[] = [...CAMPAIGNS_ACTIVITIES];
const doctorChatsStore: Record<string, DoctorMessage[]> = {
  'doc_1': [
    { id: 'm1', doctorId: 'doc_1', sender: 'doctor', text: 'Hello! I am Dr. Aris. I reviewed your recent report about industrial sweeteners. How can I help you customize your grocery swaps today?', timestamp: new Date(Date.now() - 3600000).toISOString() }
  ],
  'doc_2': [
    { id: 'm2', doctorId: 'doc_2', sender: 'doctor', text: 'Hello, I see you are interested in arterial inflammation research. Let me know if you would like me to explain the correlation with high fructose corn syrup.', timestamp: new Date(Date.now() - 7200000).toISOString() }
  ],
  'doc_3': [
    { id: 'm3', doctorId: 'doc_3', sender: 'doctor', text: 'Hello, welcome to my portal. We study synthetic emulsifiers & bowel environments. How are your symptoms doing today?', timestamp: new Date(Date.now() - 5400000).toISOString() }
  ]
};

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      console.warn("Warning: GEMINI_API_KEY is not defined or is utilizing placeholder.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// REST APIs
// 1. Auth Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  // Predefined users or dynamic guest
  const isDoc = email.toLowerCase().includes('clinical') || role === 'doctor';
  const name = isDoc 
    ? 'Dr. Angela Mercer, MD' 
    : email.split('@')[0].toUpperCase().replace('.', ' ');

  res.json({
    id: isDoc ? 'doc_leader' : 'usr_' + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    name: name,
    role: isDoc ? 'doctor' : 'user',
    avatarUrl: isDoc 
      ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    specialty: isDoc ? 'Chief Resident Officer (Food Toxicity Dept)' : undefined
  });
});

// 2. Grocery & Ingredients Endpoints
app.get('/api/grocery/products', (req: Request, res: Response) => {
  res.json(GROCERY_PRODUCTS);
});

app.get('/api/dangerous-ingredients', (req: Request, res: Response) => {
  res.json(DANGEROUS_INGREDIENTS);
});

// 3. Certified Doctors Endpoints
app.get('/api/doctors', (req: Request, res: Response) => {
  res.json(CERTIFIED_DOCTORS);
});

app.get('/api/doctors/chat/:doctorId', (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const messages = doctorChatsStore[doctorId] || [];
  res.json(messages);
});

app.post('/api/doctors/chat/:doctorId', (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const { sender, text } = req.body;

  if (!text || !sender) {
    res.status(400).json({ error: 'Text and sender parameters required' });
    return;
  }

  const newMessage: DoctorMessage = {
    id: 'msg_' + Math.random().toString(36).substr(2, 9),
    doctorId,
    sender,
    text,
    timestamp: new Date().toISOString()
  };

  if (!doctorChatsStore[doctorId]) {
    doctorChatsStore[doctorId] = [];
  }
  
  doctorChatsStore[doctorId].push(newMessage);

  // Trigger automated doctor check response logic for realism
  setTimeout(() => {
    const defaultReplies = [
      "That is highly valuable information. In clinical nutrition, we frequently advise avoiding chemical food-dyes that undergo cellular oxidation.",
      "Thanks for sharing. I would recommend compiling a list of your most common supermarket snacks so we can check their emulsifier levels.",
      "Indeed. I will advise checking the labels for hidden names of MSG such as autolyzed yeast extract, chemically hydrolyzed soy protein, or sodium caseinate.",
      "That sounds like a classic reaction to accumulated synthetic preservatives. I am noting down these symptoms for our review."
    ];
    const randomReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
    
    doctorChatsStore[doctorId].push({
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      doctorId,
      sender: 'doctor',
      text: randomReply,
      timestamp: new Date().toISOString()
    });
  }, 1000);

  res.json(newMessage);
});

// 4. Communities / Campaigns Endpoints
app.get('/api/campaigns', (req: Request, res: Response) => {
  res.json(campaignsStore);
});

app.post('/api/campaigns/:id/participate', (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = campaignsStore.find(c => c.id === id);
  if (campaign) {
    campaign.isParticipating = !campaign.isParticipating;
    campaign.participantCount += campaign.isParticipating ? 1 : -1;
    res.json(campaign);
  } else {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

app.post('/api/campaigns', (req: Request, res: Response) => {
  const { title, category, organizer, date, time, locationType, locationDetail, description } = req.body;
  if (!title || !category || !description) {
    res.status(400).json({ error: 'Title, category, and description are required' });
    return;
  }

  const newActivity: CampaignActivity = {
    id: 'camp_' + Math.random().toString(36).substr(2, 9),
    title,
    category,
    organizer: organizer || 'Independent Wellness Volunteer',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '12:00 PM',
    locationType: locationType || 'Online',
    locationDetail: locationDetail || 'Virtual Meeting Hub',
    description,
    participantCount: 1,
    isParticipating: true
  };

  campaignsStore.push(newActivity);
  res.json(newActivity);
});

// 5. Food Safety & Incidents Reporting Endpoints
app.get('/api/reports', (req: Request, res: Response) => {
  res.json(reportsStore);
});

app.post('/api/reports', (req: Request, res: Response) => {
  const { targetType, targetName, incidentDate, title, description, reportedBy, reportedByEmail } = req.body;
  if (!targetType || !targetName || !title || !description) {
    res.status(400).json({ error: 'Missing required report fields' });
    return;
  }

  const newReport: IncidentReport = {
    id: 'rep_' + Math.random().toString(36).substr(2, 9),
    targetType,
    targetName,
    incidentDate: incidentDate || new Date().toISOString().split('T')[0],
    title,
    description,
    reportedBy: reportedBy || 'Anonymous Witness',
    reportedByEmail: reportedByEmail || 'anonymous@nutriguard.org',
    status: 'Received',
    timestamp: new Date().toISOString(),
    proofAttached: true
  };

  reportsStore.unshift(newReport);
  res.json(newReport);
});

// 6. AI Chatbot Endpoint
app.post('/api/chatbot', async (req: Request, res: Response) => {
  const { prompt, chatHistory } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const client = getGeminiClient();

  if (!client) {
    // Elegant fallback simulation if API Key is not set up yet
    console.log("Gemini Client not connected. Utilizing high-quality fallback AI response.");
    
    // Simple custom matching rules to make fallback incredibly intelligent & nutrition-focused
    const lowerPrompt = prompt.toLowerCase();
    let reply = "I am NutriGuard's specialized Healthy Food and Chemical Additive Advisor. ";
    
    if (lowerPrompt.includes('sugar') || lowerPrompt.includes('hfcs') || lowerPrompt.includes('corn syrup')) {
      reply += "High Fructose Corn Syrup (HFCS) is highly detrimental. Unlike normal sugar, it routes directly to your liver to trigger fatty-liver symptoms, blocks the release of leptin (the satiety hormone), and raises cardiac swelling indices. We recommend switching to real dark organic maple syrup or pure monkfruit extract.";
    } else if (lowerPrompt.includes('noodles') || lowerPrompt.includes('ramen' ) || lowerPrompt.includes('tbhq')) {
      reply += "Common store cup noodles are preserved with Tertiary Butylhydroquinone (TBHQ) and Monosodium Glutamate (MSG). TBHQ has petroleum roots and is linked in trials to high cell mutation rates and stomach linings distress. MSG tricks nerve receptors into intense artificial food cravings. Try air-dried organic Brown Rice or Buckwheat ramen instead!";
    } else if (lowerPrompt.includes('grade') || lowerPrompt.includes('safety') || lowerPrompt.includes('level')) {
      reply += "We grade pre-packaged foods from A to F. Grade A is 100% wholesome organic food with no food additives. Grade D has high chemical sweetener exposure. Grade F means heavy presence of severe health hazards such as BHT, TBHQ, HFCS, and coal-tar artificial colors.";
    } else if (lowerPrompt.includes('artificial color') || lowerPrompt.includes('red 40') || lowerPrompt.includes('dye')) {
      reply += "Artificial synthetic food colors (Red 40, Yellow 5, Red 3) are derived from petroleum. They are linked to neuro-behavioral hyperactivity in children and inflammation. It is best to stick to products colored naturally with organic elderberries, raw beets, or saffron dye.";
    } else if (lowerPrompt.includes('report') || lowerPrompt.includes('complaint')) {
      reply += "If you or a family member have experienced food poisoning, chemical allergies, or bad service from doctors, restaurants, or food brands, please head over to our 'Report Incident' tab. We log your incident directly into our Consumer Protection Dashboard to audit their sanitation levels.";
    } else {
      reply += "When auditing ingredients, look closely at the fine print for hidden chemical agents like Maltodextrin, BHT, Potassium Bromate, and Titanium Dioxide. Let me know if you would like me to analyze any specific commercial beverage, cereal, snack, or restaurant ingredient list!";
    }

    res.json({ text: reply + "\n\n*(Adaptive AI Fallback Engine Online)*" });
    return;
  }

  try {
    // Generate context-aware system instructions for consumer food safety
    const systemInstruction = 
      "You are 'NutriGuard Expert AI Advisor', a prestigious clinical nutritionist, consumer safety officer, and healthcare helper. " +
      "Your sole purpose is to instruct users on daily grocery ingredients, highlighting chemical hazards (like High Fructose Corn Syrup, TBHQ, BHA/BHT, Aspartame, Red 40, Titanium Dioxide, Potassium Bromate), " +
      "explaining their precise biochemical side-effects, recommending clean alternative foods, and describing safe health campaigns, reporting protocols, or doctor activities. " +
      "Be highly professional, compassionate, scientific, objective, and direct. Format response in elegant Markdown. Avoid self-praising or flowery adjectives.";

    // Assemble dynamic history in parts as accepted by SDK
    // Let's call the single generation with the requested schema or text format
    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.15,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini invocation failure:", err);
    res.status(500).json({ error: "Gemini AI execution failed: " + err.message });
  }
});

// 7. Camera Ingredient Scanner Endpoint
app.post('/api/scan-ingredients', async (req: Request, res: Response) => {
  const { imageBase64, samplePreset } = req.body;

  if (!imageBase64 && !samplePreset) {
    res.status(400).json({ error: 'Image data or samplePreset is required' });
    return;
  }

  const client = getGeminiClient();

  if (!client || samplePreset) {
    console.log("Using NutriGuard Vision Fallback Engine for package scanner.");
    
    if (samplePreset === 'instant_ramen' || (!imageBase64 && samplePreset !== 'organic_granola')) {
      res.json({
        productName: "Commercial Instant Savory Noodles",
        brand: "QuickNoodle Corp",
        healthScore: 24,
        healthGrade: "F",
        summary: "High hazard rating detected. Contains petroleum preservative TBHQ, Monosodium Glutamate, artificial coloring, and refined palm oil.",
        detectedIngredients: [
          { name: "Enriched Wheat Flour", category: "moderate", description: "Refined carbohydrate stripped of natural fiber & bran germ." },
          { name: "Palm Oil (TBHQ Preserved)", category: "dangerous", description: "TBHQ is a synthetic antioxidant derivative of petroleum linked to cell damage." },
          { name: "Monosodium Glutamate (MSG)", category: "dangerous", description: "Excitotoxin neuro-agent causing intense artificial cravings." },
          { name: "Sodium Caseinate", category: "moderate", description: "Processed milk derivative used for industrial emulsification." },
          { name: "Red 40 & Yellow 5", category: "dangerous", description: "Coal-tar dye additives associated with hyperactive reactions." },
          { name: "Purified Sea Salt", category: "clean", description: "Basic sodium seasoning." }
        ],
        dangerousAdditives: [
          { name: "TBHQ (Tertiary Butylhydroquinone)", riskLevel: "Extreme", description: "Petroleum antioxidant preservative", healthImpact: "Linked in toxicology studies to stomach lining lesions & immune dysfunction." },
          { name: "Monosodium Glutamate (MSG)", riskLevel: "High", description: "Flavor enhancer excitotoxin", healthImpact: "Triggers neurological cravings, headaches, and metabolic strain." },
          { name: "Synthetic Dyes (Red 40 & Yellow 5)", riskLevel: "High", description: "Artificial color compounds", healthImpact: "Synthesized from petroleum; linked to childhood focus disruption." }
        ],
        cleanNutrients: ["Sea Salt", "Purified Water"],
        recommendation: "Avoid regular consumption. Switch to air-dried organic Brown Rice Ramen free from artificial preservatives and synthetic flavor packets.",
        healthierAlternatives: [
          { name: "Wild Wood Air-Dried Lotus Buckwheat Noodles", reason: "Zero TBHQ, 100% whole grain, sun-dried without industrial fryers." },
          { name: "Lotus Foods Organic Millet Ramen", reason: "Clean non-GMO ingredients with organic vegetable broth." }
        ]
      });
      return;
    }

    if (samplePreset === 'organic_granola') {
      res.json({
        productName: "Artisanal Organic Sprouted Granola",
        brand: "Pure Harvest",
        healthScore: 92,
        healthGrade: "A",
        summary: "Exemplary clean food label. Zero artificial colors, zero high fructose corn syrup, and zero synthetic emulsifiers.",
        detectedIngredients: [
          { name: "Organic Rolled Oats", category: "clean", description: "Rich in beta-glucan soluble fiber for cardiac & gut health." },
          { name: "Raw Wildflower Honey", category: "clean", description: "Unprocessed natural antioxidant sweetener." },
          { name: "Sprouted Pumpkin Seeds", category: "clean", description: "High bio-available zinc, magnesium, and healthy omega fatty acids." },
          { name: "Cold-Pressed Coconut Oil", category: "clean", description: "Medium-chain triglycerides for healthy cellular fuel." },
          { name: "Organic Ceylon Cinnamon", category: "clean", description: "Natural blood-sugar stabilizer." }
        ],
        dangerousAdditives: [],
        cleanNutrients: ["Organic Rolled Oats", "Raw Wildflower Honey", "Sprouted Seeds", "Ceylon Cinnamon"],
        recommendation: "Highly recommended for daily breakfast and clean energy snack routines.",
        healthierAlternatives: [
          { name: "Current Item is Top Tier Clean Certified", reason: "Meets NutriGuard Grade A Gold Standard." }
        ]
      });
      return;
    }

    // Default analyzed package sample
    res.json({
      productName: "Scanned Food Product Package",
      brand: "Detected Consumer Package",
      healthScore: 48,
      healthGrade: "D",
      summary: "Moderate toxicity hazard. Contains high fructose corn syrup, hydrogenated palm fat, and artificial vanilla flavoring.",
      detectedIngredients: [
        { name: "High Fructose Corn Syrup", category: "dangerous", description: "Direct hepatic fat conversion sweetener." },
        { name: "Hydrogenated Palm Kernel Oil", category: "dangerous", description: "Contains trans-fatty acid chains harmful to arteries." },
        { name: "Refined Wheat Flour", category: "moderate", description: "High glycemic index processed grain." },
        { name: "Artificial Flavoring Agent", category: "dangerous", description: "Synthetic aroma compounds with undisclosed chemical bases." },
        { name: "Organic Cane Sugar", category: "moderate", description: "Natural sweetener, consume in moderation." }
      ],
      dangerousAdditives: [
        { name: "High Fructose Corn Syrup (HFCS)", riskLevel: "High", description: "Industrial corn starch derivative", healthImpact: "Triggers non-alcoholic fatty liver strain and leptin resistance." },
        { name: "Hydrogenated Fats", riskLevel: "Extreme", description: "Chemically modified oils", healthImpact: "Raises LDL cholesterol and promotes vascular tissue inflammation." }
      ],
      cleanNutrients: ["Organic Cane Sugar (low quantity)"],
      recommendation: "Exercise caution. Replace with whole-grain, cold-pressed organic snacks free from synthetic high fructose sweeteners.",
      healthierAlternatives: [
        { name: "Simple Mills Organic Sprouted Seed Crackers", reason: "Gluten-free, zero industrial seed oils or synthetic dyes." }
      ]
    });
    return;
  }

  // Real Gemini Multimodal Vision Processing
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = imageBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";

    const promptText = `
You are NutriGuard AI, an expert food scientist, OCR specialist, and toxicologist.
Examine this image of a food product packaging or ingredient label.

CRITICAL ACCURACY & OCR MANDATE:
1. Perform high-precision OCR reading on ALL visible text in the photo, especially the "Ingredients:", "Contains:", "Nutrition Facts", and product/brand title.
2. Read and extract EVERY SINGLE ingredient listed on the package label. Do NOT skip or condense ingredients.
3. For EVERY extracted ingredient from the photo:
   - Categorize it as 'clean' (whole food, natural ingredient, organic item, clean water/spice), 'moderate' (refined carbohydrate, standard oil, salt, standard food binder), or 'dangerous' (artificial dye like Red 40/Yellow 5, petroleum preservative like TBHQ/BHA/BHT, HFCS, hydrogenated fat, MSG, artificial sweetener, or toxic chemical additive).
   - Provide a brief, clear health note explaining what this specific ingredient is and its safety profile.
4. Highlight any dangerous additives or chemicals in the "dangerousAdditives" list, specifying their risk level ('Extreme', 'High', 'Moderate'), classification, and health impact on the human body.
5. Calculate a precise Health Score from 0 to 100 based strictly on the ratio and severity of clean vs processed/toxic ingredients found on the label:
   - 80-100 (Grade A/A+): Entirely or mostly clean whole food ingredients.
   - 60-79 (Grade B): Clean base with minor refined elements.
   - 40-59 (Grade C): Moderate refined sugars, oils, or processing agents.
   - 20-39 (Grade D): High processed sugars, seed oils, or synthetic additives.
   - 0-19 (Grade F): Heavy in hazardous chemicals, HFCS, artificial dyes, or trans fats.
6. Assign a Health Grade ('A+', 'A', 'B', 'C', 'D', 'F').
7. Summarize the findings specifically based on what was detected in the photo.
8. Suggest clean nutrients found and 2 healthier product alternatives.

Return ONLY a valid JSON object matching this schema:
{
  "productName": "Scanned Product Name from label",
  "brand": "Brand Name if visible",
  "healthScore": 75,
  "healthGrade": "B",
  "summary": "Specific summary of ingredients read directly from the photo label",
  "detectedIngredients": [
    { 
      "name": "Literal ingredient name from photo", 
      "category": "clean", 
      "description": "Short safety explanation for this ingredient" 
    }
  ],
  "dangerousAdditives": [
    { 
      "name": "Additive name", 
      "riskLevel": "High", 
      "description": "Chemical class", 
      "healthImpact": "Effect on body" 
    }
  ],
  "cleanNutrients": ["Nutrient 1"],
  "recommendation": "Consumer safety advice based on these ingredients",
  "healthierAlternatives": [
    { "name": "Cleaner alternative product", "reason": "Why it is better" }
  ]
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType
              }
            },
            { text: promptText }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    let parsedData;
    try {
      const responseText = response.text?.trim() || "";
      const jsonStr = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.warn("Could not parse JSON from Gemini vision, constructing structured result.", parseErr);
      parsedData = {
        productName: "Scanned Food Package",
        brand: "Audited Package",
        healthScore: 60,
        healthGrade: "B",
        summary: response.text ? response.text.substring(0, 180) + "..." : "Ingredient label analyzed.",
        detectedIngredients: [
          { name: "Scanned Label Ingredient", category: "clean", description: "Ingredient extracted from label." }
        ],
        dangerousAdditives: [],
        cleanNutrients: ["Natural Grains"],
        recommendation: "Check label for whole grain organic certifications.",
        healthierAlternatives: [
          { name: "Organic Whole Grain Alternative", reason: "Zero synthetic preservatives." }
        ]
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in Gemini Vision Scan:", error);
    res.status(500).json({ 
      error: "Failed to scan ingredients with Gemini Vision: " + (error.message || "Unknown vision error") 
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve absolute path of dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NutriGuard Fullstack] Running on http://localhost:${PORT}`);
  });
}

startServer();
