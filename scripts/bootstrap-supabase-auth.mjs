import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const DEFAULT_PASSWORD = "meetup123";

const DEMO_ACCOUNTS = [
  {
    email: "user@meetupreykjavik.is",
    displayName: "Kari Sigurdsson",
    slug: "kari-sigurdsson",
    accountType: "user",
    locale: "en",
  },
  {
    email: "organizer@meetupreykjavik.is",
    displayName: "Bjorn Olafsson",
    slug: "bjorn-olafsson",
    accountType: "organizer",
    locale: "en",
  },
  {
    email: "venue@meetupreykjavik.is",
    displayName: "Lebowski Bar",
    slug: "lebowski-bar",
    accountType: "venue",
    locale: "en",
  },
  {
    email: "admin@meetupreykjavik.is",
    displayName: "Super Admin",
    slug: "super-admin",
    accountType: "admin",
    locale: "en",
  },
];

function loadEnvFile() {
  const filePath = join(ROOT, ".env.local");
  const values = {};

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

async function listUsersByEmail(supabase) {
  const usersByEmail = new Map();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    for (const user of data.users) {
      if (user.email) {
        usersByEmail.set(user.email.toLowerCase(), user);
      }
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return usersByEmail;
}

async function ensureAuthUser(supabase, usersByEmail, account) {
  const existing = usersByEmail.get(account.email.toLowerCase());

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: account.displayName,
        requestedAccountType: account.accountType,
        locale: account.locale,
      },
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: {
      display_name: account.displayName,
      requestedAccountType: account.accountType,
      locale: account.locale,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function main() {
  const env = loadEnvFile();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase credentials. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const usersByEmail = await listUsersByEmail(supabase);
  const createdProfiles = [];

  for (const account of DEMO_ACCOUNTS) {
    const user = await ensureAuthUser(supabase, usersByEmail, account);

    createdProfiles.push({
      id: user.id,
      display_name: account.displayName,
      slug: account.slug,
      email: account.email,
      locale: account.locale,
      account_type: account.accountType,
      city: "Reykjavik",
      languages: account.locale === "is" ? ["is", "en"] : ["en"],
    });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(createdProfiles, { onConflict: "id" });

  if (profileError) {
    throw profileError;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        users: DEMO_ACCOUNTS.map((account) => ({
          email: account.email,
          accountType: account.accountType,
          password: DEFAULT_PASSWORD,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
