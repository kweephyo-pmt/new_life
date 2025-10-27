import { NextRequest } from 'next/server'
import { updateTrip } from '@/lib/trips-storage'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { imageUrl, userId } = body
    
    console.log(`Updating trip ${id} with imageUrl:`, imageUrl)
    
    if (!imageUrl) {
      return Response.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 })
    }

    // Update with userId for Firestore security rules
    const success = await updateTrip(id, userId, { imageUrl })
    
    console.log(`Update success for trip ${id}:`, success)
    
    if (success) {
      return Response.json({ success: true, imageUrl })
    } else {
      return Response.json({ error: 'Failed to update trip' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating trip:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
