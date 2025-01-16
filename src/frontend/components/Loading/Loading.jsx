export const Loading = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        style={{ width: '50px', height: '50px' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="purple"
          strokeWidth="4"
          strokeDasharray="80"
          strokeDashoffset="0"
          strokeLinecap="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="502"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );

  