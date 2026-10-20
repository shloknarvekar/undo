import type { CoreClientOptions } from "./core/client-options.js";

export type ClientOptions = SdkClientOptions & CoreClientOptions;

type SdkClientOptions = ServerOptions;

type ServerOptions = {
  /** The live sandbox deployment. PayPal sandbox only; no real money moves. */
  readonly serverOptions?: {
    baseUrl?: string;
  };
};
