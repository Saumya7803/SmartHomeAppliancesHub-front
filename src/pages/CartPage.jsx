import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import ProductImage from "../components/product/ProductImage";
import { getProductFallbackImage } from "../utils/productImageFallbacks";
import {
  decrementCartItem,
  getCartItemCount,
  getCartSubtotal,
  incrementCartItem,
  readStoredCartItems,
  removeCartItem,
  writeStoredCartItems,
} from "../utils/cartStorage";

function formatInr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState(() => readStoredCartItems());

  useEffect(() => {
    writeStoredCartItems(cartItems);
  }, [cartItems]);

  const cartCount = useMemo(() => getCartItemCount(cartItems), [cartItems]);
  const cartSubtotal = useMemo(() => getCartSubtotal(cartItems), [cartItems]);

  return (
    <main className="cart-page">
      <section className="products-hero">
        <div className="container">
          <p className="hero-label">Shopping Cart</p>
          <h1>Review your selected appliances.</h1>
          <p>
            Adjust quantities, remove items, and proceed when you are ready to finalize your order.
          </p>
        </div>
      </section>

      <section className="section-padded section-tight">
        <div className="container">
          {cartItems.length ? (
            <div className="cart-page-layout">
              <section className="cart-page-main">
                <div className="cart-page-main-head">
                  <div>
                    <h2>Your Cart</h2>
                    <p>{cartCount} item(s) selected</p>
                  </div>
                  <button
                    type="button"
                    className="shop-cart-clear-btn"
                    onClick={() => setCartItems([])}
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="shop-cart-list">
                  {cartItems.map((item) => (
                    <article key={item.id} className="shop-cart-item">
                      <ProductImage
                        key={item.id}
                        src={item.image}
                        fallbackSrc={item.fallbackImage || getProductFallbackImage(item)}
                        alt={item.name}
                        loading="lazy"
                      />

                      <div className="shop-cart-item-copy">
                        <Link to={`/products/${item.id}`}>{item.name}</Link>
                        <p>{item.brand}</p>
                        <strong>{formatInr(item.price)}</strong>
                      </div>

                      <div className="shop-cart-item-controls">
                        <button
                          type="button"
                          aria-label={`Decrease quantity for ${item.name}`}
                          onClick={() => setCartItems((current) => decrementCartItem(current, item.id))}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity for ${item.name}`}
                          onClick={() => setCartItems((current) => incrementCartItem(current, item.id))}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          className="danger"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => setCartItems((current) => removeCartItem(current, item.id))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="cart-page-summary-card">
                <div className="cart-page-summary-head">
                  <span className="cart-page-summary-icon" aria-hidden="true">
                    <ShoppingCart size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <h2>Order Summary</h2>
                    <p>{cartCount} item(s)</p>
                  </div>
                </div>

                <div className="cart-page-summary-row">
                  <span>Subtotal</span>
                  <strong>{formatInr(cartSubtotal)}</strong>
                </div>
                <div className="cart-page-summary-row">
                  <span>Shipping</span>
                  <span>Calculated later</span>
                </div>
                <div className="cart-page-summary-total">
                  <span>Total</span>
                  <strong>{formatInr(cartSubtotal)}</strong>
                </div>

                <div className="cart-page-actions">
                  <Link to="/contact" className="btn-primary">
                    Proceed to Checkout
                  </Link>
                  <Link to="/products" className="btn-outline">
                    Continue Shopping
                  </Link>
                </div>
              </aside>
            </div>
          ) : (
            <div className="empty-state cart-page-empty">
              <h2>Your cart is empty</h2>
              <p>Add products from the catalogue to build your order.</p>
              <Link to="/products" className="btn-primary">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
