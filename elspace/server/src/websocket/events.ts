/**
 * Socket.IO Event Constants
 * Centralized event names for real-time communication
 */

export const SocketEvents = {
  // ============================================
  // Connection Events
  // ============================================
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  ERROR: 'error',

  // ============================================
  // Presence & Status
  // ============================================
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_STATUS_CHANGED: 'user:status_changed',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',

  // ============================================
  // Messages
  // ============================================
  SEND_MESSAGE: 'message:send',
  RECEIVE_MESSAGE: 'message:receive',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELIVERED: 'message:delivered',
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_UPDATED: 'conversation:updated',

  // ============================================
  // Notifications
  // ============================================
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETED: 'notification:deleted',
  NOTIFICATION_BROADCAST: 'notification:broadcast',

  // ============================================
  // Video Sessions
  // ============================================
  JOIN_SESSION: 'session:join',
  LEAVE_SESSION: 'session:leave',
  SESSION_STARTED: 'session:started',
  SESSION_ENDED: 'session:ended',
  SESSION_SIGNAL: 'session:signal',
  SESSION_RECORDING_STARTED: 'session:recording_started',
  SESSION_RECORDING_STOPPED: 'session:recording_stopped',
  SCREEN_SHARE_START: 'screen_share:start',
  SCREEN_SHARE_STOP: 'screen_share:stop',

  // ============================================
  // Projects
  // ============================================
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_STATUS_CHANGED: 'project:status_changed',
  PROPOSAL_RECEIVED: 'proposal:received',
  PROPOSAL_ACCEPTED: 'proposal:accepted',
  PROPOSAL_REJECTED: 'proposal:rejected',
  MILESTONE_CREATED: 'milestone:created',
  MILESTONE_UPDATED: 'milestone:updated',
  MILESTONE_APPROVED: 'milestone:approved',
  MILESTONE_PAID: 'milestone:paid',

  // ============================================
  // Social Feed
  // ============================================
  POST_CREATED: 'post:created',
  POST_UPDATED: 'post:updated',
  POST_DELETED: 'post:deleted',
  POST_LIKED: 'post:liked',
  POST_UNLIKED: 'post:unliked',
  POST_COMMENT_ADDED: 'post:comment_added',
  POST_COMMENT_DELETED: 'post:comment_deleted',
  POST_SHARED: 'post:shared',

  // ============================================
  // Payments & Wallet
  // ============================================
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
  WALLET_UPDATED: 'wallet:updated',
  TRANSFER_COMPLETED: 'transfer:completed',

  // ============================================
  // Communities
  // ============================================
  COMMUNITY_JOINED: 'community:joined',
  COMMUNITY_LEFT: 'community:left',
  COMMUNITY_POST_CREATED: 'community:post_created',
  COMMUNITY_MEMBER_JOINED: 'community:member_joined',
  COMMUNITY_MEMBER_LEFT: 'community:member_left',

  // ============================================
  // Disputes
  // ============================================
  DISPUTE_CREATED: 'dispute:created',
  DISPUTE_UPDATED: 'dispute:updated',
  DISPUTE_RESOLVED: 'dispute:resolved',
  DISPUTE_MESSAGE_ADDED: 'dispute:message_added',

  // ============================================
  // Admin & Moderation
  // ============================================
  ADMIN_ACTION: 'admin:action',
  USER_SUSPENDED: 'user:suspended',
  USER_BANNED: 'user:banned',
  MODERATION_ALERT: 'moderation:alert',

  // ============================================
  // Reviews
  // ============================================
  REVIEW_RECEIVED: 'review:received',
  REVIEW_RESPONDED: 'review:responded',

  // ============================================
  // Support
  // ============================================
  SUPPORT_TICKET_CREATED: 'support:ticket_created',
  SUPPORT_TICKET_UPDATED: 'support:ticket_updated',
  SUPPORT_REPLY_ADDED: 'support:reply_added',
} as const;

/**
 * Event payload types for TypeScript support
 */
export type SocketEventType = typeof SocketEvents[keyof typeof SocketEvents];

/**
 * Namespace definitions for organizing socket connections
 */
export const SocketNamespaces = {
  MESSAGES: '/messages',
  SESSIONS: '/sessions',
  FEED: '/feed',
  NOTIFICATIONS: '/notifications',
  ADMIN: '/admin',
  GENERAL: '/',
} as const;

/**
 * Socket room naming conventions
 */
export const SocketRooms = {
  USER: (userId: string) => `user:${userId}`,
  PROJECT: (projectId: string) => `project:${projectId}`,
  CONVERSATION: (conversationId: string) => `conversation:${conversationId}`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
  COMMUNITY: (communityId: string) => `community:${communityId}`,
  DISPUTE: (disputeId: string) => `dispute:${disputeId}`,
  ADMIN: 'admin',
  ONLINE_USERS: 'online_users',
} as const;

export default SocketEvents;
