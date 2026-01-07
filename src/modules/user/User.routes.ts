import { Router } from 'express';
import { UserController } from './User.controller';




export class UserRoutes {
    public router: Router;
    private userController: UserController;

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post('/register', this.userController.register);


        this.router.post('/login', this.userController.login);
    }
}
