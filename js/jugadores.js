// jugadores.js
class ManejadorJugadores {
    constructor() {
        this.jugadores = [];
        this.jugadorActual = 0;
    }

    agregarJugador(nombre) {
        this.jugadores.push({
            nombre: nombre,
            aciertos: 0,
            fallos: 0,
            preguntas: [],
            respuestas: [],
            preguntasRespondidas: 0, // Nuevo: contador por jugador
        });
    }

    obtenerJugadorActual() {
        return this.jugadores[this.jugadorActual];
    }

    siguienteJugador() {
        this.jugadorActual = (this.jugadorActual + 1) % this.jugadores.length;
        return this.obtenerJugadorActual();
    }

    registrarRespuesta(jugadorIndex, preguntaId, esCorrecta) {
        const jugador = this.jugadores[jugadorIndex];
        if (esCorrecta) {
            jugador.aciertos++;
        } else {
            jugador.fallos++;
        }
        jugador.respuestas.push({ preguntaId, esCorrecta });
    }

    asignarPreguntasAJugador(jugadorIndex, preguntas) {
        this.jugadores[jugadorIndex].preguntas = preguntas;
    }

    obtenerResultados() {
        return this.jugadores
            .map((jugador) => ({
                nombre: jugador.nombre,
                aciertos: jugador.aciertos,
                fallos: jugador.fallos,
                puntaje: jugador.aciertos * 100,
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }

    reiniciar() {
        this.jugadores = [];
        this.jugadorActual = 0;
    }
}

export default ManejadorJugadores;
