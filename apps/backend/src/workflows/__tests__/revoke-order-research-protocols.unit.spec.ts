/**
 * @file    apps/backend/src/workflows/__tests__/revoke-order-research-protocols.unit.spec.ts
 * @module  RevokeOrderResearchProtocolsUnitTest (Research Tracking & Content Modules)
 * @purpose Unit test verifying that revokeOrderResearchProtocolsStep revokes active tokens, flips profile accesses to revoked, and restores them on rollback.
 */

import type { MedusaContainer } from "@medusajs/framework/types"

import {
  revokeOrderResearchProtocolsStep,
  executeRevokeOrderResearchProtocols,
  executeRestoreOrderResearchProtocols,
} from "../steps/revoke-order-research-protocols"
import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"

describe("revokeOrderResearchProtocolsStep", () => {
  it("exports a valid step definition", () => {
    expect(revokeOrderResearchProtocolsStep).toBeDefined()
  })

  it("handles orders with no active protocol accesses gracefully", async () => {
    const listOrderAccessesMock = jest.fn().mockResolvedValue([])
    const updateOrderAccessesMock = jest.fn()
    const listProfileAccessesMock = jest.fn().mockResolvedValue([])
    const updateProfileAccessesMock = jest.fn()

    const container = {
      resolve: (key: unknown) => {
        if (key === RESEARCH_CONTENT_MODULE) {
          return {
            listResearchProtocolOrderAccesses: listOrderAccessesMock,
            updateResearchProtocolOrderAccesses: updateOrderAccessesMock,
          }
        }
        if (key === RESEARCH_TRACKING_MODULE) {
          return {
            listResearchProtocolProfileAccesses: listProfileAccessesMock,
            updateResearchProtocolProfileAccesses: updateProfileAccessesMock,
          }
        }
        return null
      },
    } as unknown as MedusaContainer

    const { result, compensation } = await executeRevokeOrderResearchProtocols(
      { order_id: "order_empty" },
      container,
    )

    expect(listOrderAccessesMock).toHaveBeenCalledWith({
      order_id: "order_empty",
      revoked_at: null,
    })
    expect(updateOrderAccessesMock).not.toHaveBeenCalled()
    expect(result).toEqual({
      revoked_order_access_count: 0,
      revoked_profile_access_count: 0,
    })
    expect(compensation).toEqual({
      restorableOrderAccessIds: [],
      restorableProfileAccessIds: [],
    })
  })

  it("revokes active order accesses and flips linked profile accesses", async () => {
    const activeOrderAccesses = [
      { id: "order_acc_1", access_token: "token_1", revoked_at: null },
      { id: "order_acc_2", access_token: "token_2", revoked_at: null },
    ]
    const activeProfileAccesses = [
      { id: "prof_acc_1", order_protocol_access_id: "order_acc_1", status: "active" },
    ]

    const listOrderAccessesMock = jest.fn().mockResolvedValue(activeOrderAccesses)
    const updateOrderAccessesMock = jest.fn().mockResolvedValue({})
    const listProfileAccessesMock = jest.fn().mockResolvedValue(activeProfileAccesses)
    const updateProfileAccessesMock = jest.fn().mockResolvedValue({})

    const container = {
      resolve: (key: unknown) => {
        if (key === RESEARCH_CONTENT_MODULE) {
          return {
            listResearchProtocolOrderAccesses: listOrderAccessesMock,
            updateResearchProtocolOrderAccesses: updateOrderAccessesMock,
          }
        }
        if (key === RESEARCH_TRACKING_MODULE) {
          return {
            listResearchProtocolProfileAccesses: listProfileAccessesMock,
            updateResearchProtocolProfileAccesses: updateProfileAccessesMock,
          }
        }
        return null
      },
    } as unknown as MedusaContainer

    const { result, compensation } = await executeRevokeOrderResearchProtocols(
      { order_id: "order_123", reason: "order_expired_unpaid" },
      container,
    )

    expect(listOrderAccessesMock).toHaveBeenCalledWith({
      order_id: "order_123",
      revoked_at: null,
    })
    expect(updateOrderAccessesMock).toHaveBeenCalledWith([
      { id: "order_acc_1", revoked_at: expect.any(Date) },
      { id: "order_acc_2", revoked_at: expect.any(Date) },
    ])
    expect(listProfileAccessesMock).toHaveBeenCalledWith({
      order_protocol_access_id: ["order_acc_1", "order_acc_2"],
      status: "active",
    })
    expect(updateProfileAccessesMock).toHaveBeenCalledWith([
      { id: "prof_acc_1", status: "revoked" },
    ])
    expect(result).toEqual({
      revoked_order_access_count: 2,
      revoked_profile_access_count: 1,
    })
    expect(compensation).toEqual({
      restorableOrderAccessIds: ["order_acc_1", "order_acc_2"],
      restorableProfileAccessIds: ["prof_acc_1"],
    })
  })

  it("compensates by restoring revoked_at to null and profile status to active", async () => {
    const updateOrderAccessesMock = jest.fn().mockResolvedValue({})
    const updateProfileAccessesMock = jest.fn().mockResolvedValue({})

    const container = {
      resolve: (key: unknown) => {
        if (key === RESEARCH_CONTENT_MODULE) {
          return {
            updateResearchProtocolOrderAccesses: updateOrderAccessesMock,
          }
        }
        if (key === RESEARCH_TRACKING_MODULE) {
          return {
            updateResearchProtocolProfileAccesses: updateProfileAccessesMock,
          }
        }
        return null
      },
    } as unknown as MedusaContainer

    await executeRestoreOrderResearchProtocols(
      {
        restorableOrderAccessIds: ["order_acc_1", "order_acc_2"],
        restorableProfileAccessIds: ["prof_acc_1"],
      },
      container,
    )

    expect(updateOrderAccessesMock).toHaveBeenCalledWith([
      { id: "order_acc_1", revoked_at: null },
      { id: "order_acc_2", revoked_at: null },
    ])
    expect(updateProfileAccessesMock).toHaveBeenCalledWith([
      { id: "prof_acc_1", status: "active" },
    ])
  })
})
