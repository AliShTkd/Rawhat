// src/pages/Home/Home.tsx
import { type Component } from "solid-js";
import { Title } from "@solidjs/meta";

import HeroSection from "./HeroSection";
import CategorySection from "./CategorySection";
import FeaturedProductsSection from "./FeaturedProductsSection";
import BestSellersSection from "./BestSellersSection";
import NewArrivalsSection from "./NewArrivalsSection";
import FeaturesSection from "./FeaturesSection";
import NewsletterSection from "./NewsletterSection";
import BrandsSection from "./BrandsSection";
import PromotionalBanner from "./PromotionalBanner";

const HomePage: Component = () => {
  return (
    <main class="home-page" dir="rtl">
      <Title>فروشگاه | خانه</Title>

      <HeroSection
        title="فروش آنلاین محصولات با کیفیت"
        subtitle="خرید آسان، ارسال سریع، ضمانت اصالت کالا"
        eyebrow="فروشگاه آنلاین"
        actions={[
          { label: "مشاهده محصولات", href: "/products", variant: "primary" },
          { label: "مشاوره رایگان", href: "/search", variant: "secondary" },
        ]}
      />

      <CategorySection
        title="دسته‌بندی محصولات"
        categories={[]}
      />

      <FeaturedProductsSection
        title="محصولات منتخب"
        viewAllHref="/products?sort=featured"
        products={[]}
      />

      <BestSellersSection
        title="پرفروش‌ترین‌ها"
        viewAllHref="/products?sort=best-selling"
        products={[]}
        showRank
      />

      <PromotionalBanner
        variant="primary"
        title="تخفیف ویژه"
        description="تا پایان هفته با ارسال رایگان"
        action={{ label: "مشاهده پیشنهاد", href: "/products" }}
      />

      <NewArrivalsSection
        title="جدیدترین محصولات"
        viewAllHref="/products?sort=newest"
        products={[]}
        showNewBadge
      />

      <FeaturesSection
        title="چرا از ما خرید کنید؟"
        features={[
          { id: "shipping", title: "ارسال سریع", description: "ارسال به سراسر کشور در کوتاه‌ترین زمان" },
          { id: "authentic", title: "ضمانت اصالت", description: "تمامی محصولات با ضمانت اصالت ارائه می‌شوند" },
          { id: "support", title: "پشتیبانی تخصصی", description: "مشاوره توسط کارشناسان برای انتخاب بهتر محصولات" },
        ]}
      />

      <BrandsSection
        title="برندهای معتبر"
        brands={[]}
      />

      <NewsletterSection
        title="عضویت در خبرنامه"
        description="جدیدترین محصولات و پیشنهادهای ویژه را در ایمیل دریافت کنید."
      />
    </main>
  );
};

export default HomePage;
