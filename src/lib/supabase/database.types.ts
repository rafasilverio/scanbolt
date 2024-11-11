export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          contracts_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: string
          contracts_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          contracts_remaining?: number
          created_at?: string
          updated_at?: string
        }
      },
      contracts: {
        Row: {
          id: string
          title: string
          fileUrl: string
          fileName: string
          status: string
          fileType: string
          content: string
          highlights: string | null
          changes: string | null
          userId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          fileUrl: string
          fileName: string
          status?: string
          fileType: string
          content: string
          highlights?: string | null
          changes?: string | null
          userId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          fileUrl?: string
          fileName?: string
          status?: string
          fileType?: string
          content?: string
          highlights?: string | null
          changes?: string | null
          userId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      // Add other tables as needed
    }
  }
}
