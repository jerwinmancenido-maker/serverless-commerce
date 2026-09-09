import type { HttpTypes } from "@medusajs/types"
import {
  buildJntQuickOrderFields,
  cleanJntWaybill,
  extractBarangay,
  formatPhilippinePhone,
  generateJntBatchCsv,
  isValidJntWaybill,
} from "../jnt-express-helper"

describe("J&T Express Logistics Helper", () => {
  describe("cleanJntWaybill", () => {
    it("cleans hyphens, underscores, and extra whitespace", () => {
      expect(cleanJntWaybill(" 781-234-567-890 ")).toBe("781234567890")
      expect(cleanJntWaybill("781_234_567_890")).toBe("781234567890")
      expect(cleanJntWaybill("")).toBe("")
      expect(cleanJntWaybill(null)).toBe("")
      expect(cleanJntWaybill(undefined)).toBe("")
    })
  })

  describe("isValidJntWaybill", () => {
    it("validates standard 12-digit Philippine J&T Express waybills", () => {
      expect(isValidJntWaybill("781234567890")).toBe(true)
      expect(isValidJntWaybill("981234567890")).toBe(true)
      expect(isValidJntWaybill(" 781-234-567-890 ")).toBe(true)
    })

    it("rejects invalid lengths or non-numeric strings", () => {
      expect(isValidJntWaybill("123456")).toBe(false)
      expect(isValidJntWaybill("78123456789")).toBe(false) // 11 digits
      expect(isValidJntWaybill("7812345678901")).toBe(false) // 13 digits
      expect(isValidJntWaybill("JNT123456789")).toBe(false)
      expect(isValidJntWaybill("")).toBe(false)
      expect(isValidJntWaybill(null)).toBe(false)
    })
  })

  describe("extractBarangay", () => {
    it("prefers address_2 when provided", () => {
      expect(extractBarangay("Unit 402", "South Triangle")).toBe("South Triangle")
    })

    it("parses barangay patterns from address_1 if address_2 is omitted", () => {
      expect(extractBarangay("123 Timog Ave, Brgy. South Triangle")).toBe("South Triangle")
      expect(extractBarangay("456 Buendia, Barangay Bel-Air, Makati")).toBe("Bel-Air")
    })

    it("returns empty string when no barangay is detected", () => {
      expect(extractBarangay("Unit 12A Tower 1", null)).toBe("")
      expect(extractBarangay(null, null)).toBe("")
    })
  })

  describe("formatPhilippinePhone", () => {
    it("normalizes international and local formats to 09XXXXXXXXX", () => {
      expect(formatPhilippinePhone("+639171234567")).toBe("09171234567")
      expect(formatPhilippinePhone("639171234567")).toBe("09171234567")
      expect(formatPhilippinePhone("9171234567")).toBe("09171234567")
      expect(formatPhilippinePhone("09171234567")).toBe("09171234567")
      expect(formatPhilippinePhone(null)).toBe("")
    })
  })

  describe("buildJntQuickOrderFields", () => {
    const mockOrder: HttpTypes.AdminOrder = {
      id: "order_01M1TEST",
      display_id: 1007,
      total: 3500,
      payment_status: "captured",
      fulfillment_status: "not_fulfilled",
      shipping_address: {
        first_name: "Jerwin",
        last_name: "Mancenido",
        phone: "+639171234567",
        province: "Metro Manila",
        city: "Quezon City",
        address_1: "Unit 402, 123 Timog Avenue",
        address_2: "South Triangle",
        postal_code: "1103",
      } as any,
      items: [
        {
          id: "item_1",
          title: "BPC-157 5MG Lyophilized Vial",
          quantity: 2,
        } as any,
      ],
    } as any

    it("extracts clean recipient and order metadata", () => {
      const fields = buildJntQuickOrderFields(mockOrder)

      expect(fields.recipientName).toBe("Jerwin Mancenido")
      expect(fields.recipientPhone).toBe("09171234567")
      expect(fields.province).toBe("Metro Manila")
      expect(fields.city).toBe("Quezon City")
      expect(fields.barangay).toBe("South Triangle")
      expect(fields.streetAddress).toBe("Unit 402, 123 Timog Avenue")
      expect(fields.postalCode).toBe("1103")
      expect(fields.declaredValue).toBe(3500)
      expect(fields.codAmount).toBe(0) // Captured order has 0 COD
      expect(fields.totalQuantity).toBe(2)
      expect(fields.smartRecognitionString).toBe(
        "Jerwin Mancenido, 09171234567, Metro Manila, Quezon City, Brgy. South Triangle, Unit 402, 123 Timog Avenue"
      )
      expect(fields.remarks).toContain("Order #1007")
      expect(fields.remarks).not.toContain("Cold-Chain")
    })

    it("sets COD amount equal to declared value for uncaptured orders", () => {
      const uncapturedOrder = {
        ...mockOrder,
        payment_status: "awaiting",
      } as HttpTypes.AdminOrder

      const fields = buildJntQuickOrderFields(uncapturedOrder)
      expect(fields.codAmount).toBe(3500)
    })
  })

  describe("generateJntBatchCsv", () => {
    it("generates valid RFC 4180 CSV with official J&T Express VIP headers", () => {
      const mockOrder: HttpTypes.AdminOrder = {
        id: "order_01M1TEST",
        display_id: 1007,
        total: 2500,
        payment_status: "captured",
        shipping_address: {
          first_name: "Jerwin",
          last_name: "Mancenido",
          phone: "09171234567",
          province: "Metro Manila",
          city: "Quezon City",
          address_1: "Unit 402, 123 Timog Ave",
          address_2: "South Triangle",
          postal_code: "1103",
        } as any,
        items: [{ id: "i1", title: "TB-500", quantity: 1 } as any],
      } as any

      const csv = generateJntBatchCsv(mockOrder)
      const lines = csv.split("\r\n")

      expect(lines[0]).toBe(
        "Receiver Name,Receiver Phone,Receiver Province,Receiver City,Receiver District/Barangay,Detailed Address,Postal Code,Item Name,Weight(kg),Total Quantity,Declared Value,COD Amount,Remarks"
      )
      expect(lines[1]).toContain("Jerwin Mancenido,09171234567,Metro Manila,Quezon City,South Triangle")
      expect(lines[1]).toContain("2500,0,") // declaredValue 2500, COD 0
    })
  })
})
