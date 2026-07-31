import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_booking",
  title: "Create booking",
  description:
    "Create a booking request with a karigar for the signed-in customer. Use search_karigars first to get a karigar id.",
  inputSchema: {
    karigar_id: z.string().describe("The karigar's id from search_karigars."),
    date: z.string().describe("Booking date in YYYY-MM-DD (IST)."),
    time: z.string().describe("Booking time slot, e.g. 10:00 (IST, hourly between 06:00 and 21:00)."),
    description: z.string().optional().describe("What needs to be done."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ karigar_id, date, time, description }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { data: karigar, error: karigarError } = await supabase
      .from("karigars")
      .select("id,name,skill")
      .eq("id", karigar_id)
      .maybeSingle();
    if (karigarError) return { content: [{ type: "text", text: karigarError.message }], isError: true };
    if (!karigar) return { content: [{ type: "text", text: "Karigar not found" }], isError: true };

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("karigar_id", karigar_id)
      .eq("date", date)
      .eq("time", time)
      .neq("status", "cancelled")
      .maybeSingle();
    if (existing) {
      return { content: [{ type: "text", text: "That slot is already booked for this karigar." }], isError: true };
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: userId,
        customer_name: profile?.name ?? ctx.getUserEmail() ?? "Customer",
        karigar_id: karigar.id,
        karigar_name: karigar.name,
        skill: karigar.skill,
        date,
        time,
        description: description ?? null,
        status: "pending",
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { booking: data },
    };
  },
});
