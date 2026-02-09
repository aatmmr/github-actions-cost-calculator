/**
 * Service for exporting and importing runner selections as CSV
 */

type RunnerType = {
  id: string
  name: string
  os: string
}

/**
 * Escape CSV fields that contain commas, quotes, or newlines
 * @param field - Field value to escape
 * @returns Escaped field value, wrapped in quotes if necessary
 */
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * Export selected runners to CSV string
 * @param selectedIds - Array of selected runner IDs
 * @param allRunners - Array of all available runners
 * @returns CSV string with headers
 */
export function exportSelectionToCsv(selectedIds: string[], allRunners: RunnerType[]): string {
  // Create CSV header
  const header = 'id,name,os\n'
  
  // Filter to only selected runners and map to CSV rows
  const rows = allRunners
    .filter(runner => selectedIds.includes(runner.id))
    .map(runner => `${escapeCsvField(runner.id)},${escapeCsvField(runner.name)},${escapeCsvField(runner.os)}`)
    .join('\n')
  
  return header + rows
}

/**
 * Parse CSV content and separate valid/invalid runner IDs
 * @param csvContent - Raw CSV file content
 * @param validRunnerIds - Array of valid runner IDs to check against
 * @returns Object with validIds and invalidIds arrays
 */
export function parseSelectionFromCsv(
  csvContent: string,
  validRunnerIds: string[]
): { validIds: string[]; invalidIds: string[] } {
  const validIds: string[] = []
  const invalidIds: string[] = []
  const seenIds = new Set<string>()
  
  // Convert to Set for O(1) lookup performance
  const validRunnerIdsSet = new Set(validRunnerIds)
  
  // Split into lines and remove empty lines
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty. Please provide a file with at least a header row and one data row.')
  }
  
  // Parse header to find id column index
  const header = lines[0].trim()
  const headers = parseCSVLine(header)
  const idIndex = headers.findIndex(h => h.toLowerCase() === 'id')
  
  if (idIndex === -1) {
    throw new Error('CSV file must contain an "id" column')
  }
  
  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const fields = parseCSVLine(line)
    if (fields.length > idIndex) {
      const id = fields[idIndex].trim()
      if (id && !seenIds.has(id)) {
        seenIds.add(id)
        if (validRunnerIdsSet.has(id)) {
          validIds.push(id)
        } else {
          invalidIds.push(id)
        }
      }
    }
  }
  
  return { validIds, invalidIds }
}

/**
 * Parse a single CSV line, handling quoted fields
 * @param line - A single line from a CSV file
 * @returns Array of field values with quotes and escapes processed
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let currentField = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField)
      currentField = ''
    } else {
      currentField += char
    }
  }
  
  // Push last field
  fields.push(currentField)
  
  return fields
}

/**
 * Trigger browser download of CSV content
 * @param content - CSV string content
 * @param filename - Filename for the download
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}
