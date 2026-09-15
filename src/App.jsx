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

  // Cart
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const categories = ["الكل", "رجالي", "نسائي", "أطفال"];

  const whatsappNumber = "972568030525";

  // =========================================================
  // Load admin session
  // =========================================================
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

    return () => subscription.unsubscribe();
  }, []);

  // =========================================================
  // Load products
  // =========================================================
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
        console.error("Products error:", error);
        setProductsError("حدث خطأ أثناء تحميل المنتجات.");
      } else {
        setProducts(data || []);
      }

      setLoadingProducts(false);
    };

    fetchProducts();
  }, []);

  // =========================================================
  // Load cart from localStorage
  // =========================================================
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cottonil-cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("Cart load error:", error);
    }
  }, []);

  // =========================================================
  // Save cart to localStorage
  // =========================================================
  useEffect(() => {
    try {
      localStorage.setItem("cottonil-cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Cart save error:", error);
    }
  }, [cart]);

  // =========================================================
  // Admin route
  // =========================================================
  if (window.location.pathname === "/admin") {
    if (checkingSession) {
      return (
        <div className="loading-screen">
          <p>جاري التحميل...</p>
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

  // =========================================================
  // Filter products
  // =========================================================
  const filteredProducts =
    selectedCategory === "الكل"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  // =========================================================
  // Cart functions
  // =========================================================

  const addToCart = (product, productQuantity = 1) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + productQuantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: productQuantity,
        },
      ];
    });

    setSelectedProduct(null);
    setQuantity(1);
    setCartOpen(true);
  };

  const increaseCartQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseCartQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // =========================================================
  // Cart totals
  // =========================================================

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce((total, item) => {
    const price = Number(item.price) || 0;
    return total + price * item.quantity;
  }, 0);

  // =========================================================
  // WhatsApp order
  // =========================================================

  const sendCartToWhatsApp = () => {
    if (cart.length === 0) {
      return;
    }

    const orderLines = cart
      .map((item, index) => {
        const price =
          Number(item.price) > 0
            ? `${Number(item.price)} ₪`
            : "السعر عند الطلب";

        return `${index + 1}. ${item.name}
القسم: ${item.category}
الكمية: ${item.quantity}
السعر: ${price}`;
      })
      .join("\n\n");

    const totalText =
      cartTotal > 0 ? `${cartTotal.toFixed(2)} ₪` : "عند الطلب";

    const message = `مرحبًا، أريد طلب المنتجات التالية من Cottonil Qalqilya:

${orderLines}

الإجمالي: ${totalText}

الاسم:
العنوان:
ملاحظات:`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  // =========================================================
  // Main site
  // =========================================================

  return (
    <div className="app" dir="rtl">
      {/* ========================= Header ========================= */}
      <header className="header">
        <div className="container header-content">
          <a href="#" className="logo">
            <span className="logo-main">Cottonil</span>
            <span className="logo-sub">Qalqilya</span>
          </a>

          <nav className="nav">
            <a href="#home">الرئيسية</a>
            <a href="#products">المنتجات</a>
            <a href="#about">من نحن</a>
            <a href="#contact">تواصل معنا</a>
          </nav>

         <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label="السلة"
          >
            <span className="cart-icon">🛒</span>
            <span className="cart-label">السلة</span>

            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ========================= Hero ========================= */}
      <main>
        <section className="hero" id="home">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="hero-badge">
                Cottonil Qalqilya
              </span>

              <h1>
                راحتك تبدأ
                <br />
                من Cottonil
              </h1>

              <p>
                اكتشف تشكيلتنا من الملابس الداخلية والملابس
                العائلية بجودة وراحة تناسب جميع أفراد العائلة.
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

        {/* ========================= Categories ========================= */}
        <section className="categories">
          <div className="container">
            <div className="section-heading">
              <span>تسوق حسب القسم</span>
              <h2>منتجاتنا</h2>
            </div>

            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? "category-button active"
                      : "category-button"
                  }
                  onClick={() => {
                    setSelectedCategory(category);

                    setTimeout(() => {
                      document
                        .getElementById("products")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }, 50);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========================= Products ========================= */}
        <section className="products" id="products">
          <div className="container">
            <div className="section-heading">
              <span>تشكيلتنا</span>
              <h2>أحدث المنتجات</h2>
            </div>

            {loadingProducts ? (
              <div className="loading-products">
                <p>جاري تحميل المنتجات...</p>
              </div>
            ) : productsError ? (
              <div className="products-error">
                <p>{productsError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-products">
                <p>لا توجد منتجات في هذا القسم حاليًا.</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={(selected) => {
                      setSelectedProduct(selected);
                      setQuantity(1);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================= About ========================= */}
        <section className="about" id="about">
          <div className="container about-content">
            <div className="about-text">
              <span>من نحن</span>

              <h2>مرحبًا بكم في Cottonil Qalqilya</h2>

              <p>
                نوفر لكم مجموعة متنوعة من منتجات Cottonil
                للرجال والنساء والأطفال، مع التركيز على الجودة
                والراحة والأسعار المناسبة.
              </p>

              <p>
                يمكنك اختيار منتجاتك وإرسال طلبك مباشرة عبر
                WhatsApp بكل سهولة.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon">✓</div>
              <h3>جودة وراحة</h3>
              <p>
                منتجات مختارة بعناية لتناسب احتياجات العائلة.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ========================= Product Modal ========================= */}
      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="إغلاق"
            >
              ×
            </button>

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

            <div className="modal-content">
              <span className="modal-category">
                {selectedProduct.category}
              </span>

              <h2>{selectedProduct.name}</h2>

              <p className="modal-description">
                {selectedProduct.description ||
                  "منتج عالي الجودة من Cottonil."}
              </p>

              <div className="modal-price">
                {Number(selectedProduct.price) > 0
                  ? `${selectedProduct.price} ₪`
                  : "السعر عند الطلب"}
              </div>

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
                    -
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

              <div className="modal-actions">
                <button
                  className="add-to-cart-button"
                  onClick={() =>
                    addToCart(selectedProduct, quantity)
                  }
                >
                  🛒 أضف إلى السلة
                </button>

                <button
                  className="direct-whatsapp-button"
                  onClick={() => {
                    const price =
                      Number(selectedProduct.price) > 0
                        ? `${selectedProduct.price} ₪`
                        : "عند الطلب";

                    const message = `مرحبًا، أريد طلب المنتج التالي:

المنتج: ${selectedProduct.name}
القسم: ${selectedProduct.category}
الكمية: ${quantity}
السعر: ${price}`;

                    window.open(
                      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        message
                      )}`,
                      "_blank"
                    );
                  }}
                >
                  طلب مباشر عبر WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================= Cart Modal ========================= */}
      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="cart-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span>طلبك</span>
                <h2>سلة المنتجات</h2>
              </div>

              <button
                className="cart-close"
                onClick={() => setCartOpen(false)}
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <h3>السلة فارغة</h3>
                <p>
                  أضف بعض المنتجات إلى السلة للبدء بالطلب.
                </p>

                <button
                  className="continue-shopping-button"
                  onClick={() => {
                    setCartOpen(false);

                    document
                      .getElementById("products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => {
                    const itemPrice = Number(item.price) || 0;

                    return (
                      <div
                        className="cart-item"
                        key={item.id}
                      >
                        <div className="cart-item-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                            />
                          ) : (
                            <span>صورة</span>
                          )}
                        </div>

                        <div className="cart-item-info">
                          <h3>{item.name}</h3>

                          <span className="cart-item-category">
                            {item.category}
                          </span>

                          <div className="cart-item-price">
                            {itemPrice > 0
                              ? `${itemPrice} ₪`
                              : "عند الطلب"}
                          </div>

                          <div className="cart-item-bottom">
                            <div className="cart-quantity-controls">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseCartQuantity(
                                    item.id
                                  )
                                }
                              >
                                -
                              </button>

                              <strong>{item.quantity}</strong>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseCartQuantity(
                                    item.id
                                  )
                                }
                              >
                                +
                              </button>
                            </div>

                            <button
                              className="remove-cart-item"
                              type="button"
                              onClick={() =>
                                removeFromCart(item.id)
                              }
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-summary">
                  <div className="cart-summary-row">
                    <span>عدد المنتجات</span>
                    <strong>{cartCount}</strong>
                  </div>

                  <div className="cart-summary-row total">
                    <span>الإجمالي</span>

                    <strong>
                      {cartTotal > 0
                        ? `${cartTotal.toFixed(2)} ₪`
                        : "عند الطلب"}
                    </strong>
                  </div>
                </div>

                <div className="cart-actions">
                  <button
                    className="checkout-whatsapp-button"
                    onClick={sendCartToWhatsApp}
                  >
                    إتمام الطلب عبر WhatsApp
                  </button>

                  <button
                    className="clear-cart-button"
                    onClick={clearCart}
                  >
                    تفريغ السلة
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================= Footer ========================= */}
      <footer className="footer" id="contact">
        <div className="container footer-content">
          <div className="footer-brand">
            <h2>Cottonil</h2>
            <p>
              متجر Cottonil في قلقيلية للملابس الداخلية
              والملابس العائلية.
            </p>
          </div>

          <div className="footer-contact">
            <h3>تواصل معنا</h3>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>

            <a href="tel:+972568030525">
              056 803 0525
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Cottonil Qalqilya. جميع
            الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;