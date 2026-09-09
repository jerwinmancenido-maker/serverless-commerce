/**
 * @file apps/storefront/scripts/test-e2e-checkout.mjs
 * @module E2ECheckoutVerification (Storefront & Backend)
 * @purpose Deterministically executes end-to-end checkout, cart adjustments, manual QR payment, and DB assertions.
 * @contracts Medusa Store API: /store/carts, /store/orders | PostgreSQL: order, order_item, payment_collection
 */

import { Client } from "pg"

const BACKEND_URL = "http://127.0.0.1:9000"
const PUBLISHABLE_KEY = "pk_28dd7da6fd12a3302087507d85b26d90ef19a80118bf836413b989e2bae109cf"
const DB_URL = "postgres://m5@localhost:5432/pepstack_phase4_test_20260825"

async function api(path, options = {}) {
  const url = `${BACKEND_URL}${path}`
  const headers = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
    ...(options.headers || {}),
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    throw new Error(`API ${options.method || "GET"} ${path} failed (${res.status}): ${JSON.stringify(json)}`)
  }
  return json
}

async function run() {
  console.log("=== STEP 1: Authenticate Customer ===")
  const authRes = await api("/auth/customer/emailpass", {
    method: "POST",
    body: JSON.stringify({
      email: "jerwin@example.com",
      password: "supersecret",
    }),
  })
  const token = authRes.token
  const authHeaders = { Authorization: `Bearer ${token}` }
  console.log("Customer authenticated successfully.")

  console.log("\n=== STEP 2: Create Cart ===")
  const cartRes = await api("/store/carts", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      currency_code: "php",
    }),
  })
  const cartId = cartRes.cart.id
  console.log(`Created Cart ID: ${cartId}`)

  console.log("\n=== STEP 3: Add In-Stock Item (GHK-Cu 50MG / Vial Only) ===")
  const variantId = "variant_01M1RR3WM732DQQHMY5NA2FSC1"
  const addRes = await api(`/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      variant_id: variantId,
      quantity: 1,
    }),
  })
  const lineItem = addRes.cart.items[0]
  const initialSubtotal = addRes.cart.subtotal
  console.log(`Added line item: ${lineItem.title} (${lineItem.id}), Qty: ${lineItem.quantity}, Subtotal: ₱${initialSubtotal}`)

  console.log("\n=== STEP 4: Test Cart Adjustments (+ / - Quantity) ===")
  console.log("--> Increasing quantity to 2...")
  const incRes = await api(`/store/carts/${cartId}/line-items/${lineItem.id}`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ quantity: 2 }),
  })
  const incSubtotal = incRes.cart.subtotal
  console.log(`Updated Qty: 2, New Subtotal: ₱${incSubtotal}`)
  if (incSubtotal !== initialSubtotal * 2) {
    throw new Error(`Expected subtotal to double (₱${initialSubtotal * 2}), got ₱${incSubtotal}`)
  }

  console.log("--> Decreasing quantity back to 1...")
  const decRes = await api(`/store/carts/${cartId}/line-items/${lineItem.id}`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ quantity: 1 }),
  })
  const decSubtotal = decRes.cart.subtotal
  console.log(`Restored Qty: 1, Restored Subtotal: ₱${decSubtotal}`)
  if (decSubtotal !== initialSubtotal) {
    throw new Error(`Expected subtotal to restore (₱${initialSubtotal}), got ₱${decSubtotal}`)
  }

  console.log("\n=== STEP 5: Set Shipping & Billing Address ===")
  const address = {
    first_name: "Dr. Jerwin",
    last_name: "Mancenido",
    address_1: "Unit 405 Clinical Laboratory Plaza, San Miguel",
    city: "Pasig City",
    province: "Metro Manila",
    postal_code: "1600",
    country_code: "ph",
    phone: "09171234567",
  }
  const addrRes = await api(`/store/carts/${cartId}`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      email: "jerwin@example.com",
      shipping_address: address,
      billing_address: address,
    }),
  })
  console.log(`Address set for ${addrRes.cart.shipping_address.first_name} ${addrRes.cart.shipping_address.last_name}`)

  console.log("\n=== STEP 6: Select Shipping Method (J&T Express) ===")
  const shipOptRes = await api(`/store/shipping-options?cart_id=${cartId}`, {
    method: "GET",
    headers: authHeaders,
  })
  if (!shipOptRes.shipping_options?.length) {
    throw new Error("No shipping options returned for cart!")
  }
  const selectedOption = shipOptRes.shipping_options[0]
  console.log(`Selecting shipping option: ${selectedOption.name} (${selectedOption.id}) - ₱${selectedOption.amount}`)

  const shipRes = await api(`/store/carts/${cartId}/shipping-methods`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      option_id: selectedOption.id,
    }),
  })
  console.log(`Shipping method applied. Total: ₱${shipRes.cart.total}`)

  console.log("\n=== STEP 7: Initialize Payment Session ===")
  const paymentCollectionRes = await api(`/store/payment-collections`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      cart_id: cartId,
    }),
  })
  const paymentCollectionId = paymentCollectionRes.payment_collection.id
  console.log(`Created Payment Collection: ${paymentCollectionId}`)

  const paySessionRes = await api(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      provider_id: "pp_manual-qr_manual-qr",
    }),
  })
  console.log(`Payment session initialized: ${paySessionRes.payment_collection.payment_sessions?.[0]?.id}`)

  console.log("\n=== STEP 8: Complete Cart (Place Order) ===")
  const completeRes = await api(`/store/carts/${cartId}/complete`, {
    method: "POST",
    headers: authHeaders,
  })
  if (completeRes.type !== "order") {
    throw new Error(`Cart complete did not return order: ${JSON.stringify(completeRes)}`)
  }
  const order = completeRes.order
  console.log(`Order Placed Successfully!`)
  console.log(`Order ID: ${order.id}`)
  console.log(`Order Display ID: #${order.display_id}`)
  console.log(`Order Status: ${order.status}`)
  console.log(`Order Total: ₱${order.total}`)

  console.log("\n=== STEP 9: Database Assertion via PostgreSQL ===")
  const pg = new Client({ connectionString: DB_URL })
  await pg.connect()

  const orderRow = await pg.query('SELECT id, display_id, email, status, currency_code, customer_id FROM "order" WHERE id = $1', [order.id])
  if (orderRow.rowCount === 0) {
    throw new Error(`Database assertion failed: Order ${order.id} not found in "order" table!`)
  }
  console.log("PostgreSQL Order Row:", orderRow.rows[0])

  const itemRows = await pg.query(
    `SELECT oi.id, oli.title, oli.variant_title, oi.quantity, oi.unit_price 
     FROM order_item oi 
     JOIN order_line_item oli ON oli.id = oi.item_id 
     WHERE oi.order_id = $1`,
    [order.id]
  )
  console.log(`PostgreSQL Order Items (${itemRows.rowCount}):`, itemRows.rows)

  const paymentRows = await pg.query('SELECT id, amount, status, currency_code FROM payment_collection WHERE id = $1', [paymentCollectionId])
  console.log(`PostgreSQL Payment Collection:`, paymentRows.rows[0])

  await pg.end()
  console.log("\n>>> WORKFLOW 2 END-TO-END CHECKOUT & DATABASE ASSERTION: 100% PASSED! <<<")
}

run().catch((err) => {
  console.error("Workflow 2 execution failed:", err)
  process.exit(1)
})
