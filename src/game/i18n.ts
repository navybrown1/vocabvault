import type { FailureReason, Language, RoundNumber, RoundType, SpeedTier, TurnKind } from './types';

type TemplateValues = Record<string, number | string>;

const ROUND_COPY: Record<
  Language,
  Record<
    RoundNumber,
    {
      title: string;
      subtitle: string;
      eyebrow: string;
      callout: string;
      difficultyLabel: string;
      typeLabel: string;
      teaseLeader: string[];
      teaseTrailer: string[];
      teaseTie: string[];
    }
  >
> = {
  en: {
    1: {
      title: 'Round 1 · Arcade Kickoff',
      subtitle: 'Easy reads and bright starts under the first lights.',
      eyebrow: 'Warm-up wave',
      callout: 'Open the night with clean classics, steady clocks, and full-room confidence.',
      difficultyLabel: 'Easy',
      typeLabel: 'Classic',
      teaseLeader: [
        '{leader} came out swinging and already wants the camera.',
        '{leader} is smiling like the crown was handed out early.',
      ],
      teaseTrailer: [
        '{trailer} says it was just a warm-up. The board says otherwise.',
        '{trailer} is asking for a replay before the snacks are even open.',
      ],
      teaseTie: [
        'Nobody gets bragging rights yet. The warm-up ended in a dead heat.',
      ],
    },
    2: {
      title: 'Round 2 · Family Focus',
      subtitle: 'Portrait-forward pressure with sharper trivia pulls.',
      eyebrow: 'Photo spotlight',
      callout: 'The family portraits take center stage while the questions get a little trickier.',
      difficultyLabel: 'Easy / Medium',
      typeLabel: 'Portrait',
      teaseLeader: [
        '{leader} is glowing brighter than the photo booth flash right now.',
        '{leader} just turned the family album into a highlight reel.',
      ],
      teaseTrailer: [
        '{trailer} promised the comeback starts after one deep breath.',
        '{trailer} got caught blinking when the camera and scoreboard hit together.',
      ],
      teaseTie: [
        'Still locked together. Even the portraits cannot split the leaders.',
      ],
    },
    3: {
      title: 'Round 3 · Quick Draw',
      subtitle: 'Same generous clocks, but fast hands now earn extra juice.',
      eyebrow: 'Speed bonus live',
      callout: 'Every quick answer stacks bonus points, so clean speed matters as much as accuracy.',
      difficultyLabel: 'Medium',
      typeLabel: 'Rapid-fire',
      teaseLeader: [
        '{leader} answered so fast the scoreboard barely kept up.',
        '{leader} is farming speed bonuses like they planned this in advance.',
      ],
      teaseTrailer: [
        '{trailer} knows the answers. The clock just wants them sooner.',
        '{trailer} was one heartbeat late on a couple of those. Painful.',
      ],
      teaseTie: [
        'Dead even again. Nobody blinked, and nobody broke away.',
      ],
    },
    4: {
      title: 'Round 4 · Steal Showdown',
      subtitle: 'The misses matter more now because steals pay real money.',
      eyebrow: 'Steal storm',
      callout: 'Wrong answers open the lane, and the next player can punish the miss immediately.',
      difficultyLabel: 'Medium / Hard',
      typeLabel: 'Steal challenge',
      teaseLeader: [
        '{leader} is feasting on mistakes and calling it strategy.',
        '{leader} turned every opening into a highlight steal.',
      ],
      teaseTrailer: [
        '{trailer} has the knowledge, but the steals keep slipping away.',
        '{trailer} keeps opening the door and somebody else keeps walking through it.',
      ],
      teaseTie: [
        'Nobody is safe. The steal round kept the whole board tangled up.',
      ],
    },
    5: {
      title: 'Round 5 · Crown Clash',
      subtitle: 'Final-round drama with the heaviest points on the board.',
      eyebrow: 'Crown time',
      callout: 'Every correct answer can flip the podium, and the speed bonus still bites.',
      difficultyLabel: 'Hard / Medium',
      typeLabel: 'Finale',
      teaseLeader: [
        '{leader} can almost hear the fanfare from here.',
        '{leader} is one hot streak away from locking the whole night.',
      ],
      teaseTrailer: [
        '{trailer} only needs one monster answer to wreck the script.',
        '{trailer} is behind, not finished. That is dangerous territory.',
      ],
      teaseTie: [
        'The crown is still floating in the air. Nobody owns it yet.',
      ],
    },
  },
  es: {
    1: {
      title: 'Ronda 1 · Inicio arcade',
      subtitle: 'Preguntas accesibles y un arranque brillante bajo las primeras luces.',
      eyebrow: 'Calentamiento',
      callout: 'La noche empieza con clásicos claros, relojes cómodos y confianza en toda la sala.',
      difficultyLabel: 'Fácil',
      typeLabel: 'Clásica',
      teaseLeader: [
        '{leader} salió con todo y ya quiere cámara.',
        '{leader} sonríe como si ya le hubieran entregado la corona.',
      ],
      teaseTrailer: [
        '{trailer} dice que solo era calentamiento. El marcador dice otra cosa.',
        '{trailer} ya está pidiendo repetición antes de que abran los snacks.',
      ],
      teaseTie: [
        'Todavía nadie puede presumir. El calentamiento terminó empatado.',
      ],
    },
    2: {
      title: 'Ronda 2 · Enfoque familiar',
      subtitle: 'Más presencia visual y preguntas un poco más exigentes.',
      eyebrow: 'Spotlight familiar',
      callout: 'Las fotos de la familia toman el escenario mientras las preguntas suben un poco de nivel.',
      difficultyLabel: 'Fácil / Media',
      typeLabel: 'Retrato',
      teaseLeader: [
        '{leader} está brillando más que el flash de la cabina de fotos.',
        '{leader} convirtió el álbum familiar en su resumen de jugadas.',
      ],
      teaseTrailer: [
        '{trailer} jura que la remontada empieza con una respiración profunda.',
        '{trailer} parpadeó justo cuando chocaron la cámara y el marcador.',
      ],
      teaseTie: [
        'Siguen pegados. Ni las fotos lograron separar a los líderes.',
      ],
    },
    3: {
      title: 'Ronda 3 · Respuesta relámpago',
      subtitle: 'Los relojes siguen generosos, pero contestar rápido ya vale más.',
      eyebrow: 'Bono de velocidad activo',
      callout: 'Cada respuesta rápida suma puntos extra, así que la velocidad limpia importa tanto como acertar.',
      difficultyLabel: 'Media',
      typeLabel: 'Rápida',
      teaseLeader: [
        '{leader} respondió tan rápido que el marcador casi no lo alcanzó.',
        '{leader} está cosechando bonos de velocidad como si lo hubiera practicado.',
      ],
      teaseTrailer: [
        '{trailer} sabe las respuestas. El reloj solo quiere oírlas antes.',
        '{trailer} llegó un latido tarde en varias. Doloroso.',
      ],
      teaseTie: [
        'Otra vez empatados. Nadie parpadeó y nadie se escapó.',
      ],
    },
    4: {
      title: 'Ronda 4 · Duelo de robos',
      subtitle: 'Ahora los errores pesan más porque los robos pagan de verdad.',
      eyebrow: 'Tormenta de robos',
      callout: 'Una respuesta fallida abre el carril y el siguiente jugador puede castigarla al instante.',
      difficultyLabel: 'Media / Difícil',
      typeLabel: 'Reto de robo',
      teaseLeader: [
        '{leader} está viviendo de los errores ajenos y lo llama estrategia.',
        '{leader} convirtió cada hueco en un robo de lujo.',
      ],
      teaseTrailer: [
        '{trailer} tiene el conocimiento, pero los robos se le siguen escapando.',
        '{trailer} abre la puerta y siempre entra otra persona.',
      ],
      teaseTie: [
        'Nadie está a salvo. La ronda de robos dejó todo enredado.',
      ],
    },
    5: {
      title: 'Ronda 5 · Batalla por la corona',
      subtitle: 'Drama total con los puntos más pesados del tablero.',
      eyebrow: 'Hora de la corona',
      callout: 'Cada acierto puede voltear el podio y el bono de velocidad sigue haciendo daño.',
      difficultyLabel: 'Difícil / Media',
      typeLabel: 'Final',
      teaseLeader: [
        '{leader} casi puede escuchar la fanfarria desde aquí.',
        '{leader} está a una racha caliente de cerrar toda la noche.',
      ],
      teaseTrailer: [
        '{trailer} solo necesita una respuesta monstruosa para romper el guion.',
        '{trailer} va detrás, no fuera. Eso es peligroso.',
      ],
      teaseTie: [
        'La corona sigue en el aire. Nadie la ha tomado todavía.',
      ],
    },
  },
};

const UI_COPY = {
  en: {
    brandSubtitle: 'Family game night hits the arcade',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    reset: 'Reset',
    continue: 'Continue',
    pause: 'Pause',
    resume: 'Resume',
    player: 'player',
    players: 'players',
    loading: {
      title: 'Loading the family arena',
      body: 'Restoring the local show state and checking the next live turn.',
    },
    fatal: {
      title: 'The local question plan could not be restored.',
      subtitle: 'The local show state needs a clean reset',
      cta: 'Start a clean game',
    },
    controls: {
      label: 'Keys',
      gameplay: '1-4 answer · P pause · Enter continue · M sound · L language',
      setup: 'Enter continue · M sound · L language',
    },
    welcome: {
      sideTitle: 'Family lock-in',
      sideBody: 'Pick any Brown family lineup, keep your photos and names, and jump into a brighter, smoother trivia night.',
      bullets: [
        'Choose one to four Brown family players before the show begins',
        'Live language switch, adaptive music, and clearer control cues',
        'Five escalating rounds with speed bonuses and a huge winner finale',
      ],
      heroBadge: 'The Brown Family Trivia Super Game',
      heroTitle: 'Arcade trivia that now moves faster, sounds bigger, and switches languages live.',
      heroBody:
        'One question at a time. One active player in the spotlight. One clean clockwise steal chain when somebody misses.',
      heroStats: [
        ['40s turns', 'Original players get time to think, then speed can still pile on bonus points.'],
        ['30s steals', 'Miss or timeout and the next seat gets a distinct steal handoff and calmer timer.'],
        ['5 rounds', 'A longer family showdown with escalating stakes, tease scenes, and a full champion finish.'],
      ],
      cta: 'Start player setup',
      broadcast: 'Tonight’s broadcast',
    },
    setup: {
      title: 'Player setup',
      subtitle: 'Choose tonight’s family lineup',
      controlRoom: 'Control room',
      playersTonight: 'Players tonight',
      pickExactly: 'Pick exactly {count} {playerWord}. Currently selected: {selected}.',
      noPlayers: 'No players selected yet. Choose the family members who should join this round.',
      start: 'Launch round one',
      reset: 'Reset session',
      seat: 'Seat {seat}',
      join: 'Join game',
      sitOut: 'Sit out',
      benchOne: 'Bench one first',
      selectedReady: 'Selected and ready',
      selectedWaiting: 'Selected and waiting on setup',
      standby: 'On standby',
      playerName: 'Player name',
      namePlaceholder: 'Brown contender {seat}',
      addNameError: 'Add a name for this player.',
      uniqueNameError: 'Each player needs a unique name.',
      uploadPhotoError: 'Upload a photo before starting the show.',
      selectedSubtitle: 'In tonight’s lineup',
      waitingSubtitle: 'Selected and waiting on setup',
    },
    gameplay: {
      title: 'Brown Family Arcade Night',
      pausedSubtitle: 'Game paused',
      liveSubtitle: '{player} has the active turn',
      loadingStage: 'Loading the question stage',
      timerRemaining: 'Time Remaining',
      originalTurn: 'Original Turn',
      stealWindow: 'Steal Window',
      paused: 'Paused',
      roundStatus: 'Board status',
      liveTurn: 'Live turn',
      answerReveal: 'Answer reveal',
      revealCorrect: 'Correct answer locked.',
      revealMiss: 'OOF! Nobody got it.',
      failedPlayers: 'Failed players',
      pointsInPlay: 'Points in play',
      fullPoints: 'Full',
      stealPoints: 'Steal',
      startedQuestion: '{player} opened this question.',
      answeringAfterPass: '{player} is answering after the pass.',
      pausedBody: 'Clock is frozen. Resume whenever everyone is ready to jump back in.',
      originalBody: 'Original turn for full-value points. Fast answers can stack a speed bonus.',
      stealBody: 'Steal chance is live. Reduced base points, but sharp answers still earn a bonus.',
      correctAnswerLine: 'Correct answer: {answer}',
      pointsAwarded: '{points} points awarded.',
      noPoints: 'No points awarded.',
      speedBonus: 'Speed bonus',
      scoreRail: 'Score rail',
      familyScoreboard: 'Family Scoreboard',
      activeTurn: 'Active turn',
      missedQuestion: 'Missed this question',
      readyToPlay: 'Ready to play',
      live: 'Live',
      start: 'Start',
      stealActivated: 'Steal activated',
      nextUp: '{player} is up next. {count} {playerWord} already out on this question.',
      timeoutFailure: 'The clock expired and the steal lane just opened.',
      wrongFailure: 'Wrong answer. The next seat can steal it now.',
      questionSpotlight: '{player} is in the spotlight',
      originalChance: 'Original Turn',
      stealChance: 'Steal Chance',
      hotkeys: 'Hotkeys',
    },
    winner: {
      title: 'Game Over!',
      subtitle: 'Final rankings',
      badge: 'Winner',
      startNewGame: 'Start a new game',
      familyChampion: 'Family champion',
      champions: '{count} champions',
      championOfNight: 'Champion of the night',
      points: '{points} points',
      finalPodium: 'Final podium locked',
      nextFinisher: 'Next finisher',
      otherFinishers: '{count} other finishers',
      restStandings: 'Rest of standings',
      tieHeadline: 'Tie for 1st in the Brown family arena.',
      soloHeadline: '{winner} takes the crown.',
      tieBody: 'The night ends in a shared family title, with the final score line dead even at the top.',
      soloBody: '{winner} closes the night on top with the biggest score on the board and the final fanfare all to themselves.',
      standings: 'Standings',
      soloResult: 'Solo result',
    },
  },
  es: {
    brandSubtitle: 'La noche familiar se fue al arcade',
    soundOn: 'Sonido activado',
    soundOff: 'Sonido apagado',
    reset: 'Reiniciar',
    continue: 'Continuar',
    pause: 'Pausar',
    resume: 'Reanudar',
    player: 'jugador',
    players: 'jugadores',
    loading: {
      title: 'Cargando la arena familiar',
      body: 'Restaurando la sesión local y revisando el siguiente turno en vivo.',
    },
    fatal: {
      title: 'No se pudo restaurar el plan local de preguntas.',
      subtitle: 'La sesión local necesita un reinicio limpio',
      cta: 'Empezar una partida limpia',
    },
    controls: {
      label: 'Teclas',
      gameplay: '1-4 responden · P pausa · Enter continúa · M sonido · L idioma',
      setup: 'Enter continúa · M sonido · L idioma',
    },
    welcome: {
      sideTitle: 'Bloqueo familiar',
      sideBody: 'Elige cualquier alineación Brown, conserva fotos y nombres, y entra a una noche de trivia más pulida.',
      bullets: [
        'Elige de uno a cuatro jugadores de la familia Brown antes de empezar',
        'Cambio de idioma en vivo, música adaptativa y controles más claros',
        'Cinco rondas crecientes con bonos de velocidad y un final gigante',
      ],
      heroBadge: 'The Brown Family Trivia Super Game',
      heroTitle: 'Trivia arcade que ahora suena más grande, se mueve mejor y cambia de idioma al instante.',
      heroBody:
        'Una pregunta a la vez. Un jugador activo bajo el spotlight. Una cadena limpia de robos en sentido horario cuando alguien falla.',
      heroStats: [
        ['40 s', 'Los turnos originales dan tiempo para pensar y aun así permiten ganar bono por velocidad.'],
        ['30 s', 'Si alguien falla o se acaba el tiempo, el siguiente asiento recibe un robo claro y un reloj más amable.'],
        ['5 rondas', 'Un duelo familiar más largo con escenas de pique, bonus y un cierre de campeón.'],
      ],
      cta: 'Ir a la selección',
      broadcast: 'La transmisión de hoy',
    },
    setup: {
      title: 'Selección de jugadores',
      subtitle: 'Elige la alineación familiar de esta partida',
      controlRoom: 'Cabina',
      playersTonight: 'Jugadores de hoy',
      pickExactly: 'Elige exactamente {count} {playerWord}. Seleccionados: {selected}.',
      noPlayers: 'Todavía no hay jugadores seleccionados. Elige quiénes entran a esta partida.',
      start: 'Lanzar la ronda uno',
      reset: 'Reiniciar sesión',
      seat: 'Asiento {seat}',
      join: 'Entrar',
      sitOut: 'Descansar',
      benchOne: 'Saca uno primero',
      selectedReady: 'Seleccionado y listo',
      selectedWaiting: 'Seleccionado y en preparación',
      standby: 'En espera',
      playerName: 'Nombre del jugador',
      namePlaceholder: 'Competidor Brown {seat}',
      addNameError: 'Agrega un nombre para este jugador.',
      uniqueNameError: 'Cada jugador necesita un nombre único.',
      uploadPhotoError: 'Sube una foto antes de iniciar la partida.',
      selectedSubtitle: 'En la alineación',
      waitingSubtitle: 'Seleccionado y esperando configuración',
    },
    gameplay: {
      title: 'Noche arcade de la familia Brown',
      pausedSubtitle: 'Juego en pausa',
      liveSubtitle: '{player} tiene el turno activo',
      loadingStage: 'Cargando el escenario de la pregunta',
      timerRemaining: 'Tiempo restante',
      originalTurn: 'Turno original',
      stealWindow: 'Ventana de robo',
      paused: 'En pausa',
      roundStatus: 'Estado del tablero',
      liveTurn: 'Turno en vivo',
      answerReveal: 'Revelación',
      revealCorrect: 'Respuesta correcta bloqueada.',
      revealMiss: 'Nadie la sacó esta vez.',
      failedPlayers: 'Jugadores fuera',
      pointsInPlay: 'Puntos en juego',
      fullPoints: 'Completo',
      stealPoints: 'Robo',
      startedQuestion: '{player} abrió esta pregunta.',
      answeringAfterPass: '{player} responde después del pase.',
      pausedBody: 'El reloj está congelado. Reanuden cuando todos estén listos.',
      originalBody: 'Turno original con puntos completos. Las respuestas rápidas también pueden sumar bono.',
      stealBody: 'El robo está vivo. Menos puntos base, pero una respuesta rápida igual suma bono.',
      correctAnswerLine: 'Respuesta correcta: {answer}',
      pointsAwarded: '{points} puntos otorgados.',
      noPoints: 'No se otorgaron puntos.',
      speedBonus: 'Bono de velocidad',
      scoreRail: 'Marcador',
      familyScoreboard: 'Marcador familiar',
      activeTurn: 'Turno activo',
      missedQuestion: 'Falló esta pregunta',
      readyToPlay: 'Listo para jugar',
      live: 'En vivo',
      start: 'Arranque',
      stealActivated: 'Robo activado',
      nextUp: 'Ahora va {player}. {count} {playerWord} ya quedaron fuera en esta pregunta.',
      timeoutFailure: 'El reloj se acabó y el carril de robo acaba de abrirse.',
      wrongFailure: 'Respuesta incorrecta. El siguiente asiento ya puede robar.',
      questionSpotlight: '{player} está bajo el spotlight',
      originalChance: 'Turno original',
      stealChance: 'Oportunidad de robo',
      hotkeys: 'Atajos',
    },
    winner: {
      title: '¡Juego terminado!',
      subtitle: 'Clasificación final',
      badge: 'Ganador',
      startNewGame: 'Empezar un nuevo juego',
      familyChampion: 'Campeón familiar',
      champions: '{count} campeones',
      championOfNight: 'Campeón de la noche',
      points: '{points} puntos',
      finalPodium: 'Podio final cerrado',
      nextFinisher: 'Siguiente puesto',
      otherFinishers: '{count} puestos restantes',
      restStandings: 'Resto de posiciones',
      tieHeadline: 'Empate por el primer lugar en la arena Brown.',
      soloHeadline: '{winner} se lleva la corona.',
      tieBody: 'La noche termina con un título compartido y el marcador totalmente empatado arriba.',
      soloBody: '{winner} termina arriba con la mayor puntuación del tablero y la fanfarria final para sí.',
      standings: 'Posiciones',
      soloResult: 'Resultado individual',
    },
  },
} as const;

export function getUiCopy(language: Language) {
  return UI_COPY[language];
}

export function getRoundPresentation(language: Language, round: RoundNumber) {
  return ROUND_COPY[language][round];
}

export function getRoundTypeLabel(language: Language, roundType: RoundType) {
  const roundTypeLabels: Record<Language, Record<RoundType, string>> = {
    en: {
      classic: 'Classic',
      portrait: 'Portrait',
      rapid: 'Rapid-fire',
      steal: 'Steal challenge',
      finale: 'Finale',
    },
    es: {
      classic: 'Clásica',
      portrait: 'Retrato',
      rapid: 'Rápida',
      steal: 'Reto de robo',
      finale: 'Final',
    },
  };

  return roundTypeLabels[language][roundType];
}

export function getSpeedTierLabel(language: Language, tier: SpeedTier) {
  const labels: Record<Language, Record<SpeedTier, string>> = {
    en: {
      blazing: 'Blazing',
      swift: 'Swift',
      steady: 'Steady',
      none: 'No speed bonus',
    },
    es: {
      blazing: 'Relámpago',
      swift: 'Rápido',
      steady: 'Constante',
      none: 'Sin bono de velocidad',
    },
  };

  return labels[language][tier];
}

export function getTurnKindLabel(language: Language, turnKind: TurnKind) {
  const copy = getUiCopy(language).gameplay;
  return turnKind === 'original' ? copy.originalTurn : copy.stealWindow;
}

export function getFailureLine(language: Language, reason: FailureReason) {
  const copy = getUiCopy(language).gameplay;
  return reason === 'timeout' ? copy.timeoutFailure : copy.wrongFailure;
}

export function getPlayerWord(language: Language, count: number) {
  const copy = getUiCopy(language);
  return count === 1 ? copy.player : copy.players;
}

export function getQuestionIndexLabel(language: Language, current: number, total: number) {
  return language === 'en' ? `Q${current} of ${total}` : `P${current} de ${total}`;
}

export function getTopScoreLabel(language: Language, score: number) {
  return language === 'en' ? `Top score ${score}` : `Puntaje mayor ${score}`;
}

export function getRoundTease(language: Language, round: RoundNumber, leader: string, trailer: string, tied: boolean) {
  const roundCopy = getRoundPresentation(language, round);
  if (tied) {
    return roundCopy.teaseTie[round % roundCopy.teaseTie.length];
  }

  const leaderLine = roundCopy.teaseLeader[round % roundCopy.teaseLeader.length];
  const trailerLine = roundCopy.teaseTrailer[(round + 1) % roundCopy.teaseTrailer.length];
  return `${interpolate(leaderLine, { leader })} ${interpolate(trailerLine, { trailer })}`;
}

export function interpolate(template: string, values: TemplateValues) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(String(value)),
    template,
  );
}
