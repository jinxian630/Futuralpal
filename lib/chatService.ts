import { supabase, Message, Chat } from './supabaseClient'

export const saveMessage = async (userId: string, chatId: string, role: 'user' | 'agent', content: string): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        chat_id: chatId,
        role,
        content
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save message:', error.message)
      throw new Error(`Failed to save message: ${error.message}`)
    }

    console.log(`${role} message saved:`, data)
    return data
  } catch (error) {
    console.error('Error in saveMessage:', error)
    return null
  }
}

export const getMessagesByChatId = async (chatId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to load messages:', error.message)
      throw new Error(`Failed to load messages: ${error.message}`)
    }

    console.log('Loaded messages for chat:', chatId, data)
    return data || []
  } catch (error) {
    console.error('Error in getMessagesByChatId:', error)
    return []
  }
}

export const createNewChat = async (userId: string, title?: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        title: title || 'New Chat'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create chat:', error.message)
      throw new Error(`Failed to create chat: ${error.message}`)
    }

    console.log('New chat created:', data)
    return data.id
  } catch (error) {
    console.error('Error in createNewChat:', error)
    return null
  }
}

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load chats:', error.message)
      throw new Error(`Failed to load chats: ${error.message}`)
    }

    console.log('Loaded user chats:', data)
    return data || []
  } catch (error) {
    console.error('Error in getUserChats:', error)
    return []
  }
}

export const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)

    if (error) {
      console.error('Failed to update chat title:', error.message)
      return false
    }

    console.log('Chat title updated:', chatId, title)
    return true
  } catch (error) {
    console.error('Error in updateChatTitle:', error)
    return false
  }
}

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    // Delete messages first
    await supabase.from('messages').delete().eq('chat_id', chatId)
    
    // Then delete the chat
    const { error } = await supabase.from('chats').delete().eq('id', chatId)

    if (error) {
      console.error('Failed to delete chat:', error.message)
      return false
    }

    console.log('Chat deleted:', chatId)
    return true
  } catch (error) {
    console.error('Error in deleteChat:', error)
    return false
  }
}

export const verifyChatConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('chats').select('count', { count: 'exact', head: true })

    if (error) {
      console.error('Chat connection verification failed:', error.message)
      return false
    }

    console.log('Chat connection verified')
    return true
  } catch (error) {
    console.error('Error verifying chat connection:', error)
    return false
  }
}