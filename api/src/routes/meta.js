import express from 'express'
import { Prisma } from '@prisma/client'

const router = express.Router()

// Helper to safely access DMMF 
function getDMMF() {
  try {
    if (Prisma?.dmmf?.datamodel) {
      console.log('✅ Using Prisma.dmmf.datamodel')
      return Prisma.dmmf.datamodel
    }
    throw new Error('DMMF not available')
  } catch (error) {
    console.error('❌ DMMF access failed:', error.message)
    throw new Error('DMMF not accessible - check Prisma setup')
  }
}

// Normalize DMMF data into stable format
function normalizeModels(datamodel) {
  const enums = Object.fromEntries(
    datamodel.enums?.map(e => [e.name, e.values?.map(v => v.name) || []]) || []
  )

  const models = datamodel.models?.map(model => ({
    name: model.name,
    dbName: model.dbName || model.name,
    fields: model.fields?.map(field => ({
      name: field.name,
      kind: field.kind, // 'scalar' | 'object' | 'enum'
      type: field.type,
      isRequired: field.isRequired || false,
      isList: field.isList || false,
      isId: field.isId || false,
      isUnique: field.isUnique || false,
      isReadOnly: field.isReadOnly || false,
      isUpdatedAt: field.isUpdatedAt || false,
      hasDefaultValue: field.hasDefaultValue || false,
      default: field.default || null,
      enumValues: field.kind === 'enum' ? (enums[field.type] || []) : [],
      relation: field.kind === 'object' ? {
        name: field.relationName || null,
        to: field.type,
        fromFields: field.relationFromFields || [],
        toFields: field.relationToFields || []
      } : null
    })) || []
  })) || []

  return { models, enums }
}

// GET /api/meta/models - list all models
router.get('/models', (req, res) => {
  try {
    const datamodel = getDMMF()
    const { models } = normalizeModels(datamodel)
    
    console.log(`📊 Found ${models.length} models:`, models.map(m => m.name))
    
    const modelList = models.map(m => ({
      name: m.name,
      dbName: m.dbName,
      fieldCount: m.fields.length,
      scalarFields: m.fields.filter(f => f.kind === 'scalar').length,
      relationFields: m.fields.filter(f => f.kind === 'object').length,
      enumFields: m.fields.filter(f => f.kind === 'enum').length
    }))
    
    res.json(modelList)
  } catch (error) {
    console.error('❌ Meta models error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/meta/models/:name - detailed model info
router.get('/models/:name', (req, res) => {
  try {
    const datamodel = getDMMF()
    const { models, enums } = normalizeModels(datamodel)
    
    const modelName = req.params.name
    console.log(`🔍 Looking for model: "${modelName}"`)
    console.log(`📝 Available models:`, models.map(m => m.name))
    
    // Try exact match first, then case-insensitive
    const model = models.find(m => m.name === modelName) || 
                  models.find(m => m.name.toLowerCase() === modelName.toLowerCase())
    
    if (!model) {
      console.log(`❌ Model "${modelName}" not found`)
      return res.status(404).json({ 
        error: `Model "${modelName}" not found`,
        availableModels: models.map(m => m.name)
      })
    }
    
    console.log(`✅ Found model: "${model.name}" with ${model.fields.length} fields`)
    res.json({ ...model, enums })
  } catch (error) {
    console.error('❌ Meta model error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
