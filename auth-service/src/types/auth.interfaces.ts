export interface AuthBody {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  twofa_enabled: number;
  password_version: number;
  token_version: number;
}

export interface ChangePassword {
  old_password: string;
  new_password: string;
}

export interface DBUser {
  password_hashed: string;
  password_version: number;
}

export interface RefreshPayload {
  userId: string;
  tokenId: string;
  type: "refresh";
}

export interface UserRow {
  id: string;
  email: string;
  password_hashed: string;
  password_version: number;
  token_version: number;
  twofa_enabled: number;
  provider?: string;
  provider_id?: string;
  needs_password?: number;
  deleted_at?: string | null;
}
