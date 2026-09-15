import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function Dashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("رجالي");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [message, setMessage] = useState("");

  // جلب المنتجات
  const fetchProducts = async () => {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("حدث خطأ أثناء تحميل المنتجات ❌");
    } else {
      setProducts(data || []);
    }

    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // إضافة أو تعديل المنتج
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      let imageUrl = editingProduct?.image || null;

      // رفع صورة جديدة
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // تعديل المنتج
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({
            name,
            category,
            price: price ? Number(price) : 0,
            description,
            image: imageUrl,
          })
          .eq("id", editingProduct.id);

        if (error) {
          throw error;
        }

        setMessage("تم تعديل المنتج بنجاح ✅");
      }

      // إضافة منتج جديد
      else {
        const { error } = await supabase
          .from("products")
          .insert([
            {
              name,
              category,
              price: price ? Number(price) : 0,
              description,
              image: imageUrl,
              is_active: true,
            },
          ]);

        if (error) {
          throw error;
        }

        setMessage("تم إضافة المنتج بنجاح ✅");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      setMessage("حدث خطأ أثناء حفظ المنتج ❌");
    }

    setLoading(false);
  };

  // تجهيز المنتج للتعديل
  const handleEdit = (product) => {
    setEditingProduct(product);

    setName(product.name || "");
    setCategory(product.category || "رجالي");
    setPrice(product.price || "");
    setDescription(product.description || "");
    setImage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // إلغاء التعديل
  const cancelEdit = () => {
    resetForm();
  };

  // إخفاء / إظهار المنتج
  const toggleProductStatus = async (product) => {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
      })
      .eq("id", product.id);

    if (error) {
      console.error(error);
      setMessage("حدث خطأ أثناء تغيير حالة المنتج ❌");
      return;
    }

    setMessage(
      product.is_active
        ? "تم إخفاء المنتج من الموقع ✅"
        : "تم إظهار المنتج في الموقع ✅"
    );

    fetchProducts();
  };

  // حذف المنتج
  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف "${product.name}"؟`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(error);
      setMessage("حدث خطأ أثناء حذف المنتج ❌");
      return;
    }

    setMessage("تم حذف المنتج بنجاح ✅");

    fetchProducts();
  };

  // إعادة النموذج للوضع الطبيعي
  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setCategory("رجالي");
    setPrice("");
    setDescription("");
    setImage(null);

    const imageInput = document.getElementById("product-image");

    if (imageInput) {
      imageInput.value = "";
    }
  };

  return (
    <div className="admin-page" dir="rtl">

      {/* الهيدر */}
      <header className="admin-header">
        <div>
          <h1>لوحة تحكم قطونيل</h1>
          <p>إدارة المنتجات</p>
        </div>

        <button
          className="admin-logout"
          onClick={onLogout}
        >
          تسجيل الخروج
        </button>
      </header>

      <main className="admin-container">

        {/* نموذج المنتج */}
        <div className="admin-card">

          <h2>
            {editingProduct
              ? "تعديل المنتج"
              : "إضافة منتج جديد"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>اسم المنتج</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: فانيلة قطونيل"
                required
              />
            </div>

            <div className="form-group">
              <label>القسم</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="رجالي">رجالي</option>
                <option value="نسائي">نسائي</option>
                <option value="أطفال">أطفال</option>
              </select>
            </div>

            <div className="form-group">
              <label>السعر</label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 35"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>وصف المنتج</label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصف المنتج..."
                rows="5"
              />
            </div>

            <div className="form-group">
              <label>
                {editingProduct
                  ? "تغيير صورة المنتج (اختياري)"
                  : "صورة المنتج"}
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required={!editingProduct}
              />
            </div>

            {message && (
              <div className="admin-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="add-product-button"
              disabled={loading}
            >
              {loading
                ? "جاري الحفظ..."
                : editingProduct
                ? "حفظ التعديلات"
                : "إضافة المنتج"}
            </button>

            {editingProduct && (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={cancelEdit}
              >
                إلغاء التعديل
              </button>
            )}

          </form>
        </div>

        {/* قائمة المنتجات */}
        <div className="admin-products">

          <div className="admin-products-header">
            <h2>المنتجات</h2>

            <span>
              عدد المنتجات: {products.length}
            </span>
          </div>

          {loadingProducts ? (
            <p className="admin-loading">
              جاري تحميل المنتجات...
            </p>
          ) : products.length === 0 ? (
            <p className="admin-empty">
              لا يوجد منتجات حتى الآن.
            </p>
          ) : (
            <div className="admin-products-list">

              {products.map((product) => (

                <div
                  className={`admin-product-item ${
                    !product.is_active
                      ? "inactive-product"
                      : ""
                  }`}
                  key={product.id}
                >

                  {/* الصورة */}
                  <div className="admin-product-image">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <span>بدون صورة</span>
                    )}

                  </div>

                  {/* المعلومات */}
                  <div className="admin-product-info">

                    <div className="admin-product-top">

                      <h3>
                        {product.name}
                      </h3>

                      <span
                        className={
                          product.is_active
                            ? "product-status active"
                            : "product-status inactive"
                        }
                      >
                        {product.is_active
                          ? "ظاهر"
                          : "مخفي"}
                      </span>

                    </div>

                    <p>
                      القسم: {product.category}
                    </p>

                    <strong>
                      {product.price > 0
                        ? `${product.price} ₪`
                        : "السعر عند الطلب"}
                    </strong>

                  </div>

                  {/* الأزرار */}
                  <div className="admin-product-actions">

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(product)
                      }
                    >
                      تعديل
                    </button>

                    <button
                      className="toggle-button"
                      onClick={() =>
                        toggleProductStatus(product)
                      }
                    >
                      {product.is_active
                        ? "إخفاء"
                        : "إظهار"}
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteProduct(product)
                      }
                    >
                      حذف
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default Dashboard;