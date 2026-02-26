// Utilidade para normalizar URLs de imagens vindas do backend
// Baseado em VITE_API_URL, que geralmente é algo como http://localhost:3001/api

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

/**
 * Normaliza uma URL de imagem recebida do backend para uma URL absoluta acessível pelo frontend.
 * - Mantém URLs absolutas (http/https)
 * - Prefixa caminhos de `/uploads/...` com a origem do backend
 * - Prefixa caminhos de `/images/...` com a origem do frontend
 * - Prefixa caminhos absolutos `/...` com a origem do backend
 * - Retorna a própria URL se já estiver adequada
 *
 * @param {string | null | undefined} url
 * @returns {string | null | undefined}
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (trimmed === '') return url;

  // Already an absolute URL
  if (/^https?:\/\//.test(trimmed)) return trimmed;

  // Uploads served by backend (check /uploads/ prefix)
  if (trimmed.startsWith('/uploads/')) return `${BACKEND_ORIGIN}${trimmed}`;

  // Static assets from frontend (check /images/ prefix)
  if (trimmed.startsWith('/images/')) return `${window.location.origin}${trimmed}`;

  // If it starts with /, assume it's from backend uploads if not caught above
  if (trimmed.startsWith('/')) return `${BACKEND_ORIGIN}/uploads${trimmed}`;

  // If it's just a filename (no slashes), assume it's a backend dog image
  if (!trimmed.includes('/')) return `${BACKEND_ORIGIN}/uploads/${trimmed}`;

  // Fallback: keep as is but prefix with backend origin if it looks like a path
  return `${BACKEND_ORIGIN}/${trimmed}`;
}

/**
 * Normaliza um array de URLs de imagens.
 * @param {Array<string>} urls
 * @returns {Array<string>}
 */
export function normalizeImagesArray(urls) {
  if (!Array.isArray(urls)) return [];
  return urls
    .map((u) => normalizeImageUrl(u))
    .filter((u) => typeof u === 'string' && u.length > 0);
}

export default {
  normalizeImageUrl,
  normalizeImagesArray,
};