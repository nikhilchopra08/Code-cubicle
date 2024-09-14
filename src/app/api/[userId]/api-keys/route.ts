import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // For generating unique API keys
import prismadb from "@/lib/prismadb"; // Ensure this imports your Prisma client instance

export async function POST(req: NextRequest) {
    try {
        // Extract userId from the URL parameters
        const url = new URL(req.url);
        const userId = url.pathname.split('/')[2]; // Assuming the URL is `/api/[userId]/api-keys`

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Check if the user exists
        const user = await prismadb.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate a unique API key
        const apiKey = uuidv4();

        // Get context details from request body
        const body = await req.json();
        const { contextName, contextContent } = body;

        if (!contextName || !contextContent) {
            return NextResponse.json({ error: "Context name and content are required" }, { status: 400 });
        }

        // Create the API key and context in the database
        const [newApiKey, newContext] = await prismadb.$transaction([
            prismadb.apiKey.create({
                data: {
                    key: apiKey,
                    userId: user.id,
                },
            }),
            prismadb.context.create({
                data: {
                    userId: user.id,
                    name: contextName,
                    content: contextContent,
                },
            }),
        ]);

        return NextResponse.json({ apiKey: newApiKey, context: newContext }, { status: 201 });
    } catch (e) {
        console.error("Error during API key and context creation:", e);
        return NextResponse.json({ error: "Error generating API key or saving context" }, { status: 500 });
    }
}
