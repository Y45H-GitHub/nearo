/**
 * Placeholder until a live Supabase project exists and
 * `supabase gen types typescript --linked > src/types/database.ts` is run
 * (see specs/implementation-plan.md, M0). Replace this file wholesale when
 * that happens — don't hand-edit generated output afterward, and don't
 * hand-edit this placeholder into something that looks generated either.
 */
export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      }
    >;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
