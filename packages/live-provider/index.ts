"use client";

import { liveProvider as liveProviderGenerator } from "@refinedev/supabase";
import { supabaseBrowserClient } from "../supabase/client";

const liveProvider = liveProviderGenerator(supabaseBrowserClient);

export default liveProvider;
