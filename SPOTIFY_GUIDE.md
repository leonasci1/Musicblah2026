# Integração Spotify - Guia Simplificado

Transformar o app em rede social de música com o mínimo necessário.

---

## 🛠️ Setup Inicial

### 1. Variáveis de Ambiente

**`.env.development`** - Adicione:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=seu_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback
SPOTIFY_CLIENT_SECRET=seu_secret
```

### 2. Instalar Dependências

```bash
npm install axios
```

---

## 📝 Tipos

**`src/lib/types/spotify.ts`** (NOVO)

```typescript
import type { FirestoreDataConverter } from 'firebase/firestore';

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
  external_urls: { spotify: string };
  popularity: number;
  duration_ms: number;
};

export type MusicPost = {
  id: string;
  text: string | null;
  spotifyTrackId: string;
  track: SpotifyTrack;
  createdBy: string;
  createdAt: any;
  userLikes: string[];
};

export const musicPostConverter: FirestoreDataConverter<MusicPost> = {
  toFirestore(post) {
    return post;
  },
  fromFirestore(snapshot) {
    return { id: snapshot.id, ...snapshot.data() } as MusicPost;
  }
};
```

---

## 🔐 Autenticação

**`src/lib/firebase/spotify-auth.ts`** (NOVO)

```typescript
export function getSpotifyAuthURL() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || '',
    scope: 'user-read-private user-read-email user-top-read',
    show_dialog: 'true'
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode(code: string) {
  const res = await fetch('/api/auth/spotify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  if (!res.ok) throw new Error('Auth failed');
  return res.json();
}

export function getSpotifyToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('spotify_token');
}

export function saveSpotifyToken(token: string) {
  localStorage.setItem('spotify_token', token);
}
```

---

## 📱 Componentes

**`src/components/spotify/music-preview-player.tsx`** (NOVO)

```typescript
import { useRef, useState } from 'react';

type Props = { previewUrl: string | null };

export function MusicPreviewPlayer({ previewUrl }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!previewUrl) return null;

  return (
    <div className='mt-3 flex items-center gap-2 rounded bg-gray-900 p-2'>
      <button
        onClick={() => {
          if (ref.current) {
            playing ? ref.current.pause() : ref.current.play();
            setPlaying(!playing);
          }
        }}
        className='flex h-8 w-8 flex-shrink-0 items-center justify-center 
                   rounded-full bg-green-500 text-xs text-white hover:bg-green-600'
      >
        {playing ? '⏸' : '▶'}
      </button>

      <input
        type='range'
        min='0'
        max={duration || 0}
        value={time}
        onChange={(e) => {
          const t = parseFloat(e.target.value);
          if (ref.current) ref.current.currentTime = t;
          setTime(t);
        }}
        className='h-1 flex-1 rounded bg-gray-700 accent-green-500'
      />

      <span className='min-w-fit text-xs text-gray-400'>
        {Math.floor(time / 60)}:{String(Math.floor(time % 60)).padStart(2, '0')}
      </span>

      <audio
        ref={ref}
        src={previewUrl}
        onTimeUpdate={() => setTime(ref.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(ref.current?.duration || 0)}
        crossOrigin='anonymous'
      />
    </div>
  );
}
```

**`src/components/spotify/music-post.tsx`** (NOVO)

```typescript
import { MusicPost } from '@lib/types/spotify';
import { MusicPreviewPlayer } from './music-preview-player';

type Props = { post: MusicPost };

export function MusicPost({ post }: Props) {
  const { track, text } = post;
  const artists = track.artists.map((a) => a.name).join(', ');

  return (
    <article className='border-b border-gray-700 p-4 hover:bg-gray-900/50'>
      <div className='flex gap-3'>
        <img
          src={track.album.images[0]?.url}
          alt={track.name}
          className='h-12 w-12 rounded'
        />

        <div className='min-w-0 flex-1'>
          <p className='truncate font-bold text-white'>{track.name}</p>
          <p className='truncate text-sm text-gray-500'>{artists}</p>

          {text && <p className='mt-2 text-white'>{text}</p>}

          <MusicPreviewPlayer previewUrl={track.preview_url} />

          <a
            href={track.external_urls.spotify}
            target='_blank'
            rel='noreferrer'
            className='mt-2 inline-block text-sm text-green-500 hover:underline'
          >
            Ouvir no Spotify
          </a>
        </div>
      </div>
    </article>
  );
}
```

**`src/components/spotify/spotify-login-button.tsx`** (NOVO)

```typescript
import Link from 'next/link';
import { Button } from '@components/ui/button';
import { getSpotifyAuthURL } from '@lib/firebase/spotify-auth';
import { useEffect, useState } from 'react';

export function SpotifyLoginButton() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(getSpotifyAuthURL());
  }, []);

  return (
    <Link href={url}>
      <Button className='w-full bg-green-500 hover:bg-green-600'>
        🎵 Conectar Spotify
      </Button>
    </Link>
  );
}
```

---

## 🔗 Rotas de API

**`src/pages/api/auth/spotify.ts`** (NOVO)

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { code } = req.body;

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '',
        client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || '',
        grant_type: 'authorization_code'
      })
    );

    const { access_token } = response.data;
    res.status(200).json({ token: access_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Auth failed' });
  }
}
```

**`src/pages/auth/spotify/callback.tsx`** (NOVO)

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  exchangeSpotifyCode,
  saveSpotifyToken
} from '@lib/firebase/spotify-auth';

export default function SpotifyCallback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const code = router.query.code as string;
    if (!code) {
      router.push('/login');
      return;
    }

    exchangeSpotifyCode(code)
      .then((data) => {
        saveSpotifyToken(data.token);
        router.push('/home');
      })
      .catch(() => router.push('/login?error=spotify'));
  }, [router.isReady]);

  return null;
}
```

**`src/pages/api/posts/music.ts`** (NOVO)

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@lib/firebase/app';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { text, spotifyTrackId, userId, token } = req.body;

    const { data: track } = await axios.get(
      `https://api.spotify.com/v1/tracks/${spotifyTrackId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await addDoc(collection(db, 'musicPosts'), {
      text,
      spotifyTrackId,
      track,
      createdBy: userId,
      createdAt: new Date(),
      userLikes: []
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
}
```

---

## 🎨 Integração em Páginas

**`src/pages/login.tsx`** - Adicione ao `LoginMain`:

```typescript
import { SpotifyLoginButton } from '@components/spotify/spotify-login-button';

// Dentro do componente, após os outros botões:
<div className='mt-6'>
  <SpotifyLoginButton />
</div>;
```

**`src/pages/trends.tsx`** - Substitua por:

```typescript
import { useEffect, useState } from 'react';
import { SpotifyTrack } from '@lib/types/spotify';
import axios from 'axios';

export default function Trends() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);

  useEffect(() => {
    axios
      .get('https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYsB0d/tracks')
      .then((res) => setTracks(res.data.items.map((i: any) => i.track)))
      .catch(console.error);
  }, []);

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-700'>
      <h2 className='border-b border-gray-700 p-4 text-xl font-bold'>
        🔥 Top 50 Global
      </h2>

      {tracks.map((track, i) => (
        <a
          key={track.id}
          href={track.external_urls.spotify}
          target='_blank'
          rel='noreferrer'
          className='flex gap-3 border-b border-gray-700 p-4 last:border-b-0 hover:bg-gray-900'
        >
          <span className='min-w-fit font-bold text-gray-500'>#{i + 1}</span>
          <img
            src={track.album.images[0]?.url}
            alt={track.name}
            className='h-10 w-10 rounded'
          />
          <div className='min-w-0 flex-1'>
            <p className='truncate font-bold text-white'>{track.name}</p>
            <p className='truncate text-sm text-gray-500'>
              {track.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
```

---

## 📋 Checklist

- [ ] 1. Adicionar variáveis `.env.development`
- [ ] 2. Criar `src/lib/types/spotify.ts`
- [ ] 3. Criar `src/lib/firebase/spotify-auth.ts`
- [ ] 4. Criar componentes em `src/components/spotify/`
- [ ] 5. Criar rotas API em `src/pages/api/`
- [ ] 6. Criar `src/pages/auth/spotify/callback.tsx`
- [ ] 7. Integrar botão em `login.tsx`
- [ ] 8. Atualizar `trends.tsx`
- [ ] 9. Testar fluxo OAuth

---

## 🔑 Setup Spotify

1. https://developer.spotify.com/dashboard
2. Criar nova app
3. Copiar `Client ID` e `Client Secret`
4. Adicionar Redirect URI: `http://localhost:3000/auth/spotify/callback`
5. Adicionar ao `.env.development`
