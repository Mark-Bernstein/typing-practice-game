import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { rows } = await sql`
      UPDATE game_stats
      SET total_plays = total_plays + 1
      RETURNING total_plays
    `;
    const totalPlays = rows[0]?.total_plays ?? 0;
    return NextResponse.json({ totalPlays });
  } catch (error) {
    console.error("Failed to increment total plays:", error);
    return NextResponse.json(
      { error: "Failed to increment total plays" },
      { status: 500 }
    );
  }
}
