import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
  hideHeadingText = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
  hideHeadingText?: boolean;
}) {
  const wasOpen = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  if (open && !wasOpen.current)
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  wasOpen.current = open;
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="dialog-overlay" />
        <D.Content
          className={`dialog-content ${wide ? "dialog-wide" : ""}`}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected) opener.current.focus();
          }}
        >
          <div className={`dialog-heading${hideHeadingText ? " dialog-heading-compact" : ""}`}>
            <div className={hideHeadingText ? "sr-only" : undefined}>
              <D.Title>{title}</D.Title>
              <D.Description className={description ? "" : "sr-only"}>
                {description ?? title}
              </D.Description>
            </div>
            <D.Close className="icon-button" aria-label="Закрыть">
              <X size={22} />
            </D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
