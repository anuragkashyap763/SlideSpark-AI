// api/history.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const { method } = req;

  try {
    if (method === "POST") {
      const { userId, title, slides } = await req.json();
      if (!userId || !slides) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }

      const { error } = await supabase
        .from("presentations")
        .insert([{ user_id: userId, title, slides_json: slides }]);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (method === "GET") {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");

      const { data, error } = await supabase
        .from("presentations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid method" }, { status: 405 });
  } catch (error: any) {
    console.error("Error in /api/history:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}