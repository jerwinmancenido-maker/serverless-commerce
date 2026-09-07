import assert from "node:assert/strict"
import test from "node:test"

import { sanitizeProductDescription } from "./product-description.ts"

test("preserves supported product-description formatting", () => {
  const result = sanitizeProductDescription(
    '<h2>Overview</h2><p><strong>Bold</strong>, <em>emphasis</em>, <u>underline</u>, <s>strike</s>, <span style="color: #2563eb">blue</span>, and <mark data-color="#fef08a" style="background-color: #fef08a">highlight</mark></p><blockquote>Research note</blockquote><ul><li>Item</li></ul>',
  )

  assert.match(result, /<h2>Overview<\/h2>/)
  assert.match(result, /<strong>Bold<\/strong>/)
  assert.match(result, /<u>underline<\/u>/)
  assert.match(result, /<s>strike<\/s>/)
  assert.match(result, /color:\s*#2563eb/)
  assert.match(result, /background-color:\s*#fef08a/)
  assert.match(result, /<blockquote>Research note<\/blockquote>/)
  assert.match(result, /<ul><li>Item<\/li><\/ul>/)
})

test("keeps legacy plain-text descriptions readable", () => {
  assert.equal(
    sanitizeProductDescription("First line\nSecond line"),
    "<p>First line<br />Second line</p>",
  )
})

test("renders Markdown bold, italic, heading, and list", () => {
  const result = sanitizeProductDescription(
    "## GHK-Cu Overview\n\n**Copper peptide** with *collagen synthesis* activity.\n\n- Lyophilized\n- Research grade",
  )

  assert.match(result, /<h2>GHK-Cu Overview<\/h2>/)
  assert.match(result, /<strong>Copper peptide<\/strong>/)
  assert.match(result, /<em>collagen synthesis<\/em>/)
  assert.match(result, /<li>Lyophilized<\/li>/)
  assert.match(result, /<li>Research grade<\/li>/)
})

test("strips unsafe HTML injected through Markdown", () => {
  // Pure Markdown input — triggers the marked parser path.
  // marked converts [click](javascript:alert(1)) to <a href="javascript:...">
  // which sanitize-html then strips because javascript: is a disallowed scheme.
  const result = sanitizeProductDescription(
    "**Safe content** [click](javascript:alert(1))",
  )

  // The javascript: href must not appear as a clickable link
  assert.doesNotMatch(result, /href=["']javascript:/i)
  // Bold text should render correctly
  assert.match(result, /<strong>Safe content<\/strong>/)
})

test("removes scripts, event handlers, and unsafe image sources", () => {
  const result = sanitizeProductDescription(
    '<p onclick="alert(1)">Safe</p><script>alert(1)</script><span style="color: expression(alert(1)); position: fixed">Unsafe style</span><mark style="background-color: url(javascript:alert(1))">Unsafe mark</mark><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)">Link</a>',
  )

  assert.doesNotMatch(
    result,
    /script|onclick|onerror|javascript:|expression|position:/i,
  )
  assert.match(result, /<p>Safe<\/p>/)
})

test("adds safe link and image attributes", () => {
  const result = sanitizeProductDescription(
    '<a href="https://example.com">Details</a><img src="https://example.com/photo.jpg" alt="Product">',
  )

  assert.match(result, /rel="noopener noreferrer"/)
  assert.match(result, /target="_blank"/)
  assert.match(result, /loading="lazy"/)
})
