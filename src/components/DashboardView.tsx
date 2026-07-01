import { useState } from 'react';
import { CashAdvanceDoc, ExpenseClaimDoc } from '../types';
import { TrendingUp, Wallet, AlertTriangle, CheckCircle2, DollarSign, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface DashboardViewProps {
  advDocs: CashAdvanceDoc[];
  expDocs: ExpenseClaimDoc[];
}

export default function DashboardView({ advDocs, expDocs }: DashboardViewProps) {
  // Calculations
  const totalPaidExpenses = expDocs
    .filter(d => d.status === 'Paid')
    .reduce((sum, d) => sum + d.amount, 0);

  // Active Advance = Paid ADV that is not Settled yet
  const activeAdvances = advDocs
    .filter(d => d.status === 'Paid' || d.status === 'Pending Refund')
    .reduce((sum, d) => {
      // Calculate outstanding amount. If Pending Refund, we expect some money back, but currently the full amount is outstanding until settled
      // Or we can subtract the matching EXP if any, but to keep it simple and robust:
      // Outstanding = ADV amount - (matching approved/paid EXP amount)
      const matchingExps = expDocs
        .filter(e => e.advance_ref === d.document_no && (e.status === 'Paid' || e.status === 'Approved'))
        .reduce((s, e) => s + e.amount, 0);
      return sum + Math.max(0, d.amount - matchingExps);
    }, 0);

  const pendingApprovalCount = advDocs.filter(d => d.status === 'Pending Approval').length +
                               expDocs.filter(d => d.status === 'Pending Approval').length;

  const pendingApprovalAmount = advDocs.filter(d => d.status === 'Pending Approval').reduce((sum, d) => sum + d.amount, 0) +
                                expDocs.filter(d => d.status === 'Pending Approval').reduce((sum, d) => sum + d.amount, 0);

  // Pie Chart: Expenses by Category (Paid and Approved only)
  const validExpenses = expDocs.filter(d => d.status === 'Paid' || d.status === 'Approved');
  
  const categoriesMap: { [key: string]: number } = {
    'Travel': 0,
    'Entertainment': 0,
    'Office Supplies': 0,
    'SaaS/Software': 0,
    'Others': 0,
  };

  const categoryThaiNames: { [key: string]: string } = {
    'Travel': 'ค่าเดินทาง',
    'Entertainment': 'ค่ารับรอง',
    'Office Supplies': 'ค่าอุปกรณ์สำนักงาน',
    'SaaS/Software': 'ค่าซอฟต์แวร์/SaaS',
    'Others': 'อื่นๆ'
  };

  validExpenses.forEach(d => {
    if (categoriesMap[d.category] !== undefined) {
      categoriesMap[d.category] += d.amount;
    } else {
      categoriesMap['Others'] += d.amount;
    }
  });

  const categoryData = Object.keys(categoriesMap)
    .map(key => ({
      name: categoryThaiNames[key] || key,
      value: categoriesMap[key]
    }))
    .filter(item => item.value > 0);

  // Pie Chart: Expenses by Department (Paid and Approved only)
  const deptsMap: { [key: string]: number } = {
    'Management': 0,
    'Consulting': 0,
    'Delivery': 0
  };

  validExpenses.forEach(d => {
    if (deptsMap[d.department] !== undefined) {
      deptsMap[d.department] += d.amount;
    }
  });

  const deptData = Object.keys(deptsMap).map(key => ({
    name: key === 'Management' ? 'บริหาร (Management)' : key === 'Consulting' ? 'ที่ปรึกษา (Consulting)' : 'ส่งมอบงาน (Delivery)',
    value: deptsMap[key]
  })).filter(item => item.value > 0);

  // Bar Chart: Comparison of Monthly Budget/Spend (Mocked for 2026)
  const monthlyData = [
    { month: 'ม.ค.', 'งบประมาณ': 120000, 'ใช้จ่ายจริง': 95000 },
    { month: 'ก.พ.', 'งบประมาณ': 120000, 'ใช้จ่ายจริง': 112000 },
    { month: 'มี.ค.', 'งบประมาณ': 150000, 'ใช้จ่ายจริง': totalPaidExpenses + 25000 }, // Dynamic based on current state
  ];

  // Aging Report: Employees holding cash advances for more than 15 days
  // For demo, we mock the calculation or filter based on ADV-2026-00005 which was paid on 2026-02-05 (over 15 days ago)
  // Let's calculate dynamically: any ADV in 'Paid' status created before 2026-03-01 (assuming current date is mid-March 2026)
  const outstandingAdvances = advDocs.filter(d => {
    if (d.status !== 'Paid') return false;
    const reqDate = new Date(d.request_date);
    const cutOffDate = new Date('2026-03-01'); // Mid March reference
    return reqDate < cutOffDate;
  });

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แผงควบคุมหลัก (Dashboard)</h1>
          <p className="text-sm text-gray-500">ข้อมูลสรุปแบบ Real-time ของค่าใช้จ่ายและเงินทดรองจ่ายภายใน Digitalvalue</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-xs text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>ข้อมูล ณ วันที่ 15 มีนาคม 2026</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ค่าใช้จ่ายที่จ่ายแล้วสะสม</span>
            <h3 className="text-2xl font-bold text-gray-900">฿{totalPaidExpenses.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12.4% เทียบกับเดือนก่อน</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">เงินทดรองจ่ายค้างเคลียร์ (Active)</span>
            <h3 className="text-2xl font-bold text-amber-600">฿{activeAdvances.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>รอพนักงานส่งใบเบิกมาหักล้าง</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">รายการรออนุมัติสะสม</span>
            <h3 className="text-2xl font-bold text-blue-600">{pendingApprovalCount} รายการ</h3>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <span>มูลค่ารวม ฿{pendingApprovalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">อัตราการเคลียร์เอกสาร</span>
            <h3 className="text-2xl font-bold text-emerald-600">92.5%</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>เป้าหมายระยะสั้นสำเร็จ</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs lg:col-span-1">
          <h3 className="text-base font-bold text-gray-900 mb-4">สัดส่วนค่าใช้จ่ายตามหมวดหมู่</h3>
          {categoryData.length > 0 ? (
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400">ค่าใช้จ่ายรวม</span>
                <span className="text-lg font-bold text-gray-800">฿{totalPaidExpenses.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูลค่าใช้จ่ายที่ได้รับการอนุมัติ</div>
          )}
          {/* Legend */}
          <div className="mt-2 space-y-1.5">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">฿{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs lg:col-span-1">
          <h3 className="text-base font-bold text-gray-900 mb-4">สัดส่วนค่าใช้จ่ายตามศูนย์ต้นทุน (แผนก)</h3>
          {deptData.length > 0 ? (
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400">3 แผนกหลัก</span>
                <span className="text-sm font-bold text-gray-700">Digitalvalue</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูลแผนก</div>
          )}
          {/* Legend */}
          <div className="mt-2 space-y-1.5">
            {deptData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">฿{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Budget vs Spend */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs lg:col-span-1">
          <h3 className="text-base font-bold text-gray-900 mb-4">เปรียบเทียบงบประมาณ vs ใช้จ่ายจริง (Q1 2026)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                <Legend iconSize={10} iconType="circle" />
                <Bar dataKey="งบประมาณ" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ใช้จ่ายจริง" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
            <span className="font-bold">สรุป:</span>
            <span>ในเดือน มี.ค. อัตราการใช้จ่ายอยู่ในเกณฑ์ควบคุมได้ดี ไม่เกินเป้าหมายงบประมาณที่กำหนดไว้ ฿150,000</span>
          </div>
        </div>
      </div>

      {/* Aging Report for Outstanding Cash Advances */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">รายงานเงินทดรองจ่ายค้างเคลียร์ (Outstanding Cash Advance Aging)</h3>
            <p className="text-xs text-gray-500 mt-1">รายชื่อพนักงานที่เบิกเงินล่วงหน้าและยังไม่ได้ส่งใบเคลียร์ค่าใช้จ่ายคืนบริษัท (ค้างเกิน 15 วัน)</p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
            ต้องติดตาม {outstandingAdvances.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                <th className="py-3 px-5">เลขที่เอกสาร</th>
                <th className="py-3 px-5">ผู้ขอเบิก</th>
                <th className="py-3 px-5">แผนก</th>
                <th className="py-3 px-5">วันที่รับเงิน</th>
                <th className="py-3 px-5">จำนวนเงิน</th>
                <th className="py-3 px-5">วัตถุประสงค์</th>
                <th className="py-3 px-5">ระยะเวลาค้าง</th>
                <th className="py-3 px-5 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {outstandingAdvances.length > 0 ? (
                outstandingAdvances.map((adv) => {
                  // Calculate days since paid_date (assuming current date is 2026-03-15)
                  const paid = new Date(adv.paid_date || adv.request_date);
                  const now = new Date('2026-03-15');
                  const diffTime = Math.abs(now.getTime() - paid.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={adv.document_no} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-indigo-600">{adv.document_no}</td>
                      <td className="py-3.5 px-5 font-medium text-gray-900">{adv.requester_name}</td>
                      <td className="py-3.5 px-5 text-gray-600">
                        {adv.department === 'Consulting' ? 'ที่ปรึกษา' : adv.department === 'Delivery' ? 'ส่งมอบงาน' : 'บริหาร'}
                      </td>
                      <td className="py-3.5 px-5 text-gray-600">{adv.paid_date || adv.request_date}</td>
                      <td className="py-3.5 px-5 font-semibold text-gray-900">฿{adv.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-5 text-gray-500 max-w-xs truncate">{adv.purpose}</td>
                      <td className="py-3.5 px-5">
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {diffDays} วัน
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                          ค้างเคลียร์เงินทอน/ใบเสร็จ
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    ไม่มีพนักงานที่มีเงินทดรองจ่ายค้างเกินกำหนดในขณะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
          <span>* นโยบายบริษัท: พนักงานต้องส่งใบเคลียร์ค่าใช้จ่ายภายใน 15 วันหลังจากได้รับเงินทดรองจ่าย</span>
          <span className="font-medium text-indigo-600">Digitalvalue Just-in-Time Policy</span>
        </div>
      </div>
    </div>
  );
}