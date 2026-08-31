"use client"

import type { OrderResearchProtocolAccess } from "@lib/data/research-protocols"
import QRCode from "qrcode"
import Image from "next/image"
import { useEffect, useState } from "react"

const ProtocolQr = ({ access, countryCode }: { access: OrderResearchProtocolAccess; countryCode: string }) => {
  const [image, setImage] = useState<string | null>(null)
  const path = `/${countryCode}/research-protocol-access/${access.access_token}`
  useEffect(() => { QRCode.toDataURL(`${window.location.origin}${path}`, { width: 220, margin: 1 }).then(setImage).catch(() => setImage(null)) }, [path])
  return <div className="flex flex-col gap-3 rounded-rounded border border-ui-border-base p-5 small:flex-row small:items-center"><div className="flex-1"><p className="text-base-semi text-ui-fg-base">{access.title}</p><p className="mt-1 text-small-regular text-ui-fg-subtle">Order-linked revision {access.revision}</p><a href={path} className="mt-3 inline-block text-small-semi text-ui-fg-interactive">Open research protocol</a></div>{image ? <Image unoptimized src={image} alt={`QR code for ${access.title}`} width={140} height={140} /> : null}</div>
}

export const ResearchProtocolAccess = ({ accesses, countryCode }: { accesses: OrderResearchProtocolAccess[]; countryCode: string }) => accesses.length ? <section className="flex flex-col gap-4"><div><h2 className="text-2xl-semi text-ui-fg-base">Research protocols</h2><p className="mt-1 text-small-regular text-ui-fg-subtle">Scan or open the protocol revision associated with this order.</p></div>{accesses.map((access) => <ProtocolQr key={`${access.line_item_id}-${access.access_token}`} access={access} countryCode={countryCode} />)}</section> : null
