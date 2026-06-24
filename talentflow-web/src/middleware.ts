import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não exigem autenticação
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password', '/invite/accept', '/terms', '/privacy', '/vagas'];

// Helper para decodificar o payload do JWT no Edge Runtime de forma nativa (sem bibliotecas)
function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignora arquivos estáticos, imagens, favicons e chamadas de API interna do Next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Obtém o token JWT dos cookies da requisição
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;

  // A raiz '/' é pública, além das outras rotas públicas definidas
  const isPublicRoute = pathname === '/' || PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Caso 1: Usuário NÃO está autenticado e tenta acessar uma rota protegida
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Salva a rota de destino para redirecionar após o login
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  // Caso 2: Usuário ESTÁ autenticado
  if (token) {
    const decoded = decodeJwt(token);
    
    // Se o token for inválido, corrompido ou estiver expirado, limpa o cookie e manda para login (se não estiver em rota pública)
    const isExpired = decoded && decoded.exp && decoded.exp * 1000 < Date.now();
    if (!decoded || isExpired) {
      if (isPublicRoute) {
        // Se já está em rota pública, remove os cookies e apenas deixa prosseguir
        const response = NextResponse.next();
        response.cookies.delete('token');
        response.cookies.delete('user_role');
        response.cookies.delete('user_name');
        return response;
      }

      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('user_role');
      response.cookies.delete('user_name');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    // Se o usuário já está logado e tenta acessar páginas de autenticação (como login), manda para o dashboard
    const isAuthPage = ['/login', '/forgot-password', '/reset-password'].some((route) => pathname.startsWith(route));
    if (isAuthPage) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    // Controle de Acesso Baseado em Cargos (RBAC) para a tela de convites
    if (pathname.startsWith('/invite') && pathname !== '/invite/accept') {
      const userRole = decoded.role;
      if (userRole !== 'SuperAdmin' && userRole !== 'Manager') {
        // Recrutador comum não pode convidar, redireciona para o dashboard
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        return response;
      }
    }
  }

  return NextResponse.next();
}
