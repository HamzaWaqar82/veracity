export type LeadKind = "contact" | "demo" | "trial";

export type LeadPayload = {
  kind: LeadKind;
  name: string;
  email: string;
  company?: string;
  companySize?: string;
  coverage?: string;
  preferredTime?: string;
  topic?: string;
  message?: string;
  notes?: string;
};

export async function submitLead(payload: LeadPayload): Promise<boolean> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
