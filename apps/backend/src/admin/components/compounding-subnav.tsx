/**
 * @file    apps/backend/src/admin/components/compounding-subnav.tsx
 * @module  CompoundingSubnavComponent (Sovereign Admin Design System)
 * @purpose Unified secondary tabbed navigation strip across compounding formulation and BOM routes.
 * @contracts
 *   Component: CompoundingSubnav
 */

import React from "react"

import { AdminSubNavPills } from "./ui/admin-subnav-pills"

export type CompoundingTabId = "catalog" | "governance" | "configurations" | "bom"

export type CompoundingSubnavProps = {
  activeTab: CompoundingTabId
  rightContent?: React.ReactNode
  className?: string
}

export const CompoundingSubnav: React.FC<CompoundingSubnavProps> = ({
  activeTab,
  rightContent,
  className = "mb-4",
}) => {
  const items = [
    {
      id: "catalog",
      label: "Master Catalog",
      href: "/compound-catalog",
      active: activeTab === "catalog",
    },
    {
      id: "governance",
      label: "Quality Governance",
      href: "/compounded-products",
      active: activeTab === "governance",
    },
    {
      id: "configurations",
      label: "Formulations",
      href: "/compounded-product-configurations",
      active: activeTab === "configurations",
    },
    {
      id: "bom",
      label: "Bill of Materials (BOM)",
      href: "/bom",
      active: activeTab === "bom",
    },
  ]

  return (
    <AdminSubNavPills
      items={items}
      activeId={activeTab}
      rightContent={rightContent}
      className={className}
    />
  )
}
