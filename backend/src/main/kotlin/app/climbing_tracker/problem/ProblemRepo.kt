package app.climbing_tracker.problem

import app.climbing_tracker.jooq.tables.Problem.PROBLEM
import app.climbing_tracker.jooq.tables.records.ProblemRecord
import kotlinx.coroutines.future.await
import org.jooq.DSLContext
import java.time.ZoneOffset

class ProblemRepo(private val jooq: DSLContext) {

    suspend fun getProblems(): List<Problem> =
        jooq.select(*PROBLEM.fields())
            .from(PROBLEM)
            .fetchAsync()
            .await()
            .into(PROBLEM)
            .map { it.intoInternal() }
}

fun ProblemRecord.intoInternal(): Problem =
    Problem(
        id = id,
        gymId = gymId,
        createdById = createdById,
        setterId = setterId,
        date = date?.atOffset(ZoneOffset.UTC),
        imageUrl = imageUrl,
        color = color,
        gymGrade = gymGrade,
        holdType = holdType,
        wallType = wallType,
        style = style
    )