import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import clsx from 'clsx';
import { Settings2, BarChart3, ChevronLeft, Save } from 'lucide-react';

interface AgentCardProps {
    id: string;
    title: string;
    description: string;
    badge?: string;
    isFocused: boolean;
    onClickFocus?: () => void;
    successRate: string;
    cpu: string;
    latency: string;
    activeScenarios: number;
    processedCount: string;
    metricLabel: string;
    metricValue: string;
    isDimmed?: boolean;
    index: number;
    total: number;
    driftRef: React.MutableRefObject<number>;
}

export function AgentCard({
    id,
    title,
    description,
    badge,
    isFocused,
    onClickFocus,
    successRate,
    cpu,
    latency,
    activeScenarios,
    processedCount,
    metricLabel,
    metricValue,
    isDimmed,
    index,
    total,
    driftRef
}: AgentCardProps) {
    const [flipped, setFlipped] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const groupRef = useRef<THREE.Group>(null);
    const domRef = useRef<HTMLDivElement>(null);

    // Form states matching original HTML advanced view
    const [maxItems, setMaxItems] = useState(50);
    const [severity, setSeverity] = useState("moderate");
    const [channel, setChannel] = useState("slack");

    // Keep state sync'd when card focuses/unfocuses. 
    // If user clicks outside, reset to card front stats after animation
    useEffect(() => {
        if (!isFocused) {
            setFlipped(false);
            const timer = setTimeout(() => {
                setShowSettings(false);
            }, 400); // Wait for flip transition to end
            return () => clearTimeout(timer);
        }
    }, [isFocused]);

    const handleCardClick = (e: React.MouseEvent) => {
        // If not focused, clicking zooms card into view. Do not flip
        if (!isFocused) {
            e.stopPropagation();
            if (onClickFocus) {
                onClickFocus();
            }
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        // Double clicking focused card flips it
        if (isFocused) {
            e.stopPropagation();
            setFlipped(prev => !prev);
        }
    };

    const triggerFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFocused) {
            setFlipped(prev => !prev);
        } else {
            if (onClickFocus) onClickFocus();
        }
    };

    const handleAdvancedClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowSettings(true);
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSettings(false);
    };

    // Cylinder dynamic layout coordinate math (reduced radius range for larger visible scales)
    const cardRadius = 5.25 + (index % 2) * 1.55;
    const cardY = ((index % 5) - 2) * 1.45;    // vertical tiers for high cylinder spread

    useFrame((state) => {
        const group = groupRef.current;
        if (!group) return;

        // Coordinated cylinder orbital rotation
        const angle = (index / total) * Math.PI * 2 + driftRef.current;
        const baseX = Math.sin(angle) * cardRadius;
        const baseZ = Math.cos(angle) * cardRadius;

        let swayX = 0;
        let swayY = 0;

        if (!isFocused) {
            const t = state.clock.getElapsedTime();
            // Jiggles more and faster when mouse hovers on it
            const amp = isHovered ? 0.18 : 0.04;
            const speed = isHovered ? 2.5 : 0.55;
            const idCode = id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

            // Microscopic smooth swaying
            swayX = Math.sin(t * speed + idCode * 0.7) * amp;
            swayY = Math.sin(t * speed * 0.82 + idCode * 1.35) * amp;
        }

        group.position.x = baseX + swayX;
        group.position.y = cardY + swayY;
        group.position.z = baseZ;

        // Camera position & forward vectors
        const camPos = state.camera.position;
        const toCard = new THREE.Vector3().copy(group.position).sub(camPos);
        const toCardNorm = toCard.clone().normalize();
        const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);

        // dot: 1.0 (exactly centered in viewport) to 0.77 (edges)
        const dot = toCardNorm.dot(camForward);

        // Calculate facing rotations
        const toCamX = camPos.x - group.position.x;
        const toCamZ = camPos.z - group.position.z;
        const facingCamRot = Math.atan2(toCamX, toCamZ);
        const facingCylRot = angle + Math.PI;

        const qCam = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), facingCamRot);
        const qCyl = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), facingCylRot);

        // Central cards run Cam direction (completely flat), edge cards blend to Cyl layout (curved)
        // t = 1 in screen center, blending down to 0 at the left/right corners of screen
        const t = Math.max(0, Math.min(1, (dot - 0.76) / 0.22));

        const targetQ = new THREE.Quaternion();
        targetQ.slerpQuaternions(qCyl, qCam, t);
        group.quaternion.copy(targetQ);

        // Depth-based visibility fading & scaling derived from distance to camera
        const dist = group.position.distanceTo(camPos);

        // Keep visible in background (min opacity 0.35) so scene looks rich and count is high
        let depthOpacity = 1.0;
        if (dist > 7.5) {
            depthOpacity = 0.35;
        } else if (dist > 4.0) {
            depthOpacity = 1.0 - ((dist - 4.0) / 3.5) * 0.65; // gradual opacity fade
        }

        const targetOpacity = isFocused ? 1.0 : (isDimmed ? 0.15 : depthOpacity);

        // Scale grows as camera gets closer (from 0.60 up to 1.05)
        let targetScale = 1.0;
        if (isFocused) {
            targetScale = 1.05;
        } else if (isDimmed) {
            targetScale = 0.85;
        } else {
            if (dist > 7.5) {
                targetScale = 0.60;
            } else if (dist > 4.0) {
                targetScale = 1.0 - ((dist - 4.0) / 3.5) * 0.40;
            }
        }

        // Direct DOM styling edits bypassing react reconciler for 60fps performance
        if (domRef.current) {
            domRef.current.style.opacity = `${targetOpacity}`;
            domRef.current.style.transform = `scale(${targetScale})`;
            if (targetOpacity < 0.05) {
                domRef.current.style.pointerEvents = 'none';
            } else if (!isDimmed) {
                domRef.current.style.pointerEvents = 'auto';
            }
        }
    });

    return (
        <group ref={groupRef}>
            {/* 
        occlude: hides html behind 3D models.
        distanceFactor: scales page elements relative to distance. Lower factor increases raw scale size (1.25)
      */}
            <Html transform occlude wrapperClass="card-wrapper" distanceFactor={1.22}>
                <div
                    ref={domRef}
                    className={clsx(
                        "agent-card-container group select-none transition-shadow duration-300",
                        flipped && "flipped",
                        isFocused ? "shadow-[0_15px_40px_rgba(15,23,42,0.12)]" : "hover:scale-[1.02]"
                    )}
                    onClick={handleCardClick}
                    onDoubleClick={handleDoubleClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="flip-card-inner transition-all duration-300 group-hover:-translate-y-1">

                        {/* FRONT FACE */}
                        <div className="flip-card-front bg-white/90 border border-slate-200/50 rounded-[20px] backdrop-blur-md flex flex-col justify-between h-full w-full">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-md font-bold text-slate-800 tracking-wide">{title}</h2>
                                        {badge && (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                                {badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Flip button */}
                                    <button
                                        onClick={triggerFlip}
                                        className={clsx(
                                            "flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer",
                                            isFocused
                                                ? "bg-slate-50 border-slate-200 text-slate-700 hover:text-emerald-750 hover:bg-emerald-50 hover:border-emerald-300"
                                                : "bg-slate-50/50 border-slate-100 text-slate-400 hover:text-slate-600"
                                        )}
                                        title={isFocused ? "Inspect Stats & Settings (Click to Flip)" : "Click Card to Zoom in First"}
                                    >
                                        Stats <BarChart3 size={12} className="text-emerald-500" />
                                    </button>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
                            </div>

                            {/* Stats Panel inside Front Card */}
                            <div className="mt-4">
                                <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-3 mb-4">
                                    <div className="text-left font-medium">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Scenarios</div>
                                        <div className="text-sm font-bold text-slate-700 mt-0.5">{activeScenarios}</div>
                                    </div>
                                    <div className="text-left border-l border-slate-100 pl-3 font-medium">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{metricLabel}</div>
                                        <div className="text-sm font-bold text-slate-700 mt-0.5">{metricValue}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                                    <span>Processed: <strong className="text-slate-600">{processedCount}</strong></span>
                                    {!isFocused && <span className="text-[10px] text-indigo-500 animate-pulse font-semibold">Click to interactive zoom</span>}
                                </div>
                            </div>
                        </div>

                        {/* BACK FACE */}
                        <div className="flip-card-back bg-white/95 border border-slate-200/50 rounded-[20px] backdrop-blur-md h-full w-full relative overflow-hidden">

                            {/* SUB-VIEW 1: GENERAL STATS */}
                            <div className={clsx("back-view view-main flex flex-col justify-between", showSettings && "out")}>
                                <div>
                                    <h2 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3">{title} Parameters</h2>

                                    <div className="space-y-3 font-medium">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Success Rate</span>
                                            <span className="font-bold text-emerald-650 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> {successRate}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Resource Usage</span>
                                            <span className="font-bold text-slate-700">{cpu}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Mean Response Latency</span>
                                            <span className="font-bold text-indigo-600 font-mono">{latency}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2 mt-auto">
                                    <button
                                        onClick={triggerFlip}
                                        className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-205 hover:bg-slate-100 hover:border-slate-300 text-slate-655 rounded-lg text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-1"
                                    >
                                        <ChevronLeft size={12} /> Flip Front
                                    </button>
                                    <button
                                        onClick={handleAdvancedClick}
                                        className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.25)] cursor-pointer flex justify-center items-center gap-1"
                                    >
                                        Configure <Settings2 size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* SUB-VIEW 2: ADVANCED FORM SETTINGS */}
                            <form
                                onSubmit={handleSaveSettings}
                                className={clsx("back-view view-settings flex flex-col justify-between", showSettings && "in")}
                                onClick={(e) => e.stopPropagation()} // Stop bubbling to prevent flip on form edits
                            >
                                <div>
                                    <h2 className="text-md font-bold text-slate-800 border-b border-slate-105 pb-3 mb-3">Adjust Parameters</h2>

                                    <div className="space-y-2">
                                        <div className="flex flex-col text-left">
                                            <label className="text-[10px] text-slate-450 font-bold mb-1 uppercase tracking-wide">Max processed items</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={maxItems}
                                                onChange={(e) => setMaxItems(parseInt(e.target.value) || 0)}
                                                className="bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg p-1 px-2 text-xs text-slate-855 outline-none w-full"
                                            />
                                        </div>

                                        <div className="flex flex-col text-left">
                                            <label className="text-[10px] text-slate-450 font-bold mb-1 uppercase tracking-wide">Minimum Severity</label>
                                            <select
                                                value={severity}
                                                onChange={(e) => setSeverity(e.target.value)}
                                                className="bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg p-1.5 px-2 text-xs text-slate-855 outline-none w-full"
                                            >
                                                <option value="low">Low</option>
                                                <option value="moderate">Moderate</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col text-left">
                                            <label className="text-[10px] text-slate-450 font-bold mb-1 uppercase tracking-wide">Notification Channel</label>
                                            <select
                                                value={channel}
                                                onChange={(e) => setChannel(e.target.value)}
                                                className="bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg p-1.5 px-2 text-xs text-slate-855 outline-none w-full"
                                            >
                                                <option value="email">Email</option>
                                                <option value="slack">Slack</option>
                                                <option value="disabled">Disabled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2 mt-auto">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setShowSettings(false); }}
                                        className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-205 hover:bg-slate-100 hover:border-slate-300 text-slate-655 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.25)] cursor-pointer flex justify-center items-center gap-1"
                                    >
                                        Save <Save size={12} />
                                    </button>
                                </div>
                            </form>

                        </div>

                    </div>
                </div>
            </Html>
        </group>
    );
}
