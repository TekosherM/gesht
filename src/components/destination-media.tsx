import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function DestinationMedia({
  image,
  video,
  className,
}: {
  image?: string;
  video?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!video || reduce) return;
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4, rootMargin: "80px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [video, reduce]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView && !reduce) {
      const play = el.play();
      if (play) play.catch(() => {});
    } else {
      el.pause();
    }
  }, [inView, reduce]);

  return (
    <div ref={wrapRef} className={cn("relative aspect-16/10 overflow-hidden bg-sunken", className)}>
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : null}
      {video && !reduce ? (
        <video
          ref={videoRef}
          className={cn(
            "pointer-events-none absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.04]",
            ready ? "opacity-100" : "opacity-0",
          )}
          poster={image}
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setReady(true)}
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
