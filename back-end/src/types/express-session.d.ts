import 'express-session';

declare module 'express-session'{
    interface SessionData {
        userID?: number;
        email?: string;
        username: string;
    }
}

declare global {
    namespace Express{
        interface Request{
            session : Session & Partial<SessionData>
        }
    }
}