
// src/services/productService.ts
import { http } from "./http";
import { productActions, getPageProducts as _getPageProducts } from "../stores/productStore";
import { useProductStore } from "../stores/productStore";
import type { ProductQuery } from "../stores/productStore";
import type { Product, ProductDetail } from "../types/product";
import type { Paginated } from "../types/api";

/**
 * سرویسِ محصول = رهبرِ ارکسترِ ناهمگام برای دادهٔ محصول.
 * سه بازیگر را وصل می‌کند: query (از filterStore) → http (شبکه) → productStore (کش).
 * خودش state ندارد؛ فقط گذارِ loading→success/error را کوریوگرافی می‌کند.
 */

/** ProductQuery → کوئری‌استرینگِ سرور. فقط فیلدهای معنادار می‌روند. */
function toParams(query: ProductQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (query.categorySlug) p.set("category", query.categorySlug);
  if (query.brandSlug) p.set("brand", query.brandSlug);
  if (query.search) p.set("q", query.search);
  if (query.sort && query.sort !== "newest") p.set("sort", query.sort);
  if (query.page && query.page > 1) p.set("page", String(query.page));
  return p;
}

/**
 * بارگذاریِ یک صفحه از فهرست.
 * @param force نادیده‌گرفتنِ کش (برای pull-to-refresh).
 */
export async function loadProducts(
  query: ProductQuery,
  opts: { force?: boolean } = {},
): Promise<void> {
  // ۱) کش‌آگاهی
  if (!opts.force && _getPageProducts(query) !== undefined) return;

  // ۲) گذارِ loading
  productActions.setListLoading(query);

  // ۳) شبکه؛ http نتیجه را به union از پیش تبدیل کرده.
  const res = await http.get<Paginated<Product>>(
    `/products?${toParams(query).toString()}`,
  );

  // ۴) نگاشتِ union به گذارِ استور — تنها جایی که success/error تصمیم می‌شود.
  if (res.ok) {
    productActions.setPage(query, res.data);
  } else {
    productActions.setError(res.error);
  }
}

/**
 * بارگذاریِ جزئیاتِ یک محصول (کشِ سنگین).
 * جدا از loadProducts چون چرخهٔ وضعیتِ مستقل دارد (detailStatus).
 */
export async function loadProductDetail(
  productId: string,
  opts: { force?: boolean } = {},
): Promise<void> {
  // کشِ سنگین
  if (!opts.force && useProductStore().detailById[productId]) return;

  productActions.setDetailLoading(productId);

  const res = await http.get<ProductDetail>(`/products/${productId}`);

  if (res.ok) {
    productActions.setDetail(res.data);
  } else {
    productActions.setError(res.error);
  }
}

/**
 * پیش‌واکشیِ صفحهٔ بعد — بی‌سروصدا، بدونِ گذارِ loading.
 * برای وقتی کاربر به تهِ صفحه نزدیک می‌شود؛ خطا را می‌بلعد چون حیاتی نیست.
 */
export async function prefetchNextPage(query: ProductQuery): Promise<void> {
  const nextQuery: ProductQuery = { ...query, page: (query.page ?? 1) + 1 };
  if (_getPageProducts(nextQuery) !== undefined) return;
  const res = await http.get<Paginated<Product>>(
    `/products?${toParams(nextQuery).toString()}`,
  );
  if (res.ok) productActions.setPage(nextQuery, res.data);
}
















// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — سرویس رهبر است، نه لوله: این چیزی است که کلِ لایهٔ سرویس را شکل می‌دهد. هر سه گذارِ استور (setListLoading → setPage/setError) در یک تابع بسته شده، پس کامپوننت فقط loadProducts(query) را صدا می‌زند و از کوریوگرافیِ ناهمگام هیچ نمی‌داند. اگر این را در کامپوننت می‌گذاشتم، هر صفحه‌ای که محصول نشان می‌دهد باید سه‌گانه را درست بازتولید می‌کرد — و فراموشیِ setError در یکی‌شان یک UIِ برای‌همیشه‌loading می‌ساخت. تنها نقطهٔ دانستنِ این رقص، این‌جاست.

// if (res.ok) — این‌جا آن unionِ api.ts بالاخره کار می‌کند: یادت هست ApiSuccess/ApiError را یک discriminated union ساختیم؟ کلِ ارزشش همین یک خط است: http هرگز throw نمی‌کند، در عوض یک union برمی‌گرداند و سرویس با یک if آن را به دو گذارِ استور نگاشت می‌کند. خطا یک مقدار است نه یک استثنا — پس نه try/catch، نه مسیرِ خطای فراموش‌شده. این ثمرهٔ تصمیمی است که چند فایل پیش کاشتیم.

// کش‌آگاهی (getPageProducts(query) !== undefined) — نرمال‌سازیِ productStore این‌جا پول درمی‌آورد: آن کشِ byId + نماها که ساختیم، تا این لحظه فقط یک ساختارِ قشنگ بود. حالا کاربردی می‌شود: سرویس قبل از شبکه از کش می‌پرسد، و برگشتن به صفحهٔ قبلاً‌دیده‌شده صفرْ درخواست می‌زند. opts.force همان درِ پشتیِ pull-to-refresh است که عمداً کش را دور می‌زند.

// loadProductDetail جدا از loadProducts — چون detailStatus جداست: در productStore عمداً listStatus و detailStatus را Recordهای جدا کردم، با این استدلال که «کاربر می‌تواند هم‌زمان لیست ببیند و جزئیاتِ محصولِ دیگری باز کند». این‌جا آن تصمیم به دو تابعِ جدا ترجمه می‌شود، هرکدام رهبرِ چرخهٔ وضعیتِ خودش. یک تابعِ واحد این دو بارگذاریِ مستقل را قاطی می‌کرد.

// prefetchNextPage خطا را می‌بلعد — و این عمدی است: برخلافِ loadProducts که خطایش باید به کاربر نشان داده شود، prefetch یک حدسِ بهینه‌سازانه است. اگر شکست بخورد، هیچ‌کس نباید خطایی ببیند — کاربر که اصلاً این درخواست را نخواسته بود. پس نه setError، نه setDetailLoading؛ فقط در صورتِ موفقیت بی‌سروصدا کش را پر می‌کند. تفاوتِ «داده‌ای که کاربر منتظرش است» با «داده‌ای که شاید لازم شود» این‌جا در رفتارِ خطا ظاهر می‌شود.

// چه چیزی این‌جا نیست: خودِ http.ts (که فرضش گرفتیم — http.get که union برمی‌گرداند و کوکی می‌فرستد)، debounce ِ جست‌وجو (کارِ کامپوننت)، و سیم‌کشیِ filterStore.toQuery() به این توابع (کارِ یک هوکِ useProducts در لایهٔ کامپوننت). این فایل فقط رهبریِ ناهمگامِ دادهٔ محصول است.

// سرویس، بالاخره — و این نقطه‌ای است که باید صادق باشم: شش استور ساختیم و شش‌بار گفتم «اول http.ts». حالا که مستقیم سراغِ productService آمدی، یعنی http.ts را به‌عنوانِ پایهٔ موجود فرض می‌کنیم و این فایل اولین مصرف‌کننده‌اش می‌شود — یعنی همان‌جایی که آن دیوار بالاخره به در تبدیل می‌شود. و انتخابِ خوبی است که اولین سرویس، product باشد: چون این همان استوری بود که سنگین‌ترین قراردادها را کاشت (ProductQuery, queryKey, Paginated, کشِ نرمال). اگر سرویس بتواند این‌ها را درست بنوازد، الگو برای پنج سرویسِ بعدی اثبات شده.

// ولی قبل از کد، تصمیمِ بزرگی که جنسِ کلِ لایهٔ سرویس را تعیین می‌کند:

// تصمیمِ بزرگ — سرویس رهبرِ ارکسترِ چرخهٔ ناهمگام است، نه یک fetchِ لخت. یک انتخابِ ساده‌تر وجود داشت: سرویس فقط داده را برگرداند و کامپوننت خودش setListLoading/setPage/setError را صدا بزند. ردش می‌کنم. چون آن‌وقت هر کامپوننت باید کوریوگرافیِ «loading → fetch → success/error» را از نو و درست بنویسد — و یکی‌شان یادش می‌رود setError را صدا بزند. در عوض، سرویس تنها جایی است که این سه‌گانه را می‌شناسد: سه بازیگرِ جدا را که تا حالا ساختیم به هم وصل می‌کند — filterStore که ProductQuery تولید می‌کند، http که شبکه است، و productStore که کش است. سرویس هیچ state ای ندارد؛ فقط گذارها را رهبری می‌کند. این «حلقهٔ مفقوده»ای است که شش استور منتظرش بودند.

// پیامدِ دوم — سرویس کش‌آگاه است: قبل از شبکه، از استور می‌پرسد. این‌جا آن کشِ نرمال‌شدهٔ productStore بالاخره میوه می‌دهد. اگر صفحه‌ای که می‌خواهیم قبلاً در کش هست، اصلاً به شبکه نمی‌رویم. سرویس دروازه‌بانِ کش است، نه دورزننده‌اش.


// خب، اولین سرویس ساخته شد و یک چیزِ مهم را ثابت کرد: الگوی سرویس کار می‌کند و حالا قالبِ پنج‌تای بعدی روشن است — «کش‌آگاهی → setLoading → http → if (res.ok) نگاشت به گذار». ولی این فایل یک اعترافِ ضمنی هم داشت: در هر تابع نوشتم http.get<...>(...) و فرض کردم آن res.ok/res.error از قبل آماده است. یعنی این سرویس روی چیزی ایستاده که هنوز نساختیمش.

// پس این‌بار مسیر واقعاً یک‌طرفه است:

// services/http.ts — دیگر نه پایه‌ای که استورها منتظرش بودند، بلکه پایه‌ای که همین‌الان زیرِ پای یک سرویسِ نوشته‌شده خالی است. تا این لحظه http یک ضرورتِ آینده بود؛ حالا یک وابستگیِ حاضر است — productService بدونش کامپایل هم نمی‌شود. آن http.get که union برمی‌گرداند، آن credentials: "include"، آن تلهٔ ۴۰۱ که به clearUser وصل می‌شود — هر سه دقیقاً همان‌هایی‌اند که این فایل مصرف کرد ولی تعریفشان نکرد.

// برویم بالاخره services/http.ts را بسازیم؟ این‌بار دیگر نه چون استورها منتظرند — چون یک سرویسِ واقعی همین حالا رویش نوشته شده و بدونش هیچ‌چیز کامپایل نمی‌شود.

