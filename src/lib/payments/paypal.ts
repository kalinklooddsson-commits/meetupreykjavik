import { env } from "@/lib/env";
import {
  TICKET_COMMISSION_RATE,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanKey,
} from "./constants";

const PAYPAL_SANDBOX_URL = "https://api-m.sandbox.paypal.com";
const PAYPAL_PRODUCTION_URL = "https://api-m.paypal.com";

function getBaseUrl() {
  return process.env.NODE_ENV === "production"
    ? PAYPAL_PRODUCTION_URL
    : PAYPAL_SANDBOX_URL;
}

export function hasPayPalEnv() {
  return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
}

export async function getAccessToken(): Promise<string> {
  const baseUrl = getBaseUrl();
  const credentials = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `PayPal OAuth2 token request failed (${response.status}): ${errorBody}`,
    );
  }

  const data = await response.json();
  return data.access_token as string;
}

export async function createTicketOrder(
  eventSlug: string,
  tierName: string,
  amountIsk: number,
  quantity: number,
) {
  const accessToken = await getAccessToken();
  const baseUrl = getBaseUrl();

  const totalAmount = amountIsk * quantity;
  const commission = Math.round(totalAmount * TICKET_COMMISSION_RATE);

  const customId = JSON.stringify({
    eventSlug,
    tierName,
    quantity,
    commission,
  });

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: `${tierName} ticket for ${eventSlug} (x${quantity})`,
          custom_id: customId,
          amount: {
            currency_code: "ISK",
            value: String(totalAmount),
            breakdown: {
              item_total: {
                currency_code: "ISK",
                value: String(totalAmount),
              },
            },
          },
          items: [
            {
              name: `${tierName} Ticket`,
              description: `Event: ${eventSlug}`,
              unit_amount: {
                currency_code: "ISK",
                value: String(amountIsk),
              },
              quantity: String(quantity),
              category: "DIGITAL_GOODS",
            },
          ],
        },
      ],
      application_context: {
        brand_name: "Meetup Reykjavik",
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `PayPal create order failed (${response.status}): ${errorBody}`,
    );
  }

  return response.json();
}

export async function captureOrder(orderId: string) {
  const accessToken = await getAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `PayPal capture order failed (${response.status}): ${errorBody}`,
    );
  }

  return response.json();
}

export async function createSubscription(
  planKey: SubscriptionPlanKey,
  userId: string,
) {
  const plan = SUBSCRIPTION_PLANS[planKey];

  if (!plan) {
    throw new Error(`Unknown subscription plan: ${planKey}`);
  }

  // Placeholder: actual PayPal billing plans require dashboard setup.
  // This returns the plan details so the UI can display them.
  return {
    planKey,
    name: plan.name,
    price_isk: plan.price_isk,
    price_usd: plan.price_usd,
    userId,
    status: "pending_setup" as const,
    message:
      "PayPal billing plans must be created in the PayPal dashboard. " +
      "Once a plan ID is available, this function will call the PayPal Subscriptions API.",
  };
}

export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  if (!env.PAYPAL_WEBHOOK_ID) {
    throw new Error("PAYPAL_WEBHOOK_ID is not configured. Cannot verify webhook signatures.");
  }

  const accessToken = await getAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"] ?? "",
        cert_url: headers["paypal-cert-url"] ?? "",
        transmission_id: headers["paypal-transmission-id"] ?? "",
        transmission_sig: headers["paypal-transmission-sig"] ?? "",
        transmission_time: headers["paypal-transmission-time"] ?? "",
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body),
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `PayPal webhook verification failed (${response.status}): ${errorBody}`,
    );
    return false;
  }

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}
