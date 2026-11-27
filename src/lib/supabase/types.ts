export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      lessons: {
        Row: {
          id: string
          user_id: string
          subject: string
          grade: string
          topic: string
          curriculum: string | null
          standard: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          grade: string
          topic: string
          curriculum?: string | null
          standard?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          grade?: string
          topic?: string
          curriculum?: string | null
          standard?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lesson_outputs: {
        Row: {
          id: string
          lesson_id: string
          type: 'rpp' | 'slide' | 'soal' | 'lks' | 'rubrik' | 'media' | 'remedial' | 'enrichment'
          content: Json
          version: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          type: 'rpp' | 'slide' | 'soal' | 'lks' | 'rubrik' | 'media' | 'remedial' | 'enrichment'
          content: Json
          version?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          type?: 'rpp' | 'slide' | 'soal' | 'lks' | 'rubrik' | 'media' | 'remedial' | 'enrichment'
          content?: Json
          version?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          school_name: string | null
          role: 'guru' | 'kepala_sekolah' | 'admin' | 'siswa'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          school_name?: string | null
          role?: 'guru' | 'kepala_sekolah' | 'admin' | 'siswa'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          school_name?: string | null
          role?: 'guru' | 'kepala_sekolah' | 'admin' | 'siswa'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lesson_type: 'rpp' | 'slide' | 'soal' | 'lks' | 'rubrik' | 'media' | 'remedial' | 'enrichment'
      user_role: 'guru' | 'kepala_sekolah' | 'admin' | 'siswa'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Lesson = Database['public']['Tables']['lessons']['Row']
export type LessonInsert = Database['public']['Tables']['lessons']['Insert']
export type LessonOutput = Database['public']['Tables']['lesson_outputs']['Row']
export type LessonOutputInsert = Database['public']['Tables']['lesson_outputs']['Insert']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
