// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login", // وجه المستخدم لهذه الصفحة إذا لم يكن مسجلاً
  },
})

// حدد المسارات التي تريد حمايتها (مثلاً كل الصفحات ما عدا صفحة التقييم للعملاء)
export const config = { 
    matcher: ["/admin/:path*", "/dashboard/:path*", "/"] 
}