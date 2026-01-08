import express, { Express } from 'express'
import cors from 'cors'
import { env } from '../config/env'
import { Logger } from './Logger'
import { Database } from './Database'
import { ErrorMiddleware } from '../middlewares/ErrorMiddleware'
import mainRouter from '../routes'
import swaggerUi from 'swagger-ui-express'
import specs from '../config/swagger'

export class Application {
    public app: Express

    constructor() {
        this.app = express()
        this.initializeMiddlewares()
        this.initializeRoutes()
        this.initializeErrorHandling()
        this.initializeDatabase()
    }

    private initializeMiddlewares(): void {
        this.app.use(cors({ origin: true }))
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
    }

    private initializeRoutes(): void {
        const swaggerOptions = {
            customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css',
            customJs: [
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js',
            ],
            swaggerOptions: {
                persistAuthorization: true,
            }
        };
        this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions))
        this.app.use('/', mainRouter)
    }

    private initializeErrorHandling(): void {
        this.app.use(ErrorMiddleware.handle)
    }

    private initializeDatabase(): void {
        Database.getInstance()
    }

    public listen(): void {
        this.app.listen(env.port, () => {
            Logger.info(`🚀 Server running on port ${env.port}`)
        })
    }
}
