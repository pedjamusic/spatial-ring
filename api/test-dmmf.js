import prisma from './src/lib/prisma.js'

async function testDMMF() {
  console.log('Testing DMMF access...')
  
  try {
    const { Prisma } = await import('@prisma/client')
    console.log('Prisma imported successfully')
    console.log('Prisma.dmmf exists:', !!Prisma.dmmf)
    console.log('Prisma.dmmf.datamodel exists:', !!Prisma.dmmf?.datamodel)
    
    if (Prisma.dmmf?.datamodel) {
      console.log('Models found:', Prisma.dmmf.datamodel.models.map(m => m.name))
    }
  } catch (e) {
    console.error('Prisma import failed:', e.message)
  }

  try {
    console.log('prisma._dmmf exists:', !!prisma._dmmf)
    console.log('prisma._dmmf.datamodel exists:', !!prisma._dmmf?.datamodel)
    
    if (prisma._dmmf?.datamodel) {
      console.log('Models from prisma._dmmf:', prisma._dmmf.datamodel.models.map(m => m.name))
    }
  } catch (e) {
    console.error('prisma._dmmf access failed:', e.message)
  }
}

testDMMF()
