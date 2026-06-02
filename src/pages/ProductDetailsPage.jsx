import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EnquiryModal from "../components/enquiry/EnquiryModal";
import ProductImage from "../components/product/ProductImage";
import { normalizePublicProduct } from "../utils/publicProductMapper";

function isPriceSpecificationKey(key) {
  return /(price|mrp|inr|₹|cost|amount)/i.test(String(key || ""));
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/products", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch products (${response.status})`);
        }

        const payload = await response.json();
        const rows = Array.isArray(payload.products) ? payload.products : [];
        const matchedProduct = rows.find((row) => String(row.id) === String(id));

        if (!ignore) {
          setProduct(matchedProduct ? normalizePublicProduct(matchedProduct) : null);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        if (!ignore) {
          setProduct(null);
          setError(requestError.message || "Failed to load product details");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <main className="container section-padded">
        <div className="empty-state">
          <p>Loading product details...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container section-padded">
        <div className="empty-state">
          <h1>Product Not Found</h1>
          <p>{error || "The requested product is not available in the current catalog."}</p>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const technicalSpecificationEntries = Object.entries(product.technicalSpecifications || {}).filter(
    ([key]) => !isPriceSpecificationKey(key)
  );

  return (
    <main className="container section-padded">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Solutions</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <section className="product-detail-layout">
        <div className="product-detail-image-wrap">
          <ProductImage
            key={product.id}
            src={product.image}
            fallbackSrc={product.fallbackImage}
            alt={product.name}
            className="product-detail-image"
          />
        </div>

        <div className="product-detail-content">
          <p className="product-detail-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-quote-note">Available for Business Quotation</p>

          <div className="detail-pill-row">
            <span className="detail-pill">Brand: {product.brand}</span>
            <span className="detail-pill">Model: {product.modelNumber}</span>
            <span className="detail-pill">{product.enterpriseProfile?.solutionCluster}</span>
          </div>

          <section>
            <h2>Solution Summary</h2>
            <p>{product.shortDescription}</p>
          </section>

          <section>
            <h2>Business Context</h2>
            <p>{product.longDescription}</p>
          </section>

          <section>
            <h2>Deployment Use Case</h2>
            <p>{product.applicationUse}</p>
          </section>

          <div className="product-detail-actions">
            <button type="button" className="btn-primary" onClick={() => setEnquiryOpen(true)}>
              Request Quote
            </button>
            <Link to="/contact" className="btn-outline">
              Contact Sales
            </Link>
            {product.brochureUrl ? (
              <a
                href={product.brochureUrl}
                className="btn-outline"
                download
                target="_blank"
                rel="noreferrer"
              >
                Download Datasheet
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="specifications-card enterprise-spec-card">
        <h2>Enterprise Procurement Information</h2>
        <div className="enterprise-info-grid">
          <article>
            <h3>Procurement Model</h3>
            <p>{product.enterpriseProfile?.procurementModel}</p>
          </article>
          <article>
            <h3>Lead Time</h3>
            <p>{product.enterpriseProfile?.leadTimeRange}</p>
          </article>
          <article>
            <h3>Warranty Plan</h3>
            <p>{product.enterpriseProfile?.warrantyPlan}</p>
          </article>
          <article>
            <h3>Support SLA</h3>
            <p>{product.enterpriseProfile?.supportSla}</p>
          </article>
          <article>
            <h3>Deployment Environment</h3>
            <p>{product.enterpriseProfile?.deploymentEnvironment}</p>
          </article>
          <article>
            <h3>MOQ Guideline</h3>
            <p>{product.enterpriseProfile?.moqGuideline}</p>
          </article>
          <article>
            <h3>Implementation Window</h3>
            <p>{product.enterpriseProfile?.implementationWindow}</p>
          </article>
          <article>
            <h3>Compliance Notes</h3>
            <p>{product.enterpriseProfile?.complianceStandards}</p>
          </article>
        </div>
      </section>

      <section className="specifications-card">
        <h2>Technical Specifications</h2>
        <div className="spec-table-wrap">
          <table>
            <tbody>
              {technicalSpecificationEntries.map(([key, value]) => (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {enquiryOpen ? <EnquiryModal product={product} onClose={() => setEnquiryOpen(false)} /> : null}
    </main>
  );
}
