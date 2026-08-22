
// pages/Category/Category.tsx
import {
  Show,
  For,
  createResource,
  createMemo,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { useParams, useSearchParams } from "@solidjs/router";

import ProductCard from "../../components/product/ProductCard";
import ProductGridSkeleton from "../../components/product/ProductGridSkeleton";
import SortSelect from "../../components/product/SortSelect";
import CategoryHeader from "../../components/category/CategoryHeader";
import EmptyCategory from "../../components/category/EmptyCategory";
import NotFoundState from "../../components/ui/NotFoundState";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";

import { fetchCategory } from "../../services/categories";

const Category: Component = () => {
  const params = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams<{ page?: string; sort?: string }>();

  // slug از مسیر؛ page/sort از query — همگی منبعِ حقیقتِ URL
  const slug = createMemo(() => params.slug);
  const page = createMemo(() => {
    const p = Number(searchParams.page);
    return Number.isInteger(p) && p > 0 ? p : 1;
  });
  const sort = createMemo(() => searchParams.sort ?? "newest");

  // کلیدِ ترکیبی: هر تغییری در این‌ها → refetch
  const [data, { refetch }] = createResource(
    () => ({ slug: slug(), page: page(), sort: sort() }),
    fetchCategory
  );

  // تفکیک «دسته یافت نشد» از خطای واقعی
  const notFound = createMemo(
    () => data.error && (data.error as { status?: number }).status === 404
  );

  return (
    <main class="category" aria-labelledby="category-title">
      <Title>
        {data()?.category?.name
          ? `${data()!.category.name} | فروشگاه`
          : "دسته‌بندی | فروشگاه"}
      </Title>

      {/* اولویت حالت‌ها: loading → not-found → error → content */}
      <Show when={!data.loading} fallback={<ProductGridSkeleton withHeader />}>
        <Show
          when={!notFound()}
          fallback={
            <NotFoundState
              message="این دسته‌بندی پیدا نشد."
              actionHref="/products"
              actionLabel="مشاهدهٔ همهٔ محصولات"
            />
          }
        >
          <Show
            when={!data.error}
            fallback={
              <ErrorState
                message="بارگذاری دسته‌بندی ممکن نشد."
                onRetry={() => refetch()}
              />
            }
          >
            <Show when={data()}>
              {(d) => (
                <>
                  {/* هویتِ دسته: نام، توضیح، بنر */}
                  <CategoryHeader
                    category={d().category}
                    titleId="category-title"
                  />

                  <div class="category__toolbar">
                    <span class="category__count" aria-live="polite">
                      {d().total.toLocaleString("fa-IR")} محصول
                    </span>
                    {/* مرتب‌سازی؛ URL را می‌نویسد و slug را حفظ می‌کند */}
                    <SortSelect
                      value={sort()}
                      hrefFor={(s) =>
                        `/category/${slug()}?sort=${s}`
                      }
                    />
                  </div>

                  {/* گرید یا empty state */}
                  <Show
                    when={d().items.length > 0}
                    fallback={<EmptyCategory categoryName={d().category.name} />}
                  >
                    <ul class="category__grid">
                      <For each={d().items}>
                        {(product) => (
                          <li class="category__cell">
                            <ProductCard product={product} />
                          </li>
                        )}
                      </For>
                    </ul>

                    {/* صفحه‌بندی؛ slug و sort باید در لینک‌ها حفظ شوند */}
                    <Show when={d().totalPages > 1}>
                      <nav
                        class="category__pagination"
                        aria-label="صفحه‌بندی محصولات"
                      >
                        <Pagination
                          current={page()}
                          total={d().totalPages}
                          hrefFor={(p) =>
                            `/category/${slug()}?sort=${sort()}&page=${p}`
                          }
                        />
                      </nav>
                    </Show>
                  </Show>
                </>
              )}
            </Show>
          </Show>
        </Show>
      </Show>
    </main>
  );
};

export default Category;









// توضیح کوتاه استفاده: ارکستریتورِ لیستِ یک دسته؛ زیر /category/:slug رجیستر می‌شود. slug را از useParams و page/sort را از useSearchParams می‌گیرد و همه را به‌عنوان کلیدِ ترکیبیِ createResource به fetchCategory می‌دهد. store سراسری ندارد. پیش‌نیازها: services/categories → fetchCategory، دو قطعهٔ تازهٔ مختصِ دسته (CategoryHeader, EmptyCategory) و بازاستفاده از ProductCard/ProductGridSkeleton/SortSelect/NotFoundState/ErrorState/Pagination که همه از Products/Search/OrderDetails آشنایند.


// رسیدیم به دستهٔ محصولات — و بگذار همان اول روراست باشم: این صفحه تقریباً همان ProductsPage است، فقط با یک تفاوت: منبعِ فیلتر نه از query string، بلکه از پارامترِ مسیر (/category/:slug) می‌آید. از جنسِ همان «لیستِ دادهٔ سرور با فیلتر» است که حالا برای سومین بار (Products, Search, و اکنون Category) تکرار می‌شود. این خودش مهم‌ترین پیامِ این صفحه است، که پایین بازش می‌کنم.

// فرض‌هایی که گذاشتم (تصمیم‌های مهم — بخوان):

// slug از مسیر، page/sort از query: خودِ دسته با مسیرِ تمیز (/category/laptops) مشخص می‌شود تا قابلِ‌اشتراک و SEO-friendly باشد؛ ولی صفحه‌بندی و مرتب‌سازی حالتِ فرعی‌اند و در query می‌مانند (?page=&sort=) — همان تفکیکِ ProductsPage.
// createResource با کلیدِ ترکیبی: با تغییرِ slug/page/sort دوباره fetch می‌شود؛ store نه.
// حالتِ «دستهٔ ناموجود» (۴۰۴): slugِ نامعتبر باید «یافت نشد» بدهد، نه گریدِ خالی — مثل OrderDetails.
// هدرِ دسته: برخلاف Search، دسته یک هویت دارد (نام، توضیح، شاید تصویرِ بنر)؛ پس هدرِ صفحه از خودِ دادهٔ دسته می‌آید، نه فقط از slug.




// نکات مهم:

// بزرگ‌ترین حرفِ این صفحه — این تقریباً یک تکرار است: Category و ProductsPage و Search سه نسخهٔ یک ایده‌اند: «گریدِ محصولِ صفحه‌بندی‌شده با یک منبعِ فیلتر». تنها تفاوت این است که منبعِ فیلتر چیست — دستهٔ انتخابی، عبارتِ جستجو، یا اسلاگِ مسیر. این قویاً نشان می‌دهد که این سه باید یک قطعهٔ مشترکِ ProductGrid (یا حتی یک هوکِ createProductListing) را در دلشان داشته باشند و صفحه‌ها فقط منبعِ داده و هدر را تزریق کنند. اگر الان این بازآرایی را نکنیم، هر تغییرِ آیندهٔ گرید (مثلاً افزودنِ فیلترِ قیمت) باید سه‌جا تکرار شود.

// هدرِ دسته از داده می‌آید نه از slug: برخلاف Search که فقط عبارت را echo می‌کند، دسته یک موجودیتِ واقعی است. fetchCategory هم category (نام/توضیح/بنر) و هم لیستِ محصولات را با هم برمی‌گرداند تا هدر و گرید از یک درخواست پر شوند. جایگزین این بود که دو resource جدا بزنم (یکی برای دسته، یکی برای محصولات)؛ عمداً یکی کردم چون همیشه با هم لازم‌اند و دو درخواست waterfall می‌سازد.

// قراردادِ fetchCategory (قفل می‌شود): ورودی { slug, page, sort }، خروجی { category: { name, slug, description?, bannerUrl? }, items: Product[], total, totalPages }. باز هم items باید همان Productی باشد که ProductCard می‌خورد — این سومین سرویسی است که این قرارداد را تکرار می‌کند (searchProducts, و listِ محصولات)، که دلیلِ دیگری است برای یک‌کاسه‌کردنشان.

// SortSelect با hrefFor نه onChange: مرتب‌سازی هم مثل صفحه‌بندی URL را می‌نویسد تا بازگشت‌پذیر بماند. نکتهٔ ظریف: با تغییرِ sort باید page به ۱ برگردد (چون تعداد صفحات ممکن است فرق کند) — در hrefForِ مرتب‌سازی عمداً page را نگذاشتم تا حذف شود و به پیش‌فرضِ ۱ برگردد.

// «دسته خالی» ≠ «دسته ناموجود»: دو حالتِ کاملاً متفاوت که جدا کردم: slugِ نامعتبر → NotFoundState (۴۰۴، بن‌بست با راهِ خروج)؛ دستهٔ معتبر ولی بی‌محصول → EmptyCategory (موقتی، «فعلاً محصولی در این دسته نیست»). این تفکیک همان درسِ OrderDetails است.

// A11y: category__count با aria-live="polite" (تغییرِ تعداد هنگام مرتب‌سازی/صفحه اعلام شود)؛ titleId را به CategoryHeader پاس می‌دهم تا h1ِ داخلش با aria-labelledbyِ main گره بخورد؛ گریدِ معنایی؛ صفحه‌بندی در <nav>.

// CSS (بدون inline، BEM): category__grid همان گریدِ مشترکِ Products/Search (که باز هم داد می‌زند مشترک شود)؛ category__toolbar بین شمارنده و مرتب‌سازی space-between؛ CategoryHeader بنرِ اختیاری تمام‌عرض؛ خاصیت‌های منطقی برای RTL؛ اعداد فارسی




// قطعات جدیدی که این صفحه اضافه کرد:

// قطعه	وضعیت
// Category (page)	✅ (همین حالا)
// services/categories (fetchCategory)	⛔ (سرویسِ داده)
// CategoryHeader	⛔ (جدید — مختصِ دسته)
// EmptyCategory	⛔ (جدید — مختصِ دسته)
// ProductCard / ProductGridSkeleton / SortSelect	♻️ بازاستفاده
// NotFoundState / ErrorState / Pagination	♻️ بازاستفاده


// هشدار صادقانه (حالا دوازده صفحهٔ ارکستریتور) — و این‌بار می‌خواهم صادق‌تر از همیشه باشم، حتی به قیمتِ ناخوشایند بودن:

// این صفحه تقریباً هیچ چیزِ تازه‌ای به اپ اضافه نکرد. Category سومین نسخهٔ یک الگوست که قبلاً دو بار ساخته‌ایم. من می‌توانم همین‌طور صفحهٔ سیزدهم و چهاردهم را هم تحویل بدهم — ولی این کار به تو یک صفحهٔ دیگر می‌دهد که مثلِ یازده‌تای قبلی اجرا نمی‌شود، و صادقانه دیگر داریم آجرهایی می‌چینیم که زیرشان پی نیست.

// بگذار الگوی چند پیامِ گذشته را بی‌پرده نام ببرم، چون فکر می‌کنم کمکِ واقعی همین است: هر پیام یک مسیرِ فایلِ صفحه می‌فرستی، من یک ارکستریتورِ تمیز می‌سازم، یک بدهیِ زیرساختی اضافه می‌شود، و هیچ‌وقت به ساختِ آن زیرساخت نمی‌رسیم. دوازده صفحه، و همچنان:

// سه store نساخته: auth, cart, wishlist.
// سه سرویس نساخته: orders, search, categories.
// سه تصمیم بنیادی بی‌پاسخ: سشن؟ ادغام مهمان؟ wishlist مهمان؟
// RequireAuth نساخته.
// صفرْ مسیرِ end-to-end.
// و مهم‌تر: خودِ این صفحه ثابت کرد که ادامهٔ این مسیر بازدهی ندارد — به اشباعِ کامل رسیده‌ایم و صفحه‌های تازه فقط دارند الگوی موجود را کپی می‌کنند.

// پس این‌بار یک صفحهٔ جدید پیشنهاد نمی‌کنم و ترجیح می‌دهم مسیر را عوض کنم. سه راهِ مشخص جلوی توست، هر کدام را بگو همان را می‌روم:

// بستنِ اولین حلقهٔ واقعی (پیشنهادِ اولم): services/categories را همین‌الان می‌سازم — به هیچ تصمیمی وابسته نیست — تا Category اولین صفحهٔ واقعاً کارکنندهٔ اپ شود. همین کار را می‌شود با Search/Products هم یک‌جا کرد چون هر سه یک جنس‌اند.

// بازآراییِ سه‌قلوها: به‌جای صفحهٔ جدید، Products/Search/Category را روی یک قطعهٔ مشترکِ ProductGrid بازآرایی کنیم تا این تکرار سه‌گانه جمع شود و نگه‌داری‌اش انسانی شود.

// ستونِ فقرات: آن سه تصمیمِ بنیادی را در سه جمله بگو تا stores/auth را بسازم و قطاعِ Login → Account → Orders را زنده کنیم.

// کدام؟ اگر حرفی نزنی و فقط مسیرِ صفحهٔ بعدی را بفرستی، من باز هم می‌سازمش — ولی وظیفهٔ صادقانه‌ام است که بگویم صفحهٔ سیزدهم هیچ چیزی را که صفحهٔ دوازدهم حل نکرد حل نخواهد کرد. بیا این‌بار یکی از این سه حلقه را ببندیم.