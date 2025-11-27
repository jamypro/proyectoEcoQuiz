// juego.js
import CONFIG from "./config.js";
import ManejadorPreguntas from "./preguntas.js";
import ManejadorJugadores from "./jugadores.js";
import Temporizador from "./temporizador.js";
import InterfazUI from "./interfaz.js";

class Juego {
    constructor() {
        this.manejadorPreguntas = new ManejadorPreguntas();
        this.manejadorJugadores = new ManejadorJugadores();
        this.interfaz = new InterfazUI();
        this.temporizador = null;
        this.configuracion = null;
        this.preguntaActual = null;
        this.totalPreguntas = 0;
        this.preguntasRespondidas = 0;

        this.inicializarEventos();
    }

    async inicializarEventos() {
        window.addEventListener("iniciarJuego", async (e) => {
            this.configuracion = e.detail;
            await this.iniciarJuego();
        });

        document.getElementById("opciones").addEventListener("click", (e) => {
            if (e.target.classList.contains("opcion-respuesta")) {
                this.manejarRespuesta(parseInt(e.target.dataset.index));
            }
        });

        document.getElementById("jugar-nuevo").addEventListener("click", () => {
            this.reiniciarJuego();
        });

        document
            .getElementById("volver-inicio")
            .addEventListener("click", () => {
                this.volverAlInicio();
            });
        window.addEventListener("verRespuestas", () => {
            this.interfaz.mostrarModalRespuestas(
                this.manejadorJugadores.jugadores
            );
        });
    }

    async iniciarJuego() {
        // Cargar preguntas
        const cargaExitosa = await this.manejadorPreguntas.cargarPreguntas();
        if (!cargaExitosa) {
            alert(
                "Error al cargar las preguntas. Por favor, intenta de nuevo."
            );
            return;
        }

        // Configurar jugadores
        this.configurarJugadores();

        // Configurar temporizador
        this.configurarTemporizador();

        // Mostrar primera pregunta
        this.interfaz.mostrarPantalla(
            document.getElementById("pantalla-juego")
        );
        this.mostrarSiguientePregunta();
    }

    configurarJugadores() {
        this.configuracion.jugadores.forEach((nombre) => {
            this.manejadorJugadores.agregarJugador(nombre);
        });

        // Asignar preguntas a cada jugador
        const preguntasDisponibles =
            this.manejadorPreguntas.filtrarPreguntasPorDificultad(
                this.configuracion.dificultad
            );

        if (!preguntasDisponibles || preguntasDisponibles.length === 0) {
            console.error(
                "No hay preguntas disponibles para la dificultad:",
                this.configuracion.dificultad
            );
            alert(
                "Error: No hay preguntas disponibles para el nivel de dificultad seleccionado"
            );
            return false;
        }

        let preguntasYaAsignadasIds = [];

        this.manejadorJugadores.jugadores.forEach((jugador, index) => {
            const preguntasJugador =
                this.manejadorPreguntas.obtenerPreguntasParaJugador(
                    this.configuracion.dificultad,
                    this.configuracion.numPreguntas,
                    preguntasYaAsignadasIds // Pasamos los IDs a excluir
                );

            if (!preguntasJugador || preguntasJugador.length === 0) {
                console.error(
                    "No se pudieron asignar preguntas al jugador:",
                    jugador.nombre,
                    "Puede que no haya suficientes preguntas únicas para la configuración seleccionada."
                );
                return false;
            }

            // Acumulamos los nuevos IDs para la siguiente iteración
            const nuevosIds = preguntasJugador.map((p) => p.id);
            preguntasYaAsignadasIds.push(...nuevosIds);

            this.manejadorJugadores.asignarPreguntasAJugador(
                index,
                preguntasJugador
            );
        });

        this.totalPreguntas =
            this.configuracion.jugadores.length *
            this.configuracion.numPreguntas;
        return true;
    }

    configurarTemporizador() {
        const tiempoTotal = this.totalPreguntas * CONFIG.TIEMPO_PREGUNTA;

        this.temporizador = new Temporizador(
            tiempoTotal,
            (tiempoRestante) => {
                this.interfaz.actualizarTemporizador(
                    this.temporizador.obtenerTiempoFormateado()
                );
                this.interfaz.actualizarBarraProgreso(
                    this.temporizador.obtenerPorcentajeRestante()
                );
            },
            () => this.finalizarJuego()
        );

        this.temporizador.iniciar();
    }

    mostrarSiguientePregunta() {
        const jugadorActual = this.manejadorJugadores.obtenerJugadorActual();
        let preguntaIndex;

        if (this.configuracion.modoJuego === CONFIG.MODOS_JUEGO.INTERCALADO) {
            // Lógica para modo Intercalado (la que ya existía)
            preguntaIndex = Math.floor(
                this.preguntasRespondidas /
                    this.manejadorJugadores.jugadores.length
            );
        } else {
            // Lógica para modo Turneado
            preguntaIndex = jugadorActual.preguntasRespondidas;
        }

        // Comprobación de fin de juego
        if (this.preguntasRespondidas >= this.totalPreguntas) {
            this.finalizarJuego();
            return;
        }

        if (!jugadorActual || !jugadorActual.preguntas) {
            console.error(
                "Error: Jugador actual o sus preguntas no están definidos"
            );
            this.finalizarJuego();
            return;
        }

        this.preguntaActual = jugadorActual.preguntas[preguntaIndex];

        if (!this.preguntaActual) {
            console.error("Error: No se pudo obtener la pregunta actual", {
                jugador: jugadorActual.nombre,
                index: preguntaIndex,
                preguntas: jugadorActual.preguntas,
            });
            this.finalizarJuego();
            return;
        }

        this.interfaz.mostrarPregunta(
            this.preguntaActual,
            jugadorActual.nombre
        );

        // Reproducir sonido de cambio de pregunta
        this.reproducirSonido("CAMBIO_PREGUNTA");
    }

    manejarRespuesta(indiceRespuesta) {
        const jugadorActual = this.manejadorJugadores.obtenerJugadorActual();
        const esCorrecta = this.manejadorPreguntas.verificarRespuesta(
            this.preguntaActual.id,
            indiceRespuesta
        );

        // Incrementar el contador de preguntas respondidas del jugador actual
        jugadorActual.preguntasRespondidas++;

        // Registrar respuesta
        this.manejadorJugadores.registrarRespuesta(
            this.manejadorJugadores.jugadorActual,
            this.preguntaActual,
            esCorrecta,
            this.preguntaActual.opciones[indiceRespuesta]
        );

        // Reproducir sonido según resultado
        //this.reproducirSonido(esCorrecta ? "ACIERTO" : "ERROR");

        // Actualizar contadores
        this.preguntasRespondidas++;

        // Determinar siguiente acción según modo de juego
        if (this.configuracion.modoJuego === CONFIG.MODOS_JUEGO.INTERCALADO) {
            this.manejadorJugadores.siguienteJugador();
        } else if (
            jugadorActual.preguntasRespondidas >=
            this.configuracion.numPreguntas
        ) {
            this.manejadorJugadores.siguienteJugador();
        }

        // Mostrar siguiente pregunta o finalizar
        if (this.preguntasRespondidas < this.totalPreguntas) {
            this.mostrarSiguientePregunta();
        } else {
            this.finalizarJuego();
        }
    }

    finalizarJuego() {
        this.temporizador.detener();
        this.reproducirSonido("FINAL_JUEGO");

        const resultados = this.manejadorJugadores.obtenerResultados();
        this.interfaz.mostrarResultados(resultados);
    }

    reiniciarJuego() {
        this.manejadorJugadores.reiniciar();
        this.preguntasRespondidas = 0;
        this.interfaz.mostrarPantalla(
            document.getElementById("pantalla-inicio")
        );
    }

    volverAlInicio() {
        this.reiniciarJuego();
    }

    reproducirSonido(tipo) {
        const audio = new Audio(CONFIG.SONIDOS[tipo]);
        audio
            .play()
            .catch((error) =>
                console.log("Error al reproducir sonido:", error)
            );
    }
}

export default Juego;
