import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import type { HydratedCompoundFamily } from "@lib/data/compound-families"

type CompoundPresentationSwitcherProps = {
  family: HydratedCompoundFamily
  currentProductId: string
}

export default function CompoundPresentationSwitcher({
  family,
  currentProductId,
}: CompoundPresentationSwitcherProps) {
  return (
    <section className="flex flex-col gap-y-3" aria-labelledby="presentation-heading">
      <div>
        <LocalizedClientLink
          href={`/families/${family.key}`}
          className="text-small-semi text-ui-fg-base hover:text-ui-fg-interactive"
        >
          {family.name}
        </LocalizedClientLink>
        <Text id="presentation-heading" className="text-small-regular text-ui-fg-subtle">
          Choose presentation
        </Text>
      </div>
      <div className="flex flex-wrap gap-2">
        {family.members.map((member) => {
          const isCurrent = member.product.id === currentProductId
          return (
            <LocalizedClientLink
              key={member.product.id}
              href={`/products/${member.product.handle}`}
              aria-current={isCurrent ? "page" : undefined}
              className={clx(
                "rounded-md border px-3 py-2 text-small-regular transition-colors",
                {
                  "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color":
                    isCurrent,
                  "border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:border-ui-border-strong":
                    !isCurrent,
                },
              )}
            >
              {member.presentation.name}
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
