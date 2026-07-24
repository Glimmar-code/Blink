import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

type NativeWebProps = HTMLAttributes<HTMLElement>;

export const View = forwardRef<HTMLDivElement, NativeWebProps>(function View(
  { children, ...props },
  ref
) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

export const Text = forwardRef<HTMLSpanElement, NativeWebProps>(function Text(
  { children, ...props },
  ref
) {
  return (
    <span ref={ref} {...props}>
      {children}
    </span>
  );
});
