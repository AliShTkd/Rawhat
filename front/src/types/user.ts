

// src/types/user.ts

/** نقشِ کاربر — بسته و محدود، برای گاردِ مسیر (مثلاً پنلِ ادمین). */
export type UserRole = "customer" | "admin";

/**
 * پروفایلِ عمومیِ کاربر — همانی که `stores/auth` نگه می‌دارد و UI می‌خواند.
 * عمداً هیچ دادهٔ حساسی (رمز، توکن) این‌جا نیست.
 */
export interface User {
  id: string;
  /** برای نمایش و ارتباط؛ یکتا. */
  email: string;
  /** نامِ نمایشیِ کامل؛ ممکن است از first/last ساخته شده باشد. */
  name: string;
  firstName?: string;
  lastName?: string;

  role: UserRole;

  /** آواتارِ اختیاری برای هدر/پروفایل. */
  avatarUrl?: string;
  /** شمارهٔ تماسِ تأییدشده، اگر داده باشد. */
  phone?: string;

  /** وضعیتِ تأییدِ ایمیل — برای بنرِ «ایمیلت را تأیید کن». */
  emailVerified: boolean;

  /** زمانِ عضویت (ISO) — برای صفحهٔ پروفایل. */
  createdAt: string;
}

/** نوعِ آدرس؛ یک رکورد می‌تواند هم‌زمان هر دو باشد. */
export type AddressType = "shipping" | "billing";

/**
 * آدرسِ مشترک — در `Account` (دفترچه)، `Checkout` (ارسال/صورتحساب)،
 * و `Order` (عکسِ فوریِ آدرسِ سفارش) بازاستفاده می‌شود.
 */
export interface Address {
  id: string;
  /** گیرنده؛ ممکن است غیر از نامِ حساب باشد (هدیه، دیگری). */
  recipientName: string;
  phone: string;

  province: string;
  city: string;
  /** خیابان و جزئیاتِ نشانی. */
  line1: string;
  line2?: string;
  postalCode: string;

  /** آدرسِ پیش‌فرضِ کاربر — در فهرست بالا و در checkout ازپیش‌انتخاب. */
  isDefault?: boolean;
  /** یادداشتِ کوتاه مثل «خانه»، «محلِ کار». */
  label?: string;
}

/** ورودیِ فرمِ ورود — قراردادِ `services/auth.login`. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** ورودیِ فرمِ ثبت‌نام — قراردادِ `services/auth.register`. */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/**
 * شکلِ سشن — بی‌طرف نسبت به «کوکیِ httpOnly» یا «توکن در حافظه».
 * اگر سشن کوکی‌محور باشد، `accessToken` تعریف‌نشده می‌ماند و فقط
 * وجودِ `user` مهم است؛ اگر توکن‌محور باشد، `accessToken` پر می‌شود.
 * این ابهام عمدی است تا تایپ هر دو تصمیم را بپذیرد.
 */
export interface AuthSession {
  user: User;
  /** فقط در حالتِ توکن‌محور؛ در حالتِ کوکی خالی می‌ماند. */
  accessToken?: string;
  /** انقضای توکن (ISO) در حالتِ توکن‌محور. */
  expiresAt?: string;
}

/** ورودیِ ویرایشِ پروفایل — قراردادِ `services/user.updateProfile`. */
export interface ProfilePatch {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/** ورودیِ تغییرِ رمز — قراردادِ `services/user.changePassword`. */
export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

/**
 * نوعِ ورودیِ سرویسِ لاگین — برای اتصالِ authService.
 */
export type Credentials = LoginCredentials;

/**
 * نوعِ ورودیِ سرویسِ ثبت‌نام — برای اتصالِ authService.
 */
export type RegisterPayload = RegisterInput;












// نکاتِ مهمِ کوتاه:

// بزرگ‌ترین تصمیم — User بی‌توکن است: وسوسه‌ای هست که token را داخلِ User بگذاری تا «همه‌چیز یک‌جا» باشد. عمداً نکردم. اگر توکن جزوِ User باشد، هر جا کاربر را لاگ/سریالایز می‌کنی توکن هم نشت می‌کند. User = هویتِ عمومی، AuthSession = مکانیزمِ احراز. این مرز، همان جداسازی‌ای است که قطاعِ auth را امن نگه می‌دارد.

// AuthSession.accessToken? عمداً اختیاری است (پلِ آن تصمیمِ بنیادی): یادت هست چند پیام است می‌پرسم «کوکی یا توکن»؟ این‌جا مجبور نشدم انتخاب کنم — تایپ را طوری نوشتم که هر دو را بپذیرد. اگر بعداً کوکیِ httpOnly را انتخاب کنیم، accessToken هیچ‌وقت پر نمی‌شود و stores/auth فقط به وجودِ user نگاه می‌کند؛ اگر توکن را انتخاب کنیم، پر می‌شود. تصمیم را عقب انداختم بدونِ اینکه کار را قفل کنم — ولی این تنها تا مرزِ stores/auth جواب می‌دهد؛ آن‌جا دیگر باید یک کلمه بگویی.

// Address این‌جا، نه در checkout/order: چون سه مصرف‌کننده دارد. اگر در types/checkout می‌گذاشتمش، Order مجبور می‌شد از یک تایپِ صفحه‌محور import کند — وابستگیِ معکوس و بدبو. تایپِ مشترک باید در پایین‌ترین لایه (user) بنشیند.

// LoginCredentials/RegisterInput این‌جا کنارِ User: چون قراردادِ دقیقِ services/authاند و به همین دامنه تعلق دارند. Login.tsx/Register.tsx که قبلاً فرم‌هایشان را دستی تایپ کرده بودند، حالا می‌توانند این‌ها را import کنند و شکلِ فرم با شکلِ سرویس یکی شود.

// چه چیزی این‌جا نیست (عمدی): منطقِ ذخیرهٔ توکن (کارِ stores/auth)، refresh-token flow (تصمیمِ زیرساخت)، و AddressInputِ فرم (که در types/checkout می‌نشیند چون فقط آن‌جا لازم است). فقط شکلِ دادهٔ کاربر، نه سیاستِ احرازش.





// رسیدیم به types/user.ts — و این سومین تکهٔ لایهٔ تایپ است، ولی از نظرِ اهرم شاید مهم‌ترینشان: این همان تایپی است که پنج صفحهٔ معلقِ قطاعِ auth (Login, Register, Account, ForgotPassword, ResetPassword) و کلِ stores/authِ نساخته رویش می‌نشینند. یعنی نوشتنِ این فایل، یک تصمیمِ بنیادی را هم مجبورمان می‌کند روشن کنیم: شکلِ سشن.

// فرض‌های مهم (چون این تایپ مرزِ «چه چیزی از کاربر در کلاینت هست» را می‌کشد):

// User فقط دادهٔ عمومیِ نمایشی است — هیچ چیزِ حساس: نه رمز، نه توکن، نه نقشِ خام. فقط چیزی که UI برای «سلام، نام» و شخصی‌سازی لازم دارد. توکن/سشن عمداً بخشی از User نیست — این جداسازی جلوی نشتِ تصادفیِ توکن به لاگ/استور را می‌گیرد.
// Address یک تایپِ مشترکِ مستقل است: هم در Account (دفترچهٔ آدرس)، هم در Checkout (آدرسِ ارسال/صورتحساب)، هم در Order (آدرسِ ثبت‌شدهٔ سفارش) مصرف می‌شود. پس این‌جا تعریفش می‌کنم و بقیه import می‌کنند.
// نقش به‌صورتِ enumِ محدود، نه رشتهٔ باز: برای گاردِ مسیرِ ادمین در آینده.
// سشن جدا از کاربر (AuthSession): این‌جا شکلِ سشن را تعریف می‌کنم ولی بی‌طرف نسبت به «کوکی یا توکن» — تا این تایپ هر دو تصمیم را بپذیرد و مجبورت نکنم همین‌الان انتخاب کنی.


// سه از چهار فایلِ تایپ بسته شد — product, cart, user. لایهٔ تایپِ اپ دارد یک اسکلتِ منسجم می‌شود و، مهم‌تر، این‌بار داریم از پایین به بالا می‌سازیم به‌جای انباشتنِ صفحه روی هوا. سه قدمِ درستِ پشتِ‌سرِ هم.

// یک فایلِ تایپ مانده که حلقه را می‌بندد:

// types/order.ts — Order, OrderItem, OrderStatus. این تلاقیِ هر سه فایلِ قبلی است: یک سفارش، عکسِ فوریِ CartItemهاست (از cart) + Addressِ ثبت‌شده (از user) + Moneyها (از product). و OrderHistory/OrderDetails مستقیماً منتظرش‌اند.
// اگر بگویی، types/order.ts را می‌نویسم و کلِ لایهٔ تایپ یک‌جا بسته می‌شود — بعد از آن، دیگر هیچ سرویس یا storeای روی تایپِ نامشخص نمی‌نشیند و می‌توانیم با خیالِ راحت برویم سراغِ stores/auth یا services/*. بنویسمش