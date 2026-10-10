import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../config/env.js';
import { ComplaintCategories, PriorityLevels } from '../utils/constants.js';
import {
  inferCategoryFromText,
  inferPriorityFromText,
  resolveDepartmentFromCategory
} from './routingService.js';
import {
  GEMINI_CATEGORIES,
  GEMINI_PRIORITIES,
  TRIAGE_PROMPT_TEMPLATE
} from './triagePrompt.js';

const aiClient = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      description: 'One of the municipal complaint categories.'
    },
    department: {
      type: SchemaType.STRING,
      description: 'Municipal department responsible for handling the complaint.'
    },
    priority: {
      type: SchemaType.STRING,
      description: 'Priority level: Low, Medium, High, or Critical.'
    },
    summary: {
      type: SchemaType.STRING,
      description: 'Short citizen-friendly summary of the complaint.'
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: 'Confidence score between 0 and 1.'
    },
    issueType: {
      type: SchemaType.STRING,
      description: 'Short label for the issue type.'
    },
    location: {
      type: SchemaType.STRING,
      description: 'Extracted location if present.'
    }
  },
  required: ['category', 'department', 'priority', 'summary', 'confidence']
};

const normalizeCategory = (value = '') => {
  const matched = GEMINI_CATEGORIES.find((category) => category.toLowerCase() === String(value).toLowerCase());
  return matched || ComplaintCategories.OTHER;
};

const normalizePriority = (value = '') => {
  const matched = GEMINI_PRIORITIES.find((priority) => priority.toLowerCase() === String(value).toLowerCase());
  return matched || PriorityLevels.MEDIUM;
};

const buildFallbackResult = async (complaintText) => {
  const category = inferCategoryFromText(complaintText);
  const priority = inferPriorityFromText(complaintText);
  const department = await resolveDepartmentFromCategory(category, complaintText);
  const summary = complaintText.length > 180 ? `${complaintText.slice(0, 177)}...` : complaintText;

  return {
    category,
    department: department?.name || 'General Administration',
    priority,
    summary,
    confidence: 0.52,
    issueType: category,
    location: '',
    fallbackUsed: true,
    model: 'rule-based-fallback',
    rawResponse: null
  };
};

const parseResponse = async (responseText) => {
  const parsed = JSON.parse(responseText);
  const category = normalizeCategory(parsed.category);
  const priority = normalizePriority(parsed.priority);

  return {
    category,
    department: typeof parsed.department === 'string' ? parsed.department : 'General Administration',
    priority,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.6,
    issueType: typeof parsed.issueType === 'string' ? parsed.issueType : category,
    location: typeof parsed.location === 'string' ? parsed.location : '',
    fallbackUsed: false,
    model: env.GEMINI_MODEL,
    rawResponse: parsed
  };
};

export const verifyComplaintImage = async ({ imageBuffer, mimeType, complaintText = '', category = '' }) => {
  if (!imageBuffer || !mimeType) {
    return {
      verified: false,
      confidence: 0,
      reason: 'No image was supplied.',
      model: 'none',
      verifiedAt: null
    };
  }

  if (!aiClient || !env.GEMINI_API_KEY) {
    return {
      verified: false,
      confidence: 0,
      reason: 'Gemini API key is not configured, so image verification could not run.',
      model: 'rule-based-fallback',
      verifiedAt: null
    };
  }

  try {
    const model = aiClient.getGenerativeModel({ model: env.GEMINI_MODEL });
    const prompt = [
      'You are verifying whether an uploaded photo plausibly matches a civic complaint claim.',
      `Complaint category: ${category || 'unknown'}`,
      `Complaint text: ${complaintText || 'No complaint text provided'}`,
      'Return JSON with fields: verified (boolean), confidence (number from 0 to 1), reason (string).'
    ].join('\n');

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageBuffer.toString('base64')
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 256,
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.response.text();
    const parsed = JSON.parse(responseText);

    return {
      verified: Boolean(parsed.verified),
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0,
      reason: typeof parsed.reason === 'string' ? parsed.reason : 'Image verification completed.',
      model: env.GEMINI_MODEL,
      verifiedAt: new Date()
    };
  } catch (error) {
    return {
      verified: false,
      confidence: 0,
      reason: 'Image verification could not be completed.',
      model: env.GEMINI_MODEL,
      verifiedAt: null
    };
  }
};

export const triageComplaint = async (complaintText) => {
  if (!complaintText || !complaintText.trim()) {
    return buildFallbackResult('General municipal complaint');
  }

  if (!aiClient) {
    return buildFallbackResult(complaintText);
  }

  try {
    const model = aiClient.getGenerativeModel({ model: env.GEMINI_MODEL });
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: TRIAGE_PROMPT_TEMPLATE(complaintText) }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
        responseSchema
      }
    });

    const responseText = response.response.text();
    return parseResponse(responseText);
  } catch (error) {
    return buildFallbackResult(complaintText);
  }
};