interface YouTubeEmbedProps {
    url: string;
  }
  
  export function YouTubeEmbed({ url }: YouTubeEmbedProps) {
    try {
      const videoUrl = new URL(url);
      let videoId = '';
  
      if (videoUrl.hostname.includes('youtube.com')) {
        videoId = videoUrl.searchParams.get('v') || '';
      } else if (videoUrl.hostname.includes('youtu.be')) {
        videoId = videoUrl.pathname.slice(1);
      }
  
      if (!videoId) return null;
  
      return (
        <>
          <br />
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video rounded-lg"
          />
          <br />
        </>
      );
    } catch {
      return null;
    }
  }