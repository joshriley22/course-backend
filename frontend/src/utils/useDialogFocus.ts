import { useEffect, useRef } from 'react';

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Opens a native <dialog> as a modal for as long as the component is mounted.
 * Attach the returned ref to the <dialog>. The browser does the keyboard work:
 * showModal() moves focus inside, makes the rest of the page inert (no Tab,
 * no screen reader), and fires `cancel` on Escape, which we route to onClose
 * so React stays in charge of unmounting (and the exit animation still plays).
 *
 * The component unmounts rather than calling close(), so focus is returned
 * here: to whatever opened the dialog, or, if that element has since gone (a
 * graph card that collapsed when focus left it), to its nearest focusable
 * ancestor such as the course node.
 */
export function useDialogFocus(onClose: () => void) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    // Latest onClose without re-running the effect; parents often pass a new arrow each render.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const openerFallback = opener?.parentElement?.closest<HTMLElement>(FOCUSABLE) ?? null;

        if (!dialog.open) dialog.showModal();

        const onCancel = (e: Event) => {
            e.preventDefault();
            onCloseRef.current();
        };
        // Browsers may still close the dialog themselves (e.g. a repeated Escape); keep React in sync.
        // The `close` event is queued, so it can arrive after a re-run of this effect has
        // reopened the dialog (React StrictMode mounts effects twice); ignore it then.
        const onNativeClose = () => {
            if (!dialog.open) onCloseRef.current();
        };
        dialog.addEventListener('cancel', onCancel);
        dialog.addEventListener('close', onNativeClose);

        return () => {
            dialog.removeEventListener('cancel', onCancel);
            dialog.removeEventListener('close', onNativeClose);
            if (dialog.open) dialog.close();
            const target = opener?.isConnected ? opener : openerFallback?.isConnected ? openerFallback : null;
            target?.focus({ preventScroll: true });
        };
    }, []);

    return dialogRef;
}
