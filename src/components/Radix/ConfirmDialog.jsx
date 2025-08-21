import React, { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import PropTypes from "prop-types";

/**
 * Generic confirm dialog using Radix AlertDialog.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The trigger element (button/link) that opens the dialog.
 * @param {() => (void|Promise<void>)} props.onConfirm - Called when user confirms.
 * @param {string} [props.title="Are you absolutely sure?"] - Dialog title.
 * @param {string} [props.description] - Optional description text.
 * @param {string} [props.confirmLabel="Confirm"] - Confirm button label.
 * @param {string} [props.cancelLabel="Cancel"] - Cancel button label.
 * @param {"default"|"destructive"} [props.variant="default"] - Styles the confirm button intent.
 * @param {boolean} [props.open] - Controlled open state.
 * @param {(open:boolean)=>void} [props.onOpenChange] - Controlled state change handler.
 * @returns {JSX.Element}
 */
export default function ConfirmDialog({
  children,
  onConfirm,
  title = "Are you absolutely sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  open: openProp,
  onOpenChange,
}) {
  // Controlled/uncontrolled support
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm?.();
    } finally {
      setLoading(false);
      setOpen?.(false);
    }
  };

  const confirmBtnBase =
    "inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60";
  const confirmBtnVariant =
    variant === "destructive"
      ? "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400"
      : "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-400";

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <AlertDialog.Title className="text-base font-semibold text-slate-900">
            {title}
          </AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="mt-1.5 text-sm text-slate-600">
              {description}
            </AlertDialog.Description>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`${confirmBtnBase} ${confirmBtnVariant}`}
              >
                {loading ? "Working..." : confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

ConfirmDialog.propTypes = {
  children: PropTypes.node.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(["default", "destructive"]),
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
};
