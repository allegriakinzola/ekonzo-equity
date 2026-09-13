"use client";

import Swal from "sweetalert2";

const RED = "#a62626";
const GRAY = "#58595b";

export async function swalConfirm(opts: {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}) {
  const result = await Swal.fire({
    title: opts.title,
    text: opts.text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? "Confirmer",
    cancelButtonText: opts.cancelText ?? "Annuler",
    confirmButtonColor: RED,
    cancelButtonColor: GRAY,
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}

export function swalError(message: string, title = "Erreur") {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: RED,
  });
}

export function swalSuccess(message: string, title = "Succès") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: RED,
  });
}
