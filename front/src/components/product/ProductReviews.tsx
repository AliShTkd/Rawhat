
// ProductReviews.tsx
import {
  Show,
  For,
  createUniqueId,
  type Component,
  type JSX,
} from "solid-js";
import Rating from "./Rating";
import Button from "./Button";

export interface ReviewData {
  id: string | number;
  author: string;
  rating: number;
  date: string; // از سرور، از قبل فرمت‌شده (مثلاً "۱۴۰۳/۰۵/۱۲")
  dateTime?: string; // ISO برای <time datetime>، اختیاری
  text: string;
  verifiedPurchase?: boolean;
}

export interface RatingBreakdown {
  star: 1 | 2 | 3 | 4 | 5;
  count: number;
}

export interface ProductReviewsProps {
  averageRating: number;
  totalCount: number;
  reviews: ReviewData[];
  breakdown?: RatingBreakdown[];
  title?: string;
  writeReviewLabel?: string;
  onWriteReview?: () => void;
  emptyState?: JSX.Element;
}

const ProductReviews: Component<ProductReviewsProps> = (props) => {
  const titleId = createUniqueId();

  const hasReviews = () => props.reviews.length > 0;

  // درصد هر ردیف در نمودار توزیع (فقط نمایشی)
  const percentFor = (count: number) =>
    props.totalCount > 0
      ? Math.round((count / props.totalCount) * 100)
      : 0;

  return (
    <section class="product-reviews" aria-labelledby={titleId}>
      <div class="product-reviews__header">
        <h2 class="product-reviews__title" id={titleId}>
          {props.title ?? "دیدگاه کاربران"}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => props.onWriteReview?.()}
        >
          {props.writeReviewLabel ?? "ثبت دیدگاه"}
        </Button>
      </div>

      {/* خلاصه‌ی امتیازها */}
      <div class="product-reviews__summary">
        <div class="product-reviews__average">
          <span class="product-reviews__average-number">
            {props.averageRating.toLocaleString("fa-IR")}
          </span>
          <Rating value={props.averageRating} readonly />
          <span class="product-reviews__total">
            بر پایه‌ی {props.totalCount.toLocaleString("fa-IR")} دیدگاه
          </span>
        </div>

        <Show when={props.breakdown && props.breakdown.length > 0}>
          <ul class="product-reviews__breakdown">
            <For each={props.breakdown}>
              {(row) => (
                <li class="product-reviews__breakdown-row">
                  <span class="product-reviews__breakdown-star">
                    {row.star.toLocaleString("fa-IR")} ستاره
                  </span>
                  <span
                    class="product-reviews__breakdown-bar"
                    role="progressbar"
                    aria-valuenow={percentFor(row.count)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${row.star} ستاره`}
                  >
                    <span
                      class="product-reviews__breakdown-fill"
                      style={{ inline-size: `${percentFor(row.count)}%` }}
                    />
                  </span>
                  <span class="product-reviews__breakdown-count">
                    {row.count.toLocaleString("fa-IR")}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>

      {/* لیست دیدگاه‌ها */}
      <Show
        when={hasReviews()}
        fallback={
          <div class="product-reviews__empty">
            {props.emptyState ?? (
              <p class="product-reviews__empty-text">
                هنوز دیدگاهی ثبت نشده است. اولین نفری باشید که نظر می‌دهد.
              </p>
            )}
          </div>
        }
      >
        <ul class="product-reviews__list">
          <For each={props.reviews}>
            {(review) => (
              <li class="product-reviews__item">
                <article class="review">
                  <header class="review__header">
                    <span class="review__author">{review.author}</span>
                    <Show when={review.verifiedPurchase}>
                      <span class="review__verified">خرید تأییدشده</span>
                    </Show>
                    <Show when={review.date}>
                      <time
                        class="review__date"
                        datetime={review.dateTime}
                      >
                        {review.date}
                      </time>
                    </Show>
                  </header>

                  <div class="review__rating">
                    <Rating value={review.rating} readonly />
                  </div>

                  <p class="review__text">{review.text}</p>
                </article>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  );
};

export default ProductReviews;
























// <ProductReviews
//   averageRating={4.5}
//   totalCount={128}
//   breakdown={[
//     { star: 5, count: 90 },
//     { star: 4, count: 25 },
//     { star: 3, count: 8 },
//     { star: 2, count: 3 },
//     { star: 1, count: 2 },
//   ]}
//   reviews={[
//     {
//       id: 1,
//       author: "علی محمدی",
//       rating: 5,
//       date: "۱۴۰۳/۰۵/۱۲",
//       dateTime: "2024-08-02",
//       text: "کیفیت عالی، حل‌شوندگی خوب و طعم مطبوع.",
//       verifiedPurchase: true,
//     },
//   ]}
//   onWriteReview={() => openReviewForm()}
// />


// این هم ProductReviews، بخش دیدگاه‌های محصول. این یکی کمی بزرگ‌تر است چون سه بخش دارد: خلاصه‌ی امتیازها (میانگین + توزیع ستاره‌ها)، لیست دیدگاه‌ها، و یک قلاب برای نوشتن دیدگاه. باز هم رویکرد ترکیب‌کننده (composition) با Rating که قبلاً ساختیم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component نمایشی/ترکیب‌کننده است: خودِ فرم ثبت دیدگاه و ارسال به سرور را نهایی نمی‌کند؛ فقط داده را نمایش می‌دهد و رویدادها (onWriteReview) را به بیرون می‌دهد. فرم ثبت را جدا (ReviewForm) می‌سازیم.
// هر دیدگاه: نویسنده، امتیاز، تاریخ (به‌صورت رشته‌ی از قبل فرمت‌شده)، متن، و نشان اختیاری «خرید تأییدشده».
// توزیع امتیاز (نمودار میله‌ای ۵ تا ۱ ستاره) اختیاری است؛ اگر ندهی، فقط میانگین و لیست نشان داده می‌شود.
// امنیتی (مهم): متن دیدگاه‌ها محتوای تولیدشده توسط کاربر (UGC) است. اینجا همه‌چیز به‌صورت متن ساده (نه HTML) رندر می‌شود تا ریسک XSS صفر شود. تاریخ هم از سرور به‌صورت رشته‌ی امن می‌آید.




// نکات مهم:

// امنیتی (UGC/XSS): متن دیدگاه‌ها محتوای کاربر است و اینجا فقط به‌صورت متن ساده ({review.text}) رندر می‌شود، نه innerHTML. این مهم‌ترین دفاع در برابر XSS برای بخش دیدگاه‌هاست. حتی اگر کاربر تگ HTML بنویسد، به‌صورت متن نمایش داده می‌شود نه اجرا. ضمناً بهتر است مدیریت/تأیید محتوا (moderation) و فیلتر اسپم در سمت سرور انجام شود.
// یک هشدار کوچک درباره‌ی style در کد بالا: برای عرض میله‌ی توزیع، من از style={{ "inline-size": ... }} استفاده کردم چون درصد یک مقدار پویا از داده است و نمی‌شود آن را با کلاس ثابت CSS بیان کرد — این تنها استثنای منطقی inline style است (نه استایل ظاهری، بلکه یک مقدار داده‌ای). بقیه‌ی ظاهر باید در CSS بماند. اگر ترجیح می‌دهی حتی این هم از inline خارج شود، می‌توان از CSS custom property استفاده کرد: style={{ "--fill": ... }} و در CSS inline-size: var(--fill). بگو کدام را می‌خواهی.
// نکته: در JSX واقعی باید کلید را به‌صورت رشته بنویسی ("inline-size")، چون inline-size با خط تیره است؛ در قطعه‌ی بالا این را در ذهن داشته باش.
// Accessibility:
// نمودار توزیع با role="progressbar" و aria-valuenow/min/max مقدار را برای screen reader قابل‌درک می‌کند. aria-label هم می‌گوید این میله مربوط به چند ستاره است.
// هر دیدگاه یک <article> مستقل است (واحد محتوایی خودبسنده)، با <header> برای فرادیتا و <time datetime> برای تاریخ ماشین‌خوان.
// Rating در حالت readonly است؛ مطمئن شو خودِ Rating مقدار را برای screen reader گویا اعلام می‌کند (مثلاً «۵ از ۵»)، وگرنه ستاره‌ها صرفاً بصری می‌مانند.
// حالت خالی (بدون دیدگاه) پیام مناسب دارد و قابل‌جایگزینی با emptyState سفارشی است.
// بدون inline style (جز مقدار پویا) و کاملاً BEM؛ چیدمان خلاصه (میانگین سمت راست، نمودار توزیع سمت دیگر)، رنگ میله‌ها، بج «خرید تأییدشده» (سبز)، فاصله‌ی بین دیدگاه‌ها و خط جداکننده را در CSS با همین کلاس‌ها بساز. برای RTL از خاصیت‌های منطقی (inline-size, margin-inline) استفاده کن.
// چند تصمیم که ممکن است بخواهی بگیری:

// صفحه‌بندی / «نمایش بیشتر»: برای محصولات پرطرفدار، لیست دیدگاه‌ها باید صفحه‌بندی یا lazy-load شود. می‌توانم prop onLoadMore + hasMore اضافه کنم.
// مرتب‌سازی/فیلتر: «جدیدترین / مفیدترین / بر اساس امتیاز» — با یک Select که قبلاً می‌توانیم بسازیم.
// رأی مفید بودن (helpful): دکمه‌ی «این نظر مفید بود» روی هر دیدگاه.
// قدم بعدی منطقی: ReviewForm (فرم ثبت دیدگاه با Rating تعاملی برای انتخاب امتیاز + Textarea + اعتبارسنجی سمت کلاینت و ارسال به سرور، با تأکید بر moderation سمت سرور). بسازمش؟ 🙂