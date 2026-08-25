import type {
  IFileModuleService,
  IOrderModuleService,
  IPaymentModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createOrderPaymentCollectionWorkflow } from "@medusajs/medusa/core-flows"

import { MANUAL_PAYMENT_MODULE } from "../../src/modules/manual-payment"
import type ManualPaymentModuleService from "../../src/modules/manual-payment/service"
import { MANUAL_QR_PAYMENT_PROVIDER_ID } from "../../src/modules/manual-qr-payment/service"
import reviewManualPaymentProofWorkflow from "../../src/workflows/review-manual-payment-proof"
import submitManualPaymentProofWorkflow from "../../src/workflows/submit-manual-payment-proof"
import uploadCustomerManualPaymentProofWorkflow from "../../src/workflows/upload-customer-manual-payment-proof"

jest.setTimeout(120 * 1000)

const firstChecksum = "a".repeat(64)
const secondChecksum = "b".repeat(64)

medusaIntegrationTestRunner({
  moduleName: "manual-payment-foundation",
  inApp: true,
  env: {
    STORE_CORS: "http://localhost:8000",
    ADMIN_CORS: "http://localhost:9000",
    AUTH_CORS: "http://localhost:8000,http://localhost:9000",
    JWT_SECRET: "phase-5-disposable-test-secret",
    COOKIE_SECRET: "phase-5-disposable-test-secret",
  },
  testSuite: ({ getContainer }) => {
    describe("Manual QR payment proof lifecycle", () => {
      it("validates order ownership and uploads proof bytes through the File Module", async () => {
        const container = getContainer()
        const orderService = container.resolve<IOrderModuleService>(
          Modules.ORDER,
        )
        const paymentService = container.resolve<IPaymentModuleService>(
          Modules.PAYMENT,
        )
        const fileService = container.resolve<IFileModuleService>(Modules.FILE)
        const manualPaymentService =
          container.resolve<ManualPaymentModuleService>(MANUAL_PAYMENT_MODULE)
        const order = await orderService.createOrders({
          currency_code: "php",
          customer_id: "cus_phase_5_upload",
        })
        const { result: paymentCollections } =
          await createOrderPaymentCollectionWorkflow(container).run({
            input: { order_id: order.id, amount: 500 },
          })
        await paymentService.createPaymentSession(paymentCollections[0].id, {
          provider_id: MANUAL_QR_PAYMENT_PROVIDER_ID,
          currency_code: "php",
          amount: 500,
          data: {},
        })
        const content = Buffer.from("disposable-phase-5-proof")

        const submitted = await uploadCustomerManualPaymentProofWorkflow(
          container,
        ).run({
          input: {
            orderId: order.id,
            customerId: "cus_phase_5_upload",
            actorId: "cus_phase_5_upload",
            file: {
              fileName: "phase-5-proof.png",
              mimeType: "image/png",
              contentBase64: content.toString("base64"),
            },
          },
        })
        const submittedProof = submitted.result.proof

        if (!submittedProof) {
          throw new Error("expected the upload workflow to return a proof")
        }

        try {
          expect(submittedProof).toEqual(
            expect.objectContaining({
              order_id: order.id,
              customer_id: "cus_phase_5_upload",
              status: "pending",
              revision: 1,
            }),
          )
          await expect(
            fileService.getAsBuffer(submittedProof.file_id),
          ).resolves.toEqual(content)

          const replayed = await uploadCustomerManualPaymentProofWorkflow(
            container,
          ).run({
            input: {
              orderId: order.id,
              customerId: "cus_phase_5_upload",
              actorId: "cus_phase_5_upload",
              file: {
                fileName: "phase-5-proof.png",
                mimeType: "image/png",
                contentBase64: content.toString("base64"),
              },
            },
          })
          const events =
            await manualPaymentService.listManualPaymentProofEvents({
              proof_id: submittedProof.id,
            })

          expect(replayed.result.proof?.id).toBe(submittedProof.id)
          expect(replayed.result.event).toBeNull()
          expect(events).toHaveLength(1)

          const unauthorized = await uploadCustomerManualPaymentProofWorkflow(
            container,
          ).run({
            input: {
              orderId: order.id,
              customerId: "cus_phase_5_other",
              actorId: "cus_phase_5_other",
              file: {
                fileName: "stolen-order.png",
                mimeType: "image/png",
                contentBase64: content.toString("base64"),
              },
            },
            throwOnError: false,
          })

          expect(unauthorized.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                error: expect.objectContaining({
                  message: "order was not found",
                }),
              }),
            ]),
          )
        } finally {
          await fileService.deleteFiles(submittedProof.file_id)
        }
      })

      it("persists idempotent submission and review transitions with immutable audit events", async () => {
        const container = getContainer()
        const service = container.resolve<ManualPaymentModuleService>(
          MANUAL_PAYMENT_MODULE,
        )
        const initialInput = {
          paymentSessionId: "payses_phase_5",
          orderId: "order_phase_5",
          customerId: "cus_phase_5",
          providerId: MANUAL_QR_PAYMENT_PROVIDER_ID,
          fileId: "file_phase_5_first",
          fileName: "payment-proof.png",
          mimeType: "image/png",
          sizeBytes: 1_024,
          checksumSha256: firstChecksum,
          actorId: "cus_phase_5",
        }

        const submitted = await submitManualPaymentProofWorkflow(container).run(
          {
            input: initialInput,
          },
        )

        expect(submitted.result.proof).toEqual(
          expect.objectContaining({
            payment_session_id: initialInput.paymentSessionId,
            status: "pending",
            revision: 1,
          }),
        )
        expect(submitted.result.event).toEqual(
          expect.objectContaining({
            event_type: "submitted",
            revision: 1,
          }),
        )

        const replayed = await submitManualPaymentProofWorkflow(container).run({
          input: initialInput,
        })
        let events = await service.listManualPaymentProofEvents({
          payment_session_id: initialInput.paymentSessionId,
        })

        expect(replayed.result.proof.id).toBe(submitted.result.proof.id)
        expect(replayed.result.proof.revision).toBe(1)
        expect(replayed.result.event).toBeNull()
        expect(events).toHaveLength(1)

        const conflictingSubmission = await submitManualPaymentProofWorkflow(
          container,
        ).run({
          input: {
            ...initialInput,
            fileId: "file_phase_5_conflict",
            checksumSha256: secondChecksum,
          },
          throwOnError: false,
        })
        const [unchangedPending] = await service.listManualPaymentProofs({
          payment_session_id: initialInput.paymentSessionId,
        })

        expect(conflictingSubmission.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              error: expect.objectContaining({
                message:
                  "a different proof cannot replace a pending submission",
              }),
            }),
          ]),
        )
        expect(unchangedPending).toEqual(
          expect.objectContaining({
            file_id: initialInput.fileId,
            status: "pending",
            revision: 1,
          }),
        )

        const rejected = await reviewManualPaymentProofWorkflow(container).run({
          input: {
            proofId: submitted.result.proof.id,
            decision: "rejected",
            reason: "Reference number is unreadable",
            actorId: "user_phase_5_reviewer",
          },
        })

        expect(rejected.result.proof.status).toBe("rejected")
        expect(rejected.result.event).toEqual(
          expect.objectContaining({
            event_type: "rejected",
            reason: "Reference number is unreadable",
          }),
        )

        const resubmitted = await submitManualPaymentProofWorkflow(
          container,
        ).run({
          input: {
            ...initialInput,
            fileId: "file_phase_5_second",
            fileName: "payment-proof-corrected.pdf",
            mimeType: "application/pdf",
            checksumSha256: secondChecksum,
          },
        })

        expect(resubmitted.result.proof).toEqual(
          expect.objectContaining({
            status: "pending",
            revision: 2,
            file_id: "file_phase_5_second",
          }),
        )
        expect(resubmitted.result.event).toEqual(
          expect.objectContaining({
            event_type: "resubmitted",
            revision: 2,
          }),
        )

        const approved = await reviewManualPaymentProofWorkflow(container).run({
          input: {
            proofId: submitted.result.proof.id,
            decision: "approved",
            actorId: "user_phase_5_reviewer",
          },
        })
        const approvedReplay = await reviewManualPaymentProofWorkflow(
          container,
        ).run({
          input: {
            proofId: submitted.result.proof.id,
            decision: "approved",
            actorId: "user_phase_5_reviewer",
          },
        })
        const conflictingReview = await reviewManualPaymentProofWorkflow(
          container,
        ).run({
          input: {
            proofId: submitted.result.proof.id,
            decision: "rejected",
            reason: "Late conflicting decision",
            actorId: "user_phase_5_reviewer",
          },
          throwOnError: false,
        })

        events = await service.listManualPaymentProofEvents(
          { payment_session_id: initialInput.paymentSessionId },
          { order: { occurred_at: "ASC" } },
        )

        expect(approved.result.proof.status).toBe("approved")
        expect(approved.result.event?.event_type).toBe("approved")
        expect(approvedReplay.result.event).toBeNull()
        expect(conflictingReview.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              error: expect.objectContaining({
                message: "approved proof cannot transition to rejected",
              }),
            }),
          ]),
        )
        expect(events.map(({ event_type }) => event_type)).toEqual([
          "submitted",
          "rejected",
          "resubmitted",
          "approved",
        ])

        await expect(
          service.updateManualPaymentProofEvents({
            id: events[0].id,
            reason: "attempted mutation",
          }),
        ).rejects.toThrow("manual payment proof audit events are immutable")
      })
    })
  },
})
