import { useState } from "react";
import "./App.css";
import ProductCard from "./components/ProductCard";
import products from "./data/products";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // المنتج الذي تم اختياره لعرض التفاصيل
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ["الكل", "رجالي", "نسائي", "أطفال"];

  const filteredProducts =
    selectedCategory === "الكل"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="container nav">

          <div className="logo">
            <h2>قطونيل</h2>
            <span>قلقيلية</span>
          </div>

          <nav>
            <a href="#home">الرئيسية</a>
            <a href="#categories">الأقسام</a>
            <a href="#products">المنتجات</a>
            <a href="#about">عن المحل</a>
            <a href="#contact">تواصل معنا</a>
          </nav>

          <a
            href="https://wa.me/970XXXXXXXXX"
            target="_blank"
            rel="noreferrer"
            className="whatsapp-button"
          >
            WhatsApp
          </a>

        </div>
      </header>


      <main>

        {/* Hero */}
        <section className="hero" id="home">
          <div className="container hero-content">

            <div className="hero-text">

              <span className="badge">
                متجر قطونيل - قلقيلية
              </span>

              <h1>
                راحتك تبدأ
                <span>من اختيارك</span>
              </h1>

              <p>
                اكتشف تشكيلتنا من الملابس الداخلية
                واختر ما يناسبك بكل سهولة.
              </p>

              <div className="hero-buttons">

                <a
                  href="#products"
                  className="primary-button"
                >
                  تصفح المنتجات
                </a>

                <a
                  href="https://wa.me/970XXXXXXXXX"
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button"
                >
                  اطلب عبر WhatsApp
                </a>

              </div>

            </div>

            <div className="hero-image">
              <div className="image-placeholder">
                صورة المنتجات
              </div>
            </div>

          </div>
        </section>


        {/* Categories */}
        <section
          className="categories section"
          id="categories"
        >
          <div className="container">

            <div className="section-heading">
              <span>تسوق حسب القسم</span>
              <h2>اختر القسم المناسب</h2>
            </div>

            <div className="category-grid">

              <button
                className="category-card"
                onClick={() => {
                  setSelectedCategory("رجالي");

                  document
                    .getElementById("products")
                    .scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <div className="category-icon">👔</div>
                <h3>رجالي</h3>
                <span>اكتشف الآن →</span>
              </button>


              <button
                className="category-card"
                onClick={() => {
                  setSelectedCategory("نسائي");

                  document
                    .getElementById("products")
                    .scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <div className="category-icon">👗</div>
                <h3>نسائي</h3>
                <span>اكتشف الآن →</span>
              </button>


              <button
                className="category-card"
                onClick={() => {
                  setSelectedCategory("أطفال");

                  document
                    .getElementById("products")
                    .scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                <div className="category-icon">🧒</div>
                <h3>أطفال</h3>
                <span>اكتشف الآن →</span>
              </button>

            </div>

          </div>
        </section>


        {/* Products */}
        <section
          className="products section"
          id="products"
        >
          <div className="container">

            <div className="section-heading">
              <span>منتجاتنا</span>
              <h2>أحدث المنتجات</h2>
            </div>


            {/* Filter Buttons */}
            <div className="filter-buttons">

              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={
                    selectedCategory === category
                      ? "filter-button active"
                      : "filter-button"
                  }
                >
                  {category}
                </button>
              ))}

            </div>


            {/* Products */}
            <div className="products-grid">

              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={setSelectedProduct}
                />
              ))}

            </div>

          </div>
        </section>


        {/* About */}
        <section
          className="about section"
          id="about"
        >
          <div className="container about-box">

            <div>
              <span>لماذا نحن؟</span>

              <h2>
                جودة وراحة
                <br />
                في مكان واحد
              </h2>
            </div>

            <p>
              نوفر مجموعة متنوعة من منتجات قطونيل
              وخيارات متعددة تناسب احتياجات عملائنا.
            </p>

          </div>
        </section>

      </main>


      {/* =================================
          Product Details Modal
      ================================= */}

      {selectedProduct && (
        <div
          className="product-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >

          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close Button */}
            <button
              className="close-modal"
              onClick={() => setSelectedProduct(null)}
              aria-label="إغلاق"
            >
              ×
            </button>


            {/* Product Image */}
            <div className="modal-image">

              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                />
              ) : (
                <span>صورة المنتج</span>
              )}

            </div>


            {/* Product Information */}
            <div className="modal-content">

              <span className="modal-category">
                {selectedProduct.category}
              </span>

              <h2>
                {selectedProduct.name}
              </h2>

              <p className="modal-price">

                {selectedProduct.price > 0
                  ? `${selectedProduct.price} ₪`
                  : "السعر عند الطلب"}

              </p>

              <p className="modal-description">
                منتج من منتجات قطونيل، متوفر لدى
                وكيل قطونيل في قلقيلية.
              </p>

              <p className="modal-description">
                للاستفسار عن المقاسات والألوان
                والتوفر، يمكنك التواصل معنا مباشرة
                عبر WhatsApp.
              </p>


              {/* WhatsApp Order */}
              <a
                href="https://wa.me/970XXXXXXXXX"
                target="_blank"
                rel="noreferrer"
                className="modal-whatsapp"
              >
                اطلب عبر WhatsApp
              </a>

            </div>

          </div>

        </div>
      )}


      {/* Footer */}
      <footer
        className="footer"
        id="contact"
      >
        <div className="container footer-content">

          <div>
            <h2>قطونيل - قلقيلية</h2>

            <p>
              متجر متخصص في منتجات قطونيل
              والملابس الداخلية.
            </p>
          </div>

          <div>
            <h3>تواصل معنا</h3>

            <p>
              WhatsApp: 970XXXXXXXXX
            </p>

            <p>
              قلقيلية - فلسطين
            </p>
          </div>

        </div>

        <div className="copyright">
          © 2026 قطونيل - قلقيلية
        </div>
      </footer>

    </div>
  );
}

export default App;