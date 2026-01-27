import {z} from "zod"

export const ArenaGameIdByPlayerSchema = z.object ({
    gameId : z.coerce.number().int().positive()
})