import { VideoContainer } from "@/components/ui/media";

export function MediaVideo() {
  return (
    <VideoContainer className="max-w-2xl rounded-ui bg-black shadow-z1">
      <iframe
        title="Materialize introduction video"
        src="https://www.youtube-nocookie.com/embed/Q8TXgCzxEnw?rel=0"
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </VideoContainer>
  );
}
