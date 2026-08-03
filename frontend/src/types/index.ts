export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  owner_id: number;
  owner: User;
  votes_count: number;
  user_voted: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
