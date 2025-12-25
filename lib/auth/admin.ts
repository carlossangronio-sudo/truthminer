import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

/**
 * Vérifie si l'utilisateur est authentifié en tant qu'admin
 * @returns true si authentifié, false sinon
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return session?.value === SESSION_SECRET;
  } catch (error) {
    return false;
  }
}

/**
 * Redirige vers la page de login si non authentifié
 */
export async function requireAuth() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return null;
}

