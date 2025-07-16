import { SVGProps } from "react";

export const Node = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12ZM16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z"
        fill="currentColor"
      />
      <path
        d="M9 11C9.55228 11 10 11.4477 10 12C10 12.5523 9.55228 13 9 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H9Z"
        fill="currentColor"
      />
      <path
        d="M21 11C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H15C14.4477 13 14 12.5523 14 12C14 11.4477 14.4477 11 15 11H21Z"
        fill="currentColor"
      />
    </svg>
  );
};
