import { useEffect, useState } from "react";
import "./App.css";
import ProductCard from "./components/ProductCard";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import { supabase } from "./supabase";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [adminUser, setAdminUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const categories = ["الكل", "رجالي", "نسائي", "أطفال"];

  // رقم WhatsApp الخاص بالمحل
  const whatsappNumber = "972568030525";

  // =========================
  // فحص جلسة تسجيل الدخول
  // =========================

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
      }

      setAdminUser(data.session?.user || null);
      setCheckingSession(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // جلب المنتجات من Supabase
  // =========================

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductsError("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase products error:", error);
        setProductsError("حدث خطأ أثناء تحميل المنتجات.");
        setProducts([]);
      } else {
        console.log("Products from Supabase:", data);
        setProducts(data || []);
      }

      setLoadingProducts(false);
    };

    fetchProducts();
  }, []);

  // =========================
  // فلترة المنتجات
  // =========================

  const filteredProducts =
    selectedCategory === "الكل"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  // =========================
  // صفحة الإدارة
  // =========================

  if (window.location.pathname === "/admin") {
    if (checkingSession) {
      return (
        <div
          dir="rtl"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Cairo, sans-serif",
            fontSize: "18px",
          }}
        >
          جاري تحميل لوحة التحكم...
        </div>
      );
    }

    if (!adminUser) {
      return <Login onLogin={setAdminUser} />;
    }

    return (
      <Dashboard
        user={adminUser}
        onLogout={async () => {
          await supabase.auth.signOut();
          setAdminUser(null);
        }}
      />
    );
  }

  // =========================
  // الموقع الرئيسي
  // =========================

  return (
    <div className="app" dir="rtl">

      {/* =========================
          Header
      ========================= */}

      <header className="header">
        <div className="container header-content">

          <div className="logo">
            <h2>قطونيل</h2>
            <span>قلقيلية</span>
          </div>

          <nav className="nav">
            <a href="#home">الرئيسية</a>
            <a href="#categories">الأقسام</a>
            <a href="#products">المنتجات</a>
            <a href="#about">من نحن</a>
          </nav>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-button"
          >
            تواصل معنا
          </a>

        </div>
      </header>

      {/* =========================
          Hero
      ========================= */}

           <section className="hero">
  <div className="container hero-content">

    <div className="hero-text">
      <span className="hero-badge">Cottonil Qalqilya</span>

      <h1>
        راحتك تبدأ
        <br />
        من Cottonil
      </h1>

      <p>
        اكتشف تشكيلتنا من الملابس الداخلية والملابس العائلية
        بجودة وراحة تناسب جميع أفراد العائلة.
      </p>

      <button
        className="hero-button"
        onClick={() => {
          document
            .getElementById("products")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        اكتشف المنتجات
      </button>
    </div>
        <div className="hero-media">

          <div className="hero-banner">
            <img
              src="/cottonil-banner.jpg"
              alt="Cottonil Qalqilya"
            />
          </div>

          <div className="hero-video">
            <video
              src="/cottonil-promo.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>

        </div>

  </div>
</section>

      {/* =========================
          Categories
      ========================= */}

      <section className="categories" id="categories">
        <div className="container">

          <div className="section-heading">
            <span>تسوق حسب القسم</span>
            <h2>أقسام المنتجات</h2>
          </div>

          <div className="category-grid">

            {categories
              .filter((category) => category !== "الكل")
              .map((category) => (
                <button
                  key={category}
                  className="category-card"
                  onClick={() => {
                    setSelectedCategory(category);

                    setTimeout(() => {
                      document
                        .getElementById("products")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }, 100);
                  }}
                >
                  <h3>{category}</h3>
                  <span>تصفح المنتجات</span>
                </button>
              ))}

          </div>

        </div>
      </section>

      {/* =========================
          Products
      ========================= */}

      <section className="products" id="products">
        <div className="container">

          <div className="section-heading">
            <span>منتجاتنا</span>
            <h2>منتجات قطونيل</h2>
          </div>

          {/* Filter */}

          <div className="category-filter">

            {categories.map((category) => (
              <button
                key={category}
                className={
                  selectedCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSelectedCategory(category)
                }
              >
                {category}
              </button>
            ))}

          </div>

          {/* Loading */}

          {loadingProducts && (
            <div className="products-message">
              جاري تحميل المنتجات...
            </div>
          )}

          {/* Error */}

          {!loadingProducts && productsError && (
            <div className="products-message">
              {productsError}
            </div>
          )}

          {/* Empty */}

          {!loadingProducts &&
            !productsError &&
            filteredProducts.length === 0 && (
              <div className="products-message">
                لا توجد منتجات في هذا القسم حاليًا.
              </div>
            )}

          {/* Products */}

          {!loadingProducts &&
            !productsError &&
            filteredProducts.length > 0 && (
              <div className="products-grid">

                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={(product) => {
                      setSelectedProduct(product);
                      setQuantity(1);
                    }}
                  />
                ))}

              </div>
            )}

        </div>
      </section>

      {/* =========================
          About
      ========================= */}

      <section className="about" id="about">
        <div className="container">

          <div className="section-heading">
            <span>من نحن</span>
            <h2>قطونيل - قلقيلية</h2>
          </div>

          <div className="about-content">

            <p>
              نوفر لكم منتجات قطونيل الأصلية لمختلف أفراد العائلة،
              مع اهتمامنا بالجودة والراحة وتقديم خدمة مميزة لعملائنا.
            </p>

            <p>
              يمكنك تصفح المنتجات واختيار ما يناسبك والتواصل معنا
              مباشرة عبر WhatsApp لإتمام الطلب.
            </p>

          </div>

        </div>
      </section>

      {/* =========================
          Product Modal
      ========================= */}

      {selectedProduct && (
        <div
          className="product-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >

          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close */}

            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
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

            {/* Product Details */}

            <div className="modal-info">

              <span className="modal-category">
                {selectedProduct.category}
              </span>

              <h2>{selectedProduct.name}</h2>

              <div className="modal-price">
                {selectedProduct.price > 0
                  ? `${selectedProduct.price} ₪`
                  : "السعر عند الطلب"}
              </div>

              {selectedProduct.description && (
                <p className="modal-description">
                  {selectedProduct.description}
                </p>
              )}

              {/* Quantity */}

              <div className="quantity-selector">
                <span>الكمية:</span>

                <div className="quantity-controls">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                  >
                    −
                  </button>

                  <strong>{quantity}</strong>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => current + 1)
                    }
                  >
                    +
                  </button>

                </div>
              </div>

              {/* WhatsApp Order */}

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `مرحبًا، أريد طلب المنتج التالي:

المنتج: ${selectedProduct.name}
القسم: ${selectedProduct.category}
الكمية: ${quantity}
السعر: ${
                    selectedProduct.price > 0
                      ? `${selectedProduct.price} ₪`
                      : "عند الطلب"
                  }`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="modal-whatsapp-button"
              >
                اطلب عبر WhatsApp
              </a>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          Footer
      ========================= */}

      <footer className="footer">
        <div className="container">

          <h3>قطونيل - قلقيلية</h3>

          <p>
            منتجات قطونيل الأصلية للرجال والنساء والأطفال.
          </p>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
          >
            تواصل معنا عبر WhatsApp
          </a>

          <div className="footer-bottom">
            © {new Date().getFullYear()} قطونيل - قلقيلية
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;