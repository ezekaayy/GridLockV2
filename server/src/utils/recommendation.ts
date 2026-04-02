import { set } from "mongoose";
import { Product } from "../models/Products";
import { get } from "node:http";

interface ProductWithScore {
  product: any;
  score: number;
}

// same category : +5
// same tag: +10
// similar price : +3

//Extract keywords fron product name and description

const extractKeywords = (text: string): string[] => {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "can",
    "need",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "as",
    "if",
    "then",
    "than",
    "so",
    "such",
    "no",
    "not",
    "only",
    "own",
    "same",
    "too",
    "very",
    "just",
    "into",
    "over",
    "after",
    "before",
    "between",
    "under",
    "again",
    "further",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "any",
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
};

const calculateSimilarity = (product1: any, product2: any): number => {
  let score = 0;
  // Same category - high weight
  if (product1.category === product2.category) {
    score += 5;
  }
  // Tag similarity (Jaccard similarity)
  const tags1 = new Set(product1.tags || []);
  const tags2 = new Set(product2.tags || []);

  if (tags1.size > 0 && tags2.size > 0) {
    const intersection = [...tags1].filter((tag) => tags2.has(tag)).length;
    const union = new Set([...tags1, ...tags2]).size;
    const tagSimilarity = intersection / union;
    score += tagSimilarity * 10; // Max 10 points for tag similarity
  }
  // Name keyword similarity
  const nameKeywords1 = new Set(extractKeywords(product1.name || ""));
  const nameKeywords2 = new Set(extractKeywords(product2.name || ""));

  const nameOverlap = [...nameKeywords1].filter((kw) =>
    nameKeywords2.has(kw),
  ).length;
  score += nameOverlap * 2;
  // Description keyword similarity
  const descKeywords1 = new Set(extractKeywords(product1.description || ""));
  const descKeywords2 = new Set(extractKeywords(product2.description || ""));

  const descOverlap = [...descKeywords1].filter((kw) =>
    descKeywords2.has(kw),
  ).length;
  score += Math.min(descOverlap, 5); // Cap at 5 points
  // Similar price range (within 30%)
  if (product1.price && product2.price) {
    const priceDiff =
      Math.abs(product1.price - product2.price) / Math.max(product1.price, 1);
    if (priceDiff <= 0.3) {
      score += 3;
    } else if (priceDiff <= 0.5) {
      score += 1;
    }
  }

  // Same creator bonus (smaller weight)
  if (product1.owner && product2.owner) {
    const owner1 = product1.owner._id
      ? product1.owner._id.toString()
      : product1.owner.toString();
    const owner2 = product2.owner._id
      ? product2.owner._id.toString()
      : product2.owner.toString();
    if (owner1 === owner2) {
      score += 2;
    }
  }
  return score;
};

// get related products for a given product

export const getRelatedProducts = async (
  productId: string,
  limit: number = 4,
): Promise<any[]> => {
  const currentProduct = await Product.findById(productId).populate(
    "owner",
    "name email username",
  );

  if (!currentProduct) {
    return [];
  }

  // Get all other products

  const allProducts = await Product.find({
    _id: { $ne: productId },
  }).populate("owner", "name email username _id");

  // calculate similarity scores
  const ProductWithScore: ProductWithScore[] = allProducts.map((product) => ({
    product,
    score: calculateSimilarity(currentProduct, product),
  }));

  // sort by score and return top result
  return ProductWithScore.filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.product);
};
