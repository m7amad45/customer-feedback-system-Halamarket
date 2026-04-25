export type Language = 'ar' | 'en'

export interface Question {
  id: string
  ar: string
  en: string
  icon: string
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

export const DEPARTMENTS: Department[] = [
  {
    id: 'bakery',
    nameAr: 'المخبوزات',
    nameEn: 'Bakery',
    emoji: '🥖',
    questions: [
      { id: 'taste', ar: 'كيف تقيم طعم وطراوة المخبوزات؟', en: 'How do you rate the taste and freshness of the baked goods?', icon: 'bread' },
      { id: 'variety', ar: 'ما رأيك في تنوع منتجات المخبوزات؟', en: 'How do you rate the variety of bakery products?', icon: 'list' },
      { id: 'availability', ar: 'هل المنتجات متوفرة بشكل دائم؟', en: 'Are the products consistently available?', icon: 'check' },
      { id: 'service', ar: 'كيف تقيم خدمة موظفي قسم المخبوزات؟', en: 'How do you rate the bakery staff service?', icon: 'user' },
    ],
  },
  {
    id: 'vegetables',
    nameAr: 'الخضروات',
    nameEn: 'Vegetables',
    emoji: '🥦',
    questions: [
      { id: 'freshness', ar: 'كيف تقيم طازجية الخضروات؟', en: 'How do you rate the freshness of vegetables?', icon: 'leaf' },
      { id: 'sorting', ar: 'ما رأيك في ترتيب وجودة عرض الخضروات؟', en: 'How do you rate the sorting and display quality?', icon: 'sparkles' },
      { id: 'variety', ar: 'ما رأيك في تنوع الخضروات المتوفرة؟', en: 'How do you rate the variety of vegetables available?', icon: 'list' },
      { id: 'price', ar: 'كيف تقيم الأسعار مقارنة بالجودة؟', en: 'How do you rate the prices compared to quality?', icon: 'tag' },
    ],
  },
  {
    id: 'fruits',
    nameAr: 'الفواكه',
    nameEn: 'Fruits',
    emoji: '🍎',
    questions: [
      { id: 'freshness', ar: 'كيف تقيم طازجية الفواكه؟', en: 'How do you rate the freshness of fruits?', icon: 'leaf' },
      { id: 'ripeness', ar: 'هل الفواكه ناضجة ومناسبة للأكل؟', en: 'Are the fruits ripe and ready to eat?', icon: 'check' },
      { id: 'variety', ar: 'ما رأيك في تنوع الفواكه المتوفرة؟', en: 'How do you rate the variety of fruits available?', icon: 'list' },
      { id: 'display', ar: 'ما رأيك في نظافة قسم الفواكه وترتيبه؟', en: 'How do you rate the cleanliness and organization?', icon: 'sparkles' },
    ],
  },
  {
    id: 'dairy',
    nameAr: 'الألبان والأجبان',
    nameEn: 'Dairy',
    emoji: '🧀',
    questions: [
      { id: 'quality', ar: 'كيف تقيم جودة منتجات الألبان؟', en: 'How do you rate the quality of dairy products?', icon: 'star' },
      { id: 'variety', ar: 'ما رأيك في تنوع منتجات الألبان والأجبان؟', en: 'How do you rate the variety of dairy and cheese products?', icon: 'list' },
      { id: 'expiry', ar: 'هل تواريخ الصلاحية مناسبة وواضحة؟', en: 'Are the expiry dates appropriate and clear?', icon: 'calendar' },
      { id: 'temperature', ar: 'هل درجة حرارة التبريد مناسبة؟', en: 'Is the refrigeration temperature appropriate?', icon: 'thermometer' },
    ],
  },
  {
    id: 'meat',
    nameAr: 'اللحوم',
    nameEn: 'Meat',
    emoji: '🥩',
    questions: [
      { id: 'freshness', ar: 'كيف تقيم طازجية اللحوم؟', en: 'How do you rate the freshness of meat?', icon: 'leaf' },
      { id: 'quality', ar: 'ما رأيك في جودة قطع اللحم؟', en: 'How do you rate the quality of meat cuts?', icon: 'star' },
      { id: 'cleanliness', ar: 'ما رأيك في نظافة قسم اللحوم؟', en: 'How do you rate the cleanliness of the meat section?', icon: 'sparkles' },
      { id: 'service', ar: 'كيف تقيم خدمة الجزار؟', en: 'How do you rate the butcher service?', icon: 'user' },
    ],
  },
  {
    id: 'fish',
    nameAr: 'الأسماك',
    nameEn: 'Fish & Seafood',
    emoji: '🐟',
    questions: [
      { id: 'freshness', ar: 'كيف تقيم طازجية الأسماك والمأكولات البحرية؟', en: 'How do you rate the freshness of fish and seafood?', icon: 'leaf' },
      { id: 'smell', ar: 'هل رائحة القسم مقبولة؟', en: 'Is the section smell acceptable?', icon: 'wind' },
      { id: 'variety', ar: 'ما رأيك في تنوع الأسماك المتوفرة؟', en: 'How do you rate the variety of fish available?', icon: 'list' },
      { id: 'service', ar: 'كيف تقيم خدمة قسم الأسماك؟', en: 'How do you rate the fish section service?', icon: 'user' },
    ],
  },
  {
    id: 'deli',
    nameAr: 'المعلبات والمواد الغذائية',
    nameEn: 'Deli & Groceries',
    emoji: '🥫',
    questions: [
      { id: 'availability', ar: 'هل المنتجات التي تبحث عنها متوفرة؟', en: 'Are the products you need available?', icon: 'check' },
      { id: 'organization', ar: 'ما رأيك في ترتيب الرفوف وسهولة الوصول؟', en: 'How do you rate the shelf organization and accessibility?', icon: 'list' },
      { id: 'expiry', ar: 'هل تواريخ الصلاحية مناسبة؟', en: 'Are the expiry dates appropriate?', icon: 'calendar' },
      { id: 'price', ar: 'كيف تقيم الأسعار؟', en: 'How do you rate the prices?', icon: 'tag' },
    ],
  },
  {
    id: 'service',
    nameAr: 'الخدمة العامة',
    nameEn: 'General Service',
    emoji: '⭐',
    questions: [
      { id: 'staff', ar: 'كيف تقيم تعامل الموظفين مع العملاء؟', en: 'How do you rate staff interaction with customers?', icon: 'user' },
      { id: 'cleanliness', ar: 'ما رأيك في نظافة المتجر بشكل عام؟', en: 'How do you rate the overall store cleanliness?', icon: 'sparkles' },
      { id: 'speed', ar: 'كيف تقيم سرعة الخدمة عند الصناديق؟', en: 'How do you rate the checkout speed?', icon: 'zap' },
      { id: 'overall', ar: 'ما تقييمك العام لتجربة التسوق؟', en: 'What is your overall shopping experience rating?', icon: 'star' },
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
