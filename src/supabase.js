import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sarqjdjaqtlwhnehrqwt.supabase.co'
const supabaseKey = 'sb_publishable_pzPod_AkELoPV9R83eynUA_S53bvWG'

export const supabase = createClient(supabaseUrl, supabaseKey)