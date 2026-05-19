const CART_ID_STORAGE_KEY = "magento_cart_id";

export function getCartId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CART_ID_STORAGE_KEY);
}

export function setCartId(cartId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
}

export function clearCartId(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CART_ID_STORAGE_KEY);
}
