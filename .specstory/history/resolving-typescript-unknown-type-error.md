## SpecStory

## Resolving TypeScript Unknown Type Error (11/11/2024, 13:54:00)

_**User**_

For the code present, we get this error:
```
'response' é do tipo 'desconhecido'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because the `Promise.race()` return type is `unknown`. We need to type cast the response or properly type it as an OpenAI response. Here's the fix:

```typescript:src/app/api/contracts/upload/route.ts
// ... existing code ...
    const response = await Promise.race([analysisPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;

    let analysis;
    try {
      analysis = JSON.parse(response.choices[0]?.message?.content || '{"highlights":[],"changes":[]}');
// ... existing code ...
```

The fix adds a type assertion to properly type the response from `Promise.race()` as an OpenAI chat completion response. This resolves the TypeScript error about the unknown type.

---



---

