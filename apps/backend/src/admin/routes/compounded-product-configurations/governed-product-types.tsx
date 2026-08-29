import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  StatusBadge,
  Text,
  toast,
} from "@medusajs/ui"
import { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import type {
  ClassificationMapping,
  ClassificationMappingListResponse,
  PresentationListItem,
} from "./types"

type GovernedProductTypesProps = {
  presentations: PresentationListItem[]
}

const statusColor = (status: ClassificationMapping["status"]) =>
  status === "active" ? "green" : status === "archived" ? "grey" : "orange"

export const GovernedProductTypes = ({
  presentations,
}: GovernedProductTypesProps) => {
  const queryClient = useQueryClient()
  const [productTypeId, setProductTypeId] = useState("")
  const [presentationId, setPresentationId] = useState("")
  const [reason, setReason] = useState("")
  const mappingsQuery = useQuery({
    queryKey: ["compounded-product-classification-mappings"],
    queryFn: () =>
      sdk.client.fetch<ClassificationMappingListResponse>(
        "/admin/compounded-product/governed-product-types?limit=100&offset=0",
      ),
  })
  const productTypesQuery = useQuery({
    queryKey: ["product-types", "compounded-product-governance"],
    queryFn: () => sdk.admin.productType.list({ limit: 100 }),
  })
  const productTypeNames = useMemo(
    () =>
      new Map(
        (productTypesQuery.data?.product_types || []).map((type) => [
          type.id,
          type.value,
        ]),
      ),
    [productTypesQuery.data],
  )
  const presentationNames = useMemo(
    () =>
      new Map(
        presentations.map((item) => [
          item.presentation.id,
          item.current_revision?.snapshot.label || item.presentation.key,
        ]),
      ),
    [presentations],
  )
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ["compounded-product-classification-mappings"],
    })
  const createMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(
        "/admin/compounded-product/governed-product-types",
        {
          method: "POST",
          body: {
            product_type_id: productTypeId,
            presentation_id: presentationId,
            reason,
          },
        },
      ),
    onSuccess: () => {
      refresh()
      setProductTypeId("")
      setPresentationId("")
      setReason("")
      toast.success("Governed product type mapped")
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Product-type mapping could not be created",
      ),
  })
  const transitionMutation = useMutation({
    mutationFn: ({
      mapping,
      targetStatus,
    }: {
      mapping: ClassificationMapping
      targetStatus: ClassificationMapping["status"]
    }) =>
      sdk.client.fetch(
        `/admin/compounded-product/governed-product-types/${mapping.id}/transitions`,
        {
          method: "POST",
          body: {
            expected_status: mapping.status,
            target_status: targetStatus,
            reason: `Admin changed governed classification mapping from ${mapping.status} to ${targetStatus}`,
          },
        },
      ),
    onSuccess: () => {
      refresh()
      toast.success("Governed product-type status updated")
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Product-type mapping could not be updated",
      ),
  })
  const mappings = mappingsQuery.data?.mappings || []
  const canCreate =
    productTypeId && presentationId && reason.trim().length >= 3

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-6 py-4">
        <Heading level="h2">Governed product types</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Map stable Medusa product types to presentation configurations. Native
          create and reclassification paths cannot bypass registration for an
          active mapping.
        </Text>
      </div>
      <div className="grid gap-4 px-6 py-4 lg:grid-cols-3">
        <div className="flex flex-col gap-y-2">
          <Label>Product type</Label>
          <Select value={productTypeId} onValueChange={setProductTypeId}>
            <Select.Trigger>
              <Select.Value placeholder="Select product type" />
            </Select.Trigger>
            <Select.Content>
              {(productTypesQuery.data?.product_types || []).map((type) => (
                <Select.Item key={type.id} value={type.id}>
                  {type.value}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Presentation configuration</Label>
          <Select value={presentationId} onValueChange={setPresentationId}>
            <Select.Trigger>
              <Select.Value placeholder="Select presentation" />
            </Select.Trigger>
            <Select.Content>
              {presentations
                .filter((item) => item.presentation.status !== "archived")
                .map((item) => (
                  <Select.Item
                    key={item.presentation.id}
                    value={item.presentation.id}
                  >
                    {item.current_revision?.snapshot.label ||
                      item.presentation.key}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="mapping-reason">Reason</Label>
          <div className="flex gap-x-2">
            <Input
              id="mapping-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why this classification is governed"
            />
            <Button
              size="small"
              disabled={!canCreate || createMutation.isPending}
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3 px-6 py-4">
        {mappingsQuery.isError ? (
          <Text size="small" className="text-ui-fg-error">
            Governed product-type mappings could not be loaded.
          </Text>
        ) : null}
        {!mappingsQuery.isLoading && !mappings.length ? (
          <Text size="small" className="text-ui-fg-subtle">
            No product types are currently governed by configuration.
          </Text>
        ) : null}
        {mappings.map((mapping) => (
          <div
            key={mapping.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ui-border-base p-3"
          >
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center gap-x-2">
                <Text size="small" weight="plus">
                  {productTypeNames.get(mapping.product_type_id) ||
                    mapping.product_type_id}
                </Text>
                <StatusBadge color={statusColor(mapping.status)}>
                  {mapping.status}
                </StatusBadge>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {presentationNames.get(mapping.presentation_id) ||
                  mapping.presentation_id}
              </Text>
            </div>
            {mapping.status !== "archived" ? (
              <div className="flex gap-x-2">
                <Button
                  size="small"
                  variant="secondary"
                  disabled={transitionMutation.isPending}
                  onClick={() =>
                    transitionMutation.mutate({
                      mapping,
                      targetStatus:
                        mapping.status === "active" ? "inactive" : "active",
                    })
                  }
                >
                  {mapping.status === "active" ? "Make inactive" : "Activate"}
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  disabled={transitionMutation.isPending}
                  onClick={() =>
                    transitionMutation.mutate({
                      mapping,
                      targetStatus: "archived",
                    })
                  }
                >
                  Archive
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  )
}
