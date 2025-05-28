import { SVGProps } from "react";

export const Drag = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3 9C3 7.89543 3.89543 7 5 7C6.10457 7 7 7.89543 7 9C7 10.1046 6.10457 11 5 11C3.89543 11 3 10.1046 3 9Z"
        fill="currentColor"
      />
      <path
        d="M12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7Z"
        fill="currentColor"
      />
      <path
        d="M19 7C17.8954 7 17 7.89543 17 9C17 10.1046 17.8954 11 19 11C20.1046 11 21 10.1046 21 9C21 7.89543 20.1046 7 19 7Z"
        fill="currentColor"
      />
      <path
        d="M12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13Z"
        fill="currentColor"
      />
      <path
        d="M17 15C17 13.8954 17.8954 13 19 13C20.1046 13 21 13.8954 21 15C21 16.1046 20.1046 17 19 17C17.8954 17 17 16.1046 17 15Z"
        fill="currentColor"
      />
      <path
        d="M5 13C3.89543 13 3 13.8954 3 15C3 16.1046 3.89543 17 5 17C6.10457 17 7 16.1046 7 15C7 13.8954 6.10457 13 5 13Z"
        fill="currentColor"
      />
    </svg>
  );
};
