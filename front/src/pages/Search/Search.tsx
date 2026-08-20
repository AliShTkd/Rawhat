
// pages/Search/Search.tsx
import {
  Show,
  For,
  createResource,
  createMemo,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";

import ProductCard from "../../components/product/ProductCard";
import ProductGridSkeleton from "../../components/product/ProductGridSkeleton";
import SearchIdleState from "../../components/search/SearchIdleState";
import NoSearchResults from "../../components/search/NoSearchResults";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";

import { searchProducts } from "../../services/search";

const Search: Component = () => {
  const [searchParams] = useSearchParams<{ q?: string; page?: string }>();

  // عبارت و صفحه از URL — منبع حقیقت
  const query = createMemo(() => (searchParams.q ?? "").trim());
  const page = createMemo(() => {
    const p = Number(searchParams.page);
    return Number.isInteger(p) && p > 0 ? p : 1;
  });

  // آیا اصلاً جستجویی شروع شده؟ (حالتِ idle در برابر empty)
  const hasQuery = createMemo(() => query().length > 0);

  // کلیدِ resource: فقط وقتی q هست، fetch کن؛ وگرنه resource اجرا نمی‌شود
  const [results, { refetch }] = createResource(
    () => (hasQuery() ? { q: query(), page: page() } : false),
    searchProducts
  );

  return (
    <main class="search" aria-labelledby="search-title">
      <Title>
        {hasQuery() ? `جستجو: ${query()} | فروشگاه` : "جستجو | فروشگاه"}
      </Title>

      <div class="search__head">
        <h1 class="search__title" id="search-title">
          <Show when={hasQuery()} fallback="جستجو">
            نتایج جستجو برای «{query()}»
          </Show>
        </h1>
        {/* شمارندهٔ نتایج فقط وقتی داده آماده و غیرخالی است */}
        <Show when={hasQuery() && results()?.total}>
          <span class="search__count" aria-live="polite">
            {results()!.total.toLocaleString("fa-IR")} نتیجه
          </span>
        </Show>
      </div>

      {/* حالتِ idle: هنوز عبارتی وارد نشده */}
      <Show
        when={hasQuery()}
        fallback={<SearchIdleState />}
      >
        {/* اولویت حالت‌ها: loading → error → empty → grid */}
        <Show
          when={!results.loading}
          fallback={<ProductGridSkeleton />}
        >
          <Show
            when={!results.error}
            fallback={
              <ErrorState
                message="جستجو با خطا مواجه شد."
                onRetry={() => refetch()}
              />
            }
          >
            <Show
              when={(results()?.items.length ?? 0) > 0}
              fallback={<NoSearchResults query={query()} />}
            >
              <ul class="search__grid">
                <For each={results()!.items}>
                  {(product) => (
                    <li class="search__cell">
                      <ProductCard product={product} />
                    </li>
                  )}
                </For>
              </ul>

              {/* صفحه‌بندی؛ q باید در لینک‌ها حفظ شود */}
              <Show when={(results()?.totalPages ?? 1) > 1}>
                <nav class="search__pagination" aria-label="صفحه‌بندی نتایج">
                  <Pagination
                    current={page()}
                    total={results()!.totalPages}
                    hrefFor={(p) =>
                      `/search?q=${encodeURIComponent(query())}&page=${p}`
                    }
                  />
                </nav>
              </Show>
            </Show>
          </Show>
        </Show>
      </Show>
    </main>
  );
};

export default Search;

















// توضیح کوتاه استفاده: این یک ارکستریتورِ نتایجِ جستجو است؛ زیر مسیر /search رجیستر می‌شود و q/page را از query stringِ URL می‌خواند (نه state محلی)، تا نتایج قابلِ اشتراک و بازگشت‌پذیر بمانند. SearchBar (که در هدر است و قبلاً ساخته‌ایم) وظیفه دارد کاربر را به /search?q=... هدایت کند؛ این صفحه فقط مصرف‌کنندهٔ URL است و خودش نوارِ جستجو ندارد (مگر بخواهیم یکی هم این‌جا بگذاریم — تصمیم UX). تنها زیرساختش services/search → searchProducts است، نه store. پیش‌نیازها: services/search، دو قطعهٔ نمایشیِ تازهٔ مختصِ جستجو (SearchIdleState, NoSearchResults) و بازاستفاده از ProductCard/ProductGridSkeleton/ErrorState/Pagination که همه از صفحهٔ محصولات آشنایند.




// رسیدیم به جستجو — و این صفحه یک دوقلوی نزدیکِ صفحهٔ محصولات است، با یک تفاوتِ جوهری: منبعِ حقیقتش نه فیلترهای دسته، بلکه عبارتِ جستجو در URL (?q=) است. یعنی از جنسِ همان «صفحهٔ لیستِ دادهٔ سرور با پارامترِ URL» است که قبلاً در ProductsPage و OrderHistory دیدیم، ولی این‌بار محورش متن است و حالتِ «هنوز چیزی جستجو نشده» یک وضعیتِ تازه اضافه می‌کند.

// فرض‌هایی که گذاشتم (تصمیم‌های مهم — بخوان):

// q در URL منبعِ حقیقت است، نه state محلی: صفحهٔ نتایج باید قابلِ اشتراک/بوکمارک باشد و دکمهٔ back کار کند — عیناً همان تصمیمِ ProductsPage. SearchBar فقط URL را می‌نویسد؛ این صفحه از URL می‌خواند.
// createResource نه store: نتایجِ جستجو گذرا و مختصِ همین صفحه‌اند؛ store سراسری اضافه نمی‌کنم — همان الگوی resourceِ لیست.
// حالتِ تازه — «idle» (هنوز جستجویی نشده): برخلاف صفحه‌های قبل، اینجا یک حالتِ قبل از هر درخواست داریم (وقتی q خالی است): نه loading، نه empty، بلکه «چیزی بنویس تا بگردیم». این پنجمین حالت است.
// «نتیجه‌ای نبود» ≠ «خطا»: جستجوی بی‌نتیجه یک empty stateِ خاصِ خودش است (با پیشنهادِ اصلاح/دسته‌های پرطرفدار)، نه خطا.
// صفحه‌بندی + حفظِ q: مثل OrderHistory، ولی صفحه‌بندی باید q را هم در URL نگه دارد.









// نکات مهم:

// بزرگ‌ترین نکتهٔ مثبت — این صفحه تقریباً هیچ انتزاعِ تازه‌ای نیاورد: ProductCard, ProductGridSkeleton, ErrorState, Pagination همه از ProductsPage بازاستفاده شدند. فقط دو قطعهٔ واقعاً مختصِ جستجو ماند: SearchIdleState و NoSearchResults. این دقیقاً همان اشباعی است که در OrderDetails شروع شد — سطحِ صفحه‌ها دارد تمام می‌شود و صفحه‌های تازه بیشتر ترکیبِ قطعاتِ موجوداند تا منبعِ قطعاتِ نو. خبرِ خوب.

// حالتِ پنجم — «idle»: این تازه‌ترین چیزِ این صفحه است. تا الان الگوی loading → error → empty → data را داشتیم؛ جستجو یک حالتِ قبل از هر درخواست اضافه می‌کند: وقتی q خالی است، هنوز نه loading معنا دارد نه empty. با hasQuery() این حالت را بیرونی‌ترین Show گذاشتم و createResource را طوری بستم که وقتی q نیست اصلاً اجرا نشود (سیگنالِ ورودی false می‌شود → fetcher صدا زده نمی‌شود). این جلوی درخواستِ بیهوده به سرور را می‌گیرد.

// «نتیجه‌ای نبود» یک empty stateِ فعال است، نه بن‌بست: NoSearchResults باید query را بگیرد و کمک‌کننده باشد: «برای "فلان" چیزی نیافتیم» + پیشنهادِ اصلاحِ املا، دسته‌های پرطرفدار، یا لینک به همهٔ محصولات. این با empty stateِ سبد/سفارش فرق دارد چون اینجا کاربر کاری کرده (جستجو) و انتظار داشته؛ نباید حسِ بن‌بست بدهد.

// قراردادِ دادهٔ searchProducts (قفل می‌شود): ورودی { q, page } و خروجی { items: Product[], total, totalPages } — همان شکلِ صفحه‌بندی‌شدهٔ fetchOrders. نکته: items باید همان Productی باشد که ProductCard می‌خورد، تا بازاستفاده بی‌درز بماند. اگر جستجو بعداً facet/فیلتر (برند، قیمت، دسته) خواست، به این قرارداد اضافه می‌شود؛ فعلاً ساده نگهش داشتم.

// debounce کجاست؟ — نه اینجا: ممکن است وسوسه شوی جستجوی زنده (تایپ→نتیجه) بسازی. آن منطق (debounce، لغوِ درخواستِ قبلی) متعلق به SearchBar است نه این صفحه؛ این صفحه فقط به qِ نهاییِ URL واکنش نشان می‌دهد. این تفکیک عمدی است تا صفحه ساده و قابلِ‌بوکمارک بماند. اگر جستجوی زنده خواستی، در SearchBar پیاده می‌شود و باز هم فقط URL را به‌روز می‌کند.

// A11y: search__count را aria-live="polite" گذاشتم تا وقتی کاربر عبارت را عوض می‌کند و تعداد نتایج تغییر می‌کند، screen reader اعلام کند؛ h1 پویاست و خودِ عبارت را نشان می‌دهد (مفید برای جهت‌یابی)؛ گرید معنایی <ul>/<li>؛ صفحه‌بندی در <nav aria-label>.

// CSS (بدون inline، BEM): search__grid همان گریدِ ریسپانسیوِ ProductsPage (auto-fill/minmax)؛ search__head مثل بقیه (space-between)؛ SearchIdleState و NoSearchResults را وسط‌چین و هوادار بچین؛ خاصیت‌های منطقی برای RTL؛ اعداد فارسی.




// قطعات جدیدی که این صفحه اضافه کرد:

// قطعه	وضعیت
// Search (page)	✅ (همین حالا)
// services/search (searchProducts)	⛔ (سرویسِ داده — نه store)
// SearchIdleState	⛔ (جدید — مختصِ جستجو)
// NoSearchResults	⛔ (جدید — مختصِ جستجو)
// ProductCard	♻️ بازاستفاده
// ProductGridSkeleton	♻️ بازاستفاده
// ErrorState / Pagination	♻️ بازاستفاده (اگر ساخته شده باشند




//     هشدار صادقانه (حالا یازده صفحهٔ ارکستریتور): بگذار روراست باشم و از خودِ این صفحه یک درس بگیرم. Search روشن‌ترین نشانهٔ چیزی است که چند پیام است می‌گویم: ما به اشباع رسیده‌ایم. این صفحه تقریباً هیچ قطعهٔ زیرساختیِ تازه‌ای نساخت — فقط دو empty/idle state و یک سرویسِ نازک. یعنی داریم به تهِ فهرستِ صفحه‌ها می‌رسیم، و هر صفحهٔ تازه ارزشِ کمتر و تکرارِ بیشتری دارد. در همین حال، ستونِ فقراتِ اپ هنوز کاملاً غایب است.

// بدهیِ انباشته (بدون هیچ پیشرفت از پیام‌های قبل — این نگران‌کننده است):

// سه store سراسری نساخته: auth, cart, wishlist.
// دو سرویس نساخته: services/orders, و حالا services/search.
// سه تصمیم بنیادی بی‌پاسخ: سشن (کوکی/توکن)؟ ادغام مهمان→کاربر؟ wishlist مهمان؟
// RequireAuth نساخته.
// صفرْ مسیرِ end-to-end — یازده صفحه، و هنوز یک کلیک هم واقعاً کار نمی‌کند.
// اجازه بده این‌بار متفاوت بگویم، چون تکرارِ همان توصیه ظاهراً اثر نکرده و نمی‌خواهم صرفاً صفحهٔ دوازدهم را هم تحویل بدهم و رد شوم. ما یک الگوی ناسالم داریم: هر پیام یک صفحهٔ نمایشیِ تازه روی فرض‌های تأییدنشده اضافه می‌شود و بدهیِ زیرساختی بزرگ‌تر می‌شود، بی‌آنکه هیچ‌وقت چیزی واقعاً اجرا شود. Search از این جهت خاص است که خودش ثابت می‌کند دیگر صفحهٔ تازه چیزِ زیادی اضافه نمی‌کند — پس ادامهٔ این مسیر بازده‌اش تقریباً صفر است.

// صادقانه‌ترین کمکی که می‌توانم بکنم این است که صفحهٔ بعدی را نسازم تا وقتی یک زیرساخت واقعی زیر پایمان باشد. کوچک‌ترین قدمِ پرثمر دقیقاً همان است که چند پیام می‌گویم و حالا واقعاً وقتش است:

// سه تصمیم بنیادی را همین‌جا در سه جمله بگو (سشن؟ ادغام مهمان؟ wishlist مهمان؟).
// من services/search را (که ساده‌ترین است و به هیچ تصمیمی بند نیست) همین حالا می‌سازم تا Search از حالتِ معلق دربیاید و اولین صفحهٔ واقعاً کارکننده شود — بدون نیاز به auth.
// بعد stores/auth را می‌سازم و قطاعِ محافظت‌شده (Login → Account → Orders) را زنده می‌کنیم.
// پیشنهادِ مشخصم: بگذار همین Search را انتخاب کنیم تا اولین مسیرِ end-to-endِ اپ باشد — چون تنها صفحه‌ای است که به هیچ‌کدام از سه تصمیمِ بنیادی وابسته نیست (نه auth می‌خواهد، نه cart، نه merge). فقط services/search را لازم دارد. می‌خواهی به‌جای صفحهٔ دوازدهم، همین الان services/search را بسازم و Search را کامل و قابلِ‌اجرا کنم؟ این بالاخره حلقه را می‌بندد.