import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { AgentCard } from './components/AgentCard';
import { Zap, Layers, X } from 'lucide-react';

interface Agent {
  id: string;
  title: string;
  description: string;
  badge?: string;
  activeScenarios: number;
  processedCount: string;
  metricLabel: string;
  metricValue: string;
  successRate: string;
  cpu: string;
  latency: string;
}

const AGENTS_DATA: Agent[] = [
  {
    id: "1",
    title: "UX Audit Agent",
    description: "Analyzes user flows and interface behavior, identifies usability issues, and generates actionable UX reports.",
    badge: "Active",
    activeScenarios: 12,
    processedCount: "1.4k screens",
    metricLabel: "Issues Found",
    metricValue: "42",
    successRate: "98.5%",
    cpu: "12% CPU",
    latency: "120ms"
  },
  {
    id: "2",
    title: "Lead Qualifier",
    description: "Evaluates inbound leads against ICP criteria, extracts firmographics, and routes high-value prospects.",
    badge: "Idle",
    activeScenarios: 4,
    processedCount: "850 leads",
    metricLabel: "ICP Matches",
    metricValue: "189",
    successRate: "99.9%",
    cpu: "2% CPU",
    latency: "35ms"
  },
  {
    id: "3",
    title: "Email Follow-up",
    description: "Reviews unanswered sent threads, drafts personalized follow-up sequences, and schedules reminder tasks.",
    badge: "Running",
    activeScenarios: 25,
    processedCount: "4.2k mails",
    metricLabel: "Replies Drafted",
    metricValue: "642",
    successRate: "97.2%",
    cpu: "18% CPU",
    latency: "85ms"
  },
  {
    id: "4",
    title: "Code Refactor Engine",
    description: "Scans repository files for code smells, suggests cleaner abstractions, and auto-formats matching formatting styles.",
    badge: "1 review",
    activeScenarios: 8,
    processedCount: "92 files",
    metricLabel: "Suggestions",
    metricValue: "14",
    successRate: "94.8%",
    cpu: "35% CPU",
    latency: "340ms"
  },
  {
    id: "5",
    title: "API Load Tester",
    description: "Orchestrates concurrent virtual users, executes load test scenarios, and reports latency breaking points.",
    badge: "Stopped",
    activeScenarios: 0,
    processedCount: "48 tests",
    metricLabel: "Max RPS",
    metricValue: "8.5k",
    successRate: "100%",
    cpu: "0% CPU",
    latency: "0ms"
  },
  {
    id: "6",
    title: "Database Caretaker",
    description: "Monitors slow-running queries, auto-generates missing index configurations, and purges transient tables.",
    badge: "Crucial",
    activeScenarios: 15,
    processedCount: "230 GBs",
    metricLabel: "Queries Tuned",
    metricValue: "95",
    successRate: "99.1%",
    cpu: "8% CPU",
    latency: "15ms"
  },
  {
    id: "7",
    title: "SEO Article Synthesizer",
    description: "Gathers trending web keywords, formats readable content layouts, and writes copy tailored for indexing.",
    badge: "Generating",
    activeScenarios: 2,
    processedCount: "82 posts",
    metricLabel: "SEO Score Base",
    metricValue: "89/100",
    successRate: "96.4%",
    cpu: "22% CPU",
    latency: "1.2s"
  },
  {
    id: "8",
    title: "Vulnerability Auditor",
    description: "Traces logic dependencies to spot dependency vulnerabilities, secrets leaks, and compliance gaps.",
    badge: "Secured",
    activeScenarios: 30,
    processedCount: "411 packages",
    metricLabel: "CVSS Audits",
    metricValue: "3",
    successRate: "99.8%",
    cpu: "5% CPU",
    latency: "22ms"
  },
  {
    id: "9",
    title: "Support Mood Analyst",
    description: "Evaluates support tickets for emotional tone, flags frustrated users, and auto-escalates critical chats.",
    badge: "Real-time",
    activeScenarios: 110,
    processedCount: "11k sessions",
    metricLabel: "Frustration Flags",
    metricValue: "18",
    successRate: "98.9%",
    cpu: "14% CPU",
    latency: "10ms"
  },
  {
    id: "10",
    title: "Cloud Billing Optimizer",
    description: "Scans active server allocations, flags underutilized nodes, and recommends downsizing budgets.",
    badge: "Saving $",
    activeScenarios: 6,
    processedCount: "3 networks",
    metricLabel: "Saved Monthly",
    metricValue: "$1,450",
    successRate: "100%",
    cpu: "1% CPU",
    latency: "40ms"
  },
  {
    id: "11",
    title: "Incident Triage Agent",
    description: "Correlates alerts across services, ranks incidents by blast radius, and pages the right on-call responder.",
    badge: "Active",
    activeScenarios: 17,
    processedCount: "312 incidents",
    metricLabel: "MTTI Reduced",
    metricValue: "41%",
    successRate: "99.4%",
    cpu: "9% CPU",
    latency: "18ms"
  },
  {
    id: "12",
    title: "Knowledge Base Curator",
    description: "Deduplicates support documentation, rewrites stale articles, and auto-links related procedures.",
    badge: "Idle",
    activeScenarios: 3,
    processedCount: "2.7k articles",
    metricLabel: "Articles Refreshed",
    metricValue: "208",
    successRate: "97.8%",
    cpu: "4% CPU",
    latency: "55ms"
  },
  {
    id: "13",
    title: "Churn Radar",
    description: "Scores customer health signals, predicts churn risk in real time, and drafts retention outreach plans.",
    badge: "Running",
    activeScenarios: 22,
    processedCount: "9.6k customers",
    metricLabel: "At-Risk Caught",
    metricValue: "156",
    successRate: "98.1%",
    cpu: "11% CPU",
    latency: "95ms"
  },
  {
    id: "14",
    title: "Onboarding Copilot",
    description: "Guides new users through first-run tasks, surfaces contextual tips, and schedules follow-up nudges.",
    badge: "Active",
    activeScenarios: 31,
    processedCount: "5.1k users",
    metricLabel: "Day-7 Activation",
    metricValue: "+18%",
    successRate: "99.2%",
    cpu: "7% CPU",
    latency: "32ms"
  },
  {
    id: "15",
    title: "Compliance Reporter",
    description: "Generates audit-ready compliance reports, tracks control evidence, and flags policy drift early.",
    badge: "Scheduled",
    activeScenarios: 5,
    processedCount: "68 audits",
    metricLabel: "Controls Verified",
    metricValue: "410",
    successRate: "100%",
    cpu: "3% CPU",
    latency: "210ms"
  },
  {
    id: "16",
    title: "Data Pipeline Healer",
    description: "Detects broken ETL stages, backfills missing partitions, and restores downstream freshness SLAs.",
    badge: "Crucial",
    activeScenarios: 19,
    processedCount: "44 jobs",
    metricLabel: "SLA Restores",
    metricValue: "37",
    successRate: "98.7%",
    cpu: "27% CPU",
    latency: "180ms"
  },
  {
    id: "17",
    title: "Social Listening Agent",
    description: "Monitors brand mentions, clusters sentiment waves, and drafts response copy for trending topics.",
    badge: "Real-time",
    activeScenarios: 76,
    processedCount: "120k mentions",
    metricLabel: "Sentiment Waves",
    metricValue: "14",
    successRate: "96.9%",
    cpu: "16% CPU",
    latency: "120ms"
  },
  {
    id: "18",
    title: "Inventory Forecaster",
    description: "Predicts per-SKU stock levels, suggests reorder quantities, and balances warehouse distribution.",
    badge: "Active",
    activeScenarios: 12,
    processedCount: "3.3k SKUs",
    metricLabel: "Forecast Precision",
    metricValue: "94.2%",
    successRate: "98.4%",
    cpu: "13% CPU",
    latency: "88ms"
  },
  {
    id: "19",
    title: "Meeting Digest Agent",
    description: "Transcribes calls, extracts decisions and action items, and syncs ownership to task trackers.",
    badge: "Running",
    activeScenarios: 28,
    processedCount: "1.1k meetings",
    metricLabel: "Actions Captured",
    metricValue: "2.9k",
    successRate: "99.6%",
    cpu: "10% CPU",
    latency: "64ms"
  },
  {
    id: "20",
    title: "Credential Rotator",
    description: "Rotates expiring secrets, enforces key lifecycle policies, and verifies post-rotation access.",
    badge: "Secured",
    activeScenarios: 9,
    processedCount: "540 secrets",
    metricLabel: "Rotations Done",
    metricValue: "1,210",
    successRate: "100%",
    cpu: "2% CPU",
    latency: "25ms"
  },
  {
    id: "21",
    title: "Localization Checker",
    description: "Scans UI strings for translation gaps, validates locale formatting, and flags context-mismatched copy.",
    badge: "Review",
    activeScenarios: 7,
    processedCount: "8.8k strings",
    metricLabel: "Gaps Fixed",
    metricValue: "63",
    successRate: "97.5%",
    cpu: "6% CPU",
    latency: "47ms"
  },
  {
    id: "22",
    title: "Fraud Signal Detector",
    description: "Scores transactions against behavioral baselines, flags anomalies, and queues reviewer cases.",
    badge: "Real-time",
    activeScenarios: 94,
    processedCount: "410k txns",
    metricLabel: "Fraud Catches",
    metricValue: "87",
    successRate: "99.9%",
    cpu: "24% CPU",
    latency: "9ms"
  },
  {
    id: "23",
    title: "Content QA Sweeper",
    description: "Crawls published pages for broken links, stale screenshots, and accessibility regressions.",
    badge: "Idle",
    activeScenarios: 2,
    processedCount: "15k pages",
    metricLabel: "Issues Found",
    metricValue: "212",
    successRate: "98.8%",
    cpu: "5% CPU",
    latency: "140ms"
  },
  {
    id: "24",
    title: "Capacity Planner",
    description: "Simulates traffic spikes, forecasts resource needs, and drafts scaling recommendations.",
    badge: "Saving $",
    activeScenarios: 8,
    processedCount: "1.9k forecasts",
    metricLabel: "Headroom Added",
    metricValue: "32%",
    successRate: "99.3%",
    cpu: "12% CPU",
    latency: "300ms"
  },
  {
    id: "25",
    title: "Release Sentinel",
    description: "Observes deployment health, compares error baselines, and triggers safe rollback procedures.",
    badge: "Active",
    activeScenarios: 16,
    processedCount: "78 releases",
    metricLabel: "Rollbacks Automated",
    metricValue: "6",
    successRate: "100%",
    cpu: "8% CPU",
    latency: "22ms"
  }
];

// Starfield spherical distribution - amber/lavender dust particles
function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 9 + Math.random() * 8; // Sphere shell size 9 to 17

      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.005) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#818cf8"
        sizeAttenuation={true}
        transparent
        opacity={0.35}
      />
    </points>
  );
}

// 360-degree Custom Look Controller
function CelestialRig({
  yaw,
  pitch,
  zoom,
  focusedId,
  agents,
  driftRef
}: {
  yaw: number;
  pitch: number;
  zoom: number;
  focusedId: string | null;
  agents: Agent[];
  driftRef: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 0));
  const cameraEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const cameraQuat = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    // Coordinated left-to-right slow drift (positive radians angle increment)
    if (!focusedId) {
      driftRef.current += delta * 0.04;
    }

    if (focusedId) {
      // Find card layout pos
      const index = agents.findIndex(a => a.id === focusedId);
      if (index !== -1) {
        const baseAngle = (index / agents.length) * Math.PI * 2;
        const angle = baseAngle + driftRef.current;
        const Radius = 5.25 + (index % 2) * 1.55;

        // Concentric layout matches AgentCard.tsx
        const cardX = Math.sin(angle) * Radius;
        const cardZ = Math.cos(angle) * Radius;
        const cardY = ((index % 5) - 2) * 1.45;

        // Position camera in front of targeted card looking inward (very close view)
        const offsetFactor = 1.15;
        const targetX = Math.sin(angle) * (Radius - offsetFactor);
        const targetZ = Math.cos(angle) * (Radius - offsetFactor);
        const targetY = cardY;

        targetCamPos.current.set(targetX, targetY, targetZ);
        camera.position.lerp(targetCamPos.current, 0.08);

        // Point directly at card position
        const targetLook = new THREE.Vector3(cardX, cardY, cardZ);

        const m = new THREE.Matrix4();
        m.lookAt(camera.position, targetLook, camera.up);
        const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
        camera.quaternion.slerp(targetQuat, 0.08);
      }
    } else {
      // Calculate look direction from current Yaw and Pitch
      cameraEuler.current.set(pitch, yaw, 0, 'YXZ');
      cameraQuat.current.setFromEuler(cameraEuler.current);

      camera.quaternion.slerp(cameraQuat.current, 0.1);

      // Scroll zoom translates camera forward in look direction
      const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraQuat.current);

      targetCamPos.current.copy(forwardDir).multiplyScalar(zoom);
      camera.position.lerp(targetCamPos.current, 0.1);
    }
  });

  return null;
}

function App() {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [zoom, setZoom] = useState(0); // Starts at 0 (center of sphere layout)
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const driftRef = useRef(0); // Coordinated horizontal rotation angle drift

  // Filter agents (all agents visible now)
  const filteredAgents = AGENTS_DATA;

  // Bind mouse drag to look around and scroll to zoom in/out
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (focusedId) return; // Prevent zooming during active cards interaction
      setZoom((prev) => {
        // Limit zoom from 0 (centered) to 13.5 (outer card shells depth)
        // Increased scroll speed (multiplier 0.020) for smooth rapid scroll
        const next = prev - e.deltaY * 0.020;
        return Math.max(0, Math.min(13.5, next));
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [focusedId]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (focusedId) return; // Disable looking around when interacting with card
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || focusedId) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Faster click & drag look-around speed (multiplier 0.007)
    setYaw((prev) => prev - dx * 0.007);
    setPitch((prev) => Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev - dy * 0.007)));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="w-screen h-screen bg-[#f1f3f9] text-slate-800 flex flex-col overflow-hidden select-none font-sans relative">
      {/* SHARDS OF NEURAL NEBULA BACKGROUND GLOWS (Bright Theme) */}
      <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-purple-200/20 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] rounded-full bg-emerald-250/20 blur-[130px] pointer-events-none"></div>


      {/* DRAG AND SCROLL INSTRUCTIONS */}
      {!focusedId && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center animate-fade-in">
          <p className="text-[9px] uppercase tracking-[0.25em] text-emerald-600 font-bold mb-1">Celestial Mode</p>
          <h2 className="text-md font-bold text-slate-800 mb-1">Drag Mouse to Look Around • Scroll to Move In & Out</h2>
          <p className="text-[11px] text-slate-500">You are at the center of the celestial grid. Agents surround you in 360° space.</p>
        </div>
      )}

      {/* FLY BACK CONTROLS (X button in focus mode) */}
      {focusedId && (
        <button
          onClick={() => setFocusedId(null)}
          className="absolute top-8 right-8 z-30 w-10 h-10 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 border border-slate-200 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Exit Focus Mode (Close)"
        >
          <X size={20} />
        </button>
      )}

      {/* 360 VIEWPORT CONTAINER */}
      <div
        className="flex-1 w-full h-full relative outline-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <Canvas camera={{ position: [0, 0, 0], fov: 60 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} color="#fef08a" />
          <directionalLight position={[-10, 5, -10]} intensity={0.6} color="#d8b4fe" />
          <Environment preset="studio" />

          {/* Spherically Arranged Agent Cards */}
          <group>
            {filteredAgents.map((agent, index) => {
              const total = filteredAgents.length;
              return (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  title={agent.title}
                  description={agent.description}
                  badge={agent.badge}
                  index={index}
                  total={total}
                  driftRef={driftRef}
                  isFocused={focusedId === agent.id}
                  isDimmed={focusedId !== null && focusedId !== agent.id}
                  onClickFocus={() => setFocusedId(agent.id)}
                  successRate={agent.successRate}
                  cpu={agent.cpu}
                  latency={agent.latency}
                  activeScenarios={agent.activeScenarios}
                  processedCount={agent.processedCount}
                  metricLabel={agent.metricLabel}
                  metricValue={agent.metricValue}
                />
              );
            })}
          </group>

          <Starfield />

          {/* Celestial Motion Rig */}
          <CelestialRig yaw={yaw} pitch={pitch} zoom={zoom} focusedId={focusedId} agents={filteredAgents} driftRef={driftRef} />
        </Canvas>
      </div>

      {/* FOOTER */}
      {!focusedId && (
        <footer className="h-10 border-t border-slate-200 bg-white/75 backdrop-blur-md flex items-center justify-between px-8 text-[11px] text-slate-500 z-20 shrink-0">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Zap size={11} className="text-emerald-500" /> Active Nodes: <strong className="text-slate-700">140 online</strong></span>
            <span className="flex items-center gap-1.5"><Layers size={11} className="text-purple-600" /> Mesh density: <strong className="text-slate-700">Celestial Ring</strong></span>
          </div>
          <div>
            <span>Drag to look in any direction • Scroll wheel zooms • Click to work with agent</span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
