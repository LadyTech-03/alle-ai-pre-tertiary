import { X, File, FileMusic } from "lucide-react";
import { BiSolidFilePdf, BiSolidFileTxt, BiSolidFileDoc  } from "react-icons/bi";
import Image from "next/image";
import { UploadedFile } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { useState } from "react";

interface FilePreviewProps {
  file: UploadedFile;
  onRemove: () => void;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return { icon: <BiSolidFileDoc  className="w-8 h-8 text-blue-500" />, label: 'DOC' };
    case 'text/plain':
      return { icon: <BiSolidFileTxt  className="w-8 h-8 text-gray-500" />, label: 'TXT' };
    case 'application/pdf':
      return { icon: <BiSolidFilePdf className="w-8 h-8 text-red-500" />, label: 'PDF' };
    case 'audio/mpeg':
    case 'audio/mp3':
    case 'audio/wav':
    case 'audio/ogg':
    case 'audio/mp4':
      return { icon: <FileMusic className="w-8 h-8 text-blue-500" />, label: 'MP3' };
    default:
      return { icon: <File className="w-8 h-8 text-muted-foreground" />, label: 'Unknown' };
  }
};

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isImage = file.type.startsWith('image/');

  return (
    <>
      <div className="relative group flex items-center gap-2 p-1 max-w-[150px] w-fit ml-2 bg-muted/30 rounded-lg border border-borderColorPrimary">
        <div className="flex-shrink-0 relative">
          {isImage ? (
            <div 
              className="relative w-10 h-10 md:w-16 md:h-16 rounded overflow-hidden cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Image
                src={file.url}
                alt={file.name}
                className="object-cover"
                width={100}
                height={100}
              />
            </div>
          ) : (
            getFileIcon(file.type).icon
          )}

          {/* Loading overlay with progress */}
          {file.status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 rounded">
              <Loader className="w-3 h-3 animate-spin text-primary mb-1" />
              {file.progress !== undefined && (
                <span className="text-[10px] text-primary font-medium">
                  {Math.round(file.progress)}%
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`flex-1 min-w-0 ${isImage ? 'hidden' : ''}`}>
          {!isImage && (
            <p className="text-xs font-medium truncate">{file.name}</p>
          )}

          {/* Progress bar */}
          {file.status === 'loading' && file.progress !== undefined && (
            <div className="flex flex-col gap-1">
                <Progress 
                  value={file.progress} 
                  className="h-1 w-full bg-muted"
                  indicatorClassName="bg-primary"
                />
            </div>
          )}
        </div>

        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive/90 text-destructive-foreground transition-opacity"
          disabled={file.status === 'loading'}
        >
          <X className="w-2 h-2" />
        </button>
      </div>

      {/* Image Preview Modal */}
      {isImage && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogHeader className="sr-only">
              <DialogTitle className="text-lg font-medium">
                Image Preview
              </DialogTitle>
            </DialogHeader>
          <DialogContent className="max-w-xl p-0 focus-visible:outline-none">
            
              <Image
                src={file.url}
                alt={file.name}
                className="w-full h-full object-contain rounded-lg"
                width={100}
                height={100}
              />
            
            {/* <div className="p-4 border-t">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getFileExtension(file.type)} • {formatFileSize(file.size)}
              </p>
            </div> */}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}