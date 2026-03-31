// Contratos compartilhados entre API e Web

export interface ApiResponse<T> {
  data: T;
  meta: { requestId: string; timestamp: string };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

// ─── Identity DTOs ────────────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

// ─── Challenge DTOs ───────────────────────────────────────────────────────────
export interface ChallengeDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  participantCount: number;
}

// ─── Workout DTOs ─────────────────────────────────────────────────────────────
export interface WorkoutDto {
  id: string;
  userId: string;
  challengeId: string;
  title: string;
  description: string | null;
  points: number;
  media: WorkoutMediaDto[];
  createdAt: string;
}

export interface WorkoutMediaDto {
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  originalUrl: string;
}
