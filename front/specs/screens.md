# screens.md

## Screen: Landing Page

**Route:** `/`  
**Purpose:** Main entry point. Allows starting a game (by choosing mode) or navigating to authentication.  
**Behavior:** If the client has been authenticated and tries to access this url, they will be redirected to route `/app`

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGO DIO`
- **Actions (right):**
  - Button **Sign In** → navigates to `/signin`
  - Button **Sign Up** → navigates to `/signup`

**Hero (center of screen)**
- Main text (H1): "Play Pong"
- Primary button **Play** (CTA) -> "Call to ACTION"

**Footer**
- Small links: Privacy / Terms -> Described in the subject ("The project must include accessible Privacy Policy and Terms of Service pages with relevant content.")

---

### Components

#### 1) Button: Play
- **Label:** `Play`
- **Type:** Primary (high prominence)
- **Action:** opens modal "Choose mode"

#### 2) Button: Sign In
- **Label:** `Sign In`
- **Type:** Secondary
- **Action:** `navigate("/signin")`

#### 3) Button: Sign Up
- **Label:** `Sign Up`
- **Type:** Secondary
- **Action:** `navigate("/signup")`

---

### Modal: Choose Game Mode

**ID:** `choose-mode-modal`  
**Opened from:** Play button  
**Closed by:**
- X button
- Click outside modal (backdrop)
- `Esc` key

**Content:**
- **Title:** "Choose game mode"
- **Options (cards or large buttons):**
  1) **1 vs 1 — Local**
     - Short description: "Two players, same keyboard."
     - **Action:** `navigate("/game/local")`
  2) **1 vs AI**
     - Short description: "Play against the computer."
     - **Action:** `navigate("/game/ai")`

**Modal accessibility:**
- `role="dialog"` + `aria-modal="true"`
- Focus trap inside modal
- On open: focus on first option (or title)
- On close: focus returns to Play button

---

### Screen States

1) **Default (modal closed)**
- Visible: Header, Hero, buttons
- Interactions: Play / Sign In / Sign Up

2) **Modal open**
- Backdrop visible
- Body scroll blocked
- Only modal interactable (focus trap)

3) **Hover / Focus**
- Buttons with clear states (hover/focus/active)
- On mobile: tap states

---

### Responsive Behavior

**Desktop**
- Header in one row
- Hero centered (max width recommended)
- Buttons in row

**Mobile**
- Header: title on left, buttons on right (or compact menu if doesn't fit)
- Hero: everything in column
- Modal: takes almost full width with comfortable padding

---

### Acceptance Criteria (QA)

- [ ] On entering `/` you see title + Sign In/Sign Up buttons + Play button.
- [ ] Click on **Sign In** navigates to `/signin`.
- [ ] Click on **Sign Up** navigates to `/signup`.
- [ ] Click on **Play** opens modal with 2 options: `1 vs 1 - Local` and `1 vs AI`.
- [ ] Click on each option navigates to its corresponding route.
- [ ] Modal closes with `Esc`, click outside, or X button.
- [ ] On close, focus returns to Play button (accessibility).
- [ ] No console errors when opening/closing modal or navigating.

---

### Notes for API / Backend
- This landing doesn't require API.

----------------

## Screen: Sign In

**Route:** `/signin`  
**Purpose:** authenticate the user and redirect to authenticated landing.  
**Users:** not authenticated (if already authenticated → redirect to `/app`).

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGO DIO`

**Main (centered)**
- Card: **Sign In**
  - Title: "Sign In"
  - Form
  - Primary CTA: "Sign In"
  - Secondary links: "Don't have an account? Sign Up"

**Footer (optional)**
- Terms / Privacy

---

### Components

#### 1) Form: Sign In

**Fields**
- **Username or Email**
  - type: `text`
  - placeholder: "yourname / name@email.com"
  - required
- **Password**
  - type: `password`
  - placeholder: "••••••••"
  - required

**Validations**
- Required fields (not empty)
- Show inline error under field
- Disable submit while loading

#### 2) Button: Sign In (submit)
- **Label:** `Sign In`
- **Type:** Primary
- **Action:** calls login API

#### 3) Link: Sign Up
- **Text:** "Don't have an account? Sign Up"
- **Action:** `navigate("/signup")`

#### 4) Error Banner (global)
- Visible when backend returns general error:
  - "Invalid credentials"

---

### Screen States

1) **Default**
- Empty fields, submit disabled until values exist

2) **Typing**
- Inline validation (only on blur or submit)

3) **Submitting (loading)**
- Button with spinner
- Inputs disabled

4) **Success**
- Save session/token
- Redirect to `/app`

5) **Error**
- Show global banner + (optional) specific error in password field

---

### Acceptance Criteria (QA)

- [ ] Navigating to `/signin` shows the form.
- [ ] Required fields: if empty, don't send and show errors.
- [ ] Valid credentials → start session and redirect to `/app`.
- [ ] Invalid credentials → show error without reloading page.
- [ ] If already authenticated user enters `/signin`, redirect to `/app`.
- [ ] No console errors.

---

### Notes for API

- `POST /auth/login`
  - Body: `{ identifier: string, password: string }`  
    *(identifier = username or email)*
  - Success: `{ token, user: { id, username, email? } }`
  - Error: `401` invalid credentials, `500`

-------------------

## Screen: Sign Up

**Route:** `/signup`  
**Purpose:** register user and redirect to `/app` authenticated or maybe to `/signin` (INSIGHTS??)  
**Users:** not authenticated (if already authenticated → redirect to `/app`).

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGODIO` (clickable → `/`)

**Main (centered)**
- Card: **Create account**
  - Title: "Sign Up"
  - Form
  - Primary CTA: "Create account"
  - Secondary links: "Already have an account? Sign In"

---

### Components

#### 1) Form: Sign Up

**Fields (minimum)**
- **Username**
  - type: `text`
  - placeholder: "yourname"
  - required
- **Email**
  - type: `email`
  - placeholder: "name@email.com"
  - required
- **Password**
  - type: `password`
  - required
- **Confirm password**
  - type: `password`
  - required

**Optionals**
- Checkbox: "I accept Terms"
- Info: password rules (minimum 8 chars, etc.)

**Validations (frontend)**
- Username:
  - required
  - valid format (define - INSIGHTS??)
- Email:
  - valid format
- Password:
  - required
  - valid format
- Confirm password:
  - must match password
- Show inline errors under each field
- Disable submit while loading

#### 2) Button: Create account (submit)
- **Label:** `Create account`
- **Type:** Primary
- **Action:** calls registration API

#### 3) Link: Sign In
- **Text:** "Already have an account? Sign In"
- **Action:** `navigate("/signin")`

#### 4) Error Banner (global)
- Typical errors:
  - "Username already taken"
  - "Email already in use"
  - "Invalid input"
  - "Server error, try again"

---

### Screen States

1) **Default**
- Empty fields

2) **Typing**
- Validation on blur or submit

3) **Submitting (loading)**
- Spinner in button
- Inputs disabled

4) **Success**
- Option A: auto-login → save token → redirect `/`
- Option B: redirect `/signin` with message "Account created"

    (decide)

5) **Error**
- Global banner + errors per field based on backend response

---

### Acceptance Criteria (QA)

- [ ] Navigating to `/signup` shows the form.
- [ ] Frontend validations work (required + confirm password).
- [ ] Valid registration creates account and redirects according to defined flow.
- [ ] If username/email already exist, shows clear error.
- [ ] If already authenticated user enters `/signup`, redirect to `/app`. (maybe)
- [ ] No console errors.

---

### Notes for API (minimum contract)

- `POST /auth/signup`
  - Body: `{ username: string, email?: string, password: string }`
  - Success:
    - if auto-login: `{ token, user: { id, username, email? } }`
    - if no auto-login: `{ user: { id, username, email? } }`
  - Error: `409` (username/email in use), `400` (validation), `500`

---------------------------------

## Screen: Landing Page (Authenticated)

**Route:** `/app`  
**Prerequisites:** authenticated user (valid session / token).  
**Purpose:** main entry post-login: start game (local/AI/remote), see available rooms, navigate to leaderboard and profile, and logout.
**Behavior:** if client is not authenticated they will be redirected to route `/`

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGODIO` (clickable → `/`)
- **Actions (right):**
  - Button **Play** → opens modal "Choose local mode"
  - Button **Remote** → opens modal "Remote Rooms"
  - Button **Leaderboard** → navigates to `/leaderboard`
  - Button **Profile** → navigates to `/profile`
  - Button **Log out** → closes session and navigates to `/` (guest mode)
**Hero (center)**
- Main text (H1): "Play Pong"
- Primary CTA: **Play**
- (Optional) Subtle status: "You are online" / "Connected" if there's realtime

**Footer (optional)**
- Links to Terms / Privacy -> required in subject v19
---

### Components

#### 1) Button: Log out
- **Label:** `Log out`
- **Type:** Secondary
- **Action:** invalidate session and redirect

#### 2) Button: Leaderboard
- **Label:** `Leaderboard`
- **Type:** Secondary
- **Action:** `navigate("/leaderboard")`

#### 3) Button: Profile
- **Label:** `Profile`
- **Type:** Secondary
- **Action:** `navigate("/profile")`

#### 4) Button: Play
- **Label:** `Play`
- **Type:** Primary
- **Action:** opens modal "Choose game mode"

#### 5) Button: Remote
- **Label:** `Remote`
- **Type:** Secondary
- **Action:** opens modal "Remote Rooms"
- **Dynamic state (rooms available):**
  - If 1+ rooms "open", button enters "attention" mode
  - **If no rooms:** normal style, no animation

### Remote Button Logic (intermittent)

  - **Condition to activate "attention mode":**
    - `availableRoomsCount > 0`
  - **Suggested behavior:**
      - "pulse" animation every ~1–2s

---

### Modal: Choose Game Mode

**ID:** `choose-mode-modal`  
**Opened from:** Play button  
**Closed by:**
- X button
- Click outside modal (backdrop)
- `Esc` key

**Content:**
- **Title:** "Choose game mode"
- **Options (cards/large buttons):**
  1) **1 vs 1 — Local**
     - Short description: "Two players, same keyboard."
     - **Action:** `navigate("/game/local")`
  2) **1 vs AI**
     - Short description: "Play against the computer."
     - **Action:** `navigate("/game/ai")`


**Modal accessibility:**
- `role="dialog"` + `aria-modal="true"`
- Focus trap inside modal
- On open: focus on first option
- On close: focus returns to Play button

---
### Modal: Remote Rooms

**Modal header**
- Title: "Remote Match"
- Tabs / Segmented control:
  - **Join room**
  - **Create room**

---

### Tab A: Join room (see open rooms)

**States:**

1) **Loading**
- Skeleton list / spinner
- Text: "Loading rooms…"

2) **Empty**
- Text: "No open rooms right now"
- CTA: "Create one" (changes to Create tab)

3) **With rooms (scrollable list)**
Each **Room item** shows:
- Room name
- Host username
- Players: `1 / 2`
- Status badge: `Open`
- CTA **Join**

**Join Action**
- `POST /rooms/:id/join`
- Loading state on the item button
- On success:
  - Close modal
  - Navigate to `/rooms/:id` (lobby or game)
- On error:
  - Inline message:
    - "Room is full"
    - "Room no longer available"
  - Refresh list

---

### Tab B: Create room (Create Remote Match)

**Goal:** create a remote room and take user to the "lobby room".

**UI (in modal):**
- Field: **Room name** (placeholder: "My room")
- Primary button: **Create**
- Secondary button: **Cancel** (returns to modal options)

**Create Action:**
- Calls `POST /rooms`
- On success:
  - Close modal
  - Navigate to `/rooms/:roomId` (lobby)
- On error:
  - Shows inline message (e.g. "Couldn't create room. Try again.")

---

### Screen States

1) **Default (authenticated, no modal, no popup)**
- Header with Leaderboard/Profile/Log out
- Hero with Play

2) **Modal open**
- Body scroll blocked
- Focus trap
- Options: Local / AI / Create Remote Match

3) **Create Remote Match (modal substate)**
- Form visible
- Field validation (if room name exists)
- Loading state on Create button

4) **Rooms popup visible**
- List loaded
- Join button enabled only if room is "Open"

5) **Loading rooms (if applicable)**
- Skeleton loader or spinner in popup/panel

6) **Errors**
- Error creating room
- Error joining room
- Error loading rooms (shows "Retry")

---


### Responsive Behavior

**Desktop**
- Header with aligned buttons
- Modal centered
- Internal scrollable list

**Mobile**
- Compact header (buttons with icons/labels)
- Modal almost fullscreen
- Join and Create with large CTAs

---

### Acceptance Criteria (QA)

- [ ] Authenticated user sees: Play, Remote, Leaderboard, Profile, Log out.
- [ ] If there are open rooms, Remote changes state (animation + counter/dot).
- [ ] Click on Remote opens Remote Rooms modal.
- [ ] In Join room, open rooms are listed with Join CTA.
- [ ] Successful Join navigates to `/rooms/:id` and closes modal.
- [ ] In Create room, you can create room and navigate to `/rooms/:roomId`.
- [ ] Modal closes with Esc, click outside or X, and returns focus to Remote button.
- [ ] If there are no rooms, Join room shows Empty state and offers to go to Create.
- [ ] No console errors when updating rooms, animation, join or create.

---

### Notes for API / Realtime

- Available rooms:
  - `GET /rooms?status=open`
- Create room:
  - `POST /rooms`
- Join room:
  - `POST /rooms/:id/join`

**To update "attention mode" of Remote button:**
- Option A: polling (simple)
  - Every 5–10s `GET /rooms?status=open` (only on `/`)
- Option B: WebSocket (better UX)
  - Event `rooms:update` with `{ openCount, rooms[] }`

---------------------------------

## Screen: Remote Room Lobby

**Route:** `/rooms/:roomId`  
**Prerequisites:** authenticated user and has created or joined a remote room.  
**Purpose:** waiting room before starting remote game: see player status, mark "ready", start game when both are ready, or leave/cancel.

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGO DIO`
- Actions (right):
  - Button **Leave room** (if you're guest) / **Cancel room** (if you're host)

**Main (centered / main card)**
- Card: **Room Info**
  - Room name (if exists)
  - Room ID (short/slug) + "Copy" button (optional)
  - Status: `Waiting for opponent` / `Opponent joined` / `Starting...`

- Card: **Players**
  - Host slot
  - Guest slot
  - Ready/Not ready status per player
  - Controls (keyboard arrows)

---

### Components

#### 1) Room Info Card
- **Room name:** string
- **Room code:** short version of `roomId`
- **Room status badge:**
  - `Open` (1/2)
  - `Full` (2/2)
  - `Starting`

#### 2) Players Card
Show 2 slots:

**Host slot**
- Avatar (placeholder)
- Username
- Badge: `HOST`
- Ready state: `Ready` / `Not ready`

**Guest slot**
- If empty: "Waiting for opponent…"
- If occupied: avatar + username + ready state


#### 3) Actions Card

**Button: Ready / Unready**
- **Label (toggle):**
  - if not ready → `Ready`
  - if ready → `Unready`
- **Action:**
  - `POST /rooms/:id/ready` body `{ ready: true|false }`
  - or WebSocket event `room:ready`
- **States:**
  - Loading on send
  - System starts when both are ready.

**Button: Leave / Cancel**
- If user is **guest** → label `Leave room`
  - Action: `POST /rooms/:id/leave`
- If user is **host** → label `Cancel room`
  - Action: `POST /rooms/:id/cancel` (closes room for both)
- On success: navigate to `/` (authenticated landing)

---

### Screen States

1) **Loading lobby**
- Loading room and player status data
- Spinner/skeleton in cards

2) **Host alone (room open)**
- Host occupied, Guest empty
- Status: "Waiting for opponent…"
- Ready available for host

3) **Guest joined (room full)**
- Both slots occupied
- Ready available for both

4) **Ready toggled**
- Ready/Unready reflects instantly
- Syncs with realtime events

5) **Both ready**
- Auto-start:
  - Changes status to `Starting...`
  - Starts **countdown** (3…2…1) and navigates to `/game/remote/:roomId`

6) **Countdown to start**
- Overlay or block inside Room Info:
  - "Match starting in 3…"
- Disable Ready/Leave buttons during countdown

7) **Opponent left**
- Message: "Opponent left the room"
- Room returns to open state (host waiting) or exits to `/` (if host decides to close)
- Guest: if host leaves, redirects to `/`

8) **Room canceled / closed**
- Message: "Room was canceled"
- CTA: "Back to home" → `/`

9) **Error states**
- "Failed to load room" + Retry
- "Join failed (room full/closed)" → redirects to `/` with toast
- "Connection lost" (if WS) → attempts reconnect / shows banner

---

### Navigation / related routes

- From Remote modal:
  - Join/Create → `/rooms/:roomId`
- From lobby to game:
  - `/game/remote/:roomId` (or the route you define)

---

### Acceptance Criteria (QA)

- [ ] Entering `/rooms/:id` shows Room Info + Players + Actions.
- [ ] If there's no guest, you see "Waiting for opponent…".
- [ ] When a guest joins, UI updates without refresh (WS or polling).
- [ ] Ready/Unready works and reflects in both clients.
- [ ] When both are ready:
  - auto-start: countdown appears and navigates to game
  - or host-start: Start enables for host and on click starts countdown + navigates
- [ ] Leave (guest) takes user to `/` and frees the slot.
- [ ] Cancel (host) closes room and expels guest to `/`.
- [ ] If opponent leaves, message shows and status updates correctly.
- [ ] Error modes (room closed/full) redirect and show feedback.
- [ ] Basic accessibility: visible focus, buttons with clear labels, don't rely on color alone.

---

### Notes for API (minimum contract)

**Get room state**
- `GET /rooms/:id`
  - Response: `{ id, name?, status, host: {id, username}, guest?: {id, username}, hostReady, guestReady }`

**Ready toggle**
- `POST /rooms/:id/ready` body `{ ready: boolean }`

**Leave / Cancel**
- Guest: `POST /rooms/:id/leave`
- Host: `POST /rooms/:id/cancel`

**Transition to game**
- Return a `gameId` on start:
  - `{ gameId }` and navigate to `/game/remote/:gameId`


--------------------------------

## Screen: Profile

**Route:** `/profile`  
**Prerequisites:** authenticated user.  
**Purpose:** view and edit user data (nickname, bio, password, avatar, win phrase) and navigate to Home or logout.

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGODIO`
- Actions (right):
  - Button **Home** → navigates to `/app`
  - Button **Log out** → closes session

**Main (centered / medium width)**
- Main card: **Profile**
  - Avatar + nickname
  - Profile data
  - Button **Edit profile** (when in "view" mode)
  - In "edit" mode: form + **Accept changes** button + **Cancel** button

**Secondary section**
- Card: **Stats summary**
  - Wins / Losses / Winrate

---

### Components

#### 1) Avatar
**View mode**
- Current avatar image (or placeholder)
- Text: "Change avatar"

**Edit mode**
- Avatar preview
- Input: Upload avatar (`image/*`)

**Validation**
- Allowed type: PNG/JPG/WebP (define)
- Maximum size (define, e.g. 2MB)
- Show inline error if fails

---

#### 2) Profile Fields

**Editable fields**
- **Nickname**
  - view: text
  - edit: input text
- **Bio**
  - view: multiline text (if empty: "No bio yet")
  - edit: textarea (with optional counter)
- **Win phrase** *(phrase that appears when winning)*
  - view: text
  - edit: input text or short textarea
- **Password**
  - view: don't show value (only "••••••••" or "Password set")
  - edit: separate block "Change password"

**Change password block (only in edit mode)**
- Current password (required)
- New password (required)
- Confirm new password (required)

**Validations (frontend)**
- Nickname: required, minimum length
- Bio: character limit
- Win phrase: character limit
- Password:
  - new password != empty
  - confirm matches
  - show inline errors

---

#### 3) Buttons / actions

**View mode**
- Button: **Edit profile**
  - Action: changes to edit mode
- Button: **Home**
  - Action: `navigate("/app")`
- Button: **Log out**
  - Action: logout

**Edit mode**
- Primary button: **Accept changes**
  - Action: saves changes (API)
- Secondary button: **Cancel**
  - Action: discards local changes and returns to view mode

---

### Screen States

1) **Loading**
- Loading profile (`GET /me`)
- Skeleton for avatar + fields

2) **View mode (default)**
- Fields as text
- "Edit profile" button visible
- No editable inputs

3) **Edit mode**
- Inputs enabled
- "Accept changes" and "Cancel" visible

4) **Submitting changes**
- Accept button with spinner
- Inputs disabled
- Avoid double submit

5) **Success**
- Toast: "Profile updated"
- Returns to view mode

6) **Error**
- Global banner: "Couldn't update profile"
- Per-field errors (e.g. nickname in use, current password incorrect)

---

### Responsive Behavior

- Desktop: centered cards
- Mobile: one column, avatar on top, full-width buttons if needed

---

### Acceptance Criteria (QA)

- [ ] Entering `/profile` loads and shows user profile.
- [ ] In **view mode** fields cannot be edited.
- [ ] Clicking **Edit profile** activates **edit mode** with inputs.
- [ ] Clicking **Cancel** discards changes and returns to view mode.
- [ ] Clicking **Accept changes** saves changes and shows confirmation.
- [ ] Password change requires current + new + confirm, and validates match.
- [ ] Avatar can be updated in edit mode and reflects on save.
- [ ] **Home** button takes to `/`.
- [ ] **Log out** button closes session and redirects correctly.
- [ ] No console errors.

---

### Notes for API (minimum contract)

**Get current profile**
- `GET /me`
  - Response: `{ id, nickname, bio, avatarUrl, winPhrase, ... }`

**Update data (without password)**
- `PATCH /me`
  - Body (partial): `{ nickname?, bio?, winPhrase?, avatarUrl? }`
  - Error:
    - `409` nickname in use
    - `400` validation

**Update avatar (if treated as upload)**
- Option A (simple): `POST /me/avatar` multipart/form-data → `{ avatarUrl }`
- Option B (if you already have storage): frontend uploads to storage and then `PATCH /me` with `avatarUrl`

**Change password**
- `POST /me/password`
  - Body: `{ currentPassword, newPassword }`
  - Error: `401/403` current password incorrect, `400` validation

**Logout**
- `POST /auth/logout` or local invalidation if JWT stateless

**Recommended error format**
- `{ error: { code, message, field? } }`
  - Ex: `{ error: { code: "NICKNAME_TAKEN", field: "nickname", message: "Nickname already in use" } }`

--------------------


## Screen: Leaderboard

**Route:** `/leaderboard`  
**Prerequisites:** authenticated user.  
**Purpose:** show ranking/list of registered users with basic statistics and allow accessing public profiles.

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGODIO`
- Actions (right):
  - Button **Home** → navigates to `/app`
  - Button **Log out** → closes session

**Main**
- Main card: **Leaderboard**
  - Title: "Leaderboard"
  - Users table

---

### Components

#### 1) Table: Leaderboard

**Columns**
1. **Nickname**
   - Clickable text (link)
   - **Action:** `navigate("/users/:userId")`
2. **Status**
   - Badge:
     - `Online` (green)
     - `Offline` (gray)
3. **Played**
   - Total number of games played
4. **Wins**
   - Number of games won
5. **Losses**
   - Number of games lost
6. **Winrate** (%)
7. **Rank** (position)
8. **Add**
   - Add as friend

**Table states**
- Loading (skeleton rows)
- Empty ("No users found")
- Error ("Could not load leaderboard" + Retry)

---

### Interactions

- Click on **Nickname**:
  - Navigates to user's **Public Profile**
- Pagination:
  - Prev / Next or infinite scroll

---

### Screen States

1) **Loading**
- Table with skeleton rows

2) **Loaded**
- List visible and scrollable

3) **Error**
- Global banner + Retry

---

### Responsive Behavior

- Desktop: full table
- Mobile:
  - Simplified table or cards per user:
    - Nickname
    - Status
    - Played / Wins / Losses

---

### Acceptance Criteria (QA)

- [ ] Navigating to `/leaderboard` shows users table.
- [ ] Each row shows nickname, status, played, wins, losses.
- [ ] Nickname is clickable and leads to public profile.
- [ ] Home button redirects to `/app`.
- [ ] Log out button closes session and redirects correctly.
- [ ] No console errors.

---

### Notes for API

**Get leaderboard**
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

**Route:** `/users/:userId`  
**Prerequisites:** authenticated user.  
**Purpose:** show public information of a user selected from the leaderboard.

---

### Layout (structure)

**Header / Top Nav**
- **Title / Logo:** `PONGODIO`
- Actions (right):
  - Button **Home** → navigates to `/app`
  - Button **Leaderboard** → navigates to `/leaderboard`
  - Button **Log out** → closes session

**Main (centered)**
- Main card: **Public Profile**
  - Avatar
  - Nickname
  - Status (online/offline)
  - Bio
  - Win phrase
  - Stats

---

### Components

#### 1) Avatar
- User image (or placeholder)
- View only (not editable)

#### 2) Public Data

- **Nickname**
  - Large text (H2)
- **Status**
  - Badge Online / Offline
- **Bio**
  - Multiline text
  - If empty: "No bio provided"
- **Win phrase**
  - Highlighted text (quote-style)

---

#### 3) Stats Card

- **Played**
- **Wins**
- **Losses**
- **Winrate**
- **Rank**

---

### Screen States

1) **Loading**
- Skeleton avatar + texts

2) **Loaded**
- Data visible

3) **Error**
- "User not found" / "Could not load profile"
- CTA: Back to leaderboard

---

### Navigation / actions

- Button **Leaderboard**
  - Action: `navigate("/leaderboard")`
- Button **Home**
  - Action: `navigate("/")`
- Button **Log out**
  - Action: logout

---

### Responsive Behavior

- Desktop: avatar + info in two columns
- Mobile: everything in one column, avatar on top

---

### Acceptance Criteria (QA)

- [ ] Click on nickname in leaderboard navigates to `/users/:id`.
- [ ] Public profile shows correct data and is not editable.
- [ ] Leaderboard button returns to `/leaderboard`.
- [ ] Home button returns to `/app`.
- [ ] Log out button closes session correctly.
- [ ] Non-existent user shows clear feedback.
- [ ] No console errors.

---

### Notes for API (minimum contract)

**Get public profile**
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
  - Via websocket