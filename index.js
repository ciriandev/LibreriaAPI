import express from 'express';
import fs from "fs";

const app = express();

const readData = () => {
    try {
        const data = fs.readFileSync("./db.json", "utf8");
        return JSON.parse(data);
    }
    catch(error){
        console.log(error);
        return null;
    };
};

const writeData = () => {
    try {
        fs.writeFileSync("./db.json", JSON.stringify(data))
    }
    catch(error){
        console.log(error)
    };
}

readData();

app.get("/", (req, res) => {
    res.send("Welcome to my first API with Node js!!!");
});

app.get("/libros", (req, res) => {
    const data = readData();
    if (data && data.rows) {
        res.setHeader('Content-Type', 'application/json'); // Asegurar que el tipo de contenido sea JSON
        res.send(JSON.stringify(data.rows, null, 2)); // Devuelve el JSON formateado con indentación
    } else {
        res.status(500).send("Error al leer los datos");
    }
});


app.listen(3000, () => {
    console.log('Server escuchando en el puerto 3000');
});