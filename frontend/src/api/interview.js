import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const interviewApi = axios.create({
  baseURL: `${API_URL}/interview`,
  withCredentials: true,
});

export const createInterviewSession = async (problemId, difficulty) => {
  const response = await interviewApi.post('/create', { problemId, difficulty });
  return response.data;
};

export const getActiveInterviewSessions = async () => {
  const response = await interviewApi.get('/active');
  return response.data;
};

export const getMyInterviewSessions = async () => {
  const response = await interviewApi.get('/my-sessions');
  return response.data;
};

export const getInterviewSessionById = async (id) => {
  const response = await interviewApi.get(`/${id}`);
  return response.data;
};

export const joinInterviewSession = async (id) => {
  const response = await interviewApi.post(`/${id}/join`);
  return response.data;
};

export const endInterviewSession = async (id, data) => {
  const response = await interviewApi.post(`/${id}/end`, data);
  return response.data;
};

export const getStreamToken = async () => {
  const response = await interviewApi.get('/auth/stream-token');
  return response.data;
};

export default interviewApi;