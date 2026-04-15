import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid';

/**
 * Generate a public-facing readable User ID
 * Format: ELSP_CL_XXXXX or ELSP_FR_XXXXX
 * Example: ELSP_FR_7XK9P2
 */
export const generatePublicUserId = (role: 'CLIENT' | 'FREELANCER'): string => {
  const prefix = 'ELSP';
  const roleCode = role === 'CLIENT' ? 'CL' : 'FR';
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
  return `${prefix}_${roleCode}_${nanoid()}`;
};

/**
 * Generate internal UUID for database primary keys
 * Used for internal references and relationships
 */
export const generateUUID = (): string => uuidv4();

/**
 * Generate unique Transaction ID
 * Format: TXN_TIMESTAMP_RANDOMSTRING
 * Example: TXN_1713184800000_K9P2XK7L
 */
export const generateTransactionId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `TXN_${Date.now()}_${nanoid()}`;
};

/**
 * Generate unique Project ID
 * Format: PROJ_RANDOMSTRING
 */
export const generateProjectId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `PROJ_${nanoid()}`;
};

/**
 * Generate unique Booking/Session ID
 * Format: BK_RANDOMSTRING
 */
export const generateBookingId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `BK_${nanoid()}`;
};

/**
 * Generate unique Community ID
 * Format: COMM_RANDOMSTRING
 */
export const generateCommunityId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `COMM_${nanoid()}`;
};

/**
 * Generate unique Dispute ID
 * Format: DISP_RANDOMSTRING
 */
export const generateDisputeId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `DISP_${nanoid()}`;
};

/**
 * Generate unique Support Ticket ID
 * Format: TKT_RANDOMSTRING
 */
export const generateTicketId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `TKT_${nanoid()}`;
};

/**
 * Generate unique Invoice Number
 * Format: INV_YEAR_MONTH_RANDOMSTRING
 * Example: INV_2026_04_ABC123XY
 */
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
  return `INV_${year}_${month}_${nanoid()}`;
};

/**
 * Generate unique Conversation ID for messaging
 * Format: CONV_RANDOMSTRING
 */
export const generateConversationId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `CONV_${nanoid()}`;
};

/**
 * Generate unique Post ID for social feed
 * Format: POST_RANDOMSTRING
 */
export const generatePostId = (): string => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
  return `POST_${nanoid()}`;
};

export default {
  generatePublicUserId,
  generateUUID,
  generateTransactionId,
  generateProjectId,
  generateBookingId,
  generateCommunityId,
  generateDisputeId,
  generateTicketId,
  generateInvoiceNumber,
  generateConversationId,
  generatePostId,
};
