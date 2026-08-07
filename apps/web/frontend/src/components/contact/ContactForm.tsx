"use client";

import { useRef, useState } from "react";
import { Select, TextArea, TextInput } from "@/components/form/fields";
import { FormCard } from "@/components/form/FormCard";
import { FormSuccessCard } from "@/components/form/FormSuccessCard";
import { buildBody, mailtoHref } from "@/components/form/mailto";

const TOPICS: ReadonlyArray<{ value: string; inbox: string; team: string }> = [
  { value: "Sales", inbox: "sales@veracity.dev", team: "sales" },
  { value: "Support", inbox: "support@veracity.dev", team: "support" },
  { value: "Privacy & compliance", inbox: "privacy@veracity.dev", team: "privacy and compliance" },
  { value: "Billing", inbox: "billing@veracity.dev", team: "billing" },
  { value: "Something else", inbox: "sales@veracity.dev", team: "sales" },
];
const TOPIC_LABELS = TOPICS.map((topic) => topic.value);

type Values = {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValues: Values = {
  name: "",
  email: "",
  company: "",
  topic: "",
  message: "",
};

function validateField(field: keyof Values, value: string): string | undefined {
  switch (field) {
    case "name":
      return value.trim() ? undefined : "Please enter your name.";
    case "email":
      if (!value.trim()) return "Please enter your work email.";
      if (!EMAIL_RE.test(value.trim())) return "That email doesn't look right. Try name@company.com";
      return undefined;
    case "topic":
      return value ? undefined : "Please choose a topic.";
    case "message":
      return value.trim().length >= 10 ? undefined : "Please tell us a little more (at least 10 characters).";
    default:
      return undefined;
  }
}

function validate(values: Values): Errors {
  const errors: Errors = {};
  (Object.keys(initialValues) as Array<keyof Values>).forEach((field) => {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

function inboxForTopic(topic: string): string {
  return TOPICS.find((item) => item.value === topic)?.inbox ?? "sales@veracity.dev";
}

function teamForTopic(topic: string): string {
  return TOPICS.find((item) => item.value === topic)?.team ?? "sales";
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function setField(field: keyof Values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur(field: keyof Values) {
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = (Object.keys(nextErrors) as Array<keyof Values>).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        ?.focus();
      return;
    }

    const subject = `Website inquiry - ${values.topic}`;
    const inbox = inboxForTopic(values.topic);
    const body = buildBody([
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      values.company.trim() ? `Company: ${values.company.trim()}` : null,
      "",
      values.message.trim(),
    ]);
    window.location.href = mailtoHref({ to: inbox, subject, body });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <FormSuccessCard
        eyebrow="SEND A MESSAGE"
        note="REPLIES WITHIN ONE BUSINESS DAY"
        heading="Thanks - we&apos;re on it."
        fallbackEmail={inboxForTopic(values.topic)}
      >
        We&apos;ll reply to{" "}
        <span className="font-semibold text-ink">{values.email}</span> within one business day. Your
        message goes straight to our{" "}
        <span className="font-semibold text-ink">{teamForTopic(values.topic)}</span> team. If your
        email client opened a draft, just hit send and we&apos;ll take it from there.
      </FormSuccessCard>
    );
  }

  return (
    <FormCard eyebrow="SEND A MESSAGE" note="REPLIES WITHIN ONE BUSINESS DAY">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="px-5 py-6 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="contact-name"
            name="name"
            label="Full name"
            required
            autoComplete="name"
            value={values.name}
            onChange={(value) => setField("name", value)}
            onBlur={() => handleBlur("name")}
            error={errors.name}
          />
          <TextInput
            id="contact-email"
            name="email"
            label="Work email"
            required
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(value) => setField("email", value)}
            onBlur={() => handleBlur("email")}
            error={errors.email}
          />
          <TextInput
            id="contact-company"
            name="company"
            label="Company"
            optional
            autoComplete="organization"
            value={values.company}
            onChange={(value) => setField("company", value)}
          />
          <Select
            id="contact-topic"
            name="topic"
            label="What&apos;s this about?"
            required
            placeholder="Choose a topic"
            options={TOPIC_LABELS}
            value={values.topic}
            onChange={(value) => setField("topic", value)}
            onBlur={() => handleBlur("topic")}
            error={errors.topic}
          />
          <div className="sm:col-span-2">
            <TextArea
              id="contact-message"
              name="message"
              label="Message"
              required
              rows={5}
              value={values.message}
              onChange={(value) => setField("message", value)}
              onBlur={() => handleBlur("message")}
              error={errors.message}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary">
            Send message
          </button>
          <p className="text-sm font-medium text-muted">
            We reply to every message - usually within one business day.
          </p>
        </div>
      </form>
    </FormCard>
  );
}
