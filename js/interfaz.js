class InterfazUI {
    constructor() {
        // Pantallas
        this.pantallaInicio = document.getElementById("pantalla-inicio");
        this.pantallaJuego = document.getElementById("pantalla-juego");
        this.pantallaResultados = document.getElementById(
            "pantalla-resultados"
        );

        // Elementos del formulario
        this.formConfiguracion = document.getElementById("configuracion-juego");
        this.selectNumJugadores = document.getElementById("num-jugadores");
        this.contenedorNombres = document.getElementById("nombres-jugadores");
        this.inputNumPreguntas = document.getElementById("num-preguntas");
        this.selectDificultad = document.getElementById("dificultad");
        this.selectModoJuego = document.getElementById("modo-juego");

        // Elementos del juego
        this.jugadorActual = document.getElementById("jugador-actual");
        this.temporizador = document.getElementById("temporizador");
        this.barraProgreso = document.getElementById("barra-progreso");
        this.contenedorPregunta = document.getElementById(
            "contenedor-pregunta"
        );
        this.preguntaActual = document.getElementById("pregunta-actual");
        this.opcionesContainer = document.getElementById("opciones");

        // Elementos de resultados
        this.podio = document.getElementById("podio");
        this.tablaResultados = document.getElementById("tabla-resultados");
        this.recomendaciones = document.getElementById("recomendaciones");
        this.btnJugarNuevo = document.getElementById("jugar-nuevo");
        this.btnVerRespuestas = document.getElementById("ver-respuestas");
        this.btnVolverInicio = document.getElementById("volver-inicio");

        this.inicializarEventos();
    }

    inicializarEventos() {
        this.selectNumJugadores.addEventListener("change", () =>
            this.actualizarCamposJugadores()
        );
        this.btnVerRespuestas.addEventListener("click", () => {
            this.dispatchEvent("verRespuestas");
        });
        this.formConfiguracion.addEventListener("submit", (e) => {
            e.preventDefault();
            const config = this.obtenerConfiguracion();
            if (config) {
                this.dispatchEvent("iniciarJuego", config);
            }
        });
    }

    actualizarCamposJugadores() {
        const numJugadores = parseInt(this.selectNumJugadores.value);
        this.contenedorNombres.innerHTML = "";

        for (let i = 0; i < numJugadores; i++) {
            const div = document.createElement("div");
            div.className = "mb-3";
            div.innerHTML = `
                <label for="jugador-${
                    i + 1
                }" class="form-label">Nombre del Jugador ${i + 1}:</label>
                <input type="text" class="form-control" id="jugador-${
                    i + 1
                }" required>
            `;
            this.contenedorNombres.appendChild(div);
        }
    }

    obtenerConfiguracion() {
        const numJugadores = parseInt(this.selectNumJugadores.value);
        const nombres = [];

        for (let i = 0; i < numJugadores; i++) {
            const nombre = document
                .getElementById(`jugador-${i + 1}`)
                .value.trim();
            if (!nombre) return null;
            nombres.push(nombre);
        }

        return {
            jugadores: nombres,
            numPreguntas: parseInt(this.inputNumPreguntas.value),
            dificultad: this.selectDificultad.value,
            modoJuego: this.selectModoJuego.value,
        };
    }

    mostrarPantalla(pantalla) {
        [
            this.pantallaInicio,
            this.pantallaJuego,
            this.pantallaResultados,
        ].forEach((p) => {
            p.classList.add("d-none");
        });
        pantalla.classList.remove("d-none");
    }

    mostrarPregunta(pregunta, jugador) {
        this.jugadorActual.textContent = `Jugador: ${jugador}`;

        // Manejar el contexto si existe (mostrar multilínea, escapar HTML y convertir saltos de línea)
        const contextoElement = document.getElementById("contexto-pregunta");
        const escapeHtml = (str) =>
            String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        const formatMultiline = (text) =>
            escapeHtml(text).replace(/\n+/g, "<br><br>");

        if (pregunta.contexto && String(pregunta.contexto).trim().length > 0) {
            contextoElement.innerHTML = formatMultiline(pregunta.contexto);
            contextoElement.classList.remove("d-none");
        } else {
            contextoElement.classList.add("d-none");
        }

        // Pregunta
        this.preguntaActual.innerHTML = formatMultiline(pregunta.texto);

        // Opciones
        this.opcionesContainer.innerHTML = "";
        pregunta.opciones.forEach((opcion, index) => {
            const button = document.createElement("button");
            button.className = "btn btn-outline-success opcion-respuesta mb-2";
            button.innerHTML = escapeHtml(opcion);
            button.dataset.index = index;
            this.opcionesContainer.appendChild(button);
        });
    }

    actualizarTemporizador(tiempo) {
        this.temporizador.textContent = tiempo;
    }

    actualizarBarraProgreso(porcentaje) {
        this.barraProgreso.style.width = `${porcentaje}%`;
    }

    mostrarPreguntascorrectas() {}

    mostrarResultados(resultados) {
        // Crear podio
        this.podio.innerHTML = this.crearPodioHTML(resultados.slice(0, 3));

        // Llenar tabla de resultados
        this.tablaResultados.innerHTML = resultados
            .map(
                (jugador, index) => `
            <tr>
                <td>${index + 1}°</td>
                <td>${jugador.nombre}</td>
                <td>${jugador.aciertos}</td>
                <td>${jugador.fallos}</td>
                <td>${jugador.puntaje}</td>
                <td>${jugador.nota}</td>
            </tr>
        `
            )
            .join("");

        // Mostrar recomendaciones
        this.mostrarRecomendaciones(resultados);

        // Mostrar pantalla de resultados
        this.mostrarPantalla(this.pantallaResultados);
        this.animarConfeti();
    }

    crearPodioHTML(top3) {
        const medallas = ["🥇", "🥈", "🥉"];
        return top3
            .map(
                (jugador, index) => `
            <div class="podio-lugar podio-${index + 1}">
                <div class="medalla">${medallas[index]}</div>
                <div class="nombre">${jugador.nombre}</div>
                <div class="puntaje">${jugador.puntaje} pts</div>
            </div>
        `
            )
            .join("");
    }

    mostrarRecomendaciones(resultados) {
        const recomendaciones = [
            "¡Excelente trabajo! Sigan aprendiendo sobre el medio ambiente.",
            "Recuerden que cada pequeña acción cuenta para cuidar nuestro planeta.",
            "Compartan estos conocimientos con amigos y familia.",
        ];

        this.recomendaciones.innerHTML = recomendaciones.join("<br>");
    }

    animarConfeti() {
        for (let i = 0; i < 50; i++) {
            const confeti = document.createElement("div");
            confeti.className = "confeti confeti-animation";
            confeti.style.left = `${Math.random() * 100}vw`;
            confeti.style.animationDelay = `${Math.random() * 3}s`;
            confeti.style.backgroundColor = `hsl(${
                Math.random() * 360
            }, 100%, 50%)`;
            document.body.appendChild(confeti);

            setTimeout(() => confeti.remove(), 4000);
        }
    }

    mostrarModalRespuestas(jugadores) {
        const contenidoModal = document.getElementById(
            "contenido-modal-respuestas"
        );
        contenidoModal.innerHTML = ""; // Limpiar contenido anterior

        if (jugadores.length > 1) {
            // Crear pestañas para varios jugadores
            const nav = document.createElement("ul");
            nav.className = "nav nav-tabs";
            nav.id = "respuestas-tabs";
            nav.role = "tablist";

            const tabContent = document.createElement("div");
            tabContent.className = "tab-content";
            tabContent.id = "respuestas-tabs-content";

            jugadores.forEach((jugador, index) => {
                // Crear botón de la pestaña
                const navItem = document.createElement("li");
                navItem.className = "nav-item";
                navItem.role = "presentation";
                const button = document.createElement("button");
                button.className = `nav-link ${index === 0 ? "active" : ""}`;
                button.id = `jugador-${index}-tab`;
                button.dataset.bsToggle = "tab";
                button.dataset.bsTarget = `#jugador-${index}-content`;
                button.type = "button";
                button.role = "tab";
                button.textContent = jugador.nombre;
                navItem.appendChild(button);
                nav.appendChild(navItem);

                // Crear contenido de la pestaña
                const contentDiv = document.createElement("div");
                contentDiv.className = `tab-pane fade ${
                    index === 0 ? "show active" : ""
                }`;
                contentDiv.id = `jugador-${index}-content`;
                contentDiv.role = "tabpanel";
                contentDiv.innerHTML = this.generarHtmlRespuestas(jugador);
                tabContent.appendChild(contentDiv);
            });

            contenidoModal.appendChild(nav);
            contenidoModal.appendChild(tabContent);
        } else {
            // Mostrar directamente para un solo jugador
            contenidoModal.innerHTML = this.generarHtmlRespuestas(jugadores[0]);
        }

        const modal = new bootstrap.Modal(
            document.getElementById("modal-respuestas")
        );
        modal.show();
    }

    generarHtmlRespuestas(jugador) {
        if (!jugador || !jugador.respuestas) return "";

        return jugador.respuestas
            .map((respuesta) => {
                const pregunta = respuesta.pregunta;
                const esAcertada = respuesta.esCorrecta;
                const icono = esAcertada
                    ? '<span class="resultado-icono">✅</span>'
                    : '<span class="resultado-icono">❌</span>';
                const claseItem = esAcertada ? "acertada" : "fallada";

                return `
                <div class="pregunta-item ${claseItem}">
                    <p class="pregunta-texto">${icono} ${pregunta.texto}</p>
                    <p><strong>Respuesta correcta:</strong> <span class="respuesta-correcta">${
                        pregunta.opciones[pregunta.respuestaCorrecta]
                    }</span></p>
                    <p><strong>Tu respuesta:</strong> <span class="respuesta-usuario ${claseItem}">${
                    respuesta.respuestaUsuario
                }</span></p>
                </div>
            `;
            })
            .join("");
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
}

export default InterfazUI;
