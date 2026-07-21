package com.shieldnet.live.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class ShieldNetAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "ShieldNetAccessibility"
        private const val WHATSAPP_PACKAGE = "com.whatsapp"
        
        // This is a simplified check. In production, we'd look for specific 
        // View IDs in the WhatsApp view hierarchy that indicate an active call.
        // For the hackathon, checking for "End call" or similar text is sufficient.
        private val CALL_ACTIVE_KEYWORDS = listOf("End call", "Speaker", "Mute")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.packageName != WHATSAPP_PACKAGE) return

        val rootNode = rootInActiveWindow ?: return
        val isCallActive = checkCallActive(rootNode)
        
        if (isCallActive) {
            Log.d(TAG, "WhatsApp Call detected via Accessibility!")
            startTranscriptionService()
        } else {
            // Depending on the exact logic, we might want to stop it here,
            // but we'll let the user stop it manually or handle it in the overlay.
        }
    }

    private fun checkCallActive(nodeInfo: AccessibilityNodeInfo): Boolean {
        if (nodeInfo.text != null) {
            val text = nodeInfo.text.toString()
            if (CALL_ACTIVE_KEYWORDS.any { text.contains(it, ignoreCase = true) }) {
                return true
            }
        }
        
        for (i in 0 until nodeInfo.childCount) {
            val child = nodeInfo.getChild(i)
            if (child != null) {
                if (checkCallActive(child)) {
                    child.recycle()
                    return true
                }
                child.recycle()
            }
        }
        return false
    }

    private fun startTranscriptionService() {
        val intent = Intent(this, ShieldNetTranscriptionService::class.java)
        intent.action = "START_TRANSCRIPTION"
        startForegroundService(intent) // Requires FOREGROUND_SERVICE permission
    }

    override fun onInterrupt() {
        Log.d(TAG, "Service Interrupted")
    }
}
