export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cupons: {
        Row: {
          ativo: boolean
          codigo: string
          id: string
          percentual: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          id?: string
          percentual?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          id?: string
          percentual?: number
        }
        Relationships: []
      }
      feedback_clientes: {
        Row: {
          aprovado: boolean
          atualizado_em: string
          cliente_email: string | null
          cliente_nome: string
          comentario: string | null
          criado_em: string
          id: string
          nota: number
          pedido_id: string
        }
        Insert: {
          aprovado?: boolean
          atualizado_em?: string
          cliente_email?: string | null
          cliente_nome: string
          comentario?: string | null
          criado_em?: string
          id?: string
          nota: number
          pedido_id: string
        }
        Update: {
          aprovado?: boolean
          atualizado_em?: string
          cliente_email?: string | null
          cliente_nome?: string
          comentario?: string | null
          criado_em?: string
          id?: string
          nota?: number
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_clientes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: true
            referencedRelation: "pedidos_online"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredientes: {
        Row: {
          created_at: string | null
          custo_unitario: number
          estoque_minimo: number
          id: string
          nome: string
          quantidade: number
          unidade: string
          validade: string | null
        }
        Insert: {
          created_at?: string | null
          custo_unitario?: number
          estoque_minimo?: number
          id?: string
          nome: string
          quantidade?: number
          unidade?: string
          validade?: string | null
        }
        Update: {
          created_at?: string | null
          custo_unitario?: number
          estoque_minimo?: number
          id?: string
          nome?: string
          quantidade?: number
          unidade?: string
          validade?: string | null
        }
        Relationships: []
      }
      loja_config: {
        Row: {
          aberta_manual: boolean | null
          abre: string
          fecha: string
          id: number
          som_alerta: boolean
          taxa_entrega: number
        }
        Insert: {
          aberta_manual?: boolean | null
          abre?: string
          fecha?: string
          id?: number
          som_alerta?: boolean
          taxa_entrega?: number
        }
        Update: {
          aberta_manual?: boolean | null
          abre?: string
          fecha?: string
          id?: number
          som_alerta?: boolean
          taxa_entrega?: number
        }
        Relationships: []
      }
      motoboys: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      pedidos_online: {
        Row: {
          aceito_em: string | null
          cliente: string
          created_at: string
          cupom: string | null
          desconto: number
          endereco: string
          entregue_em: string | null
          id: string
          itens: Json
          motivo_recusa: string | null
          motoboy_id: string | null
          observacoes: string | null
          origem: string
          pix_copia_cola: string | null
          qr_code_pix: string | null
          recusado_em: string | null
          salvo_em: string | null
          salvo_por: string | null
          status: string
          status_delivery: string
          status_pagamento: string
          subtotal: number
          taxa_entrega: number
          telefone: string
          token: string
          total: number
          transaction_id: string | null
          updated_at: string
          venda_id: string | null
        }
        Insert: {
          aceito_em?: string | null
          cliente: string
          created_at?: string
          cupom?: string | null
          desconto?: number
          endereco: string
          entregue_em?: string | null
          id?: string
          itens: Json
          motivo_recusa?: string | null
          motoboy_id?: string | null
          observacoes?: string | null
          origem?: string
          pix_copia_cola?: string | null
          qr_code_pix?: string | null
          recusado_em?: string | null
          salvo_em?: string | null
          salvo_por?: string | null
          status?: string
          status_delivery?: string
          status_pagamento?: string
          subtotal: number
          taxa_entrega?: number
          telefone: string
          token: string
          total: number
          transaction_id?: string | null
          updated_at?: string
          venda_id?: string | null
        }
        Update: {
          aceito_em?: string | null
          cliente?: string
          created_at?: string
          cupom?: string | null
          desconto?: number
          endereco?: string
          entregue_em?: string | null
          id?: string
          itens?: Json
          motivo_recusa?: string | null
          motoboy_id?: string | null
          observacoes?: string | null
          origem?: string
          pix_copia_cola?: string | null
          qr_code_pix?: string | null
          recusado_em?: string | null
          salvo_em?: string | null
          salvo_por?: string | null
          status?: string
          status_delivery?: string
          status_pagamento?: string
          subtotal?: number
          taxa_entrega?: number
          telefone?: string
          token?: string
          total?: number
          transaction_id?: string | null
          updated_at?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_online_motoboy_id_fkey"
            columns: ["motoboy_id"]
            isOneToOne: false
            referencedRelation: "motoboys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_online_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_online_audit: {
        Row: {
          acao: string
          criado_em: string
          detalhes: Json | null
          id: string
          pedido_id: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          detalhes?: Json | null
          id?: string
          pedido_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          detalhes?: Json | null
          id?: string
          pedido_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_online_audit_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_online"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string | null
          descricao: string | null
          foto_url: string | null
          id: string
          imagem_path: string | null
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          foto_url?: string | null
          id?: string
          imagem_path?: string | null
          nome: string
          preco?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          foto_url?: string | null
          id?: string
          imagem_path?: string | null
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      receitas: {
        Row: {
          id: string
          ingrediente_id: string
          produto_id: string
          quantidade: number
        }
        Insert: {
          id?: string
          ingrediente_id: string
          produto_id: string
          quantidade: number
        }
        Update: {
          id?: string
          ingrediente_id?: string
          produto_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "receitas_ingrediente_id_fkey"
            columns: ["ingrediente_id"]
            isOneToOne: false
            referencedRelation: "ingredientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_feedback: {
        Row: {
          criado_em: string
          feedback_id: string
          id: string
          respondido_por: string | null
          resposta: string
        }
        Insert: {
          criado_em?: string
          feedback_id: string
          id?: string
          respondido_por?: string | null
          resposta: string
        }
        Update: {
          criado_em?: string
          feedback_id?: string
          id?: string
          respondido_por?: string | null
          resposta?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_feedback_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: true
            referencedRelation: "feedback_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venda_itens: {
        Row: {
          custo_unitario: number
          id: string
          nome: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          venda_id: string
        }
        Insert: {
          custo_unitario?: number
          id?: string
          nome: string
          preco_unitario: number
          produto_id?: string | null
          quantidade: number
          venda_id: string
        }
        Update: {
          custo_unitario?: number
          id?: string
          nome?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          cliente: string | null
          created_at: string
          criado_por: string | null
          cupom: string | null
          custo: number
          desconto: number
          endereco: string | null
          id: string
          lucro: number
          motoboy_id: string | null
          numero: number
          status: string
          subtotal: number
          taxa_entrega: number
          telefone: string | null
          tipo: string
          total: number
          updated_at: string
        }
        Insert: {
          cliente?: string | null
          created_at?: string
          criado_por?: string | null
          cupom?: string | null
          custo?: number
          desconto?: number
          endereco?: string | null
          id?: string
          lucro?: number
          motoboy_id?: string | null
          numero?: number
          status?: string
          subtotal?: number
          taxa_entrega?: number
          telefone?: string | null
          tipo?: string
          total?: number
          updated_at?: string
        }
        Update: {
          cliente?: string | null
          created_at?: string
          criado_por?: string | null
          cupom?: string | null
          custo?: number
          desconto?: number
          endereco?: string | null
          id?: string
          lucro?: number
          motoboy_id?: string | null
          numero?: number
          status?: string
          subtotal?: number
          taxa_entrega?: number
          telefone?: string | null
          tipo?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_motoboy_id_fkey"
            columns: ["motoboy_id"]
            isOneToOne: false
            referencedRelation: "motoboys"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceitar_pedido: { Args: { _pedido_id: string }; Returns: Json }
      avancar_status_pedido: {
        Args: { _motivo?: string; _novo_status: string; _pedido_id: string }
        Returns: Json
      }
      catalogo_online: { Args: never; Returns: Json }
      confirmar_pagamento_online: {
        Args: { _pedido_id: string }
        Returns: Json
      }
      consultar_pedido_online: { Args: { _token: string }; Returns: Json }
      criar_feedback: {
        Args: {
          _cliente_email?: string
          _cliente_nome: string
          _comentario?: string
          _nota?: number
          _pedido_id: string
        }
        Returns: Json
      }
      criar_pedido_online: {
        Args: {
          _cliente: string
          _cupom?: string
          _endereco: string
          _itens: Json
          _telefone: string
          _token: string
        }
        Returns: Json
      }
      estatisticas_feedback: { Args: never; Returns: Json }
      expirar_pedido_online: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      limpar_pedidos_expirados: { Args: never; Returns: Json }
      listar_feedbacks_aprovados: {
        Args: { _limite?: number; _nota_filtro?: number; _offset?: number }
        Returns: {
          cliente_nome: string
          comentario: string
          criado_em: string
          id: string
          nota: number
          pedido_id: string
          resposta: string
        }[]
      }
      listar_todos_feedbacks: {
        Args: {
          _aprovado_filtro?: boolean
          _limite?: number
          _nota_filtro?: number
          _offset?: number
        }
        Returns: {
          aprovado: boolean
          cliente_email: string
          cliente_nome: string
          comentario: string
          criado_em: string
          id: string
          nota: number
          pedido_id: string
          resposta: string
        }[]
      }
      modificar_feedback_aprovacao: {
        Args: { _aprovado: boolean; _feedback_id: string }
        Returns: Json
      }
      recusar_pedido: {
        Args: { _motivo: string; _pedido_id: string }
        Returns: Json
      }
      registrar_venda: {
        Args: {
          _cliente?: string
          _cupom?: string
          _endereco?: string
          _itens: Json
          _telefone?: string
          _tipo?: string
        }
        Returns: string
      }
      responder_feedback: {
        Args: { _feedback_id: string; _resposta: string }
        Returns: Json
      }
      salvar_pedido_online: {
        Args: { _pedido_id: string; _usuario?: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "gerente" | "atendente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gerente", "atendente"],
    },
  },
} as const
