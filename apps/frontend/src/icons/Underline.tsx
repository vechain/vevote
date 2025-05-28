import { SVGProps } from "react";

export const Underline = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 3C6.55228 3 7 3.44772 7 4V10C7 11.3261 7.52678 12.5979 8.46447 13.5355C9.40215 14.4732 10.6739 15 12 15C13.3261 15 14.5979 14.4732 15.5355 13.5355C16.4732 12.5979 17 11.3261 17 10V4C17 3.44772 17.4477 3 18 3C18.5523 3 19 3.44772 19 4V10C19 11.8565 18.2625 13.637 16.9497 14.9497C15.637 16.2625 13.8565 17 12 17C10.1435 17 8.36301 16.2625 7.05025 14.9497C5.7375 13.637 5 11.8565 5 10V4C5 3.44772 5.44772 3 6 3Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 20C3 19.4477 3.44772 19 4 19H20C20.5523 19 21 19.4477 21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20Z"
        fill="currentColor"
      />
    </svg>
  );
};
