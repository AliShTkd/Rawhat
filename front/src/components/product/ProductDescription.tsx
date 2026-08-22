

// ProductDescription.tsx
import {
  Show,
  createSignal,
  createUniqueId,
  type Component,
  type JSX,
} from "solid-js";

export interface ProductDescriptionProps {
  title?: string;
  children?: JSX.Element;
  /**
   * هشدار امنیتی: فقط HTMLِ از قبل sanitize‌شده را اینجا بده.
   * هرگز رشته‌ی خام از سرور/کاربر را مستقیم پاس نده.
   */
  sanitizedHtml?: string;
  collapsible?: boolean;
  collapsedByDefault?: boolean;
  moreLabel?: string;
  lessLabel?: string;
}

const ProductDescription: Component<ProductDescriptionProps> = (props) => {
  const [expanded, setExpanded] = createSignal(!props.collapsedByDefault);
  const contentId = createUniqueId();

  const isCollapsible = () => props.collapsible === true;

  return (
    <section class="product-description" aria-labelledby={`${contentId}-title`}>
      <h2 class="product-description__title" id={`${contentId}-title`}>
        {props.title ?? "توضیحات محصول"}
      </h2>

      <div
        id={contentId}
        class="product-description__content"
        classList={{
          "product-description__content--collapsed":
            isCollapsible() && !expanded(),
        }}
      >
        {/* حالت امن و پیشنهادی: محتوای JSX */}
        <Show when={!props.sanitizedHtml}>{props.children}</Show>

        {/* حالت HTML: فقط در صورتی که از قبل sanitize شده باشد */}
        <Show when={props.sanitizedHtml}>
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <div innerHTML={props.sanitizedHtml} />
        </Show>
      </div>

      <Show when={isCollapsible()}>
        <button
          class="product-description__toggle"
          type="button"
          aria-expanded={expanded() ? "true" : "false"}
          aria-controls={contentId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded()
            ? props.lessLabel ?? "نمایش کمتر"
            : props.moreLabel ?? "بیشتر بخوانید"}
        </button>
      </Show>
    </section>
  );
};

export default ProductDescription;














// // حالت امن و پیشنهادی: JSX
// <ProductDescription>
//   <p>پروتئین وی گلد استاندارد با ۲۴ گرم پروتئین در هر سروینگ...</p>
//   <ul>
//     <li>مناسب برای عضله‌سازی و ریکاوری</li>
//     <li>کم‌چرب و کم‌قند</li>
//   </ul>
// </ProductDescription>

// // حالت collapsible برای توضیحات بلند
// <ProductDescription collapsible collapsedByDefault>
//   <p>{longDescription}</p>
// </ProductDescription>

// // حالت HTML — فقط بعد از sanitize در لایه‌ی داده
// import DOMPurify from "dompurify";
// const clean = DOMPurify.sanitize(product.descriptionHtml);
// <ProductDescription sanitizedHtml={clean} />




// این هم ProductDescription، برای نمایش بخش توضیحات محصول. این یکی نکته‌ی امنیتی مهمی دارد که رویش تأکید می‌کنم: توضیحات محصول اغلب از یک ادیتور متنی (rich text/HTML از پنل مدیریت) می‌آید و اینجا جای اصلی خطر XSS است.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// توضیحات می‌تواند به دو شکل باشد: (الف) محتوای امن به‌صورت JSX.Element (حالت پیش‌فرض و پیشنهادی)، یا (ب) رشته‌ی HTML که در این‌صورت باید قبل از رسیدن به این Component پاک‌سازی (sanitize) شده باشد.
// قابلیت «بیشتر بخوانید» (collapse/expand) برای توضیحات بلند، به‌صورت اختیاری (collapsible).
// یک title اختیاری برای بخش (پیش‌فرض «توضیحات محصول»).





// نکات مهم:

// امنیتی (مهم‌ترین نکته‌ی این Component — XSS):
// توضیحات محصول معمولاً از پنل ادمین با یک rich text editor ساخته می‌شود و به‌صورت HTML ذخیره می‌شود. رندر مستقیم آن با innerHTML بدون پاک‌سازی، یک آسیب‌پذیری XSS کلاسیک است.
// قانون: هیچ‌وقت رشته‌ی HTML خام را مستقیم به innerHTML نده. حتماً با کتابخانه‌ای مثل DOMPurify آن را sanitize کن. من عمداً prop را sanitizedHtml نامیدم تا در همان امضای تابع یادآوری کند که ورودی باید از قبل پاک شده باشد.
// بهترین کار: اگر می‌توانی، به‌جای HTML از محتوای ساختاریافته (JSON/blocks) یا Markdownِ محدود استفاده کن و آن را به JSX امن تبدیل کن؛ این ذاتاً امن‌تر از رندر HTML خام است.
// ایده‌آل‌تر: sanitize را در لایه‌ی داده/سرور انجام بده (نه در لحظه‌ی رندر)، تا تنها محتوای پاک وارد UI شود و مسئولیت امنیت در یک نقطه‌ی متمرکز بماند.
// Accessibility:
// از <section> با aria-labelledby که به id عنوان وصل است استفاده شد تا این ناحیه برای screen reader معنادار و قابل‌ناوبری باشد.
// دکمه‌ی «بیشتر بخوانید» یک <button> واقعی با aria-expanded و aria-controls است که به محتوای مربوطه اشاره می‌کند — این الگوی استاندارد disclosure است.
// هشدار A11y درباره‌ی collapse: وقتی محتوا جمع است، از نظر بصری با CSS (مثلاً max-height + overflow: hidden) کوتاه می‌شود، اما محتوا در DOM باقی می‌ماند. اگر می‌خواهی هنگام جمع‌بودن، بخش پنهان واقعاً از دید screen reader و ترتیب فوکوس خارج شود، باید محتوا را به‌جای مخفی بصری، حذف/hidden کنی؛ ولی این برای SEO و «بیشتر بخوانید» معمولاً نامطلوب است. تعادل رایج: محتوا در DOM بماند (خوب برای SEO) و فقط بصری بریده شود. بگو کدام رفتار را می‌خواهی.
// SEO: چون توضیحات محصول برای SEO مهم است، نگه‌داشتن کل متن در DOM (حتی وقتی جمع است) و بریدن صرفاً بصری، انتخاب بهتری است. از display:none برای متنی که می‌خواهی ایندکس شود استفاده نکن.
// بدون inline style و کاملاً BEM؛ حالت جمع‌شده (--collapsed با max-height و یک محو‌شدگی/gradient در پایین)، تایپوگرافی محتوا (فاصله‌ی پاراگراف‌ها، لیست‌ها، line-height مناسب فارسی)، و استایل دکمه‌ی toggle را در CSS با همین کلاس‌ها بساز. برای محتوای HTML، یک کلاس محتوایی (مثل استایل‌دهی به .product-description__content p, ul, li) در نظر بگیر.
// یک تصمیم مهم که بهتر است تو بگیری:

// آیا اصلاً به رندر HTML نیاز داری؟ اگر منبع توضیحاتت Markdown یا بلوک‌های ساختاریافته است، پیشنهاد می‌کنم مسیر sanitizedHtml را کنار بگذاریم و یک تبدیل امن به JSX بگذاریم؛ این ریسک XSS را عملاً حذف می‌کند. اگر واقعاً HTML از ادمین می‌آید، مطمئن شو DOMPurify در pipeline هست.
// قدم بعدی پیشنهادی برای کامل‌کردن صفحه‌ی محصول:

// ProductSpecifications (جدول مشخصات فنی: وزن، طعم، تعداد سروینگ و... به‌صورت <dl> یا <table> معنایی).
// یا ProductTabs که «توضیحات / مشخصات / دیدگاه‌ها» را با الگوی کامل tab/tabpanel کنار هم بگذارد و همین ProductDescription داخل یکی از تب‌ها بنشیند.