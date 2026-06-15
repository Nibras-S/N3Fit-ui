/**
 * Resolve a stored image path to a loadable URL.
 *
 * The backend stores profile images either as relative paths (e.g.
 * "/uploads/profile/123.jpg") served from the API origin, or as absolute
 * S3 URLs. Relative paths get the backend origin prefixed; absolute URLs
 * (anything starting with "http") pass through untouched.
 *
 * This mirrors the inline ternary previously duplicated across
 * MemberProfilePage, MemberTable and AppLayout.
 */
export function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const backendUrl = process.env.REACT_APP_BACKEND_URL ?? '';
    return `${backendUrl}${path}`;
}
