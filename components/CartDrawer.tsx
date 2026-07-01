"use client";

import { CartItem } from '@/lib/types';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onGoToCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onGoToCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price_per_unit * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left text-[#5C4033]">

        {/* Header */}
        <div className="p-4 border-b border-pink-100 flex justify-between items-center bg-[#FFF5F6]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-pink-500" size={20} />
            <h3 className="text-lg font-bold">ตะกร้าสินค้าของคุณ ({cart.length})</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-pink-100 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
              <ShoppingBag size={48} className="stroke-1 text-slate-300" />
              <p className="text-sm">ตะกร้าของคุณว่างเปล่า</p>
              <button
                onClick={onClose}
                className="text-xs text-pink-500 font-semibold underline hover:text-pink-600"
              >
                เลือกดูเมนูเครื่องดื่ม
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.price_per_unit * item.quantity;
              return (
                <div key={item.id} className="border border-pink-100 rounded-xl p-3 flex gap-3 bg-white shadow-xs hover:border-pink-200 transition-all">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name_th}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    crossOrigin="anonymous"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate">{item.product.name_th}</h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-300 hover:text-red-500 p-0.5 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Customizations details tag */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded-sm font-medium">
                        {item.customization.temperature}
                      </span>
                      <span className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded-sm">
                        หวาน {item.customization.sweetness}
                      </span>
                      <span className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded-sm">
                        {item.customization.milk}
                      </span>
                      {item.customization.toppings.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-sm font-medium">
                          +{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-800 p-0.5 disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-800 p-0.5"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-pink-600">
                        ฿{itemTotal}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-pink-100 bg-[#FFFDF0] space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">ราคารวมเบื้องต้น</span>
              <span className="font-bold text-lg text-[#5C4033]">฿{subtotal}</span>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              * สมาชิกจะได้รับส่วนลดและสะสมแต้มในขั้นตอนถัดไป
            </p>

            <button
              onClick={onGoToCheckout}
              className="w-full bg-[#FFB7C5] hover:bg-[#FFA4B4] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>ไปที่หน้าชำระเงิน</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
