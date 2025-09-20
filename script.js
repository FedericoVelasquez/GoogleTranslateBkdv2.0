import { $ } from './dom.js'

class GoogleTranslator {
    static SUPPORTED_LANGUAGES = [
        'en',
        'es',
        'fr',
        'de',
        'it',
        'pt',
        'ru',
        'ja',
        'zh'
    ]

    static FULL_LANGUAGES_CODES = {
        es: 'es-ES',
        en: 'en-US',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-PT',
        ru: 'ru-RU',
        ja: ['ja-JP', 'ja-Latn'],
        zh: 'zh-CN'
    }

    static DEFAULT_SOURCE_LANGUAGE = 'es'
    static DEFAULT_TARGET_LANGUAGE = 'en'
    static NOT_LATIN_LANGUAGES = ['ja', 'zh', 'ru']

    constructor() {
        this.init()
        this.setupEventListeners()

        this.translationTimeout = null
        this.currentTranslator = null
        this.currentTranslatorKey = null
        this.currentDetector = null
    }

    init() {
        // Recuperamos todos los elementos del DOM que necesitamos
        this.inputText = $('#inputText')
        this.outputText = $('#outputText')
        this.outputRomanization = $('#outputRomanization') // Agregar esta línea
        this.outputIPA = $('#outputIPA') // Agregar esta línea
        this.inputTextPronunciation = $('#inputTextPronunciation')

        this.sourceLanguage = $('#sourceLanguage')
        this.targetLanguage = $('#targetLanguage')
        
        this.micButton = $('#micButton')
        this.eraserButton = $('#borrarBtn')
        this.copyButton = $('#copyButton')
        this.speakerButton = $('#speakerButton')
        this.swapLanguagesButton = $('#swapLanguages')
        this.romanizeController = null;

        // Configuración inicial
        this.targetLanguage.value = GoogleTranslator.DEFAULT_TARGET_LANGUAGE

        // Verificar que el usuario tiene soporte para la API de traducción
        this.checkAPISupport()
    }

    checkAPISupport() {
        this.hasNativeTranslator = "Translator" in window
        this.hasNativeDetector = "LanguageDetector" in window

        if (!this.hasNativeTranslator || !this.hasNativeDetector) {
            console.warn("APIs nativas de traducción y detección de idioma NO soportadas en tu navegador.")
            this.showAPIWarning()
        } else {
            console.log('✅ APIs nativas de IA disponibles')
        }
    }

  // Mostrar aviso de que las APIs nativas no están disponibles
    showAPIWarning() {
        const warning = $("#apiWarning")
        warning.style.display = "block"
    }

    setupEventListeners () {
        this.inputText.addEventListener('input', () => {
      // actualizar el contador de letras
        this.debounceTranslate(); 
        // ✅ Usar this.eraserButton (el elemento), no borrarBtn (la función)
        this.eraserButton.classList.toggle('visible', this.inputText.value.trim().length > 0)
    })

        this.sourceLanguage.addEventListener('change', () => this.translate())
        this.targetLanguage.addEventListener('change', () => this.translate())

        this.swapLanguagesButton.addEventListener('click', () => this.swapLanguages())
        this.eraserButton.addEventListener('click', () => this.clearInput())
        this.micButton.addEventListener('click', () => this.startVoiceRecognition())
        this.copyButton.addEventListener('click', () => this.copyTranslation())
        this.speakerButton.addEventListener('click', () => this.speakTranslation())
        
    }

    debounceTranslate () {
        clearTimeout(this.translationTimeout)
        this.translationTimeout = setTimeout(() => {
        this.translate()
        }, 500)
    }

    clearInput() {
        this.inputText.value = ''
        this.outputText.textContent = ''
        this.outputRomanization.textContent = ''
        this.outputIPA.textContent = ''
        this.inputTextPronunciation.textContent = ''
        this.eraserButton.classList.remove('visible')
        this.resetDetectedLanguage() // ✅ reiniciar el confidence
    }

    updateDetectedLanguage (detectedLanguage, result) {
        // Actualizar visualmente el idioma detectado
        let option;
        //confidence = null
    if (detectedLanguage === 'ja-Latn') {
        option = this.sourceLanguage.querySelector(`option[value="ja"]`)
    } else {
        option = this.sourceLanguage.querySelector(`option[value="${detectedLanguage}"]`)
    }

        if (option) {
        const autoOption = this.sourceLanguage.querySelector(`option[value="auto"]`)
        const confidence = result?.confidence ? ` (${(result.confidence * 100).toFixed(4)}%)` : ''
        autoOption.textContent = `Detectar idioma (${option.textContent}:${confidence})`
        }
    }

    async getTranslation (text) {
        let sourceLanguage;
    if (this.sourceLanguage.value === 'auto') {
        const detected = await this.detectLanguage(text)
        sourceLanguage = this.normalizeLanguageCode(detected.detectedLanguage)
    } else {
        sourceLanguage = this.sourceLanguage.value
    }

    const targetLanguage = this.targetLanguage.value

    if (sourceLanguage === targetLanguage) return text

    // 1. Revisar o verificar si realmente tenemos disponibilidad de esta traducción entre origen y destino
    try {
        const status = await window.Translator.availability({
        sourceLanguage,
        targetLanguage
    })

    if (status === 'unavailable') {
    throw new Error(`Traducción de ${sourceLanguage} a ${targetLanguage} no disponible`)
    }
} catch (error) {
    console.error(error)
    
    throw new Error(`Traducción de ${sourceLanguage} a ${targetLanguage} no disponible`)
}

    // 2. Realizar la traducción
    const translatorKey = `${sourceLanguage}-${targetLanguage}`

    try {
        if (!this.currentTranslator || this.currentTranslatorKey !== translatorKey) {
            this.currentTranslator = await window.Translator.create({
            sourceLanguage,
            targetLanguage,
            monitor: (monitor) => {
                monitor.addEventListener("downloadprogress", (e) => {
                this.outputText.innerHTML = `<span class="loading">Descargando modelo: ${Math.floor(e.loaded * 100)}%</span>`
                })
            }
            })
        }
    
        this.currentTranslatorKey = translatorKey
    
        const translation = await this.currentTranslator.translate(text)
        return translation
        } catch (error) {
        console.error(error)
        return 'Error al traducir'
        } 
    }

    async translate () {
        const text = this.inputText.value.trim()
        if (!text) {
        this.outputText.textContent = ''
        this.outputRomanization.textContent = '' // Limpiar también la pronunciación
        this.outputIPA.textContent = ''
        this.inputTextPronunciation.textContent = ''
        this.resetDetectedLanguage() // ✅ reiniciar el confidence
        return
        }

        this.outputText.textContent = 'Traduciendo...'

        if (this.sourceLanguage.value === 'auto') {
            if (text.length > 1) {
                /*const detectedLanguage = await this.detectLanguage(text)
                this.updateDetectedLanguage(detectedLanguage, result[0])*/
                const { detectedLanguage, confidence } = await this.detectLanguage(text)
                this.updateDetectedLanguage(detectedLanguage, { confidence })
            }else{
                this.outputText.textContent = 'Texto demasiado corto para detectar idioma'
            }
        }

        try {
        
        // Limpiar pronunciaciones anteriores
        this.inputTextPronunciation.textContent = ''
        this.outputRomanization.textContent = ''
        this.outputIPA.textContent = ''

        // Verificar si el idioma de origen es no latino
        if (GoogleTranslator.NOT_LATIN_LANGUAGES.includes(this.sourceLanguage.value)) {
            const inputRomanization = await this.getRomanization(text, this.sourceLanguage.value);
            this.inputTextPronunciation.textContent = inputRomanization.romanization
            ? `Romanization: ${inputRomanization.romanization}\nIPA: ${inputRomanization.ipa ?? ''}`: '';
        }

        const translation = await this.getTranslation(text)
        this.outputText.textContent = translation

             // Si el idioma de destino es no latino, obtener la romanización
        if (GoogleTranslator.NOT_LATIN_LANGUAGES.includes(this.targetLanguage.value)) {
            const romanization = await this.getRomanization(translation, this.targetLanguage.value);
            this.outputRomanization.textContent = romanization.romanization ? `Romanization: ${romanization.romanization}` : '';
            this.outputIPA.textContent = romanization.ipa ? `IPA: ${romanization.ipa}` : '';
        } else {
            this.outputRomanization.textContent = '';
            this.outputIPA.textContent = '';
        }

        } catch (error) {
        console.error(error)
        const hasSupport = this.checkAPISupport()
        if (!hasSupport) {
            this.outputText.textContent = '¡Error! No tienes soporte nativo a la API de traducción con IA'
            return
        }

        this.outputText.textContent = 'Error al traducir'
        //this.outputTextPronunciation.textContent = 'Error en la romanización'
        this.inputTextPronunciation.textContent = 'Error en la romanización'
        }
    }

    async swapLanguages () {
        
        if (this.sourceLanguage.value === 'auto') {
            const detected = await this.detectLanguage(this.inputText.value)
            this.sourceLanguage.value = this.normalizeLanguageCode(detected.detectedLanguage)
        }

        // guarda valores actuales
        const temporalLanguage = this.sourceLanguage.value
        const tempPron = this.inputTextPronunciation.textContent

        // intercambiar los valores
        this.sourceLanguage.value = this.targetLanguage.value
        this.targetLanguage.value = temporalLanguage

        // intercambiar los textos
        this.inputText.value = this.outputText.textContent

         // Intercambiar pronunciaciones
        this.inputTextPronunciation.textContent = this.outputRomanization.textContent
        this.outputRomanization.textContent = tempPron
        
        // Limpiar la pronunciación ya que el idioma cambió
        this.outputRomanization.textContent = ''
        //this.outputText.value = ""

        if (this.inputText.value.trim()) {
        this.translate()
        }

        // restaurar la opción de auto-detectar
    }

    getFullLanguageCode(languageCode, preferLatn = false) {
        const code = GoogleTranslator.FULL_LANGUAGES_CODES[languageCode]
    if (Array.isArray(code)) {
        return preferLatn ? code[1] : code[0]
    }
    return code ?? GoogleTranslator.DEFAULT_SOURCE_LANGUAGE
    }

    async startVoiceRecognition() {
        const hasNativeRecognitionSupport = "SpeechRecognition" in window || "webkitSpeechRecognition" in window
        if (!hasNativeRecognitionSupport) return

        const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = false
        recognition.interimResults = false

        const language = this.sourceLanguage.value === 'auto'
        ? this.normalizeLanguageCode((await this.detectLanguage(this.inputText.value)).detectedLanguage)
        : this.sourceLanguage.value

        recognition.lang = this.getFullLanguageCode(language)
        
        recognition.onstart = () => {
        this.micButton.style.backgroundColor = "var(--google-red)"
        this.micButton.style.color = "white"
        }

        recognition.onend = () => {
        this.micButton.style.backgroundColor = ""
        this.micButton.style.color = ""
        }

        recognition.onresult = (event) => {
        console.log(event.results)

        const [{ transcript }] = event.results[0]
        this.inputText.value = transcript
        this.translate()
        }

        recognition.onerror = (event) => {
        console.error('Error de reconocimiento de voz: ', event.error)
        }

        recognition.start()
    }

    copyTranslation() {
        const text = this.outputText.textContent
        if (!text) {this.mostrarGoogle('❌ No hay texto para copiar', 'error'); return}

        navigator.clipboard.writeText(text)
        this.mostrarGoogle('✅ Texto copiado!', 'success')
    }

    async mostrarGoogle(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.className = 'google-notification';
        notificacion.textContent = mensaje;
            
        document.body.appendChild(notificacion);
            
        setTimeout(() => notificacion.classList.add('show'), 10);
            
        setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 300);
        }, 2000);
    }

    speakTranslation() {
        const hasNativeSupportSynthesis = "SpeechSynthesis" in window
        if (!hasNativeSupportSynthesis) return
        
        const text = this.outputText.textContent
        if (!text) return

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = this.getFullLanguageCode(this.targetLanguage.value)
        utterance.rate = 0.8

        utterance.onstart = () => {
        this.speakerButton.style.backgroundColor = "var(--google-green)"
        this.speakerButton.style.color = "white"
        }

        utterance.onend = () => {
        this.speakerButton.style.backgroundColor = ""
        this.speakerButton.style.color = ""
        }

        window.speechSynthesis.speak(utterance)
    }

    async detectLanguage (text) {
        try {
        if (!this.currentDetector) {
            // Aplana el array para que solo haya strings
            const langs = Object.values(GoogleTranslator.FULL_LANGUAGES_CODES).flat()
            this.currentDetector = await window.LanguageDetector.create({
                expectedInputLanguages: langs
            })
        }

        const results = await this.currentDetector.detect(text)
        const detectedLanguage = results[0]?.detectedLanguage
        const confidence = results[0]?.confidence

        return {
            detectedLanguage: detectedLanguage === 'und' ? GoogleTranslator.DEFAULT_SOURCE_LANGUAGE : detectedLanguage,
            confidence
        }
        } catch (error) {
        console.error("No he podido averiguar el idioma: ", error)
        return GoogleTranslator.DEFAULT_SOURCE_LANGUAGE
        }
    }

    normalizeLanguageCode(code) {
        if (code === 'ja-Latn') return 'ja'
        return code
    }

    resetDetectedLanguage() {
    const autoOption = this.sourceLanguage.querySelector(`option[value="auto"]`);
    if (autoOption) {
        autoOption.textContent = "Detectar idioma"; // texto original limpio
    }
}

    async getRomanization(text, language) {
        try {
            
            // Cancelar request anterior si existe
            if (this.romanizeController) {
                this.romanizeController.abort();
            }
            this.romanizeController = new AbortController();

            const response = await fetch('http://localhost:3000/romanize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    language
                })
                //signal: this.romanizeController.signal // 👈 aquí va el controlador
            })

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor')
            }

            const data = await response.json()
            return data

        } catch (error) {
            
            if (error.name === 'AbortError') {
            console.log('✅ Request cancelada (nuevo input recibido)');
            return { romanization: null, ipa: null };
            }
            
            console.error('Error al obtener la romanización:', error)
            return { romanization: null, ipa: null };
        }
    }
}

const googleTranslator = new GoogleTranslator()
window.googleTranslator = googleTranslator
