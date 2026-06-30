/**
 * Format date to DD-MM-YYYY format
 * @param dateStr - Date string or Date object
 * @returns Formatted date string in DD-MM-YYYY format
 */
export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-'
  
  try {
    const date = new Date(dateStr)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-'
    }
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}-${month}-${year}`
  } catch {
    return '-'
  }
}

/**
 * Format date to YYYY-MM-DD format (for input fields)
 * @param dateStr - Date string or Date object
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForInput(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return ''
  
  try {
    const date = new Date(dateStr)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}
