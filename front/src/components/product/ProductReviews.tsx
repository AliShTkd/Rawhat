// @ts-nocheck

// ProductReviews.tsx
import {
  Show,
  For,
  createUniqueId,
  type Component,
  type JSX,
} from "solid-js";
import Rating from "../common/Rating";
import Button from "../common/Button";

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
                    aria-label={row.star + " ستاره"}
                  >
                    <span
                      class="product-reviews__breakdown-fill"
                      style={{ "inline-size": percentFor(row.count) + "%" }}
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

