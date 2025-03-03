
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { connect } from "https://deno.land/x/redis@v0.29.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const REDIS_URL = Deno.env.get("REDIS_URL") || "";
const REDIS_PASSWORD = Deno.env.get("REDIS_PASSWORD") || "";

// Connect to Redis
const getRedisClient = async () => {
  try {
    const client = await connect({
      hostname: REDIS_URL,
      password: REDIS_PASSWORD,
    });
    return client;
  } catch (err) {
    console.error("Redis connection error:", err);
    return null;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const redisClient = await getRedisClient();
    
    if (!redisClient) {
      return new Response(
        JSON.stringify({ error: "Failed to connect to Redis" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { action, key, data, ttl, tags } = await req.json();

    let result;
    let response;

    console.log(`Processing ${action} for key: ${key}`);

    switch (action) {
      case "get":
        result = await redisClient.get(key);
        response = result ? JSON.parse(result) : null;
        break;
      
      case "set":
        // Store data with TTL
        await redisClient.set(key, JSON.stringify(data));
        if (ttl) {
          await redisClient.expire(key, ttl);
        }
        
        // Store tags for later invalidation
        if (tags && Array.isArray(tags)) {
          for (const tag of tags) {
            await redisClient.sAdd(`tag:${tag}`, key);
          }
        }
        
        response = { success: true };
        break;
      
      case "invalidate":
        if (tags && Array.isArray(tags)) {
          for (const tag of tags) {
            // Get all keys for this tag
            const keys = await redisClient.sMembers(`tag:${tag}`);
            
            // Delete all those keys
            if (keys.length > 0) {
              await redisClient.del(...keys);
              // Clean up the tag set
              await redisClient.del(`tag:${tag}`);
            }
          }
        }
        
        response = { success: true };
        break;
      
      default:
        response = { error: "Invalid action" };
    }

    await redisClient.quit();

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
