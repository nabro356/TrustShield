package com.shieldnet.live.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.MediaRecorder
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import androidx.core.app.NotificationCompat
import com.shieldnet.live.api.ApiClient
import com.shieldnet.live.api.ScamAnalysisRequest
import com.shieldnet.live.ui.ScamAlertOverlay
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Locale

class ShieldNetTranscriptionService : Service() {

    companion object {
        private const val TAG = "TranscriptionService"
        private const val CHANNEL_ID = "ShieldNetMicChannel"
        private const val NOTIFICATION_ID = 101
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private val scope = CoroutineScope(Dispatchers.IO)
    private var alertOverlay: ScamAlertOverlay? = null
    private var isListening = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        alertOverlay = ScamAlertOverlay(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "START_TRANSCRIPTION") {
            startForeground(NOTIFICATION_ID, createNotification())
            startListening()
        }
        return START_STICKY
    }

    private fun startListening() {
        if (isListening) return
        
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        val recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            // Attempt to grab raw MIC audio to bypass WhatsApp's VOICE_COMMUNICATION lock
            // This is the specific hack for the hackathon
            putExtra("android.speech.extra.AUDIO_SOURCE", MediaRecorder.AudioSource.MIC)
        }

        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {
                // Restart listening immediately after a pause
                isListening = false
                startListening()
            }
            override fun onError(error: Int) {
                Log.e(TAG, "Speech recognizer error: $error")
                isListening = false
                // Attempt restart on error
                startListening()
            }
            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val text = matches[0]
                    Log.d(TAG, "Final Transcription: $text")
                    analyzeText(text)
                }
            }
            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    Log.d(TAG, "Partial Transcription: ${matches[0]}")
                }
            }
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        speechRecognizer?.startListening(recognizerIntent)
        isListening = true
    }

    private fun analyzeText(text: String) {
        if (text.length < 5) return // Ignore very short utterances
        
        scope.launch {
            try {
                val response = ApiClient.shieldNetApi.scanScamText(ScamAnalysisRequest(text))
                if (response.isSuccessful && response.body() != null) {
                    val result = response.body()!!
                    Log.d(TAG, "Threat Score: ${result.threatScore}")
                    
                    if (result.threatScore >= 80) {
                        launch(Dispatchers.Main) {
                            alertOverlay?.show(result.threatScore, result.scamType)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "API Error: ${e.message}")
            }
        }
    }

    private fun createNotification() = NotificationCompat.Builder(this, CHANNEL_ID)
        .setContentTitle("ShieldNet is Active")
        .setContentText("Monitoring call audio for scams...")
        .setSmallIcon(android.R.drawable.ic_menu_mic)
        .setPriority(NotificationCompat.PRIORITY_LOW)
        .build()

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Microphone Monitor Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer?.destroy()
        alertOverlay?.hide()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
