import {Module} from "@nestjs/common";
import {MovieService} from "./movie.services";
import {MovieController} from "./movie.controller";
import {PrismaModule} from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [MovieController],
    providers: [MovieService],
})

export class MovieModule {}