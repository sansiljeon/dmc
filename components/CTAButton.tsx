import Link from "next/link";

interface CTAButtonProps {
  href: string;
  text: string;
  isExternal?: boolean;
  variant?: "primary" | "secondary";
  size?: "default" | "sm";
  className?: string;
}

export default function CTAButton({
  href,
  text,
  isExternal = false,
  variant = "primary",
  size = "default",
  className = "",
}: CTAButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C92B2A] shadow-lg hover:shadow-xl";
  const variantClasses =
    "bg-white text-[#C92B2A] border border-[#C92B2A] hover:bg-[#C92B2A] hover:text-white";
  const sizeClasses = size === "sm" ? "scale-[0.7]" : "";

  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={combinedClasses}
      >
        {text}
      </a>
    );
  }

  return (
    <Link href={href} className={combinedClasses}>
      {text}
    </Link>
  );
}
