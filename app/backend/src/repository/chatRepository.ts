//@ts-ignore
import db from '../../db/db';
import { userRepository } from './userRepository';



interface Message {
    id: string;
    sender_id: number;
    content: string;
    created_at: string;
    is_own: boolean;
}

export interface Contacts {
    id: number
    display_name: string
    profile_picture: string
    image_src?: string
    relation_status: string
    content: string | null
    messsage_time: string | null
    online_status?: boolean
}

const chatRepository = {
    getContact: async (user_id: number, contact_id: number) => {
        const user = await userRepository.getUserWithRelationStatus(user_id, contact_id);
        if (!user)
            return undefined;
        const query: string = `INSERT OR IGNORE INTO contacts (user_id, contact_id) VALUES ($1, $2)`;
        await db.run(query, [user_id, contact_id]);
        return user;
    },
    createMessage: async (sender_id: number, receiver_id: number, content: string): Promise<Message | undefined> => {
        const user = await userRepository.getUserWithRelationStatus(sender_id, receiver_id);
        if (!user)
            return undefined
        if (user.relation_status === 'blocked_by' || user.relation_status === 'blocking')
            return undefined
        const query = 'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
        const result = await db.run(query, [sender_id, receiver_id, content]);
        return chatRepository.getLastMessage(sender_id, result.lastID);
    },
    getLastMessage: async (user_id: number, message_id: number): Promise<Message | undefined> => {
        const query: string = `SELECT
                                    m.id,
                                    m.sender_id,
                                    m.content,
                                    m.created_at,
                                    CASE
                                        WHEN m.sender_id = $1 THEN true
                                        WHEN m.receiver_id = $1 THEN false
                                    END as is_own
                                FROM messages m
                                WHERE m.id = $2
            `;
        return await db.get(query, [user_id, message_id]);
    },

    getContactListWithLastMessage: async (user_id: number): Promise<Contacts[]> => {
        const query: string = `
                    WITH user_relations AS(
                                SELECT 
                                    u.id,
                                    u.display_name,
                                    u.profile_picture,
                                    u.image_src,
                                    CASE WHEN b1.blocked_user_id IS NOT NULL THEN 1 ELSE 0 END as is_blocking,
                                    CASE WHEN b2.user_id IS NOT NULL THEN 1 ELSE 0 END as is_blocked_by,
                                    CASE WHEN f.sender_id IS NOT NULL THEN 1 ELSE 0 END as is_friend
                                FROM users u
                                LEFT JOIN blocks b1 ON b1.user_id = $1 AND b1.blocked_user_id = u.id
                                LEFT JOIN blocks b2 ON b2.blocked_user_id = $1 AND b2.user_id = u.id
                                LEFT JOIN friends f ON(f.sender_id = $1 AND f.receiver_id = u.id) 
                                                    OR(f.receiver_id = $1 AND f.sender_id = u.id)
                                WHERE u.id IN(SELECT contact_id FROM contacts WHERE user_id = $1)
                            ),
                            last_messages AS( --load all message not that good for performance but works for now
                                SELECT 
                                    CASE 
                                        WHEN sender_id = $1 THEN receiver_id 
                                        ELSE sender_id
                                END as contact_id,
                                content,
                                created_at as messsage_time,
                                ROW_NUMBER() OVER(
                                    PARTITION BY CASE 
                                    WHEN sender_id = $1 THEN receiver_id 
                                    ELSE sender_id 
                                END 
                                ORDER BY created_at DESC ) as rn,
                                sender_id
                                FROM messages
                                WHERE(sender_id = $1 AND receiver_id IN(SELECT contact_id FROM contacts WHERE user_id = $1))
                                OR(receiver_id = $1 AND sender_id IN(SELECT contact_id FROM contacts WHERE user_id = $1))
                            )
                                SELECT
                                    ur.id,
                                    ur.display_name,
                                    ur.profile_picture,
                                    ur.image_src,
                                CASE
                                    WHEN ur.is_blocking = 1 THEN 'blocking'
                                    WHEN ur.is_blocked_by = 1 THEN 'blocked_by'
                                    WHEN ur.is_friend = 1 THEN 'friend'
                                    ELSE 'none'
                                END AS relation_status,
                            lm.content,
                            lm.messsage_time
                            FROM user_relations ur
                            LEFT JOIN last_messages lm ON lm.contact_id = ur.id AND lm.rn = 1
                            ORDER BY lm.messsage_time DESC NULLS LAST, ur.display_name ASC;
                            `;
        return await db.all(query, [user_id]);
    },

    getMessages: async (user_id1: number, user_id2: number) => {

        const query: string = `SELECT
                                    m.id,
                                    m.sender_id,
                                    m.receiver_id,
                                    m.content,
                                    m.created_at,
                                CASE
                                    WHEN m.sender_id = $1 THEN true
                                    WHEN m.receiver_id = $1 THEN false
                                END as is_own
                                FROM messages m
                                WHERE(sender_id = $1 AND receiver_id = $2)
                                OR(sender_id = $2 AND receiver_id = $1)
                                ORDER By m.created_at DESC
                            `;
        return await db.all(query, [user_id1, user_id2]);
    },

    //FIXME: implement chat requests 
    getChatRequests: async (user_id: number) => {
        const query: string = `SELECT * from chat_requests`;
        return await db.all(query, [user_id]);
    },
}

export default chatRepository;
