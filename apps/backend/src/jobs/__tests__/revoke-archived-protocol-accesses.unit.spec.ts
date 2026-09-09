/**
 * @file    apps/backend/src/jobs/__tests__/revoke-archived-protocol-accesses.unit.spec.ts
 * @module  RevokeArchivedProtocolAccessesJobTest (Research Tracking & Content Modules)
 * @purpose Unit tests for the nightly orphan access cleanup cron job.
 */

import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import revokeArchivedProtocolAccesses, { config } from "../revoke-archived-protocol-accesses"
import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"

describe("revokeArchivedProtocolAccesses cron job", () => {
  it("exports valid job configuration matching Medusa conventions", () => {
    expect(config.name).toBe("revoke-archived-protocol-accesses")
    expect(config.schedule).toBe("0 2 * * *")
  })

  it("exits early without updates when no active accesses exist", async () => {
    const listAccessesMock = jest.fn().mockResolvedValue([])
    const updateAccessesMock = jest.fn()
    const listSeriesMock = jest.fn()
    const loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    const container = {
      resolve: (key: unknown) => {
        if (key === ContainerRegistrationKeys.LOGGER) return loggerMock
        if (key === RESEARCH_TRACKING_MODULE) {
          return {
            listResearchProtocolProfileAccesses: listAccessesMock,
            updateResearchProtocolProfileAccesses: updateAccessesMock,
          }
        }
        if (key === RESEARCH_CONTENT_MODULE) {
          return {
            listResearchProtocolSeries: listSeriesMock,
          }
        }
        return null
      },
    } as unknown as MedusaContainer

    await revokeArchivedProtocolAccesses(container)

    expect(listAccessesMock).toHaveBeenCalledWith({ status: "active" })
    expect(listSeriesMock).not.toHaveBeenCalled()
    expect(updateAccessesMock).not.toHaveBeenCalled()
  })

  it("revokes active accesses pointing to archived or missing series while preserving active ones", async () => {
    const activeAccesses = [
      {
        id: "access_1",
        protocol_series_id: "series_active",
        status: "active",
      },
      {
        id: "access_2",
        protocol_series_id: "series_archived",
        status: "active",
      },
      {
        id: "access_3",
        protocol_series_id: "series_deleted",
        status: "active",
      },
    ]

    const seriesList = [
      {
        id: "series_active",
        protocol_key: "active-compound",
        archived_at: null,
      },
      {
        id: "series_archived",
        protocol_key: "archived-compound",
        archived_at: new Date("2026-09-06T16:55:07.174Z"),
      },
    ]

    const listAccessesMock = jest.fn().mockResolvedValue(activeAccesses)
    const updateAccessesMock = jest.fn().mockResolvedValue({})
    const listSeriesMock = jest.fn().mockResolvedValue(seriesList)
    const loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    const container = {
      resolve: (key: unknown) => {
        if (key === ContainerRegistrationKeys.LOGGER) return loggerMock
        if (key === RESEARCH_TRACKING_MODULE) {
          return {
            listResearchProtocolProfileAccesses: listAccessesMock,
            updateResearchProtocolProfileAccesses: updateAccessesMock,
          }
        }
        if (key === RESEARCH_CONTENT_MODULE) {
          return {
            listResearchProtocolSeries: listSeriesMock,
          }
        }
        return null
      },
    } as unknown as MedusaContainer

    await revokeArchivedProtocolAccesses(container)

    expect(listAccessesMock).toHaveBeenCalledWith({ status: "active" })
    expect(listSeriesMock).toHaveBeenCalledWith({
      id: ["series_active", "series_archived", "series_deleted"],
    })
    expect(updateAccessesMock).toHaveBeenCalledTimes(2)
    expect(updateAccessesMock).toHaveBeenCalledWith({
      id: "access_2",
      status: "revoked",
    })
    expect(updateAccessesMock).toHaveBeenCalledWith({
      id: "access_3",
      status: "revoked",
    })
    expect(loggerMock.info).toHaveBeenCalledWith(
      "[Orphan Access Cleanup] Revoked 2 orphan access record(s) for 2 archived series.",
    )
  })

  it("handles errors gracefully without unhandled exceptions", async () => {
    const loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    const container = {
      resolve: (key: unknown) => {
        if (key === ContainerRegistrationKeys.LOGGER) return loggerMock
        if (key === RESEARCH_TRACKING_MODULE) {
          return {
            listResearchProtocolProfileAccesses: jest
              .fn()
              .mockRejectedValue(new Error("Database connection lost")),
          }
        }
        if (key === RESEARCH_CONTENT_MODULE) {
          return {
            listResearchProtocolSeries: jest.fn(),
          }
        }
        return null
      },
    } as unknown as MedusaContainer

    await revokeArchivedProtocolAccesses(container)

    expect(loggerMock.error).toHaveBeenCalledWith(
      "[Orphan Access Cleanup] Job failed: Database connection lost",
    )
  })
})
