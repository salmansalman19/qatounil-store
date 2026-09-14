function ProductCard({ product, onProductClick }) {
  return (
    <div
      className="product-card"
      onClick={() => onProductClick(product)}
    >
      <div className="product-image">
        صورة المنتج
      </div>

      <div className="product-info">
        <span>{product.category}</span>

        <h3>{product.name}</h3>

        <div className="product-bottom">
          <strong>
            {product.price > 0
              ? `${product.price} ₪`
              : "السعر عند الطلب"}
          </strong>

          <button
            className="order-button"
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}
          >
            عرض التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;