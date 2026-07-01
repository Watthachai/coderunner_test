"use client";

import { useState } from 'react';
import { Product, CartItem, Customer, Order, Customization } from '@/lib/types';
import CustomizationModal from '@/components/CustomizationModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutView from '@/components/CheckoutView';
import OrderTrackingView from '@/components/OrderTrackingView';
import StaffDashboard from '@/components/StaffDashboard';
import {
  persistNewOrder,
  persistOrderStatus,
  persistProductAvailability,
  persistNewCustomer,
} from '@/app/actions';
import { Coffee, ShoppingBag, ClipboardList } from 'lucide-react';

interface AppViewProps {
  initialProducts: Product[];
  initialCustomers: Customer[];
  initialOrders: Order[];
}

export default function AppView({ initialProducts, initialCustomers, initialOrders }: AppViewProps) {
  // Shared state to allow real-time simulation between Customer & Staff.
  // Seeded from Postgres (via the server component); each mutation is mirrored
  // back to the DB through a server action so the data layer is real.
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Role: 'customer' or 'staff'
  const [role, setRole] = useState<'customer' | 'staff'>('customer');

  // Customer UI views: 'menu' | 'checkout' | 'tracking'
  const [customerView, setCustomerView] = useState<'menu' | 'checkout' | 'tracking'>('menu');

  // Selected category for filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Customization modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Active tracking order (latest order submitted by customer)
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Add to cart handler
  const handleAddToCart = (customization: Customization, quantity: number, pricePerUnit: number) => {
    if (!selectedProduct) return;

    const newCartItem: CartItem = {
      id: `${selectedProduct.id}-${Date.now()}`,
      product: selectedProduct,
      customization,
      quantity,
      price_per_unit: pricePerUnit
    };

    setCart([...cart, newCartItem]);
    setSelectedProduct(null); // Close modal
    setIsCartOpen(true); // Open cart to show item added
  };

  const handleUpdateCartQty = (id: string, newQty: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Checkout Success callback
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    setActiveTrackingOrderId(newOrder.id);
    setCart([]); // Clear cart
    setCustomerView('tracking');
    // Persist to Postgres (non-blocking; the demo keeps working without a DB).
    persistNewOrder(newOrder).catch(() => {});
  };

  // Staff order status update
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    persistOrderStatus(orderId, status).catch(() => {});
  };

  // Staff toggle product availability
  const handleToggleProductAvailability = (productId: string) => {
    let nextAvailable = true;
    setProducts(products.map(p => {
      if (p.id === productId) {
        nextAvailable = !p.is_available;
        return { ...p, is_available: nextAvailable };
      }
      return p;
    }));
    persistProductAvailability(productId, nextAvailable).catch(() => {});
  };

  // Add new customer registration
  const handleAddNewCustomer = (newCust: Customer) => {
    setCustomers([...customers, newCust]);
    persistNewCustomer(newCust).catch(() => {});
  };

  // Get active tracking order details
  const currentTrackingOrder = orders.find(o => o.id === activeTrackingOrderId);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">

      {/* Top Role Switcher Header */}
      <div className="bg-slate-800 text-white px-4 py-2 flex justify-between items-center text-xs border-b border-slate-700 z-40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">โหมดจำลองระบบร้านกาแฟ</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">สลับบทบาท:</span>
          <button
            onClick={() => setRole('customer')}
            className={`px-3 py-1 rounded-md font-bold transition-all ${
              role === 'customer'
                ? 'bg-[#FFB7C5] text-slate-900 shadow-sm'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📱 ฝั่งลูกค้า
          </button>
          <button
            onClick={() => setRole('staff')}
            className={`px-3 py-1 rounded-md font-bold transition-all ${
              role === 'staff'
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            💻 ฝั่งพนักงานร้าน
          </button>
        </div>
      </div>

      {/* CUSTOMER VIEW */}
      {role === 'customer' && (
        <div className="flex-1 flex flex-col">

          {/* Customer App Header */}
          <header className="bg-white border-b border-pink-100 sticky top-0 z-30 shadow-xs">
            <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">

              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCustomerView('menu')}>
                <div className="w-10 h-10 rounded-full bg-[#FFB7C5] flex items-center justify-center text-white shadow-xs">
                  <Coffee size={20} />
                </div>
                <div>
                  <h1 className="text-base font-bold text-[#5C4033] tracking-tight">คาเฟ่ พาสเทล</h1>
                  <p className="text-[10px] text-pink-400 font-semibold uppercase tracking-wider">Minimalist & Sweet</p>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2">

                {/* Tracking order button if exists */}
                {activeTrackingOrderId && (
                  <button
                    onClick={() => setCustomerView('tracking')}
                    className="flex items-center gap-1.5 bg-pink-50 text-pink-600 px-3 py-2 rounded-full text-xs font-bold border border-pink-100 hover:bg-pink-100 transition-all"
                  >
                    <ClipboardList size={14} />
                    <span>ติดตามออเดอร์</span>
                  </button>
                )}

                {/* Cart Trigger */}
                {customerView === 'menu' && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative flex items-center gap-1.5 bg-[#FFB7C5] hover:bg-[#FFA4B4] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs transition-all"
                  >
                    <ShoppingBag size={14} />
                    <span>ตะกร้า ({cart.length})</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce">
                        {cart.length}
                      </span>
                    )}
                  </button>
                )}

                {customerView !== 'menu' && (
                  <button
                    onClick={() => setCustomerView('menu')}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-2 border border-slate-200 rounded-full bg-white"
                  >
                    กลับหน้าเมนู
                  </button>
                )}

              </div>

            </div>
          </header>

          {/* Customer Content Area */}
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">

            {/* 1. Menu Listing View */}
            {customerView === 'menu' && (
              <div className="space-y-6">

                {/* Banner Promotion */}
                <div className="bg-gradient-to-r from-[#FFF0F2] to-[#FFFDD0] rounded-2xl p-5 border border-pink-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="inline-block bg-[#FFB7C5] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      โปรโมชั่นพิเศษ
                    </span>
                    <h2 className="text-lg font-bold text-[#5C4033]">☕️ สั่งล่วงหน้า สะสมแต้มรับส่วนลดสูงสุด 10%</h2>
                    <p className="text-xs text-slate-500">กรอกเบอร์โทรศัพท์ตอนชำระเงินเพื่อสมัครสมาชิก สะสมแต้มง่ายๆ!</p>
                  </div>
                  <div className="flex gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-pink-50 text-xs">
                    <div className="text-center px-3 border-r border-pink-100">
                      <p className="font-bold text-pink-600">Silver</p>
                      <p className="text-[9px] text-slate-500">ลด 5%</p>
                    </div>
                    <div className="text-center px-3">
                      <p className="font-bold text-amber-600">Gold</p>
                      <p className="text-[9px] text-slate-500">ลด 10%</p>
                    </div>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {['ทั้งหมด', 'Coffee', 'Tea', 'Non-Coffee', 'Bakery'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#FFB7C5] text-white shadow-xs'
                          : 'bg-white text-[#5C4033] border border-pink-50 hover:bg-pink-50/40'
                      }`}
                    >
                      {cat === 'ทั้งหมด' ? '🌟 ทั้งหมด' :
                       cat === 'Coffee' ? '☕️ กาแฟ' :
                       cat === 'Tea' ? '🍵 ชา' :
                       cat === 'Non-Coffee' ? '🥤 นม & โกโก้' : '🥐 เบเกอรี่'}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products
                    .filter(p => selectedCategory === 'ทั้งหมด' || p.category === selectedCategory)
                    .map((product) => (
                      <div
                        key={product.id}
                        className={`bg-white rounded-2xl border border-pink-50 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                          !product.is_available ? 'opacity-70' : ''
                        }`}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square bg-pink-50/20">
                          <img
                            src={product.image_url}
                            alt={product.name_th}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                          {!product.is_available && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                              <span className="bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                                สินค้าหมดชั่วคราว
                              </span>
                            </div>
                          )}
                          <span className="absolute top-2 left-2 text-[9px] bg-white/95 text-pink-600 font-bold px-2 py-0.5 rounded-full border border-pink-100 shadow-xs">
                            {product.category}
                          </span>
                        </div>

                        {/* Product Details */}
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between text-[#5C4033]">
                          <div>
                            <h3 className="font-bold text-sm truncate">{product.name_th}</h3>
                            <p className="text-[10px] text-slate-400 truncate">{product.name_en}</p>
                          </div>

                          <div className="flex justify-between items-center pt-1.5 border-t border-pink-50/50">
                            <span className="font-extrabold text-sm text-pink-600">฿{product.base_price}</span>

                            <button
                              disabled={!product.is_available}
                              onClick={() => setSelectedProduct(product)}
                              className="bg-[#FFB7C5] hover:bg-[#FFA4B4] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xs"
                            >
                              สั่งซื้อ
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                </div>

              </div>
            )}

            {/* 2. Checkout & Membership View */}
            {customerView === 'checkout' && (
              <CheckoutView
                cart={cart}
                onBack={() => setCustomerView('menu')}
                onOrderSuccess={handleOrderSuccess}
                customers={customers}
                onAddNewCustomer={handleAddNewCustomer}
              />
            )}

            {/* 3. Order Tracking View */}
            {customerView === 'tracking' && currentTrackingOrder && (
              <OrderTrackingView
                order={currentTrackingOrder}
                onBackToMenu={() => setCustomerView('menu')}
              />
            )}

          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-pink-100 py-6 mt-12 text-center text-xs text-slate-400">
            <p>© 2025 คาเฟ่ พาสเทล มินิมอล - ระบบสั่งเครื่องดื่มล่วงหน้า & รับหน้าร้าน</p>
            <p className="mt-1">พัฒนาด้วยความรักสไตล์เกาหลี 🌸</p>
          </footer>

          {/* Customization Modal */}
          {selectedProduct && (
            <CustomizationModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onGoToCheckout={() => {
              setIsCartOpen(false);
              setCustomerView('checkout');
            }}
          />

        </div>
      )}

      {/* STAFF VIEW */}
      {role === 'staff' && (
        <StaffDashboard
          orders={orders}
          products={products}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onToggleProductAvailability={handleToggleProductAvailability}
        />
      )}

    </div>
  );
}
