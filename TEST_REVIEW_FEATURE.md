# 🎵 Teste: Avaliação de Música com Texto

## Cenário que você descreveu:

```
1. Escreve: "SAID YOU'D BE THERE FOR ME THROUGH EVERYTHING"
2. Clica no botão 🎵 "Avaliar"
3. Busca uma música ou álbum
4. Dá 5 estrelas
5. Clica "Publicar"
```

**Resultado esperado:** Post com texto + card da música

**Resultado obtido:** Post com texto APENAS (sem card)

---

## 📋 Checklist de Debug

### ✅ Passo 1: Verificar Console (F12)

Abra o console do navegador e procure por:

```
🎵 Resultado selecionado: {...}
📀 Álbum selecionado: [nome]
ou
🎶 Track selecionada: [nome]
```

Se NÃO aparecer, a seleção não foi registrada.

---

### ✅ Passo 2: Verificar se Modal de Avaliação Abriu

Procure por:

```
ReviewModal aberto ✅
```

Se não aparecer, o modal não foi aberto.

---

### ✅ Passo 3: Verificar se Review foi Salva

Procure por:

```
📝 Salvando review: {...}
✅ Review salva com ID: [id]
✅ Dados da review: {...}
```

Se não aparecer, não foi salvo.

---

### ✅ Passo 4: Verificar Firestore

1. Vá para https://console.firebase.google.com
2. Clique em "Firestore Database"
3. Abra a coleção `tweets`
4. Procure o documento mais recente
5. Verifique se tem estes campos:
   - `type` = `"review"` ✅
   - `rating` = número (1-5) ✅
   - `album` ou `track` = objeto com dados ✅
   - `text` = seu texto ✅

Se algum desses campos está faltando, está aqui o problema!

---

## 🔍 Possíveis Problemas

### Problema 1: Dados não salvam no Firebase

**Solução:** Verifique se está logado e se o usuário tem permissão para escrever

### Problema 2: Dados salvam mas não aparecem na timeline

**Causa:** Cache do navegador ou refresh necessário

**Solução:**

- Aperte F5 para recarregar
- Ou feche e abra a aba novamente

### Problema 3: Card não renderiza mesmo com dados no Firebase

**Causa:** Componente Tweet/TweetReview pode estar com erro

**Solução:**

- Abra o DevTools (F12)
- Vá para a aba "Console"
- Procure por mensagens de erro em vermelho

---

## 📸 O que tomar screenshot

Se continuar não funcionando, tire screenshots de:

1. **Console.log** mostrando:

   ```
   📝 Salvando review: {...}
   ✅ Review salva com ID: [id]
   ```

2. **Firestore** mostrando o documento criado com `type: "review"`

3. **Timeline** mostrando o post sem o card de avaliação

Isso vai ajudar a identificar exatamente onde está o problema!
