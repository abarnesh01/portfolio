import { useState, useEffect, useRef } from "react";
import { auth, loginWithGoogle, logout, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

export default function ChatRoom() {
  const isFirebaseActive = !!auth && !!db;
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSandbox, setIsSandbox] = useState(!isFirebaseActive);
  const [alias, setAlias] = useState("Guest_Agent_" + Math.floor(1000 + Math.random() * 9000));
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cek login (hanya jika Firebase aktif)
  useEffect(() => {
    if (!isFirebaseActive) {
      // Offline / Sandbox Mode: Initialize default mock user
      setUser({
        uid: "local-user",
        displayName: alias,
        photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=" + alias
      });
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, [alias, isFirebaseActive]);

  // Ambil pesan
  useEffect(() => {
    if (isSandbox) {
      // Load from localStorage or set default welcome message
      const localMsgs = localStorage.getItem("aegis_sandbox_messages");
      if (localMsgs) {
        setMessages(JSON.parse(localMsgs));
      } else {
        const welcomeMsgs = [
          {
            id: "system-1",
            text: "SYSTEM INITIALIZED: A.E.G.I.S. Security Sandbox Mode v1.0.4",
            displayName: "SYSTEM",
            photoURL: "",
            uid: "system",
            createdAt: Date.now()
          },
          {
            id: "welcome-1",
            text: "Welcome, Agent. I am A.E.G.I.S. (Autonomous Electronic Guard & Intelligence System). You are running in offline Sandbox Mode. Type '/help' to list security terminal commands or chat with me directly.",
            displayName: "A.E.G.I.S. (AI)",
            photoURL: "https://api.dicebear.com/7.x/identicon/svg?seed=aegis",
            uid: "aegis",
            createdAt: Date.now() + 100
          }
        ];
        setMessages(welcomeMsgs);
        localStorage.setItem("aegis_sandbox_messages", JSON.stringify(welcomeMsgs));
      }
    } else {
      // Firebase real-time messages
      if (!db) return;
      const q = query(collection(db, "messages"), orderBy("createdAt"));
      const unsub = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [isSandbox]);

  // Simulasikan respon AI A.E.G.I.S.
  const handleAegisReply = (userText) => {
    const text = userText.toLowerCase().trim();
    let replyText = "";

    if (text.startsWith("/")) {
      const command = text.split(" ")[0];
      switch (command) {
        case "/help":
          replyText = `AVAILABLE COMMANDS:
• /help - Displays this help message.
• /nmap - Scans the host system for active services and ports.
• /hack - Executes a mock decryption sequence on simulated target.
• /projects - Summarizes current threat prevention projects.
• /skills - Displays Abarnesh's certified security tool stack.
• /clear - Clears all terminal logs and resets sandbox.`;
          break;
        case "/nmap":
          replyText = `Initiating port scan on localhost (127.0.0.1)...
PORT      STATE  SERVICE     VERSION
22/tcp    open   ssh         OpenSSH 8.9p1 (Ubuntu)
80/tcp    open   http        Nginx 1.22.0 (React Portfolio)
443/tcp   open   https       SSL Handshake Active
8501/tcp  open   streamlit   AI Anomaly Dashboard (Active)
Scan finished: 4 open ports found. Host is secure.`;
          break;
        case "/hack":
          replyText = `ACCESSING PORTFOLIO MAIN FRAME...
[████████████████] 100% SECURE BYPASS
Connection established: Decrypting files...
• CV.pdf: [ACCESSIBLE]
• Threat_Detection_Model: [READ-ONLY]
Welcome to the core database, Operator.`;
          break;
        case "/projects":
          replyText = `ABARNESH'S ACTIVE DEVELOPMENTS:
1. PII Masking Tool: OCR-based utility that auto-masks sensitive data in PDFs using EasyOCR.
2. Civic AI Shield: Advanced real-time threat monitor for CCTV anomaly alerts.
3. AI Network Traffic Monitoring: Machine learning SIEM dashboard.`;
          break;
        case "/skills":
          replyText = `SECURITY STACK PROFICIENCY:
• Python / Scripting: 90% (Custom Security Automation Tools)
• Bash & Linux: 85% (Advanced Hardening & Terminal Operations)
• React & Node.js: 75% (Full-Stack Secure Architectures)
• EasyOCR & OpenCV: 65% (Computer Vision Anomaly Detection)`;
          break;
        case "/clear":
          setTimeout(() => {
            const reset = [
              {
                id: "system-reset",
                text: "SYSTEM RE-INITIALIZED: Sandbox logs cleared.",
                displayName: "SYSTEM",
                photoURL: "",
                uid: "system",
                createdAt: Date.now()
              }
            ];
            setMessages(reset);
            localStorage.setItem("aegis_sandbox_messages", JSON.stringify(reset));
          }, 200);
          return;
        default:
          replyText = `Command '${command}' not recognized. Type '/help' for a full list of commands.`;
      }
    } else {
      // Natural conversational answers
      if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
        replyText = "Greetings, Agent. Cybersecurity databases are operational. How can I assist you with Abarnesh's portfolio details?";
      } else if (text.includes("cyber") || text.includes("security") || text.includes("threat") || text.includes("soc")) {
        replyText = "Abarnesh specializes in threat detection, SOC operations, anomaly analysis, and Linux administration. Feel free to explore his projects above to see his works.";
      } else if (text.includes("resume") || text.includes("cv") || text.includes("download")) {
        replyText = "Abarnesh's CV is ready for download in the Hero section at the top of the page. You can click 'Download CV' to review his qualifications.";
      } else if (text.includes("contact") || text.includes("email") || text.includes("hire") || text.includes("phone")) {
        replyText = "You can connect with Abarnesh via email (abarnesh772@gmail.com) or phone (+91 99442 54589). Quick access buttons are situated right below this console.";
      } else {
        replyText = "Analyzing input... Threat level: Nominal. System status: Online. I am programmed to simulate responses. For technical questions, try typing '/help' or ask about his 'skills', 'projects', or 'contact'.";
      }
    }

    // Append AI reply with a small delay for simulation
    setTimeout(() => {
      setMessages((prev) => {
        const newMsgs = [
          ...prev,
          {
            id: "aegis-" + Date.now(),
            text: replyText,
            displayName: "A.E.G.I.S. (AI)",
            photoURL: "https://api.dicebear.com/7.x/identicon/svg?seed=aegis",
            uid: "aegis",
            createdAt: Date.now()
          }
        ];
        if (isSandbox) {
          localStorage.setItem("aegis_sandbox_messages", JSON.stringify(newMsgs));
        }
        return newMsgs;
      });
    }, 800);
  };

  // Kirim pesan
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      uid: user?.uid || "guest",
      displayName: user?.displayName || alias,
      photoURL: user?.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=" + alias,
      createdAt: isSandbox ? Date.now() : serverTimestamp()
    };

    if (isSandbox) {
      const updatedMsgs = [
        ...messages,
        { id: "user-" + Date.now(), ...userMessage }
      ];
      setMessages(updatedMsgs);
      localStorage.setItem("aegis_sandbox_messages", JSON.stringify(updatedMsgs));
      setMessage("");
      // Trigger AI agent response
      handleAegisReply(message);
    } else {
      if (!db || !user) return;
      await addDoc(collection(db, "messages"), userMessage);
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-md border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,245,255,0.1)] relative overflow-hidden transition-all duration-300">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xl font-mono font-bold tracking-widest text-cyan-400 uppercase">
            🛡️ A.E.G.I.S. Cyber Sandbox
          </h2>
          <span className="text-[10px] bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded font-mono">
            {isSandbox ? "OFFLINE SIMULATOR" : "FIREBASE SYNC ACTIVE"}
          </span>
        </div>

        {/* Mode Toggle & Alias controls */}
        <div className="flex items-center gap-4">
          {isFirebaseActive && (
            <button
              onClick={() => setIsSandbox(!isSandbox)}
              className="text-xs font-mono border border-cyan-500/50 hover:bg-cyan-500/10 px-3 py-1 rounded-full text-cyan-400 transition-colors"
            >
              Toggle {isSandbox ? "Firebase Mode" : "Sandbox Mode"}
            </button>
          )}

          {isSandbox && (
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span>Agent ID:</span>
              {isEditingAlias ? (
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  onBlur={() => setIsEditingAlias(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingAlias(false)}
                  className="bg-zinc-800 text-white px-2 py-0.5 rounded border border-cyan-500/50 outline-none w-28"
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => setIsEditingAlias(true)}
                  className="text-white hover:text-cyan-400 cursor-pointer underline decoration-dotted"
                  title="Click to rename"
                >
                  {alias}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="h-96 overflow-y-auto border border-white/10 p-4 rounded-2xl bg-black/60 mb-6 font-mono text-sm space-y-4 shadow-inner custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.uid === user?.uid || msg.uid === "local-user";
          const isSystem = msg.uid === "system";
          const isAegis = msg.uid === "aegis";

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center py-1">
                <span className="text-[10px] text-zinc-500 bg-zinc-800/40 px-3 py-1 rounded-full uppercase tracking-widest">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isMe ? "justify-end text-right" : "justify-start text-left"}`}
            >
              {!isMe && msg.photoURL && (
                <img
                  src={msg.photoURL}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-cyan-500/30 bg-zinc-800"
                />
              )}
              <div className="max-w-[80%] flex flex-col">
                <div
                  className={`text-[10px] text-gray-500 mb-1 ${isAegis ? "text-purple-400 font-bold" : ""} ${
                    isMe ? "text-right" : "text-left"
                  }`}
                >
                  {msg.displayName}
                </div>
                <div
                  className={`p-3 rounded-2xl whitespace-pre-wrap ${
                    isMe
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-tr-none"
                      : isAegis
                      ? "bg-purple-900/10 text-purple-300 border border-purple-500/30 rounded-tl-none"
                      : "bg-zinc-800/50 text-white border border-white/5 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              {isMe && msg.photoURL && (
                <img
                  src={msg.photoURL}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-cyan-500/30 bg-zinc-800"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={sendMessage} className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-sm pointer-events-none">
            $
          </span>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isSandbox
                ? "Type message or '/help' for sandbox commands..."
                : "Type message to broadcast..."
            }
            className="w-full pl-8 pr-4 py-3 rounded-xl bg-zinc-900/80 text-white border border-white/10 focus:border-cyan-500/50 outline-none font-mono text-sm focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono font-bold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer"
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
}
