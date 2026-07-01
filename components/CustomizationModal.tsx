"use client";

import { useState, useEffect } from 'react';
import { Product, Customization, TempOption, SweetnessOption, MilkOption } from '@/lib/types';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CustomizationModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (customization: Customization, quantity: number, finalPrice: number) => void;
}

export default function CustomizationModal({ product, onClose, onAddToCart }: CustomizationModalProps) {
  const [temp, setTemp] = useState<TempOption>('เย็น');
  const [sweetness, setSweetness] = useState<SweetnessOption>('50%');
  const [milk, setMilk] = useState<MilkOption>('นมจืด');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(product.base_price);

  // Prices for customizations
  const getExtraPrice = () => {
    let extra = 0;
    if (temp === 'ปั่น') extra += 10;
    if (milk === 'นมถั่วเหลือง') extra += 10;
    if (milk === 'นมโอ๊ต') extra += 15;

    selectedToppings.forEach(topping => {
      if (topping === 'ไข่มุก') extra += 10;
      if (topping === 'เจลลี่') extra += 10;
      if (topping === 'เพิ่มช็อตกาแฟ') extra += 15;
    });
    return extra;
  };

  useEffect(() => {
    const base = product.base_price;
    const extra = getExtraPrice();
    setCalculatedPrice((base + extra) * quantity);
  }, [temp, sweetness, milk, selectedToppings, quantity, product]);

  const toggleTopping = (topping: string) => {
    if (selectedToppings.includes(topping)) {
      setSelectedToppings(selectedToppings.filter(t => t !== topping));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAdd = () => {
    const customization: Customization = {
      temperature: temp,
      sweetness,
      milk,
      toppings: selectedToppings
    };
    const pricePerUnit = product.base_price + getExtraPrice();
    onAddToCart(customization, quantity, pricePerUnit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="p-4 border-b border-pink-100 flex justify-between items-center bg-[#FFF5F6]">
          <div>
            <h3 className="text-lg font-bold text-[#5C4033]">{product.name_th}</h3>
            <p className="text-xs text-slate-500">{product.name_en}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-pink-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-[#5C4033]">

          {/* Image and Price */}
          <div className="flex gap-4 items-center bg-pink-50/50 p-3 rounded-xl">
            <img
              src={product.image_url}
              alt={product.name_th}
              className="w-16 h-16 object-cover rounded-lg shadow-xs"
              crossOrigin="anonymous"
            />
            <div>
              <span className="text-xs text-pink-500 font-semibold bg-white px-2 py-0.5 rounded-full border border-pink-100">
                {product.category}
              </span>
              <p className="text-sm text-slate-500 mt-1">ราคาเริ่มต้น</p>
              <p className="text-lg font-bold text-pink-600">฿{product.base_price}</p>
            </div>
          </div>

          {/* Temperature - Required */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1">
              <span>อุณหภูมิ</span>
              <span className="text-red-400 text-xs">*บังคับ</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ร้อน', 'เย็น', 'ปั่น'] as TempOption[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemp(t)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                    temp === t
                      ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-pink-50/30'
                  }`}
                >
                  {t} {t === 'ปั่น' && <span className="text-xs opacity-90">(+฿10)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sweetness - Required */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1">
              <span>ระดับความหวาน</span>
              <span className="text-red-400 text-xs">*บังคับ</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['0%', '25%', '50%', '100%'] as SweetnessOption[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSweetness(s)}
                  className={`py-2 px-1 rounded-xl border text-sm font-medium transition-all ${
                    sweetness === s
                      ? 'bg-[#FFB7C5] border-[#FFB7C5] text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-pink-50/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Milk Options - Required */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1">
              <span>ประเภทนม</span>
              <span className="text-red-400 text-xs">*บังคับ</span>
            </label>
            <div className="space-y-2">
              {([
                { name: 'นมจืด', price: 0 },
                { name: 'นมถั่วเหลือง', price: 10 },
                { name: 'นมโอ๊ต', price: 15 }
              ] as { name: MilkOption; price: number }[]).map((m) => (
                <label
                  key={m.name}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    milk === m.name
                      ? 'bg-pink-50/50 border-[#FFB7C5] font-semibold'
                      : 'bg-white border-slate-200'
                  }`}
                  onClick={() => setMilk(m.name)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="milk"
                      checked={milk === m.name}
                      onChange={() => setMilk(m.name)}
                      className="accent-[#FFB7C5] h-4 w-4"
                    />
                    <span className="text-sm">{m.name}</span>
                  </div>
                  {m.price > 0 && <span className="text-xs text-pink-600 font-medium">+฿{m.price}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Toppings - Multiple Choice */}
          <div>
            <label className="block text-sm font-bold mb-2">
              ท็อปปิ้ง <span className="text-xs text-slate-400 font-normal">(เลือกได้หลายอย่าง)</span>
            </label>
            <div className="space-y-2">
              {[
                { id: 't1', name: 'ไข่มุก', price: 10 },
                { id: 't2', name: 'เจลลี่', price: 10 },
                { id: 't3', name: 'เพิ่มช็อตกาแฟ', price: 15 }
              ].map((topping) => {
                const isSelected = selectedToppings.includes(topping.name);
                return (
                  <label
                    key={topping.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-pink-50/50 border-[#FFB7C5] font-semibold'
                        : 'bg-white border-slate-200'
                    }`}
                    onClick={() => toggleTopping(topping.name)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTopping(topping.name)}
                        className="accent-[#FFB7C5] h-4 w-4 rounded-xs"
                      />
                      <span className="text-sm">{topping.name}</span>
                    </div>
                    <span className="text-xs text-pink-600 font-medium">+฿{topping.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-4 border-t border-pink-100">
            <span className="text-sm font-bold">จำนวนแก้ว</span>
            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
                className="text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none p-1"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-sm w-6 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="text-slate-500 hover:text-slate-800 p-1"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-pink-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleAdd}
            className="flex-2 bg-[#FFB7C5] hover:bg-[#FFA4B4] text-white py-3 px-6 rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag size={18} />
            <span>ใส่ตะกร้า • ฿{calculatedPrice}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
