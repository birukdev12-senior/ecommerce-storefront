"use client";

import React, { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Wireless Headphones", price: 4999, image: "🎧" },
  { id: 2, name: "Smart Watch", price: 12999, image: "⌚" },
  { id: 3, name: "Gaming Mouse", price: 3499, image: "🖱️" },
  { id: 4, name: "Mechanical Keyboard", price: 7999, image: "⌨️" },
  { id: 5, name: "USB-C Hub", price: 2499, image: "🔌" },
  { id: 6, name: "Webcam 1080p", price: 5999, image: "📷" },
];

const ProductCard = React.memo(function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  const handleBuyNow = useCallback(async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: product.price, name: product.name }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error", err);
    }
  }, [product.price, product.name]);

  return (
    <article className="flex flex-col items-center rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <span className="text-6xl" aria-hidden="true">{product.image}</span>
      <h2 className="mt-3 text-lg font-semibold text-gray-800">{product.name}</h2>
      <p className="text-2xl font-bold text-indigo-600">${(product.price / 100).toFixed(2)}</p>
      <div className="mt-4 flex w-full gap-2">
        <button
          onClick={() => onAddToCart(product)}
          className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Buy Now
        </button>
      </div>
    </article>
  );
});

const CartIcon = React.memo(function CartIcon({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Shopping cart with ${count} items`}
      className="relative rounded-full bg-white p-2 shadow hover:bg-gray-50"
    >
      🛒
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
});

const CartModal = React.memo(function CartModal({
  items,
  onClose,
  onRemove,
}: {
  items: Product[];
  onClose: () => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="max-h-96 w-96 overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-gray-800">Your Cart</h2>
        {items.length === 0 && <p className="text-gray-500">Cart is empty.</p>}
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <span>{item.name} – ${(item.price / 100).toFixed(2)}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-200 py-2 font-medium hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
});

export default function StorePage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => [...prev, product]);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const cartCount = cart.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold text-gray-800">TechShop</h1>
        <CartIcon count={cartCount} onClick={() => setShowCart(true)} />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </main>

      {showCart && (
        <CartModal items={cart} onClose={() => setShowCart(false)} onRemove={removeFromCart} />
      )}
    </div>
  );
}
