import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePageTitle() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip setting title for conversation routes - let the conversation title persist
    const isConversationRoute = 
      pathname.match(/^\/chat\/res\/[^/]+$/) ||
      pathname.match(/^\/image\/res\/[^/]+$/) ||
      pathname.match(/^\/audio\/(tts|stt|ag)\/[^/]+$/) ||
      pathname.match(/^\/video\/res\/[^/]+$/) ||
      pathname.match(/^\/project\/[^/]+\/chat\/[^/]+$/);
    
    if (isConversationRoute) {
      // Don't override the title - it's already set by the conversation
      return;
    }

    const baseTitle = "Alle-AI";
    let pageTitle = "Chat";

    // Match the pathname to determine the title
    if (pathname.startsWith('/image')) pageTitle = "Image Generation";
    else if (pathname.startsWith('/audio')) pageTitle = "Audio Generation";
    else if (pathname.startsWith('/video')) pageTitle = "Video Generation";
    else if (pathname.startsWith('/changelog')) pageTitle = "Changelog";
    else if (pathname.startsWith('/terms-of-service')) pageTitle = "Terms of Service";
    else if (pathname.startsWith('/privacy-policy')) pageTitle = "Privacy Policy";
    else if (pathname.startsWith('/model-glossary')) pageTitle = "Model Glossary";

    document.title = `${pageTitle} - ${baseTitle}`;
  }, [pathname]);
}