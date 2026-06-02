import { memo } from "react";
import { Link } from "react-router-dom";
import { contactInfo } from "../../data/contactInfo";
import { getProductFallbackImage } from "../../utils/productImageFallbacks";
import ProductImage from "./ProductImage";

function ProductCard({ product, onEnquire }) {
  const whatsappMessage = encodeURIComponent(
    `Hello, I want a quotation for [${product.name} - ${product.modelNumber || "-"}].`
  );

  return (
    <article className="product-card">
      <Link
        to={`/products/${product.id}`}
        className="product-card-image-link"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          key={product.id}
          src={product.image}
          fallbackSrc={product.fallbackImage || getProductFallbackImage(product)}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="product-card-content">
        <p className="product-card-category">{product.brand}</p>
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-meta-line">Model Number: {product.modelNumber || "-"}</p>
        <p className="product-card-description">Available for Business Quotation</p>

        <div className="product-card-actions product-card-actions-2col">
          <button type="button" className="btn-primary" onClick={() => onEnquire(product)}>
            Request Quote
          </button>
          <Link to={`/products/${product.id}`} className="btn-outline">
            View Details
          </Link>
        </div>
        <a
          href={`${contactInfo.whatsappHref}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="btn-outline product-card-whatsapp"
        >
          WhatsApp Enquiry
        </a>
      </div>
    </article>
  );
}

export default memo(ProductCard);
