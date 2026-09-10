import {redirect} from 'next/navigation';
import {esAdmin} from '@/lib/auth-demo/servidor';
import AdminShell from './AdminShell';

/**
 * Guard del panel municipal. Corre en el servidor: sin sesión de admin no se
 * renderiza nada y se redirige al login. (Antes era un `getUser()` en el
 * navegador que, con Supabase caído, dejaba la pantalla en "Verificando
 * sesión..." para siempre.)
 */
export default async function AdminProtegidoLayout({children}: {children: React.ReactNode}) {
  if (!(await esAdmin())) redirect('/admin/login');
  return <AdminShell>{children}</AdminShell>;
}
