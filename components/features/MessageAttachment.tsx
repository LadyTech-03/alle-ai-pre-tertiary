"use client";

import { useState } from "react";
import Image from "next/image";
import { FileIcon, X, Download, Eye, FileMusic, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BiSolidFileDoc, BiSolidFilePdf, BiSolidFileTxt } from "react-icons/bi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MessageAttachmentProps {
  file: {
    name: string;
    type: string;
    size: number;
    url: string;
  };
  isMultiple?: boolean;
}

export function MessageAttachment({ file, isMultiple = false }: MessageAttachmentProps) {
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Determine if the file is an image based on file type or extension
  const isImage = file.type.startsWith('image/') || 
                 /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(file.name);
  
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const isText = file.type === 'text/plain' || /\.(txt|md|rtf)$/i.test(file.name);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const fileSize = formatFileSize(file.size);
  
  // Get file extension from name
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };
  
  const fileExtension = getFileExtension(file.name);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'doc':
      case 'docx':
        return { icon: <BiSolidFileDoc  className="w-8 h-8 text-blue-500" />, label: 'DOC' };
      case 'txt':
        return { icon: <BiSolidFileTxt  className="w-8 h-8 text-gray-500" />, label: 'TXT' };
      case 'pdf':
        return { icon: <BiSolidFilePdf className="w-8 h-8 text-red-500" />, label: 'PDF' };
      case 'mpeg':
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'mp4':
        return { icon: <FileMusic className="w-8 h-8 text-blue-500" />, label: 'MP3' };
      default:
        return { icon: <File className="w-8 h-8 text-muted-foreground" />, label: 'Unknown' };
    }
  };

  return (
    <>
      {isImage ? (
        <>
          <div className="relative">
            <div 
              className={cn(
                "relative rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-90",
                isMultiple ? "w-28 h-28 sm:w-32 sm:h-32" : "max-w-xs w-full"
              )}
            >
              <Image
                src={file.url}
                alt={file.name}
                width={isMultiple ? 128 : 300}
                height={isMultiple ? 128 : 300}
                className={cn(
                  "w-full h-full",
                  isMultiple ? "object-cover" : "object-contain"
                )}
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-4xl p-0 bg-transparent border-none [&>button]:hidden">
              <DialogHeader className="sr-only">
                <DialogTitle>Image Preview</DialogTitle>
              </DialogHeader>
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={file.url}
                  alt={file.name}
                  width={800}
                  height={800}
                  className="object-contain max-h-[85vh] w-auto"
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex items-center p-2 border border-borderColorPrimary rounded-xl max-w-[80%] sm:w-fit sm:max-w-[70%] gap-1">
          <div className="flex items-center justify-center rounded text-foreground">
            {getFileIcon(fileExtension.toLocaleLowerCase()).icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            {/* <p className="text-xs text-muted-foreground">
              {fileExtension}
            </p> */}
          </div>
        </div>
      )}
    </>
  );
}