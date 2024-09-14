import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // For generating unique API keys
import prismadb from "@/lib/prismadb"; // Ensure this imports your Prisma client instance

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

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

        // Create the API key in the database
        const newApiKey = await prismadb.apiKey.create({
            data: {
                key: apiKey,
                userId: user.id,
            },
        });

        return NextResponse.json(newApiKey, { status: 201 });
    } catch (e) {
        console.error("Error during API key generation:", e);
        return NextResponse.json({ error: "Error generating API key" }, { status: 500 });
    }
}
