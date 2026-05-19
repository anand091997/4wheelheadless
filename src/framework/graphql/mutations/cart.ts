"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { getBrowserApolloClient } from "../apolloClient";
import type { AddToCartItemInput } from "@/lib/configurableProduct";
import { clearCartId, getCartId, setCartId } from "@/lib/cartStorage";

export const CREATE_EMPTY_CART_MUTATION = gql`
  mutation CreateEmptyCart {
    createEmptyCart
  }
`;

export const ADD_PRODUCTS_TO_CART_MUTATION = gql`
  mutation AddProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        total_quantity
      }
      user_errors {
        code
        message
      }
    }
  }
`;

type CreateEmptyCartResult = {
  createEmptyCart?: string | null;
};

type CartUserError = {
  code?: string | null;
  message?: string | null;
};

type AddProductsToCartResult = {
  addProductsToCart?: {
    cart?: {
      id?: string | null;
      total_quantity?: number | null;
    } | null;
    user_errors?: CartUserError[] | null;
  } | null;
};

type CartItemInput = {
  sku: string;
  quantity: number;
  parent_sku?: string;
  selected_options?: string[];
};

type AddProductsToCartVariables = {
  cartId: string;
  cartItems: CartItemInput[];
};

function normalizeAddToCartInput(
  input: AddToCartItemInput | string,
): AddToCartItemInput {
  if (typeof input === "string") {
    return {
      sku: input.trim(),
      quantity: 1,
    };
  }

  return {
    ...input,
    sku: input.sku.trim(),
    quantity: input.quantity ?? 1,
    parentSku: input.parentSku?.trim(),
    selectedOptions: input.selectedOptions
      ?.map((optionUid) => optionUid.trim())
      .filter(Boolean),
  };
}

function buildCartItemInput(input: AddToCartItemInput): CartItemInput {
  const cartItem: CartItemInput = {
    sku: input.sku,
    quantity: input.quantity ?? 1,
  };

  if (input.parentSku) {
    cartItem.parent_sku = input.parentSku;
  }

  if (input.selectedOptions?.length) {
    cartItem.selected_options = input.selectedOptions;
  }

  return cartItem;
}

function getMutationErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Could not add product to cart.";
}

function getUserErrors(
  userErrors: CartUserError[] | null | undefined,
): string | null {
  const message = userErrors?.find((entry) => entry?.message)?.message;
  return message?.trim() || null;
}

function isCartNotFoundError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find a cart") ||
    normalized.includes("cart isn't active") ||
    normalized.includes("cart is not active") ||
    normalized.includes("no such entity with cart_id")
  );
}

export function useCreateEmptyCart() {
  const client = getBrowserApolloClient();

  return useMutation<CreateEmptyCartResult>(CREATE_EMPTY_CART_MUTATION, { client });
}

export function useAddProductsToCart() {
  const client = getBrowserApolloClient();

  return useMutation<AddProductsToCartResult, AddProductsToCartVariables>(
    ADD_PRODUCTS_TO_CART_MUTATION,
    { client },
  );
}

export function useAddToCart() {
  const [createEmptyCart] = useCreateEmptyCart();
  const [addProductsToCart] = useAddProductsToCart();
  const [loading, setLoading] = useState(false);

  const ensureCartId = useCallback(async (): Promise<string> => {
    const existingCartId = getCartId();
    if (existingCartId) {
      return existingCartId;
    }

    const { data } = await createEmptyCart();
    const cartId = data?.createEmptyCart?.trim();

    if (!cartId) {
      throw new Error("Could not create shopping cart.");
    }

    setCartId(cartId);
    return cartId;
  }, [createEmptyCart]);

  const addToCart = useCallback(
    async (input: AddToCartItemInput | string) => {
      const normalizedInput = normalizeAddToCartInput(input);

      if (!normalizedInput.sku) {
        throw new Error("Product SKU is required.");
      }

      if ((normalizedInput.quantity ?? 1) < 1) {
        throw new Error("Quantity must be at least 1.");
      }

      if (
        normalizedInput.selectedOptions?.length &&
        !normalizedInput.parentSku
      ) {
        throw new Error("Parent SKU is required for configurable products.");
      }

      setLoading(true);

      try {
        let cartId = await ensureCartId();
        let retried = false;
        const cartItem = buildCartItemInput(normalizedInput);

        while (true) {
          const { data } = await addProductsToCart({
            variables: {
              cartId,
              cartItems: [cartItem],
            },
          });

          const payload = data?.addProductsToCart;
          const userError = getUserErrors(payload?.user_errors);

          if (userError) {
            if (!retried && isCartNotFoundError(userError)) {
              clearCartId();
              cartId = await ensureCartId();
              retried = true;
              continue;
            }

            throw new Error(userError);
          }

          const resolvedCartId = payload?.cart?.id?.trim();
          if (resolvedCartId) {
            setCartId(resolvedCartId);
          }

          return payload?.cart ?? null;
        }
      } catch (error) {
        throw new Error(getMutationErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [addProductsToCart, ensureCartId],
  );

  return { addToCart, loading };
}
