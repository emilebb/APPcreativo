/**
 * Extract specific topic from user input
 * Examples: "marca de ropa urbana" → "ropa urbana"
 *           "negocio de restaurantes" → "restaurantes"
 */
export function extractTopic(text: string): string | null {
  if (!text || text.length < 5) return null;

  const patterns = [
    /marca de ([\w\s]+?)(?:[.!?]|$)/i,
    /negocio de ([\w\s]+?)(?:[.!?]|$)/i,
    /proyecto de ([\w\s]+?)(?:[.!?]|$)/i,
    /ideas para ([\w\s]+?)(?:[.!?]|$)/i,
    /app (?:de |para )?([\w\s]+?)(?:[.!?]|$)/i,
    /canal (?:de |sobre )?([\w\s]+?)(?:[.!?]|$)/i,
    /plataforma (?:de |para )?([\w\s]+?)(?:[.!?]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.toLowerCase().match(pattern);
    if (match && match[1]) {
      const topic = match[1].trim();
      // Only return if topic is meaningful (not empty, not too long)
      if (topic.length > 2 && topic.length < 100) {
        return topic;
      }
    }
  }

  return null;
}

/**
 * Check if this is a good moment to offer idea generation
 * - Must be past clarity phase (not hoja_en_blanco)
 * - Should be small/medium scale (not stuck in large strategic)
 * - User must have gone through initial context
 */
export function shouldOfferIdeas(
  blockageId?: string,
  problemScale?: "small" | "medium" | "large",
  hasCompletedProtocol?: boolean
): boolean {
  // Only offer if user has done some work
  if (!hasCompletedProtocol) return false;

  // Only for small/medium problems (not strategic projects)
  if (problemScale === "large") return false;

  // Don't offer for pure hoja_en_blanco (too early)
  if (blockageId === "hoja_en_blanco") return false;

  return true;
}
