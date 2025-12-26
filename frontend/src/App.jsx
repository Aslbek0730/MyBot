import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const defaultUser = {
  id: 111111,
  first_name: "Demo",
  last_name: "User",
  username: "demo_user"
};

const contentTypes = ["Motivation", "Business", "Informational"];
const languages = ["English", "Russian", "Uzbek", "Turkish"];

function getTelegram() {
  return window?.Telegram?.WebApp || null;
}

async function apiRequest(path, { method = "GET", body, telegramId } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(telegramId ? { "x-telegram-id": telegramId } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("user");
  const [telegramId, setTelegramId] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [screen, setScreen] = useState("home");
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState(contentTypes[0]);
  const [language, setLanguage] = useState(languages[0]);
  const [generatedText, setGeneratedText] = useState("");
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [stats, setStats] = useState({ users: 0, channels: 0, posts: 0 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [channelInput, setChannelInput] = useState("");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const telegram = useMemo(getTelegram, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError("");

        const initData = telegram?.initData || "";
        const fallbackUser = telegram?.initDataUnsafe?.user || defaultUser;

        const payload = initData
          ? { initData }
          : { user: fallbackUser };

        const auth = await apiRequest("/auth/telegram", {
          method: "POST",
          body: payload
        });

        setRole(auth.role);
        setTelegramId(auth.telegramId);
        setUserInfo(fallbackUser);

        const channelData = await apiRequest("/channels", {
          telegramId: auth.telegramId
        });
        setChannels(channelData.channels || []);
        setSelectedChannel(channelData.channels?.[0]?.channelId || "");

        if (auth.role === "super_admin") {
          const statsData = await apiRequest("/stats", {
            telegramId: auth.telegramId
          });
          setStats(statsData);
        }
      } catch (err) {
        setError(err.message || "Failed to initialize");
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [telegram]);

  const handleGenerate = async () => {
    try {
      setError("");
      setMessage("");
      const data = await apiRequest("/generate/text", {
        method: "POST",
        telegramId,
        body: { topic: prompt, language, contentType }
      });
      setGeneratedText(data.generatedText || "");
      setScreen("preview");
    } catch (err) {
      setError(err.message || "Generation failed");
    }
  };

  const handleRegenerate = async () => {
    if (!prompt.trim()) return;
    await handleGenerate();
  };

  const handlePublish = async () => {
    try {
      setError("");
      setMessage("");
      if (!selectedChannel) {
        setError("Select a channel first");
        return;
      }
      await apiRequest("/publish", {
        method: "POST",
        telegramId,
        body: { channelId: selectedChannel, text: generatedText, prompt }
      });
      setMessage("Published successfully");
      setScreen("home");
    } catch (err) {
      setError(err.message || "Publish failed");
    }
  };

  const handleConnectChannel = async () => {
    try {
      setError("");
      setMessage("");
      const data = await apiRequest("/channels/connect", {
        method: "POST",
        telegramId,
        body: { channelId: channelInput }
      });
      const updated = [data.channel, ...channels.filter((c) => c.channelId !== data.channel.channelId)];
      setChannels(updated);
      setSelectedChannel(data.channel.channelId);
      setChannelInput("");
      setMessage("Channel connected");
    } catch (err) {
      setError(err.message || "Channel connect failed");
    }
  };

  const handleClear = () => {
    setPrompt("");
    setGeneratedText("");
  };

  const closeMiniApp = () => {
    if (telegram?.close) {
      telegram.close();
    }
  };

  if (loading) {
    return (
      <div className="app app--loading">
        <div className="ai-orb" />
        <div className="skeleton-line" />
        <p>Initializing AI Workspace...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <span className="app-title">NeonFlow</span>
          <span className="app-sub">AI content studio</span>
        </div>
        <span className={`role-tag role-tag--${role}`}>{role.replace("_", " ")}</span>
      </header>

      {error && <div className="notice notice--error">{error}</div>}
      {message && <div className="notice notice--success">{message}</div>}

      <main className="content">
        {screen === "home" && (
          <div className="panel panel--glass">
            {role === "super_admin" ? (
              <div className="dashboard">
                <div className="hero">
                  <div>
                    <p className="eyebrow">Welcome back, Admin</p>
                    <h2>Command your AI publishing flow.</h2>
                  </div>
                  <button className="primary glow" onClick={() => setScreen("create")}>
                    Create New Post
                  </button>
                </div>
                <div className="stat-grid">
                  <div className="stat-card">
                    <h3>Total Users</h3>
                    <p>{stats.users}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Channels</h3>
                    <p>{stats.channels}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Published</h3>
                    <p>{stats.posts}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="welcome">
                <p className="eyebrow">Hi, let's create something amazing</p>
                <h2>Effortless AI content for your channel.</h2>
                <div className="action-stack">
                  <button className="primary glow" onClick={() => setScreen("channels")}>
                    Connect a Channel
                  </button>
                  <button className="ghost" onClick={() => setScreen("create")}>
                    Generate Content
                  </button>
                </div>
              </div>
            )}

            <div className="action-grid">
              <button onClick={() => setScreen("create")}>Create Post</button>
              <button onClick={() => setScreen("channels")}>Channels</button>
              <button onClick={() => setScreen("settings")}>Settings</button>
            </div>
          </div>
        )}

        {screen === "create" && (
          <div className="panel panel--glass">
            <h2>Create Post</h2>
            <div className="input-card">
              <label>Prompt</label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe what you want the AI to write..."
                rows={6}
              />
            </div>

            <div className="row">
              <div>
                <label>Content type</label>
                <select value={contentType} onChange={(event) => setContentType(event.target.value)}>
                  {contentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Language</label>
                <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="button-row">
              <button className="primary glow" onClick={handleGenerate}>
                Generate with AI
              </button>
              <button className="ghost" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        )}

        {screen === "preview" && (
          <div className="panel panel--glass">
            <h2>Preview</h2>
            <label>Generated text</label>
            <textarea
              value={generatedText}
              onChange={(event) => setGeneratedText(event.target.value)}
              rows={8}
            />

            {role === "super_admin" && (
              <div className="row">
                <div>
                  <label>Publish to channel</label>
                  <select
                    value={selectedChannel}
                    onChange={(event) => setSelectedChannel(event.target.value)}
                  >
                    <option value="">Select a channel</option>
                    {channels.map((channel) => (
                      <option key={channel.channelId} value={channel.channelId}>
                        {channel.title || channel.username || channel.channelId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="button-row">
              <button className="ghost" onClick={handleRegenerate}>
                Regenerate
              </button>
              <button className="ghost" onClick={() => setScreen("create")}>
                Edit
              </button>
              {role === "super_admin" && (
                <button className="primary glow" onClick={handlePublish}>
                  Publish
                </button>
              )}
              <button className="ghost" onClick={() => setScreen("home")}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {screen === "channels" && (
          <div className="panel panel--glass">
            <h2>Channels</h2>
            <div className="channel-input">
              <input
                value={channelInput}
                onChange={(event) => setChannelInput(event.target.value)}
                placeholder="@channelusername or -1001234567890"
              />
              <button className="primary glow" onClick={handleConnectChannel}>
                Connect
              </button>
            </div>
            <div className="channel-list">
              {channels.map((channel) => (
                <div key={channel.channelId} className="channel-card">
                  <div className="channel-meta">
                    <div className="avatar" />
                    <div>
                      <h4>{channel.title || "Untitled channel"}</h4>
                      <p>{channel.username ? `@${channel.username}` : channel.channelId}</p>
                    </div>
                  </div>
                  <span className="pill pill--connected">Connected</span>
                </div>
              ))}
              {!channels.length && <p className="empty">No channels yet. Connect one.</p>}
            </div>
          </div>
        )}

        {screen === "settings" && (
          <div className="panel panel--glass">
            <h2>Settings</h2>
            <div className="settings-card">
              <div>
                <p className="label">User</p>
                <p>{userInfo?.first_name} {userInfo?.last_name}</p>
                <p className="muted">@{userInfo?.username || "unknown"}</p>
              </div>
              <div>
                <p className="label">Role</p>
                <p className="role-badge">{role.replace("_", " ")}</p>
              </div>
            </div>
            <div className="settings-toggle">
              <span>Theme</span>
              <button
                className="ghost"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </button>
            </div>
            <button className="ghost" onClick={closeMiniApp}>Close Mini App</button>
          </div>
        )}
      </main>

      <button className="fab" onClick={() => setScreen("create")} aria-label="Create post">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <nav className="bottom-nav">
        <button
          className={screen === "home" ? "active" : ""}
          onClick={() => setScreen("home")}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Home
        </button>
        <button
          className={screen === "create" ? "active" : ""}
          onClick={() => setScreen("create")}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 17.5V19h1.5l8.6-8.6-1.5-1.5L5 17.5zM16.4 7.6l1.5 1.5 1.1-1.1a1 1 0 0 0 0-1.4l-.6-.6a1 1 0 0 0-1.4 0l-1.1 1.1z"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Create
        </button>
        <button
          className={screen === "channels" ? "active" : ""}
          onClick={() => setScreen("channels")}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="6" width="16" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <rect x="4" y="13" width="16" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          Channels
        </button>
        <button
          className={screen === "settings" ? "active" : ""}
          onClick={() => setScreen("settings")}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
              <path
                d="M4 12l2-1 .5-2L4.8 7l2-2 2 .7L11 4h2l1.2 1.7 2-.7 2 2-1.7 2 .5 2 2 1v2l-2 1-.5 2 1.7 2-2 2-2-.7L13 20h-2l-1.2-1.7-2 .7-2-2 1.7-2-.5-2-2-1v-2z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                opacity="0.5"
              />
            </svg>
          </span>
          Settings
        </button>
      </nav>
    </div>
  );
}
