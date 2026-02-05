export interface ISubscriptionPlan {
  id?: number;
  code: string;
  name: string;
  max_documents: number;
  validity_days: number;
  price: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface IAgencySubscription {
  id?: number;
  agency_id: string;
  subscription_plan_id: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at?: Date;
}

export interface IAgencyDocumentUsage {
  id?: number;
  agency_id: string;
  subscription_id: number;
  documents_processed: number;
  last_processed_at: Date;
}

export interface AgencyUsageStats {
  documents_processed: number;
  max_documents: number;
  remaining_documents: number;
  subscription_start_date: Date;
  subscription_end_date: Date;
}
