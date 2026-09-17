/**
 * @file    apps/storefront/src/modules/order/components/item/index.tsx
 * @module  OrderItemComponent (Order Module)
 * @purpose Renders a single purchased order line item row with clinical thumbnail, options, and deduplicated pricing.
 * @contracts
 *   Props: item, currencyCode
 */

import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@modules/common/components/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"
import { getLineItemThumbnail } from "@lib/util/get-line-item-thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <Thumbnail thumbnail={getLineItemThumbnail(item)} size="square" />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base font-semibold"
          data-testid="product-name"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        <span className="text-xs text-slate-500 font-mono mt-1 block">
          Qty:{" "}
          <span
            data-testid="product-quantity"
            className="font-semibold text-slate-700"
          >
            {item.quantity}
          </span>
        </span>
      </Table.Cell>

      <Table.Cell className="!pr-0 text-right">
        <div className="flex flex-col items-end h-full justify-center">
          {item.quantity > 1 && (
            <span className="flex items-center gap-x-1 text-xs text-slate-500 mb-0.5 font-mono">
              <span>{item.quantity}x @</span>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}

          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
