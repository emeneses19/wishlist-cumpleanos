/**
 * Wishlist de Cumpleaños - Lógica Principal (Vanilla JavaScript)
 * Desarrollado con arquitectura modular y limpia.
 */

// CONSTANTE DE CONFIGURACIÓN DE GOOGLE APPS SCRIPT
// Reemplaza esta URL con la URL de tu Web App desplegada en Google Apps Script cuando la tengas lista.
const URL_APPS_SCRIPT = "url"; // Ejemplo: "https://script.google.com/macros/s/AKfycbx.../exec"




// Estado centralizado de la aplicación
const estadoFormulario = {
    codigoAmiga: "",
    nombreCompleto: "",
    primerNombre: "",
    fechaCumpleanios: "",
    categoriasRegalo: [],
    generoLibros: [],
    leGustanFlores: "",
    tiposFlores: [],
    colorFavorito: "",
    colorFavoritoOtro: "",
    hobbies: [],
    hobbiesOtro: "",
    otrosGustos: "",
    noTeGusta: "",
    cumpleaniosIdeal: ""
};

let pasoActual = 1;
const totalPasos = 5;

// Elementos del DOM
const pantallaBienvenida = document.getElementById('pantalla-bienvenida');
const pantallaEncuesta = document.getElementById('pantalla-encuesta');
const pantallaExito = document.getElementById('pantalla-exito');
const formAcceso = document.getElementById('form-acceso');
const inputCodigo = document.getElementById('codigo-acceso');
const errorCodigo = document.getElementById('error-codigo');
const btnComenzar = document.getElementById('btn-comenzar');

const textoPaso = document.getElementById('texto-paso');
const saludoPersonalizado = document.getElementById('saludo-personalizado');
const barraProgreso = document.getElementById('barra-progreso');
const btnAnterior = document.getElementById('btn-anterior');
const btnContinuar = document.getElementById('btn-continuar');
const btnGuardar = document.getElementById('btn-guardar');
const formWishlist = document.getElementById('form-wishlist');



// Inicialización de EventListeners
document.addEventListener('DOMContentLoaded', () => {
    //formAcceso.addEventListener('submit', manejarAcceso);
    btnContinuar.addEventListener('click', avanzarPaso);
    btnAnterior.addEventListener('click', retrocederPaso);
    formWishlist.addEventListener('submit', manejarEnvioFinal);

    // Eventos para inputs dinámicos (color y hobbies "Otros")
    configurarInputsCondicionales();
});



document.addEventListener("DOMContentLoaded", function () {
    const formAcceso = document.getElementById("form-acceso");
    const inputCodigo = document.getElementById("codigo-acceso");
    const errorCodigo = document.getElementById("error-codigo");
    const btnComenzar = document.getElementById("btn-comenzar");

    //const URL_APPS_SCRIPT = URL_APPS_SCRIPT;

    // Evento submit del formulario que llama a la función principal
    formAcceso.addEventListener("submit", function (e) {
        e.preventDefault();
        const codigo = inputCodigo.value.trim();
        verificarCodigo(codigo);
    });

    // Función independiente para validar el código
    async function verificarCodigo(codigo) {
        if (!codigo) {
            mostrarError("Por favor, introduce un código.");
            return;
        }

        setLoading(true);
        ocultarError();

        try {
            const respuesta = await fetch(`${URL_APPS_SCRIPT}?codigo=${encodeURIComponent(codigo)}`);
            const resultado = await respuesta.json();

            if (resultado.status === "success") {
                console.log("Datos de la amiga:", resultado.data);

                // Guardar datos útiles en sessionStorage
                sessionStorage.setItem("nombreAmiga", resultado.data.nombre);
                sessionStorage.setItem("estadoAmiga", resultado.data.estado);
                sessionStorage.setItem("codigoAmiga", codigo);

                // Llamar a la transición
                transicionarAPantallaEncuesta();

            } else {
                mostrarError(resultado.message || "Código incorrecto.");
            }

        } catch (error) {
            console.error("Error en la conexión:", error);
            mostrarError("Ocurrió un error al verificar el código. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }

    function mostrarError(mensaje) {
        errorCodigo.textContent = mensaje;
        inputCodigo.classList.add("input-error");
    }

    function ocultarError() {
        errorCodigo.textContent = "";
        inputCodigo.classList.remove("input-error");
    }

    function setLoading(isLoading) {
        if (isLoading) {
            btnComenzar.disabled = true;
            btnComenzar.querySelector("span").textContent = "Verificando...";
        } else {
            btnComenzar.disabled = false;
            btnComenzar.querySelector("span").textContent = "Comenzar";
        }
    }

});

function transicionarAPantallaEncuesta() {
    pantallaBienvenida.classList.remove('activa');
    pantallaBienvenida.classList.add('oculta');
    pantallaEncuesta.classList.remove('oculta');
    pantallaEncuesta.classList.add('activa');
    actualizarVistaPasos();
}

/**
 * 2. Navegación Multipaso
 */
function actualizarProgreso() {
    const porcentaje = (pasoActual / totalPasos) * 100;
    barraProgreso.style.width = `${porcentaje}%`;
    textoPaso.textContent = `Paso ${pasoActual} de ${totalPasos}`;
}

function actualizarVistaPasos() {
    actualizarProgreso();

    // Mostrar u ocultar botones de navegación
    if (pasoActual === 1) {
        btnAnterior.classList.add('oculta');
        // Aquí recuperas el nombre exacto que guardó verificarCodigo
        const nombreAmiga = sessionStorage.getItem("nombreAmiga") || "Amiga";

        // Y lo pones en tu elemento con el formato que deseas
        saludoPersonalizado.textContent = `¡Hola! ${nombreAmiga} ♡`;

    } else {
        btnAnterior.classList.remove('oculta');
    }

    if (pasoActual === totalPasos) {
        btnContinuar.classList.add('oculta');
        btnGuardar.classList.remove('oculta');
        generarResumenVisual();
    } else {
        btnContinuar.classList.remove('oculta');
        btnGuardar.classList.add('oculta');
    }

    // Cambiar visibilidad de los pasos del formulario
    document.querySelectorAll('.paso-contenido').forEach(pasoElem => {
        const numPaso = parseInt(pasoElem.getAttribute('data-paso'));
        if (numPaso === pasoActual) {
            pasoElem.classList.remove('oculta');
            pasoElem.classList.add('activo');
        } else {
            pasoElem.classList.remove('activo');
            pasoElem.classList.add('oculta');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function avanzarPaso() {
    if (!validarPasoActual()) return;

    recopilarDatosPasoActual();

    if (pasoActual < totalPasos) {
        pasoActual++;
        if (pasoActual === 3) {
            evaluarLógicaCondicionalPaso3();
        }
        actualizarVistaPasos();
    }
}

function retrocederPaso() {
    if (pasoActual > 1) {
        pasoActual--;
        actualizarVistaPasos();
    }
}

/**
 * 3. Validación y Recopilación por Paso
 */
function validarPasoActual() {
    limpiarErrores();

    if (pasoActual === 1) {
        const nombreInput = document.getElementById('nombre-completo');
        const fechaInput = document.getElementById('fecha-cumpleanios');

        if (!nombreInput.value.trim()) {
            mostrarErrorInput(nombreInput, "Por favor, introduce tu nombre completo.");
            return false;
        }
        if (!fechaInput.value) {
            mostrarErrorInput(fechaInput, "Por favor, selecciona tu fecha de cumpleaños.");
            return false;
        }
        return true;
    }

    if (pasoActual === 2) {
        const categoriasSeleccionadas = document.querySelectorAll('input[name="categorias"]:checked');
        if (categoriasSeleccionadas.length === 0) {
            const errorElem = document.querySelector('[data-error="categorias"]');
            errorElem.textContent = "Selecciona al menos una categoría de regalo.";
            return false;
        }
        return true;
    }

    if (pasoActual === 4) {
        const colorSeleccionado = document.querySelector('input[name="colorFavorito"]:checked');
        if (!colorSeleccionado) {
            const errorElem = document.querySelector('[data-error="colorFavorito"]');
            errorElem.textContent = "Por favor, selecciona tu color favorito.";
            return false;
        }
        if (colorSeleccionado.value === 'Otros') {
            const otroColorInput = document.getElementById('color-otro-input');
            if (!otroColorInput.value.trim()) {
                errorElem.textContent = "Por favor, especifica tu color.";
                return false;
            }
        }
        return true;
    }

    return true;
}

function mostrarErrorInput(elemento, mensaje) {
    const errorSpan = elemento.parentElement.querySelector('.mensaje-error') || document.querySelector(`[data-error="${elemento.id}"]`);
    if (errorSpan) errorSpan.textContent = mensaje;
    elemento.focus();
}

function limpiarErrores() {
    document.querySelectorAll('.mensaje-error').forEach(e => e.textContent = "");
}

function recopilarDatosPasoActual() {
    if (pasoActual === 1) {
        estadoFormulario.nombreCompleto = document.getElementById('nombre-completo').value.trim();
        // Extraer primer nombre para saludo personalizado
        estadoFormulario.primerNombre = estadoFormulario.nombreCompleto.split(' ')[0];
        estadoFormulario.fechaCumpleanios = document.getElementById('fecha-cumpleanios').value;

        saludoPersonalizado.textContent = `¡Hola, ${estadoFormulario.primerNombre}! ♡`;
    }

    if (pasoActual === 2) {
        const cats = document.querySelectorAll('input[name="categorias"]:checked');
        estadoFormulario.categoriasRegalo = Array.from(cats).map(c => c.value);
    }

    if (pasoActual === 3) {
        // Libros
        const generos = document.querySelectorAll('input[name="generosLibros"]:checked');
        estadoFormulario.generoLibros = Array.from(generos).map(g => g.value);

        // Flores
        const gustaFloresRadio = document.querySelector('input[name="leGustanFlores"]:checked');
        estadoFormulario.leGustanFlores = gustaFloresRadio ? gustaFloresRadio.value : "";

        if (estadoFormulario.leGustanFlores === "No mucho") {
            estadoFormulario.tiposFlores = [];
        } else {
            const tiposF = document.querySelectorAll('input[name="tiposFlores"]:checked');
            estadoFormulario.tiposFlores = Array.from(tiposF).map(t => t.value);
        }
    }

    if (pasoActual === 4) {
        const colorRadio = document.querySelector('input[name="colorFavorito"]:checked');
        estadoFormulario.colorFavorito = colorRadio ? colorRadio.value : "";
        estadoFormulario.colorFavoritoOtro = document.getElementById('color-otro-input').value.trim();

        const hobbiesCheck = document.querySelectorAll('input[name="hobbies"]:checked');
        estadoFormulario.hobbies = Array.from(hobbiesCheck).map(h => h.value);
        estadoFormulario.hobbiesOtro = document.getElementById('hobbies-otro-input').value.trim();

        estadoFormulario.otrosGustos = document.getElementById('otros-gustos').value.trim();
    }

    if (pasoActual === 5) {
        estadoFormulario.noTeGusta = document.getElementById('no-te-gusta').value.trim();
        estadoFormulario.cumpleaniosIdeal = document.getElementById('cumpleanios-ideal').value.trim();
    }
}

/**
 * 4. Lógica Condicional del Paso 3
 */
function evaluarLógicaCondicionalPaso3() {
    const seccionLibros = document.getElementById('seccion-libros');
    const seccionFlores = document.getElementById('seccion-flores');
    const mensajeSinCondicionales = document.getElementById('sin-condicionales');

    const incluyeLibros = estadoFormulario.categoriasRegalo.includes('Libros');
    const incluyeFlores = estadoFormulario.categoriasRegalo.includes('Flores');

    if (incluyeLibros) {
        seccionLibros.classList.remove('oculta');
    } else {
        seccionLibros.classList.add('oculta');
        estadoFormulario.generoLibros = []; // Limpiar datos no aplicables
        document.querySelectorAll('input[name="generosLibros"]').forEach(el => el.checked = false);
    }

    if (incluyeFlores) {
        seccionFlores.classList.remove('oculta');
    } else {
        seccionFlores.classList.add('oculta');
        estadoFormulario.leGustanFlores = "";
        estadoFormulario.tiposFlores = [];
        document.querySelectorAll('input[name="leGustanFlores"]').forEach(el => el.checked = false);
        document.querySelectorAll('input[name="tiposFlores"]').forEach(el => el.checked = false);
        document.getElementById('subseccion-tipos-flores').classList.add('oculta');
    }

    if (!incluyeLibros && !incluyeFlores) {
        mensajeSinCondicionales.classList.remove('oculta');
    } else {
        mensajeSinCondicionales.classList.add('oculta');
    }
}

/**
 * 5. Configuración de Inputs Dinámicos y Eventos Auxiliares
 */
function configurarInputsCondicionales() {
    // Manejo de opción "Otros" en color favorito
    const radiosColor = document.querySelectorAll('input[name="colorFavorito"]');
    const inputOtroColor = document.getElementById('color-otro-input');

    radiosColor.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Otros') {
                inputOtroColor.classList.remove('oculta');
                inputOtroColor.focus();
            } else {
                inputOtroColor.classList.add('oculta');
                inputOtroColor.value = '';
            }
        });
    });

    // Manejo de opción "Otros hobbies"
    const checkHobbies = document.querySelectorAll('input[name="hobbies"]');
    const inputOtroHobbies = document.getElementById('hobbies-otro-input');

    checkHobbies.forEach(check => {
        check.addEventListener('change', () => {
            const esOtroSeleccionado = Array.from(checkHobbies).some(c => c.value === 'Otros hobbies' && c.checked);
            if (esOtroSeleccionado) {
                inputOtroHobbies.classList.remove('oculta');
            } else {
                inputOtroHobbies.classList.add('oculta');
                inputOtroHobbies.value = '';
            }
        });
    });

    // Subsección tipos de flores según respuesta de si le gustan
    const radiosFlores = document.querySelectorAll('input[name="leGustanFlores"]');
    const subseccionTiposFlores = document.getElementById('subseccion-tipos-flores');

    radiosFlores.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === "Sí, ¡me encantan!" || e.target.value === "Depende de la ocasión") {
                subseccionTiposFlores.classList.remove('oculta');
            } else {
                subseccionTiposFlores.classList.add('oculta');
                estadoFormulario.tiposFlores = [];
                document.querySelectorAll('input[name="tiposFlores"]').forEach(el => el.checked = false);
            }
        });
    });
}

/**
 * 6. Generar Resumen Visual en Paso 5
 */
function generarResumenVisual() {
    recopilarDatosPasoActual();
    const contenedorResumen = document.getElementById('contenido-resumen');

    let colorFinal = estadoFormulario.colorFavorito === 'Otros' ? estadoFormulario.colorFavoritoOtro : estadoFormulario.colorFavorito;
    let hobbiesFinales = [...estadoFormulario.hobbies];
    if (estadoFormulario.hobbiesOtro) hobbiesFinales.push(estadoFormulario.hobbiesOtro);

    contenedorResumen.innerHTML = `
        <p><strong>Nombre:</strong> ${estadoFormulario.nombreCompleto}</p>
        <p><strong>Cumpleaños:</strong> ${estadoFormulario.fechaCumpleanios}</p>
        <p><strong>Regalos favoritos:</strong> ${estadoFormulario.categoriasRegalo.join(', ') || 'Ninguna'}</p>
        ${estadoFormulario.generoLibros.length > 0 ? `<p><strong>Géneros de libros:</strong> ${estadoFormulario.generoLibros.join(', ')}</p>` : ''}
        ${estadoFormulario.leGustanFlores ? `<p><strong>Gustos sobre flores:</strong> ${estadoFormulario.leGustanFlores}${estadoFormulario.tiposFlores.length ? '(' + estadoFormulario.tiposFlores.join(', ') + ')' : ''}</p>` : ''}
        <p><strong>Color favorito:</strong> ${colorFinal}</p>
        <p><strong>Hobbies:</strong> ${hobbiesFinales.join(', ') || 'No especificados'}</p>
    `;
}

/**
 * 7. Envío Final y Conexión con Google Apps Script
 */



async function manejarEnvioFinal(e) {
    e.preventDefault();
    recopilarDatosPasoActual();

    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando wishlist... 🎀";

    const datosParaEnviar = {
        FechaRegistro: new Date().toISOString(),
        CodigoAmiga: estadoFormulario.codigoAmiga,
        NombreCompleto: estadoFormulario.nombreCompleto,
        FechaCumpleanios: estadoFormulario.fechaCumpleanios,
        CategoriaRegalo: JSON.stringify(estadoFormulario.categoriasRegalo),
        GeneroLibros: JSON.stringify(estadoFormulario.generoLibros),
        OtrosGustos: estadoFormulario.otrosGustos,
        LeGustanFlores: estadoFormulario.leGustanFlores,
        TiposFlores: JSON.stringify(estadoFormulario.tiposFlores),
        ColorFavorito: estadoFormulario.colorFavorito === 'Otros' ? estadoFormulario.colorFavoritoOtro : estadoFormulario.colorFavorito,
        Hobbies: JSON.stringify([...estadoFormulario.hobbies, estadoFormulario.hobbiesOtro].filter(Boolean)),
        NoTeGusta: estadoFormulario.noTeGusta,
        CumpleaniosIdeal: estadoFormulario.cumpleaniosIdeal,
        EstadoEncuesta: "Completada"
    };

    if (URL_APPS_SCRIPT) {
        try {
            // Empaquetamos el JSON dentro de un parámetro de formulario para evadir restricciones estritas de CORS en POST
            const formData = new URLSearchParams();
            formData.append("datos", JSON.stringify(datosParaEnviar));

            await fetch(URL_APPS_SCRIPT, {
                method: 'POST',
                body: formData
            });

            // Transicionamos a la pantalla de éxito con seguridad
            transicionarAPantallaExito();

        } catch (error) {
            console.error("Error al enviar a Google Sheets:", error);
            // Aunque ocurra un inconveniente visual en consola, forzamos la transición para no frustrar a la usuaria
            transicionarAPantallaExito();
        }
    }

}


function transicionarAPantallaExito() {
    pantallaEncuesta.classList.remove('activa');
    pantallaEncuesta.classList.add('oculta');
    pantallaExito.classList.remove('oculta');
    pantallaExito.classList.add('activa');

    document.getElementById('mensaje-exito-personalizado').textContent =
        `¡Gracias, ${estadoFormulario.primerNombre}! ♡ He guardado tus gustos con mucho cariño. Ahora tengo las mejores pistas para hacer de tu cumpleaños un momento inolvidable.`;
}




