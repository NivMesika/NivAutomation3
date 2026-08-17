# STP: Automation Audit

**Feature:** [Guardrails → Automation Audit](https://guardio.app.getnotch.dev/config/guardrails?version=e2e-draft-msvp6l995n2q)  
**Validate:** [Tests → Playground](https://guardio.app.getnotch.dev/conversations/inbox/playground/bJTZxXckWbPLoD8Dmd7sG?updatedAt=last48h&category=Playground&version=e2e-draft-msvp6l995n2q)  
**Scope:** Emails patterns to unassign, Subjects, Words in User Message, Words in Assistant's Reply  
**Automation:** one E2E only — [RT-UM-01](#e2e-rt-um-01)

---

## Purpose / scope

Automation Audit decides whether the AI should handle an inbound email or unassign it and not send a reply.

| Field | Rule |
|---|---|
| Emails patterns to unassign (EP) | Sender address contains any pattern → unassign, do not reply |
| Subjects (SUB) | Subject contains any keyword → unassign, do not reply |
| Words in User Message (UM) | Inbound body contains any word → unassign, do not reply |
| Words in Assistant's Reply (AR) | Generated reply contains any word → do not send; unassign |

Out of scope: other Guardrails sections (except a light check they are unchanged), AI reply quality, automating the full catalog.

**How to run runtime cases:** configure the rule in Guardrails, open Playground fill Customer email / Subject / body, click **Send as customer**.

- Automation Audit match → **red / blocked** (email will not be sent)
- No Automation Audit match → **not blocked by Automation Audit**

---

## Assumptions

Until proven otherwise:

1. **OR within a field** and **OR across fields** — any one match is enough to unassign.
2. **No Automation Audit match → not blocked by Automation Audit** (another Guardrail or product rule may still prevent a reply).
3. **AR runs after generation** — inbound can be eligible, then outbound is blocked.
4. Empty fields are ignored.

| ID | Open question |
|---|---|
| Q1 | Case sensitive? (`Complaint` vs `complaint`) |
| Q2 | Whole word vs substring? (`sue` in `issue`) — copy says "words" for UM/AR, "contains" for EP/SUB |
| Q3 | Literal vs regex? (`.*`, `+`) |

Matching for Q1–Q3 is **exploratory**. Record actual behavior and compare it with the product requirement; do not treat one outcome as the expected result unless the requirement states it.


---

## Test cases

Priority: High / Medium / Low. CFG Cases apply to **each of the four fields** unless noted.

### Smoke

| ID | Title | P | Steps | Expected |
|---|---|---|---|---|
| SM-01 | Page loads in DEV | H | Open Guardrails URL | DEV banner; page loads |
| SM-02 | Section visible | H | Find Automation Audit | Title shown |
| SM-03 | Four fields + copy | H | Inspect EP, SUB, UM, AR | Labels, helper text, tag inputs present |
| SM-04 | Add and remove a tag | H | Add a tag; remove via `x` | Chip appears, then gone |

### Configuration

| ID | Title | P | Steps | Expected |
|---|---|---|---|---|
| CFG-01 | Add a tag | H | Type token, commit | One chip; input cleared |
| CFG-02 | Multiple tags | H | Add 3 distinct tokens | All three chips remain |
| CFG-03 | Remove middle tag | H | `x` on the middle chip | Only that tag removed |
| CFG-04 | Remove all | M | Clear every chip | Empty field = no rule for that field |
| CFG-05 | Commit via Enter | M | Type, Enter | Tag created |
| CFG-06 | Commit via blur | M | Type, click away | Record: commit vs discard |
| CFG-07 | Commit via comma | L | Type `token,` | Record if it splits |
| CFG-08 | Duplicate tag | H | Add the same token twice | No duplicate, or clear validation |
| CFG-09 | Duplicate with spaces | H | Existing `noreply`; add `  noreply  ` | Trimmed duplicate **or** distinct — record |
| CFG-10 | Empty commit | M | Enter on empty input | No empty chip |
| CFG-11 | Whitespace-only | M | Enter `   ` | No whitespace chip |
| CFG-12 | Trim | H | Enter `  complaint  ` | Stored as `complaint` unless documented otherwise |
| CFG-13 | Max length | M | Paste 1k+ chars | Limit / reject; page still usable |
| CFG-14 | Special characters | H | `noreply+tag`, `foo.bar`, `word-with-hyphen` | Stored literally |
| CFG-15 | Paste one token | M | Paste `complaint`, commit | One chip |
| CFG-16 | Paste a list | L | Paste `a, b, c` | Record split vs single tag |
| CFG-17 | Multi-word tag | M | Add `out of office` | One tag (see EDG-12) |
| CFG-18 | Remove then re-add | L | Remove a tag, add it again | Tag returns |

### Runtime — email patterns

Playground: set Customer email; keep subject/body clean unless noted.

| ID | Title | P | Config | Inbound | Expected |
|---|---|---|---|---|---|
| RT-EP-01 | Full address | H | `testroman1@test.com` | From that address | Blocked |
| RT-EP-02 | Substring `noreply` | H | `noreply` | `alerts-noreply@vendor.com` | Blocked |
| RT-EP-03 | Local-part | H | `noreply` | `noreply@customer.com` | Blocked |
| RT-EP-04 | No match | H | `noreply` | `person@customer.com` | Not blocked by AA |
| RT-EP-05 | Multi, first hits | H | `noreply`, `bounce@` | `noreply-system@x.com` | Blocked |
| RT-EP-06 | Multi, second hits | H | `noreply`, `bounce@` | `bounce@vendor.com` | Blocked |
| RT-EP-07 | Multi, none hit | H | `noreply`, `bounce@` | `ada@customer.com` | Not blocked by AA |
| RT-EP-08 | Domain pattern | M | `@test.com` | `anyone@test.com` | Record whether `@test.com` matches; compare with "contains" |
| RT-EP-09 | Plus-addressing | M | `user@test.com` | `user+qa@test.com` | Record actual match behavior; compare with the requirement |
| RT-EP-10 | Display vs address | M | `noreply` | Playground email `person@customer.com` | Match the address field, not a display name |

### Runtime — subjects

Playground: clean sender/body; set Subject.

| ID | Title | P | Config | Subject | Expected |
|---|---|---|---|---|---|
| RT-SUB-01 | Equals keyword | H | `complaint` | `complaint` | Blocked |
| RT-SUB-02 | Keyword in the middle | H | `complaint` | `Re: billing complaint #12` | Blocked |
| RT-SUB-03 | Keyword as prefix | H | `complaint` | `complaint about order` | Blocked |
| RT-SUB-04 | No match | H | `complaint` | `Order status please` | Not blocked by AA |
| RT-SUB-05 | Multi, any one hits | H | `complaint`, `legal` | `need legal review` | Blocked |
| RT-SUB-06 | Empty subject | M | `complaint` | (empty) | Not blocked by AA |
| RT-SUB-07 | Whitespace subject | L | `complaint` | `   ` | Not blocked by AA |
| RT-SUB-08 | Re:/FW: prefix | M | `complaint` | `FW: complaint` | Blocked |

### Runtime — words in user message

Playground: clean sender/subject; set body.

| ID | Title | P | Config | Body | Expected |
|---|---|---|---|---|---|
| **RT-UM-01** | **Body contains the word** | **H** | **`complaint`** | **`Billing complaint about my order`** | **Blocked** — **E2E** |
| RT-UM-02 | Word only in subject | H | UM=`sue`, SUB empty | Subject `sue`, body `hello` | Not blocked by AA (UM does not scan subject) |
| RT-UM-03 | Word absent | H | `complaint` | `I have a question about my policy` | Not blocked by AA |
| RT-UM-04 | Multi, any one hits | H | `sue`, `lawyer` | mentions `lawyer` only | Blocked |
| RT-UM-05 | Word in quote/signature | M | `sue` | only in quoted footer | Record |
| RT-UM-06 | HTML vs visible text | M | `sue` | word only in markup | Record what is scanned |
| RT-UM-07 | Empty body | M | `sue` | empty | Not blocked by AA |

### Runtime — words in assistant's reply

Inbound must otherwise be eligible. Outcome depends on generated text — treat as less deterministic.

| ID | Title | P | Config | Setup | Expected |
|---|---|---|---|---|---|
| RT-AR-01 | Reply contains word | H | `refund` | inbound that yields `refund` in reply | Blocked, not sent |
| RT-AR-02 | Reply does not contain word | H | `refund` | reply without `refund` | Not blocked by AA |
| RT-AR-03 | Only outbound is dirty | H | AR only = `refund` | clean inbound; reply has `refund` | Blocked via AR |
| RT-AR-04 | Multi, any one hits | H | `refund`, `lawsuit` | reply has `lawsuit` | Blocked |
| RT-AR-05 | Word only in inbound | H | AR=`refund`, UM empty | body has `refund`; reply does not | Not blocked by AA (AR does not scan inbound) |
| RT-AR-06 | EP already blocks | M | EP=`noreply`, AR=`refund` | from `noreply@x.com` | Blocked (order: record) |

### Combinations

| ID | Title | P | Config | Trigger | Expected |
|---|---|---|---|---|---|
| CMB-01 | All set; only EP hits | H | EP=`noreply`; SUB=`complaint`; UM=`sue`; AR=`refund` | from `noreply@x.com`, clean subject/body | Blocked |
| CMB-02 | All set; only SUB hits | H | same | clean from; subject `complaint` | Blocked |
| CMB-03 | All set; only UM hits | H | same | clean from/subject; body has `sue` | Blocked |
| CMB-04 | All set; only AR hits | H | same | clean inbound; reply has `refund` | Blocked |
| CMB-05 | All set; none hit | H | same | clean inbound; reply without `refund` | Not blocked by AA |
| CMB-06 | Two fields hit | M | same | `noreply` + subject `complaint` | Blocked once; no error |
| CMB-07 | Three fields hit | M | same | EP + SUB + UM | Blocked once |
| CMB-08 | Empty fields ignored | H | EP=`noreply` only | clean sender | Not blocked by AA |
| CMB-09 | AR only, clean reply | H | AR=`refund` | clean inbound, clean reply | Not blocked by AA |
| CMB-10 | AR only, dirty reply | H | AR=`refund` | clean inbound, reply has `refund` | Blocked |
| CMB-11 | Match last of many tags | M | 10 EP patterns, last `zzz-qa` | from `zzz-qa@x.com` | Blocked |
| CMB-12 | Config takes effect next send | H | add `noreply` after a clean send | then from `noreply@` | First not blocked by AA; second blocked |
| CMB-13 | Removing a tag stops match | H | EP=`noreply`, then remove | second mail from `noreply@` | Not blocked by AA after remove |

### Edge / negative

| ID | Title | P | Probe | Expected / record |
|---|---|---|---|---|
| EDG-01 | Case `refund` vs `Refund` | H | AR or UM | Record whether matching is case-sensitive and compare with the product requirement |
| EDG-02 | Config `REFUND`, text `refund` | H | AR / UM | Same as EDG-01 |
| EDG-03 | `sue` inside `issue` | H | UM | Record whether matching is whole-word or substring and compare with the product requirement |
| EDG-04 | `sue` in `sued` / `lawsuit` | H | UM | Same as EDG-03 |
| EDG-05 | EP=`mail` vs `email@x.com` | M | EP | Record whether the pattern matches inside a longer address; compare with the requirement |
| EDG-06 | Punctuation `sue.` / `sue!` / `(sue)` | H | UM | Record whether punctuation around the token still matches; compare with the requirement |
| EDG-07 | `refund,` / `refund.` in reply | H | AR | Same as EDG-06 |
| EDG-08 | Tag `.*` | H | any | Record whether regex-like values are treated as literals or as patterns; compare with the requirement |
| EDG-09 | Tags `+`, `?`, `(foo)` | H | any | Same as EDG-08 |
| EDG-10 | Accent `refúnd` | L | AR | Record whether accented variants match |
| EDG-11 | Unicode / RTL tag | L | SUB | Record whether the stored unicode string matches the same inbound string |
| EDG-12 | Phrase `out of office` | M | SUB | Record whether the stored phrase matches as one token |
| EDG-13 | Word at end of a long body | M | UM | Record whether a match at the end of a long body is still detected |
| EDG-14 | Word only in attachment | L | UM | Record whether attachments are scanned |
| EDG-15 | Domain case `@Test.com` | M | EP | Record domain case behavior; compare with the requirement |
| EDG-16 | HTML/script as a tag | H | any | Stored as text; no DOM injection |
| EDG-17 | Newline/tab in a tag | L | CFG | Rejected or escaped; layout intact |
| EDG-18 | Same token on two fields | M | SUB + AR = `refund` | Either field can block |

### UI / UX

| ID | Title | P | Expected |
|---|---|---|---|
| UX-01 | Helper copy vs actual match | M | Copy matches RT/EDG findings |
| UX-02 | Long chip | M | Readable or tooltip; `x` works |
| UX-03 | Remove via `x` | H | Tag gone; no navigation |
| UX-04 | Keyboard add/remove | H | Operable without mouse |
| UX-05 | Click outside | H | Existing chips stay |
| UX-06 | Focus order | M | No keyboard trap |
| UX-07 | Save in progress | L | No duplicate tags from double submit |

### Persistence

| ID | Title | P | Expected |
|---|---|---|---|
| PER-01 | Refresh | H | Saved tags remain |
| PER-02 | Leave and return | H | Saved tags remain; record unsaved behavior |
| PER-03 | Draft query param | H | Changes stay on this `version=` |
| PER-04 | Two drafts | M | Editing A does not change B |
| PER-05 | Other Guardrails sections | H | Unchanged after AA edits |
| PER-06 | Other browser/session | M | Same saved config, or document if local |
| PER-07 | Unsaved + refresh | M | Record autosave vs loss |

### Security / performance

| ID | Title | P | Expected |
|---|---|---|---|
| SEC-01 | XSS in a tag | H | Escaped; no script |
| SEC-02 | XSS in inbound + a real keyword | H | Still blocks; no script in UI |
| SEC-03 | `' OR 1=1 --` as tag | M | Literal; no error |
| SEC-04 | Huge tag/body | M | Controlled error, not a crash |
| SEC-05 | Logged out / lesser role | H | Not writable |
| A11Y-01 | Accessible names | M | Inputs named by field label |
| A11Y-02 | Helper text associated | M | Announced with the input |
| A11Y-03 | Chip `x` named | M | "Remove {token}", not unnamed |
| A11Y-04 | Color not only state | L | Text/icon for state |
| A11Y-05 | Visible focus | M | Focus ring on input and `x` |
| PERF-01 | 50–100 chips | L | UI stays usable |
| PERF-02 | Many patterns, one send | L | Block/allow without a long hang |
| PERF-03 | Rapid add/remove | L | No stuck input / dupes |

---

## E2E: RT-UM-01

One automated test. Chosen because the body is under our control (unlike AR, which depends on model output).

| | |
|---|---|
| **Case** | RT-UM-01 — Words in User Message contains configured word |
| **Priority** | High |
| **Why this case** | Deterministic inbound match; Playground body is explicit. |

**Isolation (required):** the block must come from UM only. Before sending:

- **Words in User Message** = a unique keyword (not `complaint` / `sue`, so Escalation Reasons cannot explain the block)
- **Emails patterns to unassign**, **Subjects**, and **Words in Assistant's Reply** are empty, or contain values that cannot match this send
- Clean customer email (cannot match EP)
- Clean subject (cannot match SUB)
- Body contains the unique keyword

**Preconditions:** DEV Guardrails + Playground on `version=e2e-draft-msvp6l995n2q`. Channel = Email, Autopilot.

**Steps**

1. Guardrails → Automation Audit: set **Words in User Message** to the unique keyword. Persist.
2. Tests → Playground. Same policy version.
3. Customer email = a clean address. Channel = Email. Subject = a clean subject.
4. Body contains the unique keyword. **Send as customer**.
5. Assert **red / blocked**.
6. Restore tags (post-condition).

**Pass:** the send is blocked by the **Words in User Message** rule, not by another Automation Audit field.
