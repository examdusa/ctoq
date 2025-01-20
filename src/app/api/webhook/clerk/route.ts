import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { DeletedObjectJSON, UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";

async function handleUserCreated(userData: UserJSON) {
  try {
    // Handle user creation
    // You may want to:
    // - Create user profile in your database
    // - Set up initial preferences
    // - Send welcome email
    console.log("User created:", userData);
    const { id, first_name, last_name, email_addresses, external_accounts } = userData;
    const googleAccount = external_accounts?.find(account => account.provider === 'google');
    const googleId = googleAccount?.provider_user_id || '';

    await db.insert(userProfile).values({
      id: id,
      firstname: first_name || "",
      lastname: last_name || "",
      email: email_addresses[0].email_address,
      role: "instructor",
      appTheme: "dark",
      language: "english",
      googleid: googleId,
      createdAt: new Date(),
      instituteName: 'https://www.content2quiz.com'
    });
  } catch (error) {
    console.error("Error handling user creation:", error);
  }
}

async function handleUserUpdated(userData: UserJSON) {
  try {
    // Handle user update
    // You may want to:
    // - Update user profile in your database
    // - Sync changed data
    console.log("User updated:", userData);
    const { id, first_name, last_name, email_addresses } = userData;

    await db.update(userProfile).set({
      firstname: first_name || "",
      lastname: last_name || "",
      email: email_addresses[0].email_address,
    }).where(eq(userProfile.id, id));
  } catch (error) {
    console.error("Error handling user update:", error);
  }
}

async function handleUserDeleted(userData: DeletedObjectJSON) {
  try {
    // Handle user deletion
    // You may want to:
    // - Delete or deactivate user profile
    // - Clean up user data
    // - Cancel subscriptions
    console.log("User deleted:", userData);
    const { id } = userData;

    if (typeof id === 'string') {
      await db.delete(userProfile).where(eq(userProfile.id, id));
    } else {
      console.error("Error: User ID is undefined or not a string");
    }
  } catch (error) {
    console.error("Error handling user deletion:", error);
  }
}

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;
  switch (eventType) {
    case "user.created":
      await handleUserCreated(evt.data);
      break;
    case "user.updated":
      await handleUserUpdated(evt.data);
      break;
    case "user.deleted":
      await handleUserDeleted(evt.data);
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response("Webhook received", { status: 200 });
}
