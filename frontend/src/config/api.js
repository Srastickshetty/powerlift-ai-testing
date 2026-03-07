const API_BASE_URL = import.meta.env.PROD 
  ? 'https://powerlift-ai-backend.onrender.com' 
  : 'http://localhost:5001';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  USERS: `${API_BASE_URL}/api/users`,
  COACH: `${API_BASE_URL}/api/coach`,
  LOGS: `${API_BASE_URL}/api/logs`,
  PROGRAMS: `${API_BASE_URL}/api/programs`,
  PROGRESS: `${API_BASE_URL}/api/progress`,
  STATUS: `${API_BASE_URL}/api/status`,
  POST_COMPETITION: `${API_BASE_URL}/api/post-competition`,
  AI: `${API_BASE_URL}/api/ai`,
  AGENTS: `${API_BASE_URL}/api/agents`,
  TITAN_OS: `${API_BASE_URL}/api/titan-os`,
  COMPETITIONS: `${API_BASE_URL}/api/competitions`,
  WELLNESS: `${API_BASE_URL}/api/wellness`,
  AI_CONVERSATIONS: `${API_BASE_URL}/api/ai-conversations`
};

export default API_ENDPOINTS;
