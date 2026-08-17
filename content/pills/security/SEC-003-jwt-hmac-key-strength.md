---
id: SEC-003
track: security
status: ready
sequence_position: 3
subject: "Could someone guess your JWT signing key?"
preview_text: "HS256 can be correctly implemented and still rely on a weak shared secret."
created: 2026-08-17
last_verified: 2026-08-17
review_after: 2027-08-17
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://www.rfc-editor.org/rfc/rfc7518.html#section-3.2
  - https://www.rfc-editor.org/rfc/rfc8725.html#section-2.2
  - https://www.rfc-editor.org/rfc/rfc8725.html#section-3.5
  - https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
---

## Email body

Hi developer,

It’s time for another Security Pill. 💊

Imagine you find this value in an application’s deployment configuration:

<div
  role="region"
  aria-label="Weak JWT HMAC key configuration"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 10px;
  "
>
  <pre
    style="
      margin: 0;
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 15px;
      line-height: 1.65;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    "
  ><code>JWT_HMAC_KEY<span style="color:#57606a;">=</span><strong style="color:#cf222e;">secret123</strong></code></pre>
</div>

The application uses HS256. It creates tokens, verifies their signatures, and appears to work correctly.

**Is this signing setup secure?**

No.

HS256 uses HMAC with SHA-256 and a shared secret. SHA-256 may be strong, but it cannot make a predictable secret strong.

Once someone obtains one valid token, they have both the signed data and its authentication code. They can test candidate keys on their own machine until one produces the same result.

That work happens offline. It does not require repeated login attempts, so your application’s rate limiter does not slow it down.

<div
  role="region"
  aria-label="How an attacker guesses a weak JWT signing key offline"
  style="
    margin: 24px 0;
    padding: 24px 18px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 14px;
    color: #24292f;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div style="font-size:22px;font-weight:700;text-align:center;margin-bottom:6px;">Guessing a weak JWT signing key</div>
  <div style="font-size:14px;text-align:center;color:#57606a;margin-bottom:24px;">One captured token is enough to test candidate keys offline.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;">
    <tr>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#ffffff;border:1px solid #d0d7de;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#57606a;margin-bottom:5px;"><strong>1 · OBTAIN A TOKEN</strong></div>
        <div style="font-size:17px;font-weight:700;">Captured JWT</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">For example, from a request visible in browser DevTools</div>
      </td>
      <td width="8%" align="center" valign="middle" style="width:8%;font-size:26px;font-weight:700;color:#57606a;">→</td>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#fff5f5;border:1px solid #cf222e;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#cf222e;margin-bottom:5px;"><strong>2 · CHOOSE A CANDIDATE KEY</strong></div>
        <div style="font:700 17px Consolas, Menlo, monospace;color:#cf222e;">secret123?</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">Try a common password or the next value from a wordlist</div>
      </td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td align="center" style="height:34px;font-size:26px;font-weight:700;color:#57606a;">↓</td>
    </tr>
    <tr>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#ffffff;border:1px solid #d0d7de;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#57606a;margin-bottom:5px;"><strong>4 · COMPARE</strong></div>
        <div style="font-size:17px;font-weight:700;">Signatures match?</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">Compare the result with the signature in the captured JWT</div>
      </td>
      <td width="8%" align="center" valign="middle" style="width:8%;font-size:26px;font-weight:700;color:#57606a;">←</td>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#faf5ff;border:1px solid #8250df;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#8250df;margin-bottom:5px;"><strong>3 · COMPUTE LOCALLY</strong></div>
        <div style="font-size:17px;font-weight:700;color:#8250df;">HMAC-SHA-256</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">Sign the captured header and payload with the candidate key</div>
      </td>
    </tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:16px;">
    <tr>
      <td width="50%" style="width:50%;padding:0 5px 0 0;">
        <div style="padding:11px 13px;border-radius:8px;background:#fff1f0;color:#cf222e;font-size:14px;font-weight:700;text-align:center;">NO ↺ try the next candidate key</div>
      </td>
      <td width="50%" style="width:50%;padding:0 0 0 5px;">
        <div style="padding:11px 13px;border-radius:8px;background:#dafbe1;color:#0a7a28;font-size:14px;font-weight:700;text-align:center;">YES → signing key recovered</div>
      </td>
    </tr>
  </table>

  <div style="margin-top:18px;padding-top:16px;border-top:1px solid #d0d7de;text-align:center;font-size:14px;color:#57606a;">No login attempts · No requests to the application · No rate limiting</div>
</div>

If the shared key is recovered, the attacker can change claims, calculate a new authentication code, and create tokens that services trusting that key may accept.

They did not break SHA-256. They guessed the key.

For HS256, RFC 7518 requires a key of at least 256 bits—that is, 32 bytes. JWT best-current-practice guidance also says that a human-memorable password must not be used directly as an HS256 key.

In Node.js, you can generate 32 cryptographically strong random bytes like this:

<div
  role="region"
  aria-label="Generating a random HS256 key in Node.js"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 10px;
  "
>
  <pre
    style="
      margin: 0;
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 15px;
      line-height: 1.65;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    "
  ><code><span style="color:#0000cc;">import</span> { <strong>randomBytes</strong> } <span style="color:#0000cc;">from</span> <span style="color:#0a7a28;">&#39;node:crypto&#39;</span>;

<span style="color:#8250df;">const</span> encodedKey = <strong>randomBytes</strong>(32).<strong>toString</strong>(<span style="color:#0a7a28;">&#39;base64url&#39;</span>);
<strong>console</strong>.<strong>log</strong>(encodedKey);</code></pre>
</div>

Run this once during secret provisioning, then store the result in your deployment’s secret-management system.

Do not generate a new key every time the application starts. Different instances—and tokens created before a restart—must still use an intentionally managed key set.

If the current key is weak, plan its rotation. Existing tokens signed with the old key need an explicit transition or expiry strategy.

**Your check for today**

Without printing or exposing the current key, find out how it was created.

- Was it typed by a person or generated by a cryptographically secure random generator?
- For HS256, was it generated from at least 32 random bytes?
- Is it stored outside the source code and deployed as a managed secret?

A library can verify every signature correctly and still be protecting it with the wrong key.

That’s all for today. One strong algorithm, one weak assumption, one practical check. 💊

See you next Tuesday,

Bartosz

Dev Academy
