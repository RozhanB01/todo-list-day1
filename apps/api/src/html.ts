import sanitizeHtml from 'sanitize-html'

/** Allow-list for authored chapter markup. No styles, no scripts, no embeds. */
export const SAFE_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'strong', 'em', 'b', 'i', 'blockquote', 'ul', 'ol', 'li', 'hr', 'br', 'a'],
  allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
    b: 'strong',
    i: 'em',
  },
}

export function cleanChapterHtml(html: string): string {
  return sanitizeHtml(html || '', SAFE_HTML_OPTIONS)
}

/** Plain-text projection used for search snippets and word counts. */
export function plainText(html: string): string {
  return sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
}
