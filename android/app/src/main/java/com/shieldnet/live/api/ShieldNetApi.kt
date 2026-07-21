package com.shieldnet.live.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ShieldNetApi {
    @POST("scan/scam-text")
    suspend fun scanScamText(@Body request: ScamAnalysisRequest): Response<ScamAnalysisResult>
}
