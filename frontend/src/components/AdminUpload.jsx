import { useParams } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient'

function AdminUpload(){
    
    const {problemId}  = useParams();
    
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
    
      // Upload video to Cloudinary
      const onSubmit = async (data) => {
        const file = data.videoFile[0];
        
        setUploading(true);
        setUploadProgress(0);
        clearErrors();
    
        try {
          // Step 1: Get upload signature from backend
          console.log('Step 1: Fetching signature for problem:', problemId);
          const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
          console.log('Signature Response:', signatureResponse.data);
          
          const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;
          
          // Validate response
          if (!signature || !timestamp || !public_id || !api_key || !upload_url) {
            throw new Error('Missing required parameters from signature response');
          }
    
          // Step 2: Create FormData for Cloudinary upload
          // IMPORTANT: Order matters! Must match the order used to generate signature
          const formData = new FormData();
          formData.append('file', file);
          formData.append('public_id', public_id);
          formData.append('timestamp', timestamp);
          formData.append('api_key', api_key);
          formData.append('signature', signature);
          
          console.log('Step 2: Uploading to Cloudinary...', {
            public_id,
            timestamp,
            api_key,
            upload_url,
            fileSize: file.size,
            fileType: file.type
          });
    
          // Step 3: Upload directly to Cloudinary
          const uploadResponse = await axios.post(upload_url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
              console.log('Upload progress:', progress + '%');
            },
          });
    
          console.log('Step 3: Cloudinary Upload Success:', uploadResponse.data);
          const cloudinaryResult = uploadResponse.data;
    
          // Step 4: Save video metadata to backend
          console.log('Step 4: Saving metadata to backend...');
          const metadataResponse = await axiosClient.post('/video/save', {
            problemId: problemId,
            cloudinaryPublicId: cloudinaryResult.public_id,
            secureUrl: cloudinaryResult.secure_url,
            duration: cloudinaryResult.duration,
          });
    
          console.log('Metadata saved:', metadataResponse.data);
          setUploadedVideo(metadataResponse.data.videoSolution);
          reset(); // Reset form after successful upload
          
        } catch (err) {
          console.error('Upload error:', err);
          console.error('Error response:', err.response);
          console.error('Error data:', err.response?.data);
          
          let errorMessage = 'Upload failed. Please try again.';
          
          // Handle different error scenarios
          if (err.response) {
            // Server responded with error
            if (err.response.status === 401) {
              errorMessage = 'Authentication failed with Cloudinary. Please check credentials and signature.';
            } else if (err.response.status === 400) {
              errorMessage = err.response.data?.error?.message || 
                           err.response.data?.error || 
                           err.response.data?.message || 
                           'Invalid request to Cloudinary';
            } else if (err.response.data) {
              errorMessage = err.response.data.error?.message || 
                           err.response.data.error || 
                           err.response.data.message || 
                           errorMessage;
            }
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'No response from server. Check your connection.';
          } else {
            // Error in request setup
            errorMessage = err.message || errorMessage;
          }
          
          setError('root', {
            type: 'manual',
            message: errorMessage
          });
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      };
    
      // Format file size
      const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
    
      // Format duration
      const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };
    
      return (
        <div className="max-w-md mx-auto p-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Upload Video</h2>
              <p className="text-sm text-base-content/60 mb-2">Problem ID: {problemId}</p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* File Input */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Choose video file</span>
                    <span className="label-text-alt">Max 100MB</span>
                  </label>
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
                          const maxSize = 100 * 1024 * 1024; // 100MB
                          return file.size <= maxSize || 'File size must be less than 100MB';
                        }
                      }
                    })}
                    className={`file-input file-input-bordered w-full ${errors.videoFile ? 'file-input-error' : ''}`}
                    disabled={uploading}
                  />
                  {errors.videoFile && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.videoFile.message}</span>
                    </label>
                  )}
                </div>
    
                {/* Selected File Info */}
                {selectedFile && !uploadedVideo && (
                  <div className="alert alert-info">
                    <div className="w-full">
                      <h3 className="font-bold">Selected File:</h3>
                      <p className="text-sm break-all">{selectedFile.name}</p>
                      <p className="text-sm">Size: {formatFileSize(selectedFile.size)}</p>
                      <p className="text-sm">Type: {selectedFile.type}</p>
                    </div>
                  </div>
                )}
    
                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span className="font-bold">{uploadProgress}%</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={uploadProgress} 
                      max="100"
                    ></progress>
                  </div>
                )}
    
                {/* Error Message */}
                {errors.root && (
                  <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{errors.root.message}</span>
                  </div>
                )}
    
                {/* Success Message */}
                {uploadedVideo && (
                  <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-bold">Upload Successful!</h3>
                      <p className="text-sm">Duration: {formatDuration(uploadedVideo.duration)}</p>
                      <p className="text-sm">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
    
                {/* Upload Button */}
                <div className="card-actions justify-end">
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className={`btn btn-primary ${uploading ? 'loading' : ''}`}
                  >
                    {uploading ? 'Uploading...' : 'Upload Video'}
                  </button>
                </div>
              </form>
            
            </div>
          </div>
        </div>
    );
}

export default AdminUpload;