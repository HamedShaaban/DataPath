/** Keep diagnostic stacks/types; remove learner data and free-form error text. */
export function sanitizeTelemetry<
  T extends {
    user?: unknown;
    request?: unknown;
    extra?: unknown;
    contexts?: unknown;
    breadcrumbs?: unknown;
    message?: string;
    exception?: { values?: Array<{ value?: string }> };
  },
>(event: T): T {
  delete event.user;
  delete event.request;
  delete event.extra;
  delete event.contexts;
  delete event.breadcrumbs;
  if (event.message) event.message = "Application error";
  event.exception?.values?.forEach(value => {
    value.value = "Error details withheld to protect learner data";
  });
  return event;
}
