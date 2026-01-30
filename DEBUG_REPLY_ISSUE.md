# 🔍 Debug: Replies e Reviews Não Aparecem ao Expandir Post

## Problema Descrito

- ✅ Post com review aparece na timeline (mostra álbum/música com rating)
- ✅ Mostra "2 Replies" na timeline
- ❌ Ao expandir (clicar para ver `/tweet/[id]`), nada aparece
- ❌ Nem mostra o álbum/música avaliada do post original
- ❌ Nem mostra os replies

## Arquivos Relevantes

- `/src/pages/tweet/[id].tsx` - Página que carrega post e replies
- `/src/components/view/view-tweet.tsx` - Renderiza o post expandido
- `/src/components/tweet/tweet.tsx` - Renderiza replies
- `/src/components/modal/review-modal.tsx` - Salva a review com parent info

## Instruções para Debugar

### 1️⃣ Abra o Console do Navegador (F12)

Procure pelos logs que adicionei:

```
🔍 [id].tsx - Dados carregados: {
  tweetId: "...",
  tweetLoading: false,
  repliesLoading: false,
  repliesCount: 0 ou 2,  // ← IMPORTANTE: Deve mostrar 2
  tweetType: "review",   // ← Deve ser "review"
  hasAlbum: true,        // ← Deve ser true
  hasTrack: false,       // ← Depende do tipo
  hasRating: true        // ← Deve ser true
}

📺 ViewTweet renderizado: {
  tweetId: "...",
  type: "review",    // ← Deve ser "review"
  hasAlbum: true,    // ← Deve ser true
  hasTrack: false,   // ← Depende do tipo
  hasRating: true    // ← Deve ser true
}
```

### 2️⃣ Verifique no Firebase Console

Vá para: https://console.firebase.google.com → Firestore Database → tweets

**Procure pelo tweet original (o que tem type: "review")**

```json
{
  "id": "TWEET_ID_AQUI",
  "type": "review",
  "rating": 5,
  "album": {
    "id": "...",
    "name": "Paqueta Porra",
    ...
  },
  "text": "PAQUETA PORRA",
  ...
}
```

**Procure pelos replies (documents que têm parent.id = TWEET_ID_AQUI)**

```json
{
  "id": "REPLY_ID",
  "parent": {
    "id": "TWEET_ID_AQUI",  // ← CRÍTICO: Deve ter isso!
    "username": "..."
  },
  "text": "Seu comentário...",
  ...
}
```

### 3️⃣ Verificações Específicas

#### A. O post original tem os dados de review?

- [ ] type === "review" ?
- [ ] album !== null ?
- [ ] rating !== null ?
- [ ] Se for track, track !== null ?

#### B. Os replies têm parent.id correto?

- [ ] parent !== null ?
- [ ] parent.id === tweet_id_original ?

#### C. A query está filtrando corretamente?

Na aba Network do DevTools:

- Procure por chamadas Firestore
- Verifique se está fazendo query: `where('parent.id', '==', 'id_do_tweet')`

### 4️⃣ Se o Console Mostrar Problema

**Se `repliesCount: 0` mas deveria ser 2:**

- Verifique no Firebase se os replies têm `parent.id` correto
- Confira se você criou os replies como resposta ao post correto
- Limpe o cache do navegador (Ctrl+Shift+R)

**Se `hasAlbum: false` ou `hasRating: false`:**

- Verifique no Firebase se o documento tem esses campos
- Se estiver faltando, o review não foi salvo corretamente
- Verifique no console se viu log "✅ Review salva com ID" quando criou

**Se `type: undefined`:**

- Verifique se o post foi criado como review
- Na timeline deveria mostrar o card da música
- Caso contrário, foi salvo como tweet comum

## Solução Rápida

Se nada disso funcionar, tente:

1. **Limpar Cache:**

   ```
   Ctrl + Shift + R (Hard Refresh)
   ```

2. **Recarregar a Página:**

   - Volte para Home
   - Clique novamente no post

3. **Verificar se É o Post Correto:**
   - A URL deve ser `/tweet/[ID_DO_POST]`
   - O post deve ter o card da música na timeline

## Próximos Passos

Depois de fazer essas verificações, me diga:

1. Qual é o log que aparece no console?
2. Os dados no Firebase estão corretos?
3. Se está tudo no Firebase mas não aparece na UI, é um problema de rendering

---

**Debug Adicionado em:**

- [x] `[id].tsx` - console.log com dados carregados
- [x] `view-tweet.tsx` - console.log com dados renderizados
- [x] Tratamento visual para "Nenhuma resposta ainda"
