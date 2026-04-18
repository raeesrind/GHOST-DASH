"""
GHOST Bot Dashboard — minimal Flask web interface.
Run separately from the bot: python GHOST-BOT/dashboard/app.py
"""

import os
import sys
import json
import aiosqlite
import asyncio
from pathlib import Path
from datetime import datetime

from flask import Flask, render_template_string, jsonify, abort

# ── Path setup ────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT.parent / "data"

app = Flask(__name__)
app.secret_key = os.getenv("DASHBOARD_SECRET_KEY", "change-me-in-production")

# ── Helpers ───────────────────────────────────────────────────────────────────

def _run_async(coro):
    """Run an async coroutine from sync Flask context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _fetch_guild_settings():
    db_path = DATA_DIR / "utility.db"
    if not db_path.exists():
        return []
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT guild_id, key, value FROM guild_settings ORDER BY guild_id"
        ) as cur:
            rows = await cur.fetchall()
    # Group by guild
    guilds = {}
    for row in rows:
        gid = row["guild_id"]
        guilds.setdefault(gid, {})[row["key"]] = row["value"]
    return [{"guild_id": gid, **settings} for gid, settings in guilds.items()]


async def _fetch_mod_stats():
    db_path = DATA_DIR / "moderation.db"
    if not db_path.exists():
        return []
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT action, COUNT(*) as count FROM mod_logs GROUP BY action ORDER BY count DESC"
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]


async def _fetch_top_xp(limit=10):
    db_path = DATA_DIR / "ghost.db"
    if not db_path.exists():
        return []
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT user_id, guild_id, xp FROM user_xp ORDER BY xp DESC LIMIT ?", (limit,)
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]


# ── HTML template ─────────────────────────────────────────────────────────────

BASE_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GHOST Bot Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; }
    header { background: #16213e; padding: 1rem 2rem; display: flex; align-items: center; gap: 1rem; }
    header h1 { color: #e94560; font-size: 1.5rem; }
    nav a { color: #a0a0c0; text-decoration: none; margin-right: 1.5rem; font-size: 0.9rem; }
    nav a:hover { color: #e94560; }
    main { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .card { background: #16213e; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .card h2 { color: #e94560; margin-bottom: 1rem; font-size: 1.1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { text-align: left; padding: 0.5rem; color: #a0a0c0; border-bottom: 1px solid #2a2a4e; }
    td { padding: 0.5rem; border-bottom: 1px solid #1a1a3e; }
    .badge { background: #e94560; color: white; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
    .stat { background: #0f3460; border-radius: 6px; padding: 1rem; text-align: center; }
    .stat .value { font-size: 2rem; font-weight: bold; color: #e94560; }
    .stat .label { font-size: 0.8rem; color: #a0a0c0; margin-top: 0.25rem; }
  </style>
</head>
<body>
  <header>
    <h1>👻 GHOST Bot</h1>
    <nav>
      <a href="/">Overview</a>
      <a href="/guilds">Guilds</a>
      <a href="/moderation">Moderation</a>
      <a href="/leaderboard">Leaderboard</a>
      <a href="/api/stats">API</a>
    </nav>
  </header>
  <main>{% block content %}{% endblock %}</main>
</body>
</html>
"""

INDEX_HTML = BASE_HTML.replace("{% block content %}{% endblock %}", """
<div class="card">
  <h2>📊 Overview</h2>
  <div class="stat-grid">
    <div class="stat"><div class="value">{{ guild_count }}</div><div class="label">Guilds Configured</div></div>
    <div class="stat"><div class="value">{{ mod_actions }}</div><div class="label">Mod Actions</div></div>
    <div class="stat"><div class="value">{{ xp_users }}</div><div class="label">XP Users (Top 10)</div></div>
    <div class="stat"><div class="value">{{ uptime }}</div><div class="label">Dashboard Up</div></div>
  </div>
</div>
<div class="card">
  <h2>🛡️ Moderation Summary</h2>
  <table>
    <tr><th>Action</th><th>Count</th></tr>
    {% for row in mod_stats %}
    <tr><td>{{ row.action }}</td><td><span class="badge">{{ row.count }}</span></td></tr>
    {% endfor %}
    {% if not mod_stats %}<tr><td colspan="2">No data yet</td></tr>{% endif %}
  </table>
</div>
""")

GUILDS_HTML = BASE_HTML.replace("{% block content %}{% endblock %}", """
<div class="card">
  <h2>🏠 Guild Settings</h2>
  <table>
    <tr><th>Guild ID</th><th>Prefix</th><th>Disabled Commands</th></tr>
    {% for g in guilds %}
    <tr>
      <td>{{ g.guild_id }}</td>
      <td>{{ g.get('prefix', '?') }}</td>
      <td>{{ g.get('disabled_commands', '[]') }}</td>
    </tr>
    {% endfor %}
    {% if not guilds %}<tr><td colspan="3">No guilds configured</td></tr>{% endif %}
  </table>
</div>
""")

LB_HTML = BASE_HTML.replace("{% block content %}{% endblock %}", """
<div class="card">
  <h2>🏆 Top XP Users</h2>
  <table>
    <tr><th>#</th><th>User ID</th><th>Guild ID</th><th>XP</th></tr>
    {% for i, row in enumerate(users) %}
    <tr>
      <td>{{ i + 1 }}</td>
      <td>{{ row.user_id }}</td>
      <td>{{ row.guild_id }}</td>
      <td><span class="badge">{{ row.xp }}</span></td>
    </tr>
    {% endfor %}
    {% if not users %}<tr><td colspan="4">No XP data yet</td></tr>{% endif %}
  </table>
</div>
""")

_start_time = datetime.utcnow()

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    guilds = _run_async(_fetch_guild_settings())
    mod_stats = _run_async(_fetch_mod_stats())
    xp_users = _run_async(_fetch_top_xp())
    uptime_secs = int((datetime.utcnow() - _start_time).total_seconds())
    uptime_str = f"{uptime_secs // 3600}h {(uptime_secs % 3600) // 60}m"
    return render_template_string(
        INDEX_HTML,
        guild_count=len(guilds),
        mod_actions=sum(r["count"] for r in mod_stats),
        xp_users=len(xp_users),
        uptime=uptime_str,
        mod_stats=mod_stats,
    )


@app.route("/guilds")
def guilds():
    guilds = _run_async(_fetch_guild_settings())
    return render_template_string(GUILDS_HTML, guilds=guilds)


@app.route("/moderation")
def moderation():
    mod_stats = _run_async(_fetch_mod_stats())
    html = BASE_HTML.replace("{% block content %}{% endblock %}", """
    <div class="card">
      <h2>🛡️ Moderation Actions</h2>
      <table>
        <tr><th>Action</th><th>Count</th></tr>
        {% for row in mod_stats %}
        <tr><td>{{ row.action }}</td><td><span class="badge">{{ row.count }}</span></td></tr>
        {% endfor %}
        {% if not mod_stats %}<tr><td colspan="2">No data yet</td></tr>{% endif %}
      </table>
    </div>
    """)
    return render_template_string(html, mod_stats=mod_stats)


@app.route("/leaderboard")
def leaderboard():
    users = _run_async(_fetch_top_xp(20))
    return render_template_string(LB_HTML, users=users, enumerate=enumerate)


@app.route("/api/stats")
def api_stats():
    guilds = _run_async(_fetch_guild_settings())
    mod_stats = _run_async(_fetch_mod_stats())
    xp_users = _run_async(_fetch_top_xp())
    return jsonify({
        "guilds_configured": len(guilds),
        "mod_actions": mod_stats,
        "top_xp_users": xp_users,
        "uptime_seconds": int((datetime.utcnow() - _start_time).total_seconds()),
    })


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("DASHBOARD_PORT", 5000))
    debug = os.getenv("DEBUG_MODE", "false").lower() == "true"
    print(f"🌐 GHOST Dashboard running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
