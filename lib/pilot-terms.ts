export function hasAcceptedPilotTerms(form: FormData) {
  return form.get("accept_terms") === "accepted";
}
