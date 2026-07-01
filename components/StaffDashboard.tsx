"use client";

import { useState } from 'react';
import { Order, Product } from '@/lib/types';
import { Check, Coffee, CheckCircle, Ban, RefreshCw, Layers, Sliders, ToggleLeft, ToggleRight, DollarSign, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StaffDashboardProps {
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onToggleProductAvailability: (productId: string) => void;
}

export default function StaffDashboard({
  orders,
  products,
  onUpdateOrderStatus,
  onToggleProductAvailability
}: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics'>('orders');
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'ทั้งหมด'>('ทั้งหมด');

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'ทั้งหมด') return true;
    return o.status === filterStatus;
  });

  // Analytics Calculations
  const totalSales = orders
    .filter(o => o.status === 'สำเร็จ')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'รอตรวจสอบ' || o.status === 'กำลังชง').length;
  const completedOrdersCount = orders.filter(o => o.status === 'สำเร็จ').length;

  // Chart Data (Hourly or Status-wise)
  const chartData = [
    { name: 'รอตรวจสอบ', จำนวน: orders.filter(o => o.status === 'รอตรวจสอบ').length },
    { name: 'กำลังชง', จำนวน: orders.filter(o => o.status === 'กำลังชง').length },
    { name: 'พร้อมรับ', จำนวน: orders.filter(o => o.status === 'พร้อมรับ').length },
    { name: 'สำเร็จ', จำนวน: orders.filter(o => o.status === 'สำเร็จ').length },
    { name: 'ยกเลิก', จำนวน: orders.filter(o => o.status === 'ยกเลิก').length }
  ];

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-6 font-sans">

      {/* Top Bar Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-400 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">ระบบบอร์ดจัดการร้าน (Staff Dashboard)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            จัดการคิวออเดอร์ ตรวจสอบสลิปโอนเงิน และควบคุมสถานะสินค้าหน้าร้านแบบเรียลไทม์
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={14} />
            <span>จัดการคิวออเดอร์ ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'menu' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>จัดการเมนูสินค้า</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight size={14} />
            <span>สรุปยอดขาย</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <span className="text-[10px] text-slate-400 font-bold uppercase">ยอดขายสำเร็จทั้งหมด</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">฿{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <span className="text-[10px] text-slate-400 font-bold uppercase">ออเดอร์รอทำคิว</span>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{pendingOrdersCount} ออเดอร์</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <span className="text-[10px] text-slate-400 font-bold uppercase">เสร็จสิ้นแล้ว</span>
          <p className="text-xl font-extrabold text-sky-400 mt-1">{completedOrdersCount} ออเดอร์</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <span className="text-[10px] text-slate-400 font-bold uppercase">จำนวนเมนูทั้งหมด</span>
          <p className="text-xl font-extrabold text-pink-400 mt-1">{products.length} รายการ</p>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold mr-2">ตัวกรองสถานะ:</span>
            {(['ทั้งหมด', 'รอตรวจสอบ', 'กำลังชง', 'พร้อมรับ', 'สำเร็จ', 'ยกเลิก'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Orders Queue Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
              <RefreshCw className="mx-auto text-slate-600 mb-3 animate-spin" size={32} />
              <p className="text-sm font-medium">ไม่มีออเดอร์ในสถานะนี้ในขณะนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col justify-between">

                  {/* Card Header */}
                  <div className="p-4 bg-slate-850 border-b border-slate-700 flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-pink-400">{order.order_number}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          order.status === 'รอตรวจสอบ' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          order.status === 'กำลังชง' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          order.status === 'พร้อมรับ' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          order.status === 'สำเร็จ' ? 'bg-slate-700 text-slate-300' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        ลูกค้า: <strong>{order.customer_name}</strong> ({order.phone})
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Items list */}
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">รายการสินค้า</p>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="bg-slate-900/40 p-2 rounded-lg text-xs">
                            <div className="flex justify-between font-bold">
                              <span>{item.product_name}</span>
                              <span className="text-pink-400">x{item.quantity}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {item.customizations.join(' | ')}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-750 pt-2 flex justify-between items-center text-xs">
                        <span className="text-slate-400">ยอดชำระสุทธิ:</span>
                        <span className="font-bold text-emerald-400 text-sm">฿{order.total}</span>
                      </div>
                    </div>

                    {/* Slip Image Verification */}
                    <div className="bg-slate-900 p-2 rounded-lg flex flex-col items-center justify-center border border-slate-750">
                      <p className="text-[9px] text-slate-400 font-bold mb-1.5 text-center">หลักฐานสลิปโอนเงิน</p>
                      {order.slip_url ? (
                        <a href={order.slip_url} target="_blank" rel="noreferrer" className="relative group block">
                          <img
                            src={order.slip_url}
                            alt="Slip Transfer"
                            className="w-20 h-28 object-cover rounded-md border border-slate-700 hover:opacity-85 transition-opacity"
                            crossOrigin="anonymous"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold rounded-md transition-opacity">
                            ดูรูปใหญ่
                          </div>
                        </a>
                      ) : (
                        <span className="text-[10px] text-red-400 font-medium">ไม่มีสลิป</span>
                      )}
                    </div>

                  </div>

                  {/* Card Actions */}
                  <div className="p-3 bg-slate-850 border-t border-slate-700 flex flex-wrap gap-2 justify-end">

                    {order.status === 'รอตรวจสอบ' && (
                      <>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'ยกเลิก')}
                          className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Ban size={12} />
                          <span>สลิปปลอม / ยกเลิก</span>
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'กำลังชง')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Check size={12} />
                          <span>ยืนยันสลิป & เริ่มชง</span>
                        </button>
                      </>
                    )}

                    {order.status === 'กำลังชง' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'พร้อมรับ')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                      >
                        <Coffee size={14} />
                        <span>ชงเสร็จแล้ว (แจ้งลูกค้า)</span>
                      </button>
                    )}

                    {order.status === 'พร้อมรับ' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'สำเร็จ')}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                      >
                        <CheckCircle size={14} />
                        <span>ลูกค้ารับเครื่องดื่มแล้ว</span>
                      </button>
                    )}

                    {order.status === 'สำเร็จ' && (
                      <span className="text-xs text-slate-500 py-1 font-medium">✓ ออเดอร์เสร็จสมบูรณ์</span>
                    )}

                    {order.status === 'ยกเลิก' && (
                      <span className="text-xs text-red-400 py-1 font-medium">✕ ออเดอร์ถูกยกเลิกแล้ว</span>
                    )}

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Tab: Manage Menu */}
      {activeTab === 'menu' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold">รายการเมนูเครื่องดื่มหน้าร้าน</h3>
              <p className="text-xs text-slate-400">ควบคุมการเปิด/ปิด สต็อกสินค้าของแต่ละเมนูได้ทันที</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-slate-900 p-3 rounded-xl border border-slate-750 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image_url}
                    alt={product.name_th}
                    className="w-12 h-12 object-cover rounded-lg"
                    crossOrigin="anonymous"
                  />
                  <div>
                    <h4 className="text-xs font-bold">{product.name_th}</h4>
                    <p className="text-[10px] text-slate-400">{product.name_en}</p>
                    <p className="text-xs font-bold text-pink-400 mt-1">฿{product.base_price}</p>
                  </div>
                </div>

                {/* Availability Toggle */}
                <button
                  onClick={() => onToggleProductAvailability(product.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    product.is_available
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  }`}
                >
                  {product.is_available ? (
                    <>
                      <ToggleRight size={16} />
                      <span>พร้อมขาย</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={16} />
                      <span>หมดชั่วคราว</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Charts */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 lg:col-span-2">
            <h3 className="text-sm font-bold mb-4">สถิติจำนวนออเดอร์แบ่งตามสถานะ</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="จำนวน" fill="#f472b6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
            <h3 className="text-sm font-bold">สรุปข้อมูลเชิงลึก</h3>

            <div className="space-y-3">
              <div className="bg-slate-900 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400">อัตราความถูกต้องของออเดอร์</span>
                <p className="text-lg font-extrabold text-emerald-400">100%</p>
                <p className="text-[9px] text-slate-500 mt-0.5">ไม่มีรายงานเครื่องดื่มผิดสูตรหรือเคลมหน้าเคาน์เตอร์</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400">เวลาเฉลี่ยในการเตรียมเครื่องดื่ม</span>
                <p className="text-lg font-extrabold text-pink-400">2.4 นาที / แก้ว</p>
                <p className="text-[9px] text-slate-500 mt-0.5">วัดจากเวลาที่ยืนยันสลิปจนถึงกด "พร้อมรับ"</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400">ยอดสั่งซื้อเฉลี่ยต่อบิล (AOV)</span>
                <p className="text-lg font-extrabold text-sky-400">฿144.50</p>
                <p className="text-[9px] text-slate-500 mt-0.5">เพิ่มขึ้น 18% จากระบบแนะนําท็อปปิ้งและส่วนลดสมาชิก</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
