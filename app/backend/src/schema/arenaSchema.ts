import {z} from "zod"

export const ArenaGameIdCheck = z.object ({
    gameId : z.coerce.number().int().positive()
})