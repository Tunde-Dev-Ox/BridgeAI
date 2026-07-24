import mixpanel from "mixpanel-browser";

const TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

if (TOKEN) {
  mixpanel.init(TOKEN, {
    track_pageview: true,
    persistence: "localStorage",
    ignore_dnt: false,
  });
}

export function identifyUser(user, profile) {
  if (!TOKEN || !user) return;
  mixpanel.identify(user.id);
  mixpanel.people.set({
    $email: user.email,
    $name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" "),
    ...(profile?.role_title ? { role_title: profile.role_title } : {}),
    ...(profile?.target_region ? { target_region: profile.target_region } : {}),
    ...(profile?.skills?.length ? { skills_count: profile.skills.length } : {}),
    ...(profile?.weekly_email !== undefined ? { weekly_email: profile.weekly_email } : {}),
    ...(profile?.ai_model ? { ai_model: profile.ai_model } : {}),
  });
}

export function resetIdentity() {
  if (!TOKEN) return;
  mixpanel.reset();
}

export function trackEvent(name, props = {}) {
  if (!TOKEN) return;
  mixpanel.track(name, props);
}

export default mixpanel;
