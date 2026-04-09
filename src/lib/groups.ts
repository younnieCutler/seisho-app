import { supabase, authReady } from './supabase'
import { getUserId } from './storage'

export async function createGroup(): Promise<string> {
  await authReady
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data: code, error: rpcError } = await supabase.rpc('generate_group_code')
  if (rpcError) throw new Error(rpcError.message)

  const { error: groupError } = await supabase
    .from('groups')
    .insert({ group_code: code, created_by: userId })
  if (groupError) throw new Error(groupError.message)

  const { error: memberError } = await supabase
    .from('member_status')
    .insert({ user_id: userId, group_code: code })
  if (memberError) throw new Error(memberError.message)

  return code as string
}

export async function joinGroup(code: string): Promise<void> {
  await authReady
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')

  const upperCode = code.toUpperCase()

  const { data, error } = await supabase
    .from('groups')
    .select('group_code')
    .eq('group_code', upperCode)
    .single()
  if (error || !data) throw new Error('GROUP_NOT_FOUND')

  const { data: existing } = await supabase
    .from('member_status')
    .select('id')
    .eq('user_id', userId)
    .eq('group_code', upperCode)
    .maybeSingle()
  if (existing) throw new Error('ALREADY_MEMBER')

  const { error: insertError } = await supabase
    .from('member_status')
    .insert({ user_id: userId, group_code: upperCode })
  if (insertError) throw new Error(insertError.message)
}

export async function leaveGroup(code: string): Promise<void> {
  await authReady
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('member_status')
    .delete()
    .eq('user_id', userId)
    .eq('group_code', code)
  if (error) throw new Error(error.message)
}

export async function getMyGroups(): Promise<string[]> {
  await authReady
  const userId = getUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('member_status')
    .select('group_code')
    .eq('user_id', userId)
  if (error || !data) return []

  return data.map((row: { group_code: string }) => row.group_code)
}
