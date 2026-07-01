"use client";

import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import { CheckCircle, Clock, Coffee, Sparkles, Smile, Volume2, ArrowLeft } from 'lucide-react';

interface OrderTrackingViewProps {
  order: Order;
  onBackToMenu: () => void;
}

export default function OrderTrackingView({ order, onBackToMenu }: OrderTrackingViewProps) {
  const [vibrateAlert, setVibrateAlert] = useState<boolean>(false);

  // Trigger sound and vibration simulation when order status changes to "พร้อมรับ"
  useEffect(() => {
    if (order.status === 'พร้อมรับ') {
      setVibrateAlert(true);
      // Play a cute soft notification sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      } catch (e) {
        console.log('Audio context not allowed by browser policy yet', e);
      }

      // Vibrate simulation
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Auto clear visual alert after 8 seconds
      const timer = setTimeout(() => {
        setVibrateAlert(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [order.status]);

  // Status steps mapping
  const steps = [
    { label: 'รอตรวจสอบ', desc: 'ตรวจสอบสลิปเงินโอน', icon: Clock },
    { label: 'กำลังชง', desc: 'บาริสต้ากำลังทำเครื่องดื่ม', icon: Coffee },
    { label: 'พร้อมรับ', desc: 'รับได้ที่เคาน์เตอร์', icon: Sparkles },
    { label: 'สำเร็จ', desc: 'รับเครื่องดื่มเรียบร้อย', icon: Smile }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'รอตรวจสอบ') return 0;
    if (status === 'กำลังชง') return 1;
    if (status === 'พร้อมรับ') return 2;
    if (status === 'สำเร็จ') return 3;
    return -1;
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-pink-100 overflow-hidden text-[#5C4033] animate-fade-in">

      {/* Vibrate Alert Banner */}
      {vibrateAlert && (
        <div className="bg-amber-100 border-b border-amber-200 p-3 text-center text-amber-800 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <Volume2 size={16} className="text-amber-600 animate-pulse" />
          <span>🔔 กริ๊งๆ! ออเดอร์ {order.order_number} ของคุณเสร็จแล้ว มารับได้เลยค่ะ!</span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-[#FFF5F6]">
        <div>
          <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
            ติดตามออเดอร์
          </span>
          <h2 className="text-base font-bold mt-1">ออเดอร์หมายเลข {order.order_number}</h2>
        </div>
        <button
          onClick={onBackToMenu}
          className="text-xs text-pink-500 font-bold hover:text-pink-600 flex items-center gap-1 border border-pink-200 px-2.5 py-1 rounded-lg bg-white"
        >
          <ArrowLeft size={14} />
          <span>สั่งเพิ่ม</span>
        </button>
      </div>

      <div className="p-5 space-y-6">

        {/* Status Tracker */}
        <div className="relative pl-6 space-y-6 border-l-2 border-pink-100 ml-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={idx} className="relative">
                {/* Bullet node */}
                <span className={`absolute -left-[31px] top-0.5 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                  isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                  isCurrent ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white ring-4 ring-pink-100 animate-pulse' :
                  'bg-white border-slate-200 text-slate-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Icon size={12} />
                  )}
                </span>

                {/* Text */}
                <div>
                  <h4 className={`text-xs font-bold ${
                    isCurrent ? 'text-pink-600 text-sm' :
                    isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pick-up Counter Banner */}
        {order.status === 'พร้อมรับ' && (
          <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 text-center space-y-2 animate-pulse">
            <p className="text-xs font-bold text-pink-600">🥤 กรุณามารับเครื่องดื่มที่เคาน์เตอร์</p>
            <p className="text-[11px] text-slate-500">แจ้งรหัสออเดอร์ <strong className="text-pink-600 text-sm">{order.order_number}</strong> กับบาริสต้าเพื่อรับเครื่องดื่มได้ทันที</p>
          </div>
        )}

        {/* Order Details Accordion */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายละเอียดออเดอร์</h3>

          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs pb-2 border-b border-slate-200/50 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold">{item.product_name} <span className="text-slate-400 font-normal">x{item.quantity}</span></p>
                  <p className="text-[10px] text-slate-400">
                    {item.customizations.join(' | ')}
                  </p>
                </div>
                <span className="font-semibold">฿{item.price_per_unit * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold">
            <span>ยอดชำระสุทธิ (โอนเงิน)</span>
            <span className="text-pink-600">฿{order.total}</span>
          </div>
        </div>

        {/* Friendly footer */}
        <div className="text-center text-[10px] text-slate-400">
          <p>ขอบคุณที่ใช้บริการคาเฟ่ พาสเทล มินิมอล</p>
          <p className="mt-1">เวลาสั่งซื้อ: {new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</p>
        </div>

      </div>
    </div>
  );
}
