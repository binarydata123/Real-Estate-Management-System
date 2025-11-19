/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface MessageViewProps {
  selectedCandidate: string | null;
  setSelectedCandidate: (candidate: string | null) => void;
  selectedApplication: string | null;
  setSelectedApplication: (application: string | null) => void;
  applicants: any[];
  setApplicants: (applicants: any[]) => void;
  selectedJobId: string | null;
  setSelectedJobId: (jobId: string | null) => void;
  showJobDetail: boolean;
  setShowJobDetail: (show: boolean) => void;
  showEditForm: boolean;
  setShowEditForm: (show: boolean) => void;
}

export interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoadingConversations: boolean;
  error: any;
  isArchiveMode: boolean;
  setIsArchiveMode: (mode: boolean) => void;
  isTrashMode: boolean;
  setIsTrashMode: (mode: boolean) => void;
  isBlockMode: boolean;
  setIsBlockMode: (mode: boolean) => void;
  archiveCount: number;
  deletedCount: number;
  blockedCount: number;
  fetchConversations: () => void;
  fetchArchivedConversations: () => void;
  fetchDeletedConversations: () => void;
  fetchBlockedConversations: () => void;
  showConversationList: boolean;
  setShowConversationList: (show: boolean) => void;
  handleViewCandidate: (candidateId: string, applicationId?: string) => void;
}