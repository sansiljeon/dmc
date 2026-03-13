# 대동메디칼컨설팅 웹사이트

의료기관 컨설팅 전문 기업 대동메디칼컨설팅의 공식 웹사이트입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Deployment**: Static Export (또는 Vercel)

## 프로젝트 구조

```
dmc/
├── app/                    # Next.js App Router 페이지
│   ├── about/             # DMC 소개 페이지
│   ├── product/           # Product 메인 및 상세 페이지
│   │   ├── opening/       # 개원 컨설팅
│   │   ├── management/    # 관리 컨설팅
│   │   └── closing/       # 청산 컨설팅
│   ├── portfolio/         # 포트폴리오 페이지
│   ├── news/              # 뉴스 리스트 및 상세 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 가능한 컴포넌트
│   ├── Header.tsx         # 헤더 (로고, 메뉴, CTA)
│   ├── Footer.tsx         # 푸터 (회사 정보, 카카오톡 링크)
│   ├── Hero.tsx           # 히어로 섹션
│   ├── Breadcrumbs.tsx    # 빵부스러기 네비게이션
│   ├── Section.tsx        # 섹션 래퍼
│   ├── Card.tsx           # 카드 컴포넌트
│   ├── CardGrid.tsx       # 카드 그리드 레이아웃
│   ├── StatRow.tsx        # 통계 숫자 표시
│   └── CTAButton.tsx      # CTA 버튼
├── content/               # 콘텐츠 파일
│   ├── site.ts           # 회사 정보
│   ├── nav.ts            # 네비게이션 메뉴
│   ├── pages/            # 페이지별 JSON 콘텐츠
│   │   ├── home.json
│   │   ├── about.json
│   │   ├── product.json
│   │   └── ...
│   └── news/             # 뉴스 MDX 파일
│       ├── sample-news-1.mdx
│       └── sample-news-2.mdx
├── lib/                  # 유틸리티 함수
│   ├── news.ts          # 뉴스 관련 함수
│   └── markdown.ts      # 마크다운 변환
└── public/              # 정적 파일 (이미지 등)
    └── images/
        └── placeholder/ # 플레이스홀더 이미지
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 정적 파일은 `out/` 디렉토리에 생성됩니다.

## 콘텐츠 관리

### 클라이언트 원고 교체 방법

#### 1. 페이지 텍스트 교체

각 페이지의 텍스트는 `content/pages/` 디렉토리의 JSON 파일에서 관리됩니다.

예: 홈페이지 텍스트를 변경하려면 `content/pages/home.json` 파일을 편집하세요.

```json
{
  "hero": {
    "title": "여기에 실제 타이틀 입력",
    "subtitle": "여기에 실제 서브타이틀 입력"
  },
  "mainCopy": {
    "title": "실제 메인 카피 타이틀",
    "description": "실제 메인 카피 설명"
  }
}
```

#### 2. 뉴스 추가/수정

뉴스는 `content/news/` 디렉토리에 MDX 파일로 추가합니다.

새 뉴스를 추가하려면:

1. `content/news/` 디렉토리에 새 `.mdx` 파일 생성
2. 파일명은 URL slug가 됩니다 (예: `my-news.mdx` → `/news/my-news`)
3. 다음 형식으로 작성:

```mdx
---
title: "뉴스 제목"
date: "2026-01-28"
author: "대동메디칼컨설팅"
summary: "뉴스 요약"
image: "/images/news/news-image.jpg"
---

뉴스 본문 내용을 마크다운 형식으로 작성합니다.
```

#### 3. 회사 정보 수정

회사 정보는 `content/site.ts` 파일에서 수정합니다:

```typescript
export const siteInfo = {
  companyName: "(주)대동메디칼컨설팅",
  ceo: "이건영",
  address: "서울시 서초구 서초대로 46길 17, 201호",
  phone: "02-581-2632",
  fax: "0502-581-3600",
  kakaoLink: "http://pf.kakao.com/_xkbdEn",
  copyright: "© 2026 Daedong Medical Consulting. ALL RIGHT RESERVED.",
};
```

### 카카오톡 링크 교체 방법

1. `content/site.ts` 파일을 엽니다
2. `kakaoLink` 값을 실제 카카오톡 채널 링크로 변경합니다:

```typescript
kakaoLink: "http://pf.kakao.com/_xkbdEn"
```

### 이미지 교체 방법

1. `public/images/` 디렉토리에 이미지 파일을 추가합니다
2. 각 페이지의 이미지 경로를 업데이트합니다

예: 홈페이지 솔루션 카드 이미지를 교체하려면:
- 이미지 파일을 `public/images/solutions/` 디렉토리에 추가
- `content/pages/home.json`에서 이미지 경로 참조 확인 (현재는 placeholder 사용)

또는 코드에서 직접 이미지 경로를 수정할 수 있습니다:

```tsx
<Card
  image="/images/solutions/opening-consulting.jpg"
  imageAlt="개원 컨설팅"
/>
```

## 배포 방법

### 정적 배포 (Static Export)

이 프로젝트는 Next.js의 정적 내보내기 기능을 사용합니다.

1. 빌드:
```bash
npm run build
```

2. `out/` 디렉토리의 파일을 웹 호스팅 서비스에 업로드:
   - GitHub Pages
   - Netlify
   - AWS S3 + CloudFront
   - 기타 정적 호스팅 서비스

### Vercel 배포

1. [Vercel](https://vercel.com)에 프로젝트를 연결
2. 자동으로 빌드 및 배포됩니다

### 환경 변수

현재 환경 변수는 필요하지 않지만, 향후 추가가 필요할 경우:

1. `.env.local` 파일 생성
2. 필요한 환경 변수 추가
3. `next.config.js`에서 환경 변수 설정 확인

## 디자인 가이드라인

### 색상 팔레트

- **메인 컬러**: Deep Red (`#8B1538`)
- **보조 컬러**: White
- **텍스트**: Gray-900 (제목), Gray-600 (본문)

### 톤앤매너

- 차분하고 전문적인 기업 홈페이지 톤앤매너 유지
- 깔끔하고 모던한 디자인
- 접근성 고려 (ARIA 라벨, 시맨틱 HTML)

## 주요 기능

- ✅ 반응형 디자인 (모바일/태블릿/데스크탑)
- ✅ SEO 최적화 (메타 태그, Open Graph)
- ✅ 접근성 (ARIA 라벨, 시맨틱 HTML)
- ✅ 정적 사이트 생성 (Static Export)
- ✅ 카카오톡 채널 연동
- ✅ 뉴스 블로그 시스템 (MDX)
- ✅ 빵부스러기 네비게이션

## 라우팅 구조

- `/` - 홈페이지
- `/about` - DMC 소개
- `/product` - Product 메인
  - `/product/opening` - 개원 컨설팅
  - `/product/management` - 관리 컨설팅
  - `/product/closing` - 청산 컨설팅
- `/portfolio` - 포트폴리오
- `/news` - 뉴스 리스트
  - `/news/[slug]` - 뉴스 상세

## 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 연락해주세요.
