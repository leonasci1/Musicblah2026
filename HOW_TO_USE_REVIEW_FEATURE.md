# 🎵 Como Usar a Função de Avaliação Integrada

## 📝 Novo Fluxo de Avaliação

Agora você pode avaliar músicas e álbuns **diretamente enquanto escreve seu post**, sem precisar abrir modais separados!

## 🚀 Como Funciona

### 1. **Escreva seu post normalmente**

Na página Home (ou em qualquer página com input de tweet), comece a digitar seu texto:

```
"Descobri essa música incrível hoje!"
```

### 2. **Clique no botão 🎵 "Avaliar"**

Na barra de opções (junto com foto, GIF, poll, etc.), você verá um novo botão com um **ícone de nota musical (♪)**.

Clique nele para abrir o **Modal de Busca de Música**.

### 3. **Procure a música/álbum**

Uma barra de busca aparecerá. Digite o nome da música, artista ou álbum:

```
"lofi beats"
"The Beatles"
"Indie Pop"
```

### 4. **Selecione o resultado**

- Resultados de **tracks (músicas)** mostram:

  - 🎵 Nome da música
  - 👤 Nome do artista
  - 📀 Álbum da música
  - ⏱️ Duração
  - 📊 Score de popularidade
  - **⚡ Badge "Independente"** (se for música indie)

- Resultados de **álbuns** mostram:
  - 💿 Nome do álbum
  - 👤 Nome do artista
  - 📅 Ano de lançamento
  - 🎼 Quantidade de faixas

### 5. **Avalie no Modal**

Após selecionar, o **ReviewModal** abre automaticamente com:

- 🖼️ Capa da música/álbum
- ⭐ Sistema de avaliação (1-5 estrelas)
- 🎧 Player de 30 segundos (apenas para tracks)
- 💬 Campo de comentário opcional
- ✅ Botões Publicar/Cancelar

### 6. **Publique a avaliação**

Clique em "Publicar" e sua avaliação será salva no Firebase com:

- ⭐ Sua nota (1-5 estrelas)
- 🎵 Dados completos da música/álbum
- 💬 Seu comentário (se adicionou)
- 📍 Tipo: 'review' (para identificar na timeline)

---

## 📊 O Que é Salvo

### Para Avaliação de Track (Música):

```javascript
{
  type: 'review',
  rating: 4,                    // Sua nota (1-5)
  text: "Comentário...",        // Comentário opcional
  track: {
    id: "spotify_id",
    name: "Song Name",
    artist: "Artist",
    artistId: "artist_id",
    image: "url",
    album: "Album Name",
    duration: "3:45",
    previewUrl: "preview_url",
    isIndependent: true,        // ⚡ Marca se é indie
    popularity: 35              // Score de popularidade
  },
  createdBy: "user_id",
  createdAt: "timestamp",
  // ... outros dados de usuário
}
```

### Para Avaliação de Álbum:

```javascript
{
  type: 'review',
  rating: 5,
  text: "Comentário...",
  album: {
    id: "album_id",
    name: "Album Name",
    artist: "Artist",
    image: "url",
    year: "2024"
  },
  createdBy: "user_id",
  createdAt: "timestamp",
  // ... outros dados de usuário
}
```

---

## 🎯 Casos de Uso

### ✨ Exemplo 1: Avaliar uma música indie

```
1. Clique no botão 🎵 "Avaliar"
2. Procure: "lofi hip hop study"
3. Selecione um track independente (aparecerá com ⚡)
4. Dê 5 estrelas
5. Comente: "Perfeito para estudar!"
6. Clique "Publicar"
```

**Resultado:** Um post com avaliação de música independente, destacando que é indie.

### ✨ Exemplo 2: Avaliar um álbum clássico

```
1. Clique no botão 🎵 "Avaliar"
2. Procure: "Pink Floyd The Wall"
3. Selecione o álbum
4. Dê 5 estrelas
5. Clique "Publicar" (sem comentário)
```

**Resultado:** Um post mostrando o álbum com nota, sem texto adicional.

### ✨ Exemplo 3: Avaliação com texto + música

```
1. Escreva: "Descobri essa música hoje e amei!"
2. Clique no botão 🎵 "Avaliar"
3. Procure: "artist name"
4. Selecione a música
5. Dê 4 estrelas + comente: "Muito criativa!"
6. Clique "Publicar"
```

**Resultado:** Post com texto + avaliação de música integrada.

---

## 🔍 Visibilidade na Timeline

### Post Normal (texto)

```
"Texto do post"
[imagens, se houver]
```

### Post com Avaliação

```
"Texto do post (opcional)"

┌─────────────────┐
│  [Capa]  Música │  ← Card com
│  ⭐⭐⭐⭐⭐     │    informações
│  Artista • Info │
└─────────────────┘

[botões de ação]
```

### Indicadores de Independência

Músicas marcadas como independentes mostram:

- **⚡ ícone** na capa (canto superior direito)
- **Independente** em laranja (label)

---

## 🎚️ Integração com Posts Normais

O novo recurso **NÃO interfere** com posts normais:

- ✅ Você pode postar só texto (como antes)
- ✅ Você pode postar texto + imagens (como antes)
- ✅ Você pode postar APENAS avaliação de música
- ✅ Você pode postar texto + avaliação de música (novo!)

---

## 🔧 Modo Controlado do SearchBar

O SearchBar agora funciona em **dois modos**:

### Modo 1: Autônomo (Sidebar)

```tsx
<SearchBar /> // Abre ReviewModal automaticamente
```

### Modo 2: Controlado (InputOptions)

```tsx
<SearchBar
  showReviewModal={false}
  onSelectAlbum={(album) => handleAlbum(album)}
  onSelectTrack={(track) => handleTrack(track)}
/>
```

Permite que o pai controle o que fazer com a seleção.

---

## 📱 Responsividade

O botão 🎵 "Avaliar" aparece:

- ✅ Desktop (sempre visível)
- ✅ Tablet (visível)
- ✅ Mobile (visível após expandir opções)

---

## ⚠️ Limitações

1. **Preview de áudio**: Nem todas as músicas têm preview de 30s no Spotify
2. **Popularidade**: Score é baseado em streams globais atuais
3. **Gêneros**: Detecção indie baseada em gêneros do Spotify
4. **Rate limiting**: Spotify API tem limite de requisições

---

## ✅ Checklist de Funcionalidade

- [x] Botão 🎵 integrado no input
- [x] Modal de busca de música
- [x] SearchBar em modo controlado
- [x] Detecção de independência funcionando
- [x] ReviewModal para ambos (track/album)
- [x] Dados salvos corretamente no Firebase
- [x] Player de áudio funciona
- [x] Badges visuais de independência
- [x] Sem interferência com posts normais
