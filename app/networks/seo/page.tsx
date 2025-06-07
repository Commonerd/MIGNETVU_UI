type Network = {
  id: number
  title: string
  nationality: string
  ethnicity: string
}

async function getAllNetworks(): Promise<Network[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/networks`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch networks")
  return res.json()
}

export default async function NetworksSEOPage() {
  const networks = await getAllNetworks()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: networks.map((n, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: n.title,
      description: `${n.nationality} / ${n.ethnicity}`,
      url: `https://yourdomain.com/networks/${n.id}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ display: "none" }} aria-hidden="true"></div>
    </>
  )
}
