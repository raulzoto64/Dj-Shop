/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_IMAGEKIT_PUBLIC_KEY: string
  readonly VITE_IMAGEKIT_URL_ENDPOINT: string
  readonly VITE_IMAGEKIT_AUTHENTICATION_ENDPOINT: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
