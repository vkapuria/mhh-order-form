'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizePerFile?: number // in MB
  acceptedTypes?: string[]
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  id: string
}

export default function FileUpload({
  files,
  onChange,
  maxFiles = 5,
  maxSizePerFile = 10, // 10MB default
  acceptedTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'png', 'jpg', 'jpeg']
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxSizePerFile}MB.`
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (fileExtension && !acceptedTypes.includes(fileExtension)) {
      return `File type ".${fileExtension}" is not supported.`
    }

    return null
  }

  // Simulate file upload with progress
  const simulateUpload = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const uploadId = Math.random().toString(36).substr(2, 9)
      
      const uploadingFile: UploadingFile = {
        file,
        progress: 0,
        status: 'uploading',
        id: uploadId
      }

      setUploadingFiles(prev => [...prev, uploadingFile])

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.id === uploadId 
              ? { ...uf, progress: Math.min(uf.progress + 20, 100) }
              : uf
          )
        )
      }, 200)

      // Complete after 1 second
      setTimeout(() => {
        clearInterval(interval)
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.id === uploadId 
              ? { ...uf, progress: 100, status: 'completed' }
              : uf
          )
        )

        // Remove from uploading list after brief delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(uf => uf.id !== uploadId))
          resolve()
        }, 500)
      }, 1000)
    })
  }

  // Handle file selection
  const handleFiles = useCallback(async (newFiles: File[]) => {
    setErrors([])
    
    // Check total file limit
    if (files.length + newFiles.length > maxFiles) {
      setErrors([`You can only upload up to ${maxFiles} files total.`])
      return
    }

    // Validate each file
    const validationErrors: string[] = []
    const validFiles: File[] = []

    newFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        validationErrors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Upload valid files
    for (const file of validFiles) {
      await simulateUpload(file)
    }

    // Add to final files list
    onChange([...files, ...validFiles])
  }, [files, onChange, maxFiles, maxSizePerFile, acceptedTypes])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [handleFiles])

  // File input handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  // Remove file
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`p-6 border-2 border-dashed transition-colors ${
        isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CloudArrowUpIcon className="w-8 h-8 text-gray-400" />
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Assignment Files
          </h4>
          
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>
          
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            accept={acceptedTypes.map(type => `.${type}`).join(',')}
            className="hidden"
            id="file-upload"
          />
          
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
          
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>Supported formats: {acceptedTypes.join(', ').toUpperCase()}</p>
            <p>Maximum file size: {maxSizePerFile}MB per file</p>
            <p>Maximum files: {maxFiles}</p>
          </div>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h5 className="font-semibold text-red-800 mb-1">Upload Errors</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card className="p-4">
          <h5 className="font-semibold text-gray-900 mb-3">Uploading Files</h5>
          <div className="space-y-3">
            {uploadingFiles.map((uploadingFile) => (
              <div key={uploadingFile.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DocumentIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{uploadingFile.file.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {uploadingFile.progress}%
                  </span>
                </div>
                <Progress value={uploadingFile.progress} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Card className="p-4">
          <h5 className="font-semibold text-gray-900 mb-3">
            Uploaded Files ({files.length}/{maxFiles})
          </h5>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    ✓ Uploaded
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}