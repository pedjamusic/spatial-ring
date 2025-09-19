// Map Prisma field types to HTML input types
export function getInputType(field) {
  if (field.kind === 'enum') return 'select'
  if (field.kind === 'object') return 'relation'
  
  switch (field.type) {
    case 'String': return 'text'
    case 'Int':
    case 'BigInt': 
    case 'Float':
    case 'Decimal': return 'number'
    case 'Boolean': return 'checkbox'
    case 'DateTime': return 'datetime-local'
    case 'Json': return 'textarea'
    default: return 'text'
  }
}

// Get human-readable label for field
export function getFieldLabel(field, uiConfig = {}) {
  if (uiConfig[field.name]?.label) {
    return uiConfig[field.name].label
  }
  
  // Convert camelCase to Title Case
  return field.name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

// Check if field should be hidden in forms
export function isFieldHidden(field, uiConfig = {}) {
  // Ensure field exists
  if (!field || typeof field !== 'object') return true
  
  // UI config override
  if (uiConfig[field.name]?.hidden) return true
  
  // Hide system fields by default
  if (field.isId || field.isReadOnly || field.isUpdatedAt) return true
  if (['createdAt', 'updatedAt'].includes(field.name)) return true
  
  // Hide reverse relations (one-to-many, many-to-many arrays)
  if (field.kind === 'object' && field.isList === true) {
    // console.log(`🙈 Hiding reverse relation field: ${field.name}`)
    return true
  }
  
  return false
}

// Check if field is required in forms
export function isFieldRequired(field) {
  return field.isRequired && !field.hasDefaultValue
}

// Format field value for display
export function formatFieldValue(value, field) {
  if (value === null || value === undefined) return ''
  
  if (field.type === 'DateTime') {
    return new Date(value).toLocaleString()
  }
  
  if (field.type === 'Boolean') {
    return value ? 'Yes' : 'No'
  }
  
  if (field.type === 'Json') {
    return JSON.stringify(value)
  }
  
  return String(value)
}
