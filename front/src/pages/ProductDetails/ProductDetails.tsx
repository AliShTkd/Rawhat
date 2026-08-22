
// pages/ProductDetails/ProductDetails.tsx
import {
  Show,
  Suspense,
  ErrorBoundary,
  createResource,
  createMemo,
  createSignal,
  type Component,
} from "solid-js";
import { useParams } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";

import Breadcrumb from "../../components/products/Breadcrumb";
import ProductGallery from "../../components/products/ProductGallery";
import ProductInfo from "../../components/products/ProductInfo";
import ProductTabs from "../../components/products/ProductTabs";
import RelatedProducts from "../../components/products/RelatedProducts";
import ProductDetailsSkeleton from "../../components/products/ProductDetailsSkeleton";

import { fetchProductBySlug } from "../../api/products";
import type { ProductDetail } from "../../types/product";

const ProductDetails: Component = () => {
  const params = useParams<{ slug: string }>();

  // داده‌ی محصول بر اساس slug مسیر؛ با تغییر slug دوباره واکشی می‌شود
  const [product] = createResource(
    () => params.slug,
    (slug) => fetchProductBySlug(slug)
  );

  // انتخاب واریانت جاری (رنگ/سایز و…) — منبع حقیقتش همین صفحه است
  const [selectedVariantId, setSelectedVariantId] = createSignal<string | null>(
    null
  );

  const currentVariant = createMemo(() => {
    const p = product();
    if (!p) return undefined;
    const id = selectedVariantId();
    return p.variants?.find((v) => v.id === id) ?? p.variants?.[0];
  });

  const breadcrumbItems = createMemo(() => {
    const p = product();
    const items = [{ label: "خانه", href: "/" }, { label: "محصولات", href: "/products" }];
    if (!p) return items;
    if (p.category) {
      items.push({ label: p.category.name, href: `/products?category=${p.category.slug}` });
    }
    items.push({ label: p.title }); // آخرین آیتم بدون href (صفحه‌ی جاری)
    return items;
  });

  return (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div class="product-details product-details--error" role="alert">
          <p class="product-details__error-text">
            متأسفانه در بارگذاری این محصول مشکلی پیش آمد.
          </p>
          <button
            type="button"
            class="product-details__retry"
            onClick={() => {
              reset();
              product.refetch?.();
            }}
          >
            تلاش دوباره
          </button>
        </div>
      )}
    >
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <Show
          when={product()}
          fallback={
            <Show when={!product.loading}>
              {/* داده آمد ولی محصولی نبود → ۴۰۴ محصول */}
              <div class="product-details product-details--not-found" role="alert">
                <h1 class="product-details__not-found-title">
                  محصول موردنظر پیدا نشد
                </h1>
                <p class="product-details__not-found-text">
                  ممکن است این محصول حذف شده یا آدرس اشتباه باشد.
                </p>
                <a class="product-details__back-link" href="/products">
                  بازگشت به فهرست محصولات
                </a>
              </div>
            </Show>
          }
        >
          {(p) => (
            <article class="product-details" itemscope itemtype="https://schema.org/Product">
              {/* SEO */}
              <Title>{p().title} | فروشگاه</Title>
              <Meta name="description" content={p().shortDescription ?? p().title} />
              <Meta property="og:title" content={p().title} />
              <Show when={p().images?.[0]}>
                <Meta property="og:image" content={p().images![0].url} />
              </Show>

              {/* مسیر راهنما */}
              <Breadcrumb items={breadcrumbItems()} />

              <div class="product-details__main">
                {/* گالری تصاویر */}
                <div class="product-details__media">
                  <ProductGallery
                    images={p().images ?? []}
                    alt={p().title}
                  />
                </div>

                {/* اطلاعات، قیمت، واریانت، افزودن به سبد */}
                <div class="product-details__info">
                  <ProductInfo
                    product={p()}
                    variant={currentVariant()}
                    onVariantChange={setSelectedVariantId}
                  />
                </div>
              </div>

              {/* تب‌ها: توضیحات / مشخصات / دیدگاه‌ها */}
              <section class="product-details__tabs" aria-label="اطلاعات تکمیلی محصول">
                <ProductTabs
                  description={p().description}
                  specs={p().specs ?? []}
                  reviews={p().reviews ?? []}
                  reviewCount={p().reviewCount ?? 0}
                  rating={p().rating}
                />
              </section>

              {/* محصولات مرتبط */}
              <Show when={(p().relatedProductIds?.length ?? 0) > 0}>
                <section class="product-details__related" aria-label="محصولات مرتبط">
                  <RelatedProducts productIds={p().relatedProductIds!} />
                </section>
              </Show>
            </article>
          )}
        </Show>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ProductDetails;















// رسیدیم به صفحهٔ جزئیات محصول. این اولین قطعه از بخش دوم پروژه است (تا الان همه‌چیز حول صفحهٔ لیست بود). مثل ProductsPage، این هم یک صفحهٔ ارکستریتور است: خودش خیلی UI خام ندارد، بلکه داده را می‌گیرد و بین زیرمؤلفه‌ها پخش می‌کند. پس اینجا هم چند زیرمؤلفهٔ جدید معرفی می‌شوند که بعداً باید ساخته شوند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// مسیر با پارامتر: از useParams روتر، slug یا id محصول را می‌گیرد و با createResource داده را می‌آورد (هماهنگ با الگوی data-fetchِ ProductsPage).
// حالت‌های چهارگانه: loading (اسکلت)، error، not-found (۴۰۴ محصول)، و success. این‌ها را صریح مدیریت کردم چون صفحهٔ جزئیات بیش از لیست به «محصول وجود ندارد» حساس است.
// زیرمؤلفه‌ها به‌صورت slot/ترکیبی: Breadcrumb, ProductGallery, ProductInfo, ProductTabs, RelatedProducts. این صفحه فقط چیدمان و داده را هماهنگ می‌کند.
// SEO/<Title>: چون صفحهٔ جزئیات مهم‌ترین صفحه از نظر SEO است، عنوان/متا را ست می‌کند (با @solidjs/meta یا معادلش).



// زیرمؤلفه‌های جدیدی که این صفحه فرض کرده (هنوز ساخته نشده‌اند):

// زیرمؤلفه	نقش	پیچیدگی
// ProductGallery	تصویر اصلی + بندانگشتی‌ها + زوم/لایت‌باکس	زیاد (A11y و کیبورد سخت است)
// ProductInfo	عنوان، قیمت، امتیاز، انتخاب واریانت، افزودن به سبد	زیاد (قلب صفحه)
// ProductTabs	تب‌های توضیحات/مشخصات/دیدگاه‌ها	متوسط (الگوی tablist با A11y)
// RelatedProducts	ردیف/اسلایدر محصولات مرتبط (از ProductCard استفاده می‌کند)	کم/متوسط
// ProductDetailsSkeleton	اسکلت بارگذاری کل صفحه	کم
// Breadcrumb	⛔ همان قطعهٔ نساختهٔ صفحهٔ لیست — حالا اینجا هم لازم شد	کم







// نکات مهم:

// Breadcrumb حالا یک وابستگیِ مشترک شد: جالب اینکه Breadcrumb که تا الان فقط برای ProductsPage معطل مانده بود، اینجا هم لازم شد. این یعنی باید عمومی ساخته شود (در components/، نه components/products/) چون دو صفحهٔ متفاوت مصرفش می‌کنند. این دقیقاً همان بحثِ «جای درستِ قطعه» است که قبلاً مطرح کردم. پیشنهاد جدی: قدم بعدی حتماً Breadcrumb باشد، چون حالا گلوگاهِ دو صفحه است.
// مدل داده (ProductDetail) با Product لیست فرق دارد: کارت محصول در لیست به فیلدهای سبک نیاز داشت (عنوان، قیمت، عکس، امتیاز). ولی ProductDetail باید سنگین‌تر باشد: images[], variants[], specs[], reviews[], description, relatedProductIds[]. پیشنهادم این است که ProductDetail extends Product باشد تا در RelatedProducts بتوانی همان ProductCard را با زیرمجموعه‌ای از فیلدها بازاستفاده کنی. اگر ساختار ProductDetail را داری بفرست، وگرنه در قدم ساخت ProductInfo یک نسخهٔ پیشنهادی می‌دهم.
// مدیریت واریانت اینجا متمرکز شد (تصمیم معماری): selectedVariantId را عمداً در این صفحه گذاشتم نه داخل ProductInfo، چون هم گالری (ProductGallery ممکن است با تغییر رنگ عکس عوض شود) و هم ProductInfo (قیمت/موجودی واریانت) به آن نیاز دارند. اگر state داخل ProductInfo می‌ماند، گالری از تغییر رنگ بی‌خبر می‌شد. اگر می‌خواهی تصویر گالری با تغییر واریانت هم عوض شود، باید currentVariant() را به ProductGallery هم بدهیم — بگو تا این اتصال را اضافه کنم (فعلاً نبستمش تا شلوغ نشود).
// چهار حالت، صریح و جدا: ErrorBoundary برای خطای واقعی، Suspense برای loading (اسکلت)، Show تو‌در‌تو برای تفکیک not-found (داده آمد ولی خالی) از loading (هنوز نیامده). این تفکیک مهم است: «محصول نیست» با «در حال آمدن» نباید یک‌جور نمایش داده شوند. یک ظرافت: شرط when={!product.loading} جلوی فلش‌شدنِ لحظه‌ای پیام ۴۰۴ را قبل از رسیدن داده می‌گیرد.
// SEO (چرا اینجا جدی‌تر از لیست): صفحهٔ جزئیات، صفحهٔ فرودِ اصلی از گوگل است. برای همین <Title>/<Meta> و microdata با schema.org/Product (itemscope/itemtype) را گذاشتم. برای کامل‌شدنِ Rich Result، فیلدهای price, availability, aggregateRating هم باید microdata داشته باشند — که جایشان داخل ProductInfo و ProductTabs است. پیشنهاد می‌کنم microdata را در آن دو قطعه تکمیل کنیم؛ یا اگر ترجیح می‌دهی JSON-LD (تمیزتر و رایج‌تر از microdata)، یک <script type="application/ld+json"> واحد در همین صفحه بگذارم. کدام را می‌خواهی؟ توصیهٔ من JSON-LD است.
// دسترسی‌پذیری چیدمان: عمداً از <article> برای کل محصول و <section aria-label> برای تب‌ها و مرتبط‌ها استفاده کردم تا نواحی برای صفحه‌خوان معنادار شوند. دقت کن که h1 صفحه باید یک‌بار باشد و جایش داخل ProductInfo (عنوان محصول) است — پس در ProductTabs/RelatedProducts از h2 به بعد استفاده کن تا سلسله‌مراتب عنوان‌ها نشکند (همان مسئلهٔ h1 تکراری که در صفحهٔ لیست هم داشتیم).
// بدون inline style و کاملاً BEM؛ نکات CSS: product-details__main را در دسکتاپ دوستونه کن (display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr) یا نسبت دلخواه) و در موبایل تک‌ستون؛ گالری و اطلاعات در دسکتاپ کنار هم، در موبایل روی هم؛ از خاصیت‌های منطقی برای RTL استفاده کن؛ product-details__info را در دسکتاپ می‌توانی position: sticky; inset-block-start کنی تا هنگام اسکرولِ گالریِ بلند، «افزودن به سبد» در دید بماند.