import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        nickname,
        score,
        letters_correct as "lettersCorrect",
        accuracy,
        time_played as "timePlayed",
        created_at
      FROM high_scores
      ORDER BY score DESC
      LIMIT 10
    `;

    // Convert timestamps to ISO strings for consistent JS Date parsing
    const formattedRows = rows.map((row) => ({
      ...row,
      createdAt: new Date(row.created_at).toISOString(),
    }));

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error("Failed to fetch high scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch high scores" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nickname, score, lettersCorrect, accuracy, timePlayed } = body;

    // Validation
    if (!nickname || nickname.length > 20) {
      return NextResponse.json(
        { error: "Nickname is required and must be 20 characters or less" },
        { status: 400 }
      );
    }

    if (typeof score !== "number" || score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO high_scores (nickname, score, letters_correct, accuracy, time_played)
      VALUES (${nickname}, ${score}, ${lettersCorrect}, ${accuracy}, ${timePlayed})
      RETURNING 
        id,
        nickname,
        score,
        letters_correct as "lettersCorrect",
        accuracy,
        time_played as "timePlayed",
        created_at
    `;

    // Convert created_at to ISO string
    const formattedRow = {
      ...rows[0],
      createdAt: new Date(rows[0].created_at).toISOString(),
    };

    return NextResponse.json(formattedRow, { status: 201 });
  } catch (error) {
    console.error("Failed to create high score:", error);
    return NextResponse.json(
      { error: "Failed to save high score" },
      { status: 500 }
    );
  }
}
