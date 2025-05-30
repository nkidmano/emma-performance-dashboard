interface PinProps {}

export function Pin(props: PinProps) {
  return (
    <svg
      className="w-6 h-6"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <mask
        id="path-1-outside-1"
        maskUnits="userSpaceOnUse"
        x="3"
        y="0"
        width="10"
        height="16"
        fill="black"
      >
        <rect fill="white" x="3" width="10" height="16" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.5 7.95852C9.91886 7.72048 11 6.4865 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.4865 6.08114 7.72048 7.5 7.95852V14H8.5V7.95852Z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 7.95852C9.91886 7.72048 11 6.4865 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.4865 6.08114 7.72048 7.5 7.95852V14H8.5V7.95852Z"
        fill="#5F6368"
      />
      <path
        d="M8.5 7.95852L8.16909 5.98609L6.5 6.26611V7.95852H8.5ZM7.5 7.95852H9.5V6.26611L7.83091 5.98609L7.5 7.95852ZM7.5 14H5.5V16H7.5V14ZM8.5 14V16H10.5V14H8.5ZM9 5C9 5.49351 8.64052 5.90699 8.16909 5.98609L8.83091 9.93096C11.1972 9.53397 13 7.47948 13 5H9ZM8 4C8.55228 4 9 4.44772 9 5H13C13 2.23858 10.7614 0 8 0V4ZM7 5C7 4.44772 7.44772 4 8 4V0C5.23858 0 3 2.23858 3 5H7ZM7.83091 5.98609C7.35948 5.90699 7 5.49351 7 5H3C3 7.47948 4.80281 9.53397 7.16909 9.93096L7.83091 5.98609ZM9.5 14V7.95852H5.5V14H9.5ZM8.5 12H7.5V16H8.5V12ZM6.5 7.95852V14H10.5V7.95852H6.5Z"
        fill="white"
        mask="url(#path-1-outside-1)"
      />
      <circle cx="8" cy="5" r="2" fill="white" />
    </svg>
  );
}
