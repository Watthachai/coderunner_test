import { useState } from 'react';
import { User, CashAdvanceDoc, ExpenseClaimDoc, Department } from './types';
import { USERS, INITIAL_ADV_DOCS, INITIAL_EXP_DOCS } from './data';
import DashboardView from './components/DashboardView';
import MyRequestsView from './components/MyRequestsView';
import ApprovalsView from './components/ApprovalsView';
import FinanceView from './components/FinanceView';
import { LayoutDashboard, FileText, CheckSquare, Wallet2, Users, Receipt, Building2, HelpCircle } from 'lucide-react';

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]); // Default to Somchai (Employee)
  const [advDocs, setAdvDocs] = useState<CashAdvanceDoc[]>(INITIAL_ADV_DOCS);
  const [expDocs, setExpDocs] = useState<ExpenseClaimDoc[]>(INITIAL_EXP_DOCS);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'my-requests' | 'approvals' | 'finance'>('dashboard');

  // Role Switcher Handler
  const handleUserChange = (userId: string) => {
    const found = USERS.find(u => u.user_id === userId);
    if (found) {
      setCurrentUser(found);
      // Auto-switch menu tab to fit role for better demo flow
      if (found.role === 'Approver') {
        setActiveMenu('approvals');
      } else if (found.role === 'Finance') {
        setActiveMenu('finance');
      } else {
        setActiveMenu('my-requests');
      }
    }
  };

  // Create Cash Advance (ADV)
  const handleCreateADV = (newAdv: Omit<CashAdvanceDoc, 'document_no' | 'requester_id' | 'requester_name' | 'department'>) => {
    const nextNum = advDocs.length + 1;
    const document_no = `ADV-2026-${String(nextNum).padStart(5, '0')}`;
    
    const fullDoc: CashAdvanceDoc = {
      ...newAdv,
      document_no,
      requester_id: currentUser.user_id,
      requester_name: currentUser.full_name,
      department: currentUser.department
    };

    setAdvDocs([fullDoc, ...advDocs]);
  };

  // Create Expense Claim (EXP) with validation rules
  const handleCreateEXP = (newExp: Omit<ExpenseClaimDoc, 'document_no' | 'requester_id' | 'requester_name' | 'department'>): string | null => {
    // Validation: If referencing an ADV document
    if (newExp.advance_ref) {
      const adv = advDocs.find(a => a.document_no === newExp.advance_ref);
      if (adv) {
        if (newExp.amount > adv.amount) {
          return `ห้ามเบิกเกินยอดเงินทดรองจ่าย (ยอดเงินทดรองจ่ายคงเหลือสูงสุด ฿${adv.amount.toLocaleString()})`;
        }
      }
    }

    const nextNum = expDocs.length + 1;
    const document_no = `EXP-2026-${String(nextNum).padStart(5, '0')}`;

    const fullDoc: ExpenseClaimDoc = {
      ...newExp,
      document_no,
      requester_id: currentUser.user_id,
      requester_name: currentUser.full_name,
      department: currentUser.department
    };

    // Update EXP list
    setExpDocs([fullDoc, ...expDocs]);

    // Side Effect: If ADV is referenced, update its status
    if (newExp.advance_ref) {
      setAdvDocs(prevAdvs => prevAdvs.map(adv => {
        if (adv.document_no === newExp.advance_ref) {
          if (newExp.amount < adv.amount) {
            // Employee spent less than advance, needs refund
            return {
              ...adv,
              status: 'Pending Refund',
              refunded_amount: 0 // Waiting for finance confirmation
            };
          } else {
            // Spent exactly the advance amount
            return {
              ...adv,
              status: 'Settled',
              cleared_date: new Date().toISOString().split('T')[0]
            };
          }
        }
        return adv;
      }));
    }

    return null; // No errors
  };

  // Approval Actions
  const handleApproveADV = (docNo: string) => {
    setAdvDocs(prev => prev.map(d => d.document_no === docNo ? { ...d, status: 'Approved' } : d));
  };

  const handleRejectADV = (docNo: string, reason: string) => {
    setAdvDocs(prev => prev.map(d => d.document_no === docNo ? { ...d, status: 'Rejected', reject_reason: reason } : d));
  };

  const handleApproveEXP = (docNo: string) => {
    setExpDocs(prev => prev.map(d => d.document_no === docNo ? { ...d, status: 'Approved' } : d));
  };

  const handleRejectEXP = (docNo: string, reason: string) => {
    setExpDocs(prev => prev.map(d => d.document_no === docNo ? { ...d, status: 'Rejected', reject_reason: reason } : d));
  };

  // Finance Actions
  const handleMarkADVPaid = (docNo: string) => {
    setAdvDocs(prev => prev.map(d => d.document_no === docNo ? { ...d, status: 'Paid', paid_date: new Date().toISOString().split('T')[0] } : d));
  };

  const handleConfirmADVRefund = (docNo: string) => {
    setAdvDocs(prev => prev.map(d => {
      if (d.document_no === docNo) {
        // Find matching expense to calculate refund amount
        const matchingExp = expDocs.find(e => e.advance_ref === docNo);
        const refundAmt = matchingExp ? d.amount - matchingExp.amount : 0;
        return {
          ...d,
          status: 'Settled',
          refunded_amount: refundAmt,
          cleared_date: new Date().toISOString().split('T')[0]
        };
      }
      return d;
    }));
  };

  const handleMarkEXPPaid = (docNo: string) => {
    setExpDocs(prev => prev.map(d => d.document_no === docNo ? { ...d, status: 'Paid' } : d));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 tracking-tight">ExpenseFlow</span>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">v1.1 Demo</span>
                </div>
                <span className="text-xs text-gray-400 block">Digitalvalue Co., Ltd.</span>
              </div>
            </div>

            {/* Role Switcher (Crucial for Demo) */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-lg p-1.5 flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-900 px-1 hidden md:inline">บทบาทจำลอง:</span>
                <select
                  value={currentUser.user_id}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="bg-white border border-indigo-200 rounded px-2 py-1 text-xs font-semibold text-indigo-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {USERS.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.role === 'Employee' ? 'พนักงาน' : u.role === 'Approver' ? 'หัวหน้าแผนก' : 'บัญชี'})
                    </option>
                  ))}
                </select>
              </div>

              {/* User Avatar Info */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.full_name.substring(0, 2)}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-bold text-gray-800 block leading-tight">{currentUser.full_name}</span>
                  <span className="text-[10px] text-gray-400 block">{currentUser.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 sticky top-24">
            <p className="text-[10px] font-bold text-gray-400 uppercase px-3 mb-2 tracking-wider">เมนูหลัก</p>
            
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              แผงควบคุมหลัก (Dashboard)
            </button>

            <button
              onClick={() => setActiveMenu('my-requests')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'my-requests'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                คำขอของฉัน (My Requests)
              </div>
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full group-hover:bg-gray-200">
                {advDocs.filter(d => d.requester_id === currentUser.user_id).length + expDocs.filter(d => d.requester_id === currentUser.user_id).length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu('approvals')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'approvals'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4" />
                กล่องอนุมัติ (Approvals)
              </div>
              {advDocs.filter(d => d.status === 'Pending Approval').length + expDocs.filter(d => d.status === 'Pending Approval').length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {advDocs.filter(d => d.status === 'Pending Approval').length + expDocs.filter(d => d.status === 'Pending Approval').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('finance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeMenu === 'finance'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet2 className="w-4 h-4" />
                ฝ่ายการเงิน (Finance)
              </div>
              {advDocs.filter(d => d.status === 'Approved' || d.status === 'Pending Refund').length + expDocs.filter(d => d.status === 'Approved').length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {advDocs.filter(d => d.status === 'Approved' || d.status === 'Pending Refund').length + expDocs.filter(d => d.status === 'Approved').length}
                </span>
              )}
            </button>

            <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase px-3 tracking-wider">ข้อมูลจำลอง</p>
              <div className="bg-indigo-50/50 p-2.5 rounded-lg text-[11px] text-indigo-950 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Digitalvalue
                </p>
                <p>• พนักงานทั้งหมด: 10 คน</p>
                <p>• สกุลเงินหลัก: THB ฿</p>
                <p>• บัญชี 3 ขั้นตอน (P-01 ถึง P-05)</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeMenu === 'dashboard' && (
            <DashboardView advDocs={advDocs} expDocs={expDocs} />
          )}

          {activeMenu === 'my-requests' && (
            <MyRequestsView
              currentUser={currentUser}
              advDocs={advDocs}
              expDocs={expDocs}
              onCreateADV={handleCreateADV}
              onCreateEXP={handleCreateEXP}
            />
          )}

          {activeMenu === 'approvals' && (
            <ApprovalsView
              currentUser={currentUser}
              advDocs={advDocs}
              expDocs={expDocs}
              onApproveADV={handleApproveADV}
              onRejectADV={handleRejectADV}
              onApproveEXP={handleApproveEXP}
              onRejectEXP={handleRejectEXP}
            />
          )}

          {activeMenu === 'finance' && (
            <FinanceView
              currentUser={currentUser}
              advDocs={advDocs}
              expDocs={expDocs}
              onMarkADVPaid={handleMarkADVPaid}
              onConfirmADVRefund={handleConfirmADVRefund}
              onMarkEXPPaid={handleMarkEXPPaid}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          © 2026 ExpenseFlow by Digitalvalue. พัฒนาขึ้นเพื่อเป็นกรณีศึกษา (Case Study) และปรับปรุงประสิทธิภาพกระบวนการทำงานภายใน
        </div>
      </footer>
    </div>
  );
}