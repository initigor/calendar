export type Role = "owner" | "member";

export interface Profile {
  id: string;
  username: string;
}

export interface Environment {
  id: string;
  nama: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
}

export interface EnvironmentMember {
  environment_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
  profiles?: Profile | null;
}

export interface CalendarEvent {
  id: string;
  owner_user_id: string;
  judul: string;
  tanggal: string; // yyyy-MM-dd
  jam_mulai: string | null; // HH:mm:ss
  jam_selesai: string | null; // HH:mm:ss
  lokasi: string | null;
  catatan: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      environments: {
        Row: Environment;
        Insert: Partial<Environment> & { nama: string; owner_id: string };
        Update: Partial<Environment>;
      };
      environment_members: {
        Row: EnvironmentMember;
        Insert: Partial<EnvironmentMember> & {
          environment_id: string;
          user_id: string;
        };
        Update: Partial<EnvironmentMember>;
      };
      events: {
        Row: CalendarEvent;
        Insert: Partial<CalendarEvent> & {
          owner_user_id: string;
          judul: string;
          tanggal: string;
        };
        Update: Partial<CalendarEvent>;
      };
    };
  };
};
