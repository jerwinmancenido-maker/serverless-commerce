import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"


type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured: _isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl transition-shadow ease-in-out duration-200",
        className,
        {
          "aspect-square": true,
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full" || size === "square",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} />
    </Container>
  )
}

const ImageOrPlaceholder = ({ image }: { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt="Product thumbnail"
      className="absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
      draggable={false}
      quality={85}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/80 dark:bg-zinc-900/40 p-4">
      <svg
        className="w-16 h-24 text-zinc-300 dark:text-zinc-600"
        viewBox="0 0 64 96"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="20" y="6" width="24" height="8" rx="2" fill="currentColor" fillOpacity="0.1" />
        <rect x="24" y="2" width="16" height="4" rx="1" fill="currentColor" fillOpacity="0.2" />
        <path d="M22 14v6 M42 14v6" />
        <path d="M22 20c-6 0-10 4-10 10v54c0 4.4 3.6 8 8 8h24c4.4 0 8-3.6 8-8V30c0-6-4-10-10-10H22z" fill="currentColor" fillOpacity="0.04" />
        <line x1="16" y1="36" x2="24" y2="36" />
        <line x1="16" y1="46" x2="28" y2="46" />
        <line x1="16" y1="56" x2="24" y2="56" />
        <line x1="16" y1="66" x2="28" y2="66" />
        <line x1="16" y1="76" x2="24" y2="76" />
        <rect x="18" y="40" width="28" height="32" rx="2" strokeDasharray="2 2" strokeOpacity="0.5" />
      </svg>
      <span className="mt-2 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">
        Vial Photo Pending
      </span>
    </div>
  )
}

export default Thumbnail
