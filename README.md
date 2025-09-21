# GoogleTranslateBkdv2.0
Traductor estilo GoogleTranslate con HTML, Javascript, CSS y con Backend de requests a IA-Gemini #Local-IA_Browser #VoiceRecognition #SpeechSynthesis #IA-Gemini

![Screenshot of Translator UI in Preview Mode](https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-08-15%20102417.png)

Aplicación web de traducción que combina las APIs nativas del navegador con un backend conectado a Gemini, permitiendo traducción local, detección automática de idioma y romanización (alfabeto latino e IPA) de idiomas no latinos como ruso, japonés y chino. Una experiencia más completa que la de un traductor convencional.

## Cosas a tener en cuenta:
1. API-Key Gemini: Para poder mandar solicitudes a la IA de Gemini es necesario tener una cuenta en Google IA Studio(es gratuita y con la plataforma de Google Cloud permite hasta $300 en otras herramientas de la plataforma) y en el menu lateral del dashboard hay una opcion la cual le genera una APIKey.

![Screenshot of Google IA Studio](https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%201654053.jpg)

Ya con el ID del la API-Key se crea un archivo .env en la carpeta raiz del proyecto y dentro pone el ID "GOOGLE_API_KEY= 'pon tu codigo aqui'".

2. Instalar las dependencias: Asegurarse de tener instaladas las dependencias para el package.json y configurar en que archivo ejecutar el server de romanize; y en el cors definir la direccion de la paguina que va a enviar las solicitudes al backend.

3. Seleccionar el modelo de IA-Gemini: Tener en cuenta que cada modelo tiene unos limites de request por dia, tokens por inputs o el tipo de salida que quieras(image, text, audio, video...)[ver enlace *5]

![Screenshot of Google IA Studio/ Gemini API Use](https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%20145234.png)

4. Pruebas:

![Screenshot of Google Translate/ Translation Japones to Spanish](https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%20144957.png)
![Screenshot of Google Translate/ Translation Spanish to Russo](https://github.com/FedericoVelasquez/personal/blob/main/Screenshot%202025-09-20%20145039.png)

## Enlaces
1. Using the Translator and Language Detector APIs [Using the Translator and Language Detector APIs](https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs/Using)
2. Language detection with built-in AI [Language detection with built-in AI](https://developer.chrome.com/docs/ai/language-detection)
3. Translation with built-in AI [Translation with built-in AI](https://developer.chrome.com/docs/ai/translator-api)
4. Text Generation API-Gemini [Text Generation API-Gemini](https://ai.google.dev/gemini-api/docs/text-generation?hl=es-419)
5. Gemini Models IA [Gemini Models IA](https://ai.google.dev/gemini-api/docs/models?hl=es-419)
