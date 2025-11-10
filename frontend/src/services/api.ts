import { SubscriptionPlan } from "./types";
export type CandidateVideoType =
  | "aboutMe"
  | "education"
  | "skillsExperience"
  | null;

interface ApiResponse {
  status: number;
  data?: any;
  error?: string;
  success: boolean;
  message?: string;
}
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface GetCandidateVideosParams {
  candidateId: string;
}

export interface CandidateVideoData {
  original: string;
  segmentsFolder?: string;
  hlsPlaylist?: string;
  duration?: number;
  [key: string]: any;
}

// ----------------------
// Candidate Video Interfaces
// ----------------------

// ✅ Base
interface BaseResponse {
  success: boolean;
  status: number;
  error?: string;
}

// ✅ For JSON APIs
export interface JsonResponse<T = any> extends BaseResponse {
  data?: T;
}

// ✅ For Blob (binary files, thumbnails, etc.)
export interface BlobResponse extends BaseResponse {
  data?: Blob;
}

// ✅ For plain text responses
export interface TextResponse extends BaseResponse {
  data?: string;
}
export interface UploadCandidateVideoParams {
  candidateId: string;
  type: CandidateVideoType;
  file: File;
}

export interface DeleteCandidateVideoParams {
  candidateId: string;
  type: CandidateVideoType;
}

export interface GetCandidateVideoThumbnailParams {
  candidateId: string;
  type: CandidateVideoType;
}

export interface StreamCandidateVideoParams {
  candidateId: string;
  type: CandidateVideoType;
}

interface SignupStep1Data {
  role: "candidate" | "company";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface SignupStep2Data {
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupStep3Data extends SignupStep1Data, SignupStep2Data {
  location: string;
  industry: string;
  jobTitle?: string;
  experience?: string;
  companyName?: string;
  companySize?: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

interface LoginData {
  email: string;
  password: string;
  role: "candidate" | "company" | "admin";
}

interface CompanyProfileData {
  companyName: string;
  tagline?: string;
  description?: string;
  industry?: string;
  companySize?: string;
  founded?: string;
  headquarter?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  benefits?: string[];
  values?: string[];
  offices?: Array<{
    city: string;
    address: string;
    employees: number;
  }>;
  userId?: string;
}

interface ApiImageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
interface UpdateNoteParams {
  applicationId: string;
  jobId: string;
  note: string;
  [key: string]: any; // for additional params
}

interface DiscoverPeopleParams {
  search?: string;
  location?: string;
  industry?: string;
  page?: number;
  limit?: number;
}

interface DeleteMentorRequestData {
  userId: string;
  userRole: string;
}
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/";
  }
  getBaseURL() {
    return this.baseURL;
  }

  // ✅ API request for public routes (no token required)
  private async publicRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    responseType: "json" | "blob" | "text" = "json"
  ): Promise<JsonResponse<T> | BlobResponse | TextResponse> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const isFormData = options.body instanceof FormData;

      const defaultHeaders: HeadersInit = {};
      if (!isFormData) defaultHeaders["Content-Type"] = "application/json";

      const config: RequestInit = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      };

      const response = await fetch(url, config);

      let data: any;
      if (responseType === "blob") data = await response.blob();
      else if (responseType === "text") data = await response.text();
      else data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? data : undefined,
        error: !response.ok ? data?.message || "Request failed" : undefined,
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: (error as Error).message || "Network error",
      };
    }
  }

  //For Video .........................................................
  private async apiRequest<T = any>(
    endpoint: string,
    options?: RequestInit,
    responseType?: "json"
  ): Promise<JsonResponse<T>>;
  private async apiRequest(
    endpoint: string,
    options: RequestInit,
    responseType: "blob"
  ): Promise<BlobResponse>;
  private async apiRequest(
    endpoint: string,
    options: RequestInit,
    responseType: "text"
  ): Promise<TextResponse>;
  private async apiRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    responseType: "json" | "blob" | "text" = "json"
  ): Promise<JsonResponse<T> | BlobResponse | TextResponse> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = localStorage.getItem("auth_token");
      const isFormData = options.body instanceof FormData;

      const defaultHeaders: HeadersInit = {};
      if (!isFormData) defaultHeaders["Content-Type"] = "application/json";
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

      const config: RequestInit = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      };

      const response = await fetch(url, config);

      let data: any;
      if (responseType === "blob") data = await response.blob();
      else if (responseType === "text") data = await response.text();
      else data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? data : undefined,
        error: !response.ok ? data?.message || "Request failed" : undefined,
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: (error as Error).message || "Network error",
      };
    }
  }
  // Till here ...................

  // ✅ Auth helper
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = localStorage.getItem("auth_token");
      //const storedApiKey = this.apiKey || localStorage.getItem("x_api_key");

      // if we're sending FormData, let the browser set Content-Type (with boundary)
      const isFormData = options.body instanceof FormData;

      const defaultHeaders: HeadersInit = {};
      if (!isFormData) {
        defaultHeaders["Content-Type"] = "application/json";
      }
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
      // if (storedApiKey) {
      //   defaultHeaders["x-api-key"] = storedApiKey;
      // }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      // if it's not JSON (e.g. a blob download) you’d handle that differently,
      // but for profile-photo uploads this is fine:
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error:
            data.error ||
            data.message ||
            `Request failed with status ${response.status}`,
        };
      }
      return {
        success: true,
        status: response.status,

        data,
      };
    } catch (error: any) {
      return {
        success: false,
        status: 500,
        error: error?.message || "Network error",
      };
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }

  // ✅ Store token & user
  // private storeAuthData(token: string, user: any) {
  //   localStorage.setItem("auth_token", token);
  //   localStorage.setItem("user", JSON.stringify(user));
  // }
  private storeAuthData(token: string, user: any, profile?: any) {
    const userWithExtra = {
      ...user,
      ...(user.role === "company" && profile?.companyName
        ? { companyName: profile.companyName }
        : {}),
      ...(user.role === "company" && profile?.industry
        ? { industry: profile.industry }
        : {}),
      ...(user.role === "candidate" && profile?.location
        ? { location: profile.location }
        : {}),
    };

    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(userWithExtra));
  }

  // ✅ Clear token & user
  clearAuthData() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  // ✅ Auth APIs
  async signupStep1(data: SignupStep1Data): Promise<ApiResponse> {
    return this.makeRequest("/auth/signup/step1", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async signupStep2(data: SignupStep2Data): Promise<ApiResponse> {
    return this.makeRequest("/auth/signup/step2", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async signupStep3(data: SignupStep3Data): Promise<ApiResponse> {
    const response = await this.makeRequest("/auth/signup/step3", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const innerData = response.data?.data;
    if (response.success && innerData?.token && innerData?.user) {
      this.storeAuthData(
        innerData.token,
        innerData.user,
        innerData.adminSetting
      );
    }
    return response;
  }

  async login(data: LoginData): Promise<ApiResponse> {
    const response = await this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const innerData = response.data?.data;
    if (response.success && innerData?.token && innerData?.user) {
      // ✅ Pass profile here too
      this.storeAuthData(innerData.token, innerData.user, innerData.profile);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    this.clearAuthData();
    return {
      success: true,
    };
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.makeRequest("/auth/me");
  }

  // Optional
  async register(userData: any): Promise<ApiResponse> {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // ✅ Profile APIs
  async getUserProfile(): Promise<ApiResponse> {
    return this.makeRequest("/users/profile");
  }
  async getUserProfileById(body: any): Promise<ApiResponse> {
    return this.makeRequest("/users/profileById", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
  // async updateUserSettings():
  async updateUserSettings(profileData: any): Promise<ApiResponse> {
    return this.makeRequest("/users/settings", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async getUserStats(): Promise<ApiResponse> {
    return this.makeRequest("/users/stats");
  }

  // ✅ Job APIs
  async getJobs(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/jobs?${queryParams}`);
  }

  async getJobById(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${id}`);
  }

  async createJob(jobData: any): Promise<ApiResponse> {
    return this.makeRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }
  async copyJob(jobId: any): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${jobId}/copy-job`, {
      method: "POST",
    });
  }

  async updateJob(id: string, jobData: any): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    });
  }
  async getUserSettings(): Promise<ApiResponse> {
    return this.makeRequest("/users/settings", {
      method: "GET",
    });
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${id}`, {
      method: "DELETE",
    });
  }

  // ✅ Company Search
  async searchCompanies(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/companies/search?${queryParams}`);
  }

  // ✅ Applications
  async applyToJob(jobId: string, applicationData: any): Promise<ApiResponse> {
    return this.makeRequest("/applications", {
      method: "POST",
      body: JSON.stringify({ jobId, ...applicationData }),
    });
  }

  async getApplications(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/applications?${queryParams}`);
  }

  // ✅ Messages
  async getMessages(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/messages?${queryParams}`);
  }

  async sendMessage(
    conversationId: string,
    messageData: any
  ): Promise<ApiResponse> {
    return this.makeRequest(`/messages/conversations/${conversationId}`, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }
  // ✅ Candidates
  async getCandidates(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/candidates?${queryParams}`);
  }

  async getCandidateById(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/candidates/${id}`);
  }

  // ✅ Interviews

  async getInterviews(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/interviews?${queryParams}`);
  }

  async scheduleInterview(interviewData: any): Promise<ApiResponse> {
    return this.makeRequest("/interviews", {
      method: "POST",
      body: JSON.stringify(interviewData),
    });
  }

  async updateInterview(id: string, interviewData: any): Promise<ApiResponse> {
    return this.makeRequest(`/interviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(interviewData),
    });
  }

  // ✅ Notifications
  async getNotifications(): Promise<ApiResponse> {
    return this.makeRequest("/notifications");
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  async markAllAsRead(): Promise<ApiResponse> {
    return this.makeRequest(`/notifications/read-all`, {
      method: "PUT",
    });
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/notifications/${id}`, {
      method: "DELETE",
    });
  }

  async updateCompanyDetails(data: CompanyProfileData): Promise<ApiResponse> {
    return this.makeRequest("/profiles/company/details", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateCandidateExperience(experience: any[]): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/experience", {
      method: "PUT",
      body: JSON.stringify({ experience }),
    });
  }

  async updateCandidateSkills(skills: any[]): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/skills", {
      method: "PUT",
      body: JSON.stringify({ skills }),
    });
  }

  async updateCandidateAwards(awards: any[]): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/update-awards", {
      method: "PUT",
      body: JSON.stringify({ awards }),
    });
  }

  async addCandidateAwards(award: any): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/add-awards", {
      method: "POST",
      body: JSON.stringify(award), // Send the award object directly
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async deleteCandidateAward(awardId: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/candidate/awards/${awardId}`, {
      method: "DELETE",
      // body: JSON.stringify({ awardId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async updateCandidateCertifications(
    certifications: any[]
  ): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/certifications", {
      method: "PUT",
      body: JSON.stringify({ certifications }),
    });
  }

  async updateCandidateLanguages(languages: any[]): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/languages", {
      method: "PUT",
      body: JSON.stringify({ languages }),
    });
  }

  async updateCandidateSocialLinks(socialLinks: any): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/social-links", {
      method: "PUT",
      body: JSON.stringify({ socialLinks }),
    });
  }

  async getAllJobs(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/jobs?${queryParams}`);
  }

  async getSearchFilterJobs(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/jobs/search-filter?${queryParams}`);
  }

  async reportContent(
    contentType: "company" | "job" | "user" | "message",
    contentId: string,
    reportData: {
      reason: string;
      priority?: string;
      description?: string;
    }
  ): Promise<ApiResponse> {
    return this.makeRequest("/jobs/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entityType: contentType,
        entityId: contentId,
        ...reportData,
      }),
    });
  }

  async getAppliedJobsByUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/applications/by-user/${userId}`);
  }

  async updateJobStatus(id: string, status: string): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getCompanyProfile(id: string, viewerId?: string): Promise<any> {
    const url = viewerId
      ? `/profiles/company/${id}?viewerId=${viewerId}`
      : `/profiles/company/${id}`;

    try {
      const response = await this.makeRequest(url);
      if (response && response.success !== undefined) {
        return response;
      } else if (
        response &&
        response.data &&
        response.data.success !== undefined
      ) {
        return response.data;
      } else {
        return {
          success: false,
          message: "Invalid response format from server",
          data: null,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Request failed",
        data: null,
      };
    }
  }

  async applyForJob(jobId: string, data: any): Promise<ApiResponse> {
    return this.makeRequest(`/applications/${jobId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getProfileCompletion(): Promise<ApiResponse> {
    return this.makeRequest("/profiles/completion", {
      method: "GET",
    });
  }

  async generateCandidateResume(
    templateId: string,
    options: any
  ): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/resume/generate", {
      method: "POST",
      body: JSON.stringify({ templateId, options }),
    });
  }

  async generateCandidateResumeForDownload(
    templateId: string,
    options: any
  ): Promise<ApiResponse> {
    return this.makeRequest(`/resume/${templateId}-generate-resume`, {
      method: "POST",
      body: JSON.stringify({ userData: options }), // assuming you're sending `userData` like your other implementation
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  async generateAndDownloadResume(templateId: string, options: any) {
    try {
      const token = localStorage.getItem("auth_token");
      const profileResponse = await apiService.getUserProfile();
      if (!profileResponse.success) {
        throw new Error("Failed to fetch user profile");
      }
      const { user, profile } = profileResponse.data.data;

      // Merge all data: user info, profile info, and any custom options (like fontSize, colorTheme, etc.)
      const userData = {
        ...user,
        ...profile,
        ...options,
      };
      const response = await fetch(
        `${this.baseURL}/resume/${templateId}-generate-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ userData }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const pdfBlob = await response.blob();

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  }

  async getApplicationDetails(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/applications/${id}`);
  }

  async getCompanyApplications(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(`/applications/company?${queryParams}`);
  }

  async updateCandidateEducation(education: any[]): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/education", {
      method: "PUT",
      body: JSON.stringify({ education }),
    });
  }

  getCandidateProfile = async (
    candidateId: string,
    jobId?: string,
    applicationId?: string,
    viewerId?: string
  ) => {
    let url = `/profiles/candidate/${candidateId}`;

    const queryParams: string[] = [];
    if (jobId) queryParams.push(`jobId=${jobId}`);
    if (applicationId) queryParams.push(`applicationId=${applicationId}`);
    if (viewerId) queryParams.push(`viewerId=${viewerId}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    return this.makeRequest(url);
  };

  async updateApplicationStatus(
    id: string,
    status: string
  ): Promise<ApiResponse> {
    return this.makeRequest(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getCandidateResumeByID(candidateId: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/candidate/resumes/${candidateId}`);
  }

  async searchCandidates(params: any = {}): Promise<ApiResponse> {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/profiles/candidate/search?${query}`
      : `/profiles/candidate/search`;
    return this.makeRequest(url);
  }

  async getConversations(params?: {
    archived?: boolean;
    deleted?: boolean;
    blocked?: boolean;
  }): Promise<ApiResponse> {
    const queryParams: string[] = [];

    if (params?.archived) queryParams.push("archived=true");
    if (params?.deleted) queryParams.push("deleted=true");
    if (params?.blocked) queryParams.push("blocked=true");

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

    return this.makeRequest(`/agent/messages/conversations${queryString}`);
  }

  async getConversationMessages(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/agent/messages/conversations/${conversationId}`);
  }

  async startConversation(receiverId: string, body: any): Promise<ApiResponse> {
    return this.makeRequest(`/agent/messages/conversations`, {
      method: "POST",
      body: JSON.stringify({ receiverId, ...body }),
      headers: { "Content-Type": "application/json" },
    });
  }

  async markConversationAsRead(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/agent/messages/conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
  }

  async archiveConversation(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/agent/messages/conversations/${conversationId}/archive`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async unArchiveConversation(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/agent/messages/conversations/${conversationId}/unarchive`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async restoreConversation(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/agent/messages/conversations/${conversationId}/restore`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/agent/messages/conversations/${conversationId}/delete`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async blockConversation(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/agent/messages/conversations/${conversationId}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
  }

  async unblockConversation(conversationId: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/agent/messages/conversations/${conversationId}/unblock`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // ✅ CORRECT
  async getallCandidates(params: any): Promise<ApiResponse> {
    return this.makeRequest(`/candidates/all-candidate`, {
      method: "POST",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // ✅ CORRECT
  async getallCandidatesWithAdvancedSearch(params: any): Promise<ApiResponse> {
    return this.makeRequest(`/candidates/all-candidate/advanced-search`, {
      method: "POST",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getStatsByUserId(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/stats/${userId}`);
  }

  async getCompanyProfileStats(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/company/stats/${id}`);
  }

  async getBadgeNotifications(): Promise<ApiResponse> {
    return this.makeRequest("/notifications/badge-count");
  }
  async getCandidateResumeHistory(): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/resume/history");
  }
  // services/api.ts
  async deleteResume(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/resume/delete/${id}`, {
      method: "DELETE",
    });
  }

  //Dashboard Routes
  async getDashboardStats(): Promise<ApiResponse> {
    return this.makeRequest("/admin/stats", {
      method: "GET",
    });
  }

  async getCandidatesDetail(
    params: Record<string, any> = {}
  ): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/admin/candidates${queryParams}`, {
      method: "GET",
    });
  }

  async getMentorsDetail(
    params: Record<string, any> = {}
  ): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/admin/mentors${queryParams}`, {
      method: "GET",
    });
  }

  async getCompaniesDetail(
    params: Record<string, any> = {}
  ): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/admin/companies${queryParams}`, {
      method: "GET",
    });
  }

  async getJobsDetails(params: Record<string, any> = {}): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/admin/jobs${queryParams}`, {
      method: "GET",
    });
  }

  async getJobsStats(): Promise<ApiResponse> {
    return this.makeRequest("/admin/job-stats", {
      method: "GET",
    });
  }

  async getCompanyStats(): Promise<ApiResponse> {
    return this.makeRequest("/admin/company-stats", {
      method: "GET",
    });
  }

  async getCompanyDetail(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/company/${id}`, {
      method: "GET",
    });
  }

  async getSingleCompanyDetail(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/edit-company/${id}`, {
      method: "GET",
    });
  }

  async updateSingleCompanyDetails(
    data: CompanyProfileData
  ): Promise<ApiResponse> {
    return this.makeRequest(`/admin/update-company/${data.userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateJobDetails(id: string, jobData: any): Promise<ApiResponse> {
    return this.makeRequest(`/admin/update-job/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    });
  }

  async getSingleJobDetail(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/job/${id}`, {
      method: "GET",
    });
  }

  async getJobApplicants(
    id: string,
    queryParams: { status?: string; search?: string } = {}
  ): Promise<ApiResponse> {
    const query = new URLSearchParams(queryParams).toString();
    const url = `/admin/job-applicants/${id}${query ? `?${query}` : ""}`;

    return this.makeRequest(url, {
      method: "GET",
    });
  }

  async searchFilterCandidates(params: any = {}): Promise<ApiResponse> {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/candidates/search-all-candidate?${query}`
      : `/candidates/get-all-candidate`;
    return this.makeRequest(url);
  }

  async emailVerification(data: SignupStep1Data): Promise<ApiResponse> {
    return this.makeRequest("/auth/email-verification", {
      method: "post",
      body: JSON.stringify(data),
    });
  }
  // twoFaVerification method
  async twoFaVerification(data: SignupStep1Data): Promise<ApiResponse> {
    const response = await this.makeRequest("/auth/2fa-verify", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const innerData = response.data?.data;
    if (response.success && innerData?.token && innerData?.user) {
      this.storeAuthData(innerData.token, innerData.user, innerData.profile);
    }

    return response;
  }
  async updateUserProfilePhoto(
    id: string,
    imageFile: File
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);

    return this.makeRequest(`/candidates/${id}/profile-photo`, {
      method: "PATCH",
      body: formData,
    });
  }
  async getProfilePhoto(
    userId: string
  ): Promise<ApiImageResponse<{ urls: Record<string, string> }>> {
    // calls your backend GET /api/candidates/:userId/profile-photo
    return this.makeRequest(`/candidates/${userId}/profile-photo`);
  }
  async deleteProfilePhoto(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/candidates/${userId}/profile-photo`, {
      method: "DELETE",
    });
  }

  async updateAudioMuteSetting(
    userId: string,
    audioMessageMuted: boolean
  ): Promise<ApiResponse> {
    return this.makeRequest(`/users/${userId}/audio-mute`, {
      method: "PUT",
      body: JSON.stringify({ audioMessageMuted }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getOverviewStats(dateRange: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/overview?dateRange=${dateRange}`);
  }

  async getUserGrowthTrends(dateRange: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/user-growth?dateRange=${dateRange}`);
  }

  async getDetailedMetrics(
    metricType: string,
    dateRange: string
  ): Promise<ApiResponse> {
    return this.makeRequest(
      `/admin/detailed/${metricType}?dateRange=${dateRange}`
    );
  }

  async getLocationDistribution(dateRange: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/admin/location-distribution?dateRange=${dateRange}`
    );
  }

  // Upload company logo
  async updateCompanyLogo(
    userId: string,
    imageFile: File
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", imageFile); // Use "file" since multer expects that

    return this.makeRequest(`/profiles/company/${userId}/logo`, {
      method: "POST",
      body: formData,
    });
  }

  // Delete company logo
  async deleteCompanyLogo(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/company/${userId}/logo`, {
      method: "DELETE",
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.makeRequest("/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetToken(token: string): Promise<ApiResponse> {
    return this.makeRequest("/users/verify-reset-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async resendVerificationEmail(data: { email: string }): Promise<ApiResponse> {
    return this.makeRequest("/auth/resend-otp", {
      method: "post",
      body: JSON.stringify(data),
    });
  }
  async setResumeAsDefault(resumeId: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/profiles/candidate/resume/set-default/${resumeId}`,
      {
        method: "PUT",
      }
    );
  }
  async unsetResumeDefault(resumeId: string): Promise<ApiResponse> {
    return this.makeRequest(
      `/profiles/candidate/resume/unset-default/${resumeId}`,
      {
        method: "PUT",
      }
    );
  }
  async getDefaultResume(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/resume/default/${userId}`, {
      method: "GET",
    });
  }

  // Suspend company
  async suspendCompany(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/suspend-company/${id}`, {
      method: "DELETE",
    });
  }

  // Restore company
  async restoreCompany(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/restore-company/${id}`, {
      method: "PATCH",
    });
  }

  // Verify company
  async verifyCompany(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/verify-company/${id}`, {
      method: "PATCH",
    });
  }

  async askAi(
    question: string,
    candidateData: any,
    jobData: any,
    companyData: any,
    resumeUrl?: string
  ): Promise<ApiResponse> {
    return this.makeRequest(`/interviews/ask-ai`, {
      method: "POST",
      body: JSON.stringify({
        question,
        candidateData,
        jobData,
        companyData,
        resumeUrl, // ✅ Include resumeUrl in the request body
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async uploadResume(formData: FormData): Promise<ApiResponse> {
    return this.makeRequest(`/resume/upload-resume`, {
      method: "POST",
      body: formData,
    });
  }
  async candidateAiGeneration(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/candidate/ai-profile-generation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
  }

  // ADMIN
  async adminChatBot(message: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  }

  // CANDIDATE
  async candidateChatBot(message: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/candidate/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  }

  // COMPANY
  async companyChatBot(message: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/company/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  }

  // MENTOR
  async mentorChatBot(message: string): Promise<ApiResponse> {
    return this.makeRequest(`/profiles/mentor/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  }

  async updateCandidateTitleAndBio(
    title: string,
    bio: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/profiles/candidate/update-title-bio", {
      method: "PATCH",
      body: JSON.stringify({ title, bio }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  async getAllCompanies(): Promise<ApiResponse> {
    return this.makeRequest("/admin/all-companies", { method: "GET" });
  }

  async addCompany(data: any): Promise<ApiResponse> {
    const response = await this.makeRequest("/admin/add-company", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }

  async postJob(jobData: any): Promise<ApiResponse> {
    return this.makeRequest("/admin/post-job", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }

  async copyJobByAdmin(jobId: string, companyId: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/${jobId}/copy-job`, {
      method: "POST",
      body: JSON.stringify({ companyId }), // Company ID body mein bhejo
    });
  }

  async closeJobPosition(id: string, status: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/update-job-status/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }
  async generateCompanyDescriptionAI(userId: string): Promise<ApiResponse> {
    return this.makeRequest("/profiles/company/ai-generate-description", {
      method: "POST",
      body: JSON.stringify({ userId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  async updateCompanyTaglineAndDescription(
    tagline: string,
    description: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/profiles/company/update-tagline-description", {
      method: "PATCH",
      body: JSON.stringify({ tagline, description }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getTopApplicant(jobId: string): Promise<ApiResponse> {
    return this.makeRequest(`/applications/top-applicants/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async analyzeTopApplicant(
    topCandidates: any,
    job: any,
    recruiterQuestion: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/profiles/company/ai-top-applicants-analysis", {
      method: "POST",
      body: JSON.stringify({ topCandidates, job, recruiterQuestion }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async inviteUsers(users: any[]): Promise<ApiResponse> {
    return this.makeRequest(`/invite/users`, {
      method: "POST",
      body: JSON.stringify({ users }), // needs to be wrapped in an object with "users"
    });
  }

  async allInvitedUsers(): Promise<ApiResponse> {
    return this.makeRequest(`/invite/all`, {
      method: "GET",
    });
  }

  async getInviteById(id: string): Promise<any> {
    return this.makeRequest(`/invite/${id}`, {
      method: "GET",
    });
  }

  async acceptInvitation(id: string, body: any): Promise<any> {
    return this.makeRequest(`/invite/accept/${id}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async resendinvite(id: string): Promise<any> {
    return this.makeRequest(`/invite/resend/${id}`, {
      method: "POST",
    });
  }

  async resendInviteAll(): Promise<any> {
    return this.makeRequest(`/invite/resend-all`, {
      method: "POST",
    });
  }

  async fetchCourseById(id: string): Promise<any> {
    return this.makeRequest(`/courses/${id}`, {
      method: "GET",
    });
  }
  async fetchStudentCourseById(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.makeRequest(
      `/courses/get-course-candidates/${id}?${query.toString()}`,
      {
        method: "GET",
      }
    );
  }

  async fetchCandidateDetailedCourseById(
    id: string,
    candidateId?: string
  ): Promise<any> {
    const query = candidateId ? `?candidateId=${candidateId}` : "";
    return this.makeRequest(`/user-course-records/${id}${query}`, {
      method: "GET",
    });
  }

  async toggleSaveJob(jobId: string): Promise<any> {
    return this.makeRequest(`/jobs/savedJobs/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Team Management APIs
  async getTeamMembers(): Promise<ApiResponse> {
    return this.makeRequest("/team/members");
  }

  async inviteTeamMember(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    message?: string;
  }): Promise<ApiResponse> {
    return this.makeRequest("/team/invite", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTeamMember(
    memberId: string,
    data: {
      name?: string;
      email?: string;
      role?: string;
      status?: string;
    }
  ): Promise<ApiResponse> {
    return this.makeRequest(`/team/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async removeTeamMember(memberId: string): Promise<ApiResponse> {
    return this.makeRequest(`/team/members/${memberId}`, {
      method: "DELETE",
    });
  }

  async resendInvitation(memberId: string): Promise<ApiResponse> {
    return this.makeRequest(`/team/members/${memberId}/resend-invite`, {
      method: "POST",
    });
  }

  async getTeamRoles(): Promise<ApiResponse> {
    return this.makeRequest("/team/roles");
  }

  async updateMemberPermissions(
    memberId: string,
    permissions: string[]
  ): Promise<ApiResponse> {
    return this.makeRequest(`/team/members/${memberId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    });
  }

  async getPermissions(): Promise<ApiResponse> {
    return this.makeRequest("/team/permissions");
  }

  async getCompanyNote(
    applicationId: string,
    jobId: string,
    params?: any
  ): Promise<ApiResponse> {
    const baseParams = { jobId, ...params };
    const queryParams = new URLSearchParams(baseParams).toString();
    return this.makeRequest(
      `/applications/${applicationId}/note?${queryParams}`
    );
  }

  async updateCompanyNote(params: UpdateNoteParams): Promise<ApiResponse> {
    return this.makeRequest(`/applications/${params.applicationId}/note`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: params.note,
        jobId: params.jobId,
        ...params.additionalParams,
      }),
    });
  }

  async getCompanyWebinars(
    companyId: string,
    status?: string
  ): Promise<ApiImageResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("companyId", companyId);
    if (status) queryParams.append("status", status);

    return this.makeRequest(
      `/webinar/company/webinars?${queryParams.toString()}`
    );
  }

  async getWebinarDetails(webinarId: string): Promise<ApiResponse> {
    return this.makeRequest(`/webinar/company/${webinarId}`);
  }

  async saveCourse(formData: FormData, id?: string): Promise<any> {
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/courses/${id}` : `/courses`;

    return this.makeRequest(endpoint, {
      method,
      body: formData,
    });
  }

  async saveCourseForAdmin(courseData: FormData, id?: string): Promise<any> {
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/admin/courses/${id}` : `/admin/courses`;

    return this.makeRequest(endpoint, {
      method,
      body: courseData,
      // Don't set Content-Type header - browser will set it with boundary automatically
    });
  }

  async addCourseByAdmin(courseData: any): Promise<any> {
    return this.makeRequest("/admin/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });
  }

  async getCoursesForAdmin(params?: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    createdBy?: string;
  }): Promise<ApiResponse> {
    const query = new URLSearchParams();

    if (params?.search) query.append("search", params.search);
    if (params?.status && params.status !== "all")
      query.append("status", params.status);
    if (params?.type && params.type !== "all")
      query.append("type", params.type);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.createdBy && params.createdBy !== "all")
      query.append("createdBy", params.createdBy);

    return this.makeRequest(`/admin/courses?${query.toString()}`);
  }

  async deleteCourseByAdmin(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/courses/${id}`, { method: "DELETE" }); // This was already correct
  }

  async getCourses(params?: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const queryString = queryParams.toString();
    const endpoint = `/courses${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest(endpoint, { method: "GET" });

    return {
      success: true,
      data: response,
    };
  }

  async fetchCoursesForCandidate(params?: {
    candidateId?: string;
    search?: string;
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.candidateId)
        queryParams.append("candidateId", params.candidateId);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.type) queryParams.append("type", params.type);
      if (params?.category) queryParams.append("category", params.category);
      if (params?.page !== undefined)
        queryParams.append("page", String(params.page));
      if (params?.limit !== undefined)
        queryParams.append("limit", String(params.limit));

      const queryString = queryParams.toString();
      const endpoint = `/courses/forCandidate${
        queryString ? `?${queryString}` : ""
      }`;

      return this.makeRequest(endpoint, { method: "GET" });
    } catch (error: any) {
      console.error("Failed to fetch courses:", error.message || error);
      return {
        success: false,
        error: error?.message || "An unexpected error occurred.",
      };
    }
  }

  // Create or update a user course record
  async createOrUpdateUserCourseRecord(payload: {
    userId: string;
    courseId: string;
    lastAccessedLesson?: number;
    videosCompleted?: number;
    questionsAnswered?: number;
    correctAnswers?: number;
    lessons?: any[];
    bookmarks?: number[];
    notes?: any[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return this.makeRequest("/user-course-records", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Failed to create/update record:", error.message || error);
      return { success: false, error: error?.message || "Unexpected error" };
    }
  }

  // Update progress for a specific lesson
  async updateLessonProgress(payload: {
    userId: string;
    courseId: string;
    lessonIndex: number;
    videosCompleted?: number;
    answers?: {
      questionText: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[];
    totalQuestions?: number;
    correctAnswers?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return this.makeRequest("/user-course-records/lesson", {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error(
        "Failed to update lesson progress:",
        error.message || error
      );
      return { success: false, error: error?.message || "Unexpected error" };
    }
  }

  // Add a note
  async addNote(payload: {
    userId: string;
    courseId: string;
    lessonIndex: number;
    text: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return this.makeRequest("/user-course-records/note", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Failed to add note:", error.message || error);
      return { success: false, error: error?.message || "Unexpected error" };
    }
  }

  async getCourseByCreator(
    userId: string,
    params: {
      searchTerm?: string;
      typeFilter?: string;
      statusFilter?: string;
      currentPage?: number;
      limit?: number;
    }
  ): Promise<any> {
    const query = new URLSearchParams();

    if (params?.searchTerm) query.append("search", params.searchTerm);
    if (params?.typeFilter) query.append("type", params.typeFilter);
    if (params?.statusFilter) query.append("status", params.statusFilter);
    if (params.limit !== undefined)
      query.append("limit", params.limit.toString());

    if (params?.currentPage !== undefined)
      query.append("page", params.currentPage.toString());

    return this.makeRequest(
      `/courses/get-courses-by-creator?userId=${userId}&${query.toString()}`,
      {
        method: "GET",
      }
    );
  }

  async deleteCourse(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/courses/${id}`, { method: "DELETE" });
  }

  async copyCourse(courseId: string, companyId: string): Promise<ApiResponse> {
    return this.makeRequest(`/courses/${courseId}/copy-course`, {
      method: "POST",
      body: JSON.stringify({ companyId }),
    });
  }

  async upload(formData: FormData): Promise<any> {
    const response = await this.makeRequest("/courses/upload", {
      method: "POST",
      body: formData,
    });
    return response.data; // Assuming the backend returns { success: true, url: '...' }
  }

  async getWebinarById(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/webinar/${id}`);
  }

  async getWebinarRegistrations(webinarId: string): Promise<ApiResponse> {
    return this.makeRequest(`/webinar/${webinarId}/registrations`);
  }

  async getMyRegistrations(): Promise<ApiResponse> {
    return this.makeRequest("/webinar/my-registrations");
  }

  async getWebinarAnalytics(): Promise<ApiResponse> {
    return this.makeRequest("/webinar/analytics");
  }

  async uploadKYCFile(
    files: File[],
    expectedName: string,
    userId: string
  ): Promise<ApiResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file)); // Matches multer.array('files')
    formData.append("expectedName", expectedName);
    formData.append("userId", userId);

    return this.makeRequest(`/candidates/verify-kyc`, {
      method: "POST",
      body: formData,
    });
  }

  async createPlan(planData: SubscriptionPlan): Promise<ApiResponse> {
    return this.makeRequest("/plans/create", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  }
  async updatePlan(
    planId: string,
    planData: Partial<SubscriptionPlan>
  ): Promise<ApiResponse> {
    return this.makeRequest(`/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(planData),
    });
  }

  async deletePlan(planId: string): Promise<ApiResponse> {
    return this.makeRequest(`/plans/${planId}`, {
      method: "DELETE",
    });
  }

  async updatePlanStatus(
    planId: string,
    isActive: boolean
  ): Promise<ApiResponse> {
    return this.makeRequest(`/plans/${planId}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
  }

  async updateSubscription(
    planId: string,
    planData: SubscriptionPlan
  ): Promise<ApiResponse> {
    return this.makeRequest(`/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(planData),
    });
  }

  async createSubscriptions(planData: SubscriptionPlan): Promise<ApiResponse> {
    return this.makeRequest("/subscriptions/create", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  }

  async getPlans(): Promise<ApiResponse> {
    return this.makeRequest("/plans", {
      method: "GET",
    });
  }

  async getAllPlans(
    featureType?: "candidate-features" | "mentor-features" | "company-features"
  ): Promise<ApiResponse> {
    // Build the URL with query param if featureType is provided
    let url = "/plans/all-plans";
    if (featureType) {
      url += `?featureType=${featureType}`;
    }
    return this.makeRequest(url, {
      method: "GET",
    });
  }

  async createCheckoutSession(planData: any): Promise<ApiResponse> {
    return this.makeRequest("/stripe/create-checkout-session", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  }

  async buySubscriptionPlan(planData: any): Promise<ApiResponse> {
    return this.makeRequest("/stripe/buy-subscription-plan", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  }

  // ✅ New methods for tokenConfigs
  async getTokenActions(): Promise<ApiResponse> {
    return this.makeRequest("/token-configs", { method: "GET" });
  }

  async updateTokenAction(
    id: string,
    payload: { tokensRequired: number; enabled: boolean }
  ): Promise<ApiResponse> {
    return this.makeRequest(`/token-configs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
  async addTokenAction(payload: {
    action: string;
    description: string;
    tokensRequired: number;
    enabled: boolean;
    role: "company" | "candidate" | "admin" | "mentor"; // enum matches controller
  }): Promise<ApiResponse> {
    return this.makeRequest(`/token-configs/add-token-config`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getTopCoursesPodcastsWebinars(): Promise<ApiResponse> {
    return this.makeRequest(`/candidates/top-courses-podcasts-webinars`);
  }
  //Mentor and Mentee APIs
  async getMentorProfile(): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/profile`);
  }

  async updateMentorProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest("/mentor/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async updateMentorExperience(experience: any[]): Promise<ApiResponse> {
    return this.makeRequest("/mentor/profile/experience", {
      method: "PUT",
      body: JSON.stringify({ experience }),
    });
  }

  async updateMentorEducation(education: any[]): Promise<ApiResponse> {
    return this.makeRequest("/mentor/profile/education", {
      method: "PUT",
      body: JSON.stringify({ education }),
    });
  }

  async updateMentorProfilePhoto(
    id: string,
    imageFile: File
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);

    return this.makeRequest(`/mentor/${id}/profile-photo`, {
      method: "PATCH",
      body: formData,
    });
  }

  async getMentorProfilePhoto(
    userId: string
  ): Promise<ApiImageResponse<{ urls: Record<string, string> }>> {
    return this.makeRequest(`/mentor/${userId}/profile-photo`);
  }

  async deleteMentorProfilePhoto(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/${userId}/profile-photo`, {
      method: "DELETE",
    });
  }

  async updateMentorCertifications(
    certifications: any[]
  ): Promise<ApiResponse> {
    return this.makeRequest("/mentor/profile/certifications", {
      method: "PUT",
      body: JSON.stringify({ certifications }),
    });
  }

  async updateMentorSkills(skills: any[]): Promise<ApiResponse> {
    return this.makeRequest("/mentor/profile/skills", {
      method: "PUT",
      body: JSON.stringify({ skills }),
    });
  }

  async updateMentorLanguages(languages: any[]): Promise<ApiResponse> {
    return this.makeRequest("/mentor/profile/languages", {
      method: "PUT",
      body: JSON.stringify({ languages }),
    });
  }

  async updateMentorSocialLinks(socialLinks: any): Promise<ApiResponse> {
    return this.makeRequest("/mentor/profile/social-links", {
      method: "PUT",
      body: JSON.stringify({ socialLinks }),
    });
  }

  async updateMentorAvailability(availability: any): Promise<ApiResponse> {
    // if availability.status true then send status in request else availability
    if (availability.status) {
      return this.makeRequest("/mentor/profile/availability", {
        method: "PUT",
        body: JSON.stringify({ status: availability.status }),
      });
    }
    return this.makeRequest("/mentor/profile/availability", {
      method: "PUT",
      body: JSON.stringify({ availability }),
    });
  }

  async getAllMentees(filters = {}): Promise<ApiResponse> {
    const queryParams =
      Object.keys(filters).length > 0
        ? `?${new URLSearchParams(filters).toString()}`
        : "";
    return this.makeRequest(`/mentor/mentees${queryParams}`, {
      method: "GET",
    });
  }

  async archiveMentee(menteeId: string): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/mentees/${menteeId}/archive`, {
      method: "PATCH",
    });
  }

  async getAllMenteesForSession(): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session/mentees`, {
      method: "GET",
    });
  }

  async CreateNewSession(payload: any): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session/create`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async rescheduleSession(payload: any): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session/reschedule`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async saveSessionFeedback(payload: any): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session/feedback`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async singleFeedback(sessionId: string): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session/feedback/${sessionId}`, {
      method: "GET",
    });
  }

  async singleMenteeFeedback(sessionId: string): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session/mentee-feedback/${sessionId}`, {
      method: "GET",
    });
  }

  async updateSessionStatus(data: any): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session/update-status`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAllSession(params: Record<string, any> = {}): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/mentor/sessions${queryParams}`, {
      method: "GET",
    });
  }

  async getAllMenteesFeedback(
    params: Record<string, any> = {}
  ): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/mentor/mentees-feedback${queryParams}`, {
      method: "GET",
    });
  }

  async getAllMentors(params: Record<string, any> = {}): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/mentor/mentors${queryParams}`, {
      method: "GET",
    });
  }

  async getAllMenteeSession(
    params: Record<string, any> = {}
  ): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/mentor/mentee-sessions${queryParams}`, {
      method: "GET",
    });
  }

  async createMenteeSessionFeedback(data: any): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/session-feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMentorProfileView(mentorId: string): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/profile/${mentorId}`, {
      method: "GET",
    });
  }

  async getCourseById(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/courses/${id}`, {
      method: "GET",
    });
  }

  async startCourseById(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/courses/learn/${id}`, {
      method: "GET",
    });
  }

  async submitMentorRequest(data: any): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/request`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserMentors(params: Record<string, any> = {}): Promise<ApiResponse> {
    const queryParams =
      Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : "";
    return this.makeRequest(`/mentor/connections${queryParams}`, {
      method: "GET",
    });
  }
  async deleteMentorRequest(
    requestId: string,
    data: DeleteMentorRequestData
  ): Promise<ApiResponse> {
    if (!requestId) {
      throw new Error("requestId is required to delete a mentor request");
    }
    if (!data.userId || !data.userRole) {
      throw new Error(
        "userId and userRole are required to delete a mentor request"
      );
    }

    return this.makeRequest(`/mentor/request/${requestId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async mentorDashboardStats(): Promise<ApiResponse> {
    return this.makeRequest(`/mentor/dashboard-stats`, {
      method: "GET",
    });
  }

  async toggleTokenStatus(id: string, enabled: boolean): Promise<ApiResponse> {
    return this.makeRequest(`/token-configs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: !enabled }),
    });
  }
  async deleteToken(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/token-configs/${id}`, {
      method: "DELETE",
    });
  }

  async getPaymentLogs(params?: Record<string, any>): Promise<ApiResponse> {
    let queryParams = "";

    if (params && typeof params === "object") {
      const filteredParams: Record<string, string> = {};

      for (const [key, value] of Object.entries(params)) {
        // Exclude null, undefined, empty strings, and NaN
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(typeof value === "number" && isNaN(value))
        ) {
          filteredParams[key] = String(value);
        }
      }

      const searchParams = new URLSearchParams(filteredParams).toString();
      if (searchParams) {
        queryParams = `?${searchParams}`;
      }
    }

    return this.makeRequest(`/payments/logs${queryParams}`, {
      method: "GET",
    });
  }

  async getCurrentSubscription(role: string): Promise<ApiResponse> {
    return this.makeRequest(`/subscriptions/current?role=${role}`, {
      method: "GET",
    });
  }

  async getTokenUsage(): Promise<ApiResponse> {
    return this.makeRequest(`/token-usage`, {
      method: "GET",
    });
  }

  async purchaseTokensWithSavedPayment(planData: any): Promise<ApiResponse> {
    return this.makeRequest("/stripe/purchase-tokens-default-payment", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  }

  async createTokenTopupSession(planData: any): Promise<ApiResponse> {
    return this.makeRequest("/stripe/create-topup-checkout-session", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  }

  async getTokenRate(): Promise<ApiResponse> {
    return this.makeRequest("/token-rate", {
      method: "GET",
    });
  }

  async updateTokenRate(data: any): Promise<ApiResponse> {
    return this.makeRequest("/token-rate", {
      method: "POST",
      body: data,
    });
  }

  async getAuditLogs(params?: any): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams(params).toString() : "";
    return this.makeRequest(
      `/audit-logs${queryParams ? `?${queryParams}` : ""}`,
      {
        method: "GET",
      }
    );
  }

  async getAllSubscribedUsers(): Promise<ApiResponse> {
    return this.makeRequest("/subscriptions/subscribed-users", {
      method: "GET",
    });
  }

  // async manualTokenTopup(data: any): Promise<ApiResponse> {
  //   return this.makeRequest("/subscriptions/manual-token-topup", {
  //     method: "POST",
  //     body: data,
  //   });
  // }
  async manualTokenTopup(data: any): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest(
        "/subscriptions/manual-token-topup",
        {
          method: "POST",
          body: data,
        }
      );
      return response; // ✅ success case
    } catch (error: any) {
      console.error("Manual token top-up failed:", error);

      const backendErrorMessage =
        error?.response?.data?.error || // Stripe-style or Express error
        error?.data?.error || // direct data object
        error?.message || // normal message
        "An error occurred while processing token top-up";
      // ✅ Add missing status
      return { success: false, error: backendErrorMessage, status: 400 };
    }
  }

  async getTokenTransactions(): Promise<ApiResponse> {
    return this.makeRequest("/token-usage/transactions", {
      method: "GET",
    });
  }

  // async getTokenManagementData(): Promise<ApiResponse> {
  //   return this.makeRequest("/token-usage/management", {
  //     method: "GET",
  //   });
  // }
  async getTokenManagementData(role: string): Promise<ApiResponse> {
    return this.makeRequest(`/token-usage/management?role=${role}`, {
      method: "GET",
    });
  }

  // Automatically pass featureType
  async getAllTokenManagementData(
    featureType?: "candidate-features" | "mentor-features" | "company-features"
  ): Promise<ApiResponse> {
    let url = "/token-usage/token-action";
    if (featureType) url += `?featureType=${featureType}`;

    return this.makeRequest(url, {
      method: "GET",
    });
  }

  async getTokenDashboardData(): Promise<ApiResponse> {
    return this.makeRequest("/token-usage/token-dashboard", {
      method: "GET",
    });
  }

  async getUserInvoices(): Promise<ApiResponse> {
    return this.makeRequest("/stripe/invoices", {
      method: "GET",
    });
  }

  async cancelSubscription(
    userId: string,
    cancelReason: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/stripe/cancel-subscription", {
      method: "POST",
      body: JSON.stringify({ userId, cancelReason }),
    });
  }

  async createSetupIntent(payload: {
    userId: string;
    email: string;
    name?: string;
  }): Promise<ApiResponse> {
    return this.makeRequest("/stripe/create-setup-intent", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async attachPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/stripe/attach-payment-method", {
      method: "POST",
      body: JSON.stringify({ userId, paymentMethodId }),
    });
  }

  async getPaymentMethods(userId: string): Promise<ApiResponse> {
    return this.makeRequest("/stripe/payment-methods", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/stripe/set-default-payment-method", {
      method: "POST",
      body: JSON.stringify({ userId, paymentMethodId }),
    });
  }

  async deletePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<ApiResponse> {
    return this.makeRequest("/stripe/delete-payment-method", {
      method: "POST",
      body: JSON.stringify({ userId, paymentMethodId }),
    });
  }

  async getAlertSettings(): Promise<ApiResponse> {
    return this.makeRequest("/alert-settings", {
      method: "GET",
    });
  }

  async upsertAlertSettings(data: any): Promise<ApiResponse> {
    return this.makeRequest("/alert-settings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(): Promise<ApiResponse> {
    return this.makeRequest("/users/account-deletion", {
      method: "POST",
    });
  }

  async createProject(data: any): Promise<any> {
    return this.makeRequest("/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  // GET projects list with pagination
  async getProjects(page = 1, limit = 20): Promise<any> {
    return this.makeRequest(`/projects?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // GET single project by id
  async getProjectById(id: string): Promise<any> {
    return this.makeRequest(`/projects/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // UPDATE project by id
  async updateProject(id: string, data: any): Promise<any> {
    return this.makeRequest(`/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async getAllowedCountries(): Promise<any> {
    return this.makeRequest(`/allowed-countries`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // DELETE project by id
  async deleteProject(id: string): Promise<any> {
    return this.makeRequest(`/projects/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async updateCurrentPassword(data: any): Promise<ApiResponse> {
    return this.makeRequest(`/users/password`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getLatestMessage(): Promise<ApiResponse> {
    return this.makeRequest(`/messages/latestMessages`);
  }

  async getDiscoverPeople(
    params: DiscoverPeopleParams = {}
  ): Promise<ApiResponse> {
    const { search = "", location, industry, page, limit } = params;

    // Build query string dynamically
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (location && location !== "all") query.append("location", location);
    if (industry && industry !== "all") query.append("industry", industry);
    if (page) query.append("page", page.toString());
    if (limit) query.append("limit", limit.toString());

    return this.makeRequest(`/network/discover-people?${query.toString()}`);
  }

  async sendConnection(data: any): Promise<ApiResponse> {
    return this.makeRequest(`/network/send-connection`, {
      method: "post",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  // apiService.ts
  async acceptConnection(requestId?: string): Promise<ApiResponse> {
    return this.makeRequest(`/network/accept/${requestId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  async rejectConnection(requestId?: string): Promise<ApiResponse> {
    return this.makeRequest(`/network/reject/${requestId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAcceptConnection(): Promise<ApiResponse> {
    return this.makeRequest(`/network`);
  }
  async getAllRequestConnections(): Promise<ApiResponse> {
    return this.makeRequest("/network/request");
  }
  async getUserProfileViews(): Promise<ApiResponse> {
    return this.makeRequest("/network/profile-view");
  }

  // ✅ Upload (returns JSON response)
  async uploadCandidateVideo({
    candidateId,
    type,
    file,
  }: UploadCandidateVideoParams): Promise<JsonResponse<any>> {
    const formData = new FormData();
    formData.append("video", file);

    if (candidateId) formData.append("candidateId", String(candidateId));
    if (type) formData.append("type", String(type));

    return this.apiRequest<any>(
      `/candidates/videos`,
      { method: "POST", body: formData },
      "json"
    );
  }

  // ✅ Delete (returns JSON response)
  async deleteCandidateVideo({
    candidateId,
    type,
  }: DeleteCandidateVideoParams): Promise<JsonResponse<any>> {
    return this.apiRequest<any>(
      `/candidates/videos/${candidateId}/${type}`,
      { method: "DELETE" },
      "json"
    );
  }

  // ✅ Thumbnail (returns a Blob response)
  async getCandidateVideoThumbnail({
    candidateId,
    type,
  }: GetCandidateVideoThumbnailParams): Promise<BlobResponse> {
    return this.apiRequest(
      `/candidates/videos/thumbnail/${candidateId}/${type}`,
      { method: "GET" },
      "blob"
    );
  }

  // ✅ Stream (just return a string URL, no request made)
  streamCandidateVideo({
    candidateId,
    type,
  }: StreamCandidateVideoParams): string {
    console.log(
      `${this.baseURL}/candidates/videos/stream/${candidateId}/${type}`
    );
    return `${this.baseURL}/candidates/videos/stream/${candidateId}/${type}`;
  }
  // ✅ List (returns JSON response with all videos for candidate)
  async getCandidateVideos({
    candidateId,
  }: GetCandidateVideosParams): Promise<
    JsonResponse<Record<string, CandidateVideoData>>
  > {
    return this.apiRequest<Record<string, CandidateVideoData>>(
      `/candidates/videos/${candidateId}`,
      { method: "GET" },
      "json"
    );
  }
  async updateAutoApplyOptions(body: any): Promise<ApiResponse> {
    return this.makeRequest(`/users/auto-apply`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  async getFooterLinks(): Promise<JsonResponse<any>> {
    return this.publicRequest(
      "/frontendRoutes/footer-links",
      { method: "GET" },
      "json"
    );
  }
  async generateCoverLetter(body: any): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/generate-cover-letter`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }
  async generateJobTitleAndDescription(body: any): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/generate-job-title-description`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  async savePushSubscription(data: {
    userId: string;
    role: string;
    subscription: PushSubscription;
    device: any;
  }): Promise<any> {
    return this.makeRequest("/pwa/save-subscription", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async sendPushNotification(data: {
    message: string;
    role?: string;
    userId?: string;
  }): Promise<any> {
    return this.makeRequest("/pwa/send-notification", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async sendInvitation(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/send-invitation/${id}`, {
      method: "POST",
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/users/delete/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async compareCandidatesForJob(
    applicationIds: string[],
    jobId?: string
  ): Promise<ApiResponse> {
    // If jobId is provided, append it as a query param
    const url = jobId
      ? `/profiles/company/compare-candidates?jobId=${jobId}`
      : `/profiles/company/compare-candidates`;

    return this.makeRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ applicationIds }),
    });
  }
}

const apiService = new ApiService();
export default apiService;
export type { ApiResponse };
