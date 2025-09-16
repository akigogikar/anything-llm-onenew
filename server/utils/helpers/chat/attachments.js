const { summarizeContent } = require("../../agents/aibitat/utils/summarize");
const { fileData } = require("../../files");
const { Document } = require("../../../models/documents");

/**
 * Attempt to summarize text using the configured LLM.
 * Falls back to extracting the leading sentences when the LLM call fails.
 * @param {string} text
 * @param {{ provider: string|null, model: string|null }} options
 * @returns {Promise<string|null>}
 */
async function generateSummary(text = "", { provider = null, model = null } = {}) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const summary = await summarizeContent({
      provider: provider || process.env.LLM_PROVIDER || "openai",
      model: model || null,
      content: trimmed,
    });
    if (typeof summary === "string" && summary.trim().length)
      return summary.trim();
  } catch (error) {
    console.error("[AttachmentSummary] Failed to summarize content:", error.message);
  }

  return fallbackSummary(trimmed);
}

/**
 * Create a deterministic cache key for an attachment document.
 * @param {object} attachment
 * @returns {string|null}
 */
function attachmentCacheKey(attachment = {}) {
  if (!attachment || typeof attachment !== "object") return null;
  if (attachment.documentLocation) return attachment.documentLocation;
  if (attachment.embeddingIdentifiers?.docpath)
    return attachment.embeddingIdentifiers.docpath;
  if (attachment.documentId)
    return `doc-${attachment.documentId}`;
  if (attachment.documentUrl) return attachment.documentUrl;
  if (attachment.fileUrl) return attachment.fileUrl;
  return null;
}

/**
 * Provide a quick fallback summary when LLM summarization fails.
 * @param {string} text
 * @returns {string|null}
 */
function fallbackSummary(text = "") {
  if (!text || typeof text !== "string") return null;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized.length) return null;

  const sentences = normalized.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length) {
    const summary = sentences.slice(0, 3).join(" ").trim();
    if (summary.length) return summary;
  }

  const snippet = normalized.slice(0, 500).trim();
  return snippet.length ? `${snippet}${normalized.length > 500 ? "…" : ""}` : null;
}

/**
 * Enrich attachments with extracted text, summaries and embedding identifiers.
 * @param {{ attachments?: any[], workspace?: import("@prisma/client").workspaces|null }} params
 * @returns {Promise<{ attachments: any[], summaryContexts: string[] }>}
 */
async function hydrateAttachmentsWithDocumentData({
  attachments = [],
  workspace = null,
} = {}) {
  if (!Array.isArray(attachments) || attachments.length === 0)
    return { attachments: Array.isArray(attachments) ? attachments : [], summaryContexts: [] };

  const provider = workspace?.chatProvider || process.env.LLM_PROVIDER || "openai";
  const model = workspace?.chatModel || null;
  const cache = new Map();

  const enriched = await Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment || typeof attachment !== "object") return attachment;

      const existingSummary =
        typeof attachment.documentSummary === "string" &&
        attachment.documentSummary.trim().length
          ? attachment.documentSummary.trim()
          : null;
      const existingText =
        typeof attachment.documentText === "string" && attachment.documentText.length
          ? attachment.documentText
          : null;

      if (existingSummary && existingText) return attachment;

      const cacheKey = attachmentCacheKey(attachment);
      if (!cache.has(cacheKey)) {
        cache.set(cacheKey, await loadDocumentData(attachment));
      }
      const cached = cache.get(cacheKey);
      if (!cached) return attachment;

      const { pageContent, metadata, docRecord } = cached;

      const summary =
        existingSummary ||
        (await generateSummary(pageContent, { provider, model })) ||
        null;

      return {
        ...attachment,
        documentSummary: summary,
        documentText: existingText || pageContent || null,
        documentTitle:
          attachment.documentTitle ||
          metadata?.title ||
          attachment.name ||
          attachment.fileName ||
          null,
        documentMetadata: attachment.documentMetadata || metadata || null,
        embeddingIdentifiers: {
          ...(attachment.embeddingIdentifiers || {}),
          docId: docRecord?.docId || attachment.embeddingIdentifiers?.docId || null,
          documentId:
            docRecord?.id ||
            attachment.documentId ||
            attachment.embeddingIdentifiers?.documentId ||
            null,
          docpath:
            docRecord?.docpath ||
            attachment.documentLocation ||
            attachment.embeddingIdentifiers?.docpath ||
            null,
        },
      };
    })
  );

  const summaryContexts = collectSummaryContextsFromAttachments(enriched);
  return { attachments: enriched, summaryContexts };
}

/**
 * Load document details for an attachment.
 * @param {object} attachment
 * @returns {Promise<{ pageContent: string|null, metadata: object|null, docRecord: object|null }|null>}
 */
async function loadDocumentData(attachment = {}) {
  try {
    let docRecord = null;
    let docpath = attachment.documentLocation || null;

    if (!docpath && attachment.documentId) {
      docRecord = await Document.get({ id: Number(attachment.documentId) }).catch(() => null);
      docpath = docRecord?.docpath || null;
    } else if (attachment.documentId) {
      docRecord = await Document.get({ id: Number(attachment.documentId) }).catch(() => null);
    }

    if (!docpath && attachment.embeddingIdentifiers?.docpath)
      docpath = attachment.embeddingIdentifiers.docpath;
    if (!docpath) return null;

    const data = await fileData(docpath).catch(() => null);
    if (!data) return null;

    const { pageContent = null, ...metadata } = data || {};
    return {
      pageContent,
      metadata,
      docRecord,
    };
  } catch (error) {
    console.error("[AttachmentSummary] Failed to load document data:", error.message);
    return null;
  }
}

/**
 * Collect contextual summary strings from attachments.
 * @param {any[]} attachments
 * @param {Set<string>} [seen]
 * @returns {string[]}
 */
function collectSummaryContextsFromAttachments(attachments = [], seen = new Set()) {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];

  const contexts = [];
  for (const attachment of attachments) {
    const summary =
      typeof attachment?.documentSummary === "string"
        ? attachment.documentSummary.trim()
        : "";
    if (!summary) continue;

    const key =
      attachment.documentLocation ||
      attachment.embeddingIdentifiers?.docId ||
      attachment.documentId ||
      attachment.fileUrl ||
      attachment.name ||
      summary;
    if (seen.has(key)) continue;
    seen.add(key);

    const label =
      attachment.documentTitle ||
      attachment.name ||
      attachment.fileName ||
      "document";
    contexts.push(`Summary for ${label}: ${summary}`);
  }
  return contexts;
}

/**
 * Collect contextual summaries from chat history records.
 * @param {Array<import("@prisma/client").workspace_chats>} rawHistory
 * @returns {string[]}
 */
function collectSummaryContextsFromHistory(rawHistory = []) {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) return [];
  const seen = new Set();
  const contexts = [];

  for (const record of rawHistory) {
    let data;
    try {
      data = JSON.parse(record.response || "null");
    } catch (error) {
      continue;
    }
    if (!data || !Array.isArray(data.attachments)) continue;
    contexts.push(...collectSummaryContextsFromAttachments(data.attachments, seen));
  }

  return contexts;
}

const SUMMARY_PATTERNS = [
  /what\s+is\s+(this|the)\s+(document|file|pdf|attachment)\s+about\b/i,
  /what'?s\s+(this|the)\s+(document|file|pdf|attachment)\s+about\b/i,
  /give\s+me\s+(a\s+)?summary\s+of\s+(this|the)\s+(document|file|pdf|attachment)/i,
  /can\s+you\s+summarize\s+(this|the)\s+(document|file|pdf|attachment)/i,
  /summarize\s+(this|the)\s+(document|file|pdf|attachment)/i,
  /tell\s+me\s+what\s+(this|the)\s+(document|file|pdf|attachment)\s+is\s+about/i,
];

/**
 * Determine if the prompt should be satisfied directly by attachment summaries.
 * @param {string} prompt
 * @param {any[]} attachments
 * @returns {boolean}
 */
function shouldAnswerWithSummary(prompt = "", attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) return false;
  const hasSummaries = attachments.some((attachment) => {
    return (
      typeof attachment?.documentSummary === "string" &&
      attachment.documentSummary.trim().length > 0
    );
  });
  if (!hasSummaries) return false;

  if (typeof prompt !== "string") return false;
  const normalized = prompt.trim();
  if (!normalized.length || normalized.length > 200) return false;

  return SUMMARY_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Build a reply string using the summaries available on attachments.
 * @param {any[]} attachments
 * @returns {string|null}
 */
function buildSummaryReply(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) return null;
  const summarized = attachments.filter((attachment) => {
    return (
      typeof attachment?.documentSummary === "string" &&
      attachment.documentSummary.trim().length > 0
    );
  });
  if (!summarized.length) return null;

  if (summarized.length === 1) {
    const attachment = summarized[0];
    const label =
      attachment.documentTitle ||
      attachment.name ||
      attachment.fileName ||
      "the document";
    return `Summary of ${label}:\n${attachment.documentSummary.trim()}`;
  }

  const parts = summarized.map((attachment, index) => {
    const label =
      attachment.documentTitle ||
      attachment.name ||
      attachment.fileName ||
      `Document ${index + 1}`;
    return `${index + 1}. ${label}: ${attachment.documentSummary.trim()}`;
  });

  return `Here are summaries of the uploaded documents:\n\n${parts.join("\n")}`;
}

module.exports = {
  hydrateAttachmentsWithDocumentData,
  collectSummaryContextsFromHistory,
  collectSummaryContextsFromAttachments,
  shouldAnswerWithSummary,
  buildSummaryReply,
};
