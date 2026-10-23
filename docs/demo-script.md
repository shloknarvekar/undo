# Undo demo video: script and recording guide

Everything needed to record Undo's demo video (under 3 minutes) from the live app, with nothing to install. The story,
the lines and the facts are here; how you shoot and cut it is your call.

**Live app:** https://undo-1c56.onrender.com

---

## What Undo is, in plain words

Read this once so the voiceover makes sense when you say it.

- **The problem:** AI assistants ("agents") can now shop for people. When one buys the wrong thing, nobody is clearly
  responsible, and the shop usually loses money.
- **Step 1, the rules:** you tell the agent what you want, like "black running shoes, size 10, under $120". Undo turns
  that into a *mandate*: a set of rules you sign on your own device. The agent can't change it.
- **Step 2, the guard:** before anything is paid, Undo checks the agent's choice against those rules. Wrong colour,
  too expensive, wrong size: blocked.
- **Step 3, money on hold:** PayPal only *holds* the money at first. For a while, you can undo for free.
- **Step 4, the undo:** if something went wrong, you press Undo. Undo works out whose fault it was and gives the money
  back the right way. If the AI agent messed up, the agent's company pays the shop back.
- **Extra safety nets:** if you allow it, the agent can pay by itself from your saved PayPal wallet, and the money is
  still only held. Shops give each agent a trust score from its record and can refuse risky agents or give their
  purchases more time to undo.

Everything uses PayPal's **sandbox** (test mode): real PayPal systems, test money. That's expected for the hackathon.

---

## Before you record (15 minutes, once)

1. **Make a free PayPal sandbox buyer.** You need it to approve the purchase in beat 4.
   1. Go to https://developer.paypal.com and click **Log in**. Use any PayPal account, or click **Sign Up** and create
      one (free).
   2. In the top menu, open **Testing Tools → Sandbox Accounts**.
   3. You'll see two accounts made for you. Find the one whose type is **Personal**.
   4. Click the **⋮** menu on that row, then **View/Edit account**. Copy the **Email ID** and **Password**.
   5. That email and password are what you type when PayPal asks you to log in during the demo. It's test money only.
2. **Use one browser for the whole recording**, desktop Chrome, window about 1440 px wide, zoom 100%. Your browser
   makes the signing key in beat 4, and only that same browser can press Undo in beat 5, so don't switch browsers or
   close an incognito window in between.
3. **Wake the app first.** Open https://undo-1c56.onrender.com and wait until it loads. It's normally awake; if it
   slept, the first load takes up to a minute.
4. **Do one dry run** of beats 4–6 before the real take, so you know where each button is.

---

## The story, beat by beat

Nine beats in about 2:50. The lines are suggestions in plain words: rephrase freely, but keep the order, because each
beat sets up the next.

| Time | Beat | What to show | What to say |
|---|---|---|---|
| 0:00–0:10 | **1. The problem** | Home page. Move the cursor over the hero so the grid lights up. | "AI assistants can already shop for us. But when one buys the wrong thing, who fixes it? Until now, nobody." |
| 0:10–0:17 | **2. The name** | Scroll to the big moving CTRL+Z strip. | "This is Undo: Control-Z for AI purchases, built on PayPal." |
| 0:17–0:45 | **3. The guard** | `/rogue`. Press **Let the agents loose**. Let the rows fill in, then scroll to the **Hijacked Agent** row and pause on *Hidden in the listing* and *Real AI · fooled*. End on the honest agent marked **Allowed**. | "One shopper signed a rule: a black hoodie, size M, under eighty dollars. Nine AI agents try to use it, and eight cheat: a pricier hoodie, the wrong size, a faked budget, a stolen rule. One is a real AI that read a note hidden in a product page and fell for it. Undo blocks every one and shows which rule caught it. Only the honest agent gets through." |
| 0:45–1:10 | **4. A real purchase** | `/shop`. Click the chip **Black men's running shoes, size 10, under $120**, tick **Demo: use a careless agent that skips Undo's checks**, press **Draft my mandate**. Show the mandate and the **Let the agent pay without asking me** option (leave it off), press **Sign & let the agent shop**, show the agent's pick, press **Approve in PayPal**, log in with your sandbox buyer, approve. End on the order page countdown and the words *held, not taken*. | "Now a real purchase. I tell the agent what I want and sign it on my own device, so it can't be changed. I could even let the agent pay by itself from my saved PayPal wallet. Either way, PayPal only holds the money. Nothing is taken yet." |
| 1:10–1:38 | **5. The undo** | On the order page press **Demo: close the window now** (the payment is captured). Press **Undo this purchase**, type "These are the wrong size", sign. Show the **Agent fault** verdict and the line that the agent's operator paid the merchant back. Optional, a second: the **Use my phone's camera** button in the Undo box. | "This careless agent bought the wrong size, and the money was already taken. I press Undo. For a wrong item I could even snap a photo with my phone. Undo checks what I signed against what was bought, finds the agent at fault, and refunds me in full. Then the agent's company pays the shop back, with PayPal Payouts." |
| 1:38–2:00 | **6. The proof** | Open one step in the **Event chain** that says *PayPal API*. Then **Verify in my browser** turning green, then **Now try to cheat → Change who's at fault** and the word **Caught.** | "Every step is saved on a tamper-proof record, with the exact PayPal action behind every dollar. And you don't have to trust us: your own browser re-checks it. Try to change who was at fault, and it's caught instantly." |
| 2:00–2:16 | **7. Any AI can plug in** | `/docs` (the API docs), scroll a little; or the *For agents* section on the home page with the MCP address. If you use Claude or another assistant that supports custom connectors, you can instead show it shopping through `https://undo-1c56.onrender.com/api/mcp` and being refused for a wrong size. | "And it isn't only our agent. Any AI assistant can plug into Undo through one address, and developers get full API docs and ready-made code libraries. Every agent hits the same checks." |
| 2:16–2:40 | **8. The shop's view** | `/merchant`. Your new order is at the top of the grid. Scroll to **Undo windows** (the timeline; lime bars can still be undone), then **Live activity**, then **Agent trust**: change a store rule and watch which agents it catches. | "Shops see every undo window on a live timeline, every agent order as it happens, who was at fault, and what the agents' companies have paid back. Each agent gets a trust score from its record, and the shop sets the rules: block risky agents, or give their purchases more time to undo." |
| 2:40–2:52 | **9. Close** | Home page, scrolled to the bottom: "Undo doesn't believe anyone. It checks." | "AI shopping will only be trusted when its mistakes can be undone. Undo. Built on PayPal." |

### Moments that must be on screen

Judges score these, so make sure each is visible and readable:

- **"8 of 8 rogue agents blocked"**, the Hijacked Agent marked *Real AI · fooled*, and the honest agent marked
  *Allowed*.
- The words ***held, not taken***: the payment waiting with a countdown.
- The **Agent fault** verdict and the line saying the agent's operator paid the merchant back.
- **Caught.** after *Change who's at fault*.
- One opened event-chain step showing a **PayPal API** action, so it's clear real PayPal calls happen.
- The **PayPal** name and the address **undo-1c56.onrender.com**, at least once.

---

## Facts to get right

Judges are PayPal engineers, so say these exactly, and nothing beyond them.

- **It's PayPal's sandbox.** Real PayPal systems, test money. Say "PayPal sandbox"; don't call it real money.
- **Money is held first, not taken.** That's what makes a free undo possible.
- **Four ways money goes back:** cancel the hold (free), a full refund, a claim against the shop, or a return. Undo
  picks one based on whose fault it was.
- **When the AI agent is at fault, the agent's company pays the shop back** through PayPal Payouts. This really happens
  in the demo.
- **Rules decide first, AI only when rules can't, and a person when it's close.** Avoid saying "the AI decides".
- **Any AI assistant can connect**, but the shopper always signs on their own device, never the AI.
- **The careless agent is a demo stand-in** for a badly behaved AI, not a real company.
- **The hijacked agent is a real AI (Google Gemini), genuinely fooled** by a note hidden in a product page. Undo
  doesn't need to spot the trick: the purchase still breaks the rules the shopper signed, so it's blocked.
- **The agent only pays by itself if the shopper allowed it** in what they signed, from a wallet they saved
  themselves. The money is still only held, with two extra hours to undo.
- **"Verify in my browser" runs in the viewer's own browser,** not on Undo's server. The cheat buttons only change a
  copy on screen.
- **Trust scores come from each agent's record at the shop:** clean purchases, faults, and blocked attempts.
- **Developers can build on it directly:** documented API at /docs, code libraries for TypeScript and Python, and a
  test collection that passes against the live app.

---

## If something goes wrong while recording

| What you see | What to do |
|---|---|
| The page takes a long time to load | The free server was asleep. Wait up to a minute; it stays awake after that. |
| "Too many tries" or a limit message | Wait one minute and try again. The demo shares free AI and catalog allowances. |
| The careless agent picked a size that looks right | Press **Change request** and draft again, or use the chip again. You want a size other than 10, so the fault is visible. |
| PayPal login fails | Check you copied the sandbox **Personal** account (not the Business one) from Testing Tools → Sandbox Accounts. |
| The verdict shows but no payout line | The payout takes about a minute to confirm. Refresh the order page. |
| The purchase flow won't cooperate on the day | Film beats 5 and 6 on the finished case instead: https://undo-1c56.onrender.com/orders/edd288bc-42d0-41d3-9b87-14915f3ff2c6 (agent fault, full refund, operator payout, $116.97). It's the same real record; the banner at the top just says you're viewing someone else's purchase. |
| The **Undo this purchase** button is grey | You're in a different browser from the one that signed. Use the same browser window for beats 4 and 5. |

The timeline on the merchant page shows the library's "trial version" watermark. That's expected.

---

## Links

| What | Address |
|---|---|
| Live app | https://undo-1c56.onrender.com |
| Rogue agents (beat 3) | https://undo-1c56.onrender.com/rogue |
| Shop (beat 4) | https://undo-1c56.onrender.com/shop |
| Finished agent-fault case (fallback for beats 5–6) | https://undo-1c56.onrender.com/orders/edd288bc-42d0-41d3-9b87-14915f3ff2c6 |
| API docs (beat 7) | https://undo-1c56.onrender.com/docs |
| Merchant console (beat 8) | https://undo-1c56.onrender.com/merchant |
| Threat model (good B-roll) | https://undo-1c56.onrender.com/security |
| Code (for the video description) | https://github.com/shloknarvekar/undo |
| Screenshots | [`docs/screenshots`](screenshots) |

When it's done, upload to YouTube (public or unlisted), and put the link and the code link in the video description.
