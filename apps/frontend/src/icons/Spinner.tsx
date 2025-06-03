import { SVGProps } from "react";

export const Spinner = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M22.5 12C22.5 10.6211 22.2284 9.25574 21.7007 7.98182C21.1731 6.70791 20.3996 5.55039 19.4246 4.57538C18.4496 3.60036 17.2921 2.82694 16.0182 2.29926C14.7443 1.77159 13.3789 1.5 12 1.5"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="square"
      />
    </svg>
  );
};
