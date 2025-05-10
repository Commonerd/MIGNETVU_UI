/* eslint-disable no-restricted-globals */
globalThis.onmessage = (event) => {
  const { networks, query } = event.data

  if (!query) {
    postMessage([])
    return
  }

  const filteredNetworks = networks.filter((network: any) =>
    network.title.toLowerCase().includes(query.toLowerCase()),
  )

  postMessage(filteredNetworks)
}
