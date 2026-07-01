import { useState } from 'react';
import { User, CashAdvanceDoc, ExpenseClaimDoc, OCRMockTemplate, Department } from '../types';
import { Plus, Upload, Sparkles, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Trash2, Eye } from 'lucide-react';
import { OCR_MOCK_TEMPLATES } from '../data';

interface MyRequestsProps {
  currentUser: User;
  advDocs: CashAdvanceDoc[];
  expDocs: ExpenseClaimDoc[];
  onCreateADV: (doc: Omit<CashAdvanceDoc, 'document_no' | 'requester_id' | 'requester_name' | 'department'>) => void;
  onCreateEXP: (doc: Omit<ExpenseClaimDoc, 'document_no' | 'requester_id' | 'requester_name' | 'department'>) => string | null; // returns error message if validation fails, null on success
}

export default function MyRequestsView({ currentUser, advDocs, expDocs, onCreateADV, onCreateEXP }: MyRequestsProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create-adv' | 'create-exp'>('list');
  const [selectedReceiptTemplate, setSelectedReceiptTemplate] = useState<OCRMockTemplate | null>(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  // Form States - Cash Advance
  const [advAmount, setAdvAmount] = useState('');
  const [advPurpose, setAdvPurpose] = useState('');

  // Form States - Expense Claim
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState('');
  const [expSupplier, setExpSupplier] = useState('');
  const [expCategory, setExpCategory] = useState<'Travel' | 'Entertainment' | 'Office Supplies' | 'SaaS/Software' | 'Others'>('Travel');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'Cash' | 'Transfer' | 'Credit Card'>('Cash');
  const [expDescription, setExpDescription] = useState('');
  const [expAdvRef, setExpAdvRef] = useState('');
  const [expReceiptUrl, setExpReceiptUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter personal documents
  const myAdvs = advDocs.filter(d => d.requester_id === currentUser.user_id);
  const myExps = expDocs.filter(d => d.requester_id === currentUser.user_id);

  // Filter paid ADV documents that are eligible for reference (Paid or Pending Refund)
  const eligibleAdvs = myAdvs.filter(d => d.status === 'Paid' || d.status === 'Pending Refund');

  // Trigger Mock OCR Scan
  const handleOcrScan = (template: OCRMockTemplate) => {
    setSelectedReceiptTemplate(template);
    setIsOcrScanning(true);
    setFormError(null);

    setTimeout(() => {
      setIsOcrScanning(false);
      setExpAmount(template.detectedAmount.toString());
      setExpDate(template.detectedDate);
      setExpSupplier(template.detectedSupplier);
      setExpCategory(template.detectedCategory);
      setExpReceiptUrl(template.imageUrl);
    }, 1500); // simulate 1.5s scanning
  };

  const handleCreateADVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advAmount || isNaN(Number(advAmount)) || Number(advAmount) <= 0) {
      alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }
    if (!advPurpose.trim()) {
      alert('กรุณากรอกวัตถุประสงค์การขอเงิน');
      return;
    }

    onCreateADV({
      request_date: new Date().toISOString().split('T')[0],
      amount: Number(advAmount),
      purpose: advPurpose,
      status: 'Pending Approval'
    });

    // Reset Form
    setAdvAmount('');
    setAdvPurpose('');
    setActiveTab('list');
  };

  const handleCreateEXPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!expAmount || isNaN(Number(expAmount)) || Number(expAmount) <= 0) {
      setFormError('กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }
    if (!expDate) {
      setFormError('กรุณาเลือกวันที่ตามใบเสร็จ');
      return;
    }
    if (!expSupplier.trim()) {
      setFormError('กรุณากรอกชื่อร้านค้า/ผู้ให้บริการ');
      return;
    }
    if (!expReceiptUrl) {
      setFormError('กรุณาอัปโหลดรูปภาพใบเสร็จหรือใช้ระบบสแกน OCR');
      return;
    }

    // Call creation logic with validation
    const errorMsg = onCreateEXP({
      advance_ref: expAdvRef || undefined,
      receipt_date: expDate,
      amount: Number(expAmount),
      category: expCategory,
      payment_method: expPaymentMethod,
      receipt_image_url: expReceiptUrl,
      description: expDescription,
      status: 'Pending Approval'
    });

    if (errorMsg) {
      setFormError(errorMsg);
    } else {
      // Success
      setExpAmount('');
      setExpDate('');
      setExpSupplier('');
      setExpCategory('Travel');
      setExpPaymentMethod('Cash');
      setExpDescription('');
      setExpAdvRef('');
      setExpReceiptUrl('');
      setSelectedReceiptTemplate(null);
      setActiveTab('list');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">ร่างเอกสาร</span>;
      case 'Pending Approval':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">รออนุมัติ</span>;
      case 'Approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">อนุมัติแล้ว</span>;
      case 'Paid':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">จ่ายเงินแล้ว</span>;
      case 'Pending Refund':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">รอคืนเงินทอน</span>;
      case 'Settled':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">เคลียร์สมบูรณ์</span>;
      case 'Rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">ถูกปฏิเสธ</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คำขอของฉัน (My Requests)</h1>
          <p className="text-sm text-gray-500">
            พนักงาน: <span className="font-semibold text-indigo-600">{currentUser.full_name}</span> ({currentUser.department})
          </p>
        </div>

        {activeTab === 'list' && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('create-adv')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-xs transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              ขอเงินทดรองจ่าย (ADV)
            </button>
            <button
              onClick={() => setActiveTab('create-exp')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-xs transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              เบิกค่าใช้จ่าย (EXP)
            </button>
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Cash Advance History */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                ประวัติการขอเงินทดรองจ่าย (Cash Advance)
              </h3>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {myAdvs.length} รายการ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                    <th className="py-3 px-4">เลขที่</th>
                    <th className="py-3 px-4">วันที่ขอ</th>
                    <th className="py-3 px-4">ยอดเงิน</th>
                    <th className="py-3 px-4">วัตถุประสงค์</th>
                    <th className="py-3 px-4 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  {myAdvs.length > 0 ? (
                    myAdvs.map((adv) => (
                      <tr key={adv.document_no} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-indigo-600">{adv.document_no}</td>
                        <td className="py-3.5 px-4 text-gray-500">{adv.request_date}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">฿{adv.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-[150px] truncate" title={adv.purpose}>
                          {adv.purpose}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(adv.status)}
                            {adv.reject_reason && (
                              <span className="text-[10px] text-red-500 max-w-[120px] truncate" title={adv.reject_reason}>
                                เหตุผล: {adv.reject_reason}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                        ไม่มีประวัติการขอเงินทดรองจ่าย
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Expense Claim History */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-indigo-50/30 flex items-center justify-between">
              <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                ประวัติการเบิกค่าใช้จ่าย (Expense Claim)
              </h3>
              <span className="text-xs font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                {myExps.length} รายการ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                    <th className="py-3 px-4">เลขที่</th>
                    <th className="py-3 px-4">วันที่ใบเสร็จ</th>
                    <th className="py-3 px-4">ร้านค้า/ยอดเงิน</th>
                    <th className="py-3 px-4">หมวดหมู่/อ้างอิง ADV</th>
                    <th className="py-3 px-4 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  {myExps.length > 0 ? (
                    myExps.map((exp) => (
                      <tr key={exp.document_no} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-indigo-600">{exp.document_no}</td>
                        <td className="py-3.5 px-4 text-gray-500">{exp.receipt_date}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">฿{exp.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px]">{exp.supplier_name}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded-sm font-medium mb-1">
                            {exp.category === 'Travel' ? 'ค่าเดินทาง' : exp.category === 'Entertainment' ? 'ค่ารับรอง' : exp.category === 'Office Supplies' ? 'ค่าอุปกรณ์' : exp.category === 'SaaS/Software' ? 'ซอฟต์แวร์' : 'อื่นๆ'}
                          </span>
                          {exp.advance_ref && (
                            <div className="text-[10px] text-amber-600 font-mono">Ref: {exp.advance_ref}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(exp.status)}
                            {exp.reject_reason && (
                              <span className="text-[10px] text-red-500 max-w-[120px] truncate" title={exp.reject_reason}>
                                เหตุผล: {exp.reject_reason}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                        ไม่มีประวัติการเบิกค่าใช้จ่าย
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Form: Create Cash Advance */}
      {activeTab === 'create-adv' && (
        <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-amber-50/40">
            <h3 className="text-lg font-bold text-gray-900">ขอเงินทดรองจ่ายใบใหม่ (Cash Advance Form)</h3>
            <p className="text-xs text-gray-500 mt-1">กรอกรายละเอียดเพื่อขออนุมัติเบิกเงินล่วงหน้าสำหรับการดำเนินงาน</p>
          </div>

          <form onSubmit={handleCreateADVSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงินที่ต้องการขอ (บาท) *</label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">฿</span>
                </div>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={advAmount}
                  onChange={(e) => setAdvAmount(e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วัตถุประสงค์การขอเงิน *</label>
              <textarea
                required
                rows={3}
                placeholder="ระบุรายละเอียด เช่น ค่าเดินทางไปพบลูกค้า, ค่าจัดซื้อของจัดงานสัมมนากลางเดือน..."
                value={advPurpose}
                onChange={(e) => setAdvPurpose(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">เงื่อนไขและข้อมูลประกอบ:</p>
              <p>• รันเลขที่เอกสารอัตโนมัติในรูปแบบ ADV-2026-XXXXX</p>
              <p>• ขั้นตอนการอนุมัติ: หัวหน้าแผนก ({currentUser.department}) → ฝ่ายบัญชี</p>
              <p>• ผู้ขอเบิก: {currentUser.full_name} (แผนก {currentUser.department})</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-md shadow-xs transition-colors"
              >
                ส่งขออนุมัติ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form: Create Expense Claim with OCR Simulation */}
      {activeTab === 'create-exp' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: OCR Scanner Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  สแกนใบเสร็จด้วย OCR อัจฉริยะ
                </h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  ดึงข้อมูล 3 ฟิลด์อัตโนมัติ
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                จำลองการถ่ายรูปหรืออัปโหลดใบเสร็จในเวอร์ชันมือถือ โดยเลือกตัวอย่างใบเสร็จด้านล่างเพื่อทดสอบระบบดึงข้อมูลอัตโนมัติ
              </p>

              {/* Receipt Templates Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {OCR_MOCK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => handleOcrScan(tpl)}
                    className="p-2 border border-gray-200 hover:border-indigo-500 rounded-lg text-left transition-all hover:bg-indigo-50/20 group"
                  >
                    <div className="h-20 bg-gray-100 rounded-md mb-1.5 overflow-hidden relative">
                      <img
                        src={tpl.imageUrl}
                        alt={tpl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] bg-white text-gray-800 px-2 py-0.5 rounded font-bold shadow-xs">คลิกเพื่อสแกน</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{tpl.name}</p>
                    <p className="text-[10px] text-indigo-600 font-bold">฿{tpl.detectedAmount.toLocaleString()}</p>
                  </button>
                ))}
              </div>

              {/* Selected Receipt Preview / Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 relative overflow-hidden">
                {isOcrScanning ? (
                  <div className="py-8 flex flex-col items-center justify-center space-y-2">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-indigo-600 animate-pulse">ระบบ OCR กำลังประมวลผลใบเสร็จ...</span>
                    <span className="text-[10px] text-gray-400">ดึงข้อมูลวันที่, ยอดรวม และร้านค้า</span>
                  </div>
                ) : selectedReceiptTemplate ? (
                  <div className="space-y-2">
                    <div className="h-32 bg-gray-100 rounded-md overflow-hidden relative">
                      <img
                        src={selectedReceiptTemplate.imageUrl}
                        alt="Receipt"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReceiptTemplate(null);
                          setExpReceiptUrl('');
                        }}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-left bg-indigo-50 p-2.5 rounded-md text-[11px] space-y-1">
                      <p className="font-bold text-indigo-900">✓ ผลลัพธ์การสแกนสำเร็จ:</p>
                      <p>• ร้านค้า: <span className="font-semibold">{selectedReceiptTemplate.detectedSupplier}</span></p>
                      <p>• วันที่: <span className="font-semibold">{selectedReceiptTemplate.detectedDate}</span></p>
                      <p>• ยอดเงินรวม: <span className="font-semibold text-indigo-700">฿{selectedReceiptTemplate.detectedAmount.toLocaleString()}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs font-medium text-gray-600 block">ไม่มีรูปใบเสร็จที่อัปโหลด</span>
                    <span className="text-[10px] text-gray-400 block mt-1">เลือกตัวอย่างใบเสร็จด้านบนเพื่อจำลองการสแกนด้วย OCR</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Expense Claim Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-indigo-50/30">
                <h3 className="text-lg font-bold text-gray-900">บันทึกใบเบิกค่าใช้จ่าย (Expense Claim Form)</h3>
                <p className="text-xs text-gray-500 mt-1">กรอกรายละเอียดเพิ่มเติม หรือตรวจสอบข้อมูลที่ได้จากการสแกน OCR</p>
              </div>

              <form onSubmit={handleCreateEXPSubmit} className="p-5 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">ไม่สามารถบันทึกได้:</p>
                      <p>{formError}</p>
                    </div>
                  </div>
                )}

                {/* ADV Reference Selection */}
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                    อ้างอิงใบขอเงินทดรองจ่าย (Cash Advance Ref) - ถ้ามี
                  </label>
                  <select
                    value={expAdvRef}
                    onChange={(e) => {
                      setExpAdvRef(e.target.value);
                      setFormError(null);
                    }}
                    className="block w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-amber-50/20"
                  >
                    <option value="">-- ไม่ระบุ (เบิกค่าใช้จ่ายปกติ ไม่ได้ใช้เงินทดรองจ่าย) --</option>
                    {eligibleAdvs.map((adv) => (
                      <option key={adv.document_no} value={adv.document_no}>
                        {adv.document_no} - ยอด ฿{adv.amount.toLocaleString()} ({adv.purpose})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    * หากเลือกอ้างอิง ADV ระบบจะทำการหักลบยอดเงินให้อัตโนมัติและเปลี่ยนสถานะเป็นเคลียร์เงินทอน
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ยอดเงินรวม (บาท) *</label>
                    <div className="relative rounded-md shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">฿</span>
                      </div>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={expAmount}
                        onChange={(e) => {
                          setExpAmount(e.target.value);
                          setFormError(null);
                        }}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ตามใบเสร็จ *</label>
                    <input
                      type="date"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supplier Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้านค้า / Supplier *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น บจก. เอสซีจี, Grab, เสนอแนะร้านค้า"
                      value={expSupplier}
                      onChange={(e) => setExpSupplier(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ค่าใช้จ่าย *</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as any)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="Travel">ค่าเดินทาง (Travel)</option>
                      <option value="Entertainment">ค่ารับรอง (Entertainment)</option>
                      <option value="Office Supplies">ค่าอุปกรณ์สำนักงาน (Office Supplies)</option>
                      <option value="SaaS/Software">ค่าซอฟต์แวร์/SaaS (SaaS/Software)</option>
                      <option value="Others">อื่นๆ (Others)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วิธีการชำระเงิน *</label>
                    <select
                      value={expPaymentMethod}
                      onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="Cash">เงินสด (Cash)</option>
                      <option value="Transfer">โอนเงิน (Transfer)</option>
                      <option value="Credit Card">บัตรเครดิตบริษัท/ส่วนตัว (Credit Card)</option>
                    </select>
                  </div>

                  {/* Hidden/Helper Receipt Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพใบเสร็จ (URL) *</label>
                    <input
                      type="text"
                      required
                      placeholder="คลิกเลือกสแกนใบเสร็จด้านซ้ายเพื่อดึงรูปภาพอัตโนมัติ"
                      value={expReceiptUrl}
                      onChange={(e) => setExpReceiptUrl(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายเพิ่มเติม (เลือกกรอก)</label>
                  <textarea
                    rows={2}
                    placeholder="ระบุเหตุผลความจำเป็นในการเบิก หรือรายละเอียดโครงการ..."
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('list');
                      setSelectedReceiptTemplate(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-xs transition-colors"
                  >
                    ส่งขออนุมัติเบิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}