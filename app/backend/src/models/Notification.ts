import { FastifyRequest, FastifyReply } from "fastify";
import { NotificationRepository } from "../repository/notificationsRepository";

export const Notification = {

    getAll: async (req: FastifyRequest, reply: FastifyReply) => {
        const { limit, offset } = req.query as { limit: number; offset: number };
        const notifications = await NotificationRepository.getAll(req.user.id, limit, offset);
        return reply.status(200).send(notifications);
    },

    markAsRead: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number };
        await NotificationRepository.markAsRead(id, req.user.id);
        console.log(`Notification ${id} marked as read by user ${req.user.id}`);
        return reply.status(200).send({ message: "Notification marked as read" });
    },

    getUnreadCount: async (req: FastifyRequest, reply: FastifyReply) => {
        const count = await NotificationRepository.getUnreadCount(req.user.id);
        return reply.status(200).send({ count });
    },

};
