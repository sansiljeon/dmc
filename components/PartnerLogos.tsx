"use client";

import Image from "next/image";

interface PartnerLogosProps {
  title: string;
  logos: string[];
}

export default function PartnerLogos({ title, logos }: PartnerLogosProps) {
  // 로고를 두 번 복제하여 무한 슬라이드 효과
  const duplicatedLogos = [...logos, ...logos];
  
  // 3행으로 나누기 (각 행에 14-15개씩)
  const logosPerRow = Math.ceil(duplicatedLogos.length / 3);
  const row1 = duplicatedLogos.slice(0, logosPerRow);
  const row2 = duplicatedLogos.slice(logosPerRow, logosPerRow * 2);
  const row3 = duplicatedLogos.slice(logosPerRow * 2);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col -space-y-2 md:-space-y-3">
        {/* 첫 번째 행 - 모바일: 한 줄에 6개, PC: 한 줄에 더 많이(작은 비율) */}
        <div className="flex gap-2 md:gap-3 lg:gap-4 animate-scroll">
          {row1.map((logo, index) => (
            <div
              key={index}
              className="relative aspect-square flex items-center justify-center p-1 flex-shrink-0 w-[calc((100vw-2rem)/6)] md:w-[calc((100vw-2rem)/10)] lg:w-[calc((100vw-3rem)/14)] min-w-[calc((100vw-2rem)/6)] md:min-w-[calc((100vw-2rem)/10)] lg:min-w-[calc((100vw-3rem)/14)]"
            >
              <Image
                src={logo}
                alt={`협력사 로고 ${(index % logos.length) + 1}`}
                width={60}
                height={60}
                className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, (max-width: 1280px) 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-gray-400 text-xs">로고 준비중</span>';
                  }
                }}
                unoptimized
              />
            </div>
          ))}
        </div>
        
        {/* 두 번째 행 */}
        <div className="flex gap-2 md:gap-3 lg:gap-4 animate-scroll-reverse">
          {row2.map((logo, index) => (
            <div
              key={index}
              className="relative aspect-square flex items-center justify-center p-1 flex-shrink-0 w-[calc((100vw-2rem)/6)] md:w-[calc((100vw-2rem)/10)] lg:w-[calc((100vw-3rem)/14)] min-w-[calc((100vw-2rem)/6)] md:min-w-[calc((100vw-2rem)/10)] lg:min-w-[calc((100vw-3rem)/14)]"
            >
              <Image
                src={logo}
                alt={`협력사 로고 ${(logosPerRow + index) % logos.length + 1}`}
                width={60}
                height={60}
                className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, (max-width: 1280px) 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-gray-400 text-xs">로고 준비중</span>';
                  }
                }}
                unoptimized
              />
            </div>
          ))}
        </div>
        
        {/* 세 번째 행 */}
        <div className="flex gap-2 md:gap-3 lg:gap-4 animate-scroll">
          {row3.map((logo, index) => (
            <div
              key={index}
              className="relative aspect-square flex items-center justify-center p-1 flex-shrink-0 w-[calc((100vw-2rem)/6)] md:w-[calc((100vw-2rem)/10)] lg:w-[calc((100vw-3rem)/14)] min-w-[calc((100vw-2rem)/6)] md:min-w-[calc((100vw-2rem)/10)] lg:min-w-[calc((100vw-3rem)/14)]"
            >
              <Image
                src={logo}
                alt={`협력사 로고 ${(logosPerRow * 2 + index) % logos.length + 1}`}
                width={60}
                height={60}
                className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, (max-width: 1280px) 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-gray-400 text-xs">로고 준비중</span>';
                  }
                }}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
