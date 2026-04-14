# screens.md

## Screen: Landing Page

**Ruta:** `/`  
**Propósito:** Entrada principal. Permite iniciar una partida (eligiendo modo) o navegar a autenticación. 
**Comportamiento:** Si el cliente ha estado autenticado e intenta acceder a esta url, se le va a redirigir a la ruta `/app`

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGO DIO`
- **Acciones (derecha):**
  - Botón **Sign In** → navega a `/signin`
  - Botón **Sign Up** → navega a `/signup`

**Hero (centro de la pantalla)**
- Texto principal (H1): “Play Pong”
- Botón primario **Play** (CTA) -> "Call to ACTION"

**Footer**
- Links pequeños: Privacy / Terms -> Descrito en el subject (“The project must include accessible Privacy Policy and Terms of Service pages with relevant content.”)

---

### Componentes

#### 1) Button: Play
- **Label:** `Play`
- **Tipo:** Primario (alta prominencia)
- **Acción:** abre modal “Choose mode”

#### 2) Button: Sign In
- **Label:** `Sign In`
- **Tipo:** Secundario
- **Acción:** `navigate("/signin")`

#### 3) Button: Sign Up
- **Label:** `Sign Up`
- **Tipo:** Secundario
- **Acción:** `navigate("/signup")`

---

### Modal: Choose Game Mode

**ID:** `choose-mode-modal`  
**Se abre desde:** botón Play  
**Se cierra por:**
- Botón X
- Click fuera del modal (backdrop)
- Tecla `Esc`

**Contenido:**
- **Título:** “Choose game mode”
- **Opciones (cards o botones grandes):**
  1) **1 vs 1 — Local**
     - Descripción corta: “Two players, same keyboard.”
     - **Acción:** `navigate("/game/local")`
  2) **1 vs AI**
     - Descripción corta: “Play against the computer.”
     - **Acción:** `navigate("/game/ai")`

**Accesibilidad del modal:**
- `role="dialog"` + `aria-modal="true"`
- Focus trap dentro del modal
- Al abrir: foco en la primera opción (o en el título)
- Al cerrar: vuelve el foco al botón Play

---

### Estados de la pantalla

1) **Default (modal cerrado)**
- Visible: Header, Hero, botones
- Interacciones: Play / Sign In / Sign Up

2) **Modal abierto**
- Backdrop visible
- Scroll del body bloqueado
- Solo interactuable el modal (focus trap)

3) **Hover / Focus**
- Botones con estados claros (hover/focus/active)
- En móvil: estados de tap

---

### Comportamiento responsive

**Desktop**
- Header en una fila
- Hero centrado (máx ancho recomendado)
- Botones en fila

**Mobile**
- Header: título a la izquierda, botones a la derecha (o menú compacto si no cabe)
- Hero: todo en columna
- Modal: ocupa casi todo el ancho con padding cómodo

---

### Criterios de aceptación (QA)

- [ ] Al entrar a `/` se ve el título + botones Sign In/Sign Up + botón Play.
- [ ] Click en **Sign In** navega a `/signin`.
- [ ] Click en **Sign Up** navega a `/signup`.
- [ ] Click en **Play** abre el modal con 2 opciones: `1 vs 1 - Local` y `1 vs AI`.
- [ ] Click en cada opción navega a su ruta correspondiente.
- [ ] El modal se cierra con `Esc`, click fuera, o el botón X.
- [ ] Al cerrar, el foco vuelve al botón Play (accesibilidad).
- [ ] No hay errores en consola al abrir/cerrar el modal o navegar.

---

### Notas para API / Backend
- Esta landing no requiere API.

----------------

## Screen: Sign In

**Ruta:** `/signin`  
**Propósito:** autenticar al usuario y redirigirlo a la landing autenticada.  
**Usuarios:** no autenticados (si ya está autenticado → redirigir a `/app`).

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGO DIO`

**Main (centrado)**
- Card: **Sign In**
  - Título: “Sign In”
  - Formulario
  - CTA principal: “Sign In”
  - Links secundarios: “Don’t have an account? Sign Up”

**Footer (opcional)**
- Terms / Privacy

---

### Componentes

#### 1) Form: Sign In

**Campos**
- **Username or Email**
  - type: `text`
  - placeholder: “yourname / name@email.com”
  - required
- **Password**
  - type: `password`
  - placeholder: “••••••••”
  - required

**Validaciones**
- Campos requeridos (no vacíos)
- Mostrar error inline bajo el campo
- Deshabilitar submit mientras loading

#### 2) Button: Sign In (submit)
- **Label:** `Sign In`
- **Tipo:** Primario
- **Acción:** llama a API de login

#### 3) Link: Sign Up
- **Texto:** “Don’t have an account? Sign Up”
- **Acción:** `navigate("/signup")`

#### 4) Error Banner (global)
- Visible cuando el backend devuelve error general:
  - “Invalid credentials”

---

### Estados de la pantalla

1) **Default**
- Campos vacíos, submit deshabilitado hasta que haya valores

2) **Typing**
- Validación inline (solo al blur o al submit)

3) **Submitting (loading)**
- Botón con spinner
- Inputs deshabilitados

4) **Success**
- Guardar sesión/token
- Redirigir a `/app`

5) **Error**
- Mostrar banner global + (opcional) error específico en campo password

---

### Criterios de aceptación (QA)

- [ ] Navegar a `/signin` muestra el formulario.
- [ ] Campos requeridos: si están vacíos, no envía y muestra errores.
- [ ] Credenciales válidas → inicia sesión y redirige a `/app`.
- [ ] Credenciales inválidas → muestra error sin recargar página.
- [ ] Si usuario ya autenticado entra a `/signin`, se redirige a `/app`.
- [ ] No hay errores en consola.

---

### Notas para API

- `POST /auth/login`
  - Body: `{ identifier: string, password: string }`  
    *(identifier = username o email)*
  - Success: `{ token, user: { id, username, email? } }`
  - Error: `401` invalid credentials, `500`

-------------------

## Screen: Sign Up

**Ruta:** `/signup`  
**Propósito:** registrar usuario y redirigirlo a `/app` autenticado o tal vez a `/signin` (INSIGHTS??)  
**Usuarios:** no autenticados (si ya está autenticado → redirigir a `/app`).

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGODIO` (clickable → `/`)

**Main (centrado)**
- Card: **Create account**
  - Título: “Sign Up”
  - Formulario
  - CTA principal: “Create account”
  - Links secundarios: “Already have an account? Sign In”

---

### Componentes

#### 1) Form: Sign Up

**Campos (mínimos)**
- **Username**
  - type: `text`
  - placeholder: “yourname”
  - required
- **Email**
  - type: `email`
  - placeholder: “name@email.com”
  - required
- **Password**
  - type: `password`
  - required
- **Confirm password**
  - type: `password`
  - required

**Opcionales**
- Checkbox: “I accept Terms”
- Info: reglas de password (mínimo 8 chars, etc.)

**Validaciones (frontend)**
- Username:
  - requerido
  - formato válido (definir - INSIGHTS??)
- Email:
  - formato válido
- Password:
  - requerido
  - formato válido
- Confirm password:
  - debe coincidir con password
- Mostrar errores inline debajo de cada campo
- Deshabilitar submit mientras loading

#### 2) Button: Create account (submit)
- **Label:** `Create account`
- **Tipo:** Primario
- **Acción:** llama a API de registro

#### 3) Link: Sign In
- **Texto:** “Already have an account? Sign In”
- **Acción:** `navigate("/signin")`

#### 4) Error Banner (global)
- Errores típicos:
  - “Username already taken”
  - “Email already in use”
  - “Invalid input”
  - “Server error, try again”

---

### Estados de la pantalla

1) **Default**
- Campos vacíos

2) **Typing**
- Validación al blur o submit

3) **Submitting (loading)**
- Spinner en botón
- Inputs deshabilitados

4) **Success**
- Opción A: auto-login → guardar token → redirect `/`
- Opción B: redirect `/signin` con mensaje “Account created”

    (decidir)

5) **Error**
- Banner global + errores por campo según respuesta backend


---

### Criterios de aceptación (QA)

- [ ] Navegar a `/signup` muestra el formulario.
- [ ] Validaciones frontend funcionan (required + confirm password).
- [ ] Registro válido crea cuenta y redirige según flujo definido.
- [ ] Si username/email ya existen, muestra error claro.
- [ ] Si usuario ya autenticado entra a `/signup`, se redirige a `/app`. (maybe)
- [ ] No hay errores en consola.

---

### Notas para API (contrato mínimo)

- `POST /auth/signup`
  - Body: `{ username: string, email?: string, password: string }`
  - Success:
    - si auto-login: `{ token, user: { id, username, email? } }`
    - si no auto-login: `{ user: { id, username, email? } }`
  - Error: `409` (username/email en uso), `400` (validación), `500`

---------------------------------

## Screen: Landing Page (Authenticated)

**Ruta:** `/app`  
**Requisitos previos:** usuario autenticado (sesión válida / token válido).  
**Propósito:** entrada principal post-login: iniciar partida (local/IA/remota), ver salas disponibles, navegar a leaderboard y perfil, y cerrar sesión.
**Comportamiento:** si el cliente no esta autenticado se le va a redirigir a la ruta `/`

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGODIO` (clickable → `/`)
- **Acciones (derecha):**
  - Botón **Play** → abre modal “Choose local mode”
  - Botón **Remote** → abre modal “Remote Rooms”
  - Botón **Leaderboard** → navega a `/leaderboard`
  - Botón **Profile** → navega a `/profile`
  - Botón **Log out** → cierra sesión y navega a `/` (modo guest)
**Hero (centro)**
- Texto principal (H1): “Play Pong”
- CTA primario: **Play**
- (Opcional) Estado sutil: “You are online” / “Connected” si hay realtime

**Footer (opcional)**
- Links a Terms / Privacy -> obligatorio en el subject v19
---

### Componentes

#### 1) Button: Log out
- **Label:** `Log out`
- **Tipo:** Secundario
- **Acción:** invalidar sesión y redirigir

#### 2) Button: Leaderboard
- **Label:** `Leaderboard`
- **Tipo:** Secundario
- **Acción:** `navigate("/leaderboard")`

#### 3) Button: Profile
- **Label:** `Profile`
- **Tipo:** Secundario
- **Acción:** `navigate("/profile")`

#### 4) Button: Play
- **Label:** `Play`
- **Tipo:** Primario
- **Acción:** abre modal “Choose game mode”

#### 5) Button: Remote
- **Label:** `Remote`
- **Tipo:** Secundario
- **Acción:** abre modal "Remote Rooms"
- **Estado dinámico (rooms disponibles):**
  - Si hay 1+ salas “open”, el botón entra en modo “attention”
- **Si no hay salas:** estilo normal, sin animación

### Lógica del botón Remote (intermitente)

  - **Condición para activar “attention mode”:**
    - `availableRoomsCount > 0`
  - **Comportamiento sugerido:**
    - Animación tipo “pulse” cada ~1–2s

---

### Modal: Choose Game Mode

**ID:** `choose-mode-modal`  
**Se abre desde:** botón Play  
**Se cierra por:**
- Botón X
- Click fuera del modal (backdrop)
- Tecla `Esc`

**Contenido:**
- **Título:** “Choose game mode”
- **Opciones (cards/botones grandes):**
  1) **1 vs 1 — Local**
     - Descripción corta: “Two players, same keyboard.”
     - **Acción:** `navigate("/game/local")`
  2) **1 vs AI**
     - Descripción corta: “Play against the computer.”
     - **Acción:** `navigate("/game/ai")`


**Accesibilidad del modal:**
- `role="dialog"` + `aria-modal="true"`
- Focus trap dentro del modal
- Al abrir: foco en la primera opción
- Al cerrar: vuelve el foco al botón Play

---
### Modal: Remote Rooms

**Header del modal**
- Título: “Remote Match”
- Tabs / Segmented control:
  - **Join room**
  - **Create room**

---

### Tab A: Join room (ver salas abiertas)

**Estados:**

1) **Loading**
- Skeleton list / spinner
- Texto: “Loading rooms…”

2) **Empty**
- Texto: “No open rooms right now”
- CTA: “Create one” (cambia al tab Create)

3) **With rooms (lista scrollable)**
Cada **Room item** muestra:
- Room name
- Host username
- Players: `1 / 2`
- Status badge: `Open`
- CTA **Join**

**Acción Join**
- `POST /rooms/:id/join`
- Loading state en el botón del item
- En éxito:
  - Cierra modal
  - Navega a `/rooms/:id` (lobby o juego)
- En error:
  - Mensaje inline:
    - “Room is full”
    - “Room no longer available”
  - Refresca lista

---

### Tab B: Create room (Create Remote Match)

**Objetivo:** crear una sala remota y llevar al usuario a la “lobby room”.

**UI (en el modal):**
- Campo: **Room name** (placeholder: “My room”)
- Botón primario: **Create**
- Botón secundario: **Cancel** (vuelve a opciones del modal)

**Acción Create:**
- Llama a `POST /rooms`
- En éxito:
  - Cierra modal
  - Navega a `/rooms/:roomId` (lobby)
- En error:
  - Muestra mensaje inline (p.ej. “Couldn’t create room. Try again.”)

---

### Estados de la pantalla

1) **Default (autenticado, sin modal, sin popup)**
- Header con Leaderboard/Profile/Log out
- Hero con Play

2) **Modal abierto**
- Scroll body bloqueado
- Focus trap
- Opciones: Local / AI / Create Remote Match

3) **Create Remote Match (subestado del modal)**
- Form visible
- Validación de campos (si existe room name)
- Loading state en botón Create

4) **Popup de salas visible**
- Lista cargada
- Botón Join habilitado solo si la sala está “Open”

5) **Cargando rooms (si aplica)**
- Skeleton loader o spinner en popup/panel

6) **Errores**
- Error creando sala
- Error unirse a sala
- Error cargando salas (muestra “Retry”)

---


### Responsive behavior

**Desktop**
- Header con botones alineados
- Modal centrado
- Lista scrollable interna

**Mobile**
- Header compacto (botones con iconos/labels)
- Modal casi fullscreen
- Join y Create con CTAs grandes

---

### Criterios de aceptación (QA)

- [ ] Usuario autenticado ve: Play, Remote, Leaderboard, Profile, Log out.
- [ ] Si hay rooms abiertas, Remote cambia de estado (animación + contador/dot).
- [ ] Click en Remote abre el modal Remote Rooms.
- [ ] En Join room se listan salas abiertas con CTA Join.
- [ ] Join exitoso navega a `/rooms/:id` y cierra el modal.
- [ ] En Create room se puede crear sala y navegar a `/rooms/:roomId`.
- [ ] Modal se cierra con Esc, click fuera o X, y devuelve foco al botón Remote.
- [ ] Si no hay rooms, Join room muestra estado Empty y ofrece ir a Create.
- [ ] No hay errores en consola al actualizar rooms, animación, join o create.

---

### Notas para API / Realtime

- Rooms disponibles:
  - `GET /rooms?status=open`
- Crear room:
  - `POST /rooms`
- Join room:
  - `POST /rooms/:id/join`

**Para actualizar el “attention mode” del botón Remote:**
- Opción A: polling (simple)
  - Cada 5–10s `GET /rooms?status=open` (solo en `/`)
- Opción B: WebSocket (mejor UX)
  - Evento `rooms:update` con `{ openCount, rooms[] }`

---------------------------------

## Screen: Remote Room Lobby

**Ruta:** `/rooms/:roomId`  
**Requisitos previos:** usuario autenticado y ha creado o se ha unido a una sala remota.  
**Propósito:** sala de espera antes de empezar el juego remoto: ver estado de jugadores, marcarse “ready”, iniciar partida cuando ambos estén listos, o salir/cancelar.

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGO DIO`
- Acciones (derecha):
  - Botón **Leave room** (si eres guest) / **Cancel room** (si eres host)

**Main (centrado / card principal)**
- Card: **Room Info**
  - Room name (si existe)
  - Room ID (corto/slug) + botón “Copy” (opcional)
  - Estado: `Waiting for opponent` / `Opponent joined` / `Starting...`

- Card: **Players**
  - Slot Host
  - Slot Guest
  - Estado Ready/Not ready por jugador
  - Controles (keyboard arrows)

---

### Componentes

#### 1) Room Info Card
- **Room name:** string
- **Room code:** versión corta del `roomId`
- **Room status badge:**
  - `Open` (1/2)
  - `Full` (2/2)
  - `Starting`

#### 2) Players Card
Mostrar 2 slots:

**Host slot**
- Avatar (placeholder)
- Username
- Badge: `HOST`
- Ready state: `Ready` / `Not ready`

**Guest slot**
- Si vacío: “Waiting for opponent…”
- Si ocupado: avatar + username + ready state


#### 3) Actions Card

**Button: Ready / Unready**
- **Label (toggle):**
  - si no ready → `Ready`
  - si ready → `Unready`
- **Acción:**
  - `POST /rooms/:id/ready` body `{ ready: true|false }`
  - o evento WebSocket `room:ready`
- **Estados:**
  - Loading al enviar
  - El sistema inicia al detectar ambos ready.

**Button: Leave / Cancel**
- Si usuario es **guest** → label `Leave room`
  - Acción: `POST /rooms/:id/leave`
- Si usuario es **host** → label `Cancel room`
  - Acción: `POST /rooms/:id/cancel` (cierra sala para ambos)
- En éxito: navegar a `/` (landing autenticada)

---

### Estados de la screen

1) **Loading lobby**
- Cargando datos de la sala y estado de jugadores
- Spinner/skeleton en cards

2) **Host alone (room open)**
- Host ocupado, Guest vacío
- Estado: “Waiting for opponent…”
- Ready disponible para host

3) **Guest joined (room full)**
- Ambos slots ocupados
- Ready disponible para ambos

4) **Ready toggled**
- Ready/Unready refleja instantáneamente
- Se sincroniza con eventos realtime

5) **Both ready**
- Auto-start:
  - Cambia estado a `Starting...`
  - Inicia **countdown** (3…2…1) y navega a `/game/remote/:roomId`

6) **Countdown to start**
- Overlay o bloque dentro de Room Info:
  - “Match starting in 3…”
- Deshabilitar botones Ready/Leave durante el countdown

7) **Opponent left**
- Mensaje: “Opponent left the room”
- Sala vuelve a estado open (host esperando) o sale a `/` (si el host decide cerrar)
- Guest: al salir el host, se redirige a `/`

8) **Room canceled / closed**
- Mensaje: “Room was canceled”
- CTA: “Back to home” → `/`

9) **Error states**
- “Failed to load room” + Retry
- “Join failed (room full/closed)” → redirige a `/` con toast
- “Connection lost” (si WS) → intenta reconectar / muestra banner

---

### Navegación / rutas relacionadas

- Desde Remote modal:
  - Join/Create → `/rooms/:roomId`
- Desde lobby a juego:
  - `/game/remote/:roomId` (o la ruta que defináis)

---

### Criterios de aceptación (QA)

- [ ] Entrar a `/rooms/:id` muestra Room Info + Players + Actions.
- [ ] Si no hay guest, se ve “Waiting for opponent…”.
- [ ] Cuando entra un guest, la UI se actualiza sin refrescar (WS o polling).
- [ ] Ready/Unready funciona y se refleja en ambos clientes.
- [ ] Cuando ambos están ready:
  - auto-start: aparece countdown y navega al juego
  - o host-start: Start se habilita para el host y al pulsarlo inicia countdown + navega
- [ ] Leave (guest) saca al usuario a `/` y libera el slot.
- [ ] Cancel (host) cierra la sala y expulsa al guest a `/`.
- [ ] Si el oponente se va, se muestra mensaje y el estado se actualiza correctamente.
- [ ] Modalidades de error (room closed/full) redirigen y muestran feedback.
- [ ] Accesibilidad básica: foco visible, botones con labels claros, no depender solo del color.

---

### Notas para API (contrato mínimo)

**Get room state**
- `GET /rooms/:id`
  - Response: `{ id, name?, status, host: {id, username}, guest?: {id, username}, hostReady, guestReady }`

**Ready toggle**
- `POST /rooms/:id/ready` body `{ ready: boolean }`

**Leave / Cancel**
- Guest: `POST /rooms/:id/leave`
- Host: `POST /rooms/:id/cancel`

**Transición a juego**
- Devolver un `gameId` al iniciar:
  - `{ gameId }` y navegar a `/game/remote/:gameId`


--------------------------------

## Screen: Profile

**Ruta:** `/profile`  
**Requisitos previos:** usuario autenticado.  
**Propósito:** ver y editar datos del usuario (nickname, bio, password, avatar, win phrase) y navegar a Home o hacer logout.

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGODIO`
- Acciones (derecha):
  - Botón **Home** → navega a `/app`
  - Botón **Log out** → cierra sesión

**Main (centrado / ancho medio)**
- Card principal: **Profile**
  - Avatar + nickname
  - Datos del perfil
  - Botón **Edit profile** (cuando está en modo “view”)
  - En modo “edit”: formulario + botón **Accept changes** + botón **Cancel**

**Sección secundaria**
- Card: **Stats summary**
  - Wins / Losses / Winrate

---

### Componentes

#### 1) Avatar
**Modo view**
- Imagen actual del avatar (o placeholder)
- Texto: “Change avatar”

**Modo edit**
- Preview de avatar
- Input: Upload avatar (`image/*`)

**Validación**
- Tipo permitido: PNG/JPG/WebP (definir)
- Tamaño máximo (definir, p.ej. 2MB)
- Mostrar error inline si falla

---

#### 2) Campos del perfil

**Campos editables**
- **Nickname**
  - view: texto
  - edit: input text
- **Bio**
  - view: texto multilínea (si vacío: “No bio yet”)
  - edit: textarea (con contador opcional)
- **Win phrase** *(frase que sale cuando gana)*
  - view: texto
  - edit: input text o textarea corta
- **Password**
  - view: no mostrar el valor (solo “••••••••” o “Password set”)
  - edit: bloque separado “Change password”

**Bloque: Change password (solo en modo edit)**
- Current password (required)
- New password (required)
- Confirm new password (required)

**Validaciones (frontend)**
- Nickname: requerido, longitud mínima
- Bio: límite de caracteres
- Win phrase: límite de caracteres
- Password:
  - new password != empty
  - confirm coincide
  - mostrar errores inline

---

#### 3) Botones / acciones

**Modo view**
- Button: **Edit profile**
  - Acción: cambia a modo edit
- Button: **Home**
  - Acción: `navigate("/app")`
- Button: **Log out**
  - Acción: logout

**Modo edit**
- Button primario: **Accept changes**
  - Acción: guarda cambios (API)
- Button secundario: **Cancel**
  - Acción: descarta cambios locales y vuelve a modo view

---

### Estados de la pantalla

1) **Loading**
- Cargando perfil (`GET /me`)
- Skeleton para avatar + campos

2) **View mode (default)**
- Campos como texto
- Botón “Edit profile” visible
- No hay inputs editables

3) **Edit mode**
- Inputs habilitados
- “Accept changes” y “Cancel” visibles

4) **Submitting changes**
- Botón Accept con spinner
- Inputs deshabilitados
- Evitar doble submit

5) **Success**
- Toast: “Profile updated”
- Vuelve a view mode

6) **Error**
- Banner global: “Couldn’t update profile”
- Errores por campo (p.ej. nickname en uso, current password incorrect)

---

### Comportamiento responsive

- Desktop: cards centradas
- Mobile: una columna, avatar arriba, botones full-width si hace falta

---

### Criterios de aceptación (QA)

- [ ] Entrar a `/profile` carga y muestra el perfil del usuario.
- [ ] En **view mode** no se pueden editar campos.
- [ ] Pulsar **Edit profile** activa el **edit mode** con inputs.
- [ ] Pulsar **Cancel** descarta cambios y vuelve a view mode.
- [ ] Pulsar **Accept changes** guarda cambios y muestra confirmación.
- [ ] Cambio de password exige current + new + confirm, y valida coincidencia.
- [ ] Avatar se puede actualizar en edit mode y se refleja al guardar.
- [ ] Botón **Home** lleva a `/`.
- [ ] Botón **Log out** cierra sesión y redirige correctamente.
- [ ] No hay errores en consola.

---

### Notas para API (contrato mínimo)

**Obtener perfil actual**
- `GET /me`
  - Response: `{ id, nickname, bio, avatarUrl, winPhrase, ... }`

**Actualizar datos (sin password)**
- `PATCH /me`
  - Body (parcial): `{ nickname?, bio?, winPhrase?, avatarUrl? }`
  - Error:
    - `409` nickname en uso
    - `400` validación

**Actualizar avatar (si lo tratáis como upload)**
- Opción A (simple): `POST /me/avatar` multipart/form-data → `{ avatarUrl }`
- Opción B (si ya tenéis storage): frontend sube a storage y luego `PATCH /me` con `avatarUrl`

**Cambiar password**
- `POST /me/password`
  - Body: `{ currentPassword, newPassword }`
  - Error: `401/403` current password incorrect, `400` validación

**Logout**
- `POST /auth/logout` o invalidación local si JWT stateless

**Formato de error recomendado**
- `{ error: { code, message, field? } }`
  - Ej: `{ error: { code: "NICKNAME_TAKEN", field: "nickname", message: "Nickname already in use" } }`

--------------------


## Screen: Leaderboard

**Ruta:** `/leaderboard`  
**Requisitos previos:** usuario autenticado.  
**Propósito:** mostrar ranking/listado de usuarios registrados con estadísticas básicas y permitir acceder a perfiles públicos.

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGODIO`
- Acciones (derecha):
  - Botón **Home** → navega a `/app`
  - Botón **Log out** → cierra sesión

**Main**
- Card principal: **Leaderboard**
  - Título: “Leaderboard”
  - Tabla de usuarios

---

### Componentes

#### 1) Tabla: Leaderboard

**Columnas**
1. **Nickname**
   - Texto clickable (link)
   - **Acción:** `navigate("/users/:userId")`
2. **Status**
   - Badge:
     - `Online` (verde)
     - `Offline` (gris)
3. **Played**
   - Número total de partidas jugadas
4. **Wins**
   - Número de partidas ganadas
5. **Losses**
   - Número de partidas perdidas
6. **Winrate** (%)
7. **Rank** (posición)
8. **Add**
    - Anadir como amigo

**Estados de la tabla**
- Loading (skeleton rows)
- Empty (“No users found”)
- Error (“Could not load leaderboard” + Retry)

---

### Interacciones

- Click en **Nickname**:
  - Navega al **Public Profile** del usuario
- Paginación:
  - Prev / Next o infinite scroll

---

### Estados de la screen

1) **Loading**
- Tabla con filas skeleton

2) **Loaded**
- Lista visible y scrollable

3) **Error**
- Banner global + Retry

---

### Comportamiento responsive

- Desktop: tabla completa
- Mobile:
  - Tabla simplificada o cards por usuario:
    - Nickname
    - Status
    - Played / Wins / Losses

---

### Criterios de aceptación (QA)

- [ ] Navegar a `/leaderboard` muestra la tabla de usuarios.
- [ ] Cada fila muestra nickname, status, played, wins, losses.
- [ ] Nickname es clickable y lleva a perfil público.
- [ ] Botón Home redirige a `/app`.
- [ ] Botón Log out cierra sesión y redirige correctamente.
- [ ] No hay errores en consola.

---

### Notas para API

**Obtener leaderboard**
- `GET /leaderboard`
  - Response:
    ```json
    [
      {
        "id": "userId",
        "nickname": "player1",
        "status": "online",
        "played": 42,
        "wins": 25,
        "losses": 17
      }
    ]
    ```

-------------------------------------------

## Screen: Public Profile (Read-only)

**Ruta:** `/users/:userId`  
**Requisitos previos:** usuario autenticado.  
**Propósito:** mostrar información pública de un usuario seleccionado desde la leaderboard.

---

### Layout (estructura)

**Header / Top Nav**
- **Título / Logo:** `PONGODIO`
- Acciones (derecha):
  - Botón **Home** → navega a `/app`
  - Botón **Leaderboard** → navega a `/leaderboard`
  - Botón **Log out** → cierra sesión

**Main (centrado)**
- Card principal: **Public Profile**
  - Avatar
  - Nickname
  - Status (online/offline)
  - Bio
  - Win phrase
  - Stats

---

### Componentes

#### 1) Avatar
- Imagen del usuario (o placeholder)
- Solo visualización (no editable)

#### 2) Datos públicos

- **Nickname**
  - Texto grande (H2)
- **Status**
  - Badge Online / Offline
- **Bio**
  - Texto multilinea
  - Si vacío: “No bio provided”
- **Win phrase**
  - Texto destacado (quote-style)

---

#### 3) Stats Card

- **Played**
- **Wins**
- **Losses**
- **Winrate**
- **Rank**

---

### Estados de la screen

1) **Loading**
- Skeleton avatar + textos

2) **Loaded**
- Datos visibles

3) **Error**
- “User not found” / “Could not load profile”
- CTA: Back to leaderboard

---

### Navegación / acciones

- Botón **Leaderboard**
  - Acción: `navigate("/leaderboard")`
- Botón **Home**
  - Acción: `navigate("/")`
- Botón **Log out**
  - Acción: logout

---

### Comportamiento responsive

- Desktop: avatar + info en dos columnas
- Mobile: todo en una columna, avatar arriba

---

### Criterios de aceptación (QA)

- [ ] Click en nickname en leaderboard navega a `/users/:id`.
- [ ] Public profile muestra datos correctos y no editables.
- [ ] Botón Leaderboard vuelve a `/leaderboard`.
- [ ] Botón Home vuelve a `/app`.
- [ ] Botón Log out cierra sesión correctamente.
- [ ] Error de usuario inexistente muestra feedback claro.
- [ ] No hay errores en consola.

---

### Notas para API (contrato mínimo)

**Obtener perfil público**
- `GET /users/:id`
  - Response:
    ```json
    {
      "id": "userId",
      "nickname": "player1",
      "status": "online",
      "bio": "Pong lover",
      "winPhrase": "GG EZ",
      "played": 42,
      "wins": 25,
      "losses": 17
    }
    ```

**Status online/offline**
  -Via websocket
