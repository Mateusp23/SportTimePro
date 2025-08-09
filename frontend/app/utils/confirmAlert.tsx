// utils/confirmAlert.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import Alert, { AlertProps } from "@/app/components/Alert";

type ConfirmOptions = Omit<
  Extract<AlertProps, { onConfirm: any; onCancel: any }>,
  "onConfirm" | "onCancel"
>;

export function confirmAlert(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const mount = document.createElement("div");
    document.body.appendChild(mount);
    const root = createRoot(mount);

    const cleanup = () => {
      root.unmount();
      mount.remove();
    };

    root.render(
      <Alert
        {...opts}
        onConfirm={() => {
          cleanup();
          resolve(true);
        }}
        onCancel={() => {
          cleanup();
          resolve(false);
        }}
      />
    );
  });
}
