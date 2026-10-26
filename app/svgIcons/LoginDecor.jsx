export default function LoginDecor({ className = "" }) {
  return (
    <svg
      className={className}
      width="1440"
      height="217"
      viewBox="0 0 1440 217"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="login-decor-top"
          patternUnits="userSpaceOnUse"
          width="1440"
          height="217"
        >
          <image
            href="/LoginDecorUp.svg"
            x="0"
            y="0"
            width="1440"
            height="217"
          />
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width="1440"
        height="217"
        fill="url(#login-decor-top)"
      />
    </svg>
  );
}
