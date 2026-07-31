import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_karigars",
  title: "Search karigars",
  description:
    "Search available karigars (skilled workers) by skill, location, availability, and maximum hourly price.",
  inputSchema: {
    skill: z.string().optional().describe("Skill to filter by, e.g. Electrician, Plumber, Carpenter."),
    location: z.string().optional().describe("Location substring to filter by."),
    available_only: z.boolean().optional().describe("Only return karigars marked available."),
    max_price: z.number().optional().describe("Maximum hourly price in INR."),
    limit: z.number().optional().describe("Maximum number of results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ skill, location, available_only, max_price, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("karigars")
      .select("id,name,skill,location,price,rating,review_count,experience,availability,completed_jobs,description")
      .order("rating", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 10, 1), 50));

    if (skill) query = query.ilike("skill", `%${skill}%`);
    if (location) query = query.ilike("location", `%${location}%`);
    if (available_only) query = query.eq("availability", "available");
    if (typeof max_price === "number") query = query.lte("price", max_price);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { karigars: data ?? [] },
    };
  },
});
