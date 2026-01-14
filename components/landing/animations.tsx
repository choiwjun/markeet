'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode, useEffect, useState } from 'react';

// ============================================
// 애니메이션 Variants
// ============================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// ============================================
// 스크롤 애니메이션 컴포넌트
// ============================================

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  once?: boolean;
  threshold?: number;
}

export function ScrollAnimation({
  children,
  className,
  variants = fadeInUp,
  delay = 0,
  once = true,
  threshold = 0.2
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Stagger 컨테이너 컴포넌트
// ============================================

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  once = true
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Stagger 아이템 컴포넌트
// ============================================

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ============================================
// 타이핑 애니메이션 컴포넌트
// ============================================

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function TypingAnimation({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const startTyping = () => {
      setIsTyping(true);
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);

      return () => clearInterval(interval);
    };

    const timeout = setTimeout(startTyping, delay);
    return () => clearTimeout(timeout);
  }, [isInView, text, speed, delay]);

  return (
    <span ref={ref} className={className}>
      {displayedText}
      {cursor && (isTyping || displayedText.length < text.length) && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

// ============================================
// 카운터 애니메이션 컴포넌트
// ============================================

interface CounterAnimationProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function CounterAnimation({
  end,
  suffix = '',
  prefix = '',
  duration = 2,
  className
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================
// 호버 스케일 컴포넌트
// ============================================

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({ children, className, scale = 1.05 }: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 호버 리프트 컴포넌트 (그림자 + 이동)
// ============================================

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
}

export function HoverLift({ children, className }: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={{ y: -4 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 플로팅 애니메이션 컴포넌트
// ============================================

interface FloatingProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}

export function Floating({
  children,
  className,
  duration = 3,
  distance = 10
}: FloatingProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 펄스 글로우 애니메이션 컴포넌트
// ============================================

interface PulseGlowProps {
  children: ReactNode;
  className?: string;
}

export function PulseGlow({ children, className }: PulseGlowProps) {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          '0 0 20px rgba(36, 82, 235, 0.2)',
          '0 0 40px rgba(36, 82, 235, 0.4)',
          '0 0 20px rgba(36, 82, 235, 0.2)'
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 채팅 메시지 애니메이션 컴포넌트
// ============================================

interface ChatMessageProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  isUser?: boolean;
}

export function ChatMessage({
  children,
  className,
  delay = 0,
  isUser = false
}: ChatMessageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: isUser ? 20 : -20,
        scale: 0.95
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        scale: 1
      } : {}}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 프로그레스 바 애니메이션 컴포넌트
// ============================================

interface AnimatedProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
}

export function AnimatedProgress({
  value,
  className,
  barClassName,
  delay = 0
}: AnimatedProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className={className}>
      <motion.div
        className={barClassName}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${value}%` } : { width: 0 }}
        transition={{
          duration: 1,
          delay,
          ease: 'easeOut'
        }}
      />
    </div>
  );
}
