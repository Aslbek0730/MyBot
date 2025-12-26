export async function generateText({ topic, language, contentType }) {
  const safeTopic = topic?.trim() || "your topic";
  const safeLang = language || "English";
  const safeType = contentType || "Informational";

  return `${safeType} (${safeLang}): ${safeTopic}\n\n` +
    "1) Lead with a strong hook.\n" +
    "2) Share one clear insight.\n" +
    "3) End with a short call-to-action.";
}
