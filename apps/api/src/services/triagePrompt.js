import { ComplaintCategories, PriorityLevels } from '../utils/constants.js';

export const GEMINI_CATEGORIES = Object.values(ComplaintCategories);
export const GEMINI_PRIORITIES = Object.values(PriorityLevels);

export const TRIAGE_PROMPT_TEMPLATE = (complaintText) => `You are an AI triage assistant for a municipal corporation grievance system.
Classify the complaint into one of these categories only: ${GEMINI_CATEGORIES.join(', ')}.
Assign exactly one department name that should handle the issue.
Assign a priority level only from: ${GEMINI_PRIORITIES.join(', ')}.
Return a concise summary of the complaint, extract issueType and location when available, and provide a confidence score from 0 to 1.

Complaint text:
${complaintText}
`;

export const TRIAGE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    department: { type: 'string' },
    priority: { type: 'string' },
    summary: { type: 'string' },
    confidence: { type: 'number' },
    issueType: { type: 'string' },
    location: { type: 'string' }
  },
  required: ['category', 'department', 'priority', 'summary', 'confidence']
};