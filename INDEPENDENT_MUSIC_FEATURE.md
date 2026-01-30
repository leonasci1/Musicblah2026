# 🎵 Busca de Músicas Independentes - Documentação

## 📋 Resumo das Mudanças

Expandimos a função de avaliação do aplicativo para suportar **tanto tracks individuais quanto álbuns**, com detecção automática de **músicas independentes**.

---

## ✨ Principais Melhorias

### 1. **API de Busca Expandida** (`src/pages/api/spotify/search.ts`)

#### Nova função de detecção de independência:

```typescript
async function isIndependentTrack(
  spotifyApi: any,
  track: any,
  artistId: string
): Promise<boolean>;
```

**Critérios de detecção:**

- ✅ Gênero contains: "indie", "indie rock", "indie pop", "bedroom pop", "lo-fi", "indie folk"
- ✅ Popularidade < 40 (músicas independentes normalmente têm menor alcance)
- ✅ Menos de 3 gêneros associados + baixa popularidade

#### Parâmetros da API:

- `type=all` (padrão) - Retorna tracks E álbuns na mesma busca
- `type=track` - Retorna apenas tracks
- `type=album` - Retorna apenas álbuns
- `type=independent` - Retorna apenas tracks independentes

#### Exemplo de resposta:

```json
[
  {
    "type": "track",
    "id": "spotify_id",
    "name": "Song Name",
    "artist": "Artist Name",
    "artistId": "artist_spotify_id",
    "album": "Album Name",
    "image": "url",
    "duration": "3:45",
    "previewUrl": "preview_url",
    "isIndependent": true,
    "popularity": 35
  },
  {
    "type": "album",
    "id": "album_id",
    "name": "Album Name",
    ...
  }
]
```

---

### 2. **Tipos Expandidos** (`src/lib/types/tweet.ts`)

Track agora inclui:

```typescript
export type Track = {
  id: string;
  name: string;
  artist: string;
  artistId?: string; // ✅ NOVO
  image: string;
  album: string;
  duration: string;
  previewUrl: string | null;
  isIndependent?: boolean; // ✅ NOVO
  popularity?: number; // ✅ NOVO
};
```

---

### 3. **SearchBar Atualizado** (`src/components/aside/search-bar.tsx`)

#### Mudanças:

- ✅ Suporta busca de **tracks E álbuns simultaneamente**
- ✅ Mostra **badge "Independente"** para músicas independentes
- ✅ Mostra **ícone ⚡** na capa para tracks independentes
- ✅ Exibe duração e popularidade para tracks
- ✅ Placeholder atualizado: "Avaliar um álbum ou música..."

#### Indicadores visuais:

```
Track independente:
┌──────────┐
│  Image  │ ⚡  <- Badge no canto
└──────────┘
[Independente] <- Label laranja
```

---

### 4. **ReviewModal Expandido** (`src/components/modal/review-modal.tsx`)

#### Suporta avaliação de:

- ✅ **Álbuns** (comportamento original)
- ✅ **Tracks** (NOVO)

#### Props atualizados:

```typescript
type ReviewModalProps = {
  album?: Album; // Opcional
  track?: Track; // ✅ NOVO - Opcional
  closeModal: () => void;
};
```

#### Dados salvos no Firebase:

```javascript
// Para tracks
{
  type: 'review',
  rating: 4,
  track: {
    id: "...",
    name: "...",
    artist: "...",
    artistId: "...",           // ✅ NOVO
    image: "...",
    album: "...",
    duration: "...",
    previewUrl: "...",
    isIndependent: true,       // ✅ NOVO
    popularity: 35             // ✅ NOVO
  }
}

// Para álbuns (sem mudanças)
{
  type: 'review',
  rating: 5,
  album: {
    id: "...",
    name: "...",
    artist: "...",
    image: "...",
    year: "2024"
  }
}
```

#### Recursos visuais:

- ✅ Player de áudio integrado (para tracks com previewUrl)
- ✅ Badge "Independente" mostrado no modal
- ✅ Detecção automática de tipo (álbum ou track)
- ✅ Mensagens de sucesso específicas

---

## 🚀 Como Usar

### 1. **Buscar Música Independente**

```javascript
// Busca todos os tipos
const res = await fetch(`/api/spotify/search?q=indie&type=all`);

// Busca apenas independentes
const res = await fetch(`/api/spotify/search?q=indie&type=independent`);

// Busca apenas tracks
const res = await fetch(`/api/spotify/search?q=indie&type=track`);
```

### 2. **Exibir em SearchBar**

O SearchBar já busca `type=all` automaticamente:

```tsx
<SearchBar /> // Mostra tracks E álbuns com badges
```

### 3. **Avaliar Track Independente**

```tsx
<ReviewModal track={independentTrackData} closeModal={handleClose} />
```

### 4. **Exibir Review em Timeline**

O componente `TweetReview` já suporta ambos:

```tsx
<TweetReview tweet={reviewData} />
// Detecta automaticamente se é track ou album
```

---

## 📊 Exemplos Práticos

### Buscar "The Beatles" independentes:

```
GET /api/spotify/search?q=The Beatles&type=independent
// Retorna covers e remixes de artistas indie
```

### Avaliar música indie descoberta:

```
1. Usuário digita "lofi beats" no SearchBar
2. Resultados mostram tracks AND álbuns
3. Tracks com isIndependent=true mostram badge ⚡
4. Usuário clica em um track
5. ReviewModal abre com player de 30s
6. Usuário dá nota (1-5 estrelas)
7. Review é salva com dados de independência
```

---

## 🔧 Detalhes Técnicos

### Chamadas paralelas na API:

```typescript
const [tracksResponse, albumsResponse] = await Promise.all([
  spotifyApi.searchTracks(q, { limit: 10 }),
  spotifyApi.searchAlbums(q, { limit: 6 })
]);
```

✅ Melhor performance que chamadas sequenciais

### Detecção com cache:

- Cada artista é verificado UMA VEZ durante a busca
- Dados são retornados rapidamente

### Fallback para erro:

Se o artista não for encontrado, assume `isIndependent: false`

---

## 📝 Notas Importantes

1. **Popularidade**: Score 0-100 do Spotify baseado em streams globais
2. **Gêneros**: Carregados diretamente do Spotify Artist API
3. **Limite de requisições**: Spotify API tem rate limiting - use cache em produção
4. **Preview URL**: Nem todas as músicas têm preview de 30s (nullable)

---

## 🎯 Próximas Melhorias Possíveis

- [ ] Filtro específico por gênero indie
- [ ] Curadoria de playlists independentes
- [ ] Busca por label record (independent labels)
- [ ] Estatísticas de músicas independentes avaliadas
- [ ] Integração com APIs de músicas indie (Bandcamp, etc)
- [ ] Detecção de artistas emergentes

---

## ✅ Checklist de Funcionalidade

- [x] API detecta música independente
- [x] SearchBar exibe tanto tracks quanto álbuns
- [x] Badges visuais para independentes
- [x] ReviewModal suporta avaliação de tracks
- [x] Dados salvos corretamente no Firebase
- [x] TweetReview já exibe reviews de tracks
- [x] Preview de áudio funciona no modal
