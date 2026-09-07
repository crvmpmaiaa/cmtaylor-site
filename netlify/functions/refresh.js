// "Update the site" for Craig: /.netlify/functions/refresh
//
// GET  reports the newest Substack post and whether it is on the live Essays
//      page, plus the latest production deploy.
// POST fires the Netlify build hook, which rebuilds the whole site (essays
//      pulled fresh from Substack, plus anything Craig has published).
//
// POST needs a logged-in editor. Decap logs Craig in through Netlify Identity;
// the page sends that token as a Bearer header and Netlify puts the verified
// user on context.clientContext.user. No user, no deploy. The build hook URL
// itself never leaves the server: anyone holding it could trigger deploys,
// and the repo is public.
//
// GET is open: it only repeats things that are already public (the feed, the
// live page, Netlify's public deploy list). It is open because Substack
// answers 403 to GitHub's runners, so tools/daily_deploy.py asks this
// function, which runs on Netlify's side, whether the newest essay is live.

const SITE = "0253899d-1e3f-479b-bd97-524f60191a6c";
const FEED = "https://cmtaylorstory.substack.com/feed";
const LIVE = "https://cmtaylorstory.com/essays/";
const DEPLOYS = `https://api.netlify.com/api/v1/sites/${SITE}/deploys?per_page=10`;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
           "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const reply = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

async function text(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Cache-Control": "no-cache" } });
  if (!r.ok) throw new Error(`${url} answered ${r.status}`);
  return r.text();
}

function newestPost(xml) {
  const item = xml.match(/<item>([\s\S]*?)<\/item>/);
  if (!item) return null;
  const pick = (tag) => {
    const m = item[1].match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
    return m ? m[1].trim() : "";
  };
  return { title: pick("title"), link: pick("link") };
}

async function status() {
  const out = { post: null, live: null, deploy: null };
  try {
    out.post = newestPost(await text(FEED));
    if (out.post) {
      const page = await text(`${LIVE}?t=${Date.now()}`);
      out.live = page.includes(out.post.link);
    }
  } catch (e) {
    out.feedError = String(e.message || e);
  }
  try {
    const deploys = await (await fetch(DEPLOYS)).json();
    const d = deploys.find((x) => x.context === "production");
    if (d) out.deploy = { id: d.id, state: d.state, created_at: d.created_at };
  } catch (e) {
    out.deployError = String(e.message || e);
  }
  return out;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "GET") return reply(200, await status());

  const user = context.clientContext && context.clientContext.user;
  if (!user) return reply(401, { error: "Please log in to the editor first." });

  if (event.httpMethod === "POST") {
    const hook = process.env.NETLIFY_BUILD_HOOK;
    if (!hook) return reply(500, { error: "The build hook is not configured. Tell Jack." });
    const r = await fetch(hook, { method: "POST", body: "{}",
                                  headers: { "Content-Type": "application/json" } });
    if (!r.ok) return reply(502, { error: `Netlify answered ${r.status}. Tell Jack.` });
    return reply(202, { started: true, by: user.email });
  }

  return reply(405, { error: "Method not allowed" });
};
