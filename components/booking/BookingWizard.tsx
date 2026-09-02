"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Clapperboard,
  CalendarClock,
  SlidersHorizontal,
  Truck,
  Shirt,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import {
  CONFIRMATION_STATUSES,
  LIVE_RECORDED,
  TRANSPORTATION_TYPES,
  DRESS_CODES,
  STATUS_HEX,
} from "@/lib/utils";
import type { Person, Program, Channel, Location } from "@/lib/types";
import {
  createBooking,
  updateBooking,
  detectConflict,
  type BookingInput,
} from "@/services/bookings";

interface WizardProps {
  people: Person[];
  programs: Program[];
  channels: Channel[];
  locations: Location[];
  initial?: any;
  editMode?: boolean;
}

const STEPS = [
  { id: 1, label: "Person", icon: User },
  { id: 2, label: "Program", icon: Clapperboard },
  { id: 3, label: "Schedule", icon: CalendarClock },
  { id: 4, label: "Production", icon: SlidersHorizontal },
  { id: 5, label: "Transport", icon: Truck },
  { id: 6, label: "Dress", icon: Shirt },
  { id: 7, label: "Review", icon: CheckCircle2 },
];

export function BookingWizard({ people, programs, channels, locations, initial, editMode }: WizardProps) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState<{ conflict: boolean; reason?: string }>({
    conflict: false,
  });

  const [form, setForm] = useState<BookingInput>({
    person_id: initial?.person_id ?? null,
    guest_ids: initial?.guest_ids ?? (initial?.person_id ? [initial.person_id] : []),
    program_id: initial?.program_id ?? null,
    channel_id: initial?.channel_id ?? null,
    production_date: initial?.production_date ?? null,
    call_time: initial?.call_time ?? null,
    start_time: initial?.start_time ?? null,
    end_time: initial?.end_time ?? null,
    live_recorded: initial?.live_recorded ?? "Recorded",
    episode_number: initial?.episode_number ?? null,
    recorded_episodes_count: initial?.recorded_episodes_count ?? null,
    location_id: initial?.location_id ?? null,
    location_ids: [],
    extra_notes: initial?.extra_notes ?? null,
    requirements: initial?.requirements ?? {},
    transportation: initial?.transportation ?? { type: "Car" },
    dress_code: initial?.dress_code ?? { code: "TV Appropriate" },
  });
  const [newPerson, setNewPerson] = useState<Partial<Person>>({});

  function set<K extends keyof BookingInput>(k: K, v: BookingInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // auto-populate channel + defaults from selected program
  function onProgramSelect(programId: string | null) {
    set("program_id", programId);
    const p = programs.find((x) => x.id === programId);
    if (p) {
      setForm((f) => ({
        ...f,
        channel_id: p.channel_id ?? f.channel_id,
        location_id: f.location_id ?? null,
    location_ids: f.location_ids ?? [],
        requirements: {
          ...f.requirements,
          place_in: f.requirements?.place_in || p.default_place_in || "",
          top_camera: f.requirements?.top_camera || p.default_top_camera || "",
        },
      }));
    }
  }

  const errors: Record<number, string[]> = {};
  if (step === 1 && (!form.guest_ids || form.guest_ids.length === 0) && !newPerson.full_name) {
    errors[1] = ["Select at least one guest (or create a new one)."];
  }
  if (step === 2 && !form.program_id) errors[2] = ["Select or create a program."];
  if (step === 3) {
    const e: string[] = [];
    if (!form.production_date) e.push("Production date is required.");
    if (!form.call_time) e.push("Call time is required.");
    if (form.start_time && form.end_time && form.start_time > form.end_time)
      e.push("Start time must be before end time.");
    errors[3] = e;
  }

  async function checkConflict() {
    const res = await detectConflict(form.person_id, form.production_date, initial?.id);
    setConflict(res);
  }

  function canNext() {
    return !errors[step] || errors[step].length === 0;
  }

  async function submit() {
    setSubmitting(true);
    try {
      // If a new person was typed, create them first via the crud service
      let personId = form.person_id;
      const guestIds = new Set<string>(form.guest_ids ?? []);
      if (!personId && newPerson.full_name) {
        const fd = new FormData();
        fd.append("full_name", newPerson.full_name);
        fd.append("whatsapp", newPerson.whatsapp ?? "");
        fd.append("email", newPerson.email ?? "");
        fd.append("company", newPerson.company ?? "");
        fd.append("department", newPerson.department ?? "");
        fd.append("notes", newPerson.notes ?? "");
        const res = await fetch("/api/people", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.ok) {
          toast("error", json.message || "Failed to create guest.");
          setSubmitting(false);
          return;
        }
        const newId = json.id;
        personId = newId;
        set("person_id", newId);
        guestIds.add(newId);
      }

      const payload: BookingInput = { ...form, person_id: personId ?? (guestIds.size ? Array.from(guestIds)[0] : null), guest_ids: Array.from(guestIds) };
      const result = editMode
        ? await updateBooking(initial.id, payload)
        : await createBooking(payload);
      if (!result.ok) {
        toast("error", result.message);
        setSubmitting(false);
        return;
      }
      toast("success", result.message);
      router.push(`/bookings/${result.bookingId}`);
      router.refresh();
    } catch {
      toast("error", "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const selectedProgram = programs.find((p) => p.id === form.program_id);
  const selectedGuests = (form.guest_ids ?? []).map((id) => people.find((p) => p.id === id)).filter(Boolean) as Person[];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Booking Request</h1>
          <p className="page-subtitle">Log a production booking request into the production queue.</p>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border-2 border-black bg-surface p-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = s.id === step;
            const done = s.id < step;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "group flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-2 text-fg"
                      : done
                        ? "text-primary"
                        : "text-muted hover:text-fg",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-xs",
                      active
                        ? "bg-primary text-primary-fg"
                        : done
                          ? "bg-primary/15 text-primary"
                          : "bg-surface text-muted",
                    )}
                  >
                    {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                  </span>
                  <span className="hidden text-xs font-medium sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className="mx-1 h-4 w-px bg-border/70" />}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="section-title">Person / People</h2>
              <p className="muted mt-1">Add everyone taking part in this shooting. The first selected person is the primary contact.</p>
            </div>
            <div>
              <label className="label">Add people</label>
              <SearchableSelect
                multiple
                options={people.map((p) => ({
                  value: p.id,
                  label: p.full_name,
                  sub: [p.company, p.whatsapp].filter(Boolean).join(" · "),
                }))}
                value={form.guest_ids ?? []}
                onChange={(v: string | string[] | null) => {
                  const arr = Array.isArray(v) ? v : v ? [v] : [];
                  set("guest_ids", arr);
                  if (arr.length) set("person_id", arr[0]);
                  else set("person_id", null);
                  setNewPerson({});
                }}
                placeholder="Search and select people…"
                allowCreate
                createLabel="Create person"
                onCreate={(name) => setNewPerson({ full_name: name })}
              />
            </div>

            {!form.guest_ids?.length && (
              <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                <p className="text-sm font-medium text-fg">New person details</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input className="input" placeholder="Full name *" value={newPerson.full_name ?? ""} onChange={(e) => setNewPerson((p) => ({ ...p, full_name: e.target.value }))} />
                  <input className="input" placeholder="WhatsApp number" value={newPerson.whatsapp ?? ""} onChange={(e) => setNewPerson((p) => ({ ...p, whatsapp: e.target.value }))} />
                  <input className="input" placeholder="Email" value={newPerson.email ?? ""} onChange={(e) => setNewPerson((p) => ({ ...p, email: e.target.value }))} />
                  <input className="input" placeholder="Company / Organization" value={newPerson.company ?? ""} onChange={(e) => setNewPerson((p) => ({ ...p, company: e.target.value }))} />
                  <input className="input" placeholder="Department" value={newPerson.department ?? ""} onChange={(e) => setNewPerson((p) => ({ ...p, department: e.target.value }))} />
                </div>
                <textarea className="input mt-3 min-h-[60px]" placeholder="Notes" value={newPerson.notes ?? ""} onChange={(e) => setNewPerson((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            )}
            {selectedGuests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedGuests.map((g, i) => (
                  <span key={g.id} className="chip bg-surface-2 text-fg border border-border">{g.full_name}{i === 0 ? " · Primary" : ""}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="section-title">Program</h2>
              <p className="muted mt-1">Choose the program and channel for this production.</p>
            </div>
            <div>
              <label className="label">Select program</label>
              <SearchableSelect
                options={programs.map((p) => ({ value: p.id, label: p.name, sub: p.company ?? "" }))}
                value={form.program_id}
                onChange={onProgramSelect}
                placeholder="Search programs…"
                allowCreate
                createLabel="Create program"
                onCreate={(name) => {
                  const fd = new FormData();
                  fd.append("name", name);
                  fetch("/api/programs", { method: "POST", body: fd }).then(async (r) => {
                    const json = await r.json();
                    if (json.ok) {
                      router.refresh();
                      onProgramSelect(json.id);
                      toast("success", "Program created.");
                    }
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Channel</label>
                <SearchableSelect
                  options={channels.map((c) => ({ value: c.id, label: c.name }))}
                  value={form.channel_id}
                  onChange={(v) => set("channel_id", v)}
                  placeholder="Select channel"
                />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input" placeholder="Company" value={selectedProgram?.company ?? ""} readOnly={!!selectedProgram} onChange={() => {}} />
              </div>
              <div>
                <label className="label">Episode number</label>
                <input className="input" placeholder="EP-204" value={form.episode_number ?? ""} onChange={(e) => set("episode_number", e.target.value)} />
              </div>
              <div>
                <label className="label">Live / Recorded</label>
                <div className="flex gap-2">
                  {LIVE_RECORDED.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("live_recorded", t)}
                      className={cn(
                        "btn flex-1",
                        form.live_recorded === t ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted border border-border",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {form.live_recorded === "Recorded" && (
                <div>
                  <label className="label"># Episodes (if recorded)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 12"
                    value={form.recorded_episodes_count ?? ""}
                    onChange={(e) => set("recorded_episodes_count", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="section-title">Schedule</h2>
              <p className="muted mt-1">Set the date, time, and location for this production.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Production date *</label>
                <input type="date" className="input" value={form.production_date ?? ""} onChange={(e) => { set("production_date", e.target.value); setConflict({ conflict: false }); }} onBlur={checkConflict} />
              </div>
              <div>
                <label className="label">Location</label>
                <SearchableSelect
                  multiple
                  options={locations.map((l) => ({ value: l.id, label: l.name, sub: l.address ?? "" }))}
                  value={form.location_ids ?? []}
                  onChange={(v) => set("location_ids", v)}
                  placeholder="Select locations"
                  allowCreate
                  createLabel="Add location"
                  onCreate={(name) => {
                    const fd = new FormData();
                    fd.append("name", name);
                    fetch("/api/locations", { method: "POST", body: fd }).then(async (r) => {
                      const json = await r.json();
                      if (json.ok) { router.refresh(); toast("success", "Location added."); }
                    });
                  }}
                />
              </div>
              <div>
                <label className="label">Call time</label>
                <input type="time" className="input" value={form.call_time ?? ""} onChange={(e) => set("call_time", e.target.value)} />
              </div>
              <div>
                <label className="label">Start time</label>
                <input type="time" className="input" value={form.start_time ?? ""} onChange={(e) => set("start_time", e.target.value)} />
              </div>
              <div>
                <label className="label">End time</label>
                <input type="time" className="input" value={form.end_time ?? ""} onChange={(e) => set("end_time", e.target.value)} />
              </div>
            </div>
            <textarea className="input min-h-[60px]" placeholder="Additional schedule notes" value={form.extra_notes ?? ""} onChange={(e) => set("extra_notes", e.target.value)} />

            {conflict.conflict && (
              <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Scheduling Conflict</p>
                  <p className="text-warning/90">{conflict.reason}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="section-title">Production Requirements</h2>
              <p className="muted mt-1">Camera placements and timing details.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                <SlidersHorizontal size={16} /> Place-In Camera
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input className="input" placeholder="Place-In" value={form.requirements?.place_in ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), place_in: e.target.value })} />
                <input type="time" className="input" placeholder="Time" value={form.requirements?.place_in_time ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), place_in_time: e.target.value })} />
                <input className="input" placeholder="Location" value={form.requirements?.place_in_location ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), place_in_location: e.target.value })} />
              </div>
              <textarea className="input mt-3 min-h-[50px]" placeholder="Place-In notes" value={form.requirements?.place_in_notes ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), place_in_notes: e.target.value })} />
            </div>
            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-accent">
                <SlidersHorizontal size={16} /> Top Camera
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input className="input" placeholder="Top Camera" value={form.requirements?.top_camera ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), top_camera: e.target.value })} />
                <input type="time" className="input" placeholder="Time" value={form.requirements?.top_camera_time ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), top_camera_time: e.target.value })} />
                <input className="input" placeholder="Location" value={form.requirements?.top_camera_location ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), top_camera_location: e.target.value })} />
              </div>
              <textarea className="input mt-3 min-h-[50px]" placeholder="Top Camera notes" value={form.requirements?.top_camera_notes ?? ""} onChange={(e) => set("requirements", { ...(form.requirements ?? {}), top_camera_notes: e.target.value })} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="section-title">Transportation</h2>
              <p className="muted mt-1">Travel and logistics for the production team.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Type</label>
                <input className="input" placeholder="Transport type" value={form.transportation?.type ?? ""} onChange={(e) => set("transportation", { ...(form.transportation ?? {}), type: e.target.value } as any)} />
              </div>
              <div>
                <label className="label">Departure time</label>
                <input type="time" className="input" value={form.transportation?.departure_time ?? ""} onChange={(e) => set("transportation", { ...(form.transportation ?? {}), departure_time: e.target.value } as any)} />
              </div>
              <div>
                <label className="label">Pickup location</label>
                <input className="input" placeholder="Pickup location" value={form.transportation?.pickup_location ?? ""} onChange={(e) => set("transportation", { ...(form.transportation ?? {}), pickup_location: e.target.value } as any)} />
              </div>
              <div>
                <label className="label">Driver</label>
                <input className="input" placeholder="Driver name" value={form.transportation?.driver ?? ""} onChange={(e) => set("transportation", { ...(form.transportation ?? {}), driver: e.target.value } as any)} />
              </div>
            </div>
            <textarea className="input min-h-[60px]" placeholder="Transportation notes" value={form.transportation?.notes ?? ""} onChange={(e) => set("transportation", { ...(form.transportation ?? {}), notes: e.target.value } as any)} />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="section-title">Dress Code</h2>
              <p className="muted mt-1">Set the expected dress code for this production.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Code</label>
                <input className="input" placeholder="Dress code" value={form.dress_code?.code ?? ""} onChange={(e) => set("dress_code", { ...(form.dress_code ?? {}), code: e.target.value } as any)} />
              </div>
            </div>
            <textarea className="input min-h-[60px]" placeholder="Dress code notes" value={form.dress_code?.notes ?? ""} onChange={(e) => set("dress_code", { ...(form.dress_code ?? {}), notes: e.target.value } as any)} />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-5">
            <div>
              <h2 className="section-title">Review</h2>
              <p className="muted mt-1">Confirm details before submitting the booking request.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface-2/40 p-3">
                <p className="text-xs font-medium text-muted">Person</p>
                <p className="mt-1 text-sm text-fg">{selectedGuests[0]?.full_name ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2/40 p-3">
                <p className="text-xs font-medium text-muted">Program</p>
                <p className="mt-1 text-sm text-fg">{selectedProgram?.name ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2/40 p-3">
                <p className="text-xs font-medium text-muted">Date</p>
                <p className="mt-1 text-sm text-fg">{form.production_date ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2/40 p-3">
                <p className="text-xs font-medium text-muted">Status</p>
                <p className="mt-1 text-sm text-fg">Pending Confirmation</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button type="button" disabled={step === 1} onClick={() => setStep((s) => s - 1)} className="btn-ghost disabled:opacity-30">
            <ChevronLeft size={15} /> Back
          </button>
          <div className="flex items-center gap-2">
            {errors[step] && errors[step].length > 0 && step < 7 && (
              <span className="text-xs text-danger">{errors[step].map((e) => `• ${e}`).join(" ")}</span>
            )}
            {step < 7 ? (
              <button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className="btn-primary disabled:opacity-30">
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button type="button" disabled={submitting} onClick={submit} className="btn-primary disabled:opacity-30">
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
