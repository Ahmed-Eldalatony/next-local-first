import { NextResponse } from "next/server";
import { todos } from "@/db/schema";
import { db } from "@/db";

// GET handler to load data from Turso
export async function GET() {
  try {
    const result = await db.select().from(todos);

    // Transform the result into TinyBase's expected tables format
    const formattedTodos = result.reduce((acc, todo) => {
      acc[todo.id] = todo;
      return acc;
    }, {});

    return NextResponse.json({ tables: { todos: formattedTodos } });
  } catch (error) {
    console.error("Error fetching todos from Turso:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// POST handler to save data to Turso
export async function POST(request: Request) {

  const tables = await request.json();
  try {


    const clientTodos = tables?.tables[0].todos || {};

    // Start a transaction for atomicity
    await db.transaction(async (tx) => {
      // Delete all existing todos in the database
      await tx.delete(todos);

      // Insert the new todos from the client
      const newTodos = Object.values(clientTodos);
      console.log("newTodos:", newTodos);
      if (newTodos.length > 0) {
        console.log(true)
        // Drizzle's insert expects an array of objects
        await tx.insert(todos).values(newTodos as any); // Type assertion as Drizzle might expect specific types
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing todos to Turso:", error);
    return NextResponse.json(
      { error: "Failed to sync todos" },
      { status: 500 }
    );
  }
}
