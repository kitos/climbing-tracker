package app.climbing_tracker.problem

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.OffsetDateTime

@Serializable
data class Problem(
    val id: String,
    val gymId: String,
    val createdById: String,
    val setterId: String?,
    @Contextual
    val date: OffsetDateTime?,
    val imageUrl: String?,
    val color: String?,
    val gymGrade: String?,
    val holdType: String?,
    val wallType: String?,
    val style: String?
)