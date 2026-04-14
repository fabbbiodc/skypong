const es = {
    homePage: {
        title: "SkyPong",
        welcome: "Bienvenido al cielo del Pong",
        description: "Una experiencia celestial de Pong",
        label: "Ir a la Home",
    },
    user: {
        hi: ({name, className, url}) =>(`¡Hola, <a href="${url}" class="${className}"> ${name}</a>!`),
        nickname: "Nickname",
        winphrase: "Frase de Victoria",
        userData: "Datos de Usuario",
        changePassword: "Cambiar Contraseña",
        deleteBtn: "Eliminar Cuenta",
        deleteAccountTitle: "¿Estás completamente seguro?",
        deleteAccountWarning: "Esto eliminará tu cuenta permanentemente. Esta acción es irreversible. ¿Estás seguro?",
        typeConfirm: "Escribe",
        toContinue: "para continuar",
        mustTypeConfirm: "Debes escribir CONFIRM exactamente",
        confirmDelete: "Eliminar Cuenta",
        errors: {
            nicknameRequired: "Nickname requerido",
            nicknameMinLength: (len: number)=>{ return (`El nickname debe contener al menos ${len} caracteres`)},
            winphraseRequired: "Frase de victoria requerida",
            winphraseMinLength: (len: number)=>{ return (`La frase de la victoria debe contener al menos ${len} caracteres`)},
        }
    },
    avatar: {
        changeImage: "Cambiar Imagen",
        error: {
            uploadError: "Error en la subida del archivo",
            avatarNotFound: "Avatar no encontrado",
            invalidImageFile: "Archivo de imagen no válido",
            invalidImageFormat: "Formato de imagen no válido",
            unknownError: "Error desconocido",
            tooLarge: "Tamaño de Imagen muy grande",
        }
    },
    common: {
        loading: "Cargando...",
        uploading: "Subiendo...",
        cancel: "Cancelar",
        backHome: "Volver al Inicio",
        save: "Guardar",
        back: "Volver",
    },
    serverError: {
        connectionError: "Error de conexión del servidor",
        notFound: "Ruta no encontrada",
        unknownError: "Error desconocido del servidor",
        apiRouteError: (route: string) => `Error del servidor. La ruta ${route} no existe o está mal configurada.`,
    },
    gameMode: {
        title: "Modo de Juego",
        cta: "¿Quieres jugar en remoto? Inicia sesión para acceder al modo multijugador en línea.",
        chooseMode: "Elige tu modo de juego",
        local: {
            title: "1 vs 1 Local",
            description: "Juega contra un amigo en el mismo dispositivo.",
        },
        ai: {
            title: "1 vs IA",
            description: "Juega contra la computadora.",
        },
        remote: {
            title: "Multijugador en línea",
            description: "Compite contra jugadores de todo el mundo.",
        },
    },
    language: {
        selectLanguage: "Seleccionar idioma",
        english: "Inglés",
        en: "en",
        spanish: "Español",
        es: "es",
        italian: "Italiano",
        it: "it",
    },
    footer: {
        terms: "Términos de servicio",
        privacy: "Política de privacidad",
    },
    game: {
        score: "Puntuación",
        pause: "Pausa",
        resume: "Reanudar",
        quit: "Salir",
        playButton: "Jugar",
        player: (num : number) => {return (`Jugador ${num}`)},
        roomNameField: 'Nombre Sala',
        errors: {
            difficultyRequired: 'Modo AI requiere una configuración de dificultad',
            difficultyOnlyAIMode: 'Únicamente el Modo AI puede incluir dificultad.',
            onlineRoleOnlyForOnlineMode: 'Solo el modo ONLINE puede incluir onlineRole.',
            invalidConfiguration: 'Configuración de juego inválida.'
        }
    },
    play: {
        chooseGameMode: "Elige el modo de juego",
        local: "1 vs 1 · Local",
        ai: "1 vs IA",
        multiplayer: "Multijugador",
        selectDifficulty: "Selecciona dificultad",
        easy: "Fácil",
        medium: "Medio",
        hard: "Difícil",
        multiplayerChooseMode: "Elige un modo",
        onlinePvp: "PVP en línea",
        localPvp: "PVP Local",
        multiplayerLobby: "Sala multijugador",
        createRoom: "Crear sala",
        joinRoom: "Unirse a sala",
        chooseAvailableRoom: "Elige una sala disponible",
        loading: "Cargando...",
        refresh: "Actualizar",
        noRoomsAvailable: "No hay salas disponibles",
        join: "Unirse",
        waitingForOpponent: "Esperando oponente...",
        cancel: "Cancelar",
        configureMatch: "Configura tu partida",
        name: "Nombre",
        enterYourName: "Introduce tu nombre",
        pointsToWin: "Puntos para ganar",
        paddleColor: "Color de pala",
        createAndWait: "Crear y esperar",
        play: "Jugar",
        playerSetup: "Configuración de partida local",
        next: "Siguiente",
        back: "Volver",
        loadingGame: "Cargando juego...",
        error: "Error:",
        failedLoadRooms: "Error al cargar salas. Inténtalo de nuevo.",
        room: "de sala",
        noRoomAvailable: "No hay salas disponibles",
        joinRoomBtn: 'Unirse',
        roomListTitle: 'Listado de Salas',
    },
    legal: {
        terms: "Términos de servicio",
        termsPage: { 
            title: `Términos y Condiciones: "El Ping-Pong del Destino"`,
            content: `<p>Bienvenido a nuestro proyecto de <strong>Transcendence</strong>. Al entrar en esta web, estás aceptando que tu salud mental es responsabilidad tuya y que, probablemente, algo se va a romper en los próximos 5 minutos.</p>

    <hr>

    <h2>1. Aceptación de los Términos</h2>
    <p>Al hacer clic en el botón de <strong>Login con 42</strong>, vendes tu alma técnica a este servidor. Si el sitio explota, te pedimos amablemente que no abras un <em>issue</em> en GitHub; mejor reza un "Padre Nuestro" a <strong>Norminette</strong> y refresca la página (F5 es tu único amigo aquí).</p>

    <h2>2. Sobre el Juego (Pong)</h2>
    <ul>
        <li><strong>Lag Espiritual:</strong> El lag no es un error, es una "mecánica de dificultad añadida". Si pierdes, es culpa de tu conexión o de los astros, nunca de nuestro código en Django/NestJS.</li>
        <li><strong>Física Cuántica:</strong> La pelota puede atravesar la pala en ocasiones especiales. No es un bug, es un efecto de túnel cuántico implementado para que reflexiones sobre la fragilidad de la realidad.</li>
    </ul>

    <h2>3. El Chat y la Toxicidad</h2>
    <p>Se permite el trashtalk moderado, pero si empiezas a spamear sobre por qué C es mejor que TypeScript o por qué prefieres <code>zsh</code> sobre <code>bash</code>, serás baneado por <strong>insoportable</strong>.</p>

    <h2>4. Privacidad y Datos (GDPR-ish)</h2>
    <p>No sabemos exactamente qué hacemos con tus datos porque todavía estamos intentando entender cómo funciona el <strong>JWT</strong> y las cookies <code>HttpOnly</code>. Tu contraseña está (probablemente) a salvo, pero tu dignidad al perder 10-0 quedará registrada para siempre en nuestra base de datos PostgreSQL.</p>

    <h2>5. Responsabilidad Limitada</h2>
    <p>No nos hacemos responsables de: teclados rotos, café derramado sobre el MacBook de la escuela, o crisis existenciales al ver que el <code>Docker-compose</code> tarda 10 minutos en levantar porque el internet del campus ha decidido morir.</p>
    <p class="highlight">⚠️ Advertencia: Este sitio contiene trazas de JavaScript. El uso prolongado puede causar fatiga visual y ganas de volver a programar en Assembly.</p>

    <h2>6. La Evaluación (El Bocal y Tú)</h2>
    <p>Si eres un evaluador: Todo lo que ves es una <strong>"feature"</strong>. Si encuentras un error de memoria, recuerda que estamos en un entorno web y aquí la memoria es un concepto abstracto y metafísico.</p>

    <blockquote>
        <strong>Nota final:</strong> Este proyecto se autodestruirá si intentas abrirlo en Internet Explorer. Por favor, usa un navegador del siglo XXI.
    </blockquote>

    <hr>
    <p style="text-align: center; font-size: 0.8em;">Hecho con ❤️, sudor y demasiadas latas de RedBull.</p>"`,
        },
        privacy: "Política de privacidad",
        privacyPage: {
            title: "Privacidad (O lo que queda de ella)",
            content: `<p>En este proyecto nos tomamos tu privacidad tan en serio como nos tomamos los <em>leaks</em> de memoria en el proyecto de <code>cub3d</code>: nos asustan, pero a veces ignoramos que están ahí hasta que alguien nos evalúa.</p>

    <hr>

    <h2>1. ¿Qué datos recolectamos?</h2>
    <p>Solo lo estrictamente necesario para que este Frankenstein de código funcione:</p>
    <ul>
        <li><strong>Tu Intra Login:</strong> Para saber a quién culpar en el ranking.</li>
        <li><strong>Tu Avatar:</strong> Para que podamos ver esa foto que te hiciste en la piscina hace dos años.</li>
        <li><strong>Cookies:</strong> No de las que se comen (ojalá), sino de las que mantienen tu sesión abierta para que no tengas que loguearte cada vez que el servidor de NestJS se reinicia solo.</li>
    </ul>

    <h2>2. ¿Para qué usamos tus datos?</h2>
    <p>Principalmente para que el sistema de <strong>Transcendence</strong> no colapse. Usamos tu info para:</p>
    <ul>
        <li>Darte un perfil bonito.</li>
        <li>Enviarte notificaciones de chat que probablemente ignores.</li>
        <li>Hacer que el sistema de Matchmaking intente emparejarte con alguien, aunque termines jugando contra un bot porque no hay nadie más conectado a las 4:00 AM.</li>
    </ul>

    <h2>3. ¿Compartimos tus datos?</h2>
    <p>¿A quién le interesarían? Ni Google ni Facebook quieren saber cuántas veces has perdido al Pong contra un compañero. No vendemos tus datos, principalmente porque no sabemos cómo montar una pasarela de pago sin que el <code>Docker</code> explote.</p>

    <h2>4. Seguridad de la Información</h2>
    <div class="data-box">
        if (data.isSafe()) { <br>
        &nbsp;&nbsp;console.log("Trust me bro"); <br>
        } else { <br>
        &nbsp;&nbsp;console.log("It's a feature, not a bug"); <br>
        }
    </div>
    <p>Implementamos niveles de seguridad que harían llorar a un experto en ciberseguridad, pero que son suficientes para pasar la evaluación de un par. Tus contraseñas (si no usas el OAuth de 42) están hasheadas, porque hasta nosotros tenemos estándares.</p>

    <h2>5. Tus Derechos (GDPR de mercadillo)</h2>
    <p>Tienes derecho a:</p>
    <ul>
        <li><strong>Acceso:</strong> Ver lo que guardamos de ti (Spoiler: es poco).</li>
        <li><strong>Rectificación:</strong> Cambiar tu nombre si te arrepientes de ponerte <em>"PongMaster99"</em>.</li>
        <li><strong>Eliminación:</strong> Borrar tu cuenta. Esto eliminará tus datos de la base de datos, pero el trauma de haber perdido contra nuestro jefe final será permanente.</li>
    </ul>

    <h2>6. Cambios en esta Política</h2>
    <p>Nos reservamos el derecho de cambiar esto cada vez que un evaluador nos diga: <em>"Oye, esto es ilegal"</em>. Te avisaremos con un mensaje en el chat que probablemente se pierda en el scroll.</p>

    <blockquote>
        <p class="warning">Al usar este sitio, aceptas que el desarrollador es un estudiante con falta de sueño y que "privacidad absoluta" es un término romántico, no técnico.</p>
    </blockquote>

    <hr>
    <p style="text-align: center; font-size: 0.8em;">Si has leído hasta aquí, claramente tienes demasiado tiempo libre. Ve a terminar el <code>Inception</code>.</p>`,
        }
    },
    profilePage: {
        title: "Perfil de jugador",
        viewProfile: "Ver Mi Perfil",
    },
    signInPage: {
        title: "Iniciar sesión",
        noAccountText: "¿No tienes una cuenta?",
        submitButton: "Iniciar sesión",
        passwordForgottenLinkText: "¿Olvidaste tu contraseña?",
        loading: "Cargando...",
        refresh: "Refrescar",
    },
    signUpPage: {
        title: "Registrarse",
        hasAccount: "Ya tengo cuenta",
        createAccount: "Crear nueva cuenta",
        currentPassword: "Contaseña Actual",
        passwordLabel: "Contraseña",
        newPasswordLabel: "Nueva contraseña",
        confirmPasswordLabel: "Confirmar contraseña",
        submitButton: "Registrarse",
        submitting: "Registrando...",
    },
    remoteRoomLobbyPage: {
        title: "Sala de espera multijugador",
        waitingMessage: "Esperando a que se unan otros jugadores...",
        startButton: "Comenzar juego",
    },
    navigation: {
        home: "Inicio",
        profile: "Perfil",
        settings: "Ajustes",
        logout: "Cerrar sesión",
        goBack: "Volver",
        login: "Entrar",
        signUp: "Registrarse",
        play: "Jugar",
    },
    player: {
        wins: "Victorias",
        losses: "Derrotas",
        winRate: "Tasa de victorias",
        userData: "Datos del Jugador",
        nofriends: "Este jugador todavía no tiene amigos",
        younofriends: "Aún no tienes amigos",
        friend: "Amigo",
        friends: "Amigos",
        active: "Activo",
        actives: "Activos",
        inactive: "Inactivo",
        inactives: "Inactivos",
        absent: "Ausente",
        absents: "Ausentes",
        blocked: "Bloqueado",
        blockeds: "Bloqueados",
        accept: "Aceptar",
        reject: "Rechazar",
        incoming: "Entrantes",
        outgoing: "Salientes",
        incomingRequest: "Solicitud Entrante",
        incomingRequests: "Solicitudes Entrantes",
        outgoingRequest: "Solicitud enviada",
        outgoingRequests: "Solicitudes enviadas",
        pendingResponse: "Solicitud Pendiente",
        noincomingRequests: "Sin solicitudes entrantes",
        noinoutgoingRequests: "Sin solicitudes enviadas",
        requestAccepted: "✓ Solicitud aceptada",
        requestRejected: "Solicitud rechazada",
        requestCancelled: "Solicitud cancelada",
        friendRemoved: "Amigo eliminado",
        playerBloqued: "Jugador bloqueado",
        playerUnbloqued: "Jugador desbloqueado",
        remove: "Eliminar",
        nooutgoingRequests: "Sin solicitudes salientes",
        addFriend: "+ AÑADIR AMIGO",
        requestSent: "SOLICITUD ENVIADA",
        acceptRequest: "ACEPTAR SOLICITUD",
        unavailable: "NO DISPONIBLE",
        removeFriend: "✕ ELIMINAR AMIGO",
        block: "🚫 BLOQUEAR",
        unblock: "↩ DESBLOQUEAR",
        cancelRequest: "✕ CANCELAR SOLICITUD",
        nowFriends: "✓ ¡Ahora sois amigos!",
        requestSentSuccess: "Solicitud enviada",
        itsMe: "<-⭐ ¡Soy yo Mario! 🍄",
    },
    form: {
      labels: {
        email: 'Correo electrónico',
        username: 'Nombre de usuario',
        nickname: 'Apodo',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        currentPassword: 'Contraseña actual',
        newPassword: 'Nueva contraseña',
        winPhrase: 'Frase de victoria',
      },
      placeholders: {
        email: 'tu@correo.com',
        username: 'Ingresa tu usuario',
        nickname: 'Elige un apodo',
        password: 'Ingresa tu contraseña',
        confirmPassword: 'Reingresa tu contraseña',
        currentPassword: 'Contraseña actual',
        newPassword: 'Nueva contraseña',
        winPhrase: 'Ingresa tu frase de victoria',
        playerName: 'Nombre del jugador',
      },
      errors: {
        emailRequired: 'El email es obligatorio',
        emailMinLength: 'El email debe tener al menos 8 caracteres',
        emailInvalid: 'El formato del email no es válido',
        passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
        containsLetter: 'Debe contener al menos una letra',
        containsNumber: 'Debe contener al menos un número',
        containsSpecialCharacter: 'Debe contener al menos un carácter especial',
        passwordTooShort: 'La contraseña es demasiado corta',
        confirmPasswordTooShort: 'Confirma tu contraseña',
        passwordsDoNotMatch: 'Las contraseñas no coinciden',
        invalidEmail: 'Email inválido',
        invalidPassword: 'Contraseña inválida',
        invalidCredentials: 'Credenciales inválidas',
        serverError: 'Error del servidor, por favor intenta de nuevo más tarde',
        userNotRegistered: 'Usuario no registrado, por favor regístrate primero',
        accountBlocked: 'Cuenta bloqueada. Contacta soporte.',
        userAlreadyExists: 'El usuario ya existe, por favor inicia sesión',
        
    },
        emailPlaceholder: 'tu@email.com',
        passwordLabel: 'Contraseña',
        changePassword: "Cambiar contraseña",
        goBackHome: 'Volver al inicio',
        submitting: "Enviando...",
        cancel: "Cancelar",
        loading: "Cargando...",
        passwordUpdateLoginAgain: "Contraseña actualizada. Entra de nuevo por motivos de seguridad.",
        submit: "Enviar",
    },
    leaderboard: {
        title: "Tabla de clasificación",
        rank: "Rango",
        player: "Jugador",
    },
    achievements: {
        title: "Logros",
        commingSoon: "Próximamente",
        winAchievements: {
            title: "Logros de Victoria",
            firstWin: "Primera Victoria",
            firstWinDesc: "Gana tu primer juego.",
            win10Games: "Competidor Consistente",
            win10GamesDesc: "Gana 10 juegos.",
            win100Games: "Maestro del Pong",
            win100GamesDesc: "Gana 100 juegos.",
        },
        logAchievements: {
            title: "Logros de Inicio de Sesión",
            firstLogin: "Nuevo Recluta",
            firstLoginDesc: "Inicia sesión por primera vez.",
            login7Days: "Asiduo",
            login7DaysDesc: "Inicia sesión durante 7 días consecutivos.",
            login30Days: "Veterano",
            login30DaysDesc: "Inicia sesión durante 30 días consecutivos.",
        },
        playGamesAchievements: {
            title: "Logros de Juegos Ganados",
            firstgame: "Novato",
            firstgameDesc: "Juega tu primer juego.",
            play5Games: "Principiante",
            play5GamesDesc: "Juega 5 juegos.",
            play50Games: "Intermedio",
            play50GamesDesc: "Juega 50 juegos.",
            play500Games: "Experto",
            play500GamesDesc: "Juega 500 juegos.",
        },
    },
    profile: {
        tabs: {
            history: "Historial",
            friends: "Amigos",
            achievements: "Logros",
            leaderboard: "Clasificación",
        },
        stats: {
            totalGames: "Juegos Totales",
            winRate: "Tasa de Victoria",
            bestStreak: "Mejor Racha",
            rank: "Rango",
        },
        gameHistory: {
            title: "Historial de Juegos",
            win: "VICTORIA",
            loss: "DERROTA",
            draw: "EMPATE",
            vsAI: "vs IA",
            pvp: "JvJ",
            noGames: "Aún no hay juegos.",
            loading: "Cargando historial de juegos...",
            error: "Error al cargar juegos:",
        },
        leaderboard: {
            title: "Clasificación",
            rank: "Rango",
            totalGames: "Juegos totales:",
            noPlayers: "Aún no hay jugadores.",
            loading: "Cargando...",
            online: "En línea",
            idle: "Inactivo",
        },
    },
    chat: {
        title: "Chat Global",
        noMessages: "Aún no hay mensajes. ¡Inicia la conversación!",
        placeholder: "Escribe un mensaje...",
        disconnected: "Desconectado. Reconectando...",
        send: "Enviar",
    },
    uiTest: {
        title: "Página de Prueba de Componentes UI",
        sections: {
            buttons: "Botones",
            textField: "Campo de Texto",
            chip: "Chip",
            avatar: "Avatar",
            card: {
                title: "Tarjeta",
                variants: "Variantes de tarjeta",
                withTitle: "Tarjeta con título y subtítulo",
                padding: "Variantes de padding de tarjeta",
                defaultDesc: "Tarjeta predeterminada con sombra",
                elevatedDesc: "Tarjeta elevada con sombra mayor",
                borderedDesc: "Tarjeta con borde (sin sombra)",
                ghostDesc: "Tarjeta fantasma (sin fondo)",
                noPadding: "Sin padding (añade el tuyo)",
                smallPadding: "Padding pequeño",
                mediumPadding: "Padding mediano",
                largePadding: "Padding grande",
                exampleTitle: "Ejemplo: Tarjeta de perfil de jugador",
                exampleContent: "El contenido de la tarjeta va aquí",
            },
            badge: {
                title: "Insignia",
                variants: "Variantes de insignia",
                sizes: "Tamaños de insignia",
                shapes: "Formas de insignia",
                exampleTitle: "Ejemplo de uso con información del jugador",
                primary: "Primario",
                secondary: "Secundario",
                success: "Éxito",
                warning: "Advertencia",
                danger: "Peligro",
                info: "Info",
                neutral: "Neutral",
                outline: "Contorno",
                small: "Pequeño",
                medium: "Mediano",
                large: "Grande",
                rounded: "Redondeado",
                pill: "Píldora",
                square: "Cuadrado",
            },
            statCard: {
                title: "Tarjeta de Estadísticas",
                variants: "Variantes de tarjeta de estadísticas",
                withIcons: "Tarjeta de estadísticas con iconos",
                withTrends: "Tarjeta de estadísticas con tendencias",
                exampleTitle: "Ejemplo: Cuadrícula de estadísticas del jugador",
                totalGames: "Juegos Totales",
                winRate: "Tasa de Victoria",
                victories: "Victorias",
                defeats: "Derrotas",
                currentStreak: "Racha Actual",
                gamesPlayed: "Juegos Jugados",
                trophies: "Trofeos",
                level: "Nivel",
                averageScore: "Puntuación Media",
                rank: "Rango",
            },
            progressBar: {
                title: "Barra de Progreso",
                colorVariants: "Variantes de color de barra de progreso",
                sizes: "Tamaños de barra de progreso",
                withLabel: "Barra de progreso con etiqueta y porcentaje",
                exampleTitle: "Ejemplo: Tarjeta de logro con progreso",
                achievementTitle: "Delantero Maestro",
                achievementDesc: "Gana 100 juegos",
                progress: "Progreso",
                gamesWon: "juegos ganados",
            },
            tabs: {
                title: "Pestañas",
                variantsUnderline: "Variantes de pestañas - Subrayado (predeterminado)",
                variantsPills: "Variantes de pestañas - Píldoras",
                variantsBoxed: "Variantes de pestañas - Encuadradas",
                withIcons: "Pestañas con iconos",
                withBadges: "Pestañas con insignias",
                withDisabled: "Pestañas con estado deshabilitado",
                exampleTitle: "Ejemplo: Perfil de jugador con pestañas",
                overview: "Resumen",
                statistics: "Estadísticas",
                settings: "Configuración",
                all: "Todos",
                active: "Activo",
                completed: "Completado",
                daily: "Diario",
                weekly: "Semanal",
                monthly: "Mensual",
                history: "Historial",
                friends: "Amigos",
                achievements: "Logros",
                inbox: "Entrada",
                sent: "Enviado",
                archived: "Archivado",
                available: "Disponible",
                comingSoon: "Próximamente",
                locked: "Bloqueado",
                historyContent: "Contenido del historial de juegos...",
                friendsContent: "Contenido de lista de amigos...",
                achievementsContent: "Contenido de logros...",
            },
        },
        examples: {
            playerStats: "Estadísticas del Jugador",
            achievements: "Logros",
            lastDays: "Últimos 30 días",
            unlockedCount: "desbloqueados",
            winRate: "Tasa de Victoria",
            gamesPlayed: "Juegos Jugados",
            playerName: "NombreJugador",
            skyPongMaster: "Maestro SkyPong",
            levelRank: "Nivel 42 • Rango #12",
            johnDoe: "Juan Pérez",
            online: "En línea",
            pro: "Pro",
            inGame: "En Juego",
        },
        descriptions: {
            buttonVariants: "Variantes de botón (estilos de color)",
            buttonSizes: "Tamaños de botón",
            specialStates: "Estados especiales: deshabilitado y enlace",
            withTranslations: "Con traducciones (de t):",
            showsI18n: "Muestra cómo funcionan los botones con i18n",
            avatarSizes: "Tamaños de avatar",
            avatarWithImage: "Avatar con imagen",
            avatarFallback: "Avatar con iniciales de respaldo (nombres diferentes)",
            clickableAvatar: "Avatar clicable (pasa el ratón para ver el efecto)",
            exampleNav: "Ejemplo de uso en navegación:",
            clickToOpen: "← Clic para abrir menú de usuario",
            showsUserImage: "Muestra la imagen cargada del usuario, o la primera letra del apodo como respaldo",
        },
        designSystem: {
            title: "Sistema de Diseño (Tema Tailwind v4)",
            colorPalette: "Paleta de Colores",
            chipColors: "Colores de Chip",
            borderFocus: "Borde y Enfoque",
            usage: "Uso (Tailwind v4)",
            colorsDefined: "Colores definidos en",
            autoGenerate: "el bloque @theme de globals.css auto-genera utilidades:",
            componentUsage: "Los componentes usan CVA (class-variance-authority) para variantes seguras de tipo y utilidad cn() para fusionar className.",
            primaryPurple: "Primario (Morado)",
            secondaryGray: "Secundario (Gris)",
            dangerRed: "Peligro (Rojo)",
            ghost: "Fantasma",
            focusRing: "Anillo de Enfoque",
            borderStates: "Estados de Borde",
            default: "predeterminado",
            hover: "hover",
            error: "error",
        },
        responsive: {
            title: "Responsivo (Redimensiona para probar)",
            bodyText: "Texto del cuerpo: text-base md:text-lg",
            heading: "Encabezado: text-xl md:text-2xl",
            small: "Pequeño: text-sm md:text-base",
            resizeMsg: "Redimensiona tu navegador para ver los puntos de quiebre responsivos en acción.",
        },
        footer: "Esta es una página de prueba de desarrollo. Eliminar cuando los componentes estén implementados.",
    },
};



export default es;