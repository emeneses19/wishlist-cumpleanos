const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
    try {
        var codigoIngresado = e.parameter.codigo;
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var hoja = ss.getSheetByName("Codigos");

        var ultimaFila = hoja.getLastRow();
        if (ultimaFila < 2) {
            return generarRespuesta({ "status": "error", "message": "Código incorrecto" });
        }

        // Corregido el rango para que tome correctamente las filas y columnas
        var datos = hoja.getRange(2, 1, ultimaFila - 1, 3).getValues();
        var encontrado = false;
        var infoAmiga = {};

        for (var i = 0; i < datos.length; i++) {
            var nombre = datos[i][0];
            var estado = datos[i][2];
            var codigoAlmacenado = String(datos[i][1]).trim();

            if (codigoAlmacenado === String(codigoIngresado).trim()) {
                encontrado = true;
                infoAmiga = { nombre: nombre, estado: estado };
                break;
            }
        }

        if (encontrado) {
            return generarRespuesta({ status: "success", message: "Código correcto", data: infoAmiga });
        } else {
            return generarRespuesta({ status: "error", message: "Código incorrecto" });
        }
    } catch (error) {
        return generarRespuesta({ status: "error", message: "Error en el servidor: " + error.toString() });
    }
}

// Función para guardar los datos de la encuesta (POST)
function doPost(e) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var hoja = ss.getSheetByName("Respuestas");

        if (!hoja) {
            hoja = ss.insertSheet("Respuestas");
            hoja.appendRow([
                "FechaRegistro", "CodigoAmiga", "NombreCompleto", "FechaCumpleanios",
                "CategoriaRegalo", "GeneroLibros", "LeGustanFlores", "TiposFlores",
                "ColorFavorito", "Hobbies", "NoTeGusta", "CumpleaniosIdeal",
                "Otrosgustos", "EstadoEncuesta"
            ]);
        }

        // Leemos los datos enviados desde JavaScript
        var data = {};
        if (e.parameter && e.parameter.datos) {
            data = JSON.parse(e.parameter.datos);
        } else if (e.postData && e.postData.contents) {
            try {
                data = JSON.parse(e.postData.contents);
            } catch (err) {
                data = e.parameter;
            }
        }

        // Insertar la fila respetando tus columnas exactas
        hoja.appendRow([
            data.FechaRegistro || "",
            data.CodigoAmiga || "",
            data.NombreCompleto || "",
            data.FechaCumpleanios || "",
            data.CategoriaRegalo || "",
            data.GeneroLibros || "",
            data.LeGustanFlores || "",
            data.TiposFlores || "",
            data.ColorFavorito || "",
            data.Hobbies || "",
            data.NoTeGusta || "",
            data.CumpleaniosIdeal || "",
            data.OtrosGustos || "",
            data.EstadoEncuesta || ""
        ]);

        return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Función auxiliar para forzar las cabeceras CORS
function generarRespuesta(datos) {
    return ContentService.createTextOutput(JSON.stringify(datos))
        .setMimeType(ContentService.MimeType.JSON);
}