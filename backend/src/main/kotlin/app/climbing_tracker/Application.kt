package app.climbing_tracker

import app.climbing_tracker.problem.ProblemRepo
import app.climbing_tracker.problem.problemRouting
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import org.jooq.DSLContext
import org.jooq.impl.DSL
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.lang.System.getenv
import java.time.OffsetDateTime

fun getRequiredEnv(name: String) = checkNotNull(getenv(name)) { "'$name' is required env variable" }

val appModule = module {
    single<DSLContext> {
        DSL.using(
            getRequiredEnv("DB_URL"),
            getRequiredEnv("DB_LOGIN"),
            getRequiredEnv("DB_PASS")
        )
    }

    singleOf(::ProblemRepo)
}

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
                serializersModule = SerializersModule {
                    contextual(OffsetDateTime::class, OffsetDateTimeSerializer)
                }
            })
        }

        install(Koin) {
            modules(appModule)
        }

        install(StatusPages)

        problemRouting()
    }.start(wait = true)
}
