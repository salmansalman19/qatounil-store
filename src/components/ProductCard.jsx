function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image">
        صورة المنتج
      </div>

      <div className="product-info">
        <span>{product.category}</span>

        <h3>{product.name}</h3>

        <div className="product-bottom">
          <strong>
            {product.price > 0 ? `${product.price} ₪` : "السعر عند الطلب"}
          </strong>

          <a
            href="https://wa.me/970XXXXXXXXX"
            target="_blank"
            rel="noreferrer"
            className="order-button"
          >
            اطلب الآن
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;