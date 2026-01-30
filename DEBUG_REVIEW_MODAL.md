# 🔧 Checklist de Debug para Review Modal

## Se o card de avaliação não aparece:

### 1. Abra o Console do Browser (F12)

Procure por estas mensagens:

```
📝 Salvando review: {...}
✅ Review salva com ID: [id-do-documento]
✅ Dados da review: {...}
```

Se **NÃO** ver essas mensagens, o modal não salvou corretamente.

### 2. Verifique o Firebase Firestore

- Vá para https://console.firebase.google.com
- Navegue até "Firestore Database"
- Na coleção `tweets`, procure o documento mais recente
- Verifique se tem os campos:
  - ✅ `type: "review"`
  - ✅ `rating: [1-5]`
  - ✅ `album` ou `track` (com dados completos)

### 3. Se está faltando `album`/`track`:

Pode ser que o campo não foi passado corretamente do SearchBar.

### 4. Verifique o componente Tweet

- Se um documento tem `type: "review"` mas não mostra o card
- Pode ser que o componente Tweet não está renderizando TweetReview corretamente
- Verifique no console por erros no componente Tweet

### 5. Receba atualizar a página (F5)

- Se o documento foi salvo, mas não apareceu
- O cache pode estar interferindo
- Recarregue a página

## Se continuar não funcionando:

1. **Compartilhe o console log** (F12) mostrando a mensagem "✅ Review salva"
2. **Compartilhe um screenshot** do Firestore mostrando o documento criado
3. Isso vai ajudar a identificar exatamente onde está o problema
