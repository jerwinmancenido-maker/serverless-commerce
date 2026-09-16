/**
 * @file    apps/backend/src/admin/routes/compounded-product-configurations/governed-product-formats.tsx
 * @module  GovernedProductFormats
 * @purpose Admin component for managing standardized physical delivery formats (e.g. Lyophilized Vial, Nasal Spray).
 * @contracts
 *   API:
 *     GET  /admin/compounded-product/formats
 *     POST /admin/compounded-product/formats
 *     POST /admin/compounded-product/formats/:id
 *     POST /admin/compounded-product/formats/:id/archive
 *   Service: CompoundedProductModuleService
 */

import {
  ArchiveBox,
  Component,
  MagnifyingGlass,
  PencilSquare,
  Plus,
  Spinner,
  XMark,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Drawer,
  Heading,
  Input,
  Label,
  StatusBadge,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import { loadAllAdminPages } from "../../lib/load-all-pages"
import { createPresentationKey } from "../compounded-products/presentation-key"
import type {
  CompoundFormat,
  CompoundFormatListResponse,
  CreateCompoundFormatResponse,
  UpdateCompoundFormatResponse,
} from "./types"

const KEY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const GovernedProductFormats: React.FC = () => {
  const queryClient = useQueryClient()

  // Creation form state
  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [description, setDescription] = useState("")
  const [autoKey, setAutoKey] = useState(true)

  // Filter and search state
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Edit drawer state
  const [editingFormat, setEditingFormat] = useState<CompoundFormat | null>(null)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // Query all formats
  const formatsQuery = useQuery({
    queryKey: ["compounded-product-formats"],
    queryFn: async () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.client.fetch<CompoundFormatListResponse>(
            `/admin/compounded-product/formats?limit=${limit}&offset=${offset}`,
          )
          return { items: page.formats, count: page.count }
        },
      }),
  })

  const formats = formatsQuery.data || []

  // Computed key validation
  const effectiveKey = key.trim()
  const isKeyValid = KEY_REGEX.test(effectiveKey)
  const canCreate = name.trim().length >= 2 && isKeyValid

  const handleNameChange = (val: string) => {
    setName(val)
    if (autoKey) {
      setKey(createPresentationKey(val))
    }
  }

  const handleKeyChange = (val: string) => {
    setAutoKey(false)
    setKey(val.toLowerCase())
  }

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["compounded-product-formats"] })
    await queryClient.invalidateQueries({ queryKey: ["compound-formats"] })
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<CreateCompoundFormatResponse>(
        "/admin/compounded-product/formats",
        {
          method: "POST",
          body: {
            key: effectiveKey,
            name: name.trim(),
            description: description.trim() || null,
          },
        },
      ),
    onSuccess: async () => {
      await refresh()
      setName("")
      setKey("")
      setDescription("")
      setAutoKey(true)
      toast.success("Physical delivery format added")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Delivery format could not be created",
      )
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (formatId: string) =>
      sdk.client.fetch<UpdateCompoundFormatResponse>(
        `/admin/compounded-product/formats/${formatId}`,
        {
          method: "POST",
          body: {
            name: editName.trim(),
            description: editDescription.trim() || null,
          },
        },
      ),
    onSuccess: async () => {
      await refresh()
      setEditDrawerOpen(false)
      setEditingFormat(null)
      toast.success("Delivery format updated")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Delivery format could not be updated",
      )
    },
  })

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (formatId: string) =>
      sdk.client.fetch<{ format: CompoundFormat }>(
        `/admin/compounded-product/formats/${formatId}/archive`,
        {
          method: "POST",
        },
      ),
    onSuccess: async () => {
      await refresh()
      if (editDrawerOpen) {
        setEditDrawerOpen(false)
        setEditingFormat(null)
      }
      toast.success("Delivery format archived")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Delivery format could not be archived",
      )
    },
  })

  const openEditDrawer = (item: CompoundFormat) => {
    setEditingFormat(item)
    setEditName(item.name)
    setEditDescription(item.description || "")
    setEditDrawerOpen(true)
  }

  // Filtered formats
  const filteredFormats = useMemo(() => {
    return formats.filter((item) => {
      if (filter === "active" && item.status !== "active") return false
      if (filter === "archived" && item.status !== "archived") return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.name.toLowerCase().includes(q)
        const matchKey = item.key.toLowerCase().includes(q)
        const matchDesc = (item.description || "").toLowerCase().includes(q)
        return matchName || matchKey || matchDesc
      }
      return true
    })
  }, [formats, filter, searchQuery])

  const activeCount = formats.filter((f) => f.status === "active").length
  const archivedCount = formats.filter((f) => f.status === "archived").length

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs divide-y divide-slate-100 overflow-hidden mb-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Heading level="h2" className="text-base font-bold text-slate-900">
              Physical Delivery Formats
            </Heading>
            <Badge size="2xsmall" color="blue" className="font-mono text-[10px]">
              {activeCount} Active
            </Badge>
          </div>
          <Text size="small" className="text-slate-500 mt-0.5">
            Governed physical container and delivery forms (e.g. Lyophilized Vial, Metered Nasal Spray, Sublingual Drops) bound to formulations during compound product synthesis.
          </Text>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge size="small" color="grey">
            {formats.length} Total Formats
          </Badge>
        </div>
      </div>

      {/* 2. Creation Form */}
      <div className="bg-slate-50/60 p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Plus className="size-3.5 text-blue-600" />
          <span>Register New Delivery Format</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 flex flex-col gap-y-1.5">
            <Label htmlFor="format-name" className="text-xs font-medium text-slate-700">
              Format Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="format-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Metered Nasal Spray"
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="md:col-span-3 flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="format-key" className="text-xs font-medium text-slate-700">
                Format Key <span className="text-rose-500">*</span>
              </Label>
              {autoKey && key && (
                <span className="text-[10px] text-blue-600 font-medium">auto-derived</span>
              )}
            </div>
            <Input
              id="format-key"
              value={key}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="e.g. metered-nasal-spray"
              className={`h-8 text-xs font-mono bg-white ${
                key && !isKeyValid ? "border-rose-400 focus:border-rose-500" : ""
              }`}
            />
          </div>

          <div className="md:col-span-3 flex flex-col gap-y-1.5">
            <Label htmlFor="format-desc" className="text-xs font-medium text-slate-700">
              Description <span className="text-slate-400">(Optional)</span>
            </Label>
            <Input
              id="format-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical or container delivery note"
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button
              size="small"
              className="w-full h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
              disabled={!canCreate || createMutation.isPending}
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Add Format
            </Button>
          </div>
        </div>

        {key && !isKeyValid && (
          <Text size="small" className="text-rose-600 text-[11px] mt-2">
            Format key must contain only lowercase letters, numbers, and single hyphens (e.g. &ldquo;nasal-spray&rdquo;).
          </Text>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 bg-white">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({formats.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === "active"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("archived")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === "archived"
                ? "bg-slate-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search formats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs bg-slate-50/50 border-slate-200 rounded-md"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XMark className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Formats List */}
      <div className="flex flex-col divide-y divide-slate-100">
        {formatsQuery.isLoading && (
          <div className="flex items-center justify-center gap-x-2 py-8">
            <Spinner className="animate-spin text-slate-500" />
            <Text size="small" className="text-slate-500">
              Loading physical delivery formats...
            </Text>
          </div>
        )}

        {formatsQuery.isError && (
          <div className="px-6 py-6 text-center">
            <Text size="small" className="text-rose-600 font-medium">
              Failed to load physical delivery formats.
            </Text>
          </div>
        )}

        {!formatsQuery.isLoading && !formatsQuery.isError && filteredFormats.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Text size="small" className="text-slate-400">
              {searchQuery ? "No matching delivery formats found." : "No delivery formats registered."}
            </Text>
          </div>
        )}

        {filteredFormats.map((format) => (
          <div
            key={format.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                <Component className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">
                    {format.name}
                  </span>
                  <Badge size="2xsmall" color="grey" className="font-mono text-[10px]">
                    {format.key}
                  </Badge>
                  <StatusBadge color={format.status === "active" ? "green" : "grey"}>
                    {format.status}
                  </StatusBadge>
                </div>
                {format.description ? (
                  <Text size="small" className="text-slate-500 text-[11px] mt-0.5">
                    {format.description}
                  </Text>
                ) : (
                  <Text size="small" className="text-slate-400 text-[11px] italic mt-0.5">
                    Standard delivery container
                  </Text>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                size="small"
                variant="secondary"
                className="h-7 px-2.5 text-xs font-semibold hover:border-slate-300"
                onClick={() => openEditDrawer(format)}
              >
                <PencilSquare className="size-3.5 mr-1" />
                Edit
              </Button>

              {format.status === "active" ? (
                <Button
                  size="small"
                  variant="secondary"
                  className="h-7 px-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
                  disabled={archiveMutation.isPending}
                  onClick={() => archiveMutation.mutate(format.id)}
                >
                  <ArchiveBox className="size-3.5 mr-1" />
                  Archive
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Edit Format Drawer */}
      <Drawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen}>
        <Drawer.Content className="w-full sm:max-w-md h-dvh sm:h-full flex flex-col justify-between">
          <Drawer.Header>
            <Drawer.Title>Edit Delivery Format</Drawer.Title>
            <Drawer.Description>
              Update format display name and analytical storage description. Key is permanently bound once registered.
            </Drawer.Description>
          </Drawer.Header>

          <Drawer.Body className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            {editingFormat && (
              <>
                <div className="flex flex-col gap-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Format Key
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {editingFormat.key}
                    </span>
                    <StatusBadge color={editingFormat.status === "active" ? "green" : "grey"}>
                      {editingFormat.status}
                    </StatusBadge>
                  </div>
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <Label htmlFor="edit-name" className="text-xs font-medium text-slate-700">
                    Format Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Metered Nasal Spray"
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <Label htmlFor="edit-description" className="text-xs font-medium text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Container specifications, reconstitution details, or storage guidelines..."
                    className="text-xs"
                  />
                </div>

                {editingFormat.status === "active" && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                    <div className="text-xs font-semibold text-amber-800">
                      Archiving Lifecycle
                    </div>
                    <Text size="small" className="text-amber-700 text-[11px] mt-0.5">
                      Archiving this format prevents new product registrations from selecting it. Existing products remain unchanged.
                    </Text>
                    <Button
                      size="small"
                      variant="danger"
                      className="mt-2.5 h-7 text-xs"
                      disabled={archiveMutation.isPending}
                      onClick={() => archiveMutation.mutate(editingFormat.id)}
                    >
                      Archive Delivery Format
                    </Button>
                  </div>
                )}
              </>
            )}
          </Drawer.Body>

          <Drawer.Footer className="px-4 sm:px-6 py-3 sm:py-4 pb-[env(safe-area-inset-bottom,1rem)] border-t border-ui-border-base">
            <div className="flex w-full items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" disabled={updateMutation.isPending}>
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={!editName.trim() || updateMutation.isPending}
                isLoading={updateMutation.isPending}
                onClick={() => {
                  if (editingFormat) {
                    updateMutation.mutate(editingFormat.id)
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}
