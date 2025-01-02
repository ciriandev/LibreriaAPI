import express from 'express';
import fs from "fs";

const app = express();

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Función para leer los datos desde el archivo JSON
const readData = () => {
    try {
        const data = fs.readFileSync("./db.json", "utf8");
        return JSON.parse(data); // Parsear el JSON a un objeto
    } catch (error) {
        console.log(error);
        return null;
    }
};

// Función para escribir datos en el archivo JSON
const writeData = (data) => {
    try {
        fs.writeFileSync("./db.json", JSON.stringify(data, null, 2)); // Guardar datos con indentación
    } catch (error) {
        console.log(error);
    }
};

// Ruta principal
app.get("/", (req, res) => {
    res.send("Welcome to my first API with Node js!!!");
});

// GET para todos los libros
app.get("/libros", (req, res) => {
    const data = readData();
    if (data && data.rows) {
        res.setHeader('Content-Type', 'application/json'); // Asegurar que el tipo de contenido sea JSON
        res.send(JSON.stringify(data.rows, null, 2)); // Devolver el JSON formateado con indentación
    } else {
        res.status(500).send({ error: "Error al leer los datos" });
    }
});

// GET para obtener un libro por su ISBN
app.get("/libros/:isbn", (req, res) => {
    const data = readData();
    if (data && data.rows) {
        const isbn = parseInt(req.params.isbn, 10); // Convertir el ISBN a un número entero
        const libro = data.rows.find((book) => book.ISBN === isbn); // Buscar el libro por ISBN

        if (libro) {
            res.json(libro); // Devolver el libro encontrado
        } else {
            res.status(404).send({ error: "Libro no encontrado" }); // Libro no encontrado
        }
    } else {
        res.status(500).send({ error: "Error al leer los datos" });
    }
});

// Método POST para agregar un nuevo libro
app.post("/libros", (req, res) => {
    const data = readData();
    if (data && data.rows) {
        const nuevoLibro = req.body; // Obtener los datos del cuerpo de la solicitud

        // Comprobar si el ISBN ya existe en la lista de libros
        const libroExistente = data.rows.find((book) => book.ISBN === nuevoLibro.ISBN);

        if (libroExistente) {
            // Si el libro con el mismo ISBN ya existe, devolver un error 409
            return res.status(409).send({ error: "El libro con este ISBN ya existe." });
        }

        // Si no existe, agregar el nuevo libro a la lista
        data.rows.push(nuevoLibro);

        try {
            fs.writeFileSync("./db.json", JSON.stringify(data, null, 2)); // Guardar los cambios
            res.status(201).send(nuevoLibro); // Devolver el libro agregado con código 201
        } catch (error) {
            res.status(500).send({ error: "Error al guardar los datos" });
        }
    } else {
        res.status(500).send("Error al leer los datos");
    }
});

// Método PUT para actualizar un libro por su ISBN
app.put("/libros/:isbn", (req, res) => {
    const data = readData();
    if (data && data.rows) {
        const isbn = parseInt(req.params.isbn, 10);
        const libroIndex = data.rows.findIndex((book) => book.ISBN === isbn);

        if (libroIndex !== -1) {
            // Actualizar los datos del libro
            data.rows[libroIndex] = { ...data.rows[libroIndex], ...req.body };

            try {
                writeData(data); // Guardar los cambios
                res.send(data.rows[libroIndex]); // Devolver el libro actualizado
            } catch (error) {
                res.status(500).send({ error: "Error al guardar los datos" });
            }
        } else {
            res.status(404).send({ error: "Libro no encontrado" });
        }
    } else {
        res.status(500).send({ error: "Error al leer los datos" });
    }
});

// Método DELETE para eliminar un libro por su ISBN
app.delete("/libros/:isbn", (req, res) => {
    const data = readData();
    if (data && data.rows) {
        const isbn = parseInt(req.params.isbn, 10);
        const libroIndex = data.rows.findIndex((book) => book.ISBN === isbn);

        if (libroIndex !== -1) {
            const libroEliminado = data.rows.splice(libroIndex, 1); // Eliminar el libro

            try {
                writeData(data); // Guardar los cambios
                res.send(libroEliminado[0]); // Devolver el libro eliminado
            } catch (error) {
                res.status(500).send({ error: "Error al guardar los datos" });
            }
        } else {
            res.status(404).send({ error: "Libro no encontrado" });
        }
    } else {
        res.status(500).send({ error: "Error al leer los datos" });
    }
});

app.listen(3000, () => {
    console.log('Server escuchando en el puerto 3000');
});