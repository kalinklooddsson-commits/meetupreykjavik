"use client";

import { startTransition, useMemo, useState } from "react";
import {
  Building2,
  CalendarRange,
  Camera,
  CheckCheck,
  CreditCard,
  Globe,
  MapPinned,
  Receipt,
  ScrollText,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { venueTiers } from "@/lib/public-data";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { writeSessionDraft } from "@/lib/storage/session-drafts";
import { cn } from "@/lib/utils";

type VenueOnboardingWizardProps = {
  ownerName: string;
};

const steps = [
  { key: "account", label: "Account + terms", icon: ScrollText },
  { key: "business", label: "Business identity", icon: Building2 },
  { key: "location", label: "Address + capacity", icon: MapPinned },
  { key: "story", label: "Description + amenities", icon: Sparkles },
  { key: "media", label: "Photos + hero", icon: Camera },
  { key: "hours", label: "Hours + availability", icon: CalendarRange },
  { key: "deals", label: "Deals + tier", icon: UtensilsCrossed },
  { key: "contact", label: "Contacts + socials", icon: Globe },
  { key: "billing", label: "Billing + legal", icon: CreditCard },
  { key: "review", label: "Review + submit", icon: CheckCheck },
] as const;

const sectionClassName =
  "conversion-panel rounded-[1.5rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5";

const partnershipTierDetails = {
  free: venueTiers[0],
  standard: venueTiers[1],
  premium: venueTiers[2],
} as const;

function createInitialForm() {
  return {
    acceptedTerms: false,
    ownerName: "",
    businessName: "",
    legalName: "",
    kennitala: "",
    venueType: "bar",
    address: "",
    area: "101 Reykjavik",
    capacitySeated: 40,
    capacityStanding: 80,
    summary: "",
    description: "",
    amenities: "",
    galleryNotes: "",
    heroDirection: "",
    openingHours: "",
    availabilityRules: "",
    dealTitle: "",
    dealType: "",
    partnershipTier: "free",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    instagram: "",
    billingContact: "",
    invoiceEmail: "",
    legalAccepted: false,
    readyForReview: false,
  };
}

function stepIsReady(stepIndex: number, form: ReturnType<typeof createInitialForm>) {
  switch (stepIndex) {
    case 0:
      return form.acceptedTerms;
    case 1:
      return Boolean(form.businessName.trim() && form.kennitala.trim());
    case 2:
      return Boolean(form.address.trim() && form.capacityStanding > 0);
    case 3:
      return Boolean(form.summary.trim() && form.description.replace(/<[^>]*>/g, "").trim().length >= 100);
    case 4:
      return Boolean(form.galleryNotes.trim() && form.heroDirection.trim());
    case 5:
      return Boolean(form.openingHours.trim() && form.availabilityRules.trim());
    case 6:
      return Boolean(form.dealTitle.trim() && form.partnershipTier);
    case 7:
      return Boolean(form.contactName.trim() && form.email.trim());
    case 8:
      return Boolean(form.billingContact.trim() && form.invoiceEmail.trim() && form.legalAccepted);
    case 9:
      return form.readyForReview;
    default:
      return false;
  }
}

export function VenueOnboardingWizard({
  ownerName,
}: VenueOnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(createInitialForm);
  const [message, setMessage] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(createInitialForm()));

  const completion = Math.round(
    (steps.filter((_, index) => stepIsReady(index, form)).length / steps.length) * 100,
  );
  const amenities = useMemo(
    () =>
      form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12),
    [form.amenities],
  );
  const selectedTierDetails = partnershipTierDetails[
    form.partnershipTier as keyof typeof partnershipTierDetails
  ];
  const isDirty = JSON.stringify(form) !== savedSnapshot;

  /** The highest step the user can navigate to (all prior steps must be complete). */
  const highestReachableStep = useMemo(() => {
    let max = 0;
    for (let i = 0; i < steps.length; i++) {
      if (!stepIsReady(i, form)) break;
      max = i + 1;
    }
    return max;
  }, [form]);

  useUnsavedChangesWarning(isDirty);

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function moveStep(direction: "back" | "forward") {
    startTransition(() => {
      setStep((current) =>
        direction === "back"
          ? Math.max(current - 1, 0)
          : Math.min(current + 1, steps.length - 1),
      );
    });
  }

  async function saveDraft(action: "draft" | "review") {
    writeSessionDraft(
      "meetupreykjavik-venue-onboarding",
      {
        ...form,
        amenities,
        status: action === "review" ? "ready_for_review" : "draft",
      },
    );
    setSavedSnapshot(JSON.stringify(form));

    if (action === "review") {
      setMessage("Submitting venue application...");
      try {
        const response = await fetch("/api/venues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.businessName,
            legal_name: form.legalName,
            kennitala: form.kennitala,
            type: form.venueType,
            description: form.description,
            address: form.address,
            city: "Reykjavik",
            capacity_seated: form.capacitySeated || null,
            capacity_standing: form.capacityStanding || null,
            capacity_total: (form.capacitySeated || 0) + (form.capacityStanding || 0) || null,
            amenities: amenities,
            phone: form.phone,
            email: form.email,
            website: form.website,
            opening_hours: form.openingHours || null,
            partnership_tier: form.partnershipTier || "free",
          }),
        });
        const result = await response.json();
        if (result.ok) {
          setMessage("Venue application submitted! Redirecting…");
          setTimeout(() => { window.location.href = result.slug ? `/venues/${result.slug}` : "/venues"; }, 1200);
        } else {
          setMessage(`Server: ${result.details?.formErrors?.[0] ?? result.error ?? "Unknown error"}`);
        }
      } catch {
        setMessage("Could not reach the server. Please try again later.");
      }
    } else {
      setMessage("Venue onboarding draft saved locally. Nothing has been submitted or deployed.");
    }
  }

  return (
    <div className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[290px_1fr_350px]">
        <aside className={sectionClassName}>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
            Ten-step onboarding
          </div>
          <h1 className="font-editorial mt-4 text-4xl tracking-[-0.05em] text-brand-text">
            Venue partner onboarding
          </h1>
          <p className="mt-4 text-sm leading-7 text-brand-text-muted">
            Capture the business identity, venue profile, availability, deals, contacts,
            and billing details the platform needs before a venue can be reviewed and approved.
          </p>
          <div className="mt-6 rounded-[1.3rem] bg-[rgba(245,240,232,0.84)] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                Completion
              </span>
              <span className="text-sm font-semibold text-brand-text">
                {completion}%
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/80">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,var(--brand-indigo),var(--brand-coral))]"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {steps.map((item, index) => (
              <button
                key={item.key}
                type="button"
                disabled={index > highestReachableStep && index !== step}
                onClick={() => setStep(index)}
                className={cn(
                  "wizard-step-card flex w-full items-center gap-3 rounded-[1.1rem] border px-4 py-3 text-left transition",
                  step === index
                    ? "wizard-step-card-active border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                    : index > highestReachableStep
                      ? "cursor-not-allowed border-[rgba(153,148,168,0.08)] bg-white/40 opacity-50"
                      : "border-[rgba(153,148,168,0.12)] bg-white/78",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                    stepIsReady(index, form)
                      ? "bg-[rgba(124,154,130,0.14)] text-brand-sage"
                      : "bg-[rgba(245,240,232,0.94)] text-brand-text-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-brand-text">
                    Step {index + 1}
                  </div>
                  <div className="text-xs text-brand-text-muted">{item.label}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          {step === 0 ? (
            <section className={sectionClassName}>
              <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4">
                <div className="font-semibold text-brand-text">
                  Account owner
                </div>
                <p className="mt-2 text-sm leading-7 text-brand-text-muted">
                  {ownerName} is currently preparing this venue application locally. Nothing is being submitted to external services yet.
                </p>
              </div>
              <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-brand-text">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(event) => updateField("acceptedTerms", event.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-coral"
                />
                I accept the local draft workflow and will complete the remaining steps before review
              </label>
            </section>
          ) : null}

          {step === 1 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Business name
                  <input
                    id="venue-business-name"
                    name="businessName"
                    value={form.businessName}
                    onChange={(event) => updateField("businessName", event.target.value)}
                    placeholder="Lebowski Bar"
                    autoComplete="organization"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Legal name
                  <input
                    value={form.legalName}
                    onChange={(event) => updateField("legalName", event.target.value)}
                    placeholder="Lebowski Reykjavik ehf."
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Kennitala
                  <input
                    value={form.kennitala}
                    onChange={(event) => updateField("kennitala", event.target.value)}
                    placeholder="000000-0000"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Venue type
                  <select
                    value={form.venueType}
                    onChange={(event) => updateField("venueType", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    <option value="bar">Bar</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="club">Club</option>
                    <option value="cafe">Cafe</option>
                    <option value="coworking">Coworking</option>
                    <option value="studio">Studio</option>
                  </select>
                </label>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Address
                  <input
                    id="venue-address"
                    name="address"
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="Laugavegur 20a, 101 Reykjavik"
                    autoComplete="street-address"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Area
                  <input
                    value={form.area}
                    onChange={(event) => updateField("area", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Seated capacity
                  <input
                    type="number"
                    min={0}
                    value={form.capacitySeated}
                    onChange={(event) =>
                      updateField("capacitySeated", Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Standing capacity
                  <input
                    type="number"
                    min={0}
                    value={form.capacityStanding}
                    onChange={(event) =>
                      updateField("capacityStanding", Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className={sectionClassName}>
              <label className="block text-sm font-semibold text-brand-text">
                Public summary
                <textarea
                  value={form.summary}
                  onChange={(event) => updateField("summary", event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                />
              </label>
              <div className="mt-5 block text-sm font-semibold text-brand-text">
                Full description
                <RichTextEditor
                  content={form.description}
                  onChange={(html) => updateField("description", html)}
                  placeholder="Describe your venue — atmosphere, layout, what makes it great for events…"
                  className="mt-2"
                />
              </div>
              <label className="mt-5 block text-sm font-semibold text-brand-text">
                Amenities
                <input
                  value={form.amenities}
                  onChange={(event) => updateField("amenities", event.target.value)}
                  placeholder="host desk, group seating, projector"
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                />
              </label>
            </section>
          ) : null}

          {step === 4 ? (
            <section className={sectionClassName}>
              <label className="block text-sm font-semibold text-brand-text">
                Gallery notes
                <textarea
                  value={form.galleryNotes}
                  onChange={(event) => updateField("galleryNotes", event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                />
              </label>
              <div className="mt-5 block text-sm font-semibold text-brand-text">
                Hero photo
                <ImageUpload
                  value={form.heroDirection}
                  onChange={(url) => updateField("heroDirection", url)}
                  label="Drop venue hero image here"
                  hint="PNG, JPG or WebP up to 5 MB"
                  aspectHint="16:9 recommended"
                  className="mt-2"
                />
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section className={sectionClassName}>
              <label className="block text-sm font-semibold text-brand-text">
                Opening hours
                <textarea
                  value={form.openingHours}
                  onChange={(event) => updateField("openingHours", event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                />
              </label>
              <label className="mt-5 block text-sm font-semibold text-brand-text">
                Availability rules
                <textarea
                  value={form.availabilityRules}
                  onChange={(event) => updateField("availabilityRules", event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                />
              </label>
            </section>
          ) : null}

          {step === 6 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Deal title
                  <input
                    value={form.dealTitle}
                    onChange={(event) => updateField("dealTitle", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Deal type
                  <select
                    value={form.dealType}
                    onChange={(event) => updateField("dealType", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    <option value="welcome_drink">Welcome drink</option>
                    <option value="happy_hour">Happy hour</option>
                    <option value="percentage">Percentage off</option>
                    <option value="group_package">Group package</option>
                  </select>
                </label>
              </div>
              <label className="mt-5 block text-sm font-semibold text-brand-text">
                Partnership tier
                <select
                  value={form.partnershipTier}
                  onChange={(event) => updateField("partnershipTier", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                >
                  <option value="free">Venue Listing - 0 ISK</option>
                  <option value="standard">Venue Partner - 9,900 ISK / mo</option>
                  <option value="premium">Venue Premium - 19,900 ISK / mo</option>
                </select>
              </label>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {Object.entries(partnershipTierDetails).map(([tierKey, tier]) => (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => updateField("partnershipTier", tierKey)}
                    className={cn(
                      "rounded-[1.2rem] border p-4 text-left transition",
                      form.partnershipTier === tierKey
                        ? "border-[rgba(79,70,229,0.22)] bg-[rgba(79,70,229,0.08)]"
                        : "border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.72)]",
                    )}
                  >
                    <div className="font-semibold text-brand-text">{tier.name}</div>
                    <div className="mt-2 text-sm font-semibold text-brand-indigo">
                      {tier.price}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-brand-text-muted">
                      {tier.description}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] px-4 py-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                  Selected plan
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="font-semibold text-brand-text">
                    {selectedTierDetails.name}
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-indigo">
                    {selectedTierDetails.price}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-brand-text-muted">
                  {selectedTierDetails.description}
                </p>
              </div>
            </section>
          ) : null}

          {step === 7 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Contact name
                  <input
                    id="venue-contact-name"
                    name="contactName"
                    value={form.contactName}
                    onChange={(event) => updateField("contactName", event.target.value)}
                    autoComplete="name"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Email
                  <input
                    id="venue-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <label className="block text-sm font-semibold text-brand-text">
                  Phone
                  <input
                    id="venue-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Website
                  <input
                    id="venue-website"
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                    autoComplete="url"
                    autoCapitalize="none"
                    inputMode="url"
                    spellCheck={false}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Instagram
                  <input
                    id="venue-instagram"
                    name="instagram"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={form.instagram}
                    onChange={(event) => updateField("instagram", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
            </section>
          ) : null}

          {step === 8 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Billing contact
                  <input
                    id="venue-billing-contact"
                    name="billingContact"
                    value={form.billingContact}
                    onChange={(event) => updateField("billingContact", event.target.value)}
                    autoComplete="name"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Invoice email
                  <input
                    id="venue-invoice-email"
                    name="invoiceEmail"
                    type="email"
                    value={form.invoiceEmail}
                    onChange={(event) => updateField("invoiceEmail", event.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
              <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-brand-text">
                <input
                  type="checkbox"
                  checked={form.legalAccepted}
                  onChange={(event) => updateField("legalAccepted", event.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-coral"
                />
                I confirm the legal and billing information is ready for a later live submission
              </label>
            </section>
          ) : null}

          {step === 9 ? (
            <section className={sectionClassName}>
              <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4">
                <div className="font-semibold text-brand-text">Review summary</div>
                <p className="mt-2 text-sm leading-7 text-brand-text-muted">
                  {form.businessName || "Venue name"} · {form.venueType} · {form.area} ·{" "}
                  {selectedTierDetails.name}
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-text-muted">
                  {form.summary}
                </p>
                <div className="mt-4 rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-brand-text">
                  Billing target: {selectedTierDetails.price}
                </div>
              </div>
              <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-brand-text">
                <input
                  type="checkbox"
                  checked={form.readyForReview}
                  onChange={(event) => updateField("readyForReview", event.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-coral"
                />
                Mark this venue onboarding flow ready for review
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => saveDraft("draft")}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[rgba(79,70,229,0.18)] bg-white px-5 py-3 text-sm font-bold text-brand-indigo transition hover:-translate-y-0.5"
                >
                  Save local draft
                  <Receipt className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => saveDraft("review")}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-coral px-5 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(232,97,77,0.24)] transition hover:-translate-y-0.5"
                >
                  Mark ready for review
                  <CheckCheck className="h-4 w-4" />
                </button>
              </div>

              {message ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 rounded-[1.1rem] border border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] px-4 py-3 text-sm text-brand-sage-dark"
                >
                  {message}
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => moveStep("back")}
              disabled={step === 0}
              className="inline-flex min-h-11 items-center rounded-full border border-[rgba(153,148,168,0.18)] bg-white/78 px-4 py-2 text-sm font-semibold text-brand-text disabled:opacity-50"
            >
              Back
            </button>
            <div className="text-sm text-brand-text-muted">
              Step {step + 1} of {steps.length}
            </div>
            <button
              type="button"
              onClick={() => moveStep("forward")}
              disabled={step === steps.length - 1 || !stepIsReady(step, form)}
              className="inline-flex min-h-11 items-center rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Next step
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <section className={sectionClassName}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
              Public profile preview
            </div>
            <div className="mt-4 overflow-hidden rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white">
              <div className="h-40 bg-[linear-gradient(135deg,rgba(30,27,46,1),rgba(232,97,77,0.84))]" />
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-1 text-xs font-semibold text-brand-indigo">
                    {form.venueType}
                  </span>
                  <span className="rounded-full bg-[rgba(245,240,232,0.92)] px-3 py-1 text-xs font-semibold text-brand-text">
                    {selectedTierDetails.name}
                  </span>
                </div>
                <div className={cn(
                  "font-editorial mt-4 text-3xl tracking-[-0.05em]",
                  form.businessName ? "text-brand-text" : "text-brand-text-muted italic",
                )}>
                  {form.businessName || "Venue name"}
                </div>
                <p className={cn(
                  "mt-3 text-sm leading-7",
                  form.summary ? "text-brand-text-muted" : "text-brand-text-muted/50 italic",
                )}>
                  {form.summary || "No summary yet"}
                </p>
                <div className="mt-4 grid gap-3">
                  <div className={cn(
                    "rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm",
                    form.address ? "text-brand-text" : "text-brand-text-muted italic",
                  )}>
                    {form.address || "Venue address"} · {form.area}
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                    {form.capacityStanding} standing · {form.capacitySeated} seated
                  </div>
                  <div className={cn(
                    "rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm",
                    form.dealTitle ? "text-brand-text" : "text-brand-text-muted italic",
                  )}>
                    Deal: {form.dealTitle || "No deal yet"}
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                    Plan: {selectedTierDetails.price}
                  </div>
                  {form.contactName || form.email ? (
                    <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                      {form.contactName}{form.contactName && form.email ? " · " : ""}{form.email}
                    </div>
                  ) : null}
                  {form.phone || form.website ? (
                    <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                      {form.phone}{form.phone && form.website ? " · " : ""}{form.website}
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {amenities.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[rgba(153,148,168,0.14)] px-3 py-1 text-xs font-semibold text-brand-text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
              Review notes
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Partner venues should explain the room and staff behavior, not just list amenities.",
                "Availability rules matter because organizers compare venue fit as much as venue quality.",
                "Paid venue plans should feel justified by bookings, recurring demand, and stronger organizer conversion.",
                "Billing and legal info stays local for now and will connect to the live provider setup later tonight.",
              ].map((note) => (
                <div
                  key={note}
                  className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-white/78 px-4 py-3 text-sm leading-7 text-brand-text-muted"
                >
                  {note}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
