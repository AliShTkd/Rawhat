
// Divider.tsx
import { Show, type Component, type JSX } from "solid-js";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  children?: JSX.Element;
}

const Divider: Component<DividerProps> = (props) => {
  const orientation = () => props.orientation ?? "horizontal";
  const hasContent = () => props.children !== undefined && props.children !== null;

  return (
    <Show
      when={hasContent()}
      fallback={
        // جداکننده‌ی ساده و معنایی؛ role/aria-orientation برای وضوح
        <hr
          class="divider"
          classList={{
            "divider--horizontal": orientation() === "horizontal",
            "divider--vertical": orientation() === "vertical",
          }}
          aria-orientation={orientation()}
        />
      }
    >
      {/* جداکننده با متن وسط */}
      <div
        class="divider divider--with-text divider--horizontal"
        role="separator"
        aria-orientation="horizontal"
      >
        <span class="divider__line" aria-hidden="true" />
        <span class="divider__text">{props.children}</span>
        <span class="divider__line" aria-hidden="true" />
      </div>
    </Show>
  );
};

export default Divider;








// // خط ساده
// <Divider />

// // جداکننده‌ی عمودی (مثلاً بین دو آیتم در یک ردیف)
// <Divider orientation="vertical" />

// // جداکننده با متن وسط (مثلاً در فرم ورود)
// <Divider>یا</Divider>


// این هم Divider، یک primitive بسیار ساده برای جداکننده — هم به‌صورت خط ساده و هم با متن وسط (مثل «یا» در فرم‌های ورود، یا جداکردن بخش‌ها). عمداً مینیمال نگه‌اش داشتم اما نکته‌ی مهم A11y درباره‌ی جهت و معناداری را رعایت کردم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// دو حالت دارد: بدون متن (فقط خط) و با متن (متن وسط با خط دو طرف).
// جهت orientation می‌تواند horizontal (پیش‌فرض) یا vertical باشد. حالت با متن فقط برای افقی منطقی است.
// A11y: اگر متن ندارد، صرفاً تزئینی است و به screen reader چیزی اعلام نمی‌کند؛ اگر متن دارد، متن خوانده می‌شود اما نقش «جداکننده» به‌صورت معنایی هم قابل تنظیم است.

// نکات مهم:

// چرا <hr> برای حالت ساده؟ چون <hr> عنصر معنایی استاندارد برای «جداسازی موضوعی» است و به‌صورت پیش‌فرض نقش separator دارد؛ این از یک <div> خالی بهتر است. برای حالت با متن، <hr> نمی‌تواند فرزند متنی بگیرد، پس از <div role="separator"> با دو خط aria-hidden استفاده کردم.
// Accessibility:
// حالت ساده: aria-orientation جهت را مشخص می‌کند. این جداکننده صرفاً ساختاری است و متن اضافه‌ای اعلام نمی‌کند.
// حالت با متن: خطوط دو طرف aria-hidden هستند تا screen reader فقط متن معنادار (مثل «یا») را بخواند، نه عناصر تزئینی.
// بدون inline style و کاملاً BEM؛ ضخامت/رنگ خط، فاصله‌ها، حالت عمودی (divider--vertical با height/border-inline)، و چیدمان حالت با متن (divider--with-text با flex و خطوط کشسان دو طرف) را در CSS با همین کلاس‌ها بساز.
// نکته برای RTL: چون پروژه فارسی/RTL است، اگر از margin/border جهت‌دار استفاده می‌کنی، از خاصیت‌های منطقی مثل margin-inline/border-inline استفاده کن تا در RTL درست بماند.
// امنیتی: بدون innerHTML؛ محتوا (در صورت وجود) به‌صورت JSX/متن امن رندر می‌شود.
// اگر بخواهی حالت‌های بیشتری مثل خط‌چین (dashed) یا ضخامت‌های مختلف به‌صورت variant (مثل divider--dashed) داشته باشد، بگو تا با BEM اضافه کنم؛ ولی طبق اصل سادگی، فعلاً همین دو حالت کاربردی را نگه داشتم. 🙂