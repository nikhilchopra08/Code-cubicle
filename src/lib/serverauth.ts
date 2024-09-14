import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { AuthOptions } from './auth';
import prismadb from '@/lib/prismadb';

const serverAuth = async (req: NextRequest) => {
    const session = await getServerSession({ req, ...AuthOptions });

    if (!session?.user?.email) {
        throw new Error("Not signed in");
    }

    const currentUser = await prismadb.user.findUnique({
        where: {
            email: session.user.email
        }
    });

    if (!currentUser) {
        throw new Error("User not found");
    }

    return { currentUser };
}

export default serverAuth;
