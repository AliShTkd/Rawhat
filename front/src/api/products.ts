export { loadProducts, loadProductDetail } from "../services/productService";

import { http } from "../services/http";
import type { ProductDetail } from "../types/product";

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  const res = await http.get<ProductDetail>(`/products/${slug}`);
  if (res.ok) return res.data;
  return null;
}
