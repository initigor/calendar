"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  addDays,
  addMonths,
  addWeeks,
  dateKey,
  getWeekDays,
} from "@/lib/date-utils";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import YearView from "@/components/calendar/YearView";
import DayEventsSheet from "@/components/calendar/DayEventsSheet";
import EventForm from "@/components/calendar/EventForm";
import MembersModal from "@/components/calendar/MembersModal";
import InstallPrompt from "@/components/InstallPrompt";
import type { CalendarEvent, EnvironmentMember } from "@/lib/types";

export type ViewMode = "day" | "week" | "month" | "year";

interface EnvironmentInfo {
  id: string;
  nama: string;
  owner_id: string;
  invite_code: string;
}

export default function CalendarApp({
  environment,
  members,
  myEnvironments,
  currentUserId,
}: {
  environment: EnvironmentInfo;
  members: EnvironmentMember[];
  myEnvironments: { id: string; nama: string }[];
  currentUserId: string;
}) {
  const supabase = createClient();

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<Date | null>(null);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  const memberIds = useMemo(() => members.map((m) => m.user_id), [members]);

  // Events belong to a person, not an environment — an environment only
  // decides who can see whose calendar. Fetching by the current environment's
  // member list (rather than a stored environment_id on the event) means
  // editing an event once updates it everywhere that person's calendar is visible.
  const fetchEvents = useCallback(async () => {
    if (memberIds.length === 0) {
      setEvents([]);
      return;
    }
    const { data } = await supabase
      .from("events")
      .select("*")
      .in("owner_user_id", memberIds)
      .order("tanggal");
    setEvents(data ?? []);
  }, [supabase, memberIds]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (memberIds.length === 0) return;
    const channel = supabase
      .channel(`events-${environment.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `owner_user_id=in.(${memberIds.join(",")})`,
        },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, environment.id, memberIds, fetchEvents]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      (map[ev.tanggal] ??= []).push(ev);
    }
    return map;
  }, [events]);

  const memberNames = useMemo(
    () =>
      Object.fromEntries(members.map((m) => [m.user_id, m.profiles?.username ?? "Anggota"])),
    [members]
  );

  function handlePrev() {
    if (viewMode === "day") setAnchor((d) => addDays(d, -1));
    else if (viewMode === "week") setAnchor((d) => addWeeks(d, -1));
    else if (viewMode === "month") setAnchor((d) => addMonths(d, -1));
    else setAnchor((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1));
  }

  function handleNext() {
    if (viewMode === "day") setAnchor((d) => addDays(d, 1));
    else if (viewMode === "week") setAnchor((d) => addWeeks(d, 1));
    else if (viewMode === "month") setAnchor((d) => addMonths(d, 1));
    else setAnchor((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1));
  }

  function openAddForDay(date: Date) {
    setFormDefaultDate(date);
    setEditingEvent(null);
    setEventFormOpen(true);
  }

  function openEdit(ev: CalendarEvent) {
    setEditingEvent(ev);
    setFormDefaultDate(null);
    setEventFormOpen(true);
  }

  async function handleDelete(ev: CalendarEvent) {
    if (!confirm(`Hapus "${ev.judul}"?`)) return;
    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    await supabase.from("events").delete().eq("id", ev.id);
  }

  const selectedDayEvents = selectedDay ? eventsByDate[dateKey(selectedDay)] ?? [] : [];

  return (
    <div className="min-h-dvh flex flex-col safe-bottom">
      <CalendarHeader
        environmentId={environment.id}
        environmentName={environment.nama}
        environmentOptions={myEnvironments}
        viewMode={viewMode}
        onChangeView={setViewMode}
        anchor={anchor}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={() => setAnchor(new Date())}
        onOpenMembers={() => setMembersModalOpen(true)}
      />

      <div className="px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <InstallPrompt />
      </div>

      <div className="flex-1 mt-2">
        {viewMode === "month" && (
          <MonthView anchor={anchor} eventsByDate={eventsByDate} onSelectDay={setSelectedDay} />
        )}
        {viewMode === "week" && (
          <WeekView
            days={getWeekDays(anchor)}
            eventsByDate={eventsByDate}
            onSelectDay={setSelectedDay}
            onSelectEvent={openEdit}
          />
        )}
        {viewMode === "day" && (
          <WeekView
            days={[anchor]}
            eventsByDate={eventsByDate}
            onSelectDay={setSelectedDay}
            onSelectEvent={openEdit}
          />
        )}
        {viewMode === "year" && (
          <YearView
            anchor={anchor}
            eventsByDate={eventsByDate}
            onSelectMonth={(m) => {
              setAnchor(new Date(anchor.getFullYear(), m, 1));
              setViewMode("month");
            }}
          />
        )}
      </div>

      {viewMode !== "year" && (
        <button
          onClick={() => openAddForDay(selectedDay ?? anchor)}
          className="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-brand text-white text-2xl shadow-lg active:bg-brand-dark flex items-center justify-center z-30"
          aria-label="Tambah kegiatan"
        >
          +
        </button>
      )}

      <DayEventsSheet
        date={selectedDay}
        events={selectedDayEvents}
        memberNames={memberNames}
        currentUserId={currentUserId}
        onClose={() => setSelectedDay(null)}
        onAdd={() => selectedDay && openAddForDay(selectedDay)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <EventForm
        open={eventFormOpen}
        onClose={() => setEventFormOpen(false)}
        defaultDate={formDefaultDate}
        editingEvent={editingEvent}
        currentUserId={currentUserId}
        onSaved={() => {
          setEventFormOpen(false);
          fetchEvents();
        }}
      />

      <MembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        environment={environment}
        members={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
