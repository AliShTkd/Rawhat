// FeaturesSection.tsx
import { Show, For, type Component, type JSX } from "solid-js";

export interface FeatureItem {
  id: string | number;
  title: string;
  description?: string;
  icon?: JSX.Element;
}

export interface FeaturesSectionProps {
  title?: string;
  features: FeatureItem[];
}

const FeaturesSection: Component<FeaturesSectionProps> = (props) => {
  return (
    <section class="features" aria-labelledby="features-title">
      <div class="features__container">
        <Show when={props.title}>
          <h2 id="features-title" class="features__title">
            {props.title}
          </h2>
        </Show>

        <Show
          when={props.features.length > 0}
          fallback={
            <p class="features__empty">موردی برای نمایش وجود ندارد.</p>
          }
        >
          <ul class="features__list">
            <For each={props.features}>
              {(feature) => (
                <li class="features__item">
                  <Show when={feature.icon}>
                    <span class="features__icon" aria-hidden="true">
                      {feature.icon}
                    </span>
                  </Show>

                  <div class="features__body">
                    <h3 class="features__item-title">{feature.title}</h3>

                    <Show when={feature.description}>
                      <p class="features__item-description">
                        {feature.description}
                      </p>
                    </Show>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
};

export default FeaturesSection;











// <FeaturesSection
//   title="چرا از ما خرید کنید؟"
//   features={[
//     {
//       id: "shipping",
//       title: "ارسال سریع و رایگان",
//       description: "برای سفارش‌های بالای مبلغ مشخص",
//       icon: <TruckIcon />, // یک JSX/SVG که خودت پاس می‌دهی
//     },
//     {
//       id: "authentic",
//       title: "ضمانت اصالت کالا",
//       description: "تمام محصولات دارای اصالت تأییدشده",
//       icon: <ShieldIcon />,
//     },
//   ]}
// />


// این هم FeaturesSection برای نمایش «مزیت‌ها/تضمین‌های فروشگاه» (مثل ارسال رایگان، ضمانت اصالت کالا، پشتیبانی، پرداخت امن). مطابق رویه، prop-driven و مستقل ساخته شده.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// لیست ویژگی‌ها از Props می‌آید (هر ویژگی: عنوان، توضیح اختیاری، و یک آیکون اختیاری).
// برای آیکون فرض کردم یک JSX.Element از بیرون پاس داده می‌شود (مثلاً یک SVG یا Component آیکون). این‌طوری این Component به هیچ کتابخانه‌ی آیکون خاصی وابسته نمی‌شود و امن است. اگر می‌خواهی به‌جای آن از URL تصویر استفاده کنم، بگو تا تغییر دهم.
// title اختیاری برای عنوان کل بخش دارد.
// امنیتی: آیکون به‌صورت JSX.Element رندر می‌شود، نه innerHTML. اگر منبع آیکون‌ها داده‌ی غیرقابل‌اعتماد (مثلاً از API) است، حتماً به‌صورت JSX/تصویر با src امن بده، نه رشته‌ی HTML.



// نکات مهم:

// بدون inline style و کاملاً BEM؛ چیدمان گرید (مثلاً ۴ ستون در دسکتاپ، ۲ ستون در تبلت، ۱ ستون در موبایل) را با همین کلاس‌ها در CSS پیاده کن.
// Accessibility: از لیست معنایی <ul>/<li> و عنوان‌های <h3> برای هر آیتم استفاده شد. آیکون‌ها aria-hidden="true" هستند چون صرفاً تزئینی‌اند و متن عنوان معنا را می‌رساند. اگر آیکونی معنای مستقل دارد، بگو تا برای همان مورد alt/aria-label مناسب اضافه کنم.
// سلسله‌مراتب heading: اینجا از <h3> برای آیتم‌ها استفاده کردم با این فرض که عنوان بخش <h2> است و بالاتر یک <h1> (مثل Hero) وجود دارد. اگر ساختار صفحه‌ات فرق دارد، بگو تا سطح heading را تنظیم/قابل‌تنظیم کنم.
// امنیتی: هیچ‌چیز با innerHTML رندر نمی‌شود؛ آیکون به‌صورت JSX.Element امن درج می‌شود.
// اگر ترجیح می‌دهی به‌جای JSX.Element، آیکون‌ها را با URL تصویر (src + alt) بدهی یا از یک کتابخانه‌ی آیکون خاص استفاده کنی، بگو تا نسخه‌اش را مطابق همان بسازم (و اگر کتابخانه لازم شد، نام و دلیلش را قبل از استفاده اعلام می‌کنم). 🙂