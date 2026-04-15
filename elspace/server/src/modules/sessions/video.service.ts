import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Booking } from '@prisma/client';

interface DailyRoomResponse {
  id: string;
  name: string;
  api_created: boolean;
  privacy: string;
  url: string;
  created_at: string;
  config: {
    enable_chat: boolean;
    enable_knocking: boolean;
    enable_screenshare: boolean;
    enable_recording: string;
    settings: {
      enable_emoji_reactions: boolean;
      enable_hand_raise: boolean;
    };
  };
}

interface DailyTokenResponse {
  token: string;
}

interface VideoRoomDetails {
  url: string;
  roomId: string;
  roomName: string;
}

interface ParticipantToken {
  token: string;
  participantId: string;
  userId: string;
  isOwner: boolean;
}

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private readonly dailyApiUrl = process.env.DAILY_API_URL || 'https://api.daily.co/v1';
  private readonly dailyApiKey = process.env.DAILY_API_KEY || '';

  /**
   * Create a video room for a booking session
   */
  async createRoom(booking: Booking): Promise<VideoRoomDetails> {
    try {
      const roomName = `session-${booking.bookingId}`;

      const response = await axios.post<DailyRoomResponse>(
        `${this.dailyApiUrl}/rooms`,
        {
          name: roomName,
          privacy: 'private',
          properties: {
            enable_chat: true,
            enable_knocking: false,
            enable_screenshare: true,
            enable_recording: 'cloud',
            max_participants: 2,
            config: {
              enable_emoji_reactions: true,
              enable_hand_raise: true,
            },
            exp: Math.floor(booking.endTime.getTime() / 1000) + 3600, // 1 hour buffer after session ends
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Video room created: ${roomName}`);

      return {
        url: response.data.url,
        roomId: response.data.id,
        roomName: response.data.name,
      };
    } catch (error) {
      this.logger.error(`Failed to create video room: ${error.message}`);
      throw new Error(`Video room creation failed: ${error.message}`);
    }
  }

  /**
   * Generate a meeting token for a participant
   */
  async generateToken(
    roomName: string,
    userId: string,
    isOwner: boolean
  ): Promise<ParticipantToken> {
    try {
      const response = await axios.post<DailyTokenResponse>(
        `${this.dailyApiUrl}/meeting-tokens`,
        {
          properties: {
            room_name: roomName,
            user_id: userId,
            user_name: userId,
            is_owner: isOwner,
            exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        token: response.data.token,
        participantId: userId,
        userId,
        isOwner,
      };
    } catch (error) {
      this.logger.error(`Failed to generate meeting token: ${error.message}`);
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Get room details and status
   */
  async getRoomDetails(roomName: string) {
    try {
      const response = await axios.get(`${this.dailyApiUrl}/rooms/${roomName}`, {
        headers: {
          Authorization: `Bearer ${this.dailyApiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get room details: ${error.message}`);
      throw new Error(`Failed to retrieve room details: ${error.message}`);
    }
  }

  /**
   * Get recording for a completed session
   */
  async getSessionRecordings(roomName: string) {
    try {
      const response = await axios.get(
        `${this.dailyApiUrl}/rooms/${roomName}/recordings`,
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error(`Failed to get recordings: ${error.message}`);
      throw new Error(`Failed to retrieve recordings: ${error.message}`);
    }
  }

  /**
   * Delete a room (cleanup after session)
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      await axios.delete(`${this.dailyApiUrl}/rooms/${roomName}`, {
        headers: {
          Authorization: `Bearer ${this.dailyApiKey}`,
        },
      });

      this.logger.log(`Video room deleted: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to delete room: ${error.message}`);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Update room properties
   */
  async updateRoomProperties(
    roomName: string,
    properties: Record<string, any>
  ): Promise<void> {
    try {
      await axios.patch(
        `${this.dailyApiUrl}/rooms/${roomName}`,
        {
          properties,
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Room properties updated: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to update room: ${error.message}`);
      throw new Error(`Failed to update room: ${error.message}`);
    }
  }

  /**
   * Enable screen sharing for a room
   */
  async enableScreenShare(roomName: string): Promise<void> {
    return this.updateRoomProperties(roomName, {
      enable_screenshare: true,
    });
  }

  /**
   * Disable screen sharing for a room
   */
  async disableScreenShare(roomName: string): Promise<void> {
    return this.updateRoomProperties(roomName, {
      enable_screenshare: false,
    });
  }

  /**
   * Enable recording for a room
   */
  async enableRecording(roomName: string): Promise<void> {
    return this.updateRoomProperties(roomName, {
      enable_recording: 'cloud',
    });
  }

  /**
   * Disable recording for a room
   */
  async disableRecording(roomName: string): Promise<void> {
    return this.updateRoomProperties(roomName, {
      enable_recording: false,
    });
  }

  /**
   * Get transcription for a recorded session
   */
  async getTranscription(recordingId: string) {
    try {
      const response = await axios.get(
        `${this.dailyApiUrl}/recordings/${recordingId}/transcription`,
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get transcription: ${error.message}`);
      return null; // Transcription may not be ready yet
    }
  }

  /**
   * Validate meeting token format
   */
  validateToken(token: string): boolean {
    try {
      // Basic validation - tokens should be non-empty strings
      return token && typeof token === 'string' && token.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Health check for Daily.co connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.dailyApiUrl}/rooms`, {
        headers: {
          Authorization: `Bearer ${this.dailyApiKey}`,
        },
        params: {
          limit: 1,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`Video service health check failed: ${error.message}`);
      return false;
    }
  }
}

export default VideoService;
