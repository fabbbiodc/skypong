# Spanish Content Translation Progress

This document tracks Spanish content that needs to be translated to English, excluding locale/text files used in the website UI (those are handled separately in the i18n system).

**Purpose:** Progress diary for translating non-locale Spanish content into English.

---

## Translation Progress

| Status         | Files | Notes                      |
| -------------- | ----- | -------------------------- |
| ✅ Done        | 9     | All translations completed |
| 🔄 In Progress | -     | -                          |
| ⏳ Pending     | -     | -                          |

---

## Completed Translations

### 1. docker-compose.yml

**Status:** ✅ Done  
**Lines translated:** 65, 75, 157

- `# - Sirve / (frontend estático)` → `# - Serves / (static frontend)`
- `# opcional: redirección HTTP->HTTPS` → `# optional: HTTP->HTTPS redirect`
- `# añade aquí secretos vía .env (no hardcode)` → `# add secrets here via .env (no hardcode)`

---

### 2. docker-compose-template.yml

**Status:** ✅ Done  
**Lines translated:** 65, 75, 157

- Same changes as docker-compose.yml

---

### 3. alertmanager/alertmanager.yml

**Status:** ✅ Done  
**Lines translated:** 10-12

- `# Para demo, lo más simple: usar webhook a un servicio mock o solo log.` → `# For demo, the simplest: use webhook to a mock service or just log.`
- `# Aquí lo dejamos sin integraciones externas.` → `# Here we leave it without external integrations.`
- `# Puedes añadir email/slack/discord más adelante.` → `# You can add email/slack/discord later.`

---

### 4. profile-service/src/keys.ts

**Status:** ✅ Done  
**Line translated:** 32

- `// Pausa sincrónica de 1 segundo (solo durante el arranque)` → `// Synchronous pause of 1 second (only during startup)`

---

### 5. profile-service/src/index.ts

**Status:** ✅ Done  
**Lines translated:** 161-165, 293, 380, 511, 605, 613, 678

- `// Registrar el plugin de métricas` → `// Register metrics plugin`
- `// Métricas del sistema (CPU, RAM, Event Loop)` → `// System metrics (CPU, RAM, Event Loop)`
- `// Métricas de tus rutas (peticiones/segundo, latencia)` → `// Your route metrics (requests/second, latency)`
- `// ¿aparece esto en los logs?` → `// does this appear in logs?`
- `// 2. Buscamos el usuario actualizado...` → `// 2. We fetch the updated user...`
- `// O la ruta donde guardes físicamente los archivos` → `// Or the path where you physically store files`
- `// ✅ CORRECCIÓN: Guarda en el volumen persistente` → `// ✅ CORRECTION: Save to persistent volume`
- `// ✅ URL pública del avatar` → `// ✅ Public avatar URL`
- `Recibida petición: ${method} ${url}` → `Received request: ${method} ${url}`

---

### 6. profile-service/Dockerfile

**Status:** ✅ Done  
**Lines translated:** All comments (2, 7, 16, 25, 31, 44, 53)

- Full translation of all Spanish comments to English

---

### 7. nginx-gateway/public/index.html

**Status:** ✅ Done  
**Lines translated:** 50-54

- `Arquitectura lista ✅` → `Architecture ready`
- Full paragraph translated to English

---

### 8. nginx-gateway/nginx.conf

**Status:** ✅ Done  
**Lines translated:** 42, 52, 201, 227, 244

- `# SERVIDOR PRINCIPAL (HTTPS)` → `# MAIN SERVER (HTTPS)`
- `# API ROUTES (deben ir ANTES del location /)` → `# API ROUTES (must go BEFORE location /)`
- `# Alias legacy: redirige al path canónico del game frontend` → `# Legacy alias: redirects to canonical game frontend path`
- `# SERVIDOR PARA MÉTRICAS (puerto 8080)` → `# METRICS SERVER (port 8080)`
- `# OPCIONAL: Redirección HTTP -> HTTPS` → `# OPTIONAL: HTTP -> HTTPS Redirect`

---

### 9. front/specs/screens.md

**Status:** ✅ Done  
**Lines translated:** ~1166 (entire document)

- Full documentation translated from Spanish to English

---

## Excluded (i18n Locale Files)

These files contain UI text translations and are part of the i18n system - they should NOT be translated (they ARE the locale/text used in the website):

| File                                                | Content                              |
| --------------------------------------------------- | ------------------------------------ |
| front/app/lib/i18n/locales/es.ts                    | Full Spanish translation (612 lines) |
| game/client/src_cli/config/UITexts.ts (lines 60-83) | Spanish ("es") game UI locale        |

### game/client/src_cli/config/UITexts.ts - Spanish locale content (lines 60-83):

```typescript
es: {
  gameOver: {
    title: "FIN DE PARTIDA",
    playAgain: "Jugar de Nuevo",
    backToMenu: "Volver al Menú",
    winner: "¡{winnerName} Gana!",
    score: "...",
  },
  pause: {
    title: "PAUSA",
    resume: "Continuar",
    quitToMenu: "Salir al Menú",
  },
  hud: {
    player1Default: "Jugador 1",
    player2Default: "Jugador 2",
    scoreDefault: "0",
  },
  controlHints: {...}
}
```

This is game UI locale text, part of the i18n system.

---

## Directories Checked (No Spanish Content Found)

| Directory                      | Status        |
| ------------------------------ | ------------- |
| auth-service                   | ✅ No Spanish |
| statistics-service             | ✅ No Spanish |
| game/\* (excluding UITexts.ts) | ✅ No Spanish |
| seed                           | ✅ No Spanish |
| grafana                        | ✅ No Spanish |
| prometheus                     | ✅ No Spanish |
| docs                           | ✅ No Spanish |
| .github                        | ✅ No Spanish |
| All README.md files            | ✅ No Spanish |

---

## Translation Log

| Date       | File                                                                           | Changes Made                                         |
| ---------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 2026-04-14 | All                                                                            | Initial document created                             |
| 2026-04-14 | game/client/src_cli/config/UITexts.ts                                          | Confirmed as i18n locale (excluded from translation) |
| 2026-04-14 | All directories                                                                | Comprehensive deep search completed                  |
| 2026-04-14 | docker-compose.yml, docker-compose-template.yml, alertmanager/alertmanager.yml | Added to pending list                                |
| 2026-04-14 | All directories checked                                                        | Added directory verification summary                 |
| 2026-04-14 | docker-compose.yml                                                             | Translated to English                                |
| 2026-04-14 | docker-compose-template.yml                                                    | Translated to English                                |
| 2026-04-14 | alertmanager/alertmanager.yml                                                  | Translated to English                                |
| 2026-04-14 | profile-service/src/keys.ts                                                    | Translated to English                                |
| 2026-04-14 | profile-service/src/index.ts                                                   | Translated to English                                |
| 2026-04-14 | profile-service/Dockerfile                                                     | Translated to English                                |
| 2026-04-14 | nginx-gateway/public/index.html                                                | Translated to English                                |
| 2026-04-14 | nginx-gateway/nginx.conf                                                       | Translated to English                                |
| 2026-04-14 | front/specs/screens.md                                                         | Translated to English (full document)                |
| 2026-04-14 | ALL                                                                            | Translation complete - 9 files done                  |
