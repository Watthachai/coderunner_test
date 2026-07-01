export type Department = 'Management' | 'Consulting' | 'Delivery';
export type Role = 'Employee' | 'Approver' | 'Finance';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  department: Department;
  role: Role;
}

export type ADVStatus = 
  | 'Draft' 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Paid' 
  | 'Pending Refund' 
  | 'Settled' 
  | 'Rejected';

export type EXPStatus = 
  | 'Draft' 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Paid' 
  | 'Rejected';

export interface CashAdvanceDoc {
  document_no: string;
  request_date: string;
  requester_id: string;
  requester_name: string;
  department: Department;
  amount: number;
  purpose: string;
  status: ADVStatus;
  reject_reason?: string;
  paid_date?: string;
  refunded_amount?: number;
  cleared_date?: string;
}

export interface ExpenseClaimDoc {
  document_no: string;
  advance_ref?: string; // References ADV document_no
  receipt_date: string;
  amount: number;
  category: 'Travel' | 'Entertainment' | 'Office Supplies' | 'SaaS/Software' | 'Others';
  department: Department;
  supplier_name: string;
  payment_method: 'Cash' | 'Transfer' | 'Credit Card';
  receipt_image_url: string;
  description?: string;
  status: EXPStatus;
  requester_id: string;
  requester_name: string;
  reject_reason?: string;
}

export interface OCRMockTemplate {
  name: string;
  imageUrl: string;
  detectedDate: string;
  detectedAmount: number;
  detectedSupplier: string;
  detectedCategory: 'Travel' | 'Entertainment' | 'Office Supplies' | 'SaaS/Software' | 'Others';
}