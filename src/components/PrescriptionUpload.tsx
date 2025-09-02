import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/utils/i18n';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Camera, X, Check } from 'lucide-react';

interface PrescriptionUploadProps {
  isOpen: boolean;
  onClose: () => void;
  medicineId?: string;
}

export const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({ 
  isOpen, 
  onClose, 
  medicineId 
}) => {
  const { t } = useTranslation('en');
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (imageFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...imageFiles]);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload images or PDF files only",
        variant: "destructive"
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      toast({
        title: t('file_uploaded'),
        description: `${uploadedFiles.length} prescription file(s) uploaded successfully`,
      });

      // In real app, files would be uploaded to server/cloud storage
      console.log('Uploaded files for medicine:', medicineId, uploadedFiles);

      setIsUploading(false);
      setUploadedFiles([]);
      onClose();
    }, 2000);
  };

  const capturePhoto = () => {
    // In real app, this would open camera
    toast({
      title: "Camera Feature",
      description: "Camera capture will be implemented in production version",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {t('upload_prescription')}
          </DialogTitle>
          <DialogDescription>
            Upload prescription images or documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-300 hover:border-primary'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              {t('drag_drop_files')}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => document.getElementById('file-input')?.click()}>
                <FileText className="w-4 h-4 mr-1" />
                Choose Files
              </Button>
              <Button variant="outline" size="sm" onClick={capturePhoto}>
                <Camera className="w-4 h-4 mr-1" />
                Take Photo
              </Button>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Uploaded Files:</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium truncate max-w-32">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Upload {uploadedFiles.length} file(s)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};