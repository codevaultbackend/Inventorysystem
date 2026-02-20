export default function LoginDecordown({ className = "" }) {
  return (
    <svg
      className={className}
      width="1440"
      height="260"
      viewBox="0 0 1440 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="login-decor-bottom"
          patternUnits="userSpaceOnUse"
          width="1440"
          height="260"
        >
          <image
            href="/LoginDecordown.svg"
            x="0"
            y="0"
            width="1440"
            height="260"
          />
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width="1440"
        height="260"
        fill="url(#login-decor-bottom)"
      />
    </svg>
  );
}
