"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FallbackImage } from "@/components/ui/fallback-image";

export type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  details: string;
  status: "ONGOING" | "COMPLETED";
  statusNote?: string | null;
  location?: string | null;
  completedAt?: string | null;
  images: string[];
};

function statusPercent(note?: string | null) {
  if (!note) return 42;
  const match = note.match(/(\d{1,3})\s*%/);
  if (!match) return 58;
  const value = Number(match[1]);
  if (Number.isNaN(value)) return 58;
  return Math.max(6, Math.min(100, value));
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

export function TestimonialProjects({
  completed,
  ongoing
}: {
  completed: ProjectItem[];
  ongoing: ProjectItem[];
}) {
  const params = useSearchParams();
  const requestedSlug = params.get("project");
  const consumedQueryRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);

  const allProjects = useMemo(() => [...completed, ...ongoing], [completed, ongoing]);

  useEffect(() => {
    if (!requestedSlug || activeProject || consumedQueryRef.current) return;
    const found = allProjects.find((item) => item.slug === requestedSlug);
    consumedQueryRef.current = true;
    if (!found) return;
    setActiveProject(found);
    setActiveImageIndex(0);
    setImageLoading(true);
  }, [requestedSlug, allProjects, activeProject]);

  useEffect(() => {
    if (!activeProject) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveProject(null);
      if (event.key === "ArrowLeft") {
        setImageLoading(true);
        setActiveImageIndex((prev) => (prev <= 0 ? activeProject.images.length - 1 : prev - 1));
      }
      if (event.key === "ArrowRight") {
        setImageLoading(true);
        setActiveImageIndex((prev) => (prev >= activeProject.images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeProject]);

  const openProject = (project: ProjectItem) => {
    setActiveProject(project);
    setActiveImageIndex(0);
    setImageLoading(true);
  };

  const activeImage = activeProject?.images[activeImageIndex] || "";
  const totalImages = activeProject?.images.length || 0;
  const prevImage = totalImages > 1 ? activeProject?.images[(activeImageIndex - 1 + totalImages) % totalImages] : null;
  const nextImage = totalImages > 1 ? activeProject?.images[(activeImageIndex + 1) % totalImages] : null;

  const showPrev = () => {
    if (!totalImages) return;
    setImageLoading(true);
    setActiveImageIndex((prev) => (prev <= 0 ? totalImages - 1 : prev - 1));
  };

  const showNext = () => {
    if (!totalImages) return;
    setImageLoading(true);
    setActiveImageIndex((prev) => (prev >= totalImages - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (delta > threshold) showNext();
    if (delta < -threshold) showPrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Ongoing Projects</h2>
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60">
            {ongoing.length} active
          </span>
        </div>
        {ongoing.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center text-white/70">
            No active projects right now.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {ongoing.map((project) => {
              const progress = statusPercent(project.statusNote);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openProject(project)}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] text-left shadow-card transition duration-200 hover:-translate-y-1 hover:border-white/30"
                >
                  <div className="grid gap-4 p-4 sm:grid-cols-[200px_1fr]">
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                      <FallbackImage
                        src={project.images[0]}
                        fallbackSrc="/placeholders/steel-1.svg"
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <span className="rounded-full border border-amber-300/60 bg-[#2b210a]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                          Ongoing
                        </span>
                      </div>
                      <p className="text-sm text-white/70">{project.details}</p>
                      {(project.statusNote || project.location) && (
                        <p className="text-xs text-white/55">
                          {[project.statusNote, project.location].filter(Boolean).join(" | ")}
                        </p>
                      )}
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-white/55">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-yellow to-brand-red"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-14 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Finished Projects</h2>
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60">
            {completed.length} total
          </span>
        </div>
        {completed.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center text-white/70">
            No completed projects yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {completed.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => openProject(project)}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] text-left shadow-card transition duration-200 hover:-translate-y-1 hover:border-white/30"
              >
                <div className="relative aspect-[16/10] bg-white/[0.03]">
                  <FallbackImage
                    src={project.images[0]}
                    fallbackSrc="/placeholders/steel-1.svg"
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-emerald-300/60 bg-[#0f2b23]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                    Completed
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-brand-navy/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    Preview
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <p className="line-clamp-3 text-sm text-white/70">{project.details}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white/55">
                    {project.location && <span>{project.location}</span>}
                    {project.completedAt && <span>{formatDate(project.completedAt)}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-3 py-3 sm:px-6 sm:py-5">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-brand-navy/70 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[11px] uppercase tracking-[0.22em] text-white/50">
                  {activeProject.status === "COMPLETED" ? "Completed Project" : "Ongoing Project"}
                </p>
                <h4 className="truncate text-sm font-semibold text-white sm:text-base">{activeProject.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                  {activeImageIndex + 1} / {totalImages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/50 hover:text-white"
                  onClick={() => setActiveProject(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <div
              className="relative flex-1 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#102338] to-[#081423] p-2 sm:p-3"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {imageLoading && <div className="absolute inset-0 z-[1] animate-pulse bg-white/10" />}

              <button
                type="button"
                className={`absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
                  totalImages > 1
                    ? "border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                    : "cursor-not-allowed border-white/10 text-white/35"
                }`}
                onClick={showPrev}
                aria-label="Previous image"
                disabled={totalImages <= 1}
              >
                Prev
              </button>

              <button
                type="button"
                className={`absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
                  totalImages > 1
                    ? "border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                    : "cursor-not-allowed border-white/10 text-white/35"
                }`}
                onClick={showNext}
                aria-label="Next image"
                disabled={totalImages <= 1}
              >
                Next
              </button>

              <FallbackImage
                src={activeImage}
                fallbackSrc="/placeholders/steel-1.svg"
                alt={activeProject.title}
                onLoad={() => setImageLoading(false)}
                className="relative z-[2] mx-auto h-full max-h-[74vh] w-full rounded-xl bg-[#06101a] object-contain"
              />
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-brand-navy/70 px-3 py-2.5">
              <p className="line-clamp-1 text-sm font-semibold text-white">{activeProject.title}</p>
              <p className="line-clamp-1 text-xs text-white/60">{activeProject.details}</p>
              <p className="mt-1 line-clamp-1 text-[11px] text-white/50">
                {[activeProject.location, activeProject.statusNote, activeProject.completedAt ? formatDate(activeProject.completedAt) : ""]
                  .filter(Boolean)
                  .join(" | ")}
              </p>
            </div>

            {totalImages > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {activeProject.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => {
                      setImageLoading(true);
                      setActiveImageIndex(index);
                    }}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition ${
                      activeImageIndex === index
                        ? "border-brand-yellow/70"
                        : "border-white/15 hover:border-white/35"
                    }`}
                  >
                    <FallbackImage
                      src={image}
                      fallbackSrc="/placeholders/steel-1.svg"
                      alt={`${activeProject.title} ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="sm:hidden fixed bottom-3 left-3 right-3 z-20 flex items-center justify-between rounded-full border border-white/15 bg-black/60 px-3 py-2 backdrop-blur">
              <button
                type="button"
                onClick={showPrev}
                disabled={totalImages <= 1}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                {activeImageIndex + 1} / {totalImages}
              </span>
              <button
                type="button"
                onClick={showNext}
                disabled={totalImages <= 1}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85 disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {prevImage && (
              <FallbackImage
                src={prevImage}
                fallbackSrc="/placeholders/steel-1.svg"
                alt=""
                aria-hidden
                className="hidden"
              />
            )}
            {nextImage && (
              <FallbackImage
                src={nextImage}
                fallbackSrc="/placeholders/steel-1.svg"
                alt=""
                aria-hidden
                className="hidden"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
