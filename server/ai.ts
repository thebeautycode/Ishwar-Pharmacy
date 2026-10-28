import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface PrescriptionAnalysisResult {
  detectedMedicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    matchedStoreMedicine?: {
      id: string;
      name: string;
      price: number;
      stock: number;
      inStock: boolean;
      dosageForm: string;
    };
  }[];
  generalAdvice: string;
  precautions: string[];
  doctorSpecialtyOrDiagnosis?: string;
  isClearImage: boolean;
  rawNotes?: string;
}

export async function analyzePrescription(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<PrescriptionAnalysisResult> {
  const storeMedicines = db.getMedicines();
  const medicineCatalogueSummary = storeMedicines.map(m => ({
    id: m.id,
    name: m.name,
    generic: m.genericName,
    price: m.price,
    stock: m.stock,
    dosageForm: m.dosageForm
  }));

  const prompt = `
You are the Chief Licensed Pharmacist at Ishwar Pharmacy & Pharma Clinic (Pachrukhiya, Kanchanpur, Uttar Pradesh).
Carefully inspect this prescription or medicine packaging photo.

Here is the current in-store inventory list at Ishwar Pharmacy:
${JSON.stringify(medicineCatalogueSummary)}

Your job:
1. Identify all prescribed or pictured medicines, including brand name and generic molecule if decipherable.
2. For each identified medicine, check if Ishwar Pharmacy carries it or a therapeutic generic alternative from the in-store inventory.
3. Extract dosage, frequency (e.g. 1-0-1 or twice daily), duration, and specific instructions (e.g. after food).
4. Provide genuine, caring pharmacist advice in simple language (Hindi/English mix if appropriate for UP rural community).
5. State precautions (e.g. avoid driving, take with plenty of water).

Return ONLY valid JSON matching this schema:
{
  "detectedMedicines": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "instructions": "string",
      "matchedStoreMedicine": {
        "id": "string",
        "name": "string",
        "price": number,
        "stock": number,
        "inStock": boolean,
        "dosageForm": "string"
      }
    }
  ],
  "generalAdvice": "string",
  "precautions": ["string"],
  "doctorSpecialtyOrDiagnosis": "string",
  "isClearImage": boolean,
  "rawNotes": "string"
}
`;

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Prescription analysis error with Gemini API:', error);

    // Fallback response with structured error message
    return {
      detectedMedicines: [
        {
          name: "Consultation Recommended",
          dosage: "As directed",
          frequency: "Twice daily",
          duration: "3-5 days",
          instructions: "Please visit Ishwar Pharmacy on Goraya Ghat Road, Pachrukhiya for manual reading.",
          matchedStoreMedicine: undefined
        }
      ],
      generalAdvice: "Please bring your original physical prescription to Ishwar Pharmacy or WhatsApp it to 9118137582 so Drx. Babalu Singh can verify dosage details accurately.",
      precautions: [
        "Never take prescription antibiotics without doctor's guidance",
        "Complete the full antibiotic course if prescribed",
        "Store medicines in a cool, dry place away from direct sunlight"
      ],
      isClearImage: false,
      rawNotes: "AI processing fallback active. Please share high-clarity photo on WhatsApp: 9118137582."
    };
  }
}

export async function chatWithPharmacist(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  const storeMedicines = db.getMedicines();
  const availableItems = storeMedicines.map(m => `${m.name} (${m.category}) - ₹${m.price} [Stock: ${m.stock > 0 ? `${m.stock} available` : 'Out of stock'}]`).slice(0, 20).join('\n');

  const systemInstruction = `
You are 'Swasthya Saathi' (स्वास्थ्य साथी), the friendly, licensed senior digital pharmacist and clinical counselor at Ishwar Pharmacy & Pharma Clinic.

Store Details:
- Name: Ishwar Pharmacy and Pharma Clinic | Medical store in Pachrukhiya Kanchanpur
- Address: Goraya Ghat Road, Pachrukhiya, Kanchanpur, Uttar Pradesh 274408
- Pharmacist on Duty: Drx. Babalu Singh (B.Sc, D Pharma) - Registered Pharmacist on Duty
- Phone & WhatsApp: +91 9118137582
- Hours: Open daily from 7:30 AM to 8:00 PM (Emergency medical queries & home delivery on-call)
- Service Areas: nearby Sidhawe, Kaulamundera, Bhagona Tola, Paraskhan, Sirwania & Tarkulwa.
- Home Delivery: Fast doorstep delivery available to all nearby villages! Customers can place orders online or via WhatsApp (+91 9118137582).
- Clinic Services: Doctor consultations, Blood Pressure check, Blood sugar (glucometer) testing, First aid & wound dressing, child care, and routine health checks.

Popular In-Stock Medicines Sample:
${availableItems}

Guidelines:
1. Warm, respectful Indian tone. Address customers with respect ("Namaste ji", "Aapka swagat hai").
2. Respond in whatever language the user asks: English, Hindi (देवनागरी), or Hinglish. If they speak Bhojpuri, understand and reply warmly in simple Hindi/Bhojpuri.
3. Help customers check medicine availability, active ingredients, dosage timing (empty stomach vs after meals), contraindications, and expiry info.
4. Recommend booking home delivery or an appointment at the clinic when appropriate.
5. Provide a clear medical safety disclaimer when giving advice: medicines should be taken as prescribed by registered medical practitioners.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: messages,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Namaste! Ishwar Pharmacy is here to assist you with medicines and clinic services. Please call 9118137582 for instant delivery.";
  } catch (err: any) {
    console.error("Chat error with Gemini:", err);
    return "Namaste! I am currently assisting several customers at the counter. You can call or WhatsApp our pharmacist directly at +91 9118137582 for immediate medicine availability and home delivery in Pachrukhiya & nearby villages.";
  }
}

export interface SeasonalHealthAdvisory {
  seasonName: string;
  weatherSummary: string;
  advisoryTitle: string;
  localLocation: string;
  recommendations: {
    id: string;
    category: 'prevention' | 'hydration' | 'ayush' | 'children_elderly';
    title: string;
    advice: string;
    recommendedMedicine?: string;
  }[];
  emergencyDisclaimer: string;
}

export async function getSeasonalHealthTips(): Promise<SeasonalHealthAdvisory> {
  const currentDate = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const prompt = `
Generate localized seasonal health and wellness advice specifically for Pachrukhiya, Kanchanpur, Deoria district, Eastern Uttar Pradesh (India) for the current month (${currentDate}).
Consider typical regional climate factors: morning fog/changing weather, viral flu/coughs, mosquitoes (dengue/chikungunya/malaria), water-borne infections, elderly joint pain or seasonal allergies.

Return ONLY a JSON object with this exact structure:
{
  "seasonName": "Season Name (e.g. Sharad / Post-Monsoon Autumn / Pre-Winter)",
  "weatherSummary": "Short description of climate in Pachrukhiya/Deoria right now",
  "advisoryTitle": "Pachrukhiya Weather & Wellness Health Alert",
  "localLocation": "Pachrukhiya, Kanchanpur & nearby villages",
  "recommendations": [
    {
      "id": "rec-1",
      "category": "prevention",
      "title": "Short title in Hindi/English",
      "advice": "Actionable, practical advice for villagers and families",
      "recommendedMedicine": "Common OTC medicine or device (e.g. Paracetamol, ORS, Vaporub, Mosquito repellent)"
    },
    {
      "id": "rec-2",
      "category": "hydration",
      "title": "Hydration & Safe Drinking Water",
      "advice": "Advice on boiled water, ORS during seasonal upset stomach",
      "recommendedMedicine": "Electral / Prolyte ORS"
    },
    {
      "id": "rec-3",
      "category": "children_elderly",
      "title": "Elderly & Child Respiratory Care",
      "advice": "Protection against morning and evening temperature drops",
      "recommendedMedicine": "Cetirizine / Cough Lozenge"
    },
    {
      "id": "rec-4",
      "category": "ayush",
      "title": "Immunity & Home Care",
      "advice": "Tulsi, ginger, warm turmeric water and timely clinic checkups",
      "recommendedMedicine": "Zincovit / Vitamin C tablets"
    }
  ],
  "emergencyDisclaimer": "For persistent high fever (>101°F) or breathing difficulty, visit Ishwar Pharmacy Pharma Clinic on Goraya Ghat Road or call 9118137582."
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (err) {
    console.warn("Using curated fallback seasonal advice for Pachrukhiya:", err);
    return {
      seasonName: "Seasonal Transition & Weather Advisory",
      weatherSummary: "Fluctuating day and night temperatures with morning dew in Pachrukhiya, Kanchanpur and Deoria region.",
      advisoryTitle: "Ishwar Pharmacy Local Weather & Wellness Health Advisory",
      localLocation: "Pachrukhiya, Sidhawe, Kaulamundera, Bhagona Tola & Tarkulwa",
      recommendations: [
        {
          id: "rec-1",
          category: "prevention",
          title: "Viral Fever & Seasonal Cough Precaution (मौसम का बुखार एवं खांसी)",
          advice: "Sudden temperature drops in early morning and late evening trigger viral colds and throat infections. Avoid sudden chilled water and cover chest during early motorcycle commutes on Goraya Ghat Road.",
          recommendedMedicine: "Dolo 650 / Cheston Cold / Vicks Vaporub"
        },
        {
          id: "rec-2",
          category: "hydration",
          title: "Mosquito & Water-Borne Care (मच्छर और साफ पानी का ध्यान)",
          advice: "Stagnant rainwater in village ditches increases mosquito breeding. Use mosquito nets and drink boiled or filtered water to protect children from stomach flu.",
          recommendedMedicine: "Electral WHO-Formula ORS / Odomos"
        },
        {
          id: "rec-3",
          category: "children_elderly",
          title: "Elderly Joint & Blood Pressure Monitoring (बुजुर्गों के बीपी और जोड़ों का दर्द)",
          advice: "Changing weather often causes blood pressure fluctuations and joint stiffness in elders. Get their BP and random blood sugar checked at our clinic for free.",
          recommendedMedicine: "Volini Pain Spray / Omega-3 & Calcium"
        },
        {
          id: "rec-4",
          category: "ayush",
          title: "Daily Immunity Routine (प्रतिरोधक क्षमता बढ़ाएं)",
          advice: "Include fresh seasonal amla, warm turmeric milk at night, and ensure timely hydration to keep mucosal immunity high against airborne infections.",
          recommendedMedicine: "Zincovit Multivitamin with Zinc"
        }
      ],
      emergencyDisclaimer: "Advice provided by Drx. Babalu Singh (B.Sc, D Pharma). If symptoms persist for more than 48 hours, visit our clinic on Goraya Ghat Road or call 9118137582."
    };
  }
}
