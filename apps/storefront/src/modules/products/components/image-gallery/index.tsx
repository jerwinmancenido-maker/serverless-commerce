import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle?: string
}

const ImageGallery = ({
  images,
  productTitle = "Analytical Compound",
}: ImageGalleryProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 small:p-12 w-full">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-zinc-50 via-white to-zinc-50/50 p-10 text-center shadow-xs max-w-md w-full aspect-[4/5] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white border border-zinc-200/90 text-4xl shadow-sm mb-5">
            🧪
          </div>

          <span className="relative rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2.5">
            Analytical Research Grade
          </span>

          <h3 className="relative text-base font-bold text-zinc-900 tracking-tight">
            {productTitle}
          </h3>

          <p className="relative text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">
            Sterile lyophilized powder in sealed borosilicate vial. Verified for
            laboratory & academic research use.
          </p>

          <div className="relative mt-8 flex items-center gap-3 text-[11px] font-medium text-zinc-500 border-t border-zinc-200/60 pt-4">
            <span>❄️ -20°C Lyophilized</span>
            <span>·</span>
            <span>≥98% HPLC Purity</span>
            <span>·</span>
            <span>Tamper-Evident</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-rounded"
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
