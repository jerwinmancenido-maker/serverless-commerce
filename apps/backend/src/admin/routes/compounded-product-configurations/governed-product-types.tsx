import { Spinner } from "@medusajs/icons"
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import { loadAllAdminPages } from "../../lib/load-all-pages"
import type {
  ClassificationMapping,
  ClassificationMappingListResponse,
  PresentationListItem,
  PresentationListResponse,
} from "./types"

const statusColor = (status: ClassificationMapping["status"]) =>
  status === "active" ? "green" : status === "archived" ? "grey" : "orange"

export const GovernedProductTypes = () => {
  const queryClient = useQueryClient()
  const [productTypeId, setProductTypeId] = useState("")
  const [presentationId, setPresentationId] = useState("")
  const [reason, setReason] = useState("")
  const mappingsQuery = useQuery({
    queryKey: ["compounded-product-classification-mappings"],
    queryFn: async () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page =
            await sdk.client.fetch<ClassificationMappingListResponse>(
              `/admin/compounded-product/governed-product-types?limit=${limit}&offset=${offset}`,
            )

          return { items: page.mappings, count: page.count }
        },
      }),
  })
  const presentationsQuery = useQuery({
    queryKey: ["compounded-product-presentations", "governed-product-types"],
    queryFn: async () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.client.fetch<PresentationListResponse>(
            `/admin/compounded-product/presentations?limit=${limit}&offset=${offset}`,
          )

          return { items: page.presentations, count: page.count }
        },
      }),
  })
  const productTypesQuery = useQuery({
    queryKey: ["product-types", "compounded-product-governance"],
    queryFn: async () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.productType.list({ limit, offset })

          return { items: page.product_types, count: page.count }
        },
      }),
  })
  const presentations = presentationsQuery.data || []
  const productTypeNames = useMemo(
    () =>
      new Map(
        (productTypesQuery.data || []).map((type) => [
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
  const mappings = mappingsQuery.data || []
  const referenceDataLoading =
    presentationsQuery.isLoading || productTypesQuery.isLoading
  const referenceDataError =
    presentationsQuery.isError || productTypesQuery.isError
  const canCreate =
    !referenceDataLoading &&
    !referenceDataError &&
    productTypeId &&
    presentationId &&
    reason.trim().length >= 3

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
          <Select
            value={productTypeId}
            onValueChange={setProductTypeId}
            disabled={referenceDataLoading || referenceDataError}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select product type" />
            </Select.Trigger>
            <Select.Content>
              {(productTypesQuery.data || []).map((type) => (
                <Select.Item key={type.id} value={type.id}>
                  {type.value}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Presentation configuration</Label>
          <Select
            value={presentationId}
            onValueChange={setPresentationId}
            disabled={referenceDataLoading || referenceDataError}
          >
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
        {mappingsQuery.isLoading ||
        presentationsQuery.isLoading ||
        productTypesQuery.isLoading ? (
          <div className="flex items-center gap-x-2">
            <Spinner className="animate-spin" />
            <Text size="small" className="text-ui-fg-subtle">
              Loading governed configuration references...
            </Text>
          </div>
        ) : null}
        {mappingsQuery.isError ||
        presentationsQuery.isError ||
        productTypesQuery.isError ? (
          <Text size="small" className="text-ui-fg-error">
            Governed product-type mappings or reference data could not be
            loaded.
          </Text>
        ) : null}
        {!mappingsQuery.isLoading &&
        !mappingsQuery.isError &&
        !referenceDataError &&
        !mappings.length ? (
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
