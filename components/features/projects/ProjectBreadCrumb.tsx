import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useHistoryStore, useProjectStore, useStreamingTitlesStore } from "@/stores";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TextStream } from "@/components/ui/text-stream";
import { FolderOpen } from "lucide-react";

    // ProjectBreadcrumb component for navigation in project conversations
  const ProjectBreadcrumb = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { projects } = useProjectStore();
    const { getHistoryItemById } = useHistoryStore();
    const { streamingTitles } = useStreamingTitlesStore();
    const [isLoading, setIsLoading] = useState(true);
    const [conversationTitle, setConversationTitle] = useState("Conversation");
    const [shouldRender, setShouldRender] = useState(false);
    const [projectUuid, setProjectUuid] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    
    // Set up route parameters
    useEffect(() => {
      // Check if we're on a project conversation route
      const match = pathname.match(/^\/project\/([^\/]+)\/chat\/([^\/]+)$/);
      if (match) {
        setProjectUuid(match[1]);
        setConversationId(match[2]);
        setShouldRender(true);
      } else {
        setShouldRender(false);
      }
    }, [pathname]);
    
    // Use effect to simulate loading (to ensure data is fetched)
    useEffect(() => {
      if (shouldRender) {
        setIsLoading(true);
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [shouldRender]);
    
    // Find project and update conversation title
    useEffect(() => {
      if (!shouldRender || !projectUuid || !conversationId) return;
      
      // Find project by ID
      const project = projects.find(p => p.uuid === projectUuid);
      if (!project) return;
      
      // Initialize with default
      let title = 'Conversation title';
      let foundTitle = false;
      
      // Check in project histories first
      if (project.histories && project.histories.length > 0) {
        const projectConversation = project.histories.find(h => 
          h.session === conversationId || h.id === conversationId
        );
        
        if (projectConversation?.title) {
          title = projectConversation.title;
          foundTitle = true;
          // console.log('Found title in project histories:', title);
        }
      }
      
      // Check global history store if not found in project histories
      if (!foundTitle) {
        const historyItem = getHistoryItemById(conversationId);
        if (historyItem?.title) {
          title = historyItem.title;
          // console.log('Found title in global history:', title);
        }
      }
      
      setConversationTitle(title);
    }, [shouldRender, projectUuid, conversationId, projects, getHistoryItemById]);
    
    // Don't render anything if not on a project conversation route
    if (!shouldRender || !projectUuid) return null;
    
    // Get the project for rendering
    const project = projects.find(p => p.uuid === projectUuid);
    if (!project) return null;
    
    // if (isLoading) {
    //   return (
    //     <div className="ml-4 flex-shrink-0 max-w-[300px] md:max-w-[400px]">
    //       <div className="flex items-center gap-2 whitespace-nowrap">
    //         <Skeleton className="h-5 w-24" />
    //         <span className="text-muted-foreground">&gt;</span>
    //         <Skeleton className="h-5 w-24" />
    //       </div>
    //     </div>
    //   );
    // }
    
    return (
      <Breadcrumb className="ml-4 flex-shrink-0 max-w-[300px] md:max-w-full ">
        <BreadcrumbList className="whitespace-nowrap overflow-hidden text-ellipsis">
          <BreadcrumbItem className="hover:bg-muted p-1.5 rounded-lg">
            <div 
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => router.push(`/project/${projectUuid}`)}
            title={project.name}
            >
                <FolderOpen style={{ color: project.color }} className="w-6 h-6 mr-1" />
                <span 
                className="truncate max-w-full text-primary hover:text-primary/80 text-sm font-medium"
                style={{ color: project.color || '#10b981' }}
                >
                    {/* {project?.name?.length > 10 ? project?.name?.slice(0, 10) + '...' : project?.name} */}
                    {project?.name}
                </span>
            </div>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="hover:bg-muted p-1.5 rounded-lg">
            <BreadcrumbPage className="text-sm" title={conversationTitle}>
              {conversationId && streamingTitles[conversationId] ? (
                <TextStream 
                  text={conversationTitle} 
                  isStreaming={true}
                  streamDuration={800}
                />
              ) : (
                // conversationTitle?.length > 10 ? conversationTitle?.slice(0, 10) + '...' : conversationTitle
                <span className="truncate max-w-full">
                  {conversationTitle}
                </span>
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  export default ProjectBreadcrumb