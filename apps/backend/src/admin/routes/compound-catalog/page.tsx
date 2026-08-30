import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Spinner } from "@medusajs/icons"
import {
  Button,
  Container,
  Drawer,
  FocusModal,
  Heading,
  Input,
  Label,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { sdk } from "../../lib/sdk"
import { loadAllAdminPages } from "../../lib/load-all-pages"

type TaxonomyKind = "family" | "format"
type TaxonomyRecord = {
  id: string
  key: string
  name: string
  description: string | null
  status: "active" | "archived"
}
type FamilyListResponse = { families: TaxonomyRecord[]; count: number }
type FormatListResponse = { formats: TaxonomyRecord[]; count: number }
type TaxonomyForm = { key: string; name: string; description: string }

const emptyForm: TaxonomyForm = { key: "", name: "", description: "" }

const endpointFor = (kind: TaxonomyKind) =>
  kind === "family" ? "families" : "formats"
const titleFor = (kind: TaxonomyKind) =>
  kind === "family" ? "Compound family" : "Presentation"

const CompoundCatalogPage = () => {
  const queryClient = useQueryClient()
  const [createKind, setCreateKind] = useState<TaxonomyKind | null>(null)
  const [editTarget, setEditTarget] = useState<{
    kind: TaxonomyKind
    record: TaxonomyRecord
  } | null>(null)
  const [createForm, setCreateForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)
  const familiesQuery = useQuery({
    queryKey: ["compound-families", "catalog-management"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.client.fetch<FamilyListResponse>(
            `/admin/compounded-product/families?limit=${limit}&offset=${offset}`,
          )

          return { items: page.families, count: page.count }
        },
      }),
  })
  const formatsQuery = useQuery({
    queryKey: ["compound-formats", "catalog-management"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.client.fetch<FormatListResponse>(
            `/admin/compounded-product/formats?limit=${limit}&offset=${offset}`,
          )

          return { items: page.formats, count: page.count }
        },
      }),
  })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["compound-families"] }),
      queryClient.invalidateQueries({ queryKey: ["compound-formats"] }),
    ])

  const createMutation = useMutation({
    mutationFn: ({ kind, form }: { kind: TaxonomyKind; form: TaxonomyForm }) =>
      sdk.client.fetch(
        `/admin/compounded-product/${endpointFor(kind)}`,
        {
          method: "POST",
          body: {
            key: form.key,
            name: form.name,
            description: form.description || null,
          },
        },
      ),
    onSuccess: async () => {
      await refresh()
      setCreateKind(null)
      setCreateForm(emptyForm)
      toast.success("Catalog value created")
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Create failed"),
  })
  const updateMutation = useMutation({
    mutationFn: ({
      kind,
      id,
      form,
    }: {
      kind: TaxonomyKind
      id: string
      form: TaxonomyForm
    }) =>
      sdk.client.fetch(
        `/admin/compounded-product/${endpointFor(kind)}/${id}`,
        {
          method: "POST",
          body: {
            name: form.name,
            description: form.description || null,
          },
        },
      ),
    onSuccess: async () => {
      await refresh()
      setEditTarget(null)
      toast.success("Catalog value updated")
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Update failed"),
  })
  const archiveMutation = useMutation({
    mutationFn: ({ kind, id }: { kind: TaxonomyKind; id: string }) =>
      sdk.client.fetch(
        `/admin/compounded-product/${endpointFor(kind)}/${id}/archive`,
        { method: "POST" },
      ),
    onSuccess: async () => {
      await refresh()
      toast.success("Catalog value archived")
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Archive failed"),
  })

  const openCreate = (kind: TaxonomyKind) => {
    setCreateForm(emptyForm)
    setCreateKind(kind)
  }
  const openEdit = (kind: TaxonomyKind, record: TaxonomyRecord) => {
    setEditForm({
      key: record.key,
      name: record.name,
      description: record.description || "",
    })
    setEditTarget({ kind, record })
  }

  const renderSection = (
    kind: TaxonomyKind,
    records: TaxonomyRecord[],
    description: string,
  ) => (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{titleFor(kind)}s</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {description}
          </Text>
        </div>
        <Button size="small" onClick={() => openCreate(kind)}>
          Add {titleFor(kind).toLowerCase()}
        </Button>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Stable key</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell className="w-40">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {records.map((record) => (
            <Table.Row key={record.id}>
              <Table.Cell>
                <Text size="small" weight="plus">
                  {record.name}
                </Text>
                {record.description ? (
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {record.description}
                  </Text>
                ) : null}
              </Table.Cell>
              <Table.Cell>{record.key}</Table.Cell>
              <Table.Cell className="capitalize">{record.status}</Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={record.status === "archived"}
                    onClick={() => openEdit(kind, record)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={
                      record.status === "archived" ||
                      archiveMutation.isPending
                    }
                    onClick={() =>
                      archiveMutation.mutate({ kind, id: record.id })
                    }
                  >
                    Archive
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
          {!records.length ? (
            <Table.Row>
              <Table.Cell>
                <Text size="small" className="text-ui-fg-subtle">
                  No values yet. Add the first merchant-configured value.
                </Text>
              </Table.Cell>
            </Table.Row>
          ) : null}
        </Table.Body>
      </Table>
    </Container>
  )

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-y-1">
        <Heading>Compound catalog</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Configure reusable compound families and product presentations. These
          group products visually; each product keeps separate variants,
          pricing, inventory, and BOM recipes.
        </Text>
      </Container>

      {familiesQuery.isLoading || formatsQuery.isLoading ? (
        <Container className="flex min-h-48 items-center justify-center">
          <Spinner />
        </Container>
      ) : familiesQuery.isError || formatsQuery.isError ? (
        <Container className="px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            Compound catalog values could not be loaded. Refresh the page and
            try again.
          </Text>
        </Container>
      ) : (
        <>
          {renderSection(
            "family",
            familiesQuery.data || [],
            "One family can group separate native products such as Semax Nasal and Semax Injectable.",
          )}
          {renderSection(
            "format",
            formatsQuery.data || [],
            "Configurable formats such as Nasal, Injectable, Oral, or Topical. No names are hardcoded.",
          )}
        </>
      )}

      <FocusModal
        open={Boolean(createKind)}
        onOpenChange={(open) => !open && setCreateKind(null)}
      >
        <FocusModal.Content>
          <FocusModal.Header>
            <div className="ml-auto flex gap-2">
              <FocusModal.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </FocusModal.Close>
              <Button
                isLoading={createMutation.isPending}
                disabled={!createKind || !createForm.key || !createForm.name}
                onClick={() =>
                  createKind &&
                  createMutation.mutate({ kind: createKind, form: createForm })
                }
              >
                Create
              </Button>
            </div>
          </FocusModal.Header>
          <FocusModal.Body>
            <div className="mx-auto flex max-w-2xl flex-col gap-y-5 px-6 py-8">
              <Heading>Create {createKind ? titleFor(createKind) : "value"}</Heading>
              <div className="flex flex-col gap-y-2">
                <Label>Stable key</Label>
                <Input
                  value={createForm.key}
                  placeholder="lowercase-kebab-case"
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      key: event.target.value,
                    }))
                  }
                />
                <Text size="xsmall" className="text-ui-fg-subtle">
                  The key cannot be changed after creation.
                </Text>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Name</Label>
                <Input
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Description</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>

      <Drawer
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              Edit {editTarget ? titleFor(editTarget.kind) : "value"}
            </Drawer.Title>
            <Drawer.Description>
              Stable key: {editTarget?.record.key}
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-5 p-6">
            <div className="flex flex-col gap-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Drawer.Close>
            <Button
              isLoading={updateMutation.isPending}
              disabled={!editTarget || !editForm.name}
              onClick={() =>
                editTarget &&
                updateMutation.mutate({
                  kind: editTarget.kind,
                  id: editTarget.record.id,
                  form: editForm,
                })
              }
            >
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export const config = defineRouteConfig({ label: "Compound catalog" })

export default CompoundCatalogPage
