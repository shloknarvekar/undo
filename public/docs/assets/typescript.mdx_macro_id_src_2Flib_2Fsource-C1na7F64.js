import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{t}from"./jsx-runtime-LKYXHABd.js";import{n,t as r}from"./server.browser-CRtpYEZZ.js";var i=e(t()),a={title:`TypeScript SDK`,description:`Install and start using the TypeScript SDK.`};function o(e){if(!r())return null;let t=n(e.components);return(0,i.jsxs)(i.Fragment,{children:[`

`,(0,i.jsx)(t.SdkActions,{download:`/__downloads/sdk/typescript.zip`,source:``,packageUrl:``,registry:``}),`

## Intro [#intro]

The Undo API SDK provides access to the Undo API REST APIs.

Ctrl+Z for AI agent purchases, built on PayPal.

Undo sits between a shopping agent and PayPal. A shopper signs a mandate (what the agent may buy, for how much)
with a key that never leaves their device. The agent shops inside it, PayPal only **authorizes** the money, and
an undo window opens. Pressing Undo runs a fault check and routes the money: a free void inside the window, or a
refund, a merchant claim or a return after capture. When the agent was at fault, its operator pays the merchant
back through PayPal Payouts. Every step is written to a hash-chained event log anyone can verify.

**Signing.** Mandates and undo requests are signed with Ed25519 by the shopper's device key. The API never
signs for a shopper. The exact strings to sign are given with each operation.

**Sandbox.** This deployment runs on the PayPal sandbox; no real money moves. Costly endpoints are rate limited
per visitor and answer \`429\` with a \`Retry-After\` header when the limit or the free-tier budget is reached.

**Agents.** Third-party agents usually connect over MCP (Streamable HTTP at \`/api/mcp\`, JSON-RPC, not described
here). This document covers the HTTP API that the web app, agents and merchants call directly.

## Installation [#installation]

The SDK compiles to \`dist/\` before it can be referenced — run its \`build\` script once in the SDK folder, then add it to your project by path:

\`\`\`bash
npm install <path-to-sdk>
\`\`\`

## Quick Start [#quick-start]

Create one client and reuse it. Configure its behaviour through \`ClientOptions\`.

\`\`\`ts
import { UndoApiClient } from "undo-api";

const client = new UndoApiClient({});
\`\`\`

Nothing in \`ClientOptions\` is required — \`new UndoApiClient()\` compiles — and each option left out falls back to its default. This API declares one environment, so there is no environment to select and no host to state at the construction site.

### From CommonJS [#from-commonjs]

The package ships both dialects from a single entry, so \`require\` works with full types. In a TypeScript CommonJS file use the \`import ... = require(...)\` form — a plain destructuring \`require\` runs fine but gives you \`any\`.

\`\`\`ts
import sdk = require("undo-api");

const client = new sdk.UndoApiClient({});
\`\`\`
`]})}var s={contents:[{heading:`intro`,content:`The Undo API SDK provides access to the Undo API REST APIs.`},{heading:`intro`,content:`Ctrl+Z for AI agent purchases, built on PayPal.`},{heading:`intro`,content:`Undo sits between a shopping agent and PayPal. A shopper signs a mandate (what the agent may buy, for how much)
with a key that never leaves their device. The agent shops inside it, PayPal only **authorizes** the money, and
an undo window opens. Pressing Undo runs a fault check and routes the money: a free void inside the window, or a
refund, a merchant claim or a return after capture. When the agent was at fault, its operator pays the merchant
back through PayPal Payouts. Every step is written to a hash-chained event log anyone can verify.`},{heading:`intro`,content:`**Signing.** Mandates and undo requests are signed with Ed25519 by the shopper's device key. The API never
signs for a shopper. The exact strings to sign are given with each operation.`},{heading:`intro`,content:"**Sandbox.** This deployment runs on the PayPal sandbox; no real money moves. Costly endpoints are rate limited\nper visitor and answer `429` with a `Retry-After` header when the limit or the free-tier budget is reached."},{heading:`intro`,content:"**Agents.** Third-party agents usually connect over MCP (Streamable HTTP at `/api/mcp`, JSON-RPC, not described\nhere). This document covers the HTTP API that the web app, agents and merchants call directly."},{heading:`installation`,content:"The SDK compiles to `dist/` before it can be referenced — run its `build` script once in the SDK folder, then add it to your project by path:"},{heading:`quick-start`,content:"Create one client and reuse it. Configure its behaviour through `ClientOptions`."},{heading:`quick-start`,content:"Nothing in `ClientOptions` is required — `new UndoApiClient()` compiles — and each option left out falls back to its default. This API declares one environment, so there is no environment to select and no host to state at the construction site."},{heading:`from-commonjs`,content:"The package ships both dialects from a single entry, so `require` works with full types. In a TypeScript CommonJS file use the `import ... = require(...)` form — a plain destructuring `require` runs fine but gives you `any`."}],headings:[{id:`intro`,content:`Intro`},{id:`installation`,content:`Installation`},{id:`quick-start`,content:`Quick Start`},{id:`from-commonjs`,content:`From CommonJS`}]},c=[{depth:2,url:`#intro`,title:(0,i.jsx)(i.Fragment,{children:`Intro`})},{depth:2,url:`#installation`,title:(0,i.jsx)(i.Fragment,{children:`Installation`})},{depth:2,url:`#quick-start`,title:(0,i.jsx)(i.Fragment,{children:`Quick Start`})},{depth:3,url:`#from-commonjs`,title:(0,i.jsx)(i.Fragment,{children:`From CommonJS`})}];function l(e){let t={code:`code`,h2:`h2`,h3:`h3`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,...e.components},{SdkActions:n}=t;return n||d(`SdkActions`,!0),(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n,{download:`/__downloads/sdk/typescript.zip`,source:``,packageUrl:``,registry:``}),`
`,(0,i.jsx)(t.h2,{id:`intro`,children:`Intro`}),`
`,(0,i.jsx)(t.p,{children:`The Undo API SDK provides access to the Undo API REST APIs.`}),`
`,(0,i.jsx)(t.p,{children:`Ctrl+Z for AI agent purchases, built on PayPal.`}),`
`,(0,i.jsxs)(t.p,{children:[`Undo sits between a shopping agent and PayPal. A shopper signs a mandate (what the agent may buy, for how much)
with a key that never leaves their device. The agent shops inside it, PayPal only `,(0,i.jsx)(t.strong,{children:`authorizes`}),` the money, and
an undo window opens. Pressing Undo runs a fault check and routes the money: a free void inside the window, or a
refund, a merchant claim or a return after capture. When the agent was at fault, its operator pays the merchant
back through PayPal Payouts. Every step is written to a hash-chained event log anyone can verify.`]}),`
`,(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:`Signing.`}),` Mandates and undo requests are signed with Ed25519 by the shopper's device key. The API never
signs for a shopper. The exact strings to sign are given with each operation.`]}),`
`,(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:`Sandbox.`}),` This deployment runs on the PayPal sandbox; no real money moves. Costly endpoints are rate limited
per visitor and answer `,(0,i.jsx)(t.code,{children:`429`}),` with a `,(0,i.jsx)(t.code,{children:`Retry-After`}),` header when the limit or the free-tier budget is reached.`]}),`
`,(0,i.jsxs)(t.p,{children:[(0,i.jsx)(t.strong,{children:`Agents.`}),` Third-party agents usually connect over MCP (Streamable HTTP at `,(0,i.jsx)(t.code,{children:`/api/mcp`}),`, JSON-RPC, not described
here). This document covers the HTTP API that the web app, agents and merchants call directly.`]}),`
`,(0,i.jsx)(t.h2,{id:`installation`,children:`Installation`}),`
`,(0,i.jsxs)(t.p,{children:[`The SDK compiles to `,(0,i.jsx)(t.code,{children:`dist/`}),` before it can be referenced — run its `,(0,i.jsx)(t.code,{children:`build`}),` script once in the SDK folder, then add it to your project by path:`]}),`
`,(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,title:`Terminal`,children:(0,i.jsx)(t.code,{children:(0,i.jsxs)(t.span,{className:`line`,children:[(0,i.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`npm`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` install`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`path-to-sd`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`k`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`})]})})})}),`
`,(0,i.jsx)(t.h2,{id:`quick-start`,children:`Quick Start`}),`
`,(0,i.jsxs)(t.p,{children:[`Create one client and reuse it. Configure its behaviour through `,(0,i.jsx)(t.code,{children:`ClientOptions`}),`.`]}),`
`,(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,title:`TypeScript`,children:(0,i.jsxs)(t.code,{children:[(0,i.jsxs)(t.span,{className:`line`,children:[(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`import`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` { UndoApiClient } `}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`from`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` "undo-api"`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`;`})]}),`
`,(0,i.jsx)(t.span,{className:`line`}),`
`,(0,i.jsxs)(t.span,{className:`line`,children:[(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`const`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` client`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` =`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` new`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` UndoApiClient`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`({});`})]})]})})}),`
`,(0,i.jsxs)(t.p,{children:[`Nothing in `,(0,i.jsx)(t.code,{children:`ClientOptions`}),` is required — `,(0,i.jsx)(t.code,{children:`new UndoApiClient()`}),` compiles — and each option left out falls back to its default. This API declares one environment, so there is no environment to select and no host to state at the construction site.`]}),`
`,(0,i.jsx)(t.h3,{id:`from-commonjs`,children:`From CommonJS`}),`
`,(0,i.jsxs)(t.p,{children:[`The package ships both dialects from a single entry, so `,(0,i.jsx)(t.code,{children:`require`}),` works with full types. In a TypeScript CommonJS file use the `,(0,i.jsx)(t.code,{children:`import ... = require(...)`}),` form — a plain destructuring `,(0,i.jsx)(t.code,{children:`require`}),` runs fine but gives you `,(0,i.jsx)(t.code,{children:`any`}),`.`]}),`
`,(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,title:`TypeScript`,children:(0,i.jsxs)(t.code,{children:[(0,i.jsxs)(t.span,{className:`line`,children:[(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`import`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` sdk `}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`=`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` require`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`(`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`"undo-api"`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`);`})]}),`
`,(0,i.jsx)(t.span,{className:`line`}),`
`,(0,i.jsxs)(t.span,{className:`line`,children:[(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`const`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` client`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` =`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` new`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` sdk.`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`UndoApiClient`}),(0,i.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`({});`})]})]})})})]})}function u(e={}){let{wrapper:t}=e.components||{};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(l,{...e})}):l(e)}function d(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{o as _markdown,u as default,a as frontmatter,s as structuredData,c as toc};