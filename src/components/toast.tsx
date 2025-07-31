import { CircleAlert, CircleCheckBig, CircleX, Info } from "lucide-react";
import React from "react";

type ToastProps = {
  variant: "success" | "warning" | "info" | "destructive";
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export function CustomToast(props: ToastProps) {
  let Icon: React.ReactNode;
  let baseClass = "border flex gap-2 items-center rounded-lg px-3 py-2";
  let variantClass;

  switch (props.variant) {
    case "success":
      Icon = <CircleCheckBig width={50} height={50} />;
      variantClass = "border-green-600 bg-green-50 text-green-500";
      break;
    case "warning":
      Icon = <CircleAlert width={50} height={50} />;
      variantClass = "border-yellow-600 bg-yellow-50 text-yellow-500";
      break;
    case "info":
      Icon = <Info width={50} height={50} />;
      variantClass = "border-blue-600 bg-blue-50 text-blue-500";
      break;
    case "destructive":
      Icon = <CircleX width={50} height={50} />;
      variantClass = "border-red-600 bg-red-50 text-red-500";
      break;
  }

  if (props.icon) {
    Icon = props.icon;
  }

  return (
    <div className={`${baseClass} ${variantClass}`}>
      {Icon}
      <div>
        <h1 className="text-sm font-semibold">{props.title}</h1>
        <h1 className="text-sm">{props.description}</h1>
      </div>
    </div>
  );
}
