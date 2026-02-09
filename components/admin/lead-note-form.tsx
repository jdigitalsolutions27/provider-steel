"use client";

import { useEffect, useState, useTransition } from "react";
import { addLeadNote } from "@/app/admin/leads/actions";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

type NoteEvent = {
  id: string;
  createdAt: Date | string;
  newValue?: string | null;
  user?: { id?: string | null; name?: string | null; avatarUrl?: string | null } | null;
};

export function LeadNoteForm({
  leadId,
  notes,
  currentUserId,
  readOnly
}: {
  leadId: string;
  notes: NoteEvent[];
  currentUserId?: string;
  readOnly?: boolean;
}) {
  const [note, setNote] = useState("");
  const [items, setItems] = useState<NoteEvent[]>(notes);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const fetchNotes = async () => {
    const response = await fetch(`/api/leads/${leadId}/notes`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { notes: NoteEvent[] };
    setItems(data.notes || []);
  };

  useEffect(() => {
    setItems(notes);
  }, [notes]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchNotes();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [leadId]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-white/60">No notes yet. Start the conversation.</p>
        ) : (
          items.map((item) => {
            const isMine = item.user?.id && item.user.id === currentUserId;
            const createdAt =
              item.createdAt instanceof Date
                ? item.createdAt
                : new Date(item.createdAt);
            return (
              <div
                key={item.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                {!isMine && (
                  <div className="mr-2 h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    {item.user?.avatarUrl ? (
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/70">
                        {item.user?.name?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl border px-4 py-3 text-sm ${
                    isMine
                      ? "border-brand-yellow/40 bg-brand-yellow/15 text-white"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.newValue}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
                    {item.user?.name || "Staff"} · {formatDateTime(createdAt)}
                  </p>
                </div>
                {isMine && (
                  <div className="ml-2 h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    {item.user?.avatarUrl ? (
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/70">
                        {item.user?.name?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {!readOnly && (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Write a reply..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <button
            disabled={pending || !note.trim()}
            onClick={() =>
              startTransition(async () => {
                await addLeadNote(leadId, note.trim());
                setNote("");
                await fetchNotes();
                toast.push({ title: "Note sent", variant: "success" });
              })
            }
            className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send Reply"}
          </button>
        </div>
      )}
    </div>
  );
}
