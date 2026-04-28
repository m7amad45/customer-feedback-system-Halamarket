export type Language = 'ar' | 'en'

export interface Question {
  id: string
  ar: string
  en: string
  icon: string
  // الحقل الجديد لخيارات "لماذا لم يعجبك؟"
  lowRatingOptions?: string[]
}

export interface Department {
  id: string
  nameAr: string
  nameEn: string
  emoji: string
  questions: Question[]
  image?: string
}

export interface FeedbackEntry {
  id: string
  departmentId: string
  departmentNameAr: string
  departmentNameEn: string
  answers: Record<string, number>
  comment: string
  averageRating: number
  createdAt: string
}

// ─── Departments & Questions ──────────────────────────────────────────────────
// أضف حقل apologyAr للـ Interface
export interface Department {
  id: string
  nameAr: string
  nameEn: string
  emoji: string
  questions: Question[]
  apologyAr: string; // الحقل الجديد للرسالة المخصصة
  image?: string
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'bakery',
    nameAr: 'قسم المخبوزات',
    nameEn: 'Bakery',
    emoji: '🥖',
    apologyAr: "نعتذر منك بشدة، فجودة تجربتك هي أولويتنا.. 🥖 نحن نؤمن أن كل ملاحظة هي فرصة للتطور. فضلاً، ساعدنا لنفهم ما حدث.",
    questions: [
      { 
        id: 'taste', 
        ar: 'كيف تقيم طعم وطراوة المخبوزات؟', 
        en: 'How do you rate the taste and freshness?', 
        icon: 'bread',
        lowRatingOptions: ['قاسية/غير طازجة', 'الطعم غير جيد', 'محترقة قليلاً', 'سعر مرتفع', 'أخرى'] 
      },
      { 
        id: 'cleanliness', 
        ar: 'ما رأيك في مستوى نظافة المتجر والعرض؟', 
        en: 'How do you rate the cleanliness and display?', 
        icon: 'sparkles',
        lowRatingOptions: ['أرفف غير منظمة', 'وجود أتربة', 'الأكياس غير متوفرة', 'أخرى']
      },
      { 
        id: 'staff', 
        ar: 'كيف كانت تجربة التعامل مع الموظفين؟', 
        en: 'How was your experience with the staff?', 
        icon: 'user',
        lowRatingOptions: ['تجاهل الموظف', 'أسلوب غير لائق', 'عدم معرفة بالمنتجات', 'أخرى']
      },
      { 
        id: 'availability', 
        ar: 'هل وجدت الأصناف التي كنت تبحث عنها؟', 
        en: 'Did you find what you were looking for?', 
        icon: 'check',
        lowRatingOptions: ['صنف محدد ناقص', 'الكمية قليلة', 'الأصناف المميزة منتهية', 'أخرى']
      },
    ],
  },
  {
    id: 'dairy',
    nameAr: 'قسم الألبان والأجبان',
    nameEn: 'Dairy',
    emoji: '🧀',
    apologyAr: "هدفنا أن نصل لبيتك بأفضل جودة.. نعتذر منك. فضلاً، ساعدنا لنفهم ما حدث لتجنب تكراره.",
   questions: [
      { 
        id: 'quality', 
        ar: 'كيف تقيم طعم وجودة الأجبان المختارة؟', 
        en: 'How do you rate the cheese quality?', 
        icon: 'star',
        lowRatingOptions: ['طعم قديم', 'تغير في اللون', 'التغليف سيء', 'أخرى']
      },
      { 
        id: 'service', 
        ar: 'ما مدى رضاك عن سرعة إنجاز طلبك؟', 
        en: 'How satisfied are you with the service speed?', 
        icon: 'zap',
        lowRatingOptions: ['انتظار طويل', 'بطء في التقطيع', 'انشغال الموظف', 'أخرى']
      },
    ],
  },
  {
    id: 'vegetables',
    nameAr: 'قسم الخضروات والفواكه',
    nameEn: 'Vegetables & Fruits',
    emoji: '🥦',
    apologyAr: "يؤسفنا جداً أن منتجاتنا لم تكن بمستوى توقعاتك اليوم. نحن نحرص على الفرز اليومي وملاحظتك ستجعلنا نراجع المعايير فوراً.",
    questions: [
      { id: 'quality', ar: 'كيف تقيم طعم وجودة الخضروات والفواكه؟', en: 'How do you rate the quality?', icon: 'leaf' },
      { id: 'staff', ar: 'هل كان الموظفون متعاونين في الإجابة على استفساراتك؟', en: 'Were the staff helpful?', icon: 'user' },
    ],
  },
  {
    id: 'service',
    nameAr: 'الاستقبال والخدمة العامة',
    nameEn: 'General Service',
    emoji: '⭐',
    apologyAr: "نعتذر عن أي تقصير في خدمتنا. نعدك بالعمل على تحسين مهارات فريقنا لضمان رضاك في المرات القادمة.",
    questions: [
      { id: 'welcome', ar: 'كيف تقيم أسلوب ترحيب الموظفين بك عند الدخول؟', en: 'How was the staff welcome?', icon: 'user' },
      { id: 'speed', ar: 'ما مدى رضاك عن سرعة إنجاز طلبك عند الكاشير؟', en: 'How was the checkout speed?', icon: 'zap' },
      { id: 'grooming', ar: 'كيف تقيم مهنية الموظفين وهندامهم الرسمي؟', en: 'How was the staff professional look?', icon: 'check' },
    ],
  },
]

// ─── Emoji Rating Labels ──────────────────────────────────────────────────────

export const RATING_EMOJIS = [
  { score: 1, label: 'سيئ جداً', labelEn: 'Very Poor', emoji: '😞', color: '#ef4444' },
  { score: 2, label: 'سيئ', labelEn: 'Poor', emoji: '😐', color: '#f97316' },
  { score: 3, label: 'جيد', labelEn: 'Good', emoji: '🙂', color: '#eab308' },
  { score: 4, label: 'جيد جداً', labelEn: 'Great', emoji: '😊', color: '#84cc16' },
  { score: 5, label: 'ممتاز', labelEn: 'Loved It!', emoji: '🤩', color: '#22c55e' },
]

// ─── Mock Feedback Data ───────────────────────────────────────────────────────

export const MOCK_FEEDBACK: FeedbackEntry[] = [
  { id: '1', departmentId: 'bakery', departmentNameAr: 'المخبوزات', departmentNameEn: 'Bakery', answers: { taste: 4, variety: 5, availability: 3, service: 4 }, comment: 'المخبوزات طازجة ولذيذة جداً، استمروا على هذا المستوى', averageRating: 4, createdAt: '2025-01-15T10:23:00' },
  { id: '2', departmentId: 'vegetables', departmentNameAr: 'الخضروات', departmentNameEn: 'Vegetables', answers: { freshness: 2, sorting: 3, variety: 2, price: 1 }, comment: 'الخضروات لم تكن طازجة كما أتوقع', averageRating: 2, createdAt: '2025-01-15T11:10:00' },
  { id: '3', departmentId: 'service', departmentNameAr: 'الخدمة العامة', departmentNameEn: 'General Service', answers: { staff: 5, cleanliness: 5, speed: 4, overall: 5 }, comment: 'خدمة ممتازة وموظفين محترمين', averageRating: 5, createdAt: '2025-01-14T14:00:00' },
  { id: '4', departmentId: 'dairy', departmentNameAr: 'الألبان والأجبان', departmentNameEn: 'Dairy', answers: { quality: 3, variety: 3, expiry: 4, temperature: 2 }, comment: '', averageRating: 3, createdAt: '2025-01-14T09:45:00' },
  { id: '5', departmentId: 'bakery', departmentNameAr: 'المخبوزات', departmentNameEn: 'Bakery', answers: { taste: 5, variety: 4, availability: 5, service: 5 }, comment: 'أفضل مخبوزات في المنطقة', averageRating: 5, createdAt: '2025-01-13T16:20:00' },
  { id: '6', departmentId: 'meat', departmentNameAr: 'اللحوم', departmentNameEn: 'Meat', answers: { freshness: 3, quality: 4, cleanliness: 2, service: 3 }, comment: 'اللحم جيد لكن النظافة تحتاج تحسين', averageRating: 3, createdAt: '2025-01-13T18:00:00' },
  { id: '7', departmentId: 'fruits', departmentNameAr: 'الفواكه', departmentNameEn: 'Fruits', answers: { freshness: 4, ripeness: 5, variety: 4, display: 4 }, comment: 'العرض جميل والفواكه طازجة', averageRating: 4.25, createdAt: '2025-01-12T11:30:00' },
  { id: '8', departmentId: 'fish', departmentNameAr: 'الأسماك', departmentNameEn: 'Fish & Seafood', answers: { freshness: 4, smell: 4, variety: 5, service: 4 }, comment: '', averageRating: 4.25, createdAt: '2025-01-11T13:00:00' },
  { id: '9', departmentId: 'bakery', departmentNameAr: 'المخبوزات', departmentNameEn: 'Bakery', answers: { taste: 1, variety: 2, availability: 1, service: 2 }, comment: 'المنتجات كانت قديمة وغير طازجة', averageRating: 1.5, createdAt: '2025-01-10T08:00:00' },
  { id: '10', departmentId: 'service', departmentNameAr: 'الخدمة العامة', departmentNameEn: 'General Service', answers: { staff: 4, cleanliness: 5, speed: 5, overall: 5 }, comment: 'تجربة رائعة كما دائماً', averageRating: 4.75, createdAt: '2025-01-09T15:30:00' },
  { id: '11', departmentId: 'deli', departmentNameAr: 'المعلبات والمواد الغذائية', departmentNameEn: 'Deli & Groceries', answers: { availability: 5, organization: 4, expiry: 5, price: 3 }, comment: 'تشكيلة واسعة من المنتجات', averageRating: 4.25, createdAt: '2025-01-08T12:00:00' },
  { id: '12', departmentId: 'vegetables', departmentNameAr: 'الخضروات', departmentNameEn: 'Vegetables', answers: { freshness: 5, sorting: 5, variety: 4, price: 4 }, comment: 'خضروات ممتازة وطازجة', averageRating: 4.5, createdAt: '2025-01-07T09:15:00' },
]

// ─── Chart Data (last 30 days mock) ──────────────────────────────────────────

export function generateChartData() {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`
    // Simulate varying ratings
    const base = 2.5 + Math.sin(i * 0.4) * 1.2 + Math.random() * 0.8
    data.push({
      date: dayLabel,
      rating: Math.min(5, Math.max(1, parseFloat(base.toFixed(1)))),
      count: Math.floor(Math.random() * 8) + 1,
    })
  }
  return data
}

// ─── Department Stats ─────────────────────────────────────────────────────────

export function getDepartmentStats() {
  return DEPARTMENTS.map((dept) => {
    const entries = MOCK_FEEDBACK.filter((f) => f.departmentId === dept.id)
    const avg = entries.length
      ? parseFloat((entries.reduce((s, e) => s + e.averageRating, 0) / entries.length).toFixed(1))
      : 0
    return { department: dept, count: entries.length, avg }
  })
    .filter((s) => s.count > 0)
    .sort((a, b) => b.avg - a.avg)
}
