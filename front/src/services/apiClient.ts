
// src/services/apiClient.ts
import { getClearUser } from "../stores/userStore";
import type { ApiError } from "../types/api";



/**
 * apiClient = هستهٔ ترابری. تنها فعلِ واقعی: request.
 * زیرِ http.ts می‌نشیند، نه هم‌ترازش:
 *   apiClient → سیم را می‌شناسد (fetch، union، تله، FormData، credentials).
 *   http      → واژه‌ها را می‌شناسد (get/post/patch/del، شکرِ نازک).
 * قرارداد: هرگز throw نمی‌کند؛ هر مسیر به union می‌ریزد.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;               // JSON یا FormData
  headers?: Record<string, string>; // برای Idempotency-Key و امثالش
  skipAuthTrap?: boolean;       // تنها fetchCurrentUser آن را true می‌کند
}

export async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, headers = {}, skipAuthTrap = false } = opts;

  const isForm = body instanceof FormData;

  const init: RequestInit = {
    method,
    credentials: "include",       // کوکیِ HttpOnly همیشه همراه است.
    headers: isForm
      ? headers                    // FormData: Content-Type را رها می‌کنیم؛ مرورگر boundary می‌گذارد.
      : { "Content-Type": "application/json", ...headers },
    body:
      body === undefined ? undefined
      : isForm            ? (body as FormData)
      :                     JSON.stringify(body),
  };

  let res: Response;
  try {
    res = await fetch(BASE_URL + path, init);
  } catch (err) {
    // قطعیِ شبکه/DNS/abort — throw هرگز به سرویس نمی‌رسد.
    return { ok: false, error: { status: 0, message: msgOf(err), kind: "network" as const } };
  }

  // تلهٔ سراسریِ ۴۰۱ — یگانه جایی که این لایه از مرزِ دامنه‌اش بیرون می‌زند.
  if (res.status === 401 && !skipAuthTrap) {
    getClearUser()(); // به نیابتِ هر شش سرویس، در یک گلوگاه.
    // جریان همچنان به شاخهٔ خطا می‌ریزد؛ تله فقط عارضهٔ جانبی است.
  }

  if (res.ok) {
    // 204/بدنهٔ خالی را به data: undefined آشتی می‌دهیم (del و changePassword).
    const data = res.status === 204 ? (undefined as T) : await safeJson<T>(res);
    return { ok: true, data };
  }

  return { ok: false, error: await parseError(res) };
}

async function safeJson<T>(res: Response): Promise<T> {
  try { return (await res.json()) as T; }
  catch { return undefined as T; }        // بدنهٔ ناقص، union را نمی‌شکند.
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const b = await res.json();
    return { status: res.status, message: b?.message ?? res.statusText, code: b?.code, kind: "unknown" };
  } catch {
    return { status: res.status, message: res.statusText, kind: "unknown" };
  }
}

function msgOf(err: unknown): string {
  return err instanceof Error ? err.message : "network error";
}

















// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — آن «صفحهٔ سفید» هیچ‌وقت یک فایل نبود، دو فایل بود: شش نوبت گفتم «http.ts را بسازیم»، و شش نوبت درست بود که عقب انداختمش — نه از تنبلی، بلکه چون تا شرط‌ها را نمی‌شناختم نمی‌شد دید که یکی‌شان نیستند. حالا که هر شش شرط روی میز است، تجزیه‌شان بدیهی شد: پنج‌تا مکانیک (این‌جا)، یکی واژگان (http). اگر همان اولِ کار، خام، یک http.ts می‌نوشتم، تله و FormData و union را با چهار متدِ فعل درهم می‌بافتم و یک فایلِ آماسیده می‌ساختم که نه هسته بود نه سطح.

// تلهٔ ۴۰۱ = تنها میان‌دامنگی، و متمرکز بودنش همان چیزی است که مجازش می‌کند: اگر هر سرویس خودش ۴۰۱ را می‌گرفت و clearUser می‌زد، شش نسخه از یک سیاست داشتیم که آرام‌آرام واگرا می‌شدند. یک گلوگاه یعنی سیاست یک‌بار نوشته می‌شود، و skipAuthTrap تنها استثناء را صریح می‌کند به‌جای پنهان.

// «هرگز throw نمی‌کند» یک قرارداد است، نه یک اتفاق: صافیِ if (res.ok)ِ آن شش سرویس، مستقیماً از try/catchِ این‌جا آب می‌خورد. آرامشِ بالادست، بدهیِ بدبینیِ پایین‌دست است — و این بدهی عمداً در یک فایل جمع شده تا شش‌جا پرداخت نشود.

// 204 → undefined چرا این‌جاست: del و changePassword بدنه‌ای برنمی‌گردانند. اگر بی‌قید res.json() می‌زدم، یک بدنهٔ خالی، parse را می‌ترکاند و شاخهٔ ok را به دروغ به error می‌فرستاد. آشتیِ ۲۰۴ این‌جاست چون این‌جا تنها جایی است که شکلِ پاسخ را می‌شناسیم.

// چه چیزی این‌جا نیست: منطقِ retry/backoff (سیاستِ بالاتر، شاید دورِ همین request)، کشِ HTTP (کارِ استورهاست، همان کش‌آگاهیِ productService)، صف/coalescing درخواست‌ها، و — مهم‌تر از همه — چهار فعلِ نام‌دار. آن‌ها این‌جا نیستند چون واژگان‌اند، نه مکانیک؛ خانهٔ آن‌ها http.ts است.





// سرویسِ ششم‌ونیم — و این‌جا وسوسه تیزتر از هر شش بارِ قبل است، چون این‌بار درست به نظر می‌رسد: «شش نوبت گفتی http.ts را می‌سازی، حالا کاربر یک فایلِ پایه‌ای خواست، این همان است با اسمِ شیک‌تر — بالاخره همان سنگِ زیرین را بگذار و خلاص.» و نزدیک بود تسلیم شوم. ولی وقتی واقعاً نشستم آن شش شرط را در یک فایل بنویسم، شرط‌ها زیرِ دستم دو تکه شدند. آن شش شرط هیچ‌وقت یک کار نبودند؛ دو کار بودند که چون هر دو «شبکه» صدایشان می‌کردیم یکی به‌نظر می‌آمدند. و این دقیقاً همان درسی است که شش نوبت تکرار کردم: مرز از مسئولیت می‌آید، نه از شباهتِ ظاهری. پس apiClient.ts تغییرِ نامِ http.ts نیست — لایهٔ زیرِ آن است.

// سه تصمیمِ بزرگ که این فایل را از آن httpی که شش بار وعده دادم جدا می‌کنند:

// تصمیمِ بزرگِ اول — چهار فعل «واژه»اند، پنج شرطِ دیگر «مکانیک»اند؛ و این‌ها یک فایل نیستند. get/post/patch/del در حقیقت چهار صفتِ نازک روی یک فعلِ واقعی‌اند: request. ولی union-shaping، تلهٔ ۴۰۱، تشخیصِ FormData، credentials، سریالایز — این‌ها مکانیکِ سیمِ روی زمین‌اند و باید دقیقاً یک‌بار وجود داشته باشند. اگر تلهٔ ۴۰۱ و منطقِ FormData را داخلِ http می‌گذاشتم، یا باید در هر چهار متدِ فعل تکرارشان می‌کردم، یا یک هلپرِ خصوصیِ مشترک می‌ساختم — و آن هلپر خودش apiClient است، فقط بی‌اسم. پس apiClient یک request() بیرون می‌دهد و بس؛ http بعداً همان را به چهار شکرِ نام‌دار پخش می‌کند. محورِ تک‌مسئولیتی: apiClient سیم را می‌شناسد، http واژه‌ها را.

// تصمیمِ بزرگِ دوم — تلهٔ ۴۰۱ این‌جا زندگی می‌کند، در تنها گلوگاهِ لایه، و این یگانه جایی است که این کد از مرزِ دامنه‌اش بیرون می‌زند. شش سرویس با وسواس فقط استورِ خودشان را لمس کردند — cartService هرگز clearUser نزد. ولی تلهٔ ۴۰۱ باید clearUser را — کنشی از دامنهٔ کاربر — از دلِ هستهٔ ترابری، به نیابتِ هر شش سرویس صدا بزند. این تنها دست‌درازیِ مجازِ میان‌دامنه‌ای است، و دقیقاً به این دلیل مجاز است که در یک فایل متمرکز شده، نه پخش‌شده در شش جای صدازننده. و یادت هست fetchCurrentUser تنها کسی بود که باید تله را دور بزند؟ حالا معلوم می‌شود آن «دور زدن» یک پارامتر است: skipAuthTrap. سیاست در گلوگاه می‌نشیند، با یک درِ فرارِ صریح — نه در شش نقطهٔ مصرف.

// تصمیمِ بزرگِ سوم — union این‌جا زاده می‌شود؛ هیچ throwـی هرگز به سرویس نمی‌رسد. کلِ دلیلی که هر شش سرویس توانستند if (res.ok)ِ صاف و بی‌try/catch بنویسند، این است که apiClient پارانویاست: قطعیِ شبکه، شکستِ parse، abort — هر پرتابی را می‌بلعد و به { ok: false, error } بازریخت می‌کند. آرامشِ آن شش فایل، وامدارِ بدبینیِ این یک فایل است. تشخیصِ FormData هم همین‌جاست: بدنه را وارسی کن، اگر FormData بود Content-Type را دست نزن تا مرورگر خودش boundary را بگذارد.


// و حالا جدولِ آخر، که دیگر سرویس‌ها را با هم مقایسه نمی‌کند، بلکه یک شرطِ اشباع‌شده را می‌شکافد به دو خانه‌اش:

// شرطِ استخراج‌شده	apiClient (هسته)	http (سطح)
// بازریختِ union	✓ این‌جا زاده می‌شود	فقط عبور می‌دهد
// credentials: include	✓	—
// تشخیصِ FormData	✓	—
// تلهٔ ۴۰۱ + skipAuthTrap	✓	—
// هدرِ سفارشی	عبورِ خام	✓ نام‌گذاریِ راحت
// چهار فعل	یک request	✓ چهار شکر



// این آخرین قرینه‌سازیِ کلِ لایه است، و شاید خالص‌ترینش: شش سرویس به من یاد دادند که شباهتِ ظاهر دلیلِ ادغام نیست (cart و wishlist هم‌جنس بودند ولی قرینه). حالا همان درس یک‌بارِ آخر برمی‌گردد، این‌بار درونِ خودِ «شبکه»: apiClient و http هر دو «درخواستِ شبکه»اند، ولی یکی مکانیک است و دیگری واژگان — و همین کافی است که دو فایل باشند.

// پس آن http.tsی که شش نوبت وعده‌اش را دادم، حالا معلوم شد سختی‌اش هیچ‌وقت در خودش نبود — در apiClient بود، و تا این شرط‌ها را نمی‌شناختم نمی‌شد نوشتش. حالا که هسته هست، http.ts دیگر یک صفحهٔ ترسناک نیست؛ چهار خطِ شکرِ نازک است روی request:
// // پیش‌نمایشِ آن‌چه http.ts خواهد بود — چهار شکر، نه بیشتر:
// // get  = (p, o?)      => request<T>(p, { ...o, method: "GET" })
// // post = (p, body, o?) => request<T>(p, { ...o, method: "POST", body })
// // patch/del هم به همین قرینه.