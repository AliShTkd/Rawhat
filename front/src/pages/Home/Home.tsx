import type { Component } from "solid-js";
import  { For } from "solid-js";

type Category = {
  id: number;
  title: string;
  image: string;
};

type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock: boolean;
};

const HomePage: Component = () => {
  const categories: Category[] = [
    {
      id: 1,
      title: "مکمل‌ها",
      image:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "مراقبت پوست",
      image:
        "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "مراقبت مو",
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "بهداشت دهان و دندان",
      image:
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const products: Product[] = [
    {
      id: 1,
      name: "کپسول ویتامین D3 1000",
      brand: "HealthAid",
      price: 185000,
      oldPrice: 210000,
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      inStock: true,
    },
    {
      id: 2,
      name: "ژل شست‌وشوی صورت پوست چرب",
      brand: "Dermaline",
      price: 139000,
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      inStock: true,
    },
    {
      id: 3,
      name: "شامپو ضد ریزش مو",
      brand: "Cinere",
      price: 228000,
      oldPrice: 249000,
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
      inStock: false,
    },
    {
      id: 4,
      name: "دهان‌شویه آنتی‌باکتریال",
      brand: "MouthCare",
      price: 118000,
      image:
        "https://images.unsplash.com/photo-1550572017-edd951aa8f7f?auto=format&fit=crop&w=800&q=80",
      inStock: true,
    },
  ];

  const formatPrice = (value: number) =>
    `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

  return (
    <main class="home-page" dir="rtl">
      <section class="home-page__hero hero">
        <div class="hero__content">
          <p class="hero__badge">داروخانه آنلاین</p>
          <h1 class="hero__title">سلامتی شما، اولویت ماست</h1>
          <p class="hero__description">
            خرید آنلاین محصولات داروخانه‌ای با ضمانت اصالت کالا، ارسال سریع و
            مشاوره تخصصی.
          </p>
          <div class="hero__actions">
            <button class="hero__button hero__button--primary">
              مشاهده محصولات
            </button>
            <button class="hero__button hero__button--secondary">
              مشاوره رایگان
            </button>
          </div>
        </div>
        <div class="hero__media">
          <img
            class="hero__image"
            src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=80"
            alt="داروخانه آنلاین"
            loading="lazy"
          />
        </div>
      </section>

      <section class="home-page__categories categories">
        <div class="categories__header">
          <h2 class="categories__title">دسته‌بندی محصولات</h2>
          <a class="categories__link" href="#">
            مشاهده همه
          </a>
        </div>

        <div class="categories__grid">
          <For each={categories}>
            {(category) => (
              <article class="categories__card category-card">
                <img
                  class="category-card__image"
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                />
                <h3 class="category-card__title">{category.title}</h3>
              </article>
            )}
          </For>
        </div>
      </section>

      <section class="home-page__products products">
        <div class="products__header">
          <h2 class="products__title">پرفروش‌ترین‌ها</h2>
          <a class="products__link" href="#">
            مشاهده همه
          </a>
        </div>

        <div class="products__grid">
          <For each={products}>
            {(product) => (
              <article class="products__card product-card">
                <div class="product-card__image-wrapper">
                  <img
                    class="product-card__image"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                  {!product.inStock && (
                    <span class="product-card__badge product-card__badge--danger">
                      ناموجود
                    </span>
                  )}
                </div>

                <div class="product-card__body">
                  <p class="product-card__brand">{product.brand}</p>
                  <h3 class="product-card__name">{product.name}</h3>

                  <div class="product-card__pricing">
                    <span class="product-card__price">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span class="product-card__old-price">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    class="product-card__button"
                    disabled={!product.inStock}
                  >
                    {product.inStock ? "افزودن به سبد خرید" : "ناموجود"}
                  </button>
                </div>
              </article>
            )}
          </For>
        </div>
      </section>

      <section class="home-page__features features">
        <article class="features__item">
          <h3 class="features__title">ارسال سریع</h3>
          <p class="features__text">ارسال به سراسر کشور در کوتاه‌ترین زمان</p>
        </article>
        <article class="features__item">
          <h3 class="features__title">ضمانت اصالت</h3>
          <p class="features__text">تمامی محصولات با ضمانت اصالت ارائه می‌شوند</p>
        </article>
        <article class="features__item">
          <h3 class="features__title">پشتیبانی تخصصی</h3>
          <p class="features__text">
            مشاوره توسط کارشناسان برای انتخاب بهتر محصولات
          </p>
        </article>
      </section>
    </main>
  );
};

export default HomePage;