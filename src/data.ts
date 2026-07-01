import { User, CashAdvanceDoc, ExpenseClaimDoc, OCRMockTemplate } from './types';

export const USERS: User[] = [
  {
    user_id: 'EMP001',
    full_name: 'สมชาย ใจดี',
    email: 'somchai.j@digitalvalue.co.th',
    department: 'Consulting',
    role: 'Employee'
  },
  {
    user_id: 'EMP002',
    full_name: 'วิภาดา รักเรียน',
    email: 'wipada.r@digitalvalue.co.th',
    department: 'Delivery',
    role: 'Employee'
  },
  {
    user_id: 'EMP003',
    full_name: 'อนันต์ ยอดขยัน',
    email: 'anan.y@digitalvalue.co.th',
    department: 'Consulting',
    role: 'Approver'
  },
  {
    user_id: 'EMP004',
    full_name: 'ศิริพร การเงิน',
    email: 'siriporn.f@digitalvalue.co.th',
    department: 'Management',
    role: 'Finance'
  }
];

export const INITIAL_ADV_DOCS: CashAdvanceDoc[] = [
  {
    document_no: 'ADV-2026-00001',
    request_date: '2026-03-01',
    requester_id: 'EMP001',
    requester_name: 'สมชาย ใจดี',
    department: 'Consulting',
    amount: 5000,
    purpose: 'ค่าเดินทางและที่พัก ไปพบลูกค้าบริษัทสยามพารากอน',
    status: 'Paid',
    paid_date: '2026-03-02'
  },
  {
    document_no: 'ADV-2026-00002',
    request_date: '2026-03-10',
    requester_id: 'EMP002',
    requester_name: 'วิภาดา รักเรียน',
    department: 'Delivery',
    amount: 12000,
    purpose: 'ค่าอบรมหลักสูตร AI & Advanced Data Specialist ประจำปี',
    status: 'Pending Approval'
  },
  {
    document_no: 'ADV-2026-00003',
    request_date: '2026-02-15',
    requester_id: 'EMP001',
    requester_name: 'สมชาย ใจดี',
    department: 'Consulting',
    amount: 3000,
    purpose: 'ค่าอาหารและเครื่องดื่ม รับรองลูกค้าผู้เชี่ยวชาญจากญี่ปุ่น',
    status: 'Settled',
    paid_date: '2026-02-16',
    cleared_date: '2026-02-18'
  },
  {
    document_no: 'ADV-2026-00004',
    request_date: '2026-02-20',
    requester_id: 'EMP002',
    requester_name: 'วิภาดา รักเรียน',
    department: 'Delivery',
    amount: 8000,
    purpose: 'ค่าจัดซื้ออุปกรณ์สำนักงานและสายเคเบิ้ลชั่วคราวสำหรับทีมพัฒนา',
    status: 'Pending Refund',
    paid_date: '2026-02-22',
    refunded_amount: 0 // Waiting for 800 THB refund to be confirmed by Finance
  },
  {
    document_no: 'ADV-2026-00005',
    request_date: '2026-02-05',
    requester_id: 'EMP001',
    requester_name: 'สมชาย ใจดี',
    department: 'Consulting',
    amount: 6500,
    purpose: 'ค่าเดินทางด่วนไปหน้างานลูกค้าต่างจังหวัด',
    status: 'Paid',
    paid_date: '2026-02-06' // Outstanding > 15 days! (Today is mid-March 2026)
  }
];

export const INITIAL_EXP_DOCS: ExpenseClaimDoc[] = [
  {
    document_no: 'EXP-2026-00001',
    advance_ref: 'ADV-2026-00003',
    receipt_date: '2026-02-17',
    amount: 3000,
    category: 'Entertainment',
    department: 'Consulting',
    supplier_name: 'Fuji Japanese Restaurant',
    payment_method: 'Cash',
    receipt_image_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
    description: 'เลี้ยงมื้อค่ำต้อนรับพาร์ทเนอร์ญี่ปุ่น คลี่คลายสัญญาโครงการ AI',
    status: 'Paid',
    requester_id: 'EMP001',
    requester_name: 'สมชาย ใจดี'
  },
  {
    document_no: 'EXP-2026-00002',
    receipt_date: '2026-03-12',
    amount: 1500,
    category: 'Travel',
    department: 'Consulting',
    supplier_name: 'Grab Taxi Thailand',
    payment_method: 'Credit Card',
    receipt_image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    description: 'ค่าเดินทางเข้าพบลูกค้าเพื่อทำ Workshop เสนอแผนงาน Data Architecture',
    status: 'Pending Approval',
    requester_id: 'EMP001',
    requester_name: 'สมชาย ใจดี'
  },
  {
    document_no: 'EXP-2026-00003',
    advance_ref: 'ADV-2026-00004',
    receipt_date: '2026-02-23',
    amount: 7200,
    category: 'Office Supplies',
    department: 'Delivery',
    supplier_name: 'OfficeMate สาขาพระราม 9',
    payment_method: 'Transfer',
    receipt_image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
    description: 'ซื้อสาย LAN, HDMI, และปลั๊กพ่วงสำหรับเซ็ตอัพห้องปฏิบัติการชั่วคราว (เหลือเงินคืน 800 บาท)',
    status: 'Paid',
    requester_id: 'EMP002',
    requester_name: 'วิภาดา รักเรียน'
  },
  {
    document_no: 'EXP-2026-00004',
    receipt_date: '2026-03-05',
    amount: 4500,
    category: 'SaaS/Software',
    department: 'Management',
    supplier_name: 'OpenAI API Subscription',
    payment_method: 'Credit Card',
    receipt_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'ค่าบริการรายเดือน OpenAI API สำหรับใช้พัฒนาระบบภายในของบริษัท',
    status: 'Approved',
    requester_id: 'EMP004',
    requester_name: 'ศิริพร การเงิน'
  }
];

export const OCR_MOCK_TEMPLATES: OCRMockTemplate[] = [
  {
    name: 'ใบเสร็จน้ำมัน ปตท. (ค่าเดินทาง)',
    imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=600&q=80',
    detectedDate: '2026-03-14',
    detectedAmount: 1250,
    detectedSupplier: 'ปตท. สาขาเลียบด่วนรามอินทรา',
    detectedCategory: 'Travel'
  },
  {
    name: 'ใบเสร็จ OfficeMate (อุปกรณ์สำนักงาน)',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
    detectedDate: '2026-03-15',
    detectedAmount: 840,
    detectedSupplier: 'OfficeMate Online',
    detectedCategory: 'Office Supplies'
  },
  {
    name: 'ใบเสร็จ MK Restaurants (ค่ารับรอง)',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
    detectedDate: '2026-03-13',
    detectedAmount: 2450,
    detectedSupplier: 'MK Restaurants เอสพละนาด',
    detectedCategory: 'Entertainment'
  },
  {
    name: 'ใบเสร็จ AWS Cloud (ค่าซอฟต์แวร์)',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    detectedDate: '2026-03-10',
    detectedAmount: 5890,
    detectedSupplier: 'Amazon Web Services, Inc.',
    detectedCategory: 'SaaS/Software'
  }
];