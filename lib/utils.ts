import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert JSON string to Python-compatible format by replacing boolean values
export function convertJsonToPythonFormat(jsonString: string): string {
  return jsonString
    .replace(/":\s*true/g, '": True')
    .replace(/":\s*false/g, '": False');
}

export function textReveal(
  inputString: string
): Array<{ char: string; id: number }> {
  const characters: Array<{ char: string; id: number }> = [];
  const regex = /./gu;
  let match;
  let index = 0;

  while ((match = regex.exec(inputString)) !== null) {
    characters.push({ char: match[0], id: index++ });
  }

  return characters;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "audio/mpeg": [".mp3"], // MP3
  "audio/mp3": [".mp3"], // MP3
  "audio/wav": [".wav"], // WAV
  "audio/ogg": [".ogg"], // OGG
  "audio/mp4": [".mp4"], // MP4
  "video/mp4": [".mp4"], // MP4
};

type FileType = 'audio' | 'image' | 'video' | 'pdf' | 'document';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFileUpload(file: File, type: FileType): ValidationResult {
  // Define size limits for each type
  const SIZE_LIMITS = {
    audio: 60 * 1024 * 1024,    // 60MB
    image: 60 * 1024 * 1024,     // 60MB
    video: 60 * 1024 * 1024,   // 60MB
    pdf: 60 * 1024 * 1024,      // 60MB
    document: 60 * 1024 * 1024  // 60MB
  };

  // Get allowed extensions for the file type
  const getAllowedExtensions = (fileType: FileType): string[] => {
    return Object.entries(ALLOWED_FILE_TYPES)
      .filter(([mimeType]) => {
        switch(fileType) {
          case 'audio':
            return mimeType.startsWith('audio/');
          case 'image':
            return mimeType.startsWith('image/');
          case 'video':
            return mimeType.startsWith('video/');
          case 'pdf':
            return mimeType === 'application/pdf';
          case 'document':
            return mimeType === 'application/msword' || 
                   mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   mimeType === 'text/plain';
        }
      })
      .flatMap(([_, extensions]) => extensions);
  };

  // Check file size first
  if (file.size > SIZE_LIMITS[type]) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(SIZE_LIMITS[type])} limit. Your file is ${formatFileSize(file.size)}.`
    };
  }

  // Check file type based on category
  const isValidType = Object.keys(ALLOWED_FILE_TYPES).some(mimeType => {
    switch(type) {
      case 'audio':
        return mimeType.startsWith('audio/') && file.type === mimeType;
      case 'image':
        return mimeType.startsWith('image/') && file.type === mimeType;
      case 'video':
        return mimeType.startsWith('video/') && file.type === mimeType;
      case 'pdf':
        return mimeType === 'application/pdf' && file.type === mimeType;
      case 'document':
        return (mimeType === 'application/msword' || 
                mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                mimeType === 'text/plain') && file.type === mimeType;
    }
  });

  if (!isValidType) {
    const allowedExtensions = getAllowedExtensions(type);
    return {
      isValid: false,
      error: `Invalid file format. Allowed formats for ${type}: ${allowedExtensions.join(', ')}`
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check if it's an image
  const isImage = file.type.startsWith("image/");

  // Apply appropriate size limit
  const sizeLimit = isImage ? 50 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 20MB for other files
  const readableLimit = isImage ? "50MB" : "50MB";

  if (file.size > sizeLimit) {
    return {
      isValid: false,
      error: `File size exceeds ${readableLimit} limit`,
    };
  }

  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return {
      isValid: false,
      error: "File type not supported",
    };
  }

  return { isValid: true };
}

export const formVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const getQueryParam = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
};

export const hasQueryParam = (name: string): boolean => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(name);
};

export const PROTECTED_ROUTES = [
  '/image',
  '/audio',
  '/video',
  // '/project',
  // '/developer',
  "/changelog",
];

export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route));
};

export function extractVideoRequestData(responseBody: any) {
  try {
    // Extract the requestId from the id field
    const requestId = responseBody?.responses?.id || "";

    // Extract the model from the source_models array (first item)
    const models = responseBody?.responses?.source_models;

    // Extract the invocationId from the responses object
    // This is trickier as it's dynamically keyed by the model name

    return {
      requestId,
      models,
    };
  } catch (error) {
    return {
      requestId: "",
    };
  }
}

export function extractChatResponseData(responseBody: any) {
  if (!responseBody?.success || !responseBody?.responses) {
    return null;
  }

  try {
    const { responses, source_models } = responseBody.responses;
    
    // Extract only what we need for follow-ups
    const extractedResponses = {
      assistants: {} as Record<string, Array<{ type: "text"; text: string }>>
    };

    // Process each model's response
    Object.entries(responses).forEach(([modelId, modelResponse]: [string, any]) => {
      if (modelResponse?.message?.content) {
        extractedResponses.assistants[modelId] = [{
          type: "text",
          text: modelResponse.message.content
        }];
      }
    });

    return {
      messages: extractedResponses,
      models: source_models,
      timestamp: responseBody.responses.created.date
    };
  } catch (error) {
    return null;
  }
}

export function canDoFollowUp(previousModels: string[], currentModels: string[]): boolean {
  if (!previousModels || !currentModels) return false;
  if (previousModels.length !== currentModels.length) return false;
  return previousModels.every(model => currentModels.includes(model));
}

export function extractErrorMessage(error: any): string {
   // Try to extract validation errors (e.g. { errors: { email: ["..."] } })
   const validationErrors = error?.response?.data?.errors;
   if (validationErrors && typeof validationErrors === "object") {
     // Get the first error array and take its first message
     const firstErrorKey = Object.keys(validationErrors)[0];
     const firstErrorMsg = validationErrors[firstErrorKey]?.[0];
     if (firstErrorMsg) return firstErrorMsg;
   }
   
   // Fallbacks for other possible error shapes
  return (
    error?.response?.data?.error ||     // Backend sends { error: "..." }
    error?.response?.data?.message ||   // Backend sends { message: "..." }
    error?.message ||
                       // Manually thrown Error (new Error(...))
    "Something went wrong, please try again"
  );
}

