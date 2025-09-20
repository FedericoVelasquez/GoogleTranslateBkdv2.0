import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";  //  importa el cliente de Gemini

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:8080" }));
app.use(express.json());

// Configura Gemini con tu API key
dotenv.config();
const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY}); //  cámbiala por la tuya

// Endpoint para romanizar
app.post("/romanize", async (req, res) => {
    const { text, language } = req.body;

    if (!text || !language) {
        return res.status(400).json({ error: "Faltan parámetros: text y language" });
    }
    
    if (text.length > 450) {
        return res.status(400).json({error: "El texto excede el límite de 450 caracteres para romanización"});
    }

    try {
        // Construimos el prompt
        const prompt = `Please romanize the following text in ${language}: "${text}". 
        Also, if possible, provide IPA transcription.
        Format strictly like this:
        Romanization: ... || IPA: ...`;

        // Llamamos al modelo de Gemini
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        // Texto plano
        const rawText = response.text;
        // Parsear la respuesta romanization/IPA
        const parsed = parseRomanization(rawText);

        res.json(parsed);
    } 
    catch (error) {
    console.error("Error detallado:", error.message, error.stack);
    res.status(500).json({ error: "Error al romanizar el texto" });
    }
});

function parseRomanization(text) {
    // Expresiones regulares para buscar "Romanization:" y "IPA:"
    const romanizationMatch = text.match(/Romanization:\s*(.+?)(?:\|\||$)/i);
    const ipaMatch = text.match(/IPA:\s*(.+)$/i);

    const romanization = romanizationMatch ? romanizationMatch[1].trim() : null;
    const ipa = ipaMatch ? ipaMatch[1].trim() : null;

    return {
        romanization,
        ipa,
        raw: text.trim() // opcional: guardas la salida cruda por si falla
    };
}

app.listen(port, () => {
    console.log(`Servidor de romanización con Gemini en http://localhost:${port}`);
});

