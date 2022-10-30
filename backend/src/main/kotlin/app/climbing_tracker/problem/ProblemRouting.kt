package app.climbing_tracker.problem

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject

fun Application.problemRouting() {

    val problemRepo: ProblemRepo by inject()

    routing {
        route("/problems") {
            get {
                call.respond(problemRepo.getProblems())
            }
        }
    }
}
