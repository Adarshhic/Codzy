import axiosClient from '../utils/axiosClient';

// FIXED: Use axiosClient instead of creating separate axios instance
// This ensures consistent base URL (localhost:3000) and auth configuration

export const createInterviewSession = async (problemId, difficulty) => {
  const response = await axiosClient.post('/interview/create', { problemId, difficulty });
  return response.data;
};

export const getActiveInterviewSessions = async () => {
  const response = await axiosClient.get('/interview/active');
  return response.data;
};

export const getMyInterviewSessions = async () => {
  const response = await axiosClient.get('/interview/my-sessions');
  return response.data;
};

export const getInterviewSessionById = async (id) => {
  const response = await axiosClient.get(`/interview/${id}`);
  return response.data;
};

export const joinInterviewSession = async (id) => {
  const response = await axiosClient.post(`/interview/${id}/join`);
  return response.data;
};

export const endInterviewSession = async (id, data) => {
  const response = await axiosClient.post(`/interview/${id}/end`, data);
  return response.data;
};

export const getStreamToken = async () => {
  const response = await axiosClient.get('/interview/auth/stream-token');
  return response.data;
};

export default axiosClient;