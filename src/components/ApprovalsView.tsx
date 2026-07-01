import { useState } from 'react';
import { User, CashAdvanceDoc, ExpenseClaimDoc } from '../types';
import { Check, X, AlertTriangle, FileText, Image, UserCheck, DollarSign, Calendar } from 'lucide-react';

interface ApprovalsViewProps {
  currentUser: User;
  advDocs: CashAdvanceDoc[];
  expDocs: ExpenseClaimDoc[];
  onApproveADV: (docNo: string) => void;
  onRejectADV: (docNo: string, reason: string) => void;
  onApproveEXP: (docNo: string) => void;
  onRejectEXP: (docNo: string, reason: string) => void;
}

export default function ApprovalsView({
  currentUser,
  advDocs,
  expDocs,
  onApproveADV,
  onRejectADV,
  onApproveEXP,
  onRejectEXP
}: ApprovalsViewProps) {
  const [selectedDoc, setSelectedDoc] = useState<{ type: 'ADV' | 'EXP'; doc: any } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter only Pending Approval documents
  const pendingAdvs = advDocs.filter(d => d.status === 'Pending Approval');
  const pendingExps = expDocs.filter(d => d.status === 'Pending Approval');

  const totalPendingCount = pendingAdvs.length + pendingExps.length;

  const handleSelectDoc = (type: 'ADV' | 'EXP', doc: any) => {
    setSelectedDoc({ type, doc });
    setRejectReason('');
    setShowRejectForm(false);
    setValidationError(null);
  };

  const handleApprove = () => {
    if (!selectedDoc) return;

    if (selectedDoc.type === 'ADV') {
      onApproveADV(selectedDoc.doc.document_no);
    } else {
      onApproveEXP(selectedDoc.doc.document_no);
    }

    alert(`อนุมัติเอกสาร ${selectedDoc.doc.document_no} เรียบร้อยแล้ว`);
    setSelectedDoc(null);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!rejectReason.trim()) {
      setValidationError('กรุณาระบุเหตุผลการปฏิเสธเอกสารก่อนกดยืนยัน');
      return;
    }

    if (!selectedDoc) return;

    if (selectedDoc.type === 'ADV') {
      onRejectADV(selectedDoc.doc.document_no, rejectReason);
    } else {
      onRejectEXP(selectedDoc.doc.document_no, rejectReason);
    }

    alert(`ปฏิเสธเอกสาร ${selectedDoc.doc.document_no} และส่งกลับเรียบร้อยแล้ว`);
    setSelectedDoc(null);
    setRejectReason('');
    setShowRejectForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">กล่องข้อความรออนุมัติ (Approval Inbox)</h1>
        <p className="text-sm text-gray-500">
          ผู้อนุมัติ: <span className="font-semibold text-indigo-600">{currentUser.full_name}</span> (สิทธิ์: {currentUser.role === 'Approver' ? 'หัวหน้าแผนก' : 'ผู้ดูแลระบบ'})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">รายการรอพิจารณา ({totalPendingCount})</h3>
              <span className="text-[11px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                3-Step Approval Workflow
              </span>
            </div>

            {totalPendingCount > 0 ? (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {/* Cash Advances */}
                {pendingAdvs.map((adv) => (
                  <button
                    key={adv.document_no}
                    onClick={() => handleSelectDoc('ADV', adv)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      selectedDoc?.doc.document_no === adv.document_no ? 'bg-indigo-50/40 border-l-4 border-amber-500' : ''
                    }`}
                  >
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-600">{adv.document_no}</span>
                        <span className="text-[10px] text-gray-400">{adv.request_date}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">ขอเงินทดรองจ่าย: ฿{adv.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 truncate">{adv.purpose}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          ผู้ขอ: {adv.requester_name}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                          ADV
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Expense Claims */}
                {pendingExps.map((exp) => (
                  <button
                    key={exp.document_no}
                    onClick={() => handleSelectDoc('EXP', exp)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      selectedDoc?.doc.document_no === exp.document_no ? 'bg-indigo-50/40 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-600">{exp.document_no}</span>
                        <span className="text-[10px] text-gray-400">{exp.receipt_date}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">เบิกค่าใช้จ่าย: ฿{exp.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 truncate">{exp.supplier_name} - {exp.description || 'ไม่มีคำอธิบาย'}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          ผู้ขอ: {exp.requester_name}
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-semibold">
                          EXP
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                ไม่มีเอกสารที่รอคุณอนุมัติในขณะนี้
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Document Details & Actions (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Detail Header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 block">{selectedDoc.doc.document_no}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                    {selectedDoc.type === 'ADV' ? 'คำขอเงินทดรองจ่าย (Cash Advance)' : 'คำขอเบิกค่าใช้จ่าย (Expense Claim)'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  รออนุมัติขั้นที่ 2
                </span>
              </div>

              {/* Detail Body */}
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block">ผู้ขอเบิก</span>
                    <span className="font-semibold text-gray-900">{selectedDoc.doc.requester_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">แผนก / ศูนย์ต้นทุน</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDoc.doc.department === 'Consulting' ? 'ที่ปรึกษา (Consulting)' : selectedDoc.doc.department === 'Delivery' ? 'ส่งมอบงาน (Delivery)' : 'บริหาร (Management)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">วันที่ขอ / วันที่ใบเสร็จ</span>
                    <span className="font-semibold text-gray-900">{selectedDoc.type === 'ADV' ? selectedDoc.doc.request_date : selectedDoc.doc.receipt_date}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">ยอดเงินรวม</span>
                    <span className="text-lg font-bold text-indigo-600">฿{selectedDoc.doc.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Specifics for ADV */}
                {selectedDoc.type === 'ADV' && (
                  <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 space-y-2">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">วัตถุประสงค์การขอเงินล่วงหน้า</h4>
                    <p className="text-sm text-gray-700">{selectedDoc.doc.purpose}</p>
                  </div>
                )}

                {/* Specifics for EXP */}
                {selectedDoc.type === 'EXP' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-indigo-50/30 p-4 rounded-lg border border-indigo-100/50">
                      <div>
                        <span className="text-xs text-gray-400 block">ร้านค้า / Supplier</span>
                        <span className="font-semibold text-gray-900">{selectedDoc.doc.supplier_name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">หมวดหมู่ค่าใช้จ่าย</span>
                        <span className="font-semibold text-gray-900">
                          {selectedDoc.doc.category === 'Travel' ? 'ค่าเดินทาง' : selectedDoc.doc.category === 'Entertainment' ? 'ค่ารับรอง' : selectedDoc.doc.category === 'Office Supplies' ? 'ค่าอุปกรณ์สำนักงาน' : selectedDoc.doc.category === 'SaaS/Software' ? 'ค่าซอฟต์แวร์/SaaS' : 'อื่นๆ'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">วิธีการชำระเงิน</span>
                        <span className="font-semibold text-gray-900">{selectedDoc.doc.payment_method === 'Cash' ? 'เงินสด' : selectedDoc.doc.payment_method === 'Transfer' ? 'โอนเงิน' : 'บัตรเครดิต'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">อ้างอิงใบ ADV</span>
                        <span className="font-mono font-semibold text-amber-700">
                          {selectedDoc.doc.advance_ref || 'ไม่มี (เบิกปกติ)'}
                        </span>
                      </div>
                    </div>

                    {selectedDoc.doc.description && (
                      <div>
                        <span className="text-xs text-gray-400 block mb-1">รายละเอียดเพิ่มเติม</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{selectedDoc.doc.description}</p>
                      </div>
                    )}

                    {/* Receipt Image Display */}
                    <div>
                      <span className="text-xs text-gray-400 block mb-1.5 flex items-center gap-1">
                        <Image className="w-3.5 h-3.5 text-indigo-600" />
                        หลักฐานใบเสร็จรับเงิน
                      </span>
                      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 bg-gray-50 flex items-center justify-center">
                        <img
                          src={selectedDoc.doc.receipt_image_url}
                          alt="Receipt Proof"
                          className="max-h-64 object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Reject Reason Input Area */}
                {showRejectForm && (
                  <form onSubmit={handleRejectSubmit} className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                        ระบุเหตุผลการปฏิเสธ (Reject Reason) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="เช่น เอกสารไม่ครบถ้วน, ยอดเงินไม่ถูกต้องตามนโยบายบริษัท..."
                        value={rejectReason}
                        onChange={(e) => {
                          setRejectReason(e.target.value);
                          setValidationError(null);
                        }}
                        className="block w-full px-3 py-2 border border-red-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                      />
                    </div>

                    {validationError && (
                      <p className="text-xs text-red-600 font-semibold">{validationError}</p>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRejectForm(false);
                          setValidationError(null);
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700"
                      >
                        ยืนยันการปฏิเสธ (Reject)
                      </button>
                    </div>
                  </form>
                )}

                {/* Approver Action Buttons */}
                {!showRejectForm && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 hover:border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      ปฏิเสธคำขอ (Reject)
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      อนุมัติเอกสาร (Approve)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-12 text-center text-gray-400">
              <UserCheck className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-700">กรุณาเลือกเอกสารจากรายการด้านซ้าย</p>
              <p className="text-xs text-gray-400 mt-1">เพื่อเปิดดูรายละเอียดและดำเนินการอนุมัติหรือปฏิเสธคำขอ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}