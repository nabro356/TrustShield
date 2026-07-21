package com.shieldnet.live.ui

import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.shieldnet.live.R

class ScamAlertOverlay(private val context: Context) {

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: View? = null
    private var isShowing = false

    fun show(threatScore: Int, scamType: String) {
        if (isShowing) return

        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        overlayView = inflater.inflate(R.layout.layout_scam_alert, null)

        val tvDetails = overlayView?.findViewById<TextView>(R.id.tv_scam_details)
        tvDetails?.text = "${scamType.replace("_", " ").uppercase()} DETECTED\nThreat Score: $threatScore/100"

        overlayView?.findViewById<Button>(R.id.btn_dismiss_alert)?.setOnClickListener {
            hide()
        }

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.TOP

        windowManager.addView(overlayView, params)
        isShowing = true
    }

    fun hide() {
        if (isShowing && overlayView != null) {
            windowManager.removeView(overlayView)
            overlayView = null
            isShowing = false
        }
    }
}
