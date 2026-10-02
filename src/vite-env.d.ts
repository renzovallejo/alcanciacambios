/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_SEED?: 'vacio' | 'semana' }
interface ImportMeta { readonly env: ImportMetaEnv }
