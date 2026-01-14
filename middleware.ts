import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 공개 경로 (인증 없이 접근 가능)
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/signup/verify-email',
  '/forgot-password',
  '/reset-password',
];

// 인증된 사용자가 접근하면 안 되는 경로
const AUTH_ONLY_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
];

// 온보딩이 필요한지 체크해야 하는 경로
const ONBOARDING_CHECK_PATHS = [
  '/dashboard',
  '/settings',
  '/reports',
];

/**
 * Next.js 미들웨어
 *
 * 인증 상태에 따라 라우트 접근을 제어합니다.
 * - 비인증 사용자가 보호된 경로에 접근하면 로그인 페이지로 리다이렉트
 * - 인증된 사용자가 로그인/회원가입 페이지에 접근하면 대시보드로 리다이렉트
 * - 온보딩이 필요한 사용자는 온보딩 페이지로 리다이렉트
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 및 API 라우트 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // 파일 확장자가 있는 경로
  ) {
    return NextResponse.next();
  }

  // 환경 변수 검증
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // 환경 변수가 없으면 인증 검사 없이 통과 (개발 환경 등)
    console.error('[Middleware] Supabase environment variables not set');
    return NextResponse.next();
  }

  // Supabase 클라이언트 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 현재 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session?.user;
  const isPublicPath = PUBLIC_PATHS.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isOnboardingCheckPath = ONBOARDING_CHECK_PATHS.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );

  // 인증된 사용자가 로그인/회원가입 페이지 접근 시 대시보드로 리다이렉트
  if (isAuthenticated && isAuthOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 비인증 사용자가 보호된 경로 접근 시 로그인 페이지로 리다이렉트
  if (!isAuthenticated && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 인증된 사용자의 온보딩 상태 확인 (온보딩 체크 경로 또는 온보딩 페이지 접근 시)
  const needsOnboardingCheck = isOnboardingCheckPath || pathname === '/onboarding';

  if (isAuthenticated && needsOnboardingCheck) {
    // 온보딩 완료 여부 확인 (platform_connections 테이블에서 데이터 확인) - 단일 쿼리
    const { data: connections, error } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1);

    const hasConnections = !error && connections && connections.length > 0;

    // 온보딩 체크 경로 접근 시: 연동된 플랫폼이 없으면 온보딩 페이지로 리다이렉트
    if (isOnboardingCheckPath && !hasConnections) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    // 온보딩 페이지 접근 시: 이미 온보딩을 완료한 사용자는 대시보드로 리다이렉트
    if (pathname === '/onboarding' && hasConnections) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에 대해 미들웨어 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
