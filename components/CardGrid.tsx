"use client";

import { ReactNode, Children, cloneElement, isValidElement } from "react";

interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  staggerDelay?: number; // 각 아이템 간의 애니메이션 delay (ms)
  duration?: number; // 애니메이션 재생 시간 (ms)
}

export default function CardGrid({
  children,
  columns = 3,
  className = "",
  staggerDelay = 100,
  duration,
}: CardGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  // 자식 요소들에 순차적으로 delay, duration 적용
  const childrenWithDelay = Children.map(children, (child, index) => {
    if (isValidElement(child) && typeof child.type !== "string") {
      return cloneElement(child, {
        ...child.props,
        delay: child.props.delay !== undefined ? child.props.delay : index * staggerDelay,
        ...(duration !== undefined && { duration }),
      } as any);
    }
    return child;
  });

  return (
    <div className={`grid ${gridCols[columns]} gap-6 lg:gap-8 ${className}`}>
      {childrenWithDelay}
    </div>
  );
}
