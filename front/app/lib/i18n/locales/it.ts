const it = {
  homePage: {
    title: "SkyPong",
    welcome: "Benvenuto nel cielo del Pong",
    description: "Un'esperienza celestiale di Pong",
    label: "Vai alla Home",
  },
  user: {
    hi: ({ name, className, url }) =>
      `Ciao, <a href="${url}" class="${className}"> ${name}</a>!`,
    nickname: "Nickname",
    winphrase: "Win Phrase",
    userData: "Dati Utente",
    changePassword: "Cambia Password",
    deleteBtn: "Elimina Account",
    deleteAccountTitle: "Sei assolutamente sicuro?",
    deleteAccountWarning:
      "Questo rimuoverà permanentemente il tuo account. Questa azione è irreversibile. Sei sicuro?",
    typeConfirm: "Digita",
    toContinue: "per continuare",
    mustTypeConfirm: "Devi digitare CONFIRM esattamente",
    confirmDelete: "Elimina Account",
    errors: {
      nicknameRequired: "Nickname richiesto",
      nicknameMinLength: (len: number) => {
        return `Il nickname deve contenere almeno ${len} caratteri`;
      },
      winphraseRequired: "Frase di vittoria richiesta",
      winphraseMinLength: (len: number) => {
        return `La frase di vittoria deve contenere almeno ${len} caratteri`;
      },
    },
  },
  avatar: {
    changeImage: "Cambia Immagine",
    error: {
      uploadError: "Errore nel caricamento dell'immagine",
      avatarNotFound: "Avatar non trovato",
      invalidImageFile: "File immagine non valido",
      invalidImageFormat: "Formato immagine non valido",
      unknownError: "Errore sconosciuto",
      tooLarge: "File immagine troppo grande",
    },
  },
  common: {
    loading: "Caricamento...",
    uploading: "Caricamento...",
    cancel: "Annulla",
    backHome: "Torna alla Home",
    save: "Salva",
    back: "Indietro",
  },
  serverError: {
    connectionError: "Errore di connessione al server",
    notFound: "Pagina non trovata",
    unknownError: "Errore sconosciuto del server",
    apiRouteError: (route: string) =>
      `Errore del server. Il percorso ${route} non esiste o è mal configurato.`,
  },
  gameMode: {
    title: "Modalità di gioco",
    cta: "Vuoi giocare da remoto? Accedi per accedere alla modalità multigiocatore online.",
    chooseMode: "Scegli la modalità di gioco",
    clickToPlay: "Clicca per giocare",
    local: {
      title: "1 vs 1 Locale",
      description: "Gioca contro un amico sullo stesso dispositivo.",
    },
    ai: {
      title: "1 vs IA",
      description: "Gioca contro il computer.",
    },
    remote: {
      title: "Multigiocatore online",
      description: "Competi contro giocatori di tutto il mondo.",
    },
  },
  language: {
    selectLanguage: "Seleziona lingua",
    english: "Inglese",
    en: "en",
    spanish: "Spagnolo",
    es: "es",
    italian: "Italiano",
    it: "it",
  },
  footer: {
    terms: "Termini di servizio",
    privacy: "Informativa sulla privacy",
  },
  game: {
    score: "Punteggio",
    pause: "Pausa",
    resume: "Riprendi",
    quit: "Esci",
    playButton: "Gioca",
    clickToPlay: "Clicca per giocare",
    player: (num: number) => {
      return `Giocatore ${num}`;
    },
    roomNameField: "Nome Stanza",
    errors: {
      difficultyRequired:
        "La modalità AI richiede la configurazione della difficoltà.",
      difficultyOnlyAIMode: "Solo la modalità AI può includere la difficoltà.",
      onlineRoleOnlyForOnlineMode:
        "Solo la modalità ONLINE può includere onlineRole.",
      invalidConfiguration: "Configurazione di gioco non valida.",
    },
  },
  play: {
    chooseGameMode: "Scegli la modalità di gioco",
    local: "1 vs 1 · Locale",
    ai: "1 vs IA",
    multiplayer: "Multigiocatore",
    selectDifficulty: "Seleziona difficoltà",
    easy: "Facile",
    medium: "Medio",
    hard: "Difficile",
    multiplayerChooseMode: "Scegli una modalità",
    onlinePvp: "PVP Online",
    localPvp: "PVP Locale",
    multiplayerLobby: "Lobby multigiocatore",
    createRoom: "Crea stanza",
    joinRoom: "Unisciti a una stanza",
    chooseAvailableRoom: "Scegli una stanza disponibile",
    loading: "Caricamento...",
    refresh: "Aggiorna",
    noRoomsAvailable: "Nessuna stanza disponibile",
    join: "Unisciti",
    waitingForOpponent: "In attesa dell'avversario...",
    cancel: "Annulla",
    configureMatch: "Configura la tua partita",
    name: "Nome",
    enterYourName: "Inserisci il tuo nome",
    pointsToWin: "Punti per vincere",
    paddleColor: "Colore racchetta",
    createAndWait: "Crea e attendi",
    play: "Gioca",
    playerSetup: "Configurazione partita locale",
    next: "Avanti",
    back: "Indietro",
    loadingGame: "Caricamento gioco...",
    error: "Errore:",
    failedLoadRooms: "Impossibile caricare le stanze. Riprova.",
    room: "'s stanza",
    noRoomAvailable: "Nessuna stanza disponibile",
    joinRoomBtn: "Unisciti alla stanza",
    roomListTitle: "Elenco Stanze",
  },
  legal: {
    terms: "Termini di servizio",
    termsPage: {
      title: `Termini e Condizioni: "Il Ping-Pong del Destino"`,
      content: `<p>Benvenuto nel nostro progetto <strong>Transcendence</strong>. Accedendo a questo sito, accetti che la tua salute mentale sia una tua responsabilità e che qualcosa probabilmente si romperà entro i prossimi 5 minuti.</p>

<hr>

<h2>1. Accettazione dei Termini</h2>
<p>Cliccando sul pulsante <strong>Login con 42</strong>, vendi la tua anima tecnica a questo server. Se il sito esplode, ti chiediamo gentilmente di non aprire una <em>issue</em> su GitHub; piuttosto recita un "Padre Nostro" a <strong>Norminette</strong> e aggiorna la pagina (F5 è il tuo unico vero amico).</p>

<h2>2. Sul Gioco (Pong)</h2>
<ul>
    <li><strong>Latenza Spirituale:</strong> Il lag non è un bug, è una "meccanica di difficoltà aggiuntiva". Se perdi, è colpa della tua connessione o degli astri, mai del nostro codice Django/NestJS.</li>
    <li><strong>Fisica Quantistica:</strong> In alcune occasioni speciali la pallina può attraversare la racchetta. Non è un bug, è un effetto di tunnel quantistico pensato per farti riflettere sulla fragilità della realtà.</li>
</ul>

<h2>3. Chat e Tossicità</h2>
<p>Il trash talk moderato è consentito, ma se inizi a spammare su perché C è migliore di TypeScript o perché preferisci <code>zsh</code> a <code>bash</code>, verrai bannato per essere <strong>insopportabile</strong>.</p>

<h2>4. Privacy e Dati (GDPR-ish)</h2>
<p>Non sappiamo esattamente cosa facciamo con i tuoi dati perché stiamo ancora cercando di capire come funzionano <strong>JWT</strong> e i cookie <code>HttpOnly</code>. La tua password è (probabilmente) al sicuro, ma la tua dignità dopo una sconfitta 10–0 resterà per sempre nel nostro database PostgreSQL.</p>

<h2>5. Responsabilità Limitata</h2>
<p>Non siamo responsabili per: tastiere rotte, caffè rovesciato sul MacBook della scuola o crisi esistenziali causate da <code>docker-compose</code> che impiega 10 minuti ad avviarsi perché internet del campus ha deciso di morire.</p>
<p class="highlight">⚠️ Avviso: Questo sito contiene tracce di JavaScript. L’uso prolungato può causare affaticamento visivo e il desiderio di tornare a programmare in Assembly.</p>

<h2>6. La Valutazione (Il Bocal e Tu)</h2>
<p>Se sei un valutatore: tutto ciò che vedi è una <strong>"feature"</strong>. Se trovi un errore di memoria, ricorda che siamo in un ambiente web e qui la memoria è un concetto metafisico.</p>

<blockquote>
    <strong>Nota finale:</strong> Questo progetto si autodistruggerà se aperto con Internet Explorer. Usa un browser del XXI secolo.
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">Realizzato con ❤️, sudore e troppe lattine di Red Bull.</p>`,
    },
    privacy: "Informativa sulla privacy",
    privacyPage: {
      title: "Privacy (O quel che ne resta)",
      content: `<p>In questo progetto prendiamo la tua privacy sul serio quanto prendiamo i <em>memory leak</em> nel progetto <code>cub3d</code>: ci spaventano, ma a volte li ignoriamo finché qualcuno non ci valuta.</p>

<hr>

<h2>1. Quali dati raccogliamo?</h2>
<p>Solo lo stretto necessario affinché questo Frankenstein di progetto funzioni:</p>
<ul>
    <li><strong>Il tuo login Intra:</strong> Per sapere chi incolpare nella classifica.</li>
    <li><strong>Il tuo avatar:</strong> Per poter vedere quella foto in piscina che hai fatto due anni fa.</li>
    <li><strong>Cookie:</strong> Non quelli da mangiare (purtroppo), ma quelli che mantengono attiva la sessione così non devi fare login ogni volta che il server NestJS si riavvia da solo.</li>
</ul>

<h2>2. Per cosa usiamo i tuoi dati?</h2>
<p>Principalmente per evitare che il sistema <strong>Transcendence</strong> collassi. Usiamo le tue informazioni per:</p>
<ul>
    <li>Darti un profilo carino.</li>
    <li>Inviarti notifiche di chat che probabilmente ignorerai.</li>
    <li>Fare in modo che il matchmaking provi ad accoppiarti con qualcuno, anche se finirai per giocare contro un bot perché non c’è nessun altro online alle 4:00 del mattino.</li>
</ul>

<h2>3. Condividiamo i tuoi dati?</h2>
<p>A chi dovrebbero interessare? Né Google né Facebook vogliono sapere quante volte hai perso a Pong contro un compagno. Non vendiamo i tuoi dati, soprattutto perché non sappiamo come configurare un sistema di pagamento senza far esplodere <code>Docker</code>.</p>

<h2>4. Sicurezza delle Informazioni</h2>
<div class="data-box">
    if (data.isSafe()) { <br>
    &nbsp;&nbsp;console.log("Trust me bro"); <br>
    } else { <br>
    &nbsp;&nbsp;console.log("It's a feature, not a bug"); <br>
    }
</div>
<p>Implementiamo livelli di sicurezza che farebbero piangere un esperto di cybersecurity, ma sono sufficienti per superare una valutazione tra pari. Le tue password (se non usi l’OAuth di 42) sono hashate, perché anche noi abbiamo degli standard.</p>

<h2>5. I tuoi diritti (GDPR da bancarella)</h2>
<p>Hai il diritto di:</p>
<ul>
    <li><strong>Accesso:</strong> Vedere cosa conserviamo su di te (Spoiler: poco).</li>
    <li><strong>Rettifica:</strong> Cambiare nome se ti penti di aver scelto <em>"PongMaster99"</em>.</li>
    <li><strong>Cancellazione:</strong> Eliminare il tuo account. Questo rimuoverà i tuoi dati dal database, ma il trauma di aver perso contro il boss finale resterà per sempre.</li>
</ul>

<h2>6. Modifiche a questa Informativa</h2>
<p>Ci riserviamo il diritto di cambiare questo documento ogni volta che un valutatore ci dice: <em>"Ehi, questo è illegale"</em>. Ti avviseremo con un messaggio in chat che probabilmente si perderà nello scroll.</p>

<blockquote>
    <p class="warning">Utilizzando questo sito, accetti che lo sviluppatore sia uno studente privato del sonno e che la "privacy assoluta" sia un concetto romantico, non tecnico.</p>
</blockquote>

<hr>
<p style="text-align: center; font-size: 0.8em;">Se hai letto fino a qui, hai decisamente troppo tempo libero. Vai a finire <code>Inception</code>.</p>`,
    },
  },
  profilePage: {
    title: "Profilo giocatore",
    viewProfile: "Vedi Il Mio Profilo",
  },
  signInPage: {
    title: "Accedi",
    noAccountText: "Non hai un account?",
    submitButton: "Accedi",
    passwordForgottenLinkText: "Password dimenticata?",
    loading: "Caricamento...",
    refresh: "Aggiorna",
  },
  signUpPage: {
    title: "Registrati",
    hasAccount: "Hai già un account?",
    createAccount: "Crea nuovo account",
    currentPassword: "Passowrd Actual",
    passwordLabel: "Password",
    newPasswordLabel: "Nuova password",
    confirmPasswordLabel: "Conferma password",
    submitButton: "Registrati",
    submitting: "Registrando...",
  },
  remoteRoomLobbyPage: {
    title: "Lobby multigiocatore",
    waitingMessage: "In attesa che altri giocatori si uniscano...",
    startButton: "Avvia partita",
  },
  navigation: {
    home: "Home",
    profile: "Profilo",
    settings: "Impostazioni",
    logout: "Disconnetti",
    goBack: "Indietro",
    login: "Accedi",
    signUp: "Registrati",
    play: "Gioca",
  },
  player: {
    wins: "Vittorie",
    losses: "Sconfitte",
    winRate: "Percentuale di vittorie",
    userData: "Dati del giocatore",
    nofriends: "Questo giocatore non ha ancora amici",
    younofriends: "Non hai ancora amici",
    friend: "Amico",
    friends: "Amici",
    active: "Attivo",
    actives: "Attivi",
    inactive: "Inattivo",
    inactives: "Inattivi",
    absent: "Assente",
    absents: "Assenti",
    blocked: "Bloccato",
    blockeds: "Bloccati",
    accept: "Accetta",
    reject: "Rifiuta",
    incoming: "In entrata",
    outgoing: "In uscita",
    incomingRequest: "Richiesta in entrata",
    incomingRequests: "Richieste in entrata",
    outgoingRequest: "Richiesta inviata",
    outgoingRequests: "Richieste inviate",
    pendingResponse: "Richiesta in sospeso",
    noincomingRequests: "Nessuna richiesta in entrata",
    noinoutgoingRequests: "Nessuna richiesta inviata",
    requestAccepted: "✓ Richiesta accettata",
    requestRejected: "Richiesta rifiutata",
    requestCancelled: "Richiesta annullata",
    friendRemoved: "Amico rimosso",
    playerBloqued: "Giocatore bloccato",
    playerUnbloqued: "Giocatore sbloccato",
    remove: "Rimuovi",
    nooutgoingRequests: "Nessuna richiesta in uscita",
    addFriend: "+ AGGIUNGI AMICO",
    requestSent: "RICHIESTA INVIATA",
    acceptRequest: "ACCETTA RICHIESTA",
    unavailable: "NON DISPONIBILE",
    removeFriend: "✕ RIMUOVI AMICO",
    block: "🚫 BLOCCA",
    unblock: "↩ SBLOCCA",
    cancelRequest: "✕ ANNULLA RICHIESTA",
    nowFriends: "✓ Ora siete amici!",
    requestSentSuccess: "Richiesta inviata",
    itsMe: "<-⭐ Sono io Mario! 🍄",
  },
  form: {
    labels: {
      email: "Email",
      username: "Nome utente",
      nickname: "Soprannome",
      password: "Password",
      confirmPassword: "Conferma password",
      currentPassword: "Password attuale",
      newPassword: "Nuova password",
      winPhrase: "Frase vittoria",
    },
    placeholders: {
      email: "tuo@email.com",
      username: "Inserisci il tuo nome utente",
      nickname: "Scegli un soprannome",
      password: "Inserisci la tua password",
      confirmPassword: "Reinserisci la password",
      currentPassword: "Password attuale",
      newPassword: "Nuova password",
      winPhrase: "Inserisci la tua frase di vittoria",
      playerName: "Nome giocatore",
    },
    errors: {
      emailRequired: "L'email è obbligatoria",
      emailMinLength: "L'email deve contenere almeno 8 caratteri",
      emailInvalid: "Il formato dell'email non è valido",
      passwordMinLength: "La password deve contenere almeno 8 caratteri",
      containsLetter: "Deve contenere almeno una lettera",
      containsNumber: "Deve contenere almeno un numero",
      containsSpecialCharacter: "Deve contenere almeno un carattere speciale",
      passwordTooShort: "La password è troppo corta",
      confirmPasswordTooShort: "Conferma la password",
      passwordsDoNotMatch: "Le password non coincidono",
      invalidEmail: "Email non valida",
      invalidPassword: "Password non valida",
      serverError:
        "Si è verificato un errore durante l'accesso. Riprova più tardi.",
      userNotRegistered: "Utente non registrato",
      invalidCredentials: "Credenziali non valide",
      accountBlocked: "Account bloccato. Contatta il supporto.",
      userAlreadyExists: "Utente già esistente",
    },
    emailPlaceholder: "tuo@email.com",
    passwordLabel: "Password",
    changePassword: "Cambia password",
    goBackHome: "Torna alla home",
    submitting: "Invio...",
    cancel: "Annulla",
    loading: "Caricamento...",
    passwordUpdateLoginAgain:
      "Password aggiornata. Accedi nuovamente per motivi di sicurezza.",
    submit: "Invia",
  },
  leaderboard: {
    title: "Classifica",
    rank: "Posizione",
    player: "Giocatore",
  },
  achievements: {
    title: "Obiettivi",
    commingSoon: "Prossimamente",
    winAchievements: {
      title: "Obiettivi di Vittoria",
      firstWin: "Prima Vittoria",
      firstWinDesc: "Vinci la tua prima partita.",
      win10Games: "Competitore Costante",
      win10GamesDesc: "Vinci 10 partite.",
      win100Games: "Maestro del Pong",
      win100GamesDesc: "Vinci 100 partite.",
    },
    logAchievements: {
      title: "Obiettivi di Accesso",
      firstLogin: "Nuova Recluta",
      firstLoginDesc: "Accedi per la prima volta.",
      login7Days: "Assiduo",
      login7DaysDesc: "Accedi per 7 giorni consecutivi.",
      login30Days: "Veterano",
      login30DaysDesc: "Accedi per 30 giorni consecutivi.",
    },
    playGamesAchievements: {
      title: "Obiettivi di Partite Vinte",
      firstgame: "Novizio",
      firstgameDesc: "Vinci la tua prima partita.",
      play5Games: "Principiante",
      play5GamesDesc: "Gioca 5 partite.",
      play50Games: "Intermedio",
      play50GamesDesc: "Gioca 50 partite.",
      play500Games: "Esperto",
      play500GamesDesc: "Gioca 500 partite.",
    },
  },
  profile: {
    tabs: {
      history: "Cronologia",
      friends: "Amici",
      achievements: "Obiettivi",
      leaderboard: "Classifica",
    },
    stats: {
      totalGames: "Partite Totali",
      winRate: "Tasso di Vittoria",
      bestStreak: "Miglior Striscia",
      rank: "Rango",
    },
    gameHistory: {
      title: "Cronologia Partite",
      win: "VITTORIA",
      loss: "SCONFITTA",
      draw: "PAREGGIO",
      vsAI: "vs IA",
      pvp: "GvG",
      noGames: "Nessuna partita ancora.",
      loading: "Caricamento cronologia partite...",
      error: "Errore nel caricamento delle partite:",
    },
    leaderboard: {
      title: "Classifica",
      rank: "Posizione",
      player: "Giocatore",
      totalGames: "Partite totali:",
      noPlayers: "Nessun giocatore ancora.",
      loading: "Caricamento...",
      online: "Online",
      idle: "Inattivo",
    },
  },
  chat: {
    title: "Chat Globale",
    noMessages: "Nessun messaggio ancora. Inizia la conversazione!",
    placeholder: "Scrivi un messaggio...",
    disconnected: "Disconnesso. Riconnessione...",
    send: "Invia",
  },
  uiTest: {
    title: "Pagina di Test Componenti UI",
    sections: {
      buttons: "Pulsanti",
      textField: "Campo di Testo",
      chip: "Chip",
      avatar: "Avatar",
      card: {
        title: "Scheda",
        variants: "Varianti di scheda",
        withTitle: "Scheda con titolo e sottotitolo",
        padding: "Varianti di padding della scheda",
        defaultDesc: "Scheda predefinita con ombra",
        elevatedDesc: "Scheda elevata con ombra maggiore",
        borderedDesc: "Scheda con bordo (senza ombra)",
        ghostDesc: "Scheda fantasma (senza sfondo)",
        noPadding: "Senza padding (aggiungi il tuo)",
        smallPadding: "Padding piccolo",
        mediumPadding: "Padding medio",
        largePadding: "Padding grande",
        exampleTitle: "Esempio: Scheda profilo giocatore",
        exampleContent: "Il contenuto della scheda va qui",
      },
      badge: {
        title: "Badge",
        variants: "Varianti di badge",
        sizes: "Dimensioni di badge",
        shapes: "Forme di badge",
        exampleTitle: "Esempio di utilizzo con informazioni del giocatore",
        primary: "Primario",
        secondary: "Secondario",
        success: "Successo",
        warning: "Avviso",
        danger: "Pericolo",
        info: "Info",
        neutral: "Neutrale",
        outline: "Contorno",
        small: "Piccolo",
        medium: "Medio",
        large: "Grande",
        rounded: "Arrotondato",
        pill: "Pillola",
        square: "Quadrato",
      },
      statCard: {
        title: "Scheda Statistiche",
        variants: "Varianti di scheda statistiche",
        withIcons: "Scheda statistiche con icone",
        withTrends: "Scheda statistiche con tendenze",
        exampleTitle: "Esempio: Griglia statistiche giocatore",
        totalGames: "Partite Totali",
        winRate: "Tasso di Vittoria",
        victories: "Vittorie",
        defeats: "Sconfitte",
        currentStreak: "Striscia Attuale",
        gamesPlayed: "Partite Giocate",
        trophies: "Trofei",
        level: "Livello",
        averageScore: "Punteggio Medio",
        rank: "Rango",
      },
      progressBar: {
        title: "Barra di Progresso",
        colorVariants: "Varianti di colore della barra di progresso",
        sizes: "Dimensioni della barra di progresso",
        withLabel: "Barra di progresso con etichetta e percentuale",
        exampleTitle: "Esempio: Scheda obiettivo con progresso",
        achievementTitle: "Attaccante Maestro",
        achievementDesc: "Vinci 100 partite",
        progress: "Progresso",
        gamesWon: "partite vinte",
      },
      tabs: {
        title: "Schede",
        variantsUnderline: "Varianti di schede - Sottolineato (predefinito)",
        variantsPills: "Varianti di schede - Pillole",
        variantsBoxed: "Varianti di schede - Incorniciate",
        withIcons: "Schede con icone",
        withBadges: "Schede con badge",
        withDisabled: "Schede con stato disabilitato",
        exampleTitle: "Esempio: Profilo giocatore con schede",
        overview: "Panoramica",
        statistics: "Statistiche",
        settings: "Impostazioni",
        all: "Tutti",
        active: "Attivo",
        completed: "Completato",
        daily: "Giornaliero",
        weekly: "Settimanale",
        monthly: "Mensile",
        history: "Cronologia",
        friends: "Amici",
        achievements: "Obiettivi",
        inbox: "Posta in arrivo",
        sent: "Inviato",
        archived: "Archiviato",
        available: "Disponibile",
        comingSoon: "Prossimamente",
        locked: "Bloccato",
        historyContent: "Contenuto cronologia partite...",
        friendsContent: "Contenuto lista amici...",
        achievementsContent: "Contenuto obiettivi...",
      },
    },
    examples: {
      playerStats: "Statistiche Giocatore",
      achievements: "Obiettivi",
      lastDays: "Ultimi 30 giorni",
      unlockedCount: "sbloccati",
      winRate: "Tasso di Vittoria",
      gamesPlayed: "Partite Giocate",
      playerName: "NomeGiocatore",
      skyPongMaster: "Maestro SkyPong",
      levelRank: "Livello 42 • Rango #12",
      johnDoe: "Giovanni Rossi",
      online: "Online",
      pro: "Pro",
      inGame: "In Partita",
    },
    descriptions: {
      buttonVariants: "Varianti di pulsante (stili di colore)",
      buttonSizes: "Dimensioni di pulsante",
      specialStates: "Stati speciali: disabilitato e collegamento",
      withTranslations: "Con traduzioni (da t):",
      showsI18n: "Mostra come funzionano i pulsanti con i18n",
      avatarSizes: "Dimensioni di avatar",
      avatarWithImage: "Avatar con immagine",
      avatarFallback: "Avatar con iniziali di riserva (nomi diversi)",
      clickableAvatar:
        "Avatar cliccabile (passa il mouse per vedere l'effetto)",
      exampleNav: "Esempio di utilizzo nella navigazione:",
      clickToOpen: "← Clicca per aprire menu utente",
      showsUserImage:
        "Mostra l'immagine caricata dall'utente, o la prima lettera del nickname come riserva",
    },
    designSystem: {
      title: "Sistema di Design (Tema Tailwind v4)",
      colorPalette: "Tavolozza dei Colori",
      chipColors: "Colori Chip",
      borderFocus: "Bordo e Focus",
      usage: "Utilizzo (Tailwind v4)",
      colorsDefined: "Colori definiti in",
      autoGenerate: "il blocco @theme di globals.css auto-genera utilità:",
      componentUsage:
        "I componenti usano CVA (class-variance-authority) per varianti type-safe e utilità cn() per unire className.",
      primaryPurple: "Primario (Viola)",
      secondaryGray: "Secondario (Grigio)",
      dangerRed: "Pericolo (Rosso)",
      ghost: "Fantasma",
      focusRing: "Anello di Focus",
      borderStates: "Stati del Bordo",
      default: "predefinito",
      hover: "hover",
      error: "errore",
    },
    responsive: {
      title: "Responsivo (Ridimensiona per testare)",
      bodyText: "Testo del corpo: text-base md:text-lg",
      heading: "Intestazione: text-xl md:text-2xl",
      small: "Piccolo: text-sm md:text-base",
      resizeMsg:
        "Ridimensiona il tuo browser per vedere i punti di interruzione responsivi in azione.",
    },
    footer:
      "Questa è una pagina di test di sviluppo. Rimuovere quando i componenti sono implementati.",
  },
};

export default it;
