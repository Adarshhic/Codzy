import { useParams, useNavigate } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { 
  UploadCloud, FileVideo, CheckCircle2, ArrowLeft, 
  AlertCircle, Film, Clock, Sparkles, HardDrive
} from 'lucide-react';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

function AdminUpload() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      // Step 1: Fetch signature
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;
      
      if (!signature || !timestamp || !public_id || !api_key || !upload_url) {
        throw new Error('Missing required parameters from signature response');
      }

      // Step 2: Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('public_id', public_id);
      formData.append('timestamp', timestamp);
      formData.append('api_key', api_key);
      formData.append('signature', signature);
      
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 3: Save metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      toast.success('Video solution uploaded successfully!');
      reset();
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Upload failed. Please try again.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Authentication failed with Cloudinary.';
        } else if (err.response.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      setError('root', {
        type: 'manual',
        message: errorMessage
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
          <button 
            onClick={() => navigate('/admin/video')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Video Management</span>
          </button>
          <span>/</span>
          <span className="text-zinc-200 font-medium">Upload Solution Video</span>
        </div>

        {/* Header Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Film size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Upload Editorial Video</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Target Problem ID: <code className="font-mono text-indigo-300 text-xs px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">{problemId}</code>
          </p>
        </div>

        {/* Upload Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* File Dropzone Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Video File (.mp4, .mov, .webm — Max 100MB)
              </label>
              <div className="relative border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-zinc-950/40 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  {...register('videoFile', {
                    required: 'Please select a video file',
                    validate: {
                      isVideo: (files) => {
                        if (!files || !files[0]) return 'Please select a video file';
                        const file = files[0];
                        return file.type.startsWith('video/') || 'Please select a valid video file';
                      },
                      fileSize: (files) => {
                        if (!files || !files[0]) return true;
                        const file = files[0];
                        const maxSize = 100 * 1024 * 1024;
                        return file.size <= maxSize || 'File size must be less than 100MB';
                      }
                    }
                  })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={uploading}
                />
                
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {selectedFile ? selectedFile.name : 'Click or drag video file here to upload'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    MP4, WebM or MOV up to 100MB
                  </p>
                </div>
              </div>
              {errors.videoFile && (
                <span className="text-xs text-rose-400 mt-1 block">{errors.videoFile.message}</span>
              )}
            </div>

            {/* Selected File Details Preview */}
            {selectedFile && !uploadedVideo && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <FileVideo size={20} className="text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{selectedFile.name}</div>
                  <div className="text-[11px] text-zinc-500">{formatFileSize(selectedFile.size)}</div>
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Uploading to Cloudinary CDN...</span>
                  <span className="font-bold text-indigo-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success State Alert */}
            {uploadedVideo && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-400">Video Uploaded Successfully</h4>
                  <p className="text-xs text-zinc-300">
                    Duration: {formatDuration(uploadedVideo.duration)} • Attached to problem editorial
                  </p>
                </div>
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/admin/video')}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-all"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} />
                    <span>Start Upload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminUpload;