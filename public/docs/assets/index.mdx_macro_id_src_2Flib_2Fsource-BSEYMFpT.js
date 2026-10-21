import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{t}from"./jsx-runtime-LKYXHABd.js";var n=e(t()),r={title:`Undo API`,description:`Ctrl+Z for AI agent purchases, built on PayPal.`},i=`

AI agents can already buy things for people. Undo makes those purchases reversible and makes it clear who pays when one goes wrong.

A shopper signs a **mandate**: what an agent may buy and for how much. The signature comes from a key that never leaves their device. The agent shops inside that mandate, PayPal only **authorizes** the money, and an undo window opens. If something is wrong, the shopper presses Undo. A fault check decides who was at fault, and the money moves:

* **Inside the window:** a free void. The hold is released and no money moves.
* **After capture:** a refund, a claim sent to the merchant, or a return. Unclear cases go to a person.
* **Agent at fault:** the agent's operator pays the merchant back through PayPal Payouts.

Every step is written to a hash-chained event log, and anyone can check it without trusting Undo.

<Callout type="warn" title="Sandbox">
  This API runs on the PayPal sandbox. No real money moves. Costly endpoints are rate limited per visitor; see [Errors and limits](/guides/errors-and-limits).
</Callout>

## Start here [#start-here]

<Cards>
  <Card title="Quickstart" href="/guides/quickstart">
    Read a real finished order in one call, with curl, TypeScript or Python.
  </Card>

  <Card title="How Undo works" href="/guides/how-undo-works">
    Mandates, held payments, the undo window, verdicts and payouts.
  </Card>

  <Card title="Signing" href="/guides/signing">
    The exact strings a shopper's device signs, with working code.
  </Card>

  <Card title="Verify an order yourself" href="/guides/verify-evidence">
    Re-check every hash and signature on an order with 40 lines of Node.
  </Card>

  <Card title="API Reference" href="/api">
    Every operation, with real examples and a live playground.
  </Card>

  <Card title="SDKs" href="/sdks">
    Typed clients for TypeScript, Python and C#.
  </Card>
</Cards>

## Base URL [#base-url]

\`\`\`text
https://undo-1c56.onrender.com
\`\`\`

There's no sign-in. Anything a shopper authorizes, like a mandate or an Undo, carries an Ed25519 signature from their device instead.
`,a={contents:[{heading:void 0,content:`AI agents can already buy things for people. Undo makes those purchases reversible and makes it clear who pays when one goes wrong.`},{heading:void 0,content:`A shopper signs a **mandate**: what an agent may buy and for how much. The signature comes from a key that never leaves their device. The agent shops inside that mandate, PayPal only **authorizes** the money, and an undo window opens. If something is wrong, the shopper presses Undo. A fault check decides who was at fault, and the money moves:`},{heading:void 0,content:`**Inside the window:** a free void. The hold is released and no money moves.`},{heading:void 0,content:`**After capture:** a refund, a claim sent to the merchant, or a return. Unclear cases go to a person.`},{heading:void 0,content:`**Agent at fault:** the agent's operator pays the merchant back through PayPal Payouts.`},{heading:void 0,content:`Every step is written to a hash-chained event log, and anyone can check it without trusting Undo.`},{heading:void 0,content:`This API runs on the PayPal sandbox. No real money moves. Costly endpoints are rate limited per visitor; see Errors and limits.`},{heading:`start-here`,content:`Read a real finished order in one call, with curl, TypeScript or Python.`},{heading:`start-here`,content:`Mandates, held payments, the undo window, verdicts and payouts.`},{heading:`start-here`,content:`The exact strings a shopper's device signs, with working code.`},{heading:`start-here`,content:`Re-check every hash and signature on an order with 40 lines of Node.`},{heading:`start-here`,content:`Every operation, with real examples and a live playground.`},{heading:`start-here`,content:`Typed clients for TypeScript, Python and C#.`},{heading:`base-url`,content:`There's no sign-in. Anything a shopper authorizes, like a mandate or an Undo, carries an Ed25519 signature from their device instead.`}],headings:[{id:`start-here`,content:`Start here`},{id:`base-url`,content:`Base URL`}]},o=[{depth:2,url:`#start-here`,title:(0,n.jsx)(n.Fragment,{children:`Start here`})},{depth:2,url:`#base-url`,title:(0,n.jsx)(n.Fragment,{children:`Base URL`})}];function s(e){let t={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,ul:`ul`,...e.components},{Callout:r,Card:i,Cards:a}=t;return r||l(`Callout`,!0),i||l(`Card`,!0),a||l(`Cards`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.p,{children:`AI agents can already buy things for people. Undo makes those purchases reversible and makes it clear who pays when one goes wrong.`}),`
`,(0,n.jsxs)(t.p,{children:[`A shopper signs a `,(0,n.jsx)(t.strong,{children:`mandate`}),`: what an agent may buy and for how much. The signature comes from a key that never leaves their device. The agent shops inside that mandate, PayPal only `,(0,n.jsx)(t.strong,{children:`authorizes`}),` the money, and an undo window opens. If something is wrong, the shopper presses Undo. A fault check decides who was at fault, and the money moves:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Inside the window:`}),` a free void. The hold is released and no money moves.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`After capture:`}),` a refund, a claim sent to the merchant, or a return. Unclear cases go to a person.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Agent at fault:`}),` the agent's operator pays the merchant back through PayPal Payouts.`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`Every step is written to a hash-chained event log, and anyone can check it without trusting Undo.`}),`
`,(0,n.jsx)(r,{type:`warn`,title:`Sandbox`,children:(0,n.jsxs)(t.p,{children:[`This API runs on the PayPal sandbox. No real money moves. Costly endpoints are rate limited per visitor; see `,(0,n.jsx)(t.a,{href:`/guides/errors-and-limits`,children:`Errors and limits`}),`.`]})}),`
`,(0,n.jsx)(t.h2,{id:`start-here`,children:`Start here`}),`
`,(0,n.jsxs)(a,{children:[(0,n.jsx)(i,{title:`Quickstart`,href:`/guides/quickstart`,children:(0,n.jsx)(t.p,{children:`Read a real finished order in one call, with curl, TypeScript or Python.`})}),(0,n.jsx)(i,{title:`How Undo works`,href:`/guides/how-undo-works`,children:(0,n.jsx)(t.p,{children:`Mandates, held payments, the undo window, verdicts and payouts.`})}),(0,n.jsx)(i,{title:`Signing`,href:`/guides/signing`,children:(0,n.jsx)(t.p,{children:`The exact strings a shopper's device signs, with working code.`})}),(0,n.jsx)(i,{title:`Verify an order yourself`,href:`/guides/verify-evidence`,children:(0,n.jsx)(t.p,{children:`Re-check every hash and signature on an order with 40 lines of Node.`})}),(0,n.jsx)(i,{title:`API Reference`,href:`/api`,children:(0,n.jsx)(t.p,{children:`Every operation, with real examples and a live playground.`})}),(0,n.jsx)(i,{title:`SDKs`,href:`/sdks`,children:(0,n.jsx)(t.p,{children:`Typed clients for TypeScript, Python and C#.`})})]}),`
`,(0,n.jsx)(t.h2,{id:`base-url`,children:`Base URL`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`https://undo-1c56.onrender.com`})})})})}),`
`,(0,n.jsx)(t.p,{children:`There's no sign-in. Anything a shopper authorizes, like a mandate or an Undo, carries an Ed25519 signature from their device instead.`})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};