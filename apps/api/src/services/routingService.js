import Department from '../models/Department.js';
import { ComplaintCategories, PriorityLevels } from '../utils/constants.js';

const ROUTING_RULES = [
  {
    category: ComplaintCategories.WASTE_MANAGEMENT,
    departmentCode: 'SAN',
    keywords: ['garbage', 'trash', 'waste', 'dump', 'bin', 'litter']
  },
  {
    category: ComplaintCategories.WATER_SUPPLY,
    departmentCode: 'WATER',
    keywords: ['water', 'pipeline', 'tap', 'drinking water', 'leak']
  },
  {
    category: ComplaintCategories.ROAD_MAINTENANCE,
    departmentCode: 'PWD',
    keywords: ['road', 'pothole', 'street repair', 'road damage', 'broken road']
  },
  {
    category: ComplaintCategories.STREET_LIGHTING,
    departmentCode: 'ELEC',
    keywords: ['street light', 'lamp', 'lighting', 'dark road', 'pole light']
  },
  {
    category: ComplaintCategories.SANITATION,
    departmentCode: 'SAN',
    keywords: ['sanitation', 'cleaning', 'sweeping', 'dirty', 'filthy']
  },
  {
    category: ComplaintCategories.SEWAGE_DRAINAGE,
    departmentCode: 'DRAIN',
    keywords: ['sewage', 'drain', 'drainage', 'overflow', 'manhole']
  },
  {
    category: ComplaintCategories.ELECTRICITY,
    departmentCode: 'ELEC',
    keywords: ['electricity', 'power', 'voltage', 'power cut', 'outage']
  }
];

const NORMALIZED_DEPARTMENT_NAMES = {
  SAN: 'Sanitation Department',
  WATER: 'Water Supply Department',
  PWD: 'Public Works Department',
  ELEC: 'Electrical Department',
  DRAIN: 'Drainage Department'
};

export const normalizeText = (input = '') => input.toLowerCase().trim();

export const inferCategoryFromText = (text = '') => {
  const normalized = normalizeText(text);
  const matchedRule = ROUTING_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );

  return matchedRule?.category || ComplaintCategories.OTHER;
};

export const inferPriorityFromText = (text = '') => {
  const normalized = normalizeText(text);

  const criticalMarkers = ['fire', 'death', 'danger', 'flood', 'collapse', 'gas leak', 'electrocution'];
  if (criticalMarkers.some((marker) => normalized.includes(marker))) {
    return PriorityLevels.CRITICAL;
  }

  const highMarkers = ['urgent', 'severe', 'unsafe', 'broken', 'overflow', 'outage', 'stagnant'];
  if (highMarkers.some((marker) => normalized.includes(marker))) {
    return PriorityLevels.HIGH;
  }

  const lowMarkers = ['minor', 'small', 'notice', 'low', 'slow'];
  if (lowMarkers.some((marker) => normalized.includes(marker))) {
    return PriorityLevels.LOW;
  }

  return PriorityLevels.MEDIUM;
};

export const resolveDepartmentFromCategory = async (category, text = '') => {
  const normalized = normalizeText(text);
  const rule = ROUTING_RULES.find((entry) => entry.category === category)
    || ROUTING_RULES.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));

  if (!rule) {
    return null;
  }

  const department = await Department.findOne({ code: rule.departmentCode, isActive: true });

  if (department) {
    return department;
  }

  return {
    code: rule.departmentCode,
    name: NORMALIZED_DEPARTMENT_NAMES[rule.departmentCode] || rule.departmentCode,
    description: '',
    isActive: true
  };
};

export const getRoutingRuleSnapshot = () => ROUTING_RULES.map((rule) => ({
  category: rule.category,
  departmentCode: rule.departmentCode
}));