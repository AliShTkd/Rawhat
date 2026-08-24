// @ts-nocheck
// pages/Checkout/Checkout.tsx
import {
  Show,
  Switch,
  Match,
  createSignal,
  createMemo,
  onMount,
  type Component,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";

import CheckoutStepper from "../../components/checkout/CheckoutStepper";
import AddressStep from "../../components/checkout/AddressStep";
import ShippingStep from "../../components/checkout/ShippingStep";
import PaymentStep from "../../components/checkout/PaymentStep";
import ReviewStep from "../../components/checkout/ReviewStep";
import OrderSummary from "../../components/checkout/OrderSummary";

import { useCart } from "../../stores/cartStore";
import { placeOrder } from "../../api/orders";
import type { CheckoutData } from "../../types/checkout";

type StepKey = "address" | "shipping" | "payment" | "review";
const STEP_ORDER: StepKey[] = ["address", "shipping", "payment", "review"];

const Checkout: Component = () => {
  const cart = useCart();
  const navigate = useNavigate();

  // اگر سبد خالی است، checkout بی‌معنی است → برگرد
  onMount(() => {
    if (!cart.loading && cart.items.length === 0) {
      navigate("/cart", { replace: true });
    }
  });

  const [step, setStep] = createSignal<StepKey>("address");

  // دادهٔ کل فرم در یک store واحد؛ منبع حقیقت همین‌جاست تا مرحله‌ها با هم هماهنگ بمانند
  const [data, setData] = createStore<CheckoutData>({
    address: null,
    shippingMethodId: null,
    payment: null,
  });

  // وضعیت ثبت سفارش
  const [submitting, setSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal<string | null>(null);

  const stepIndex = createMemo(() => STEP_ORDER.indexOf(step()));

  const goNext = () => {
    const i = stepIndex();
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1]);
  };
  const goBack = () => {
    const i = stepIndex();
    if (i > 0) setStep(STEP_ORDER[i - 1]);
  };

  // آیا اجازهٔ رفتن به مرحله‌ی دلخواه هست؟ (نباید از مرحله‌ی ناتمام جلو زد)
  const canAccessStep = (target: StepKey): boolean => {
    const targetIndex = STEP_ORDER.indexOf(target);
    if (targetIndex <= stepIndex()) return true; // عقب‌گرد آزاد است
    // جلو رفتن فقط اگر مرحله‌های قبلی کامل باشند
    if (targetIndex >= 1 && !data.address) return false;
    if (targetIndex >= 2 && !data.shippingMethodId) return false;
    if (targetIndex >= 3 && !data.payment) return false;
    return true;
  };

  const submitOrder = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await placeOrder({
        shippingAddress: data.address!,
        paymentMethod: (data.payment?.method as "online" | "cash_on_delivery" | "wallet") ?? "online",
        note: undefined,
      });
      if (!result) {
        setSubmitError("ثبت سفارش ممکن نشد. لطفاً دوباره تلاش کنید.");
        return;
      }
      cart.clear();
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        navigate(`/orders/${result.orderId}`, { replace: true });
      }
    } catch (err) {
      setSubmitError(
        "ثبت سفارش با خطا مواجه شد. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main class="checkout" aria-labelledby="checkout-title">
      <Title>تکمیل خرید | فروشگاه</Title>

      <h1 class="checkout__title" id="checkout-title">
        تکمیل خرید
      </h1>

      {/* نوار مرحله‌ها */}
      <CheckoutStepper
        steps={STEP_ORDER}
        current={step()}
        canAccess={canAccessStep}
        onStepClick={setStep}
      />

      <div class="checkout__layout">
        {/* ستون فرم مرحله‌ای */}
        <section class="checkout__form" aria-live="polite">
          <Switch>
            <Match when={step() === "address"}>
              <AddressStep
                value={data.address}
                onChange={(address) => setData("address", address)}
                onNext={goNext}
              />
            </Match>

            <Match when={step() === "shipping"}>
              <ShippingStep
                value={data.shippingMethodId}
                address={data.address}
                onChange={(id) => setData("shippingMethodId", id)}
                onNext={goNext}
                onBack={goBack}
              />
            </Match>

            <Match when={step() === "payment"}>
              <PaymentStep
                value={data.payment}
                onChange={(payment) => setData("payment", payment)}
                onNext={goNext}
                onBack={goBack}
              />
            </Match>

            <Match when={step() === "review"}>
              <ReviewStep
                data={data}
                items={cart.items}
                submitting={submitting()}
                error={submitError()}
                onEditStep={setStep}
                onBack={goBack}
                onSubmit={submitOrder}
              />
            </Match>
          </Switch>
        </section>

        {/* ستون خلاصه‌ی سفارش (ثابت) */}
        <aside class="checkout__summary" aria-label="خلاصه‌ی سفارش">
          <OrderSummary
            items={cart.items}
            subtotal={cart.subtotal}
            discount={cart.discount}
            shipping={cart.shipping}
            total={cart.total}
            editable={false}
          />
        </aside>
      </div>
    </main>
  );
};

export default Checkout;














// رسیدیم به checkout — و این نقطهٔ عطفِ کل پروژه است. تا الان همه‌چیز یا خواندن از سرور بود (لیست، جزئیات) یا ویرایش یک state ساده (سبد). اما checkout جنس دیگری دارد: یک فرم چندمرحله‌ای با اعتبارسنجی، حالت‌های خطا، و یک عملیات مالیِ برگشت‌ناپذیر (پرداخت). این سنگین‌ترین صفحه از نظر منطق است، هرچند از نظر تعداد زیرمؤلفه شاید کمتر از جزئیات باشد.

// فرض‌هایی که گذاشتم (این‌ها را حتماً بخوان چون تصمیم‌های بزرگ‌اند):

// فرم چندمرحله‌ای (wizard): آدرس/تحویل → روش ارسال → پرداخت → بازبینی. مرحله‌ها را با یک state محلی مدیریت می‌کنم، ولی دادهٔ فرم باید جایی امن نگه داشته شود (پایین توضیح می‌دهم).
// وابسته به سبد: checkout بدون سبدِ معتبر بی‌معنی است؛ پس از useCart می‌خواند و اگر سبد خالی بود، کاربر را برمی‌گرداند.
// خلاصهٔ سفارش همان CartSummary (یا نسخهٔ فقط‌خواندنی‌اش) است — بازاستفاده، نه ساختِ دوباره.
// پرداخت به سرور/درگاه سپرده می‌شود؛ این صفحه فقط ارکستریت می‌کند و در نهایت به درگاه یا صفحهٔ نتیجه هدایت می‌کند.




// زیرمؤلفه‌ها و زیرساخت‌های جدیدی که این صفحه فرض کرده:

// قطعه	نقش	پیچیدگی
// CheckoutStepper	نوار مرحله‌ها + ناوبری بین‌شان	متوسط (A11y مرحله‌ها)
// AddressStep	فرم آدرس/گیرنده + اعتبارسنجی	زیاد (فرم واقعی)
// ShippingStep	انتخاب روش ارسال (بسته به آدرس)	متوسط
// PaymentStep	انتخاب روش پرداخت	متوسط
// ReviewStep	بازبینی نهایی + دکمهٔ ثبت سفارش	متوسط
// OrderSummary	خلاصهٔ مالی فقط‌خواندنی (خویشاوند CartSummary)	کم
// types/checkout	مدل CheckoutData و زیرمدل‌ها	زیرساخت
// api/orders (placeOrder)	ثبت سفارش/شروع پرداخت	زیرساخت







// نکات مهم:

// بزرگ‌ترین تصمیم — دادهٔ فرم کجا زندگی می‌کند؟ من دادهٔ کل مراحل را در یک createStore واحد در همین صفحه گذاشتم، نه داخل هر Step. دلیل: مرحله‌ها به هم وابسته‌اند (روش‌های ارسال به آدرس بستگی دارند؛ بازبینی به همه‌چیز). اگر هر Step state خودش را داشت، هماهنگی‌شان کابوس می‌شد و با زدنِ «مرحلهٔ قبل» داده‌ها پاک می‌شدند. پس Stepها کنترل‌شده (value/onChange) هستند و منبع حقیقت اینجاست. اما یک هزینه دارد: اگر کاربر صفحه را رفرش کند، این store پاک می‌شود. اگر می‌خواهی دادهٔ نیمه‌کارهٔ checkout هم persist شود (مثل سبد)، باید این store را به sessionStorage گره بزنیم — بگو تا اضافه کنم. توصیهٔ من: حداقل آدرس را persist کنیم، بقیه (مخصوصاً پرداخت) را نه.

// مسئلهٔ حساس — پرداخت را هرگز در فرانت نگه ندار: در PaymentStep، data.payment باید فقط انتخاب روش (مثلاً «درگاه ملت» یا «کیف پول») باشد، نه شمارهٔ کارت/CVV. اطلاعات حساس کارت باید مستقیم به درگاه/PCI-compliant برود، نه اینکه در CheckoutData این صفحه بنشیند. این یک تصمیم امنیتی جدی است؛ موقع ساخت PaymentStep این مرز را رعایت می‌کنم. اگر مدل پرداختت «هدایت به درگاه» است (که در ایران رایج است)، اصلاً فرم کارت نداریم و PaymentStep فقط انتخاب درگاه است — همین را فرض کرده‌ام (به result.redirectUrl دقت کن).

// placeOrder و ایمنی در برابر ثبت دوتایی: ثبت سفارش برگشت‌ناپذیر و مالی است. submitting را گذاشتم تا دکمه قفل شود و از دابل‌کلیک جلوگیری شود، ولی این کافی نیست: برای امنیت واقعی باید سمت سرور idempotency key داشته باشیم تا اگر شبکه قطع شد و کاربر دوباره زد، دو سفارش ثبت نشود. این را در api/orders لحاظ می‌کنم. همچنین موفقیت باید سبد را خالی کند (cart.clear()) تا برگشتِ کاربر سفارش تکراری نسازد — که گذاشتم.

// گاردِ ورود (سبد خالی): onMount چک می‌کند سبد خالی نباشد و اگر بود به /cart برمی‌گرداند. یک ظرافت: شرط !cart.loading مهم است تا وقتی سبد هنوز در حال بارگذاری است، اشتباهی کاربر را بیرون نیندازیم (همان الگوی تفکیک loading از empty که در Cart و ProductDetails داشتیم). نکته: اگر سبد async است، شاید بهتر باشد این گارد reactive باشد (نه فقط onMount) تا اگر وسط checkout سبد خالی شد هم واکنش نشان دهد — بگو تا به createEffect تبدیلش کنم.

// ناوبری بین مرحله‌ها و canAccessStep: اجازه دادم کاربر آزادانه به عقب برگردد ولی جلو رفتن مشروط به کامل‌بودن مراحل قبلی است (canAccessStep). این هم UX خوبی است (کاربر می‌تواند آدرسش را ویرایش کند) و هم جلوی «پرش به پرداخت بدون آدرس» را می‌گیرد. CheckoutStepper باید این را بصری هم نشان دهد (مرحله‌های غیرقابل‌دسترس، خاکستری/غیرفعال).

// A11y — این صفحه از همه حساس‌تر است:

// checkout__form را aria-live="polite" گذاشتم تا تعویض مرحله برای صفحه‌خوان اعلام شود؛ ولی این ظریف است: با تعویض مرحله باید فوکوس به ابتدای مرحلهٔ جدید (مثلاً عنوان h2 مرحله) منتقل شود، وگرنه کاربر کیبورد/صفحه‌خوان گم می‌شود. مدیریت فوکوس هنگام goNext/goBack را در خودِ Stepها یا اینجا با یک ref انجام می‌دهم — این مهم‌ترین کار A11yِ wizard است و یادداشتش کرده‌ام.
// هر Step باید یک <h2> داشته باشد (h1 صفحه «تکمیل خرید» است).
// خطای ثبت سفارش (submitError) در ReviewStep باید با role="alert" اعلام شود تا فوراً خوانده شود (اینجا assertive منطقی است، چون خطای مالی فوری است — برخلاف شمارندهٔ نتایج که polite بود).
// OrderSummary در برابر CartSummary: عمداً یک قطعهٔ جدا (OrderSummary) با editable={false} گذاشتم، نه همان CartSummary. چون در checkout نباید تعداد را عوض کرد یا کالا حذف کرد (وگرنه باید مراحل را دوباره حساب کنیم). ولی این دو خویشاوند نزدیک‌اند و بخش «ردیف‌های مالی» (جمع/تخفیف/ارسال/کل) مشترک است. پیشنهاد: یک قطعهٔ پایهٔ مشترک PriceBreakdown بسازیم که هم CartSummary و هم OrderSummary از آن استفاده کنند — تا فرمول نمایش قیمت یک‌جا باشد. بگو تا این را در طراحی لحاظ کنم.

// بدون inline style و کاملاً BEM؛ نکات CSS: checkout__layout مثل cart دوستونه در دسکتاپ (فرم پهن‌تر، خلاصه باریک‌تر) و تک‌ستون در موبایل؛ checkout__summary را position: sticky کن؛ در موبایل خلاصه را جمع‌شونده (collapsible) یا پایین بگذار تا فرم در اولویت دید باشد؛ CheckoutStepper در موبایل ممکن است به حالت افقیِ فشرده یا «مرحلهٔ x از y» تبدیل شود؛ از خاصیت‌های منطقی برای RTL.



// بدهیِ انباشته از قبل (این دیگر جدی شده):

// زیرساخت مشترک: stores/cart, Breadcrumb, Select, و احتمالاً PriceBreakdown.
// صفحهٔ لیست: Breadcrumb, نهایی‌شدن Select, به‌روزرسانی ProductsPage.
// صفحهٔ جزئیات: ProductGallery, ProductInfo, ProductTabs, RelatedProducts, ProductDetailsSkeleton.
// سبد: stores/cart, CartItem, CartSummary, EmptyCart, CartSkeleton.
// یک هشدار صادقانه (چون به‌نظرم الان لحظه‌اش است):
// ما چهار صفحهٔ ارکستریتور را پشت‌سرِ هم اسکلت‌بندی کردیم و پشتهٔ قطعاتِ نساخته خیلی بزرگ شده (بالای ۲۰ قطعه). خطرش این است که هیچ صفحه‌ای هنوز end-to-end کار نمی‌کند و وابستگی‌ها روی هم تلنبار شده‌اند. پیشنهاد جدی‌ام این است که از این‌جا عرض را متوقف کنیم و به عمق برویم — یعنی یک صفحه را کامل تا کار افتادن ببریم.

// پیشنهاد مسیر (به‌ترتیب اولویت و وابستگی):

// Breadcrumb — کوچک، بلوکه‌کنندهٔ دو صفحه، آخرین قطعهٔ مارک‌آپ لیست.
// stores/cart — زیرساختی که سبد، هدر، ProductInfo و همین checkout همه به آن گیر کرده‌اند. (اول تصمیم سرور یا localStorage.)
// یک صفحه را تا انتها کامل کنیم؛ پیشنهادم صفحهٔ جزئیات است (ProductInfo → ProductGallery → ProductTabs → RelatedProducts) چون قیف خرید از آن‌جا شروع می‌شود.
// قبل از اینکه ادامه بدهم، سه تصمیم را ازت می‌خواهم چون کل طراحیِ قطعاتِ بعدی به آن‌ها بند است:

// سبد سمت سرور است یا localStorage؟
// پرداخت مدلِ «هدایت به درگاه» است (بدون فرم کارت) یا درون‌برنامه‌ای؟
// دادهٔ نیمه‌کارهٔ checkout باید persist شود یا نه؟
// و در این فاصله، پیشنهادم این است که Breadcrumb را بسازم (چون بی‌نیاز به این تصمیم‌هاست و بلوکه‌کنندهٔ دو صفحه است). بروم سراغش؟ 🙂