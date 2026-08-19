const STARS = [
  { left: "9%", top: "16%", size: 11, delay: "0s" },
  { left: "22%", top: "64%", size: 9, delay: "1.1s" },
  { left: "84%", top: "12%", size: 12, delay: "0.6s" },
  { left: "92%", top: "58%", size: 9, delay: "2s" },
  { left: "70%", top: "82%", size: 10, delay: "1.6s" },
  { left: "6%", top: "84%", size: 10, delay: "0.3s" },
  { left: "48%", top: "8%", size: 8, delay: "2.4s" },
];

export function Atmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="amb-flush amb-a" />
      <div className="amb-flush amb-b" />
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="rgb(32 38 63 / 0.14)" strokeWidth="1" fill="none">
          <polyline points="120,140 190,90 268,120 330,70" />
          <polyline points="190,90 210,180 330,70" />
          <polyline points="1120,120 1180,180 1250,150 1320,210 1390,170" />
          <polyline points="980,700 1060,650 1140,690" />
        </g>
        <g fill="rgb(32 38 63 / 0.38)">
          <circle cx="120" cy="140" r="2" />
          <circle cx="190" cy="90" r="2.6" />
          <circle cx="268" cy="120" r="1.8" />
          <circle cx="330" cy="70" r="2.2" />
          <circle cx="210" cy="180" r="1.6" />
          <circle cx="1120" cy="120" r="2" />
          <circle cx="1180" cy="180" r="2.4" />
          <circle cx="1250" cy="150" r="1.7" />
          <circle cx="1320" cy="210" r="2.2" />
          <circle cx="1390" cy="170" r="1.6" />
          <circle cx="980" cy="700" r="2" />
          <circle cx="1060" cy="650" r="2.4" />
          <circle cx="1140" cy="690" r="1.7" />
        </g>
        <circle cx="268" cy="120" r="3" fill="rgb(184 137 61 / 0.55)" />
        <circle cx="1320" cy="210" r="3" fill="rgb(42 61 58 / 0.45)" />
      </svg>
      {STARS.map((star) => (
        <svg
          key={`${star.left}-${star.top}`}
          className="twinkle absolute"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
          viewBox="0 0 12 12"
        >
          <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" fill="currentColor" />
        </svg>
      ))}
      <div className="orbit-ring">
        <span className="orbit-sat" />
      </div>
      <div className="comet" />
      <div className="grain" />
    </div>
  );
}
