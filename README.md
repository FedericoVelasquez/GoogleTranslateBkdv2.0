# GoogleTranslate_Backendv2.0
_HTML • JavaScript • CSS • Backend_  
Traductor estilo GoogleTranslate con HTML, Javascript, CSS y con Backend de requests a IA-Gemini. 

#Local-IA_Browser #VoiceRecognition #SpeechSynthesis #IA-Gemini

<p align="center">
  <img src="https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-08-15%20102417.png" alt="Screenshot of Translator UI in Preview Mode" width="700">
</p>

Aplicación web de traducción que combina las APIs nativas del navegador con un backend conectado a Gemini. Permite traducción local, detección automática de idioma y romanización (alfabeto latino e IPA) de idiomas no latinos como ruso, japonés y chino. Una experiencia más completa a la de un traductor convencional. 

## Cosas a tener en cuenta:
1. **API-Key Gemini**:
   Para mandar solicitudes a la IA de Gemini es necesario tener una cuenta en **Google AI Studio** (gratuita, con hasta $300 en créditos de Google Cloud). En el menú lateral del dashboard puedes generar una API      Key.
   
   <p align="center">
     <img src="https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%201654053.jpg" alt="Screenshot of Google IA Studio" width="700">
   </p>
   
   Luego con el ID del la API-Key se crea un archivo .env en la carpeta raiz del proyecto y dentro pon el ID "GOOGLE_API_KEY= 'pon tu codigo aqui'".

2. **Instalar las dependencias**:
   Asegúrate de tener todas las dependencias en el package.json. Configura el archivo del servidor de romanización y define la dirección web correcta de la página en la sección CORS.
   
   ![Screenshot Configuration in package.json](https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%202117393.jpg)

3. **Seleccionar el modelo de IA-Gemini**:
   Cada modelo tiene límites de requests, tokens por input y tipo de salida (texto, imagen, audio, video). Consulta la [documentación de modelos](https://ai.google.dev/gemini-api/docs/models?hl=es-419)
   
   <p align="center">
     <img src="https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%20145234.png" alt="Screenshot of Google IA Studio/ Gemini API Use" width="700">
   </p>
  
4. **Pruebas**:
   - Detección automática de idioma (muestra el confidence).
   - Entrada de texto por voz.
   - Lectura del texto traducido por altavoz.
   - Copiar traducciones al portapapeles.
   - Limpiar texto de entrada.
   - Traducción y transcripción al alfabeto latino (Romanización + IPA).
   
  <p align="center">
    <img src="https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%20144957.png" alt="Screenshot of Google Translate/ Translation Japones to Spanish" width="700">
  </p>
  <p align="center">
    <img src="https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%20145039.png" alt="Screenshot of Google Translate/ Translation Spanish to Ruso" width="700">
  </p>
  <p align="center">
    <img src="https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%20145056.png" alt="Screenshot of Google Translate/ Copy Text Output" width="700">
  </p>

## Enlaces
1. [Using the Translator and Language Detector APIs](https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs/Using)
2. [Language detection with built-in AI](https://developer.chrome.com/docs/ai/language-detection)
3. [Translation with built-in AI](https://developer.chrome.com/docs/ai/translator-api)
4. [Text Generation API-Gemini](https://ai.google.dev/gemini-api/docs/text-generation?hl=es-419)
5. [Gemini Models IA](https://ai.google.dev/gemini-api/docs/models?hl=es-419)
