'use client';

import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          {/* 아이콘 */}
          <div className="mx-auto w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            이메일을 확인해주세요
          </h1>

          {/* 설명 */}
          <p className="text-gray-600 mb-6">
            회원가입을 완료하기 위해 이메일로 발송된 인증 링크를 클릭해주세요.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              이메일이 보이지 않으면 스팸 폴더를 확인해주세요.
            </span>
          </p>

          {/* 안내 사항 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">다음 단계:</strong>
            </p>
            <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
              <li>이메일 수신함을 확인하세요</li>
              <li>마케트에서 보낸 인증 메일을 열어주세요</li>
              <li>인증 링크를 클릭하면 가입이 완료됩니다</li>
            </ol>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button variant="primary" fullWidth>
                로그인 페이지로 이동
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="ghost" fullWidth>
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* 도움말 */}
        <p className="mt-6 text-sm text-gray-500">
          문제가 있으신가요?{' '}
          <a href="mailto:support@markeet.io" className="text-primary hover:underline">
            고객센터에 문의하세요
          </a>
        </p>
      </div>
    </div>
  );
}
