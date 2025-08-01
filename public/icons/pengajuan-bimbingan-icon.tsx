import * as React from "react";
import { LucideProps } from "lucide-react";

const PengajuanBimbinganIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? "120"}
      height={props.height ?? "120"}
      viewBox="0 0 32 32"
    >
      <rect width="32" height="32" fill="none" />
      <path
        fill="#fff"
        d="M27 10h-6a3.003 3.003 0 0 0-3 3v6a2 2 0 0 0 2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0 2-2v-6a3.003 3.003 0 0 0-3-3m1 9h-2v9h-4v-9h-2v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1zM20 5a4 4 0 1 1 4 4a4.004 4.004 0 0 1-4-4m2 0a2 2 0 1 0 2-2a2 2 0 0 0-2 2m-8 11v-3a3.003 3.003 0 0 0-3-3H5a3.003 3.003 0 0 0-3 3v3H0v2h16v-2zM4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3H4zm0-8a4 4 0 1 1 4 4a4.004 4.004 0 0 1-4-4m2 0a2 2 0 1 0 2-2a2 2 0 0 0-2 2"
      />
    </svg>
  )
);
PengajuanBimbinganIcon.displayName = "PengajuanBimbinganIcon";

export { PengajuanBimbinganIcon };
