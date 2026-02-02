import { FastifyPluginAsync } from "fastify";
import { Notification } from "../models/Notification";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { pagination, notificationIdParam } from "../schema/notification.schema";

const NotificationsRoutes: FastifyPluginAsync = async (fastifyInstance) => {

    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    fastify.get("/notifications", {
        onRequest: [fastify.authenticate], schema: { querystring: pagination }
    }, Notification.getAll);

    fastify.patch("/notifications/:id/read", {
        onRequest: [fastify.authenticate], schema: { params: notificationIdParam }
    }, Notification.markAsRead);

    fastify.get("/notifications/unread/count", {
        onRequest: [fastify.authenticate]
    }, Notification.getUnreadCount);
};

export default NotificationsRoutes;
