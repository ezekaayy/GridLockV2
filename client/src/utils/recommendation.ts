import { Product } from "../api/ProductApi";

interface ProductWithScore {
  product: Product;
  score: number;
}

const stopWords = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "need", "this", "that", "these", "those",
  "it", "its", "as", "if", "then", "than", "so", "such", "no", "not", "only",
  "own", "same", "too", "very", "just", "into", "over", "after", "before",
  "between", "under", "again", "further", "once", "here", "there", "when",
  "where", "why", "how", "all", "each", "few", "more", "most", "other", "some", "any",
]);

const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
};

const calculateSimilarity = (product1: Product, product2: Product): number => {
  let score = 0;

  if (product1.category === product2.category) {
    score += 5;
  }

  const tags1 = new Set((product1 as any).tags || []);
  const tags2 = new Set((product2 as any).tags || []);

  if (tags1.size > 0 && tags2.size > 0) {
    const intersection = [...tags1].filter((tag) => tags2.has(tag)).length;
    const union = new Set([...tags1, ...tags2]).size;
    const tagSimilarity = intersection / union;
    score += tagSimilarity * 10;
  }

  const nameKeywords1 = new Set(extractKeywords(product1.name || ""));
  const nameKeywords2 = new Set(extractKeywords(product2.name || ""));

  const nameOverlap = [...nameKeywords1].filter((kw) => nameKeywords2.has(kw)).length;
  score += nameOverlap * 2;

  const descKeywords1 = new Set(extractKeywords(product1.description || ""));
  const descKeywords2 = new Set(extractKeywords(product2.description || ""));

  const descOverlap = [...descKeywords1].filter((kw) => descKeywords2.has(kw)).length;
  score += Math.min(descOverlap, 5);

  if (product1.price && product2.price) {
    const priceDiff = Math.abs(product1.price - product2.price) / Math.max(product1.price, 1);
    if (priceDiff <= 0.3) {
      score += 3;
    } else if (priceDiff <= 0.5) {
      score += 1;
    }
  }

  if (product1.owner && product2.owner) {
    if (product1.owner._id === product2.owner._id) {
      score += 2;
    }
  }

  return score;
};

export const getRelatedProducts = (
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 4
): Product[] => {
  const productsWithScore: ProductWithScore[] = allProducts
    .filter((product) => product._id !== currentProduct._id)
    .map((product) => ({
      product,
      score: calculateSimilarity(currentProduct, product),
    }));

  return productsWithScore
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.product);
};

export default {
  getRelatedProducts,
};
