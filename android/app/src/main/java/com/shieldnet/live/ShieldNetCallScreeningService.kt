package com.shieldnet.live

import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log

/**
 * Service that integrates with Android Telecom API (API 29+) to screen incoming calls.
 * This is the stable path instead of the alpha AppFunctions API.
 */
class ShieldNetCallScreeningService : CallScreeningService() {

    companion object {
        private const val TAG = "ShieldNetCallScreening"
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val phoneNumber = callDetails.handle?.schemeSpecificPart
        Log.i(TAG, "Screening incoming call from: $phoneNumber")

        // Default response: Allow the call
        // In the final implementation, this will query the ShieldNet backend
        // via OkHttp to determine if the call should be blocked.
        val response = CallResponse.Builder()
            .setDisallowCall(false)
            .setRejectCall(false)
            .setSkipCallLog(false)
            .setSkipNotification(false)
            .build()
            
        respondToCall(callDetails, response)
    }
}
