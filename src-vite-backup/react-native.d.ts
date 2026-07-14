declare module "react-native" {
  import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from "react";

  export type NativeWebComponentProps = HTMLAttributes<HTMLElement>;

  export const View: ForwardRefExoticComponent<
    NativeWebComponentProps & RefAttributes<HTMLDivElement>
  >;
  export const Text: ForwardRefExoticComponent<
    NativeWebComponentProps & RefAttributes<HTMLSpanElement>
  >;
}
