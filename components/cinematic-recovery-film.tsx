"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  { start: 0, number: "01", label: "Exception", detail: "The promise breaks." },
  { start: 4, number: "02", label: "Evidence", detail: "Responses become comparable." },
  { start: 8, number: "03", label: "Human decision", detail: "Authority stays with the team." },
];

export function CinematicRecoveryFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!video || !stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reducedMotion.matches) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.28 },
    );

    const handleMotionChange = () => {
      if (reducedMotion.matches) {
        video.currentTime = 4;
        video.pause();
      } else if (stage.getBoundingClientRect().top < window.innerHeight) {
        void video.play().catch(() => undefined);
      }
    };

    observer.observe(stage);
    reducedMotion.addEventListener("change", handleMotionChange);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  const seekTo = (index: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = chapters[index].start;
    setActiveChapter(index);
    void video.play().catch(() => undefined);
  };

  return (
    <div className="film-stage" ref={stageRef}>
      <div className="film-viewport">
        <video
          ref={videoRef}
          className="recovery-film"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/recovery-film-01-exception.webp"
          aria-label="A supply exception becomes verified evidence and a human-authorized recovery decision"
          onTimeUpdate={(event) => {
            const time = event.currentTarget.currentTime;
            setActiveChapter(time >= 8 ? 2 : time >= 4 ? 1 : 0);
          }}
        >
          <source src="/capacityline-recovery-film.mp4" type="video/mp4" />
        </video>
        <div className="film-vignette" aria-hidden="true" />
        <div className="film-grid" aria-hidden="true" />
        <div className="film-status" aria-hidden="true">
          <span>EVIDENCE IN · DECISION OUT</span>
        </div>
        <div className="film-playhead" aria-hidden="true"><i /></div>
      </div>

      <div className="film-chapters" aria-label="Film chapters">
        {chapters.map((chapter, index) => (
          <button
            type="button"
            key={chapter.number}
            className={activeChapter === index ? "is-active" : ""}
            aria-pressed={activeChapter === index}
            onClick={() => seekTo(index)}
          >
            <span>{chapter.number}</span>
            <strong>{chapter.label}</strong>
            <small>{chapter.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
