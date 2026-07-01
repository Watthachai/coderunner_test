"use client";

import { useState } from 'react';
import { CartItem, Customer, Order } from '@/lib/types';
import { ArrowLeft, Search, UserCheck, Sparkles, QrCode, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockSlips } from '@/lib/constants';

interface CheckoutViewProps {
  cart: CartItem[];
  onBack: () => void;
  onOrderSuccess: (newOrder: Order) => void;
  customers: Customer[];
  onAddNewCustomer: (newCust: Customer) => void;
}

export default function CheckoutView({
  cart,
  onBack,
  onOrderSuccess,
  customers,
  onAddNewCustomer
}: CheckoutViewProps) {
  const [phone, setPhone] = useState<string>('');
  const [member, setMember] = useState<Customer | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  // Registration state for new phone
  const [newName, setNewName] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Payment slip simulation
  const [uploadedSlip, setUploadedSlip] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const subtotal = cart.reduce((sum, item) => sum + item.price_per_unit * item.quantity, 0);

  // Calculate discount based on member tier
  const getDiscountPercent = () => {
    if (!member) return 0;
    if (member.tier === 'Gold') return 10;
    if (member.tier === 'Silver') return 5;
    return 0;
  };

  const discountPercent = getDiscountPercent();
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  // Points earned: 1 point per 10 THB after discount
  const pointsEarned = Math.floor(total / 10);

  const handleSearchMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    const found = customers.find(c => c.phone === phone.trim());
    if (found) {
      setMember(found);
      setIsRegistering(false);
    } else {
      setMember(null);
      setIsRegistering(true); // Open registration form
    }
    setSearched(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCust: Customer = {
      id: `CUST-${Date.now()}`,
      phone: phone.trim(),
      name: newName.trim(),
      points: 0,
      tier: 'General'
    };

    onAddNewCustomer(newCust);
    setMember(newCust);
    setIsRegistering(false);
  };

  // Simulate Slip Selection (since we are in a mock environment)
  const handleSimulateSlip = (slipUrl: string) => {
    setUploadedSlip(slipUrl);
    setError('');
  };

  const handleConfirmOrder = () => {
    if (!uploadedSlip) {
      setError('กรุณาแนบภาพสลิปโอนเงินเพื่อยืนยันการชำระเงิน');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission delay
    setTimeout(() => {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        order_number: `#${String(Math.floor(Math.random() * 900) + 100)}`, // Random order number
        phone: phone || '0000000000',
        customer_name: member ? member.name : 'ลูกค้าทั่วไป',
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name_th,
          customizations: [
            item.customization.temperature,
            `หวาน ${item.customization.sweetness}`,
            item.customization.milk,
            ...item.customization.toppings.map(t => `เพิ่ม ${t}`)
          ],
          quantity: item.quantity,
          price_per_unit: item.price_per_unit
        })),
        subtotal,
        discount_amount: discountAmount,
        total,
        slip_url: uploadedSlip,
        status: 'รอตรวจสอบ',
        created_at: new Date().toISOString()
      };

      // Add points to customer if they are a member
      if (member) {
        member.points += pointsEarned;
        // Check tier upgrade
        if (member.points >= 150) {
          member.tier = 'Gold';
        } else if (member.points >= 50) {
          member.tier = 'Silver';
        }
      }

      onOrderSuccess(newOrder);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-pink-100 overflow-hidden text-[#5C4033] animate-fade-in">

      {/* Header */}
      <div className="p-4 border-b border-pink-100 flex items-center gap-3 bg-[#FFF5F6]">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-pink-100 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold">ชำระเงิน & ข้อมูลสมาชิก</h2>
          <p className="text-xs text-slate-500">กรุณาตรวจสอบออเดอร์และโอนเงินชำระเงิน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-pink-100">

        {/* Left Side: Membership & Summary */}
        <div className="p-5 space-y-6">

          {/* 1. Member Section */}
          <div className="bg-pink-50/40 p-4 rounded-xl border border-pink-100">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-pink-500" />
              <span>สะสมแต้ม & รับส่วนลดสมาชิก</span>
            </h3>

            <form onSubmit={handleSearchMember} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="กรอกเบอร์โทรศัพท์ (เช่น 0812345678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#FFB7C5] bg-white"
                />
                <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              </div>
              <button
                type="submit"
                className="bg-[#FFB7C5] hover:bg-[#FFA4B4] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                ตรวจสอบ
              </button>
            </form>

            {/* Member Search Results */}
            {searched && member && (
              <div className="mt-4 bg-white p-3 rounded-lg border border-pink-100 flex items-center justify-between animate-fade-in">
                <div>
                  <div className="flex items-center gap-1">
                    <UserCheck size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold">{member.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">เบอร์โทร: {member.phone}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    member.tier === 'Gold' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    member.tier === 'Silver' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                    'bg-pink-100 text-pink-700'
                  }`}>
                    {member.tier} Member
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">แต้มสะสม: <strong className="text-pink-600">{member.points}</strong> แต้ม</p>
                </div>
              </div>
            )}

            {/* If member not found - Register form */}
            {isRegistering && (
              <form onSubmit={handleRegister} className="mt-4 bg-[#FFFDF0] p-3 rounded-lg border border-amber-100 space-y-3 animate-fade-in">
                <p className="text-xs text-amber-700 font-medium">✨ ไม่พบข้อมูลสมาชิก! สมัครสมาชิกฟรีเพื่อรับสิทธิ์ส่วนลดทันที</p>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block">ชื่อ-นามสกุล ของคุณ</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น น้องพิม พาสเทล"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-[#FFB7C5] bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-pink-400 hover:bg-pink-500 text-white py-1.5 rounded-md text-xs font-bold transition-colors"
                >
                  สมัครสมาชิก & รับสิทธิ์เลย
                </button>
              </form>
            )}

            {/* Discount tier benefit notice */}
            {member && (
              <div className="mt-3 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-pink-50">
                {member.tier === 'Gold' && '🎉 คุณเป็นสมาชิกระดับ Gold ได้รับส่วนลด 10% ทุกเมนู!'}
                {member.tier === 'Silver' && '🎉 คุณเป็นสมาชิกระดับ Silver ได้รับส่วนลด 5% ทุกเมนู!'}
                {member.tier === 'General' && '💡 สะสมครบ 50 แต้ม อัปเกรดเป็น Silver (ลด 5%) และ 150 แต้ม อัปเกรดเป็น Gold (ลด 10%)'}
              </div>
            )}
          </div>

          {/* 2. Order Items Review */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">รายการสั่งซื้อของคุณ</h3>
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs border-b border-pink-50/50 pb-2">
                  <div className="max-w-[70%]">
                    <p className="font-bold">{item.product.name_th} <span className="text-slate-400 font-normal">x{item.quantity}</span></p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.customization.temperature} | หวาน {item.customization.sweetness} | {item.customization.milk}
                      {item.customization.toppings.length > 0 && ` | +${item.customization.toppings.join(', ')}`}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-700">฿{item.price_per_unit * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pricing Summary */}
          <div className="border-t border-pink-100 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>ราคารวมทั้งหมด</span>
              <span>฿{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>ส่วนลดสมาชิก ({discountPercent}%)</span>
                <span>-฿{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-dashed border-pink-100">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-pink-600 text-base">฿{total}</span>
            </div>
            {member && (
              <div className="flex justify-between text-[10px] text-pink-500 font-semibold bg-pink-50 p-1.5 rounded-md mt-2">
                <span>✨ แต้มสะสมที่จะได้รับจากออเดอร์นี้:</span>
                <span>+{pointsEarned} แต้ม</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Payment QR & Upload */}
        <div className="p-5 space-y-6 bg-slate-50/50">

          <div className="text-center">
            <h3 className="text-sm font-bold flex items-center justify-center gap-1.5 mb-1">
              <QrCode size={16} className="text-pink-500" />
              <span>สแกน QR Code เพื่อชำระเงิน</span>
            </h3>
            <p className="text-[10px] text-slate-400">สแกนจ่ายได้ทุกแอปธนาคาร ไม่มีค่าธรรมเนียม</p>
          </div>

          {/* QR Code Graphic */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-pink-100 max-w-[200px] mx-auto shadow-xs">
            {/* PromptPay Header */}
            <div className="w-full flex justify-between items-center border-b border-blue-500 pb-1.5 mb-2">
              <span className="text-[10px] font-bold text-blue-800">PromptPay</span>
              <div className="h-2 w-6 bg-blue-800 rounded-xs" />
            </div>

            {/* Simulated QR Code */}
            <div className="relative p-2 bg-slate-100 rounded-lg">
              <div className="w-28 h-28 bg-slate-800 flex flex-col items-center justify-center text-white p-1">
                {/* Simulated QR pattern */}
                <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-800"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-800"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-800"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-800"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-800"></div>
                  <div className="bg-white rounded-xs"></div>
                </div>
                {/* Center Cafe Logo */}
                <div className="absolute inset-0 m-auto w-8 h-8 bg-pink-200 border border-white rounded-full flex items-center justify-center text-[8px] text-[#5C4033] font-bold">
                  Cafe
                </div>
              </div>
            </div>

            <p className="text-[10px] font-bold text-slate-700 mt-2">บจก. คาเฟ่ พาสเทล จำกัด</p>
            <p className="text-[11px] font-bold text-pink-600 mt-1">ยอดโอน: ฿{total}</p>
          </div>

          {/* Slip Upload Simulation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600">
              อัปโหลดสลิปโอนเงิน <span className="text-red-400">*จำเป็น</span>
            </label>

            {uploadedSlip ? (
              <div className="relative border border-pink-200 rounded-xl p-2 bg-white flex items-center gap-3 animate-fade-in">
                <img
                  src={uploadedSlip}
                  alt="Uploaded slip"
                  className="w-12 h-16 object-cover rounded-md border"
                  crossOrigin="anonymous"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>แนบสลิปเรียบร้อยแล้ว</span>
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">slip_transfer_success.png</p>
                </div>
                <button
                  onClick={() => setUploadedSlip('')}
                  className="text-xs text-red-500 hover:underline px-2 py-1"
                >
                  เปลี่ยนรูป
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-pink-200 rounded-xl p-4 bg-white text-center">
                <Upload className="mx-auto text-pink-300 mb-2" size={24} />
                <p className="text-xs text-slate-500 mb-3">จำลองการอัปโหลดโดยเลือกสลิปตัวอย่างด้านล่าง:</p>

                {/* Quick select mock slips */}
                <div className="flex justify-center gap-3">
                  {mockSlips.map((slip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSimulateSlip(slip)}
                      className="group relative border border-slate-200 rounded-lg overflow-hidden hover:border-[#FFB7C5] transition-all"
                    >
                      <img
                        src={slip}
                        alt={`Slip ${idx + 1}`}
                        className="w-12 h-16 object-cover"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition-all">
                        เลือก
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1 bg-red-50 p-2 rounded-lg">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-[#FFB7C5] hover:bg-[#FFA4B4] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังส่งออเดอร์...</span>
              </>
            ) : (
              <span>ยืนยันการสั่งซื้อและชำระเงิน</span>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}
