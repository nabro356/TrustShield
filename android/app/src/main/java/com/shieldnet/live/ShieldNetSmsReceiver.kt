package com.shieldnet.live

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

/**
 * Stable BroadcastReceiver approach to intercept incoming SMS messages.
 */
class ShieldNetSmsReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "ShieldNetSmsReceiver"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.originatingAddress
                val body = sms.messageBody
                Log.i(TAG, "Received SMS from $sender: $body")
                
                // Final implementation will send this to the FastAPI backend 
                // for threat analysis via a Coroutine Worker.
            }
        }
    }
}
