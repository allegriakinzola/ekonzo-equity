function pad2(n: string) {
  return n.padStart(2, "0");
}

export function parseDob(value: string) {
  const t = value.trim();
  const eu = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (eu) return { day: pad2(eu[1]), month: pad2(eu[2]), year: eu[3] };
  const iso = t.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (iso) return { day: pad2(iso[3]), month: pad2(iso[2]), year: iso[1] };
  const dm = t.match(/^(\d{1,2})[/\-.](\d{1,2})$/);
  if (dm) return { day: pad2(dm[1]), month: pad2(dm[2]), year: "" };
  return { day: "", month: "", year: "" };
}

/** Affiche JJ/MM — l'année reste stockée mais n'est pas montrée. */
export function displayDobWithoutYear(value: string) {
  const { day, month } = parseDob(value);
  return day && month ? `${day}/${month}` : "";
}

export function mergeDobKeepingYear(display: string, original: string) {
  const shown = parseDob(display);
  const orig = parseDob(original);
  if (!shown.day || !shown.month) return original;
  if (!orig.year) return `${shown.day}/${shown.month}`;
  return `${shown.day}/${shown.month}/${orig.year}`;
}
