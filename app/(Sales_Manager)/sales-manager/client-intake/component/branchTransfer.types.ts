export interface Branch {
  id: number;
  name: string;
  code: string;
  manager_name?: string;
}

export interface BranchTransferPayload {
  to_branch_id: number;
  remark: string;
}

export interface BranchTransferResponse {
  success: boolean;
  message: string;
  branch_client: any;
  destination_branch: any;
}