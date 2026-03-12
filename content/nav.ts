export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "DMC 소개",
    href: "/about",
  },
  {
    label: "Product",
    href: "/product",
    children: [
      {
        label: "개원 컨설팅",
        href: "/product/opening",
      },
      {
        label: "관리 컨설팅",
        href: "/product/management",
      },
      {
        label: "청산 컨설팅",
        href: "/product/closing",
      },
    ],
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    children: [
      { label: "국내 포트폴리오", href: "/portfolio/domestic" },
      { label: "해외 포트폴리오", href: "/portfolio/overseas" },
    ],
  },
  {
    label: "News",
    href: "/news",
  },
];
