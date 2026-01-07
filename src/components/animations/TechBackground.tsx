
import { useEffect, useRef } from "react";

export default function TechBackground({
  variant = "commandCenter"
}: {
  variant?: "commandCenter" | "defenseScientist" | "weaponsInterface" | "missionBriefing" | "satelliteCommunication"
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Base configuration based on variant
    const style = getComputedStyle(document.documentElement);
    const primaryColor = `hsl(${style.getPropertyValue('--primary').trim().split(' ').join(',')})`;
    const secondaryColor = `hsl(${style.getPropertyValue('--secondary-foreground').trim().split(' ').join(',')})`;
    const bgColor = `hsl(${style.getPropertyValue('--background').trim().split(' ').join(',')})`;

    // Debug color parsing
    // console.log('Theme Colors:', { primaryColor, secondaryColor, bgColor });

    const baseConfig = {
      particleCount: Math.min(100, Math.floor(window.innerWidth / 10)), // More particles
      gridLineCount: 12,
      radarWaveCount: 3,
      dataStreamCount: 8,
      nodeCount: 20,
      backgroundColor: bgColor,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
    };

    // ... config usage ...

    const config = baseConfig;

    // Particles configuration
    const particles: Particle[] = [];

    // Create particles
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 1.5, // Larger
        opacity: Math.random() * 0.5 + 0.4, // Brighter (0.4-0.9)
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.7 ? config.secondaryColor : config.primaryColor
      });
    }

    // Grid lines
    const gridLines: GridLine[] = [];

    // Create horizontal grid lines
    for (let i = 0; i < config.gridLineCount; i++) {
      const y = (canvas.height / (config.gridLineCount - 1)) * i;
      gridLines.push({
        startX: 0,
        startY: y,
        endX: canvas.width,
        endY: y,
        opacity: 0.15 // More visible grid
      });
    }

    // Create vertical grid lines
    for (let i = 0; i < config.gridLineCount; i++) {
      const x = (canvas.width / (config.gridLineCount - 1)) * i;
      gridLines.push({
        startX: x,
        startY: 0,
        endX: x,
        endY: canvas.height,
        opacity: 0.15 // More visible grid
      });
    }

    // ... (rest of the file largely same logic but ensure opacity usage is bumped up in draw loop) ...
    // Note: I will only replace the config section and removal of overlay here, 
    // the draw loop adjustments require a multi_replace or larger replace.
    // Let's do a targeted replace for the config and overlay first.



    // Radar waves
    const radarWaves: RadarWave[] = [];

    // Different radar positions based on variant
    const radarPositions = getRadarPositionsForVariant(variant, canvas);

    // Create radar waves for each position
    radarPositions.forEach(pos => {
      for (let i = 0; i < config.radarWaveCount; i++) {
        radarWaves.push({
          x: pos.x,
          y: pos.y,
          radius: 50 + i * 100,
          opacity: 0.4 - i * 0.12,
          speed: 0.5
        });
      }
    });

    // Data streams
    const dataStreams: DataStream[] = [];

    for (let i = 0; i < config.dataStreamCount; i++) {
      const x = Math.random() * canvas.width;
      const segments = [];
      const segmentCount = 10 + Math.floor(Math.random() * 12);

      for (let j = 0; j < segmentCount; j++) {
        segments.push({
          x: x + (Math.random() - 0.5) * 20,
          y: (canvas.height / segmentCount) * j,
          opacity: Math.random() * 0.6 + 0.1,
          width: Math.random() * 2 + 0.5
        });
      }

      dataStreams.push({
        segments,
        speed: 1 + Math.random() * 1.5
      });
    }

    // Neural network nodes
    const nodes: Node[] = [];

    for (let i = 0; i < config.nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        connections: []
      });
    }

    // Create connections between nodes
    nodes.forEach((node, i) => {
      const connections = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i !== j) {
          const distX = node.x - nodes[j].x;
          const distY = node.y - nodes[j].y;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < canvas.width / 5) {
            connections.push({
              toNode: j,
              opacity: (1 - distance / (canvas.width / 5)) * 0.15
            });
          }
        }
      }
      node.connections = connections;
    });

    // Variant-specific elements
    const variantElements = createVariantSpecificElements(variant, canvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.shadowBlur = 0;
      ctx.lineWidth = 0.5; // Fine lines
      gridLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        // Reduced opacity multiplier from 1.5 to 0.4
        ctx.strokeStyle = `${config.primaryColor}${Math.floor(line.opacity * 255 * 0.4).toString(16).padStart(2, '0')}`;
        ctx.stroke();
      });

      // Update and draw particles - CLEAN LOOK
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Reset position if out of bounds
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        // Removed heavy shadowBlur, kept pure color
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Update and draw radar waves
      radarWaves.forEach(wave => {
        wave.radius += wave.speed;
        if (wave.radius > Math.max(canvas.width, canvas.height)) {
          wave.radius = 50;
        }

        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${config.secondaryColor}${Math.floor(wave.opacity * 255 * 0.5).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update and draw data streams
      dataStreams.forEach(stream => {
        // Move stream up
        stream.segments.forEach(segment => {
          segment.y -= stream.speed;
          if (segment.y < 0) {
            segment.y = canvas.height;
            segment.opacity = Math.random() * 0.6 + 0.1;
          }
        });

        // Draw stream segments
        for (let i = 0; i < stream.segments.length - 1; i++) {
          const current = stream.segments[i];
          const next = stream.segments[i + 1];

          ctx.beginPath();
          ctx.moveTo(current.x, current.y);
          ctx.lineTo(next.x, next.y);
          ctx.strokeStyle = `${config.primaryColor}${Math.floor(current.opacity * 255 * 0.6).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = current.width * 0.8;
          ctx.stroke();
        }
      });

      // Draw neural network
      // First draw connections
      nodes.forEach((node, i) => {
        node.connections.forEach(conn => {
          const toNode = nodes[conn.toNode];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.strokeStyle = `${config.secondaryColor}${Math.floor(conn.opacity * 255 * 0.5).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      });

      // Then draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = config.secondaryColor;
        ctx.fill();
      });

      // Draw variant-specific elements - WRAPPED IN TRY-CATCH TO PREVENT CRASH
      try {
        if (variant === "commandCenter") {
          drawCommandCenterElements(ctx, variantElements, config);
        } else if (variant === "defenseScientist") {
          drawDefenseScientistElements(ctx, variantElements, config);
        } else if (variant === "weaponsInterface") {
          drawWeaponsInterfaceElements(ctx, variantElements, config);
        } else if (variant === "missionBriefing") {
          drawMissionBriefingElements(ctx, variantElements, config);
        } else if (variant === "satelliteCommunication") {
          drawSatelliteCommunicationElements(ctx, variantElements, config, canvas);
        }
      } catch (e) {
        console.warn("TechBackground draw error:", e);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Create observer to detect theme changes
    const observer = new MutationObserver(() => {
      // Re-read styles when class changes
      try {
        const style = getComputedStyle(document.documentElement);

        // Helper to convert HSL to Hex
        const hslToHex = (h: number, s: number, l: number) => {
          l /= 100;
          const a = s * Math.min(l, 1 - l) / 100;
          const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
          };
          return `#${f(0)}${f(8)}${f(4)}`;
        };

        const getCssVarAsHex = (variable: string, fallbackHex: string) => {
          const val = style.getPropertyValue(variable).trim();
          if (!val) return fallbackHex;

          // Parse "H S% L%" or "H, S%, L%"
          const parts = val.replace(/,/g, ' ').split(' ').filter(p => p !== '');
          if (parts.length >= 3) {
            const h = parseFloat(parts[0]);
            const s = parseFloat(parts[1]);
            const l = parseFloat(parts[2]);
            if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
              return hslToHex(h, s, l);
            }
          }
          return fallbackHex;
        };

        const primaryColor = getCssVarAsHex('--primary', '#00FF77');
        const secondaryColor = getCssVarAsHex('--secondary-foreground', '#00AAFF');
        // Keep background transparent for safety in light mode
        const bgColor = getCssVarAsHex('--background', '#000000').length === 7 ? getCssVarAsHex('--background', '#000000') + '00' : 'rgba(0,0,0,0)';

        // Update config
        config.primaryColor = primaryColor;
        config.secondaryColor = secondaryColor;
        config.backgroundColor = 'transparent'; // Force transparent to avoid overwriting

      } catch (e) {
        // Fallback silently
        console.warn("Theme parsing error", e);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/20 to-transparent pointer-events-none" />
    </div>
  );
}

// Helper functions for variant-specific configurations and elements

function getConfigForVariant(variant: string, canvas: HTMLCanvasElement) {
  const baseConfig = {
    particleCount: Math.min(80, Math.floor(window.innerWidth / 12)),
    gridLineCount: 10,
    radarWaveCount: 3,
    dataStreamCount: 6,
    nodeCount: 15,
    backgroundColor: "rgba(15, 20, 30, 0.95)",
  };

  switch (variant) {
    case "commandCenter":
      return {
        ...baseConfig,
        primaryColor: "#00FF77", // Neon green
        secondaryColor: "#00AAFF", // Neon blue
      };
    case "defenseScientist":
      return {
        ...baseConfig,
        primaryColor: "#70E2FF", // Light blue
        secondaryColor: "#00DDAA", // Aqua
      };
    case "weaponsInterface":
      return {
        ...baseConfig,
        primaryColor: "#FF3300", // Red
        secondaryColor: "#FFDD00", // Yellow
      };
    case "missionBriefing":
      return {
        ...baseConfig,
        primaryColor: "#FF0055", // Neon red
        secondaryColor: "#0055FF", // Neon blue
      };
    case "satelliteCommunication":
      return {
        ...baseConfig,
        primaryColor: "#00FFDD", // Cyan
        secondaryColor: "#90AAFF", // Soft blue
      };
    default:
      return {
        ...baseConfig,
        primaryColor: "#00FF77", // Neon green
        secondaryColor: "#00AAFF", // Neon blue
      };
  }
}

function getRadarPositionsForVariant(variant: string, canvas: HTMLCanvasElement) {
  switch (variant) {
    case "commandCenter":
      return [
        { x: canvas.width * 0.2, y: canvas.height * 0.3 },
        { x: canvas.width * 0.8, y: canvas.height * 0.7 }
      ];
    case "defenseScientist":
      return [
        { x: canvas.width * 0.3, y: canvas.height * 0.2 },
        { x: canvas.width * 0.7, y: canvas.height * 0.8 }
      ];
    case "weaponsInterface":
      return [
        { x: canvas.width * 0.1, y: canvas.height * 0.5 },
        { x: canvas.width * 0.9, y: canvas.height * 0.5 }
      ];
    case "missionBriefing":
      return [
        { x: canvas.width * 0.5, y: canvas.height * 0.2 }
      ];
    case "satelliteCommunication":
      return [
        { x: canvas.width * 0.5, y: canvas.height * 0.5 }
      ];
    default:
      return [
        { x: canvas.width * 0.5, y: canvas.height * 0.5 }
      ];
  }
}

function createVariantSpecificElements(variant: string, canvas: HTMLCanvasElement) {
  switch (variant) {
    case "commandCenter":
      // Command center HUD elements
      const hudElements = [];
      // Rotating hologram
      hudElements.push({
        type: "hologram",
        x: canvas.width * 0.75,
        y: canvas.height * 0.5,
        radius: canvas.width * 0.1,
        speed: 0.005,
        angle: 0
      });
      // Data panels
      for (let i = 0; i < 3; i++) {
        hudElements.push({
          type: "panel",
          x: canvas.width * (0.15 + i * 0.3),
          y: canvas.height * 0.85,
          width: canvas.width * 0.25,
          height: canvas.height * 0.1,
          fadeLevel: Math.random()
        });
      }
      // Add HUD corners
      for (let i = 0; i < 4; i++) {
        hudElements.push({
          type: "hudCorner",
          corner: i, // 0:TL, 1:TR, 2:BR, 3:BL
          size: Math.min(canvas.width, canvas.height) * 0.1
        });
      }
      return hudElements;

    case "defenseScientist":
      // Lab environment elements
      const labElements = [];
      // Holographic schematics
      for (let i = 0; i < 3; i++) {
        labElements.push({
          type: "schematic",
          x: canvas.width * (0.25 + i * 0.25),
          y: canvas.height * 0.4,
          size: canvas.width * 0.15,
          rotation: Math.random() * Math.PI * 2,
          schematicType: i % 3 // 0:drone, 1:robot, 2:map
        });
      }
      // Floating code/formulas
      for (let i = 0; i < 15; i++) {
        labElements.push({
          type: "floatingText",
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          text: ['AI', 'ML', 'Σ', 'Π', '∫', 'ψ', 'λ', 'μ', '∂', '∆'][Math.floor(Math.random() * 10)],
          size: 10 + Math.random() * 14,
          opacity: 0.1 + Math.random() * 0.4,
          speed: Math.random() * 0.5
        });
      }
      return labElements;

    case "weaponsInterface":
      // Weapon system UI elements
      const weaponElements = [];
      // Target indicators
      for (let i = 0; i < 5; i++) {
        weaponElements.push({
          type: "target",
          x: canvas.width * Math.random(),
          y: canvas.height * Math.random(),
          size: 10 + Math.random() * 30,
          active: Math.random() > 0.5,
          pulsing: Math.random() > 0.7,
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
      // System logs
      for (let i = 0; i < 2; i++) {
        weaponElements.push({
          type: "log",
          x: canvas.width * (0.1 + i * 0.8),
          y: canvas.height * 0.1,
          width: canvas.width * 0.15,
          height: canvas.height * 0.6,
          lines: 10 + Math.floor(Math.random() * 10),
          scrollSpeed: 0.3 + Math.random() * 0.7
        });
      }
      // Heatmap
      weaponElements.push({
        type: "heatmap",
        x: canvas.width * 0.5,
        y: canvas.height * 0.6,
        width: canvas.width * 0.3,
        height: canvas.height * 0.25,
        cells: 15,
        updateSpeed: 2000 // ms between updates
      });
      return weaponElements;

    case "missionBriefing":
      // Mission briefing elements - Moved to periphery to avoid overlapping content
      const briefingElements = [];
      // Scrolling data entries (Left edge)
      briefingElements.push({
        type: "dataScroll",
        x: 20,
        y: canvas.height * 0.15,
        width: canvas.width * 0.18,
        height: canvas.height * 0.7,
        lines: 15,
        scrollSpeed: 0.3
      });
      // Timeline (Bottom edge)
      briefingElements.push({
        type: "timeline",
        x: canvas.width * 0.5,
        y: canvas.height * 0.88,
        width: canvas.width * 0.45,
        height: canvas.height * 0.05,
        points: 4,
        progress: 0.25
      });
      // ID card (Top right)
      briefingElements.push({
        type: "idCard",
        x: canvas.width - 200,
        y: 80,
        width: 170,
        height: 210
      });
      // Strategic points (Subtle, dispersed)
      for (let i = 0; i < 3; i++) {
        briefingElements.push({
          type: "strategicPoint",
          x: Math.random() < 0.5 ? canvas.width * 0.12 : canvas.width * 0.88,
          y: canvas.height * (0.2 + Math.random() * 0.6),
          size: 3 + Math.random() * 4,
          blinkSpeed: 1000 + Math.random() * 1000
        });
      }
      return briefingElements;

    case "satelliteCommunication":
      // Satellite communication elements
      const satelliteElements = [];
      // Earth globe
      satelliteElements.push({
        type: "earth",
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        radius: Math.min(canvas.width, canvas.height) * 0.25,
        rotation: 0,
        rotationSpeed: 0.0003
      });
      // Orbiting satellites
      for (let i = 0; i < 3; i++) {
        satelliteElements.push({
          type: "satellite",
          orbitRadius: Math.min(canvas.width, canvas.height) * (0.3 + i * 0.08),
          angle: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.0005,
          size: 5 + Math.random() * 5
        });
      }
      // Signal points around the globe
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        satelliteElements.push({
          type: "signalPoint",
          x: canvas.width * 0.5 + Math.cos(angle) * Math.min(canvas.width, canvas.height) * 0.23,
          y: canvas.height * 0.5 + Math.sin(angle) * Math.min(canvas.width, canvas.height) * 0.23,
          size: 3 + Math.random() * 3,
          blinkSpeed: 500 + Math.random() * 1500,
          active: Math.random() > 0.3
        });
      }
      return satelliteElements;

    default:
      return [];
  }
}

// Draw functions for each variant

function drawCommandCenterElements(ctx: CanvasRenderingContext2D, elements: any[], config: any) {
  const time = Date.now();

  elements.forEach(element => {
    switch (element.type) {
      case "hologram":
        // Draw rotating hologram
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate(element.angle);
        element.angle += element.speed;

        // Hexagonal shape
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * element.radius;
          const y = Math.sin(angle) * element.radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `${config.primaryColor}88`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner details
        ctx.beginPath();
        ctx.arc(0, 0, element.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `${config.secondaryColor}66`;
        ctx.stroke();

        // Crossing lines
        ctx.beginPath();
        ctx.moveTo(-element.radius, 0);
        ctx.lineTo(element.radius, 0);
        ctx.moveTo(0, -element.radius);
        ctx.lineTo(0, element.radius);
        ctx.strokeStyle = `${config.primaryColor}44`;
        ctx.stroke();

        ctx.restore();
        break;

      case "panel":
        // Draw data panels with detailed intelligence
        ctx.fillStyle = `${config.secondaryColor}08`; // Very subtle background
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.strokeStyle = `${config.primaryColor}33`;
        ctx.strokeRect(element.x, element.y, element.width, element.height);

        // Determine Panel Type based on X position (0: Left, 1: Center, 2: Right)
        // element.x is roughly 0.15, 0.45, 0.75 of width
        const panelIndex = Math.floor((element.x / ctx.canvas.width) * 3);

        let headerText = "";
        let codeLines: string[] = [];

        if (panelIndex === 0) {
          // Left: Neural Network (Python)
          headerText = "NEURAL_NET.PY";
          codeLines = [
            "import torch.nn as nn",
            "class DefenseNet(nn.Module):",
            "    def __init__(self):",
            "        self.conv1 = nn.Conv2d(1, 32)",
            "    def forward(self, x):",
            "        x = self.relu(self.conv1(x))",
            "        return self.sigmoid(x)",
            "model = DefenseNet().to(device)",
            "optimizer.step()",
            "print('Model Loaded')"
          ];
        } else if (panelIndex === 1) {
          // Center: System Core (C++)
          headerText = "SECURITY_CORE.CPP";
          codeLines = [
            "#include <security.h>",
            "void SecureSector(int id) {",
            "  if (Scan(id) == THREAT) {",
            "    Lockdown(LEVEL_5);",
            "    ActivateTurrets();",
            "  } else {",
            "    Log('Sector Secure');",
            "  }",
            "}",
            "int main() { Init(); }"
          ];
        } else {
          // Right: Telemetry (TypeScript)
          headerText = "TELEMETRY_SYNC.TS";
          codeLines = [
            "interface NodeStatus {",
            "  id: string; online: boolean;",
            "  latency: number;",
            "}",
            "const syncData = (nodes) => {",
            "  return nodes.map(n => ({",
            "    ...n, ts: Date.now()",
            "  }));",
            "}",
            "socket.emit('sync', data);"
          ];
        }

        // Header
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = `${config.primaryColor}cc`;
        ctx.fillText(headerText, element.x + 5, element.y + 12);

        // Draw Code Lines
        ctx.font = "9px monospace";
        const totalLines = 6; // Lines to show at once
        const speed = panelIndex === 1 ? 2500 : 3500; // Vary speed slightly
        const scrollOffset = Math.floor(time / speed) % Math.max(1, codeLines.length - totalLines);

        for (let i = 0; i < totalLines; i++) {
          const lineIndex = (scrollOffset + i) % codeLines.length;
          if (codeLines[lineIndex]) {
            const yPos = element.y + 25 + (i * 12);

            // Color variation for basic syntax highlight feel
            const line = codeLines[lineIndex];
            if (line.includes("import") || line.includes("#include") || line.includes("interface")) {
              ctx.fillStyle = `${config.secondaryColor}aa`; // Keyword color
            } else if (line.includes("def") || line.includes("void") || line.includes("const")) {
              ctx.fillStyle = `${config.primaryColor}ee`; // Function/Decl color
            } else {
              ctx.fillStyle = `${config.primaryColor}99`; // Regular code
            }

            ctx.fillText(line, element.x + 5, yPos);
          }
        }

        // Activity Indicator (blinking block) at the bottom right of panel
        if (Math.floor(time / 500) % 2 === 0) {
          ctx.fillStyle = config.primaryColor;
          ctx.fillRect(element.x + element.width - 15, element.y + element.height - 15, 8, 8);
        }

        break;

      case "hudCorner":
        // Draw HUD corners
        const size = element.size;
        let x, y;

        switch (element.corner) {
          case 0: // Top left
            x = 10;
            y = 10;

            ctx.beginPath();
            ctx.moveTo(x, y + size);
            ctx.lineTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.strokeStyle = `${config.primaryColor}88`;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;

          case 1: // Top right
            x = ctx.canvas.width - 10;
            y = 10;

            ctx.beginPath();
            ctx.moveTo(x, y + size);
            ctx.lineTo(x, y);
            ctx.lineTo(x - size, y);
            ctx.strokeStyle = `${config.primaryColor}88`;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;

          case 2: // Bottom right
            x = ctx.canvas.width - 10;
            y = ctx.canvas.height - 10;

            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y);
            ctx.lineTo(x - size, y);
            ctx.strokeStyle = `${config.primaryColor}88`;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;

          case 3: // Bottom left
            x = 10;
            y = ctx.canvas.height - 10;

            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.strokeStyle = `${config.primaryColor}88`;
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
        }
        break;
    }
  });

  // Add additional HUD elements

  // Status text
  ctx.font = "12px monospace";
  ctx.fillStyle = `${config.primaryColor}aa`;
  ctx.fillText("SYSTEM STATUS: OPERATIONAL", 20, 30);
  ctx.fillText(`TIME: ${new Date().toLocaleTimeString()}`, 20, 50);

  // Scanning effect
  const scanHeight = 2;
  const scanY = (time / 20) % ctx.canvas.height;
  ctx.fillStyle = `${config.primaryColor}22`;
  ctx.fillRect(0, scanY, ctx.canvas.width, scanHeight);
}

function drawDefenseScientistElements(ctx: CanvasRenderingContext2D, elements: any[], config: any) {
  const time = Date.now();

  elements.forEach(element => {
    switch (element.type) {
      case "schematic":
        // Draw holographic schematics
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate(element.rotation + Math.sin(time / 3000) * 0.1);

        const pulseEffect = 0.7 + Math.sin(time / 1000) * 0.3;

        ctx.strokeStyle = `${config.secondaryColor}${Math.floor(pulseEffect * 80).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;

        if (element.schematicType === 0) {
          // Drone schematic
          const size = element.size * pulseEffect;

          // Body
          ctx.beginPath();
          ctx.ellipse(0, 0, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Wings
          ctx.beginPath();
          ctx.moveTo(-size * 0.5, 0);
          ctx.lineTo(-size, -size * 0.2);
          ctx.lineTo(-size, size * 0.2);
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(size * 0.5, 0);
          ctx.lineTo(size, -size * 0.2);
          ctx.lineTo(size, size * 0.2);
          ctx.closePath();
          ctx.stroke();

        } else if (element.schematicType === 1) {
          // Robot schematic
          const size = element.size;

          // Head
          ctx.beginPath();
          ctx.arc(0, -size * 0.6, size * 0.2, 0, Math.PI * 2);
          ctx.stroke();

          // Body
          ctx.beginPath();
          ctx.rect(-size * 0.3, -size * 0.4, size * 0.6, size * 0.8);
          ctx.stroke();

          // Arms
          ctx.beginPath();
          ctx.moveTo(-size * 0.3, -size * 0.2);
          ctx.lineTo(-size * 0.6, size * 0.3);
          ctx.moveTo(size * 0.3, -size * 0.2);
          ctx.lineTo(size * 0.6, size * 0.3);
          ctx.stroke();

          // Legs
          ctx.beginPath();
          ctx.moveTo(-size * 0.2, size * 0.4);
          ctx.lineTo(-size * 0.2, size * 0.8);
          ctx.moveTo(size * 0.2, size * 0.4);
          ctx.lineTo(size * 0.2, size * 0.8);
          ctx.stroke();

        } else {
          // Strategic map
          const size = element.size;

          // Map outline
          ctx.beginPath();
          ctx.rect(-size, -size * 0.7, size * 2, size * 1.4);
          ctx.stroke();

          // Map details
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
              (Math.random() - 0.5) * size * 1.6,
              (Math.random() - 0.5) * size * 1.1,
              size * 0.1,
              0, Math.PI * 2
            );
            ctx.stroke();
          }

          // Map lines
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-size + Math.random() * size * 2, -size * 0.7 + Math.random() * size * 1.4);
            ctx.lineTo(-size + Math.random() * size * 2, -size * 0.7 + Math.random() * size * 1.4);
            ctx.stroke();
          }
        }

        // Grid pattern overlay
        ctx.strokeStyle = `${config.primaryColor}22`;
        ctx.lineWidth = 0.5;
        const gridSize = element.size / 5;

        for (let i = -5; i <= 5; i++) {
          ctx.beginPath();
          ctx.moveTo(-element.size, i * gridSize);
          ctx.lineTo(element.size, i * gridSize);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(i * gridSize, -element.size);
          ctx.lineTo(i * gridSize, element.size);
          ctx.stroke();
        }

        ctx.restore();
        break;

      case "floatingText":
        // Draw floating text symbols
        element.y -= element.speed;
        if (element.y < 0) element.y = ctx.canvas.height;

        ctx.font = `${element.size}px monospace`;
        ctx.fillStyle = `${config.secondaryColor}${Math.floor(element.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fillText(element.text, element.x, element.y);
        break;
    }
  });

  // Add scanning light effect
  const scanWidth = 100;
  const scanX = ((time / 30) % (ctx.canvas.width + scanWidth * 2)) - scanWidth;
  const gradient = ctx.createLinearGradient(scanX - scanWidth, 0, scanX + scanWidth, 0);
  gradient.addColorStop(0, `${config.primaryColor}00`);
  gradient.addColorStop(0.5, `${config.primaryColor}11`);
  gradient.addColorStop(1, `${config.primaryColor}00`);

  ctx.fillStyle = gradient;
  ctx.fillRect(scanX - scanWidth, 0, scanWidth * 2, ctx.canvas.height);
}

function drawWeaponsInterfaceElements(ctx: CanvasRenderingContext2D, elements: any[], config: any) {
  const time = Date.now();

  elements.forEach(element => {
    switch (element.type) {
      case "target":
        // Draw target indicators
        ctx.save();
        ctx.translate(element.x, element.y);

        // Pulsing effect for active targets
        let opacity = element.active ? 0.8 : 0.3;
        if (element.pulsing) {
          opacity *= 0.5 + Math.sin(time / 500 + element.pulsePhase) * 0.5;
        }

        // Outer circle
        ctx.beginPath();
        ctx.arc(0, 0, element.size, 0, Math.PI * 2);
        ctx.strokeStyle = `${config.primaryColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cross inside
        ctx.beginPath();
        ctx.moveTo(-element.size * 0.7, 0);
        ctx.lineTo(element.size * 0.7, 0);
        ctx.moveTo(0, -element.size * 0.7);
        ctx.lineTo(0, element.size * 0.7);
        ctx.strokeStyle = `${config.primaryColor}${Math.floor(opacity * 200).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Corner brackets for active targets
        if (element.active) {
          const bracketSize = element.size * 0.3;

          // Top left
          ctx.beginPath();
          ctx.moveTo(-element.size, -element.size + bracketSize);
          ctx.lineTo(-element.size, -element.size);
          ctx.lineTo(-element.size + bracketSize, -element.size);
          ctx.stroke();

          // Top right
          ctx.beginPath();
          ctx.moveTo(element.size, -element.size + bracketSize);
          ctx.lineTo(element.size, -element.size);
          ctx.lineTo(element.size - bracketSize, -element.size);
          ctx.stroke();

          // Bottom left
          ctx.beginPath();
          ctx.moveTo(-element.size, element.size - bracketSize);
          ctx.lineTo(-element.size, element.size);
          ctx.lineTo(-element.size + bracketSize, element.size);
          ctx.stroke();

          // Bottom right
          ctx.beginPath();
          ctx.moveTo(element.size, element.size - bracketSize);
          ctx.lineTo(element.size, element.size);
          ctx.lineTo(element.size - bracketSize, element.size);
          ctx.stroke();
        }

        ctx.restore();
        break;

      case "log":
        // Draw system logs panel
        ctx.fillStyle = `${config.secondaryColor}11`;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.strokeStyle = `${config.primaryColor}44`;
        ctx.strokeRect(element.x, element.y, element.width, element.height);

        // Log panel title
        ctx.font = "10px monospace";
        ctx.fillStyle = `${config.primaryColor}aa`;
        ctx.fillText("SYSTEM LOG", element.x + 5, element.y - 5);

        // Scrolling text lines
        ctx.save();
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, element.height);
        ctx.clip();

        const lineHeight = element.height / element.lines;
        const offset = (time / (1000 / element.scrollSpeed)) % lineHeight;

        for (let i = -1; i < element.lines; i++) {
          const lineY = element.y + i * lineHeight + offset;
          const opacity = (Math.sin(i * 3.7) + 1) * 0.35 + 0.1;
          const lineWidth = element.width * (0.5 + Math.sin(i * 1.5) * 0.3);

          ctx.fillStyle = `${config.primaryColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fillRect(element.x + 5, lineY, lineWidth, lineHeight * 0.6);
        }

        ctx.restore();
        break;

      case "heatmap":
        // Draw heatmap
        ctx.save();

        // Background
        ctx.fillStyle = `${config.secondaryColor}11`;
        ctx.fillRect(element.x - element.width / 2, element.y - element.height / 2, element.width, element.height);
        ctx.strokeStyle = `${config.primaryColor}44`;
        ctx.strokeRect(element.x - element.width / 2, element.y - element.height / 2, element.width, element.height);

        // Title
        ctx.font = "12px monospace";
        ctx.fillStyle = `${config.primaryColor}aa`;
        ctx.fillText("TACTICAL HEATMAP", element.x - element.width / 2 + 10, element.y - element.height / 2 - 10);

        // Generate heatmap cells
        const cellWidth = element.width / element.cells;
        const cellHeight = element.height / element.cells;

        // Cache or generate new values periodically
        if (!element.lastUpdate || time - element.lastUpdate > element.updateSpeed) {
          element.cellValues = [];
          for (let i = 0; i < element.cells; i++) {
            element.cellValues[i] = [];
            for (let j = 0; j < element.cells; j++) {
              element.cellValues[i][j] = Math.random();
            }
          }
          element.lastUpdate = time;
        }

        // Draw cells
        for (let i = 0; i < element.cells; i++) {
          for (let j = 0; j < element.cells; j++) {
            const value = element.cellValues[i][j];

            let cellColor;
            if (value < 0.3) {
              cellColor = config.secondaryColor + Math.floor(value * 255 / 0.3).toString(16).padStart(2, '0');
            } else {
              cellColor = config.primaryColor + Math.floor(((value - 0.3) * 255) / 0.7).toString(16).padStart(2, '0');
            }

            ctx.fillStyle = cellColor;
            ctx.fillRect(
              element.x - element.width / 2 + i * cellWidth,
              element.y - element.height / 2 + j * cellHeight,
              cellWidth,
              cellHeight
            );
          }
        }

        ctx.restore();
        break;
    }
  });

  // Add tactical display elements

  // Grid overlay
  ctx.strokeStyle = `${config.secondaryColor}11`;
  ctx.lineWidth = 1;

  const gridSize = 30;
  for (let x = 0; x < ctx.canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < ctx.canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }

  // Status indicators
  ctx.font = "10px monospace";
  ctx.fillStyle = `${config.primaryColor}aa`;
  ctx.fillText("TARGETING SYSTEM: ACTIVE", 20, 20);
  ctx.fillText("DEFENSE STATUS: CONDITION YELLOW", 20, 35);
  ctx.fillText(`SECURITY LEVEL: ALPHA-${Math.floor(Math.random() * 9) + 1}`, ctx.canvas.width - 200, 20);
}

function drawMissionBriefingElements(ctx: CanvasRenderingContext2D, elements: any[], config: any) {
  const time = Date.now();

  elements.forEach(element => {
    switch (element.type) {
      case "dataScroll":
        // Data scroll panel
        ctx.fillStyle = `${config.secondaryColor}11`;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.strokeStyle = `${config.primaryColor}44`;
        ctx.strokeRect(element.x, element.y, element.width, element.height);

        // Title
        ctx.font = "12px monospace";
        ctx.fillStyle = `${config.primaryColor}aa`;
        ctx.fillText("MISSION BRIEFING", element.x + 10, element.y - 10);

        // Scrolling text
        ctx.save();
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, element.height);
        ctx.clip();

        const lineHeight = element.height / (element.lines / 2);
        const offset = (time / (1000 / element.scrollSpeed)) % (lineHeight * 2);

        for (let i = -2; i < element.lines / 2; i++) {
          const lineY = element.y + i * lineHeight * 2 + offset;

          // Text line
          ctx.fillStyle = `${config.primaryColor}aa`;
          ctx.font = "10px monospace";
          ctx.fillText(`ITEM #${(i + 1000) % 999}`, element.x + 20, lineY + 15);

          // Data line
          ctx.fillStyle = `${config.secondaryColor}77`;
          const lineWidth = element.width * (0.6 + Math.sin(i * 3.7) * 0.2);
          ctx.fillRect(element.x + 20, lineY + 25, lineWidth - 40, 2);
        }

        ctx.restore();
        break;

      case "timeline":
        // Mission timeline
        ctx.strokeStyle = `${config.primaryColor}44`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(element.x - element.width / 2, element.y);
        ctx.lineTo(element.x + element.width / 2, element.y);
        ctx.stroke();

        // Title
        ctx.font = "12px monospace";
        ctx.fillStyle = `${config.primaryColor}aa`;
        ctx.fillText("MISSION TIMELINE", element.x - element.width / 2, element.y - 20);

        // Timeline points
        for (let i = 0; i < element.points; i++) {
          const pointX = element.x - element.width / 2 + (element.width / (element.points - 1)) * i;

          // Check if this point is "completed" according to progress
          const completed = i / (element.points - 1) <= element.progress;

          // Draw point
          ctx.beginPath();
          ctx.arc(pointX, element.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = completed ? `${config.primaryColor}ee` : `${config.secondaryColor}44`;
          ctx.fill();
          ctx.stroke();

          // Point label
          ctx.font = "10px monospace";
          ctx.fillStyle = `${config.primaryColor}aa`;
          ctx.fillText(`PHASE ${i + 1}`, pointX - 20, element.y + 20);

          // Draw connecting line (if not the last point)
          if (i < element.points - 1) {
            const nextX = element.x - element.width / 2 + (element.width / (element.points - 1)) * (i + 1);

            ctx.beginPath();
            ctx.moveTo(pointX + 5, element.y);
            ctx.lineTo(nextX - 5, element.y);
            ctx.strokeStyle = (i + 1) / (element.points - 1) <= element.progress ?
              `${config.primaryColor}aa` : `${config.secondaryColor}44`;
            ctx.stroke();
          }
        }
        break;

      case "idCard":
        // ID card
        ctx.fillStyle = `${config.secondaryColor}22`;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.strokeStyle = `${config.primaryColor}66`;
        ctx.lineWidth = 1;
        ctx.strokeRect(element.x, element.y, element.width, element.height);

        // Title
        ctx.font = "10px monospace";
        ctx.fillStyle = `${config.primaryColor}aa`;
        ctx.fillText("PERSONNEL ID", element.x + 5, element.y - 5);

        // Photo placeholder
        ctx.fillStyle = `${config.primaryColor}33`;
        ctx.fillRect(element.x + 10, element.y + 10, element.width - 20, element.height / 2 - 15);

        // ID details
        ctx.fillStyle = `${config.primaryColor}55`; // Half-faded details
        ctx.font = "8px monospace";

        const lines = [
          "NAME: SHIVANSHU TIWARI",
          "RANK: LEAD RESEARCHER",
          "ID: TS-9371-D",
          "CLEARANCE: TOP SECRET"
        ];

        lines.forEach((line, index) => {
          ctx.fillText(line, element.x + 10, element.y + element.height / 2 + 15 + index * 15);
        });

        // Pulsing authentication indicator
        const authPulse = (Math.sin(time / 500) + 1) / 2;
        ctx.fillStyle = `${config.primaryColor}${Math.floor(authPulse * 255).toString(16).padStart(2, '0')}`;
        ctx.font = "7px monospace";
        ctx.fillText("AUTHENTICATED", element.x + element.width - 70, element.y + 12);
        break;

      case "strategicPoint":
        // Strategic points on map
        const shouldBlink = Math.floor(time / element.blinkSpeed) % 2 === 0;

        if (shouldBlink) {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.size, 0, Math.PI * 2);
          ctx.fillStyle = `${config.primaryColor}aa`;
          ctx.fill();

          // Outer ring
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.size * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `${config.primaryColor}44`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;
    }
  });

  // Add header and footer classified markings
  ctx.font = "14px monospace";
  ctx.fillStyle = `${config.primaryColor}22`; // Extremely subtle
  ctx.fillText("TOP SECRET // NOFORN", 20, 30);

  ctx.font = "10px monospace";
  ctx.fillStyle = `${config.secondaryColor}22`;
  ctx.fillText("OPERATION: DARK HORIZON", ctx.canvas.width - 200, 30);

  ctx.fillStyle = `${config.primaryColor}15`;
  ctx.font = "12px monospace";
  ctx.fillText("CLASSIFIED BRIEFING MATERIALS", ctx.canvas.width / 2 - 100, ctx.canvas.height - 20);
}

function drawSatelliteCommunicationElements(
  ctx: CanvasRenderingContext2D,
  elements: any[],
  config: any,
  canvas: HTMLCanvasElement
) {
  const time = Date.now();

  elements.forEach(element => {
    switch (element.type) {
      case "earth":
        // Draw Earth globe
        ctx.save();
        ctx.translate(element.x, element.y);

        // Rotate
        element.rotation += element.rotationSpeed;
        ctx.rotate(element.rotation);

        // Earth circle
        ctx.beginPath();
        ctx.arc(0, 0, element.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${config.secondaryColor}22`;
        ctx.fill();
        ctx.strokeStyle = `${config.secondaryColor}44`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Grid lines - latitude
        ctx.strokeStyle = `${config.secondaryColor}22`;
        ctx.lineWidth = 1;

        for (let i = 1; i <= 5; i++) {
          const latRadius = (element.radius / 5) * i;
          ctx.beginPath();
          ctx.arc(0, 0, latRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Grid lines - longitude
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * element.radius, Math.sin(angle) * element.radius);
          ctx.stroke();
        }

        // Continents (simplified representations)
        ctx.fillStyle = `${config.primaryColor}33`;

        // North America
        ctx.beginPath();
        ctx.ellipse(-element.radius * 0.5, -element.radius * 0.3, element.radius * 0.3, element.radius * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // South America
        ctx.beginPath();
        ctx.ellipse(-element.radius * 0.3, element.radius * 0.3, element.radius * 0.15, element.radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Europe/Africa
        ctx.beginPath();
        ctx.ellipse(element.radius * 0.1, 0, element.radius * 0.2, element.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Asia/Australia
        ctx.beginPath();
        ctx.ellipse(element.radius * 0.4, -element.radius * 0.1, element.radius * 0.35, element.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        break;

      case "satellite":
        // Draw orbiting satellite
        element.angle += element.speed;

        const satX = canvas.width / 2 + Math.cos(element.angle) * element.orbitRadius;
        const satY = canvas.height / 2 + Math.sin(element.angle) * element.orbitRadius * 0.6; // Elliptical orbit

        // Draw orbit path
        ctx.beginPath();
        ctx.ellipse(
          canvas.width / 2,
          canvas.height / 2,
          element.orbitRadius,
          element.orbitRadius * 0.6,
          0, 0, Math.PI * 2
        );
        ctx.strokeStyle = `${config.secondaryColor}22`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw satellite
        ctx.beginPath();
        ctx.arc(satX, satY, element.size, 0, Math.PI * 2);
        ctx.fillStyle = `${config.primaryColor}aa`;
        ctx.fill();

        // Satellite solar panels
        ctx.beginPath();
        ctx.moveTo(satX - element.size * 2, satY - element.size);
        ctx.lineTo(satX - element.size * 2, satY + element.size);
        ctx.moveTo(satX + element.size * 2, satY - element.size);
        ctx.lineTo(satX + element.size * 2, satY + element.size);
        ctx.strokeStyle = `${config.secondaryColor}aa`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Signal waves from satellite to earth center
        const earthX = canvas.width / 2;
        const earthY = canvas.height / 2;

        // Calculate angle from satellite to earth center
        const dx = earthX - satX;
        const dy = earthY - satY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Draw signal wave animation
        const waveCount = 3;
        for (let i = 0; i < waveCount; i++) {
          // Wave progress (0 to 1)
          const progress = (time / 1000 + i / waveCount) % 1;

          if (progress > 0.1) { // Start waves after satellite has moved a bit
            // Wave starting point
            const startX = satX + Math.cos(angle) * element.size * 2;
            const startY = satY + Math.sin(angle) * element.size * 2;

            // Wave end point based on progress
            const endX = satX + Math.cos(angle) * distance * progress;
            const endY = satY + Math.sin(angle) * distance * progress;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `${config.primaryColor}${Math.floor((1 - progress) * 200).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        break;

      case "signalPoint":
        // Draw signal points on the globe
        const shouldBlink = Math.floor(time / element.blinkSpeed) % 2 === 0;

        if (element.active && shouldBlink) {
          // Main signal point
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.size, 0, Math.PI * 2);
          ctx.fillStyle = `${config.primaryColor}cc`;
          ctx.fill();

          // Outer ring
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.size * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `${config.primaryColor}44`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Connect to nearest active signal point
          elements.forEach(otherElement => {
            if (otherElement.type === "signalPoint" && otherElement !== element && otherElement.active) {
              const dx = otherElement.x - element.x;
              const dy = otherElement.y - element.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              // Only connect if relatively close
              if (distance < canvas.width * 0.3) {
                ctx.beginPath();
                ctx.moveTo(element.x, element.y);
                ctx.lineTo(otherElement.x, otherElement.y);
                ctx.strokeStyle = `${config.secondaryColor}33`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          });
        }
        break;
    }
  });

  // Add communication status overlay
  ctx.font = "12px monospace";
  ctx.fillStyle = `${config.primaryColor}aa`;
  ctx.fillText("GLOBAL DEFENSE NETWORK: ONLINE", 20, 25);
  ctx.fillText(`SATELLITES ACTIVE: ${Math.floor(Math.random() * 3) + 10}`, 20, 45);

  const statusMessages = [
    "RECEIVING DATA...",
    "SIGNAL STRENGTH: 92%",
    "ENCRYPTION: ACTIVE"
  ];

  // Status message that changes every few seconds
  const messageIndex = Math.floor(time / 3000) % statusMessages.length;
  ctx.fillText(statusMessages[messageIndex], canvas.width - 200, 25);

  // Typewriter effect at bottom
  const message = "SATELLITE UPLINK ESTABLISHED - AWAITING MESSAGE TRANSMISSION...";
  const typewriterProgress = (time / 120) % (message.length + 30); // Extra time at the end

  if (typewriterProgress < message.length) {
    ctx.font = "12px monospace";
    ctx.fillStyle = `${config.secondaryColor}cc`;
    ctx.fillText(message.substring(0, typewriterProgress), 20, canvas.height - 20);

    // Blinking cursor
    if (Math.floor(time / 500) % 2 === 0) {
      ctx.fillText("_", 20 + ctx.measureText(message.substring(0, typewriterProgress)).width, canvas.height - 20);
    }
  } else {
    ctx.font = "12px monospace";
    ctx.fillStyle = `${config.secondaryColor}cc`;
    ctx.fillText(message, 20, canvas.height - 20);
  }
}

// Type interfaces
interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedX: number;
  speedY: number;
  color: string;
}

interface GridLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  opacity: number;
}

interface RadarWave {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
}

interface DataStream {
  segments: {
    x: number;
    y: number;
    opacity: number;
    width: number;
  }[];
  speed: number;
}

interface Node {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  connections: {
    toNode: number;
    opacity: number;
  }[];
}

