// TODO: 로컬 Supabase 스택 기동 후 `npx supabase gen types typescript --local > apps/web/src/types/database.ts` 로 재생성

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string;
          name: string;
          email: string;
          school: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          school?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          school?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          subject: string;
          grade: string;
          join_code: string;
          status: 'draft' | 'active' | 'ended';
          created_at: string;
          started_at: string | null;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          subject: string;
          grade: string;
          join_code: string;
          status?: 'draft' | 'active' | 'ended';
          created_at?: string;
          started_at?: string | null;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          subject?: string;
          grade?: string;
          join_code?: string;
          status?: 'draft' | 'active' | 'ended';
          created_at?: string;
          started_at?: string | null;
          ended_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sessions_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          }
        ];
      };
      questions: {
        Row: {
          id: string;
          session_id: string;
          content: string;
          options: Json;
          correct_answer: number;
          question_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          content: string;
          options: Json;
          correct_answer: number;
          question_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          content?: string;
          options?: Json;
          correct_answer?: number;
          question_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'questions_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          }
        ];
      };
      responses: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          nickname: string;
          selected_answer: number;
          is_correct: boolean;
          response_time_ms: number;
          score: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          nickname: string;
          selected_answer: number;
          is_correct: boolean;
          response_time_ms: number;
          score?: number;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          nickname?: string;
          selected_answer?: number;
          is_correct?: boolean;
          response_time_ms?: number;
          score?: number;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'responses_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'responses_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          }
        ];
      };
      ai_insights: {
        Row: {
          id: string;
          session_id: string;
          insights: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          insights: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          insights?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_insights_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: true;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          }
        ];
      };
      class_drafts: {
        Row: {
          id: string;
          session_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'class_drafts_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: true;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          }
        ];
      };
      thumbs_feedback: {
        Row: {
          id: string;
          session_id: string;
          nickname: string;
          type: 'up' | 'down';
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          nickname: string;
          type: 'up' | 'down';
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          nickname?: string;
          type?: 'up' | 'down';
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'thumbs_feedback_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
