import { useState } from 'react';
import { User, CashAdvanceDoc, ExpenseClaimDoc } from '../types';
import { Download, CheckCircle, RefreshCw, Filter, FileSpreadsheet, DollarSign, Calendar, Search } from 'lucide-react';

interface FinanceViewProps {
  currentUser: User;
  advDocs: CashAdvanceDoc[];
  expDocs: ExpenseClaimDoc[];
  onMarkADVPaid: (docNo: string) => void;
  onConfirmADVRefund: (docNo: string) => void;
  onMarkEXPPaid: (docNo: string) => void;
}

export default function FinanceView({
  currentUser,
  advDocs,
  expDocs,
  onMarkADVPaid,
  onConfirmADVRefund,
  onMarkEXPPaid
}: FinanceViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');

  // Filter approved documents that need action, and also show settled/paid for export
  const filteredAdvs = advDocs.filter(d => {
    const matchesSearch = d.document_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.requester_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesDate = d.request_date >= dateFrom && d.request_date <= dateTo;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredExps = expDocs.filter(d => {
    const matchesSearch = d.document_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesDate = d.receipt_date >= dateFrom && d.receipt_date <= dateTo;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export to CSV simulation
  const handleExportCSV = () => {
    // Build CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Document No,Type,Requester,Department,Date,Amount,Status,Ref/Supplier,Detail\n";

    filteredAdvs.forEach(d => {
      csvContent += `${d.document_no},ADV,${d.requester_name},${d.department},${d.request_date},${d.amount},${d.status},-,${d.purpose.replace(/,/g, ' ')}\n`;
    });

    filteredExps.forEach(d => {
      csvContent += `${d.document_no},EXP,${d.requester_name},${d.department},${d.receipt_date},${d.amount},${d.status},${d.supplier_name.replace(/,/g, ' ')},${(d.description || '').replace(/,/g, ' ')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ExpenseFlow_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("ส่งออกไฟล์ CSV สำเร็จ! ข้อมูลพร้อมสำหรับนำไปอัปโหลดเข้าสู่ ERP ภายนอกเรียบร้อยแล้ว (Zero Double-Entry)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการและทำจ่ายเงิน (Finance Settlement)</h1>
          <p className="text-sm text-gray-500">
            ฝ่ายบัญชี: <span className="font-semibold text-indigo-600">{currentUser.full_name}</span> | บันทึกการทำจ่ายเงินสด/โอนเงินคืน และส่งออกข้อมูล ERP
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-xs transition-colors text-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          ส่งออกข้อมูลบัญชี (Export CSV)
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ค้นหาเอกสาร / พนักงาน</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="รหัสเอกสาร, ชื่อพนักงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">สถานะเอกสาร</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">ทั้งหมด</option>
            <option value="Approved">อนุมัติแล้ว (รอจ่ายเงิน)</option>
            <option value="Paid">ทำจ่ายแล้ว</option>
            <option value="Pending Refund">รอรับเงินคืน (เงินทอน)</option>
            <option value="Settled">เคลียร์สมบูรณ์แล้ว</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">จากวันที่</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ถึงวันที่</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Action Tables */}
      <div className="grid grid-cols-1 gap-6">
        {/* Cash Advances Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-amber-50/30 flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              จัดการเงินทดรองจ่าย (Cash Advance Process)
            </h3>
            <span className="text-xs text-gray-500">แสดงรายการที่ได้รับการอนุมัติแล้วหรือรอรับเงินคืน</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                  <th className="py-3 px-5">เลขที่เอกสาร</th>
                  <th className="py-3 px-5">ผู้ขอเบิก</th>
                  <th className="py-3 px-5">แผนก</th>
                  <th className="py-3 px-5">วันที่ขอ</th>
                  <th className="py-3 px-5">จำนวนเงิน</th>
                  <th className="py-3 px-5">วัตถุประสงค์</th>
                  <th className="py-3 px-5">สถานะ</th>
                  <th className="py-3 px-5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredAdvs.length > 0 ? (
                  filteredAdvs.map((adv) => (
                    <tr key={adv.document_no} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-indigo-600">{adv.document_no}</td>
                      <td className="py-3.5 px-5 font-medium text-gray-900">{adv.requester_name}</td>
                      <td className="py-3.5 px-5 text-gray-600">{adv.department}</td>
                      <td className="py-3.5 px-5 text-gray-500">{adv.request_date}</td>
                      <td className="py-3.5 px-5 font-semibold text-gray-900">฿{adv.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-5 text-gray-500 max-w-xs truncate">{adv.purpose}</td>
                      <td className="py-3.5 px-5">
                        {adv.status === 'Approved' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            อนุมัติแล้ว (รอทำจ่าย)
                          </span>
                        )}
                        {adv.status === 'Paid' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ทำจ่ายแล้ว
                          </span>
                        )}
                        {adv.status === 'Pending Refund' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 animate-pulse">
                            รอรับเงินคืน (เงินทอน)
                          </span>
                        )}
                        {adv.status === 'Settled' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            เคลียร์สมบูรณ์
                          </span>
                        )}
                        {adv.status === 'Rejected' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            ปฏิเสธ
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {adv.status === 'Approved' && (
                          <button
                            onClick={() => onMarkADVPaid(adv.document_no)}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            บันทึกการทำจ่าย
                          </button>
                        )}
                        {adv.status === 'Pending Refund' && (
                          <button
                            onClick={() => onConfirmADVRefund(adv.document_no)}
                            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                            ยืนยันรับเงินทอนคืน
                          </button>
                        )}
                        {adv.status === 'Paid' && (
                          <span className="text-xs text-gray-400 font-medium">จ่ายแล้วเมื่อ {adv.paid_date}</span>
                        )}
                        {adv.status === 'Settled' && (
                          <span className="text-xs text-emerald-600 font-bold">เคลียร์สำเร็จเรียบร้อย</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      ไม่พบรายการขอเงินทดรองจ่ายตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Claims Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-indigo-50/20 flex items-center justify-between">
            <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              จัดการเคลมค่าใช้จ่าย (Expense Claim Settlement)
            </h3>
            <span className="text-xs text-gray-500">บันทึกการทำจ่ายเงินคืนให้พนักงานตามใบเสร็จจริง</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                  <th className="py-3 px-5">เลขที่เอกสาร</th>
                  <th className="py-3 px-5">ผู้เบิก</th>
                  <th className="py-3 px-5">ร้านค้า / รายละเอียด</th>
                  <th className="py-3 px-5">วันที่ใบเสร็จ</th>
                  <th className="py-3 px-5">จำนวนเงิน</th>
                  <th className="py-3 px-5">หมวดหมู่ / วิธีจ่าย</th>
                  <th className="py-3 px-5">อ้างอิง ADV</th>
                  <th className="py-3 px-5">สถานะ</th>
                  <th className="py-3 px-5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredExps.length > 0 ? (
                  filteredExps.map((exp) => (
                    <tr key={exp.document_no} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-indigo-600">{exp.document_no}</td>
                      <td className="py-3.5 px-5 font-medium text-gray-900">{exp.requester_name}</td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-gray-800">{exp.supplier_name}</div>
                        <div className="text-xs text-gray-400 max-w-xs truncate">{exp.description}</div>
                      </td>
                      <td className="py-3.5 px-5 text-gray-500">{exp.receipt_date}</td>
                      <td className="py-3.5 px-5 font-bold text-gray-900">฿{exp.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-5">
                        <div className="text-xs font-semibold text-gray-700">
                          {exp.category === 'Travel' ? 'ค่าเดินทาง' : exp.category === 'Entertainment' ? 'ค่ารับรอง' : exp.category === 'Office Supplies' ? 'ค่าอุปกรณ์' : exp.category === 'SaaS/Software' ? 'ซอฟต์แวร์' : 'อื่นๆ'}
                        </div>
                        <div className="text-[10px] text-gray-400">{exp.payment_method}</div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-amber-600 font-bold">
                        {exp.advance_ref || '-'}
                      </td>
                      <td className="py-3.5 px-5">
                        {exp.status === 'Approved' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            อนุมัติแล้ว (รอจ่าย)
                          </span>
                        )}
                        {exp.status === 'Paid' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            จ่ายเงินแล้ว
                          </span>
                        )}
                        {exp.status === 'Pending Approval' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            รออนุมัติ
                          </span>
                        )}
                        {exp.status === 'Rejected' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            ปฏิเสธ
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {exp.status === 'Approved' && (
                          <button
                            onClick={() => onMarkEXPPaid(exp.document_no)}
                            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            ทำจ่ายเงินคืน
                          </button>
                        )}
                        {exp.status === 'Paid' && (
                          <span className="text-xs text-gray-400 font-medium">ทำจ่ายสำเร็จแล้ว</span>
                        )}
                        {exp.status === 'Pending Approval' && (
                          <span className="text-xs text-amber-600 font-medium">รอหัวหน้าอนุมัติก่อน</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      ไม่พบรายการเคลมค่าใช้จ่ายตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}