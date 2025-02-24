## SpecStory

## Correção de Background da Página (14/02/2025, 16:44:28)

_**User**_

Chat por favor corrija o background da seção superior da minha página na mensagem de obrigado. 

---

_**Assistant**_

Vou ajudar a ajustar o background da seção superior para combinar melhor com o tema escuro da aplicação.

```typescript:src/app/(protected)/contracts/[id]/page.tsx
// ... existing code ...
      <div className="flex-none w-full bg-gray-900/50 px-4 py-4 relative">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="rounded-3xl p-8 sm:p-10 border border-white/10 shadow-xl bg-gradient-to-b from-indigo-950/80 to-gray-900/90">
            <div className="flex items-center gap-4 mb-6">
              // ... existing code ...
            </div>

            <div className="space-y-6">
              // ... existing code ...
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                  // ... existing code ...
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                  // ... existing code ...
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                  // ... existing code ...
                </div>
              </div>
            </div>
          </div>
// ... existing code ...
```

Principais alterações:
1. Mudei o `bg-white/5` do container principal para `bg-gray-900/50`
2. Ajustei o gradiente do card principal para usar `from-indigo-950/80 to-gray-900/90`
3. Atualizei o background dos cards menores de `bg-white/5` para `bg-gray-900/50`
4. Reduzi a opacidade da borda de `border-white/20` para `border-white/10`

Essas mudanças devem criar um visual mais coeso e escuro, mantendo a elegância do design original mas com melhor contraste e legibilidade.

---



---

