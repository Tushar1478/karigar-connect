import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchKarigarsTool from "./tools/search-karigars";
import listMyBookingsTool from "./tools/list-my-bookings";
import createBookingTool from "./tools/create-booking";
import cancelBookingTool from "./tools/cancel-booking";
import getMyProfileTool from "./tools/get-my-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "karigar-connect",
  title: "Karigar Connect",
  version: "0.1.0",
  instructions:
    "Tools for KarigarHub, an Indian local services marketplace connecting customers with skilled workers (karigars). Use `search_karigars` to find workers by skill/location/price, `create_booking` to request a job, `list_my_bookings` to review the signed-in user's bookings, `cancel_booking` to cancel one, and `get_my_profile` for the user's account details. All dates and times are Indian Standard Time.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchKarigarsTool,
    listMyBookingsTool,
    createBookingTool,
    cancelBookingTool,
    getMyProfileTool,
  ],
});
