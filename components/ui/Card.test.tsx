import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
} from './Card';

describe('Card', () => {
  // TASK-205: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('children을 올바르게 렌더링한다', () => {
      render(<Card>카드 내용</Card>);
      expect(screen.getByText('카드 내용')).toBeInTheDocument();
    });

    it('기본값으로 default variant와 md padding을 사용한다', () => {
      render(<Card>기본 카드</Card>);
      const card = screen.getByText('기본 카드');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('p-6');
    });
  });

  // Variant 테스트
  describe('Variant', () => {
    it('default variant 스타일을 적용한다', () => {
      render(<Card variant="default">Default</Card>);
      const card = screen.getByText('Default');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('shadow-sm');
    });

    it('elevated variant 스타일을 적용한다', () => {
      render(<Card variant="elevated">Elevated</Card>);
      const card = screen.getByText('Elevated');
      expect(card).toHaveClass('shadow-lg');
    });

    it('outlined variant 스타일을 적용한다', () => {
      render(<Card variant="outlined">Outlined</Card>);
      const card = screen.getByText('Outlined');
      expect(card).toHaveClass('bg-transparent');
      expect(card).toHaveClass('border-2');
    });
  });

  // Padding 테스트
  describe('Padding', () => {
    it('none padding 스타일을 적용한다', () => {
      render(<Card padding="none">No Padding</Card>);
      const card = screen.getByText('No Padding');
      expect(card).not.toHaveClass('p-4');
      expect(card).not.toHaveClass('p-6');
      expect(card).not.toHaveClass('p-8');
    });

    it('sm padding 스타일을 적용한다', () => {
      render(<Card padding="sm">Small Padding</Card>);
      const card = screen.getByText('Small Padding');
      expect(card).toHaveClass('p-4');
    });

    it('md padding 스타일을 적용한다', () => {
      render(<Card padding="md">Medium Padding</Card>);
      const card = screen.getByText('Medium Padding');
      expect(card).toHaveClass('p-6');
    });

    it('lg padding 스타일을 적용한다', () => {
      render(<Card padding="lg">Large Padding</Card>);
      const card = screen.getByText('Large Padding');
      expect(card).toHaveClass('p-8');
    });
  });

  // Hoverable 테스트
  describe('Hoverable', () => {
    it('hoverable이 true일 때 호버 스타일을 적용한다', () => {
      render(<Card hoverable>Hoverable</Card>);
      const card = screen.getByText('Hoverable');
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('hover:-translate-y-0.5');
    });

    it('hoverable이 false일 때 호버 스타일을 적용하지 않는다', () => {
      render(<Card>Not Hoverable</Card>);
      const card = screen.getByText('Not Hoverable');
      expect(card).not.toHaveClass('hover:shadow-md');
    });
  });

  // Clickable 테스트
  describe('Clickable', () => {
    it('clickable이 true일 때 클릭 스타일을 적용한다', () => {
      render(<Card clickable>Clickable</Card>);
      const card = screen.getByText('Clickable');
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('active:scale-[0.98]');
    });

    it('clickable이 false일 때 클릭 스타일을 적용하지 않는다', () => {
      render(<Card>Not Clickable</Card>);
      const card = screen.getByText('Not Clickable');
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('클릭 이벤트를 처리한다', () => {
      const handleClick = vi.fn();
      render(
        <Card clickable onClick={handleClick}>
          Click Me
        </Card>
      );
      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // className 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      render(<Card className="custom-class">Custom</Card>);
      const card = screen.getByText('Custom');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-2xl'); // 기본 스타일도 유지
    });
  });

  // ref 테스트
  describe('ref', () => {
    it('ref를 올바르게 전달한다', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>With Ref</Card>);
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('Card 서브컴포넌트', () => {
  describe('CardHeader', () => {
    it('children을 렌더링한다', () => {
      render(<CardHeader>헤더 내용</CardHeader>);
      expect(screen.getByText('헤더 내용')).toBeInTheDocument();
    });

    it('하단 border를 가진다', () => {
      render(<CardHeader>헤더</CardHeader>);
      const header = screen.getByText('헤더');
      expect(header).toHaveClass('border-b');
    });
  });

  describe('CardBody', () => {
    it('children을 렌더링한다', () => {
      render(<CardBody>본문 내용</CardBody>);
      expect(screen.getByText('본문 내용')).toBeInTheDocument();
    });

    it('수직 패딩을 가진다', () => {
      render(<CardBody>본문</CardBody>);
      const body = screen.getByText('본문');
      expect(body).toHaveClass('py-4');
    });
  });

  describe('CardFooter', () => {
    it('children을 렌더링한다', () => {
      render(<CardFooter>푸터 내용</CardFooter>);
      expect(screen.getByText('푸터 내용')).toBeInTheDocument();
    });

    it('상단 border를 가진다', () => {
      render(<CardFooter>푸터</CardFooter>);
      const footer = screen.getByText('푸터');
      expect(footer).toHaveClass('border-t');
    });
  });

  describe('CardTitle', () => {
    it('children을 렌더링한다', () => {
      render(<CardTitle>제목</CardTitle>);
      expect(screen.getByText('제목')).toBeInTheDocument();
    });

    it('기본적으로 h3 태그를 사용한다', () => {
      render(<CardTitle>제목</CardTitle>);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('as prop으로 태그를 변경할 수 있다', () => {
      render(<CardTitle as="h1">제목</CardTitle>);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('title 스타일을 가진다', () => {
      render(<CardTitle>제목</CardTitle>);
      const title = screen.getByText('제목');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-bold');
    });
  });

  describe('CardDescription', () => {
    it('children을 렌더링한다', () => {
      render(<CardDescription>설명 텍스트</CardDescription>);
      expect(screen.getByText('설명 텍스트')).toBeInTheDocument();
    });

    it('description 스타일을 가진다', () => {
      render(<CardDescription>설명</CardDescription>);
      const description = screen.getByText('설명');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-slate-500');
    });
  });

  describe('조합 테스트', () => {
    it('Card와 서브컴포넌트를 함께 렌더링한다', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>카드 제목</CardTitle>
            <CardDescription>카드 설명</CardDescription>
          </CardHeader>
          <CardBody>본문 내용</CardBody>
          <CardFooter>푸터 내용</CardFooter>
        </Card>
      );

      expect(screen.getByText('카드 제목')).toBeInTheDocument();
      expect(screen.getByText('카드 설명')).toBeInTheDocument();
      expect(screen.getByText('본문 내용')).toBeInTheDocument();
      expect(screen.getByText('푸터 내용')).toBeInTheDocument();
    });
  });
});
