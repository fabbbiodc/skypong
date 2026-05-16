const en = {
  homePage: {
    title: "SkyPong",
    welcome: "Welcome to the sky of Pong",
    description: "A celestial Pong experience",
    label: "Go to Home",
  },
  user: {
    hi: ({ name, className, url }) =>
      `Hi, <a href="${url}" class="${className}"> ${name}</a>!`,
    nickname: "Nickname",
    winphrase: "Win Phrase",
    userData: "User Data",
    changePassword: "Change Password",
    deleteBtn: "Delete Account",
    deleteAccountTitle: "Are you absolutely sure?",
    deleteAccountWarning:
      "This will remove permanently your account. This action is irreversible. Are you sure?",
    typeConfirm: "Type",
    toContinue: "to continue",
    mustTypeConfirm: "Must type CONFIRM exactly",
    confirmDelete: "Delete Account",
    errors: {
      nicknameRequired: "Nickname required",
      nicknameMinLength: (len: number) => {
        return `Nickname must contain at least ${len} characters`;
      },
      winphraseRequired: "Win phrase required",
      winphraseMinLength: (len: number) => {
        return `Win phrase must contain at least ${len} characters`;
      },
    },
  },
  avatar: {
    changeImage: "Change Image",
    error: {
      uploadError: "Error in image upload",
      avatarNotFound: "Avatar not found",
      invalidImageFile: "Invalid image file",
      invalidImageFormat: "Invalid image format",
      unknownError: "Unknown error",
      tooLarge: "Image file too large",
    },
  },
  common: {
    loading: "Loading...",
    uploading: "Uploading...",
    cancel: "Cancel",
    backHome: "Back to Home",
    save: "Save",
    back: "Back",
  },
  serverError: {
    connectionError: "Server connection error",
    notFound: "Page not found",
    unknownError: "Unknown Server Error",
    apiRouteError: (route: string) =>
      `Server error. The route ${route} does not exist or is misconfigured.`,
  },
  gameMode: {
    title: "Game Mode",
    cta: "Want to play remotely? Log in to access online multiplayer mode.",
    chooseMode: "Choose your game mode",
    clickToPlay: "Click to play",
    selectGameMode: "Select Game Mode",
    chooseHowToPlay: "Choose how you want to play",
    local2P: "Local 2P",
    local2PDesc: "Play against another player on the same keyboard",
    vsAI: "vs AI",
    vsAIDesc: "Challenge the computer",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    selectDifficulty: "Select difficulty level",
    player1Name: "Player 1 Name",
    player2Name: "Player 2 Name",
    yourName: "Your Name",
    winningScore: "Winning Score",
    player1Color: "Player 1 Color",
    player2Color: "Player 2 Color",
    yourPaddleColor: "Your Paddle Color",
    controls: "Controls",
    p1Controls: "P1: A/D keys",
    p2Controls: "P2: J/L keys",
    yourControls: "You: A/D keys",
    start: "Start",
    back: "Back",
    local: {
      title: "1 vs 1 Local",
      description: "Play against a friend on the same device.",
    },
    ai: {
      title: "1 vs AI",
      description: "Play against the computer.",
    },
    remote: {
      title: "Online Multiplayer",
      description: "Compete against players from all over the world.",
    },
  },
  language: {
    selectLanguage: "Select language",
    english: "English",
    en: "en",
    spanish: "Spanish",
    es: "es",
    italian: "Italian",
    it: "it",
  },
  footer: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
  },
  game: {
    score: "Score",
    pause: "Pause",
    resume: "Resume",
    quit: "Quit",
    playButton: "Play",
    clickToPlay: "Click to play",
    player: (num: number) => {
      return `Player ${num}`;
    },
    roomNameField: "Room Name",
    errors: {
      difficultyRequired: "AI Mode requires difficulty configuration.",
      difficultyOnlyAIMode: "Only AI Mode can include difficulty.",
      onlineRoleOnlyForOnlineMode: "Only ONLINE mode can include onlineRole.",
      invalidConfiguration: "Invalid game configuration.",
    },
  },
  play: {
    chooseGameMode: "Choose game mode",
    local: "1 vs 1 · Local",
    ai: "1 vs AI",
    multiplayer: "Multiplayer",
    selectDifficulty: "Select difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    multiplayerChooseMode: "Choose a mode",
    onlinePvp: "Online PVP",
    localPvp: "Local PVP",
    multiplayerLobby: "Multiplayer lobby",
    createRoom: "Create room",
    joinRoom: "Join room",
    chooseAvailableRoom: "Choose an available room",
    loading: "Loading...",
    refresh: "Refresh",
    noRoomsAvailable: "No rooms available",
    join: "Join",
    waitingForOpponent: "Waiting for opponent...",
    cancel: "Cancel",
    configureMatch: "Configure your match",
    name: "Name",
    enterYourName: "Enter your name",
    pointsToWin: "Points to win",
    paddleColor: "Paddle color",
    createAndWait: "Create & Wait",
    play: "Play",
    playerSetup: "Local match setup",
    next: "Next",
    back: "Back",
    loadingGame: "Loading game...",
    error: "Error:",
    failedLoadRooms: "Failed to load rooms. Please try again.",
    room: "'s room",
    noRoomAvailable: "No rooms available",
    joinRoomBtn: "Join Room",
    roomListTitle: "Room List",
  },
  legal: {
    terms: "Terms of Service",
    termsPage: {
      title: `Terms and Conditions: "The Ping-Pong of Destiny"`,
      content: `<p>Welcome to our <strong>Transcendence</strong> project. By entering this website, you agree that your mental health is your own responsibility and that something will probably break within the next 5 minutes.</p>

<hr>

<h2>1. Acceptance of the Terms</h2>
<p>By clicking the <strong>Login with 42</strong> button, you sell your technical soul to this server. If the site explodes, we kindly ask you not to open a GitHub <em>issue</em>; instead, pray a "Our Father" to <strong>Norminette</strong> and refresh the page (F5 is your only true friend here).</p>

<h2>2. About the Game (Pong)</h2>
<ul>
    <li><strong>Spiritual Lag:</strong> Lag is not a bug, it’s an "extra difficulty mechanic". If you lose, it’s your connection’s fault or the stars — never our Django/NestJS code.</li>
    <li><strong>Quantum Physics:</strong> The ball may pass through the paddle on special occasions. It’s not a bug; it’s a quantum tunneling effect designed to make you reflect on the fragility of reality.</li>
</ul>

<h2>3. Chat and Toxicity</h2>
<p>Moderate trash talk is allowed, but if you start spamming about why C is better than TypeScript or why you prefer <code>zsh</code> over <code>bash</code>, you will be banned for being <strong>unbearable</strong>.</p>

<h2>4. Privacy and Data (GDPR-ish)</h2>
<p>We don’t exactly know what we do with your data yet because we’re still trying to understand how <strong>JWT</strong> and <code>HttpOnly</code> cookies work. Your password is (probably) safe, but your dignity after losing 10–0 will be permanently stored in our PostgreSQL database.</p>

<h2>5. Limited Liability</h2>
<p>We are not responsible for: broken keyboards, coffee spilled on the school MacBook, or existential crises caused by <code>docker-compose</code> taking 10 minutes to start because the campus internet decided to die.</p>
<p class="highlight">⚠️ Warning: This site contains traces of JavaScript. Prolonged use may cause eye strain and the urge to go back to programming in Assembly.</p>

<h2>6. The Evaluation (The Bocal and You)</h2>
<p>If you are an evaluator: everything you see is a <strong>"feature"</strong>. If you find a memory error, remember that this is a web environment and memory is a metaphysical concept here.</p>

<blockquote>
    <strong>Final note:</strong> This project will self-destruct if opened in Internet Explorer. Please use a 21st-century browser.
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">Made with ❤️, sweat, and way too many cans of Red Bull.</p>`,
    },
    privacy: "Privacy Policy",
    privacyPage: {
      title: "Privacy (Or What’s Left of It)",
      content: `<p>In this project, we take your privacy as seriously as we take memory leaks in the <code>cub3d</code> project: they scare us, but sometimes we ignore them until someone evaluates us.</p>

<hr>

<h2>1. What data do we collect?</h2>
<p>Only what’s strictly necessary for this Frankenstein of a project to work:</p>
<ul>
    <li><strong>Your Intra Login:</strong> So we know who to blame in the rankings.</li>
    <li><strong>Your Avatar:</strong> So we can see that pool picture you took two years ago.</li>
    <li><strong>Cookies:</strong> Not the edible ones (sadly), but the ones that keep your session alive so you don’t have to log in every time the NestJS server restarts itself.</li>
</ul>

<h2>2. What do we use your data for?</h2>
<p>Mainly to keep the <strong>Transcendence</strong> system from collapsing. We use your info to:</p>
<ul>
    <li>Give you a nice-looking profile.</li>
    <li>Send you chat notifications that you will probably ignore.</li>
    <li>Make the matchmaking system try to pair you with someone, even if you end up playing against a bot because no one else is online at 4:00 AM.</li>
</ul>

<h2>3. Do we share your data?</h2>
<p>Who would even want it? Neither Google nor Facebook care how many times you’ve lost at Pong against a teammate. We don’t sell your data, mainly because we don’t know how to set up a payment gateway without <code>Docker</code> exploding.</p>
        login: "Login",
        signUp: "SignUp",
<h2>4. Information Security</h2>
<div class="data-box">
    if (data.isSafe()) { <br>
    &nbsp;&nbsp;console.log("Trust me bro"); <br>
    } else { <br>
    &nbsp;&nbsp;console.log("It's a feature, not a bug"); <br>
    }
</div>
<p>We implement security levels that would make a cybersecurity expert cry, but they are good enough to pass a peer evaluation. Your passwords (if you don’t use 42 OAuth) are hashed, because even we have standards.</p>

<h2>5. Your Rights (Budget GDPR)</h2>
<p>You have the right to:</p>
<ul>
    <li><strong>Access:</strong> See what we store about you (Spoiler: not much).</li>
    <li><strong>Rectification:</strong> Change your name if you regret choosing <em>"PongMaster99"</em>.</li>
    <li><strong>Deletion:</strong> Delete your account. This will remove your data from the database, but the trauma of losing to our final boss will remain forever.</li>
</ul>

<h2>6. Changes to This Policy</h2>
<p>We reserve the right to change this every time an evaluator tells us: <em>"Hey, this is illegal"</em>. We’ll notify you with a chat message that will probably get lost in the scroll.</p>

<blockquote>
    <p class="warning">By using this site, you accept that the developer is a sleep-deprived student and that "absolute privacy" is a romantic concept, not a technical one.</p>
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">If you’ve read this far, you clearly have too much free time. Go finish <code>Inception</code>.</p>`,
    },
  },
  profilePage: {
    title: "Player Profile",
    viewProfile: "View My Profile",
  },
  signInPage: {
    title: "Sign In",
    noAccountText: "Don't have an account?",
    submitButton: "Sign In",
    passwordForgottenLinkText: "Forgot your password?",
    loading: "Loading...",
    refresh: "Refrescar",
  },
  signUpPage: {
    title: "Sign Up",
    hasAccount: "Already have an account",
    createAccount: "Create new account",
    currentPassword: "Current Password",
    passwordLabel: "Password",
    newPasswordLabel: "New Password",
    confirmPasswordLabel: "Confirm password",
    submitButton: "Sign Up",
    submitting: "Signing up...",
  },
  remoteRoomLobbyPage: {
    title: "Multiplayer Lobby",
    waitingMessage: "Waiting for other players to join...",
    startButton: "Start game",
  },
  navigation: {
    home: "Home",
    profile: "Profile",
    settings: "Settings",
    logout: "Log out",
    goBack: "Go back",
    login: "Login",
    signUp: "SignUp",
    play: "Play",
  },
  player: {
    wins: "Wins",
    losses: "Losses",
    winRate: "Win rate",
    userData: "Datos del Jugador",
    nofriends: "This player has no friends yet",
    younofriends: "You still have no friendss",
    friend: "Friend",
    friends: "Friends",
    active: "Active",
    actives: "Actives",
    inactive: "Inactive",
    inactives: "Inactives",
    absent: "Absent",
    absents: "Absents",
    blocked: "Blocked",
    blockeds: "Blocked",
    incomingRequest: "Incoming Request",
    incomingRequests: "Incoming Requests",
    outgoingRequest: "Outgoing Request",
    outgoingRequests: "Outgoing Requests",
    pendingResponse: "Request Pending Response",
    noincomingRequests: "No incoming requests",
    noinoutgoingRequests: "No outgoing requests",
    friendRemoved: "Friend removed",
    playerBloqued: "Player blocked",
    playerUnbloqued: "Player unblocked",
    remove: "Remove",
    accept: "Accept",
    reject: "Reject",
    incoming: "Incoming",
    outgoing: "Outgoing",
    requestAccepted: "✓ Request accepted",
    requestRejected: "Request rejected",
    requestCancelled: "Request cancelled",
    nooutgoingRequests: "No outgoing requests",
    addFriend: "+ ADD FRIEND",
    requestSent: "REQUEST SENT",
    acceptRequest: "ACCEPT REQUEST",
    unavailable: "NOT AVAILABLE",
    removeFriend: "✕ REMOVE FRIEND",
    block: "🚫 BLOCK",
    unblock: "↩ UNBLOCK",
    cancelRequest: "✕ CANCEL REQUEST",
    nowFriends: "✓ You are now friends!",
    requestSentSuccess: "Friend request sent",
    itsMe: "<-⭐ It's me Mario! 🍄",
  },
  form: {
    labels: {
      email: "Email",
      username: "Username",
      nickname: "Nickname",
      password: "Password",
      confirmPassword: "Confirm Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      winPhrase: "Win Phrase",
    },
    placeholders: {
      email: "your@email.com",
      username: "Enter your username",
      nickname: "Choose a nickname",
      password: "Enter your password",
      confirmPassword: "Re-enter your password",
      currentPassword: "Current password",
      newPassword: "New password",
      winPhrase: "Enter your victory phrase",
      playerName: "Player name",
    },
    errors: {
      emailRequired: "Email is required",
      emailMinLength: "Email must be at least 8 characters long",
      emailInvalid: "The email format is not valid",
      passwordMinLength: "Password must be at least 8 characters long",
      containsLetter: "Must contain at least one letter",
      containsNumber: "Must contain at least one number",
      containsSpecialCharacter: "Must contain at least one special character",
      passwordTooShort: "The password is too short",
      confirmPasswordTooShort: "Confirm your password",
      passwordsDoNotMatch: "Passwords do not match",
      invalidEmail: "Invalid email",
      invalidPassword: "Invalid password",
      serverError:
        "An error occurred while logging in. Please try again later.",
      userNotRegistered: "User not registered",
      invalidCredentials: "Invalid credentials",
      accountBlocked: "Account blocked. Contact support.",
      userAlreadyExists: "User already exists",
    },
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    changePassword: "Change Password",
    goBackHome: "Back to home",
    submitting: "Submitting...",
    cancel: "Cancel",
    loading: "Loading...",
    passwordUpdateLoginAgain:
      "Password Updated. Please, login again for security reasons.",
    submit: "Send",
  },
  leaderboard: {
    title: "Leaderboard",
    rank: "Rank",
    player: "Player",
  },
  achievements: {
    title: "Achievements",
    commingSoon: "Coming Soon",
    winAchievements: {
      title: "Win Achievements",
      firstWin: "First Win",
      firstWinDesc: "Win your first game.",
      win10Games: "Consistent Competitor",
      win10GamesDesc: "Win 10 games.",
      win100Games: "Pong Master",
      win100GamesDesc: "Win 100 games.",
    },
    logAchievements: {
      title: "Login Achievements",
      firstLogin: "New Recruit",
      firstLoginDesc: "Log in for the first time.",
      login7Days: "Regular",
      login7DaysDesc: "Log in for 7 consecutive days.",
      login30Days: "Veteran",
      login30DaysDesc: "Log in for 30 consecutive days.",
    },
    playGamesAchievements: {
      title: "Games Won Achievements",
      firstgame: "Rookie",
      firstgameDesc: "Win your first game.",
      play5Games: "Beginner",
      play5GamesDesc: "Play 5 games.",
      play50Games: "Intermediate",
      play50GamesDesc: "Play 50 games.",
      play500Games: "Expert",
      play500GamesDesc: "Play 500 games.",
    },
  },
  profile: {
    tabs: {
      history: "History",
      friends: "Friends",
      achievements: "Achievements",
      leaderboard: "Leaderboard",
    },
    stats: {
      totalGames: "Total Games",
      winRate: "Win Rate",
      bestStreak: "Best Streak",
      rank: "Rank",
    },
    gameHistory: {
      title: "Game History",
      win: "WIN",
      loss: "LOSS",
      draw: "DRAW",
      vsAI: "vs AI",
      pvp: "PvP",
      noGames: "No games yet.",
      loading: "Loading game history...",
      error: "Error loading games:",
    },
    leaderboard: {
      title: "Leaderboard",
      rank: "Rank",
      player: "Player",
      totalGames: "Total games:",
      noPlayers: "No players yet.",
      loading: "Loading...",
      online: "Online",
      idle: "Idle",
    },
  },
  chat: {
    title: "Global Chat",
    noMessages: "No messages yet. Start the conversation!",
    placeholder: "Type message...",
    disconnected: "Disconnected. Reconnecting...",
    send: "Send",
  },
  uiTest: {
    title: "UI Components Test Page",
    sections: {
      buttons: "Buttons",
      textField: "TextField",
      chip: "Chip",
      avatar: "Avatar",
      card: {
        title: "Card",
        variants: "Card variants",
        withTitle: "Card with title and subtitle",
        padding: "Card padding variants",
        defaultDesc: "Default card with shadow",
        elevatedDesc: "Elevated card with larger shadow",
        borderedDesc: "Bordered card (no shadow)",
        ghostDesc: "Ghost card (no background)",
        noPadding: "No padding (add your own)",
        smallPadding: "Small padding",
        mediumPadding: "Medium padding",
        largePadding: "Large padding",
        exampleTitle: "Example: Player profile card",
        exampleContent: "Card content goes here",
      },
      badge: {
        title: "Badge",
        variants: "Badge variants",
        sizes: "Badge sizes",
        shapes: "Badge shapes",
        exampleTitle: "Example usage with player info",
        primary: "Primary",
        secondary: "Secondary",
        success: "Success",
        warning: "Warning",
        danger: "Danger",
        info: "Info",
        neutral: "Neutral",
        outline: "Outline",
        small: "Small",
        medium: "Medium",
        large: "Large",
        rounded: "Rounded",
        pill: "Pill",
        square: "Square",
      },
      statCard: {
        title: "StatCard",
        variants: "StatCard variants",
        withIcons: "StatCard with icons",
        withTrends: "StatCard with trends",
        exampleTitle: "Example: Player stats grid",
        totalGames: "Total Games",
        winRate: "Win Rate",
        victories: "Victories",
        defeats: "Defeats",
        currentStreak: "Current Streak",
        gamesPlayed: "Games Played",
        trophies: "Trophies",
        level: "Level",
        averageScore: "Average Score",
        rank: "Rank",
      },
      progressBar: {
        title: "ProgressBar",
        colorVariants: "ProgressBar color variants",
        sizes: "ProgressBar sizes",
        withLabel: "ProgressBar with label and percentage",
        exampleTitle: "Example: Achievement card with progress",
        achievementTitle: "Master Striker",
        achievementDesc: "Win 100 games",
        progress: "Progress",
        gamesWon: "games won",
      },
      tabs: {
        title: "Tabs",
        variantsUnderline: "Tabs variants - Underline (default)",
        variantsPills: "Tabs variants - Pills",
        variantsBoxed: "Tabs variants - Boxed",
        withIcons: "Tabs with icons",
        withBadges: "Tabs with badges",
        withDisabled: "Tabs with disabled state",
        exampleTitle: "Example: Player profile with tabs",
        overview: "Overview",
        statistics: "Statistics",
        settings: "Settings",
        all: "All",
        active: "Active",
        completed: "Completed",
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        history: "History",
        friends: "Friends",
        achievements: "Achievements",
        inbox: "Inbox",
        sent: "Sent",
        archived: "Archived",
        available: "Available",
        comingSoon: "Coming Soon",
        locked: "Locked",
        historyContent: "Game history content...",
        friendsContent: "Friends list content...",
        achievementsContent: "Achievements content...",
      },
    },
    examples: {
      playerStats: "Player Stats",
      achievements: "Achievements",
      lastDays: "Last 30 days",
      unlockedCount: "unlocked",
      winRate: "Win Rate",
      gamesPlayed: "Games Played",
      playerName: "PlayerName",
      skyPongMaster: "SkyPong Master",
      levelRank: "Level 42 • Rank #12",
      johnDoe: "John Doe",
      online: "Online",
      pro: "Pro",
      inGame: "In Game",
    },
    descriptions: {
      buttonVariants: "Button variants (color styles)",
      buttonSizes: "Button sizes",
      specialStates: "Special states: disabled and link",
      withTranslations: "With translations (from t):",
      showsI18n: "Shows how buttons work with i18n",
      avatarSizes: "Avatar sizes",
      avatarWithImage: "Avatar with image",
      avatarFallback: "Avatar with fallback initials (different names)",
      clickableAvatar: "Clickable avatar (hover to see effect)",
      exampleNav: "Example usage in navigation:",
      clickToOpen: "← Click to open user menu",
      showsUserImage:
        "Shows user's uploaded image, or first letter of nickname as fallback",
    },
    designSystem: {
      title: "Design System (Tailwind v4 Theme)",
      colorPalette: "Color Palette",
      chipColors: "Chip Colors",
      borderFocus: "Border & Focus",
      usage: "Usage (Tailwind v4)",
      colorsDefined: "Colors defined in",
      autoGenerate: "globals.css @theme block auto-generate utilities:",
      componentUsage:
        "Components use CVA (class-variance-authority) for type-safe variants and cn() utility for className merging.",
      primaryPurple: "Primary (Purple)",
      secondaryGray: "Secondary (Gray)",
      dangerRed: "Danger (Red)",
      ghost: "Ghost",
      focusRing: "Focus Ring",
      borderStates: "Border States",
      default: "default",
      hover: "hover",
      error: "error",
    },
    responsive: {
      title: "Responsive (Resize to test)",
      bodyText: "Body text: text-base md:text-lg",
      heading: "Heading: text-xl md:text-2xl",
      small: "Small: text-sm md:text-base",
      resizeMsg:
        "Resize your browser to see the responsive breakpoints in action.",
    },
    footer:
      "This is a development test page. Remove when components are implemented.",
  },
};

export default en;
