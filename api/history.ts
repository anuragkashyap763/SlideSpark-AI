// // api/history.ts
// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export const config = {
//   runtime: "edge",
// };

// export default async function handler(req: Request) {
//   const { method } = req;

//   try {
//     if (method === "POST") {
//       const { userId, title, slides } = await req.json();
//       if (!userId || !slides) {
//         return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//       }

//       const { error } = await supabase
//         .from("presentations")
//         .insert([{ user_id: userId, title, slides_json: slides }]);

//       if (error) throw error;
//       return NextResponse.json({ success: true });
//     }

//     if (method === "GET") {
//       const url = new URL(req.url);
//       const userId = url.searchParams.get("userId");

//       const { data, error } = await supabase
//         .from("presentations")
//         .select("*")
//         .eq("user_id", userId)
//         .order("created_at", { ascending: false });

//       if (error) throw error;
//       return NextResponse.json({ data });
//     }

//     return NextResponse.json({ error: "Invalid method" }, { status: 405 });
//   } catch (error: any) {
//     console.error("Error in /api/history:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

















// api/history.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  const method = req.method;

  try {
    if (method === "POST") {
      const { userId, title, slides } = req.body;

      if (!userId || !slides) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const { error } = await supabase
        .from("presentations")
        .insert([{ user_id: userId, title, slides_json: slides }]);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (method === "GET") {
      const userId = req.query.userId;

      const { data, error } = await supabase
        .from("presentations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json({ data });
    }

    return res.status(405).json({ error: "Invalid method" });
  } catch (error) {
    console.error("Error in /api/history:", error);
    return res.status(500).json({ error: error.message });
  }
}

