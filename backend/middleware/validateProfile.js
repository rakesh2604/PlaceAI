import { body, validationResult } from 'express-validator';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('phone').optional().custom((value) => {
    if (!value) return true; // Optional field
    if (!isValidPhoneNumber(value, 'IN')) {
      throw new Error('Invalid Indian phone number. Please use format +91XXXXXXXXXX');
    }
    return true;
  }),
  body('languages').optional().isArray(),
  body('compensationPaise').optional().isInt({ min: 0 }).withMessage('Compensation must be a positive number in paise'),
  body('resumeId').optional().isString()
];

export const validatePhone = (phone, country = 'IN') => {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  
  try {
    const phoneNumber = parsePhoneNumber(phone, country);
    if (!phoneNumber.isValid()) {
      return { valid: false, error: 'Invalid phone number' };
    }
    return { valid: true, formatted: phoneNumber.format('E.164') };
  } catch (error) {
    return { valid: false, error: 'Invalid phone number format' };
  }
};

