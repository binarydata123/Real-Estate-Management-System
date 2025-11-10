export interface Conversation {
    _id: string;
    participants: string[];
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: Record<string, number>;
    archivedBy?: string[];
    deletedBy?: string[];
    blockedBy?: string[];
    otherParticipant: {
      _id: string;
      name: string;
      role: string;
      position?: string;
      avatar?: string;
      email?: string;
      phone?: string;
      status?: string;
      application?: {
        _id: string;
        jobId: string;
        jobTitle: string;
        status: string;
      };
    } | null;
  }
  
  export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    attachments?: any[];
    isRead: boolean;
    readAt?: string;
    createdAt: string;
  }
  
  export interface MessagesCenterProps {}
  
  export interface ConversationsListProps {
    conversations: Conversation[];
    selectedConversation: string | null;
    searchTerm: string;
    isLoading: boolean;
    error: string | null;
    isArchiveMode: boolean;
    isTrashMode: boolean;
    isBlockMode: boolean;
    archiveCount: number;
    deletedCount: number;
    blockedCount: number;
    showConversationList: boolean;
    onSearchChange: (term: string) => void;
    onConversationSelect: (id: string) => void;
    onFetchConversations: () => void;
    onFetchArchived: () => void;
    onFetchDeleted: () => void;
    onFetchBlocked: () => void;
    onSetArchiveMode: (mode: boolean) => void;
    onSetTrashMode: (mode: boolean) => void;
    onSetBlockMode: (mode: boolean) => void;
    onSetShowConversationList: (show: boolean) => void;
    customers?: CustomerFormData[]; 
  }
  
  export interface MessageThreadProps {
    selectedConversation: Conversation | undefined;
    messages: Message[];
    newMessage: string;
    selectedFile: File | null;
    filePreview: string | null;
    isLoadingMessages: boolean;
    isSendingMessage: boolean;
    isArchiveMode: boolean;
    isTrashMode: boolean;
    isBlockMode: boolean;
    allowMessage: boolean;
    anotherUserAllowMessage: boolean;
    showProfile: boolean;
    showConversationList: boolean;
    onMessageChange: (message: string) => void;
    onFileSelected: (file: File | null) => void;
    onSendMessage: () => void;
    onSetShowConversationList: (show: boolean) => void;
    onViewCompany: (companyId: string) => void;
    onArchiveConversation: (id: string) => void;
    onUnarchiveConversation: (id: string) => void;
    onBlockConversation: (id: string) => void;
    onUnblockConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    onRestoreConversation: (id: string) => void;
  }