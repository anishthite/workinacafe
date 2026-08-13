import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared config + renderer for the app's Open Graph / Twitter / iMessage preview.
// Kept in one place so `opengraph-image` and `twitter-image` stay in sync.

export const ogSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";
export const ogAlt =
  "workina.cafe — a hand-drawn community map for finding cafés that are actually good to work from, with signals for Wi-Fi, outlets, quiet, and outdoor seats.";

const paper = "#fffdfa";
const ink = "#183153";
const inkSoft = "#5d6c82";
const green = "#0f8a5f";
const greenSoft = "#dff7e8";
const blueSoft = "#deedff";
const amber = "#c56b08";
const amberSoft = "#fff0c7";
const pink = "#c94c78";
const pinkSoft = "#ffe1eb";

type IconProps = { size?: number; color?: string };

function IconBase({
  size = 24,
  color = ink,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const WifiIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M12 20h.01" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M5 12.859a10 10 0 0 1 14 0" />
    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
  </IconBase>
);

const ZapIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </IconBase>
);

const VolumeIcon = (p: IconProps) => (
  <IconBase {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </IconBase>
);

const LeafIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6" />
  </IconBase>
);

const PinIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </IconBase>
);

const CoffeeIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" x2="6" y1="2" y2="4" />
    <line x1="10" x2="10" y1="2" y2="4" />
    <line x1="14" x2="14" y1="2" y2="4" />
  </IconBase>
);

const chips = [
  { label: "Fast Wi-Fi", bg: greenSoft, Icon: WifiIcon },
  { label: "Real outlets", bg: amberSoft, Icon: ZapIcon },
  { label: "Quiet corners", bg: blueSoft, Icon: VolumeIcon },
  { label: "Outdoor seats", bg: pinkSoft, Icon: LeafIcon },
];

const pins = [
  { n: "1", bg: greenSoft, border: green, color: "#086643", top: 66, left: 44, rotate: -6 },
  { n: "2", bg: amberSoft, border: amber, color: "#8d4c07", top: 168, left: 176, rotate: 5 },
  { n: "3", bg: pinkSoft, border: pink, color: "#963858", top: 292, left: 70, rotate: -3 },
];

export async function renderOgImage() {
  const virgil = await readFile(join(process.cwd(), "assets/Virgil.otf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Virgil",
          color: ink,
          backgroundColor: paper,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(24,49,83,0.07) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      >
        {/* sketchbook frame */}
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 26,
            right: 26,
            bottom: 26,
            border: `3px solid ${ink}`,
            borderRadius: "22px 30px 18px 26px / 26px 18px 30px 20px",
          }}
        />

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            padding: "72px 76px",
            gap: 44,
          }}
        >
          {/* left: message */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: green,
                fontSize: 24,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              <PinIcon size={22} color={green} />
              <span>Community café work map</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 94,
                  height: 86,
                  border: `3px solid ${ink}`,
                  borderRadius: "48% 52% 44% 56% / 54% 45% 55% 46%",
                  backgroundColor: greenSoft,
                  transform: "rotate(-3deg)",
                }}
              >
                <CoffeeIcon size={46} color={green} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 82, lineHeight: 1 }}>
                  <span style={{ color: ink }}>work</span>
                  <span style={{ color: green }}>ina.cafe</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", fontSize: 48, lineHeight: 1.15, marginTop: 22, maxWidth: 660 }}>
              Cafés that are actually good to work from.
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 30,
                maxWidth: 660,
              }}
            >
              {chips.map(({ label, bg, Icon }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "10px 18px",
                    border: `2px solid ${ink}`,
                    borderRadius: "12px 16px 10px 14px / 15px 10px 16px 11px",
                    backgroundColor: bg,
                    fontSize: 26,
                    color: ink,
                  }}
                >
                  <Icon size={22} color={ink} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* right: little map */}
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 340,
              height: 420,
              border: `3px solid ${ink}`,
              borderRadius: "24px 18px 26px 16px / 18px 26px 16px 24px",
              backgroundColor: blueSoft,
              transform: "rotate(2deg)",
              overflow: "hidden",
            }}
          >
            {/* roads */}
            <div
              style={{
                position: "absolute",
                top: 120,
                left: -30,
                width: 420,
                height: 10,
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(24,49,83,0.18)",
                transform: "rotate(-16deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 250,
                left: -30,
                width: 420,
                height: 10,
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(24,49,83,0.18)",
                transform: "rotate(11deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -30,
                left: 150,
                width: 10,
                height: 500,
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(24,49,83,0.18)",
                transform: "rotate(9deg)",
              }}
            />

            {pins.map(({ n, bg, border, color, top, left, rotate }) => (
              <div
                key={n}
                style={{
                  position: "absolute",
                  top,
                  left,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 66,
                  height: 66,
                  border: `3px solid ${border}`,
                  borderRadius: "48% 52% 45% 55% / 53% 46% 54% 47%",
                  backgroundColor: bg,
                  color,
                  fontSize: 30,
                  boxShadow: "3px 5px 0 rgba(24,49,83,0.18)",
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                {n}
              </div>
            ))}

            <div
              style={{
                position: "absolute",
                left: 16,
                bottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 12px",
                border: `2px solid ${ink}`,
                borderRadius: "10px 14px 8px 12px / 12px 8px 14px 9px",
                backgroundColor: "rgba(255,253,250,0.92)",
                color: inkSoft,
                fontSize: 20,
              }}
            >
              <PinIcon size={18} color={green} />
              <span>128 spots nearby</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Virgil", data: virgil as unknown as Buffer, style: "normal", weight: 400 },
      ],
    },
  );
}
