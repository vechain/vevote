import { SVGProps } from "react";

export const Cancel = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM6.38238 4.96805C7.92204 3.73645 9.87502 3 12 3C16.9706 3 21 7.02944 21 12C21 14.125 20.2635 16.078 19.032 17.6176L6.38238 4.96805ZM4.96815 6.38225C3.73649 7.92193 3 9.87496 3 12C3 16.9706 7.02944 21 12 21C14.125 21 16.0781 20.2635 17.6178 19.0318L4.96815 6.38225Z"
        fill="currentColor"
      />
    </svg>
  );
};
