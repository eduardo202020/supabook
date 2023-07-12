export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
