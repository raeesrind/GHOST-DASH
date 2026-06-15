import React from "react";
import { Link } from "react-router-dom";
import "./LegalPages.css";

const sections = [
    {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: (
            <>
                <p>
                    By inviting GHOST Bot ("the Bot") to a Discord server, using any of
                    its commands or features, or accessing the web dashboard at{" "}
                    <strong>ghostbot.qzz.io</strong>, you agree to be bound by these
                    Terms of Service ("ToS"). If you do not agree, you must remove the
                    bot from your server immediately and cease using the dashboard.
                </p>
                <p>
                    These terms apply to all users of the bot, including server
                    administrators, moderators, and regular members.
                </p>
            </>
        ),
    },
    {
        id: "eligibility",
        title: "2. Eligibility",
        content: (
            <>
                <p>To use GHOST Bot and its dashboard, you must:</p>
                <ul>
                    <li>
                        Be at least 13 years of age (or the age of digital consent in your
                        country, whichever is higher)
                    </li>
                    <li>
                        Comply with Discord's Terms of Service and Community Guidelines
                    </li>
                    <li>Not be a person barred from using the service under applicable laws</li>
                    <li>
                        Not use the bot for any purpose that violates local, state,
                        national, or international law
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "bot-features",
        title: "3. Features & Functionality",
        content: (
            <>
                <p>GHOST Bot provides the following feature categories:</p>
                <ul>
                    <li>
                        <strong>Moderation:</strong> ban, kick, mute, warn, purge, snipe,
                        jail, lock, lockdown, deafen, demotion, case management, and
                        AutoMod (spam, caps, links, invites, mentions, duplicates, bad
                        words, zalgo, emoji, newline filtering)
                    </li>
                    <li>
                        <strong>Leveling:</strong> XP tracking, rank cards, leaderboards,
                        level roles, XP multipliers, and cooldown configuration
                    </li>
                    <li>
                        <strong>Economy:</strong> balance tracking and transfers
                    </li>
                    <li>
                        <strong>Fun:</strong> AFK, aura, banner, ship, hug, kiss, pat,
                        song match, motivation, and 30+ other interactive commands
                    </li>
                    <li>
                        <strong>Giveaways:</strong> create, manage, and enter giveaways
                        with optional requirements (role, message count, invite count)
                    </li>
                    <li>
                        <strong>AI Chat:</strong> AI-powered conversation via Groq and
                        OpenRouter, with configurable AI channels
                    </li>
                    <li>
                        <strong>Utility:</strong> custom commands, auto-responders,
                        reaction roles, welcomer, action logs, video downloader, image
                        background removal, and server statistics
                    </li>
                    <li>
                        <strong>Role Management:</strong> role creation, configuration,
                        and assignment
                    </li>
                    <li>
                        <strong>Minigames:</strong> dungeon game
                    </li>
                    <li>
                        <strong>Owner Commands:</strong> slay system, bot administration
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "acceptable-use",
        title: "4. Acceptable Use",
        content: (
            <>
                <p>You agree to use GHOST Bot and the dashboard responsibly:</p>
                <h4>4.1 Permitted Use</h4>
                <ul>
                    <li>Using commands as intended for server management and fun</li>
                    <li>Configuring the bot through the dashboard to suit your server</li>
                    <li>Viewing public statistics and status pages</li>
                </ul>

                <h4>4.2 Prohibited Use</h4>
                <p>You may NOT:</p>
                <ul>
                    <li>
                        Attempt to crash, overload, or disrupt the bot, its backend, or
                        the dashboard
                    </li>
                    <li>
                        Exploit bugs, vulnerabilities, or design flaws for unauthorized
                        access or advantage
                    </li>
                    <li>
                        Use the bot to harass, threaten, impersonate, or spam other users
                    </li>
                    <li>
                        Use the bot to store or distribute illegal content, including
                        through custom commands, auto-responders, or reaction roles
                    </li>
                    <li>
                        Attempt to access the dashboard without authorization or using
                        another user's credentials
                    </li>
                    <li>
                        Use automation (scripts, self-bots, user-bots) to interact with
                        the bot at inhuman speeds
                    </li>
                    <li>
                        Reverse-engineer, decompile, or attempt to extract the bot's
                        source code through API manipulation
                    </li>
                    <li>
                        Use the AI chat feature to generate harmful, abusive, or illegal
                        content
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "moderation",
        title: "5. Moderation & Enforcement",
        content: (
            <>
                <h4>5.1 Bot Moderation Actions</h4>
                <p>
                    Server administrators and authorized moderators control all
                    moderation commands. The bot merely executes the actions requested
                    by those with appropriate permissions. The bot owners are not
                    responsible for how server staff use moderation features.
                </p>

                <h4>5.2 Blacklisting</h4>
                <p>
                    The bot owner reserves the right to blacklist any user or server
                    from using GHOST Bot for violation of these terms, abuse of the
                    bot's systems, or at the owner's sole discretion. Blacklisted
                    entities will be unable to use any bot features.
                </p>

                <h4>5.3 Dashboard Access Revocation</h4>
                <p>
                    Dashboard access may be revoked at any time without prior notice or
                    explanation. This includes, but is not limited to, cases of
                    unauthorized access attempts, abuse of dashboard features, or
                    violations of these terms.
                </p>

                <h4>5.4 Admin Command Restriction</h4>
                <p>
                    The bot owner may enable "Admin Commands Restricted" mode, which
                    limits certain moderation and administrative commands to bot owners
                    only. This is a global safety measure.
                </p>
            </>
        ),
    },
    {
        id: "intellectual-property",
        title: "6. Intellectual Property",
        content: (
            <>
                <p>
                    GHOST Bot and its associated branding, code, and design are the
                    intellectual property of the bot owner. You may not claim ownership
                    of, redistribute, or sell the bot or its components.
                </p>
                <p>
                    Content created by server members through custom commands,
                    auto-responders, or reaction roles remains the intellectual property
                    of those who created it.
                </p>
            </>
        ),
    },
    {
        id: "disclaimer",
        title: "7. Disclaimer of Warranty",
        content: (
            <>
                <p>
                    GHOST Bot is provided <strong>"AS IS"</strong> and{" "}
                    <strong>"AS AVAILABLE"</strong> without any warranty of any kind,
                    whether express or implied, including but not limited to:
                </p>
                <ul>
                    <li>Warranties of merchantability or fitness for a particular purpose</li>
                    <li>Warranties of uninterrupted or error-free operation</li>
                    <li>Warranties of data accuracy or completeness</li>
                </ul>
                <p>
                    No guarantee is made that the bot will be available 24/7 or that data
                    will not be lost due to hardware failure, software bugs, or other
                    unforeseen circumstances.
                </p>
            </>
        ),
    },
    {
        id: "liability",
        title: "8. Limitation of Liability",
        content: (
            <>
                <p>
                    To the maximum extent permitted by law, the bot owner shall not be
                    liable for any indirect, incidental, special, consequential, or
                    punitive damages arising from or related to:
                </p>
                <ul>
                    <li>Your use or inability to use the bot or dashboard</li>
                    <li>Any moderation actions taken by server staff using the bot</li>
                    <li>Data loss or corruption</li>
                    <li>Unauthorized access to your data through third-party services</li>
                    <li>
                        Content generated by the AI chat feature (including offensive or
                        inaccurate responses)
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "changes-tos",
        title: "9. Changes to These Terms",
        content: (
            <>
                <p>
                    We reserve the right to modify these Terms of Service at any time.
                    Changes will be posted on this page and reflected via the{" "}
                    <code>/tos</code> bot command. Continued use of the bot or dashboard
                    after changes are posted constitutes acceptance of the new terms.
                </p>
                <p>It is your responsibility to review these terms periodically.</p>
            </>
        ),
    },
    {
        id: "governing-law",
        title: "10. Governing Law",
        content: (
            <>
                <p>
                    These terms shall be governed by and construed in accordance with the
                    laws of the jurisdiction in which the bot owner operates. Any disputes
                    arising from these terms shall be resolved through binding arbitration
                    or in the courts of that jurisdiction.
                </p>
            </>
        ),
    },
    {
        id: "contact-tos",
        title: "11. Contact",
        content: (
            <>
                <p>
                    For questions, concerns, or reports of violations, contact the bot
                    owner:
                </p>
                <ul>
                    <li><strong>Discord:</strong> [OWNER_DISCORD_TAG]</li>
                    <li><strong>Support Server:</strong> [SUPPORT_SERVER_INVITE]</li>
                    <li><strong>Email:</strong> [OWNER_EMAIL]</li>
                </ul>
                <p className="note">
                    <em>
                        Replace the placeholders above with actual contact information
                        before publishing.
                    </em>
                </p>
            </>
        ),
    },
];

export default function TermsOfService() {
    const [activeSection, setActiveSection] = React.useState(sections[0].id);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                }
            },
            { rootMargin: "-80px 0px -60% 0px" }
        );

        for (const section of sections) {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="legal-page">
            <nav className="legal-sidebar">
                <h3>Terms of Service</h3>
                <ul>
                    {sections.map((s) => (
                        <li key={s.id} className={activeSection === s.id ? "active" : ""}>
                            <a href={`#${s.id}`}>{s.title}</a>
                        </li>
                    ))}
                </ul>
            </nav>

            <main className="legal-content">
                <div className="legal-header">
                    <Link to="/" className="back-link">← Back to Dashboard</Link>
                    <h1>Terms of Service</h1>
                    <p className="last-updated">Last Updated: June 13, 2026</p>
                </div>

                {sections.map((s) => (
                    <section key={s.id} id={s.id} className="legal-section">
                        <h2>{s.title}</h2>
                        {s.content}
                    </section>
                ))}
            </main>
        </div>
    );
}
