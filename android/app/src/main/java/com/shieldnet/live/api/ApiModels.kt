package com.shieldnet.live.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ScamAnalysisRequest(
    val text: String,
    val language: String? = null
)

@JsonClass(generateAdapter = true)
data class ScamAnalysisResult(
    @Json(name = "scam_type") val scamType: String,
    @Json(name = "threat_score") val threatScore: Int,
    val confidence: Float,
    @Json(name = "detected_language") val detectedLanguage: String,
    val analysis: String,
    @Json(name = "red_flags") val redFlags: List<RedFlagPhrase> = emptyList(),
    @Json(name = "extracted_entities") val extractedEntities: List<ExtractedEntity> = emptyList(),
    @Json(name = "scam_stage") val scamStage: String = ""
)

@JsonClass(generateAdapter = true)
data class RedFlagPhrase(
    val phrase: String,
    val category: String,
    val severity: String
)

@JsonClass(generateAdapter = true)
data class ExtractedEntity(
    val value: String,
    @Json(name = "entity_type") val entityType: String,
    val confidence: Float
)
