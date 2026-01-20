import { IAgency } from "./Agency.types";

export class Agency implements IAgency {
  id: string;
  agency_name: string;
  branch_code: string | null;
  is_active: number;
  created_at: Date;
  updated_at: Date;
  constructor(data: IAgency) {
    this.id = data.id;
    this.agency_name = data.agency_name;
    this.branch_code = data.branch_code;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
