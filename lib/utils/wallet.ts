export function formatSuiAddress(address: string): string {
  if (!address) return ''
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isValidSuiAddress(address: string): boolean {
  if (!address) return false
  
  // Basic Sui address validation
  const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/
  return suiAddressRegex.test(address)
}

export function getSuiExplorerUrl(address: string, network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet'): string {
  const baseUrls = {
    mainnet: 'https://explorer.sui.io',
    testnet: 'https://explorer.sui.io',
    devnet: 'https://explorer.sui.io'
  }
  
  const networkParam = network === 'mainnet' ? '' : `?network=${network}`
  return `${baseUrls[network]}/address/${address}${networkParam}`
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers or non-HTTPS contexts
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        textArea.remove()
        resolve()
      } catch (error) {
        textArea.remove()
        reject(error)
      }
    })
  }
}

export function generateAvatarFromAddress(address: string): string {
  if (!address) return ''
  
  // Generate a simple avatar based on address
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  
  const index = parseInt(address.slice(-2), 16) % colors.length
  const initials = address.slice(2, 4).toUpperCase()
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${colors[index]}" rx="20"/>
      <text x="20" y="26" font-family="Arial" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
        ${initials}
      </text>
    </svg>
  `)}`
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function formatTimestamp(timestamp: string | Date): string {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting timestamp:', error)
    return 'Invalid date'
  }
}

export function getTimeAgo(timestamp: string | Date): string {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMins / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMins < 1) return 'Just now'
    if (diffInMins < 60) return `${diffInMins}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return formatTimestamp(date)
  } catch (error) {
    console.error('Error calculating time ago:', error)
    return 'Unknown'
  }
}