import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

/* ---------------- High Scores ---------------- */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameMode = searchParams.get("mode") || "letter";

    // Validate game mode
    if (!["letter", "word", "story"].includes(gameMode)) {
      return NextResponse.json({ error: "Invalid game mode" }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT 
        id,
        nickname,
        score,
        letters_correct as "lettersCorrect",
        accuracy,
        time_played as "timePlayed",
        game_mode as "gameMode",
        created_at
      FROM high_scores
      WHERE game_mode = ${gameMode}
      ORDER BY score DESC
      LIMIT 10
    `;

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
    const { nickname, score, lettersCorrect, accuracy, timePlayed, gameMode } =
      body;

    if (!nickname || nickname.length > 20) {
      return NextResponse.json(
        { error: "Nickname is required and must be 20 characters or less" },
        { status: 400 }
      );
    }

    if (typeof score !== "number" || score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    if (!["letter", "word", "story"].includes(gameMode)) {
      return NextResponse.json({ error: "Invalid game mode" }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO high_scores (nickname, score, letters_correct, accuracy, time_played, game_mode)
      VALUES (${nickname}, ${score}, ${lettersCorrect}, ${accuracy}, ${timePlayed}, ${gameMode})
      RETURNING 
        id,
        nickname,
        score,
        letters_correct as "lettersCorrect",
        accuracy,
        time_played as "timePlayed",
        game_mode as "gameMode",
        created_at
    `;

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
