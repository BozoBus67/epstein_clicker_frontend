// Scroll image lookup, keyed by slug (filename basename). Convention: a file
// `master_scroll_faces/<slug>.<ext>` is the face for scroll `<slug>`. The
// extension is whatever the image happens to be (.webp, .jpg, .png, .jpeg);
// the basename — and ONLY the basename — is the contract.

const face_modules = import.meta.glob('../assets/master_scroll_faces/*', { eager: true });

export const SCROLL_FACE_BY_SLUG = Object.fromEntries(
  Object.entries(face_modules).map(([path, mod]) => {
    const filename = path.split('/').pop();
    const slug = filename.replace(/\.[^/.]+$/, '');
    return [slug, mod.default];
  })
);
